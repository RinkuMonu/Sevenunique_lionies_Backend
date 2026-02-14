import express from "express";
import {
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  getCart,
  checkoutCart
} from "../controllers/cart.controller.js";

import { isAdmin } from "../middlewares/role.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";


const cartRoute = express.Router();

cartRoute.post("/add", protect, addItemToCart);
cartRoute.post("/update", protect, updateCartItemQuantity);
cartRoute.post("/remove", protect, removeItemFromCart);
cartRoute.get("/", protect, getCart);
cartRoute.post("/checkout", protect, checkoutCart);

export default cartRoute;
