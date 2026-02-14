import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  mobile: {
    type: String,
    unique: true,
    required: true,
    maxlength: 10,
    index: true

  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: ["superadmin", "seller", "customer", "rider"],
    default: "user",
    index: true
  },
  wallet: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  requestFor: {
    type: String,
    default: "become_a_customer",
    enum: ["become_a_seller", "become_a_customer", "become_a_rider"]
  },
  forceLogout: {
    type: Boolean,
    default: false
  },
},
  { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // password hash
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});


userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);

