const router = require("express").Router();
const { auth } = require("../auth/controller");

const {
  show_car_factory,
  create_car_factory,
  delete_car_factory,
  show_carType,
  create_carType,
  delete_carType,
  show_carMark,
  create_carMark,
  delete_carMark,
  show_one_carMark,
} = require("./controller");
const carsRouter = require("../cars/router");
router.use("/:factoryId/cars", carsRouter);
router.use("/:factoryId/:typeId/cars", carsRouter);
router.get("/carFactory", show_car_factory);
router.post("/carFactory", create_car_factory);
router.delete("/carFactory/:id", delete_car_factory);

router.get("/carType", show_carType);
router.post("/carType", create_carType);
router.get("/carType/:id", show_car_factory);
router.delete("/carType/:id", delete_carType);

router.get("/carMark", show_carMark);
router.post("/carMark", create_carMark);
router.get("/carMark/:id", show_one_carMark);
router.delete("/carMark/:id", delete_carMark);
module.exports = router;
