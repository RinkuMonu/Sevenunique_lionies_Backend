import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true
        },

        discountValue: {
            type: Number,
            required: true
        },

        minimumOrderValue: {
            type: Number,
            default: 0
        },

        startDate: {
            type: Date,
            required: true
        },

        expiryDate: {
            type: Date,
            required: true
        },

        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ],

        applicableUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        usageLimit: {
            type: Number,
            default: 0 // 0 = unlimited
        },

        perUserLimit: {
            type: Number,
            default: 1
        },

        totalUsed: {
            type: Number,
            default: 0
        },

        userUsage: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                usedCount: {
                    type: Number,
                    default: 0
                }
            }
        ],

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);