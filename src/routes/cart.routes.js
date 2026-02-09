import express from "express";
import {
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  getCart,
  checkoutCart
} from "../controllers/cart.controller.js";

import { isAdmin } from "../middlewares/role.middleware.js";

const cartRoute = express.Router();

cartRoute.post("/add", isAdmin, addItemToCart);
cartRoute.post("/update", isAdmin, updateCartItemQuantity);
cartRoute.post("/remove", isAdmin, removeItemFromCart);
cartRoute.get("/", isAdmin, getCart);
cartRoute.post("/checkout", isAdmin, checkoutCart);

export default cartRoute;
