const mongoose = require("mongoose");
const project = new mongoose.Schema(
  {
    projectImg: String,
    projectName: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("project", project);
