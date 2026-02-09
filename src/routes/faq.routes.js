import express from "express";
import {
  createFAQ,
  getFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ
} from "../controllers/faq.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const faqRoute = express.Router();

/* PUBLIC */
faqRoute.get("/", getFAQs);
faqRoute.get("/:id", getFAQById);

/* ADMIN */
faqRoute.post("/", protect, isAdmin, createFAQ);
faqRoute.put("/:id", protect, isAdmin, updateFAQ);
faqRoute.delete("/:id", protect, isAdmin, deleteFAQ);

export default faqRoute;
