import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { createProduct, addVariant, updateProduct, deleteProduct, getProducts, getFilters, getProductById } from "../controllers/admin.product.controller.js";
import { upload } from "../config/multer.js";

const router = express.Router();
// router.post("/products", protect, isAdmin, upload.single("productImage"), createProduct);
router.post("/products", upload.single("productImage"), createProduct);
router.get("/", getProducts);
router.get("/getfilter", getFilters);
router.get("/:id", getProductById);
router.put(
    "/products/:id",
    protect,
    isAdmin,
    upload.single("productImage"),
    updateProduct
);

router.delete(
    "/products/:id",
    protect,
    isAdmin,
    deleteProduct
);
router.post("/products/:productId/variants", protect, isAdmin, upload.array("images"), addVariant);

export default router;
