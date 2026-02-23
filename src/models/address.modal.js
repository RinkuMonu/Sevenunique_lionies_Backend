import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    label: {
        type: String,
        enum: ["home", "office", "other"],
        default: "home"
    },

    fullName: {
        type: String,
        required: true
    },

    mobile: {
        type: String,
        required: true,
        match: /^[6-9]\d{9}$/
    },
    alternateMobile: {
        type: String,
        // required: true,
        match: /^[6-9]\d{9}$/
    },

    street: { type: String, required: true },
    landmark: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },

    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },

    isDefault: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

addressSchema.index({ location: "2dsphere" });

export default mongoose.model("Address", addressSchema);
