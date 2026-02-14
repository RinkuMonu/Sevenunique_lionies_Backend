import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { getAllUser, getProfile, login, logout, register, updateProfile, verifyOtp } from "../controllers/auth.controller.js";
import { upload } from "../config/multer.js";

const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.post("/verifyotp", verifyOtp);
authRoute.post("/logout", logout);
authRoute.get("/me", protect, getProfile);
authRoute.get("/alluser", getAllUser);
authRoute.put("/update", protect, upload.single("avatar"), updateProfile);

export default authRoute;
