import Category from "../models/category.model.js";

/* =========================
   CREATE CATEGORY
   POST /api/admin/categories
========================= */
export const createCategory = async (req, res) => {
    try {
        const { key, name, allowedFilters, attributes } = req.body;

        if (!key || !name) {
            return res.status(400).json({
                success: false,
                message: "Key and name are required"
            });
        }

        const exists = await Category.findOne({
            $or: [{ key }, { name }]
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const category = await Category.create({
            key,
            name,
            allowedFilters,
            attributes,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });

        return res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create category"
        });
    }
};

/* =========================
   GET ALL CATEGORIES
   GET /api/categories
========================= */
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
};

/* =========================
   GET CATEGORY BY ID
   GET /api/categories/:id
========================= */
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch category"
        });
    }
};

/* =========================
   UPDATE CATEGORY
   PUT /api/admin/categories/:id
========================= */
export const updateCategory = async (req, res) => {
    try {
        const updates = {
            ...req.body
        };

        if (req.file) {
            updates.image = `/uploads/${req.file.filename}`;
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update category"
        });
    }
};

/* =========================
   DELETE CATEGORY (SOFT)
   DELETE /api/admin/categories/:id
========================= */
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete category"
        });
    }
};
