import express from "express";
import {
  createFAQ,
  getFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ
} from "../controllers/faq.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { isSuperAdmin } from "../middlewares/role.middleware.js";

const faqRoute = express.Router();

/* PUBLIC */
faqRoute.get("/", getFAQs);
faqRoute.get("/:id", getFAQById);

/* ADMIN */
faqRoute.post("/", protect, isSuperAdmin, createFAQ);
faqRoute.put("/:id", protect, isSuperAdmin, updateFAQ);
faqRoute.delete("/:id", protect, isSuperAdmin, deleteFAQ);

export default faqRoute;
