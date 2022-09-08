const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");
const category = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("category", category);
