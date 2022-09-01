const Notification = require("../../models/notification");
const asyncHandler = require("../../middleware/asyncHandler");
const myError = require("../../utils/myError");
const path = require("path");
const fs = require("fs");
const isEmpty = require("is-empty");
module.exports = {
  create_notification: asyncHandler(async (req, res, next) => {
    let item = await Notification.create(req.body);

    res.status(200).json({
      success: true,
      data: item,
    });
  }),
  show_notif: asyncHandler(async (req, res, next) => {
    const item = await Notification.find();
    res.status(200).json({
      success: true,
      data: item,
    });
  }),

  update_coWorker: asyncHandler(async (req, res, next) => {
    let logo;
    const item = await CoWorker.findById(req.params.id);
    let data = req.body;
    if (item) {
      if (req.files) {
        const file = req.files.coWorkerLogo;
        file.name = `/tma/uploads/coWorker/photo_${req.params.id}${
          path.parse(file.name).ext
        }`;
        str = item.coWorkerLogo.split("/").pop();
        req.body.coWorkerLogo = file.name;
        fs.unlink(`${process.env.COWORKER_FILE_UPLOAD_PATH}/${str}`, (err) => {
          if (err) {
            throw new myError(
              "Файл устгах явцад алдаа гарлаа :" + err.message,
              400
            );
          }
        });
        str1 = file.name.split("/").pop();
        file.mv(`${process.env.COWORKER_FILE_UPLOAD_PATH}/${str1}`, (err) => {
          if (err) {
            throw new myError(
              "Файл хуулах явцад алдаа гарлаа :" + err.message,
              400
            );
          }
        });

        logo = await CoWorker.findByIdAndUpdate(item._id, data, {
          new: true,
          runValidators: true,
        });
        res.status(200).json({
          success: true,
          data: logo,
        });
      } else {
        logo = await CoWorker.findByIdAndUpdate(item._id, data, {
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
  delete_coWorker: asyncHandler(async (req, res, next) => {
    const logo = await CoWorker.findByIdAndRemove(req.params.id);
    if (!logo) {
      throw new myError(`${req.params.id} тай зураг байхгүй байна`, 400);
    }

    str = logo.coWorkerLogo.split("/").pop();
    fs.unlink(`${process.env.COWORKER_FILE_UPLOAD_PATH}/${str}`, (err) => {
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
