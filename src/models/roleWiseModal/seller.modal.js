import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        shopName: {
            type: String,
            required: true,
            trim: true
        },

        shopSlug: {
            type: String,
            unique: true
        },

        businessType: {
            type: String,
            enum: ["individual", "proprietorship", "partnership", "pvt_ltd"],
            required: true
        },

        GSTIN: {
            type: String,
            trim: true
        },

        PAN: {
            type: String,
            trim: true
        },

        shopAddress: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: { type: String, default: "India" }
        },

        geoLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number]
            }
        },

        deliveryRadiusInKm: {
            type: Number,
            default: 5
        },

        bankDetails: {
            accountHolderName: String,
            accountNumber: String,
            IFSC: String,
            bankName: String,
            UPI: String
        },

        commissionRate: {
            type: Number,
            default: 10
            // 🔥 Platform commission percentage (super admin sets this)
        },

        settlementCycleDays: {
            type: Number,
            default: 7
            //Payment release cycle (7 days after delivery)
        },

        kycDocuments: {
            gstCertificate: String,
            panCard: String,
            shopLicense: String,
            cancelledCheque: String
        },

        kycStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending"
        },

        isApproved: {
            type: Boolean,
            default: false
        },

        totalProducts: {
            type: Number,
            default: 0
        },

        totalOrders: {
            type: Number,
            default: 0
        },

        totalRevenue: {
            type: Number,
            default: 0
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        cancellationRate: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["active", "suspended", "blocked"],
            default: "active"
        },

        isOnline: {
            type: Boolean,
            default: false
        }

    },
    { timestamps: true }
);

sellerSchema.index({ geoLocation: "2dsphere" });

export default mongoose.model("Seller", sellerSchema);
