import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { getProfile, login, register, updateProfile } from "../controllers/auth.controller.js";

const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/me", protect, getProfile);
authRoute.put("/update", protect, updateProfile);

export default authRoute;
