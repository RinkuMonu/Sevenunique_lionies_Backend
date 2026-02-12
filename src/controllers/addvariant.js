import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";

/* =========================
   ADD VARIANT (ADMIN)
   POST /api/admin/products/:productId/variants
========================= */

const generateSKU = (product, color, size) => {
    const brandCode = "LIO";
    const categoryCode = product.category.toUpperCase();
    const colorCode = color.toUpperCase();
    return `${brandCode}-${categoryCode}-${colorCode}-${size}`;
};


export const addVariant = async (req, res) => {
    try {
        const { productId } = req.params;
        const { color, size, price, stock } = req.body;

        if (!color || !size || !price || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "color, size, price and stock are required"
            });
        }

        // ✅ product exists check
        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        const sku = generateSKU(product, color, size);
        console.log(sku)
        // ✅ unique variant check (same color + size)
        const exists = await ProductVariant.findOne({
            productId,
            color,
            size
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Variant already exists for this color & size"
            });
        }

        // ✅ images
        const variantImages = req.files
            ? req.files.map(file => `/uploads/${file.filename}`)
            : [];

        const variant = await ProductVariant.create({
            productId,
            color,
            size,
            price,
            stock,
            variantImages,
            sku
        });

        return res.status(201).json({
            success: true,
            variant
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to add variant"
        });
    }
};

/* =========================
   GET VARIANTS BY PRODUCT
   GET /api/products/:productId/variants
========================= */
export const getVariantsByProduct = async (req, res) => {
    try {
        const variants = await ProductVariant.find({
            productId: req.params.productId,
            isActive: true
        }).sort({ price: 1 });

        return res.status(200).json({
            success: true,
            count: variants.length,
            variants
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch variants"
        });
    }
};

/* =========================
   UPDATE VARIANT (ADMIN)
   PUT /api/admin/variants/:id
========================= */
export const updateVariant = async (req, res) => {
    try {
        const updates = { ...req.body };

        if (req.files && req.files.length > 0) {
            updates.images = req.files.map(
                file => `/uploads/${file.filename}`
            );
        }

        const variant = await ProductVariant.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found"
            });
        }

        return res.status(200).json({
            success: true,
            variant
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update variant"
        });
    }
};

/* =========================
   DELETE VARIANT (SOFT)
   DELETE /api/admin/variants/:id
========================= */
export const deleteVariant = async (req, res) => {
    try {
        const variant = await ProductVariant.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Variant deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete variant"
        });
    }
};
