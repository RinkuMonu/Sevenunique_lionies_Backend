import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { upload } from "../config/multer.js";
import { subcreateCategory, subdeleteCategory, subgetCategories, subgetCategoryById, subupdateCategory } from "../controllers/subcategory.js";

const subcategoryRoute = express.Router();

/* ADMIN */
subcategoryRoute.post(
    "/",
    protect,
    isAdmin,
    upload.fields([
        { name: "bannerimage", maxCount: 1 },
        { name: "smallimage", maxCount: 1 }
    ]),
    subcreateCategory
);
/* PUBLIC */
subcategoryRoute.get("/", subgetCategories);
subcategoryRoute.get("/:id", subgetCategoryById);


subcategoryRoute.put(
    "/:id",
    protect,
    isAdmin,
    upload.fields([
        { name: "bannerimage", maxCount: 1 },
        { name: "smallimage", maxCount: 1 }
    ]),
    subupdateCategory
);

subcategoryRoute.delete(
    "/:id",
    protect,
    isAdmin,
    subdeleteCategory
);

export default subcategoryRoute;
