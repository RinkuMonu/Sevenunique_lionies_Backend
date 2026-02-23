import express from "express";
import {
  createReview,
  getReviewsByProduct,
  getMyReviews,
  updateReview,
  deleteReview
} from "../controllers/review.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { isSuperAdmin } from "../middlewares/role.middleware.js";

const reviewRoute = express.Router();

/* USER */
reviewRoute.post("/", protect, createReview);
reviewRoute.get("/my", protect, getMyReviews);
reviewRoute.put("/:id", protect, updateReview);

/* PUBLIC */
reviewRoute.get("/product/:productId", getReviewsByProduct);

/* ADMIN */
reviewRoute.delete("/:id", protect, isSuperAdmin, deleteReview);

export default reviewRoute;
