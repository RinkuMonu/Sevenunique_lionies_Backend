import express from "express";
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { upload } from "../config/multer.js";

const categoryRoute = express.Router();

/* ADMIN */
categoryRoute.post(
    "/",
    protect,
    isAdmin,
    upload.fields([
        { name: "bannerimage", maxCount: 1 },
        { name: "smallimage", maxCount: 1 }
    ]),
    createCategory
);
/* PUBLIC */
categoryRoute.get("/", getCategories);
categoryRoute.get("/:id", getCategoryById);


categoryRoute.put(
    "/:id",
    protect,
    isAdmin,
    upload.fields([
        { name: "bannerimage", maxCount: 1 },
        { name: "smallimage", maxCount: 1 }
    ]),
    updateCategory
);

categoryRoute.delete(
    "/:id",
    protect,
    isAdmin,
    deleteCategory
);

export default categoryRoute;
