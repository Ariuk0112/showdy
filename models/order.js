const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");
const autoIncrement = require("mongoose-auto-increment");
const order = new mongoose.Schema(
  {
    orderId: {
      type: Number,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      required: true,
    },
    carId: {
      type: mongoose.Schema.ObjectId,
      ref: "car",
    },
    status: {
      type: String,
      default: "0",
    },
    createDate: { type: Date },
    orderStartDate: Date,
    orderEndDate: Date,
    location: String,
    totalPayment: String,
    prePayment: String,
    prePaymentDate: Date,
    balancePayment: String,
    balancePaymentDate: Date,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
var db = mongoose.connection;
autoIncrement.initialize(db);
order.plugin(autoIncrement.plugin, {
  model: "order",
  field: "orderId",
  startAt: 1000,
  incrementBy: 1,
});
order.pre("save", function (next) {
  var date = Date.now();
  this.prePaymentDate = new Date(date);
  this.createDate = new Date(date);
  next();
});
module.exports = mongoose.model("order", order);
