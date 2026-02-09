import express from "express";
import {
  createContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact
} from "../controllers/contact.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const contactRoute = express.Router();

/* PUBLIC */
contactRoute.post("/", createContact);

/* ADMIN */
contactRoute.get("/", protect, isAdmin, getContacts);
contactRoute.get("/:id", protect, isAdmin, getContactById);
contactRoute.put("/:id", protect, isAdmin, updateContactStatus);
contactRoute.delete("/:id", protect, isAdmin, deleteContact);

export default contactRoute;
