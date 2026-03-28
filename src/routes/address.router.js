import express from "express";
import { createAddress, deleteAddress, getSingleAddress, getUserAddresses, setDefaultAddress, updateAddress } from "../controllers/adress.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const addresRouter = express.Router();

// Create
addresRouter.post("/", protect, createAddress);

// Get all
addresRouter.get("/", protect, getUserAddresses);

// Get single
addresRouter.get("/:id", protect, getSingleAddress);

// Update
addresRouter.put("/:id", protect, updateAddress);

// Delete (soft)
addresRouter.delete("/:id", protect, deleteAddress);

// Set default
addresRouter.patch("/set-default/:id", protect, setDefaultAddress);

export default addresRouter;