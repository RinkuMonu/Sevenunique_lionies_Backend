import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

    ownerType: {
        type: String,
        enum: ["customer", "seller", "delivery_partner", "platform"],
        required: true,
        index: true,
        unique: true
    },

    availableBalance: {
        type: Number,
        default: 0,
        min: 0
    },

    lockedBalance: {
        type: Number,
        default: 0,
        min: 0 // orders not delivered yet
    },

    totalCredited: {
        type: Number,
        default: 0
    },

    totalDebited: {
        type: Number,
        default: 0
    },

    currency: {
        type: String,
        default: "INR"
    },

    status: {
        type: String,
        enum: ["active", "suspended", "frozen"],
        default: "active"
    }

}, { timestamps: true });

walletSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });

export default mongoose.model("Wallet", walletSchema);
