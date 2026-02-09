import FAQ from "../models/faq.model.js";

/* =========================
   CREATE FAQ
   POST /api/faq
========================= */
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required"
      });
    }

    const faq = await FAQ.create({
      question,
      answer,
      category,
      createdBy: req.user.id
    });

    return res.status(201).json({
      success: true,
      faq
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create FAQ"
    });
  }
};

/* =========================
   GET ALL FAQs
   GET /api/faq
========================= */
export const getFAQs = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;

    const faqs = await FAQ.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      faqs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs"
    });
  }
};

/* =========================
   GET FAQ BY ID
   GET /api/faq/:id
========================= */
export const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    return res.status(200).json({
      success: true,
      faq
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ"
    });
  }
};

/* =========================
   UPDATE FAQ
   PUT /api/faq/:id
========================= */
export const updateFAQ = async (req, res) => {
  try {
    const updates = { ...req.body };

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    return res.status(200).json({
      success: true,
      faq
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ"
    });
  }
};

/* =========================
   DELETE FAQ (SOFT)
   DELETE /api/faq/:id
========================= */
export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ"
    });
  }
};