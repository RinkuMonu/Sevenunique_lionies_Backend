import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      min: 1,
      required: true
    },
    price: {
      type: Number, // snapshot price
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0
    },
    isCheckedOut: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

cartSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.total, 0);
  next();
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;