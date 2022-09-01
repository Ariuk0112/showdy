const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");
const subcategory = new mongoose.Schema(
  {
    catId: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("subcategory", subcategory);
