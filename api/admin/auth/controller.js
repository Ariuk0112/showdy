const jwt = require("jsonwebtoken");
const empty = require("is-empty");
const md5 = require("md5");
const asyncHandler = require("../../../middleware/asyncHandler");
const User = require("../../../models/users");
const Admin = require("../../../models/admin");

function auth(req, res, next) {
  const header = req.headers["authorization"];
  // console.log(req.headers)
  const token = header && header.split(" ")[1];

  if (token == null)
    return res.status(401).json({
      success: 0,
      message: "token is null",
    });

  jwt.verify(token, process.env.ACCESS_TOKEN_ADMIN, (err, data) => {
    if (err)
      return res.status(401).json({
        success: 0,
        message: err.message,
      });
    console.log("admin");
    req.data = data;
    next();
  });
}

module.exports = {
  authAdmin: auth,
  check: (req, res) => {
    res.json({
      success: 1,
      data: req.data,
    });
  },
  login: asyncHandler(async (req, res, next) => {
    const book = await Book.findById(req.params.id).populate("category");

    if (!book) {
      throw new myError(req.params.id + "ID-тэй ном байхгүй байна", 404);
    }
    res.status(200).json({
      success: true,
      data: book,
    });
  }),
  login: asyncHandler(async (req, res) => {
    let { username, password } = req.body;
    if (empty(username) || empty(password))
      throw new Error("Хэрэглэгчийн нэр эсвэл утасны дугаараа оруулна уу.!!!");
    let item = await User.findOne({ username, password }).lean();
    if (!item)
      return res.json({ success: false, message: "Мэдээлэл олдсонгүй.!" });
    const accessToken = jwt.sign(
      {
        user_id: item._id,
      },
      process.env.SECRET,
      process.env.EXRPIRE
    );

    return res.json({
      success: true,
      user_id: item._id,
      accessToken: accessToken,
    });
  }),
};
