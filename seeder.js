const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
require("dotenv").config();
const { json } = require("express/lib/response");
const creat = require("./models/product");

mongoose.connect(process.env.MONGODB_URI, {});

// const category = JSON.parse(
//   fs.readFileSync(__dirname + "/data/subCategory.json", "utf-8")
// );
const brand = JSON.parse(
  fs.readFileSync(__dirname + "/data/subCategory.json", "utf-8")
);
const importData = async () => {
  try {
    await creat.create(brand);
    console.log("Data imported success".green.inverse);
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await creat.deleteMany();
    console.log("Data deleted success".red.inverse);
  } catch (err) {
    console.log(err.red.inverse);
  }
};

if (process.argv[2] == "-i") {
  importData();
} else if (process.argv[2] == "-d") {
  deleteData();
}
