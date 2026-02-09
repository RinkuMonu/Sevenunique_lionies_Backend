import express from "express";
import {
  addItemToWishlist,
  removeItemFromWishlist,
  getWishlist,
  clearWishlist
} from "../controllers/wishlist.controller.js";

import { isAdmin } from "../middlewares/role.middleware.js";

const wishlistRoute = express.Router();

wishlistRoute.post("/add", isAdmin, addItemToWishlist);
wishlistRoute.post("/remove", isAdmin, removeItemFromWishlist);
wishlistRoute.get("/", isAdmin, getWishlist);
wishlistRoute.delete("/clear", isAdmin, clearWishlist);

export default wishlistRoute;