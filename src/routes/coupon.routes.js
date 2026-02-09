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
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

/* USER */
router.post("/apply", protect, applyCoupon);
router.get("/valid", protect, getValidCoupons);

/* ADMIN */
router.post("/", protect, isAdmin, createCoupon);
router.get("/", protect, isAdmin, getCoupons);
router.put("/:id", protect, isAdmin, updateCoupon);
router.delete("/:id", protect, isAdmin, deleteCoupon);

export default router;
