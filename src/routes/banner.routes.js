import express from "express";
import {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
} from "../controllers/banner.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { upload } from "../config/multer.js";

const bannerRoute = express.Router();

/* ADMIN */
bannerRoute.post(
  "/",
  protect,
  isAdmin,
  upload.array("images", 5),
  createBanner
);

bannerRoute.put(
  "/:id",
  protect,
  isAdmin,
  upload.array("images", 5),
  updateBanner
);

bannerRoute.delete(
  "/:id",
  protect,
  isAdmin,
  deleteBanner
);

/* PUBLIC */
bannerRoute.get("/", getBanners);
bannerRoute.get("/:id", getBannerById);

export default bannerRoute;