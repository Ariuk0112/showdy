const Auction = require("../../models/auction");
const asyncHandler = require("../../middleware/asyncHandler");
const myError = require("../../utils/myError");
const path = require("path");
const fs = require("fs");
const isEmpty = require("is-empty");
module.exports = {
  create_auction: asyncHandler(async (req, res, next) => {
    let car;
    let data = {
      image: [],
    };
    car = await Auction.create(req.body);
    if (req.files) {
      if (req.files.image) {
        const files = [].concat(req.files.image);

        //handling 360 images
        for (i = 0; i < files.length; i++) {
          files[i].name = `/tma/uploads/auction/photo_${car._id}_${i}${
            path.parse(files[i].name).ext
          }`;
          data.image.push({ img: files[i].name, ordern: i });
          let str = files[i].name.split("/").pop();
          files[i].mv(
            `${process.env.AUCTION_FILE_UPLOAD_PATH}/${str}`,
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
      }
      if (req.files.headImg) {
        const image = req.files.headImg;
        image.name = `/tma/uploads/auction/photo_${car._id}${
          path.parse(image.name).ext
        }`;
        let str1 = image.name.split("/").pop();
        data.headImg = image.name;
        image.mv(`${process.env.AUCTION_FILE_UPLOAD_PATH}/${str1}`, (err) => {
          if (err) {
            throw new myError(
              "Файл хуулах явцад алдаа гарлаа :" + err.message,
              400
            );
          }
        });
      }

      car = await Auction.findByIdAndUpdate(car._id, data, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  }),
  show_auctions: asyncHandler(async (req, res, next) => {
    let query;
    query = Auction.find();

    let total = await query;
    total = total.length;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort;

    ["sort", "page", "limit"].forEach((el) => delete req.query[el]);

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
  show_one_auction: asyncHandler(async (req, res, next) => {
    const item = await Auction.findById(req.params.id);
    if (!item) {
      throw new myError(`${req.params.id} тай зураг байхгүй байна`, 400);
    }
    res.status(200).json({
      success: true,
      data: item,
    });
  }),
  update_car: asyncHandler(async (req, res, next) => {
    let auction, query;
    const item = await Auction.findById(req.params.id);
    let data = req.body;
    if (item) {
      if (req.files) {
        if (req.files.headImg) {
          const file = req.files.headImg;
          str = req.body.headImg.split("/").pop();
          fs.unlink(`${process.env.AUCTION_FILE_UPLOAD_PATH}/${str}`, (err) => {
            if (err) {
              throw new myError(
                "Файл устгах явцад алдаа гарлаа :" + err.message,
                400
              );
            }
          });

          file.mv(`${process.env.AUCTION_FILE_UPLOAD_PATH}/${str}`, (err) => {
            if (err) {
              throw new myError(
                "Файл хуулах явцад алдаа гарлаа :" + err.message,
                400
              );
            }
          });
        }

        auction = await Auction.findByIdAndUpdate(item._id, data, {
          new: true,
          runValidators: true,
        });
        res.status(200).json({
          success: true,
          data: auction,
        });
      } else {
        auction = await Auction.findByIdAndUpdate(item._id, data, {
          new: true,
          runValidators: true,
        });
        res.status(200).json({
          success: true,
          data: auction,
        });
      }
    } else {
      res.status(200).json({
        success: false,
        data: item,
      });
    }
  }),
  delete_auction: asyncHandler(async (req, res, next) => {
    const auction = await Auction.findByIdAndRemove(req.params.id);
    if (!auction) {
      throw new myError(`${req.params.id} тай зураг байхгүй байна`, 400);
    }

    for (i = 0; i < auction.image.length; i++) {
      let str = auction.image[i].img.split("/").pop();
      fs.unlink(`${process.env.AUCTION_FILE_UPLOAD_PATH}/${str}`, (err) => {
        if (err) {
          throw new myError(
            "Файл устгах явцад алдаа гарлаа :" + err.message,
            400
          );
        }
      });
    }

    let str1 = auction.headImg.split("/").pop();

    fs.unlink(`${process.env.AUCTION_FILE_UPLOAD_PATH}/${str1}`, (err) => {
      if (err) {
        throw new myError(
          "Файл устгах явцад алдаа гарлаа :" + err.message,
          400
        );
      }
    });

    res.status(200).json({
      success: true,
      data: auction,
    });
  }),
};
