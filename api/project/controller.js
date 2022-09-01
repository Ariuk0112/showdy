const Project = require("../../models/project");
const asyncHandler = require("../../middleware/asyncHandler");
const myError = require("../../utils/myError");
const path = require("path");
const fs = require("fs");
const isEmpty = require("is-empty");
module.exports = {
  create_project: asyncHandler(async (req, res, next) => {
    const file = req.files.projectImg;
    let item = await Project.create(req.body);
    file.name = `/tma/uploads/project/photo_${item._id}${
      path.parse(file.name).ext
    }`;
    str = file.name.split("/").pop();
    file.mv(`${process.env.PROJECT_FILE_UPLOAD_PATH}/${str}`, (err) => {
      if (err) {
        throw new myError(
          "Файл хуулах явцад алдаа гарлаа :" + err.message,
          400
        );
      }
    });
    item.projectImg = file.name;
    item.save();
    res.status(200).json({
      success: true,
      data: item,
    });
  }),
  show_project: asyncHandler(async (req, res, next) => {
    const item = await Project.find();
    res.status(200).json({
      success: true,
      data: item,
    });
  }),
  show_one_project: asyncHandler(async (req, res, next) => {
    const item = await Project.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: item,
    });
  }),

  update_Project: asyncHandler(async (req, res, next) => {
    let logo;
    const item = await Project.findById(req.params.id);
    let data = req.body;
    if (item) {
      if (req.files) {
        const file = req.files.projectImg;
        file.name = `/tma/uploads/project/photo_${req.params.id}${
          path.parse(file.name).ext
        }`;
        str = item.projectImg.split("/").pop();
        req.body.projectImg = file.name;
        fs.unlink(`${process.env.PROJECT_FILE_UPLOAD_PATH}/${str}`, (err) => {
          if (err) {
            throw new myError(
              "Файл устгах явцад алдаа гарлаа :" + err.message,
              400
            );
          }
        });
        str1 = file.name.split("/").pop();
        file.mv(`${process.env.PROJECT_FILE_UPLOAD_PATH}/${str1}`, (err) => {
          if (err) {
            throw new myError(
              "Файл хуулах явцад алдаа гарлаа :" + err.message,
              400
            );
          }
        });

        logo = await Project.findByIdAndUpdate(item._id, data, {
          new: true,
          runValidators: true,
        });
        res.status(200).json({
          success: true,
          data: logo,
        });
      } else {
        logo = await Project.findByIdAndUpdate(item._id, data, {
          new: true,
          runValidators: true,
        });
        res.status(200).json({
          success: true,
          data: logo,
        });
      }
    } else {
      res.status(200).json({
        success: false,
        data: item,
      });
    }
  }),
  delete_project: asyncHandler(async (req, res, next) => {
    const logo = await Project.findByIdAndRemove(req.params.id);
    if (!logo) {
      throw new myError(`${req.params.id} тай зураг байхгүй байна`, 400);
    }

    str = logo.projectImg.split("/").pop();
    fs.unlink(`${process.env.PROJECT_FILE_UPLOAD_PATH}/${str}`, (err) => {
      if (err) {
        throw new myError(
          "Файл устгах явцад алдаа гарлаа :" + err.message,
          400
        );
      }
    });
    res.status(200).json({
      success: true,
      data: logo,
    });
  }),
};
