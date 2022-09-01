const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");
const carType = new mongoose.Schema(
  {
    carType: {
      type: String,
      unique: true,
    },
    carFactory: {
      type: mongoose.Schema.ObjectId,
      ref: "carFactory",
    },
    type: String,
    price: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

carType.pre("remove", async function (next) {
  await this.model("carMark").deleteMany({ carType: this._id });
  next();
});

module.exports = mongoose.model("carType", carType);
