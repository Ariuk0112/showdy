const router = require("express").Router();
const { auth } = require("../auth/controller");

const {
  show_one_project,
  update_Project,
  create_project,
  show_project,
  delete_project,
} = require("./controller");

router.get("/", show_project);
router.post("/", auth, create_project);
router.put("/:id", auth, update_Project);
router.get("/:id", show_one_project);
router.delete("/:id", delete_project);
module.exports = router;
