const router = require("express").Router();
const {
  auth,
  check,
  createAccount,
  login,
  resetPassword,
  changePassword,
  show,
  update,
  delete_user,
  verifyPhoneOtp,
} = require("./controller");
router.post("/user", createAccount);
router.get("/user", show);
router.delete("/user/:id", delete_user);
router.put("/user/:id", update);
router.post("/login", login);
router.post("/verify", verifyPhoneOtp);
router.post("/reset", resetPassword);
router.post("/check", auth, check);
router.post("/update/password", auth, changePassword);

module.exports = router;
