import express from "express";
import {
  addItemToWishlist,
  removeItemFromWishlist,
  getWishlist,
  clearWishlist
} from "../controllers/wishlist.controller.js";

import { isAdmin } from "../middlewares/role.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";


const wishlistRoute = express.Router();

wishlistRoute.post("/add", protect, addItemToWishlist);
wishlistRoute.post("/remove", protect, removeItemFromWishlist);
wishlistRoute.get("/", protect, getWishlist);
wishlistRoute.delete("/clear", protect, clearWishlist);

export default wishlistRoute;