import { deleteLocalFile } from "../config/multer.js";
import Category from "../models/category.model.js";

/* =========================
   CREATE CATEGORY
   POST /api/admin/categories
========================= */
export const createCategory = async (req, res) => {
    try {
        const { name, allowedFilters } = req.body;
        console.log(req.file)

        // 🔥 normalize attributeFilters
        let attributeFilters = {};
        if (req.body.attributeFilters) {
            attributeFilters = { ...req.body.attributeFilters };
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name are required"
            });
        }

        const exists = await Category.findOne({
            $or: [{ name }]
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }
        const bannerimage = req.files?.bannerimage?.[0]
            ? `/uploads/${req.files.bannerimage[0].filename}`
            : null;

        const smallimage = req.files?.smallimage?.[0]
            ? `/uploads/${req.files.smallimage[0].filename}`
            : null;
        const category = await Category.create({
            name,
            allowedFilters,
            attributeFilters,
            bannerimage,
            smallimage
        });

        return res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        console.error(error);
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
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        const updates = {};

        if (req.body.name) updates.name = req.body.name;
        if (req.body.allowedFilters) updates.allowedFilters = req.body.allowedFilters;
        if (typeof req.body.attributeFilters === "string") {
            updates.attributeFilters = JSON.parse(req.body.attributeFilters);
        }
        if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

        if (req.files?.bannerimage?.[0]) {
            deleteLocalFile(category.bannerimage);
            updates.bannerimage = `/uploads/${req.files.bannerimage[0].filename}`;
        }

        if (req.files?.smallimage?.[0]) {
            deleteLocalFile(category.smallimage);
            updates.smallimage = `/uploads/${req.files.smallimage[0].filename}`;
        }
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            updatedCategory
        });

    } catch (error) {
        console.error("UPDATE CATEGORY ERROR:", error);
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
