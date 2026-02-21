import express from "express";
import {
  subscribeNewsletter,
  getSubscribers,
  getSubscriberById,
  updateSubscriber,
  unsubscribeNewsletter,
  deleteSubscriber
} from "../controllers/newsletter.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { isSuperAdmin } from "../middlewares/role.middleware.js";

const newsletterRoute = express.Router();

/* PUBLIC */
newsletterRoute.post("/", subscribeNewsletter);
newsletterRoute.put("/unsubscribe", unsubscribeNewsletter);

/* ADMIN */
newsletterRoute.get("/", protect, isSuperAdmin, getSubscribers);
newsletterRoute.get("/:id", protect, isSuperAdmin, getSubscriberById);
newsletterRoute.put("/:id", protect, isSuperAdmin, updateSubscriber);
newsletterRoute.delete("/:id", protect, isSuperAdmin, deleteSubscriber);

export default newsletterRoute;