const mongoose = require("mongoose");
const auction = new mongoose.Schema(
  {
    factory: String,
    model: String,
    manufacturedDate: String,
    seatNumber: String,
    topSpeed: String,
    Wheelbase: String,
    drivetrain: String,
    headImg: String,
    details: String,
    image: [
      {
        img: String,
        ordern: String,
      },
    ],
    createDate: { type: Date, default: Date.now() },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    minimize: false,
  }
);
module.exports = mongoose.model("auction", auction);
