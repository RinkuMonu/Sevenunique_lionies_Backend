import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { upload } from "../config/multer.js";
import {
    addVariant,
    getVariantsByProduct,
    updateVariant,
    deleteVariant,
    getVariantById,
    getAllVariants
} from "../controllers/addvariant.js";

const addvarintRoute = express.Router();

/* USER */
addvarintRoute.get(
    "/products/:productId/variants",
    getVariantsByProduct
);

/* USER */
addvarintRoute.get("/:id", getVariantById);


/* ADMIN */
addvarintRoute.get(
  "/admin/variants",
  protect,
  isAdmin,
  getAllVariants
);


/* ADMIN */
addvarintRoute.post(
    "/admin/products/:productId/variants",
    protect,
    isAdmin,
    upload.array("variantImages", 5),
    addVariant
);

addvarintRoute.put(
    "/admin/variants/:id",
    protect,
    isAdmin,
    upload.array("variantImages", 5),
    updateVariant
);

addvarintRoute.delete(
    "/admin/variants/:id",
    protect,
    isAdmin,
    deleteVariant
);

export default addvarintRoute;
