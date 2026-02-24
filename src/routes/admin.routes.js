import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isSeller, isSuperAdmin } from "../middlewares/role.middleware.js";
import { createProduct, addVariant, updateProduct, deleteProduct, getProducts, getFilters, getProductById } from "../controllers/admin.product.controller.js";
import { upload } from "../config/multer.js";

const router = express.Router();
// router.post("/products", protect, isSeller, upload.single("productImage"), createProduct);
router.post("/products", protect, isSuperAdmin, upload.array("productImage"), createProduct);
router.get("/", protect, getProducts);
router.get("/getfilter", getFilters);
router.get("/:id", getProductById);
router.put(
    "/products/:id",
    protect,
    upload.array("productImage"),
    updateProduct
);

router.delete(
    "/products/:id",
    protect,
    isSeller,
    deleteProduct
);
router.post("/products/:productId/variants", protect, isSeller, upload.array("images"), addVariant);

export default router;
