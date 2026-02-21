import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";

/* =========================
   ADD VARIANT (ADMIN)
   POST /api/admin/products/:productId/variants
========================= */

const generateSKU = (product, color, size) => {
    const formatCode = (value) =>
        value.replace(/\s+/g, "").toUpperCase();
    const brandCode = "LIO";
    const categoryCode = formatCode(product?.categoryId?.name || "GENERIC");
    const colorCode = formatCode(color || "DEFAULT");
    const sizeCode = formatCode(size || "STD");
    return `${brandCode}-${categoryCode}-${colorCode}-${sizeCode}`;
};



export const addVariant = async (req, res) => {
    try {
        const { productId } = req.params;
        const { color, size, stock, variantTitle, variantDiscription, pricing } = req.body;

        if (!color || !size || !pricing?.mrp ||
            pricing.discountPercent === undefined || stock === undefined || !variantTitle || !variantDiscription) {
            return res.status(400).json({
                success: false,
                message: "color, size, pricing, discountPercent, mrp, variantTitle, variantDiscription and stock are required"
            });
        }   
        if (typeof pricing === "string") {
            pricing = JSON.parse(pricing);
        }

        if (!pricing) {
            pricing = {
                mrp: req.body.mrp,
                discountPercent: req.body.discountPercent,
                // platformFeePercent: req.body.platformFeePercent,
                taxPercent: req.body.taxPercent
            };
        }

        pricing.mrp = Number(pricing.mrp);
        pricing.discountPercent = Number(pricing.discountPercent);
        // pricing.platformFeePercent = Number(pricing.platformFeePercent || 12);
        pricing.taxPercent = Number(pricing.taxPercent || 18);
        stock = Number(stock);

        // ✅ product exists check
        const product = await Product.findOne({
            _id: productId,
            isActive: true
        }).select("categoryId").populate("categoryId", "name").lean();


        if (!product || !product.categoryId?.name) {
            return res.status(404).json({
                success: false,
                message: "Product not found or inactive or category not found"
            });
        }
        const exists = await ProductVariant.exists({
            productId,
            color,
            size
        })

        if (exists) {
            return res.status(409).json({
                success: false,
                message: `Variant already exists for this color: ${color} and size: ${size}`
            });
        }

        const sku = generateSKU(product, color, size);
        console.log(sku)


        // ✅ images
        const variantImages = req.files
            ? req.files.map(file => `/uploads/${file.filename}`)
            : [];

        const variant = await ProductVariant.create({
            productId,
            variantTitle,
            variantDiscription,
            color: color.trim().toLowerCase(),
            size: size.trim().toLowerCase(),
            pricing,
            stock,
            variantImages,
            sku
        });

        return res.status(201).json({
            message: "Variant now go to for QC (Quality Check) and once approved it will be live on the platform",
            success: true,
            variant
        });

    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const value = error.keyValue[field];
            return res.status(409).json({
                success: false,
                message: `${field} '${value}' already exists`
            });
        }
        console.log("Error in addVariant:", error);
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
   GET SINGLE VARIANT
   GET /api/variant/:id
========================= */
export const getVariantById = async (req, res) => {
    try {
        const variant = await ProductVariant.findById(req.params.id)
            .populate("productId", "name productImage");

        if (!variant || !variant.isActive) {
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
            message: "Failed to fetch variant"
        });
    }
};


/* =========================
   GET ALL VARIANTS (ADMIN)
   GET /api/admin/variants
========================= */
export const getAllVariants = async (req, res) => {
    try {
        const variants = await ProductVariant.find()
            .populate("productId", "name")
            .sort({ createdAt: -1 });

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
