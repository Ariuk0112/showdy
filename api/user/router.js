const router = require("express").Router();
const { auth } = require("../auth/controller");

const {
  show_user_details,
  show_all_user_details,
  create_user_details,
  update_user,
} = require("./controller");

router.get("/", auth, show_all_user_details);
router.get("/:id", show_user_details);
router.post("/", auth, create_user_details);
router.put("/:id", auth, update_user);
router.delete("/:id", show_all_user_details);

module.exports = router;
