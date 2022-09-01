const asyncHandler = require("../../middleware/asyncHandler");
const myError = require("../../utils/myError");
const Users = require("../../models/users");
const path = require("path");
const fs = require("fs");
const isEmpty = require("is-empty");
module.exports = {
  create_user_details: asyncHandler(async (req, res, next) => {
    const files = [].concat(req.files.passportImg);
    let {
      phone,
      firstName,
      lastName,
      email,
      address,
      role,
      passportExpireDate,
      driverLicenseExpireDate,
      driverLicenseNumber,
      ContractNumber,
    } = req.body;
    const license = [].concat(req.files.driverLicenseImg);
    let item = await Users.findOne({ phone });
    if (!item) {
      res.status(200).json({
        success: false,
        data: item,
      });
    }
    let data = {
      passportImg: [],
      driverLicenseImg: [],
      firstName,
      lastName,
      email,
      address,
      role,
      passportExpireDate,
      driverLicenseExpireDate,
      driverLicenseNumber,
      ContractNumber,
    };

    //handling passport images
    for (i = 0; i < files.length; i++) {
      files[i].name = `/tma/uploads/users/passport/photo_${item._id}_${i}${
        path.parse(files[i].name).ext
      }`;
      data.passportImg.push({ img: files[i].name, porder: req.body.porder });
      let str = files[i].name.split("/").pop();
      files[i].mv(
        `${process.env.USER_PASSPORT_IMG_UPLOAD_PATH}/${str}`,
        (err) => {
          if (err) {
            throw new myError(
              "Файл хуулах явцад алдаа гарлаа :" + err.message,
              400
            );
          }
        }
      );
    }
    //handling driver license images
    for (i = 0; i < license.length; i++) {
      license[i].name = `/tma/uploads/users/driverLicense/photo_${
        item._id
      }_${i}${path.parse(license[i].name).ext}`;
      data.driverLicenseImg.push({
        img: license[i].name,
        dlorder: req.body.dlorder,
      });
      let str1 = license[i].name.split("/").pop();
      license[i].mv(
        `${process.env.USER_DRIVER_LICENSE_IMG_UPLOAD_PATH}/${str1}`,
        (err) => {
          if (err) {
            throw new myError(
              "Файл хуулах явцад алдаа гарлаа :" + err.message,
              400
            );
          }
        }
      );
    }

    const user = await Users.findByIdAndUpdate(item._id, data, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: user,
    });
  }),
  show_all_user_details: asyncHandler(async (req, res, next) => {
    const item = await Users.find();
    res.status(200).json({
      success: true,
      data: item,
    });
  }),
  show_user_details: asyncHandler(async (req, res, next) => {
    const item = await Users.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: item,
    });
  }),
  update_user: asyncHandler(async (req, res, next) => {
    let user;
    const item = await Users.findById(req.params.id);
    let data = req.body;
    if (item) {
      if (req.files) {
        if (req.files.passportImg) {
          const file = req.files.passportImg;
          str = req.body.passportImg.split("/").pop();
          fs.unlink(
            `${process.env.USER_PASSPORT_IMG_UPLOAD_PATH}/${str}`,
            (err) => {
              if (err) {
                throw new myError(
                  "Файл устгах явцад алдаа гарлаа :" + err.message,
                  400
                );
              }
            }
          );

          file.mv(
            `${process.env.USER_PASSPORT_IMG_UPLOAD_PATH}/${str}`,
            (err) => {
              if (err) {
                throw new myError(
                  "Файл хуулах явцад алдаа гарлаа :" + err.message,
                  400
                );
              }
            }
          );
        }
        if (req.files.driverLicenseImg) {
          const file1 = req.files.driverLicenseImg;
          str = req.body.driverLicenseImg.split("/").pop();
          fs.unlink(
            `${process.env.USER_DRIVER_LICENSE_IMG_UPLOAD_PATH}/${str}`,
            (err) => {
              if (err) {
                throw new myError(
                  "Файл устгах явцад алдаа гарлаа :" + err.message,
                  400
                );
              }
            }
          );

          file1.mv(
            `${process.env.USER_DRIVER_LICENSE_IMG_UPLOAD_PATH}/${str}`,
            (err) => {
              if (err) {
                throw new myError(
                  "Файл хуулах явцад алдаа гарлаа :" + err.message,
                  400
                );
              }
            }
          );
        }

        user = await Users.findByIdAndUpdate(item._id, data, {
          new: true,
          runValidators: true,
        });
        res.status(200).json({
          success: true,
          data: user,
        });
      } else {
        user = await Users.findByIdAndUpdate(item._id, data, {
          new: true,
          runValidators: true,
        });
        res.status(200).json({
          success: true,
          data: user,
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
