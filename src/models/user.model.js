import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
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
    enum: ["admin", "user"],
    default: "user",
    index: true
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

