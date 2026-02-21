import riderModal from "../../models/roleWiseModal/rider.modal.js";
import userModal from "../../models/roleWiseModal/user.modal.js";
import walletSystemModal from "../../models/walletSystem.modal.js";
import { sendSellerEmail } from "../../service/mailsend.js";


const buildNestedObject = (data = {}, parent) => {
    const result = {};
    Object.keys(data).forEach(key => {
        if (key.startsWith(parent + ".")) {
            const field = key.replace(parent + ".", "");
            result[field] = data[key];
        }
    });
    return result;
};


export const getAllRiders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            city,
            vehicleType,
            kycStatus,
            status,
            availabilityStatus,
            isApproved,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        const skip = (page - 1) * limit;

        let userFilter = {};

        if (search) {
            const users = await userModal.find({
                $or: [
                    { name: new RegExp(search, "i") },
                    { email: new RegExp(search, "i") },
                    { mobile: new RegExp(search, "i") }
                ]
            }).select("_id").lean();

            userFilter.userId = { $in: users.map(u => u._id) };
        }

        /* 🔎 RIDER FILTER */
        const filter = {
            ...userFilter
        };

        if (city) filter.city = city;
        if (vehicleType) filter.vehicleType = vehicleType;
        if (kycStatus) filter.kycStatus = kycStatus;
        if (status) filter.status = status;
        if (availabilityStatus) filter.availabilityStatus = availabilityStatus;
        if (isApproved !== undefined) filter.isApproved = isApproved;

        /* 🔎 GLOBAL SEARCH IN RIDER FIELDS */
        if (search) {
            filter.$or = [
                { riderCode: new RegExp(search, "i") }
            ];
        }

        const riders = await riderModal
            .find(filter)
            .populate("userId", "name email mobile")
            .sort({ [sortBy]: order === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(Number(limit)).lean();

        const total = await riderModal.countDocuments(filter).lean();

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            riders
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


export const getRiderById = async (req, res) => {
    try {
        const { riderId } = req.params;

        const rider = await riderModal
            .findById(riderId)
            .populate("userId", "name email mobile isActive isBlocked").lean();

        if (!rider) {
            return res.status(404).json({
                success: false,
                message: "Rider not found"
            });
        }

        res.status(200).json({
            success: true,
            rider
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


export const submitRiderKyc = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModal
            .findOne({ _id: userId, role: "customer" })
            .select("name email mobile role").lean();

        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        if (user.role === "delivery_partner")
            return res.status(403).json({ success: false, message: "You are already in a delivery partner role" });

        const existingRider = await riderModal.findOne({ userId }).select("kycStatus").lean();

        if (existingRider?.kycStatus === "verified")
            return res.status(400).json({ message: "KYC already verified" });

        if (existingRider?.kycStatus === "pending")
            return res.status(400).json({ message: "KYC already submitted" });


        if (
            !req.files?.rcDocument?.[0] ||
            !req.files?.licenseDocument?.[0] ||
            !req.files?.aadharDocument?.[0]
        ) {
            return res.status(400).json({ message: "All documents required" });
        }


        const parsedBank =
            typeof req.body.bankDetails === "string"
                ? JSON.parse(req.body.bankDetails || "{}")
                : buildNestedObject(req.body, "bankDetails");

        let geoLocation;

        if (req.body.geoLocation) {
            const parsedGeo = JSON.parse(req.body.geoLocation);
            geoLocation = {
                type: "Point",
                coordinates: [Number(parsedGeo.lng), Number(parsedGeo.lat)]
            };
        } else {
            const geoCoords = req.body["geoLocation.coordinates"];
            if (!geoCoords || geoCoords.length !== 2)
                return res.status(400).json({ message: "Invalid geo location" });

            geoLocation = {
                type: "Point",
                coordinates: geoCoords.map(Number)
            };
        }

        /* ---------------- REQUIRED FIELDS ---------------- */

        const { city, vehicleType, vehicleNumber, drivingLicenseNumber } = req.body;

        if (!city || !vehicleType || !vehicleNumber || !drivingLicenseNumber)
            return res.status(400).json({ message: "Required fields missing" });

        /* ---------------- CREATE RIDER ---------------- */

        const rider = await riderModal.create({
            userId,
            city,
            vehicleType,
            vehicleNumber,
            drivingLicenseNumber,
            bankDetails: parsedBank,
            currentLocation: geoLocation,
            rcDocument: req.files.rcDocument[0].path,
            licenseDocument: req.files.licenseDocument[0].path,
            aadharDocument: req.files.aadharDocument[0].path,
            profileSnapshot: {
                name: user.name,
                mobile: user.mobile
            },
            kycStatus: "pending"
        });

        res.json({
            success: true,
            message: "KYC submitted successfully",
            rider
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



export const riderKycAction = async (req, res) => {
    try {
        const { riderId } = req.params;
        const { action, rejectionReason } = req.body;

        if (!["verified", "rejected"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action"
            });
        }

        if (action === "rejected" && !rejectionReason?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason required"
            });
        }

        const rider = await riderModal.findOneAndUpdate(
            {
                _id: riderId,
                kycStatus: "pending"
            },
            {
                $set: {
                    kycStatus: action,
                    isApproved: action === "verified",
                    status: action === "verified" ? "active" : "suspended",
                    rejectionReason: action === "rejected" ? rejectionReason : null,
                    kycVerifiedAt: action === "verified" ? new Date() : null,
                    kycRejectedAt: action === "rejected" ? new Date() : null
                }
            },
            { new: true }
        ).select("userId _id kycStatus isApproved status rejectionReason kycVerifiedAt kycRejectedAt").populate("userId", "_id name email").lean();

        if (!rider) {
            return res.status(400).json({
                success: false,
                message: "KYC already processed or rider not found"
            });
        }

        // ✅ Role update only on approval
        if (action === "verified") {
            await userModal.findByIdAndUpdate(
                rider.userId._id,
                { role: "delivery_partner" }
            );
            await walletSystemModal.updateOne(
                { ownerId: rider.userId._id, ownerType: "rider" },
                { $setOnInsert: { ownerId: rider.userId._id, ownerType: "rider" } },
                { upsert: true }
            );

        }
        // 📧 Send mail
        await sendSellerEmail({
            userName: rider.userId.name,
            userEmail: rider.userId.email,
            templateId:
                action === "verified"
                    ? "rider_kyc_approved"
                    : "rider_kyc_rejected",
            reason: rejectionReason
        });


        return res.status(200).json({
            success: true,
            message: `Rider KYC ${action} successfully`,
            rider
        });

    } catch (err) {
        console.error("RIDER KYC ACTION ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

