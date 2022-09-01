const asyncHandler = require("../../middleware/asyncHandler");
const myError = require("../../utils/myError");
const Cars = require("../../models/car");
const path = require("path");
const fs = require("fs");
const isEmpty = require("is-empty");
const isempty = require("isempty");
const { query } = require("express");
const price = require("../../models/price");
module.exports = {
  create_car: asyncHandler(async (req, res, next) => {
    let car;
    let data = {
      image: [],
    };
    car = await Cars.create(req.body);
    if (req.files) {
      if (req.files.image) {
        const files = [].concat(req.files.image);

        //handling passport images
        for (i = 0; i < files.length; i++) {
          files[i].name = `/tma/uploads/cars/photo_${car._id}_${i}${
            path.parse(files[i].name).ext
          }`;
          data.image.push({ img: files[i].name, ordern: i });
          let str = files[i].name.split("/").pop();
          files[i].mv(`${process.env.CARS_FILE_UPLOAD_PATH}/${str}`, (err) => {
            if (err) {
              throw new myError(
                "Файл хуулах явцад алдаа гарлаа :" + err.message,
                400
              );
            }
          });
        }
      }
      if (req.files.certificateImg) {
        const image = req.files.certificateImg;
        image.name = `/tma/uploads/cars/certificate_${car._id}${
          path.parse(image.name).ext
        }`;
        let prices = {};
        let str1 = image.name.split("/").pop();
        data.certificateImg = image.name;
        image.mv(`${process.env.CARS_FILE_UPLOAD_PATH}/${str1}`, (err) => {
          if (err) {
            throw new myError(
              "Файл хуулах явцад алдаа гарлаа :" + err.message,
              400
            );
          }
        });
      }
      const price = await Cars.aggregate([
        {
          $match: {
            _id: car._id,
          },
        },
        {
          $lookup: {
            from: "prices",
            let: {
              car_manufactured: "$manufactured",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$$car_manufactured", "$manufactured"],
                  },
                },
              },
            ],
            as: "results",
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ["$results", 0],
                },
                "$$ROOT",
              ],
            },
          },
        },
        {
          $project: {
            rentalPricePerDayWithDriver: 1,
            rentalPricePerDayWithDriverExtraTime: 1,
            rentalPricePerDay: 1,
            rentalPricePerDayExtraTime: 1,
            rentalPricePerHourWithDriver: 1,
            rentalPricePerHour: 1,
            totalDays: {
              $dateDiff: {
                startDate: "$avalaibleStartDate",
                endDate: "$avalaibleEndDate",
                unit: "day",
              },
            },
            totalHour: {
              $dateDiff: {
                startDate: "$avalaibleStartDate",
                endDate: "$avalaibleEndDate",
                unit: "hour",
              },
            },
          },
        },
      ]);
      data.totalRentalDay = price[0].totalDays;
      data.totalRentalPriceDayWithDriver =
        parseInt(price[0].rentalPricePerDayWithDriver) * price[0].totalDays;
      data.totalRentalPricePerDay =
        parseInt(price[0].rentalPricePerDay) * price[0].totalDays;
      data.totalRentalPricePerHourWithDriver =
        parseInt(price[0].rentalPricePerHourWithDriver) * price[0].totalHour;
      data.totalRentalPricePerHour =
        parseInt(price[0].rentalPricePerHour) * price[0].totalHour;
      prices = price[0];
      car = await Cars.findByIdAndUpdate(car._id, data, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  }),
  show_cars: asyncHandler(async (req, res, next) => {
    let query;
    const driver = req.query.isDriver || 0;
    const carStatus = req.query.carStatus || 0;
    if (req.params.factoryId) {
      if (req.params.factoryId && req.params.typeId) {
        query = Cars.find({
          carFactory: req.params.factoryId,
          carType: req.params.typeId,
          carDriver: driver,
          carStatus: carStatus,
        }).populate({
          path: "userId carFactory carType carMark",
          select: {
            passportImg: 1,
            passportExpireDate: 1,
            driverLicenseImg: 1,
            carType: 1,
            factory: 1,
            carMark: 1,
            type: 1,
            userId: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            phone: 1,
            passportExpireDate: 1,
          },
        });
      } else if (req.params.factoryId) {
        let driver = req.query.isDriver;
        query = Cars.find({
          carDriver: driver,
          carStatus: carStatus,
        }).populate({
          path: "userId carFactory carType carMark",
          select: {
            passportImg: 1,
            passportExpireDate: 1,
            driverLicenseImg: 1,
            carType: 1,
            factory: 1,
            carMark: 1,
            type: 1,
            userId: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            phone: 1,
            passportExpireDate: 1,
          },
        });
      }
    } else {
      query = Cars.find({
        carDriver: driver,
        carStatus: carStatus,
      }).populate({
        path: "userId carFactory carType carMark",
        select: {
          passportImg: 1,
          passportExpireDate: 1,
          driverLicenseImg: 1,
          carType: 1,
          factory: 1,
          carMark: 1,
          type: 1,
          userId: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          passportExpireDate: 1,
        },
      });
    }
    let total = await query;
    total = total.length;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort;

    ["sort", "page", "limit", "isDriver"].forEach((el) => delete req.query[el]);

    const pageCount = Math.ceil(total / limit);
    const start = (page - 1) * limit + 1;
    let end = start + limit - 1;
    if (end > total) end = total;

    const pagination = { total, pageCount, start, end };

    if (page < pageCount) pagination.nextPage = page + 1;
    if (page > 1) pagination.prevPage = page - 1;

    const cars = await query
      .clone()
      .sort(sort)
      .skip(start - 1)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
      pagination,
    });
  }),
  show_one_car: asyncHandler(async (req, res, next) => {
    const item = await Cars.findById(req.params.id).populate({
      path: "userId carFactory carType carMark",
      select: {
        carType: 1,
        factory: 1,
        type: 1,
        userId: 1,
        firstName: 1,
        lastName: 1,
      },
    });
    res.status(200).json({
      success: true,
      data: item,
    });
  }),
  approve_car: asyncHandler(async (req, res, next) => {
    let approve;
    const aa = req.query.approved;
    const item = await Cars.findById(req.params.id);
    if (!item) {
      throw new myError(`${req.params.id} тай машин байхгүй байна`, 400);
    }
    approve = await Cars.findByIdAndUpdate(
      item._id,
      { $set: { carStatus: aa } },
      {
        new: true,
        runValidators: true,
        upsert: true,
      }
    );
    res.status(200).json({
      success: true,
      data: approve,
    });
  }),
  update_car: asyncHandler(async (req, res, next) => {
    let car;
    const item = await Cars.findById(req.params.id);
    let data = req.body;
    if (item) {
      if (req.files) {
        if (req.files.image) {
          const file = req.files.image;
          str = req.body.image.split("/").pop();
          fs.unlink(`${process.env.CARS_FILE_UPLOAD_PATH}/${str}`, (err) => {
            if (err) {
              throw new myError(
                "Файл устгах явцад алдаа гарлаа :" + err.message,
                400
              );
            }
          });

          file.mv(`${process.env.CARS_FILE_UPLOAD_PATH}/${str}`, (err) => {
            if (err) {
              throw new myError(
                "Файл хуулах явцад алдаа гарлаа :" + err.message,
                400
              );
            }
          });
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
  delete_cars: asyncHandler(async (req, res, next) => {
    const cars = await Cars.findByIdAndRemove(req.params.id);
    if (!cars) {
      throw new myError(`${req.params.id} тай зураг байхгүй байна`, 400);
    }

    for (i = 0; i < cars.image.length; i++) {
      let str = cars.image[i].img.split("/").pop();
      fs.unlink(`${process.env.CARS_FILE_UPLOAD_PATH}/${str}`, (err) => {
        if (err) {
          throw new myError(
            "Файл устгах явцад алдаа гарлаа :" + err.message,
            400
          );
        }
      });
    }

    let str1 = cars.certificateImg.split("/").pop();

    fs.unlink(`${process.env.CARS_FILE_UPLOAD_PATH}/${str1}`, (err) => {
      if (err) {
        throw new myError(
          "Файл устгах явцад алдаа гарлаа :" + err.message,
          400
        );
      }
    });

    res.status(200).json({
      success: true,
      data: cars,
    });
  }),
};
