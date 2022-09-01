const asyncHandler = require("../../middleware/asyncHandler");
const myError = require("../../utils/myError");
const Car1 = require("../../models/car");
const carMark = require("../../models/carMark");
const path = require("path");
const fs = require("fs");
const isEmpty = require("is-empty");
const isempty = require("isempty");
const DateDiff = require("diff-dates");
const Prices = require("../../models/price");
const Orders = require("../../models/order");
module.exports = {
  create_order: asyncHandler(async (req, res, next) => {
    const car = await Car1.findById(req.params.id);
    if (!car) {
      return res.status(201).json({
        success: false,
        message: "Зөв ID оруулна уу !",
      });
    }
    let info = req.body;
    let { startDate, EndDate, carDriver, userId } = req.body;
    startDate = new Date(startDate);
    EndDate = new Date(EndDate);
    if (
      startDate < car.avalaibleStartDate ||
      startDate >= car.avalaibleEndDate ||
      EndDate < car.avalaibleStartDate ||
      EndDate > car.avalaibleEndDate
    ) {
      return res.status(201).json({
        success: false,
        message: "Зөв он сар оруулна уу !",
      });
    }
    info.orderStartDate = startDate;
    info.orderEndDate = EndDate;
    info.userId = userId;
    let diff = DateDiff(EndDate, startDate, "days");
    info.balancePaymentDate = EndDate;
    const price = await Car1.aggregate([
      {
        $match: {
          _id: car._id,
        },
      },
      {
        $lookup: {
          from: "prices",
          let: {
            car_manufactured_date: "$manufactured",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$car_manufactured_date", "$manufactured"],
                },
              },
            },
          ],
          as: "result",
        },
      },

      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$result", 0],
              },
              "$$ROOT",
              {
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
            ],
          },
        },
      },
      {
        $project: {
          result: 0,
        },
      },
    ]);
    info.price = price[0];
    info.carId = car._id;
    if ((price.carDriver = 1)) {
      if (carDriver == 0) {
        info.totalPayment =
          parseInt(price[0].rentalPricePerDay) * parseInt(diff);
        info.prePayment = (info.totalPayment * 30) / 100;
        info.balancePayment = info.totalPayment - info.prePayment;
        console.log("driver false 1");
      }
      info.totalPayment = parseInt(price[0].rentalPricePerDayWithDriver) * diff;
      info.prePayment = (info.totalPayment * 30) / 100;
      info.balancePayment = info.totalPayment - info.prePayment;
    } else {
      info.totalPayment = parseInt(price[0].rentalPricePerDay) * parseInt(diff);
      info.prePayment = (info.totalPayment * 30) / 100;
      info.balancePayment = info.totalPayment - info.prePayment;
      console.log("driver false");
    }

    info.status = 0;
    const order = await Orders.create(info);
    res.status(200).json({
      success: true,
      data: order,
    });
  }),

  show_orders: asyncHandler(async (req, res, next) => {
    const driver = req.query.isDriver || "0";
    const status = req.query.status || "0";
    const cars1 = await Orders.aggregate([
      {
        $match: {
          status: status,
        },
      },
      {
        $lookup: {
          from: "cars",
          localField: "carId",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$result", 0],
              },
              "$$ROOT",
            ],
          },
        },
      },
      {
        $unwind: {
          path: "$result",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
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
        $unwind: {
          path: "$results",
        },
      },
      {
        $project: {
          results: 0,
          result: 0,
        },
      },
      {
        $lookup: {
          from: "carmarks",
          localField: "carMark",
          foreignField: "_id",
          as: "carMark",
        },
      },
      {
        $lookup: {
          from: "carfactories",
          localField: "carFactory",
          foreignField: "_id",
          as: "carFactory",
        },
      },
      {
        $lookup: {
          from: "cartypes",
          localField: "carType",
          foreignField: "_id",
          as: "carType",
        },
      },
      {
        $match: {
          carDriver: driver,
        },
      },
      {
        $sort: {
          createDate: -1,
        },
      },
    ]);
    let total = cars1.length;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    ["sort", "page", "limit", "isDriver"].forEach((el) => delete req.query[el]);

    const pageCount = Math.ceil(total / limit);
    const start = (page - 1) * limit + 1;
    let end = start + limit - 1;
    if (end > total) end = total;
    let skip = start - 1;

    const pagination = { total, pageCount, start, end };

    if (page < pageCount) pagination.nextPage = page + 1;
    if (page > 1) pagination.prevPage = page - 1;

    const cars = await Orders.aggregate([
      {
        $match: {
          status: status,
        },
      },
      {
        $lookup: {
          from: "cars",
          localField: "carId",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$result", 0],
              },
              "$$ROOT",
            ],
          },
        },
      },
      {
        $unwind: {
          path: "$result",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
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
        $unwind: {
          path: "$results",
        },
      },
      {
        $project: {
          results: 0,
          result: 0,
          phoneOtp: 0,
          role: 0,
          isAccountVerified: 0,
          ContractNumber: 0,
          __v: 0,
        },
      },
      {
        $lookup: {
          from: "carmarks",
          localField: "carMark",
          foreignField: "_id",
          as: "carMark",
        },
      },
      {
        $lookup: {
          from: "carfactories",
          localField: "carFactory",
          foreignField: "_id",
          as: "carFactory",
        },
      },
      {
        $lookup: {
          from: "cartypes",
          localField: "carType",
          foreignField: "_id",
          as: "carType",
        },
      },
      {
        $match: {
          carDriver: driver,
        },
      },
      {
        $sort: {
          createDate: -1,
        },
      },
      {
        $skip: start - 1,
      },
      {
        $limit: limit,
      },
    ]);
    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
      pagination,
    });
  }),
};
