import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";

/* =========================
   ADD VARIANT (ADMIN)
   POST /api/admin/products/:productId/variants
========================= */

const formatCode = (value = "") => value.toString().replace(/\s+/g, "").toUpperCase().slice(0, 4);
const generateSKU = (product, attributes) => {
    const brandCode = "LIO";
    const categoryCode = formatCode(product?.categoryId?.name || "GEN");
    const colorCode = formatCode(attributes.get("color") || "DEF");
    const sizeCode = formatCode(attributes.get("size") || "STD");
    const uniqueCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${brandCode}-${categoryCode}-${colorCode}-${sizeCode}-${uniqueCode}`;
};



export const addVariant = async (req, res) => {
    try {
        const { productId } = req.params;
        let { attributes, stock, variantTitle, variantDiscription, pricing } = req.body;

        /* ---------------- PARSE ATTRIBUTES ---------------- */

        if (typeof attributes === "string") {
            try {
                attributes = JSON.parse(attributes);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid JSON format in attributes"
                });
            }
        }

        if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
            return res.status(400).json({
                success: false,
                message: "Attributes must be an object"
            });
        }

        const attributeMap = new Map();

        for (const key of Object.keys(attributes)) {
            if (!attributes[key]) continue;

            attributeMap.set(
                key.toLowerCase(),
                String(attributes[key]).toLowerCase().trim()
            );
        }

        if (attributeMap.size === 0) {
            return res.status(400).json({
                success: false,
                message: "Attributes cannot be empty"
            });
        }

        /* ---------------- PARSE PRICING ---------------- */

        if (typeof pricing === "string") {
            try {
                pricing = JSON.parse(pricing);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid JSON format in pricing"
                });
            }
        }

        if (!pricing?.mrp || pricing.discountPercent === undefined) {
            return res.status(400).json({
                success: false,
                message: "MRP & discountPercent required"
            });
        }

        pricing.mrp = Number(pricing.mrp);
        pricing.discountPercent = Number(pricing.discountPercent);
        pricing.taxPercent = Number(pricing.taxPercent || 18);
        stock = Number(stock);

        if (isNaN(pricing.mrp) || isNaN(pricing.discountPercent) || isNaN(stock)) {
            return res.status(400).json({
                success: false,
                message: "Invalid numeric values"
            });
        }

        /* ---------------- BASIC REQUIRED ---------------- */

        if (!variantTitle || !variantDiscription) {
            return res.status(400).json({
                success: false,
                message: "Variant title & description required"
            });
        }

        /* ---------------- PRODUCT CHECK ---------------- */

        const product = await Product.findOne({
            _id: productId,
            isActive: true
        }).lean();

        console.log(product)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or inactive"
            });
        }

        if (product.sellerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to add variants to this product"
            });
        }


        /* ---------------- DUPLICATE CHECK ---------------- */

        const existsVariant = await ProductVariant.findOne({
            productId,
            "attributes.size": attributeMap.get("size"),
            "attributes.color": attributeMap.get("color")
        })
            .select("sku attributes")
            .lean();

        if (existsVariant) {
            return res.status(409).json({
                success: false,
                message: "Variant already exists for this combination",
                SKU: existsVariant.sku,
                color: existsVariant.attributes,
            });
        }

        /* ---------------- SKU ---------------- */

        const sku = generateSKU(product, attributeMap);

        /* ---------------- IMAGES ---------------- */

        const variantImages = req.files?.map(
            file => `/uploads/${file.filename}`
        ) || [];

        /* ---------------- CREATE ---------------- */

        const variant = await ProductVariant.create({
            productId,
            variantTitle,
            variantDiscription,
            attributes: attributeMap,
            pricing,
            stock,
            variantImages,
            sku
        });

        return res.status(201).json({
            success: true,
            message: "Variant added & sent for QC",
            variant
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

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
