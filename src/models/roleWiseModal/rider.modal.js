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
            unique: true
            // 🔥 Internal unique rider ID (ex: LIO-RID-1001) help for find
        },

        fullName: {
            type: String,
            required: true
        },

        mobile: {
            type: String,
            required: true
        },

        email: String,

        profileImage: String,

        currentLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
            // 🔥 Live location updated every few seconds
        },

        city: {
            type: String,
            required: true
        },

        deliveryRadiusInKm: {
            type: Number,
            default: 5
        },

        isOnline: {
            type: Boolean,
            default: false
        },

        isBusy: {
            type: Boolean,
            default: false
        },

        vehicleType: {
            type: String,
            enum: ["bike", "scooter", "cycle", "EV"],
            required: true
        },

        vehicleNumber: {
            type: String,
            required: true
        },

        drivingLicenseNumber: {
            type: String,
            required: true
        },

        rcDocument: { type: String, required: true },
        licenseDocument: { type: String, required: true },
        aadharDocument: { type: String, required: true },

        kycStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending"
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

        walletBalance: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["active", "suspended", "blocked"],
            default: "active"
        }

    },
    { timestamps: true }
);


riderSchema.index({ currentLocation: "2dsphere" });
riderSchema.index({ city: 1, isOnline: 1, isBusy: 1 });

export default mongoose.model("Rider", riderSchema);
