const asyncHandler = require("../../middleware/asyncHandler");
const myError = require("../../utils/myError");
const path = require("path");
const fs = require("fs");
const isEmpty = require("is-empty");
const Price = require("../../models/price");
const Cars = require("../../models/car");
const DateDiff = require("date-diff");
module.exports = {
  show_car_price: asyncHandler(async (req, res, next) => {
    const price = await Price.find();
    res.status(200).json({
      success: true,
      data: price,
    });
  }),
  create_car_price: asyncHandler(async (req, res, next) => {
    const type = await Price.create(req.body);
    let arr = req.body.manufactured.split(",");
    let data = {
      manufactured: [],
    };
    for (i = 0; i < arr.length; i++) {
      data.manufactured.push(arr[i]);
    }
    const item = await Price.findByIdAndUpdate(type._id, data, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: item,
    });
  }),

  update_car_price: asyncHandler(async (req, res, next) => {
    const item = await Price.findById(req.params.id);
    if (!item) {
      res.status(200).json({
        success: false,
        data: "",
      });
    }
    const type = await Price.findByIdAndUpdate(item._id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: type,
    });
  }),
  get_price_with_car_id: asyncHandler(async (req, res, next) => {
    const car = await Cars.findById(req.params.id);
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
          _id: 0,
          rentalPricePerDayWithDriver: 1,
          rentalPricePerDayWithDriverExtraTime: 1,
          rentalPricePerDay: 1,
          rentalPricePerDayExtraTime: 1,
          rentalPricePerHourWithDriver: 1,
          rentalPricePerHour: 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: price[0],
    });
  }),

  
};
