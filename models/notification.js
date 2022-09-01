const mongoose = require("mongoose");
const notification = new mongoose.Schema(
  {
    To: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "users",
    },
    message: String,
    zariinId: {
      type: mongoose.Schema.ObjectId,
      ref: "",
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
module.exports = mongoose.model("notification", notification);
