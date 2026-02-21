// import mongoose from "mongoose";

// const couponSchema = new mongoose.Schema(
//     {
//         code: {
//             type: String,
//             required: true,
//             unique: true,
//             uppercase: true,
//             trim: true
//         },

//         discountType: {
//             type: String,
//             enum: ["percentage", "fixed"],
//             required: true
//         },

//         discountValue: {
//             type: Number,
//             required: true
//         },

//         minimumOrderValue: {
//             type: Number,
//             default: 0
//         },

//         startDate: {
//             type: Date,
//             required: true
//         },

//         expiryDate: {
//             type: Date,
//             required: true
//         },

//         applicableProducts: [
//             {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: "Product"
//             }
//         ],

//         applicableUsers: [
//             {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: "User"
//             }
//         ],

//         usageLimit: {
//             type: Number,
//             default: 0 // 0 = unlimited
//         },

//         perUserLimit: {
//             type: Number,
//             default: 1
//         },

//         totalUsed: {
//             type: Number,
//             default: 0
//         },

//         userUsage: [
//             {
//                 user: {
//                     type: mongoose.Schema.Types.ObjectId,
//                     ref: "User"
//                 },
//                 usedCount: {
//                     type: Number,
//                     default: 0
//                 }
//             }
//         ],

//         isActive: {
//             type: Boolean,
//             default: true
//         }
//     },
//     { timestamps: true }
// );

// export default mongoose.model("Coupon", couponSchema);



import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    /* ===============================
       BASIC INFO
    =============================== */

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },

    description: {
      type: String,
      trim: true
    },

    /* ===============================
       DISCOUNT CONFIG
    =============================== */

    discountType: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping"],
      required: true
    },

    discountValue: {
      type: Number,
      required: function () {
        return this.discountType !== "free_shipping";
      }
    },

    maxDiscountAmount: {
      type: Number, // Only for percentage coupons
      default: null
    },

    minimumOrderValue: {
      type: Number,
      default: 0
    },

    /* ===============================
       APPLICABILITY CONFIG
    =============================== */

    applicableScope: {
      type: String,
      enum: ["all", "category", "product", "seller", "specific_users"],
      default: "all"
    },

    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      }
    ],

    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],

    applicableSellers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // seller role user
      }
    ],

    applicableUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    /* ===============================
       USAGE CONTROL
    =============================== */

    usageLimit: {
      type: Number,
      default: 0 // 0 = unlimited
    },

    perUserLimit: {
      type: Number,
      default: 1
    },

    totalUsedCount: {
      type: Number,
      default: 0
    },

    /* ===============================
       STACKING CONTROL
    =============================== */

    isStackable: {
      type: Boolean,
      default: false
    },

    /* ===============================
       AUTO APPLY OPTION
    =============================== */

    isAutoApply: {
      type: Boolean,
      default: false
    },

    /* ===============================
       VALIDITY
    =============================== */

    startDate: {
      type: Date,
      required: true
    },

    expiryDate: {
      type: Date,
      required: true
    },

    /* ===============================
       COMMISSION BEAR CONFIG
    =============================== */

    discountBearer: {
      type: String,
      enum: ["platform", "seller", "shared"],
      default: "platform"
    },

    sellerSharePercentage: {
      type: Number,
      default: 0 // only if shared
    },

    /* ===============================
       FIRST ORDER ONLY
    =============================== */

    isFirstOrderOnly: {
      type: Boolean,
      default: false
    },

    /* ===============================
       STATUS
    =============================== */

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);


/* ==========================================
   INDEXES FOR PERFORMANCE
========================================== */

couponSchema.index({ startDate: 1, expiryDate: 1 });
couponSchema.index({ isActive: 1 });

export default mongoose.model("Coupon", couponSchema);
