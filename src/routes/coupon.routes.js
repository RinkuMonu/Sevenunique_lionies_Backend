import express from "express";
import {
  createCoupon,
  applyCoupon,
  getCoupons,
  getValidCoupons,
  updateCoupon,
  deleteCoupon
} from "../controllers/coupon.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { isSuperAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

/* USER */
router.post("/apply", protect, applyCoupon);
router.get("/valid", protect, getValidCoupons);

/* ADMIN */
router.post("/", protect, isSuperAdmin, createCoupon);
router.get("/", protect, isSuperAdmin, getCoupons);
router.put("/:id", protect, isSuperAdmin, updateCoupon);
router.delete("/:id", protect, isSuperAdmin, deleteCoupon);

export default router;
