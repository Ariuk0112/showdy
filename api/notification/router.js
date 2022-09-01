const router = require("express").Router();
const { auth } = require("../auth/controller");

const {
  show_coWorker,
  create_coWorker,
  update_coWorker,
  delete_coWorker,
} = require("./controller");

router.get("/", show_coWorker);
router.post("/", auth, create_coWorker);
router.put("/:id", auth, update_coWorker);
router.delete("/:id", delete_coWorker);

module.exports = router;
