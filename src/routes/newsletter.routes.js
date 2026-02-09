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
import { isAdmin } from "../middlewares/role.middleware.js";

const newsletterRoute = express.Router();

/* PUBLIC */
newsletterRoute.post("/", subscribeNewsletter);
newsletterRoute.put("/unsubscribe", unsubscribeNewsletter);

/* ADMIN */
newsletterRoute.get("/", protect, isAdmin, getSubscribers);
newsletterRoute.get("/:id", protect, isAdmin, getSubscriberById);
newsletterRoute.put("/:id", protect, isAdmin, updateSubscriber);
newsletterRoute.delete("/:id", protect, isAdmin, deleteSubscriber);

export default newsletterRoute;