const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    phone: { type: String, unique: true },
    phoneOtp: String,
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    email: String,
    role: {
      type: String,
      default: "user",
    },
    isAccountVerified: String,
    passportImg: [
      {
        img: {
          type: String,
        },
        porder: String,
      },
    ],
    passportExpireDate: String,
    driverLicenseImg: [
      {
        img: {
          type: String,
        },
        dlorder: String,
      },
    ],
    driverLicenseExpireDate: String,
    driverLicenseNumber: String,
    ContractNumber: Number,
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
