const walletTransactionSchema = new mongoose.Schema({
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Wallet",
        required: true,
        index: true
    },

    type: {
        type: String,
        enum: [
            "credit",
            "debit",
            "lock",
            "unlock",
            "commission",
            "refund"
        ],
        required: true
    },

    amount: {
        type: Number,
        required: true,
        min: 1
    },

    category: {
        type: String,
        enum: [
            "order_payment",
            "seller_payout",
            "delivery_earning",
            "refund",
            "commission",
            "wallet_topup",
            "penalty"
        ]
    },
    description: String,
    referenceId: {
        type: mongoose.Schema.Types.ObjectId
    },

    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "completed"
    },

    balanceAfterTransaction: {
        type: Number
    }

}, { timestamps: true });

walletTransactionSchema.index({ walletId: 1, createdAt: -1 });

export default mongoose.model("WalletTransaction", walletTransactionSchema);
