const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");
const carMark = new mongoose.Schema(
  {
    carMark: {
      type: String,
      trim: true,
    },
    carType: {
      type: mongoose.Schema.ObjectId,
      ref: "carType",
    },
    carFactory: {
      type: mongoose.Schema.ObjectId,
      ref: "carFactory",
    },
    carYear: String,
    img: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("carMark", carMark);
