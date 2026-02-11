import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    mobile: { type: Number, require: true, index: true },
    otp: { type: Number, require: true },
    expiresAt: Date
}, { timestamps: true });

export default mongoose.model("otp", otpSchema);

