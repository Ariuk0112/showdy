const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");
const carFactory = new mongoose.Schema(
  {
    factory: {
      type: String,
      unique: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("carFactory", carFactory);
