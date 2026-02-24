import express from "express";
import { createWearType, deleteWearType, getWearTypeById, getWearTypes, updateWearType } from "../controllers/wearType/weartype.controller.js";

const wearRoute = express.Router();

wearRoute.post("/", createWearType);
wearRoute.get("/", getWearTypes);
wearRoute.get("/:id", getWearTypeById);
wearRoute.put("/:id", updateWearType);
wearRoute.delete("/:id", deleteWearType);

export default wearRoute;
