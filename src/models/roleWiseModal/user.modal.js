import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        mobile: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true,
            select: false
        },

        avatar: String,

        role: {
            type: String,
            enum: ["superadmin", "customer", "seller", "delivery_partner"],
            default: "customer",
            index: true
        },

        isVerified: {
            type: Boolean,
            default: false // email / mobile verified
        },

        isActive: {
            type: Boolean,
            default: true
        },

        isBlocked: {
            type: Boolean,
            default: false
        },

        defaultAddress: {
            fullAddress: String,
            city: String,
            state: String,
            pincode: String,
            location: {
                type: {
                    type: String,
                    enum: ["Point"]
                },
                coordinates: [Number] // [lng, lat]
            }
        },
        sessionId: String,
        lastLogin: Date,
    },
    { timestamps: true }
);

/* =========================
   GEO INDEX
========================= */

userSchema.index({ "defaultAddress.location": "2dsphere" });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
