const router = require("express").Router();
const { auth } = require("../auth/controller");

const {
  show_auctions,
  create_auction,
  show_one_auction,
  delete_auction,
} = require("./controller");

router.get("/", show_auctions);
router.post("/", auth, create_auction);
router.put("/:id", auth);
router.get("/:id", show_one_auction);
router.delete("/:id", delete_auction);
module.exports = router;
