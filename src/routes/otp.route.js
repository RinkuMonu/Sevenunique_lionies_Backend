import express from "express";
import { sendOtpController } from "../service/otpsend.js";


const otproute = express.Router();

// User
otproute.post("/send", sendOtpController);

export default otproute;
