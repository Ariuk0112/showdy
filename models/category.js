const mongoose = require("mongoose");
const category = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    icon: {
      type: String,
    },
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
module.exports = mongoose.model("category", category);
10;
