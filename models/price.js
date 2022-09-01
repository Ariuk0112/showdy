const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");
const autoIncrement = require("mongoose-auto-increment");
const price = new mongoose.Schema(
  {
    carMark: {
      type: mongoose.Schema.ObjectId,
      ref: "carMark",
    },
    manufactured: [String],
    totalRentalPriceDayWithDriver: String,
    totalRentalPriceDayWithDriverExtraTime: String,
    totalRentalPriceDay: String,
    totalRentalPriceDayExtraTime: String,
    totalRentalPriceHourWithDriver: String,
    totalRentalPriceHour: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
var db = mongoose.connection;
autoIncrement.initialize(db);
price.plugin(autoIncrement.plugin, {
  model: "price",
  field: "_id",
  startAt: 0,
  incrementBy: 1,
});

module.exports = mongoose.model("price", price);
