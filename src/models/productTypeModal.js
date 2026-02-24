import mongoose from "mongoose";
import slugify from "slugify";

const wearTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Wear type name is required"],
            unique: true,
            trim: true
        },

        slug: {
            type: String,
            unique: true
        },

        icon: String,

        displayOrder: {
            type: Number,
            default: 0
        },

        showInMenu: {
            type: Boolean,
            default: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

wearTypeSchema.pre("validate", function (next) {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

const ProductWearType = mongoose.model("ProductWearType", wearTypeSchema);
export default ProductWearType;