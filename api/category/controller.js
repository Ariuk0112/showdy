const asyncHandler = require("../../middleware/asyncHandler");
const myError = require("../../utils/myError");
const path = require("path");
const fs = require("fs");
const isEmpty = require("is-empty");
const carType = require("../../models/carType");
const carFactory = require("../../models/carFactory");
const carMark = require("../../models/carMark");
module.exports = {
  show_car_factory: asyncHandler(async (req, res, next) => {
    const type = await carFactory.find();
    res.status(200).json({
      success: true,
      data: type,
    });
  }),
  create_car_factory: asyncHandler(async (req, res, next) => {
    const type = await carFactory.create(req.body);
    res.status(200).json({
      success: true,
      data: type,
    });
  }),
  delete_car_factory: asyncHandler(async (req, res, next) => {
    const type = await carFactory.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: type,
    });
  }),

  create_carMark: asyncHandler(async (req, res, next) => {
    const mark = await carMark.create(req.body);
    let data = {};
    if (req.files) {
      const image = req.files.img;
      image.name = `/tma/uploads/carMark/photo_${mark._id}${
        path.parse(image.name).ext
      }`;
      let str1 = image.name.split("/").pop();
      data.img = image.name;
      image.mv(`${process.env.CARMARK_FILE_UPLOAD_PATH}/${str1}`, (err) => {
        if (err) {
          throw new myError(
            "Файл хуулах явцад алдаа гарлаа :" + err.message,
            400
          );
        }
      });
    }

    item = await carMark.findByIdAndUpdate(mark._id, data, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: item,
    });
  }),
  show_carMark: asyncHandler(async (req, res, next) => {
    const mark = await carMark
      .find({}, { _id: 1, carType: 1, carFactory: 1, carMark: 1 })
      .populate({
        path: "carType carFactory",
        select: { carType: 1, factory: 1, type: 1 },
      });
    res.status(200).json({
      success: true,
      data: mark,
    });
  }),
  show_one_carMark: asyncHandler(async (req, res, next) => {
    const type = await carMark
      .findById({ _id: req.params.id }, { carType: 1, carFactory: 1 })
      .populate({
        path: "carType carFactory",

        select: { carType: 1, factory: 1, type: 1 },
      });
    res.status(200).json({
      success: true,
      count: type.length,
      data: type,
    });
  }),
  delete_carMark: asyncHandler(async (req, res, next) => {
    const mark = await carMark.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: mark,
    });
  }),
  create_carType: asyncHandler(async (req, res, next) => {
    const type = await carType.create(req.body);
    res.status(200).json({
      success: true,
      data: type,
    });
  }),
  show_carType: asyncHandler(async (req, res, next) => {
    const type = await carType.find({}, { id: 1, carType: 1, type: 1 });
    res.status(200).json({
      success: true,
      data: type,
    });
  }),
  delete_carType: asyncHandler(async (req, res, next) => {
    const type = await carType.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: type,
    });
  }),
};
