const jwt = require("jsonwebtoken");
const mail = require("../mail");
const { generateOTP, message } = require("../../utils/otp.util");
const empty = require("is-empty");
const md5 = require("md5");
const asyncHandler = require("../../middleware/asyncHandler");
const User = require("../../models/users");
const Admin = require("../../models/admin");
function auth(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (token == null)
    return res.status(401).json({
      success: 0,
      message: "token is null",
    });

  jwt.verify(token, process.env.SECRET, (err, data) => {
    if (err) {
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
    } else {
      console.log("user");
      req.data = data;
      next();
    }
  });
}

module.exports = {
  auth: auth,
  check: (req, res) => {
    res.json({
      success: 1,
      data: req.data,
    });
  },

  createAccount: asyncHandler(async (req, res) => {
    if (req.body.username && req.body.password) {
      let admin = req.body;
      console.log(admin);
      console.log("Username", admin.username);
      admin.password = md5(admin.password);
      let item = await new Admin({
        ...admin,
      }).save();
      const accessToken = jwt.sign(
        {
          username: req.body.username,
        },
        process.env.SECRET,
        process.env.EXRPIRE
      );

      console.log(`Creating account for ${req.body.username}`);

      return res.json({
        success: 1,
        username: req.body.username,
        user_id: item._id,
        accessToken: accessToken,
      });
    } else {
      let { phone } = req.body;
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(200).json({
          success: 0,
          message: "Already exists!",
        });
      }

      const item = await new User(req.body).save();

      console.log(`Creating account for ${req.body.phone}`);
      const otp = generateOTP(6);

      item.phoneOtp = otp;
      await item.save();

      return res.status(200).json({
        success: 1,
        username: req.body.phone,
        user_id: item._id,
      });
    }
    message(user.phone, otp);
  }),
  login: asyncHandler(async (req, res) => {
    if (req.body.username && req.body.password) {
      let { username, password } = req.body;
      if (empty(username) || empty(password))
        throw new Error(
          "Хэрэглэгчийн нэр эсвэл утасны дугаараа оруулна уу.!!!"
        );
      password = md5(password);
      let item = await Admin.findOne({ username, password }).lean();
      if (!item)
        return res.json({
          success: false,
          message: "Хэрэглэгчийн нэр эсвэл нууц үг буруу байна",
        });
      const accessToken = jwt.sign(
        {
          ad_id: item._id,
        },
        process.env.ACCESS_TOKEN_ADMIN,
        { expiresIn: "300m" }
      );

      return res.json({
        success: true,
        user_id: item._id,
        username: req.body.username,
        accessToken: accessToken,
        role: "toor",
      });
    } else {
      const { phone } = req.body;
      const user = await User.findOne({ phone }).lean();
      let query;
      let data = req.body;
      // generate otp
      const otp = generateOTP(6);
      data.phoneOtp = otp;
      if (!user) {
        query = new User(data).save();
      } else {
        query = User.findOneAndUpdate(
          { phone },
          { phoneOtp: otp, isAccountVerified: true }
        );
      }
      const item = await query;
      message(phone, otp);
      res.status(200).json({
        success: true,
        message: "Баталгаажуулах код бүртгэлтэй дугаарлуу илгээгдлээ",
        data: {
          userId: item._id,
          otp: otp,
        },
      });
    }
  }),

  verifyPhoneOtp: asyncHandler(async (req, res) => {
    const { otp, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Мэдээлэл олдсонгүй !");
    }
    console.log(user.phoneOtp);
    if (user.phoneOtp !== otp) {
      throw new Error("Баталгаажуулах код буруу байна");
    }
    const accessToken = jwt.sign(
      {
        userId: req.body.user_id,
      },
      process.env.SECRET,
      { expiresIn: "120m" }
    );

    res.status(200).json({
      type: "success",
      message: "OTP verified successfully",
      data: {
        accessToken,
        userId: user._id,
        role: user.role,
      },
    });
    user.phoneOtp = "";
    await user.save();
  }),
  show: asyncHandler(async (req, res) => {
    let item = await User.find().lean();
    if (!item)
      return res.json({ success: false, message: "Мэдээлэл олдсонгүй.!" });
    return res.json({
      success: true,
      data: item,
    });
  }),
  update: asyncHandler(async (req, res) => {
    let user = req.body;
    user.password = md5(req.body.password);
    let item = await User.findById(req.params.id).lean();
    if (!item)
      return res.json({ success: false, message: "Мэдээлэл олдсонгүй.!" });
    let vol = await User.findByIdAndUpdate(req.params.id, user);
    return res.json({
      success: true,
      data: vol,
    });
  }),
  delete_user: asyncHandler(async (req, res) => {
    let item = await User.findById(req.params.id).lean();
    if (!item)
      return res.json({ success: false, message: "Мэдээлэл олдсонгүй.!" });
    let vol = await User.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      data: vol,
    });
  }),
  resetPassword: (req, res) => {
    db.query(
      "call sp_resetPassword(?)",
      [req.body.username],
      (err, results) => {
        if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
          return res.json({
            success: 0,
            message: err.message.replace("ER_SIGNAL_EXCEPTION: ", ""),
          });
        } else if (err) {
          return res.status(500).json({
            success: 0,
            message: err.message,
          });
        }

        // And now we should send new password to user
        console.log(
          `New password for ${req.body.username} => ${results[0][0].newPassword}`
        );

        // email?
        mail.sendMail({
          title: "New password",
          to: req.body.username,
          htmlPath: "password-reset.html",
          replacements: {
            username: results[0][0].acc_fname,
            newpassword: results[0][0].newPassword,
          },
        });

        return res.json({
          success: 1,
        });
      }
    );
  },
  changePassword: (req, res) => {
    db.query(
      "call sp_changepass(?,?,?)",
      [req.data.username, req.body.oldPassword, req.body.newPassword],
      (err, results) => {
        if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
          return res.json({
            success: 0,
            message: err.message.replace("ER_SIGNAL_EXCEPTION: ", ""),
          });
        } else if (err) {
          return res.status(500).json({
            success: 0,
            message: err.message,
          });
        }

        return res.json({
          success: 1,
        });
      }
    );
  },
};
