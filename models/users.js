const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    phone: { type: String, unique: true },
    phoneOtp: String,
    firstName: { type: String },
    lastName: { type: String },
    birthday: { type: String },
    preferredCategory: [
      {
        cat_id: {
          type: mongoose.Schema.ObjectId,
        },
      },
    ],
    acc_type: {
      type: String,
      default: "User",
    },
    isAccountVerified: String,
    createdAt: { type: Date, default: Date.now() },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    minimize: false,
  }
);
module.exports = mongoose.model("users", userSchema);
