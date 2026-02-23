import mongoose from "mongoose";

const riderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        riderCode: {
            type: String,
            unique: true // (ex: LIO-RID-1001) help for find
        },

        currentLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            } // 🔥 Live location updated every few seconds
        },

        city: {
            type: String,
            required: true
        },

        deliveryRadiusInKm: {
            type: Number,
            default: 5
        },

        availabilityStatus: {
            type: String,
            enum: ["offline", "online", "on_delivery", "break"],
            default: "offline"
        },

        vehicleType: {
            type: String,
            enum: ["bike", "scooter", "cycle", "EV"],
            required: true
        },

        vehicleNumber: {
            type: String,
            required: true,
            match: /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/,
            message: "Vehicle number must be in the format RJ45DF1234"
        },

        drivingLicenseNumber: {
            type: String,
            required: true,
            match: /^[A-Z]{2}\d{2}\s\d{11}$/,
            message: "Driving license number must be in the format RJ45 20250012345"
        },

        rcDocument: { type: String, required: true },
        licenseDocument: { type: String, required: true },
        aadharDocument: { type: String, required: true },

        kycStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending"
        },
        bankDetails: {
            accountHolderName: String,
            accountNumber: String,
            IFSC: String,
            bankName: String,
            UPI: String
        },

        isApproved: {
            type: Boolean,
            default: false
        },

        totalDeliveries: {
            type: Number,
            default: 0
        },

        completedDeliveries: {
            type: Number,
            default: 0
        },

        cancelledDeliveries: {
            type: Number,
            default: 0
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        totalEarnings: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["active", "suspended", "blocked", "inprogress"],
            default: "inprogress"
        },
        kycVerifiedAt: Date,
        kycRejectedAt: Date,
        rejectionReason: {
            type: String
        }


    },
    { timestamps: true }
);


riderSchema.index({ currentLocation: "2dsphere" });
riderSchema.index({ city: 1, availabilityStatus: 1, kycStatus: 1, isApproved: 1, status: 1, vehicleType: 1, drivingLicenseNumber: 1, vehicleNumber: 1 }); // for quick find of available riders in a city

export default mongoose.model("Rider", riderSchema);
