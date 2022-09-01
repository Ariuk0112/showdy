const express = require("express");
const { authAdmin } = require("../admin/auth/controller");
const { auth } = require("../auth/controller");

const {
  show_cars,
  create_car,
  delete_cars,
  show_one_car,
  approve_car,
} = require("./controller");
const router = express.Router({ mergeParams: true });
router.get("/", show_cars);
router.get("/:id", show_one_car);
router.post("/", auth, create_car);
router.post("/approve/:id", authAdmin, approve_car);
router.put("/:id", authAdmin);
router.delete("/:id", authAdmin, delete_cars);
module.exports = router;
