import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { isSuperAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

// User
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// Admin
router.get("/", protect, isSuperAdmin, getAllOrders);
router.put("/:id/status", protect, isSuperAdmin, updateOrderStatus);
router.delete("/:id", protect, isSuperAdmin, deleteOrder);

export default router;
