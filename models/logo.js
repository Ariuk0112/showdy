const mongoose = require("mongoose");
const logo = new mongoose.Schema(
  {
    img: String,
    url: String,
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
module.exports = mongoose.model("logo", logo);
