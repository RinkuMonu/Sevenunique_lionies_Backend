import Contact from "../models/contact.model.js";

/* =========================
   CREATE CONTACT
   POST /api/contact
========================= */
export const createContact = async (req, res) => {
  try {
    const { name, email, mobile, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled"
      });
    }

    const contact = await Contact.create({
      name,
      email,
      mobile,
      subject,
      message
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      contact
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
};

/* =========================
   GET ALL CONTACTS (ADMIN)
   GET /api/contact
========================= */
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ isActive: true }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      success: true,
      contacts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contacts"
    });
  }
};

/* =========================
   GET CONTACT BY ID
   GET /api/contact/:id
========================= */
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    return res.status(200).json({
      success: true,
      contact
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact"
    });
  }
};

/* =========================
   UPDATE CONTACT STATUS
   PUT /api/contact/:id
========================= */
export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    return res.status(200).json({
      success: true,
      contact
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update contact"
    });
  }
};

/* =========================
   DELETE CONTACT (SOFT)
   DELETE /api/contact/:id
========================= */
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete contact"
    });
  }
};