const router = require("express").Router();
const { authAdmin } = require("../admin/auth/controller");
const { auth } = require("../auth/controller");

const { create_order, show_orders } = require("./controller");
router.get("/", show_orders);
router.post("/:id", authAdmin, create_order);
router.get("/:id");
router.put("/:id", authAdmin);

module.exports = router;
