import Coupon from "../models/coupon.model.js";

/* =========================
   CREATE COUPON (ADMIN)
========================= */
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   APPLY COUPON (USER)
========================= */

export const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal, productIds = [] } = req.body;
    const userId = req.user.id;

    const coupon = await Coupon.findOne({ code });
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ message: "Invalid coupon" });
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.expiryDate) {
      return res.status(400).json({ message: "Coupon expired or inactive" });
    }

    if (subtotal < coupon.minimumOrderValue) {
      return res.status(400).json({
        message: `Minimum order ₹${coupon.minimumOrderValue} required`
      });
    }

    if (
      coupon.applicableUsers.length &&
      !coupon.applicableUsers.includes(userId)
    ) {
      return res.status(400).json({ message: "Coupon not valid for you" });
    }

    if (
      coupon.applicableProducts.length &&
      !productIds.some(id =>
        coupon.applicableProducts.map(p => p.toString()).includes(id)
      )
    ) {
      return res.status(400).json({ message: "Coupon not valid for products" });
    }

    const userUsage = coupon.userUsage.find(
      u => u.user.toString() === userId
    );

    if (userUsage && userUsage.usedCount >= coupon.perUserLimit) {
      return res.status(400).json({ message: "Coupon already used" });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      discountAmount,
      finalAmount: subtotal - discountAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   GET COUPONS (ADMIN)
========================= */
export const getCoupons = async (req, res) => {
  const coupons = await Coupon.find();
  res.json({ success: true, coupons });
};

/* =========================
   GET VALID COUPONS (USER)
========================= */
export const getValidCoupons = async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    expiryDate: { $gte: now }
  });

  res.json({ success: true, coupons });
};

/* =========================
   UPDATE COUPON (ADMIN)
========================= */
export const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  res.json({ success: true, coupon });
};

/* =========================
   DELETE COUPON (ADMIN)
========================= */
export const deleteCoupon = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Coupon deleted" });
};
