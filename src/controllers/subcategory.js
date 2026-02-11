import { deleteLocalFile } from "../config/multer.js";
import SubCategory from "../models/subcategory.modal.js";

/* =========================
   CREATE CATEGORY
   POST /api/admin/categories
========================= */
export const subcreateCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "name are required"
            });
        }

        const exists = await SubCategory.findOne({
            $or: [{ name }]
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const bannerimage = req.files?.bannerimage
            ? `/uploads/${req.files.bannerimage[0].filename}`
            : null;

        const smallimage = req.files?.smallimage
            ? `/uploads/${req.files.smallimage[0].filename}`
            : null;

        const category = await SubCategory.create({
            name,
            bannerimage,
            smallimage
        });

        return res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        console.log("sub", error)
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
export const subgetCategories = async (req, res) => {
    try {
        const categories = await SubCategory.find({ isActive: true }).sort({
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


export const getSubCategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const subcategories = await SubCategory.find({
            categoryId: categoryId,
            isActive: true
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            subcategories
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Failed to fetch subcategories"
        });
    }
};


/* =========================
   GET CATEGORY BY ID
   GET /api/categories/:id
========================= */
export const subgetCategoryById = async (req, res) => {
    try {
        const category = await SubCategory.findById(req.params.id);

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
export const subupdateCategory = async (req, res) => {
    try {
        const category = await SubCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        const updates = {
            ...req.body
        };

        if (req.files?.bannerimage?.[0]) {
            deleteLocalFile(category.bannerimage);
            updates.bannerimage = `/uploads/${req.files.bannerimage[0].filename}`;
        }

        if (req.files?.smallimage?.[0]) {
            deleteLocalFile(category.smallimage);
            updates.smallimage = `/uploads/${req.files.smallimage[0].filename}`;
        }

        const updatedCategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            updatedCategory
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
export const subdeleteCategory = async (req, res) => {
    try {
        const category = await SubCategory.findByIdAndUpdate(
            req.params.id,
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
