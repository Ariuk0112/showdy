const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");
const coworker = new mongoose.Schema({
  coWorkerLogo: {
    type: String,
  },
});
module.exports = mongoose.model("coworker", coworker);
