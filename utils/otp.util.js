const request = require("request");
const querystring = require("querystring");
exports.generateOTP = (otp_length) => {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < otp_length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

exports.message = (phone, otp) => {
  const parameters = {
    key: process.env.API_KEY,
    from: 72220222,
    to: phone,
    text: `ТМА Баталгаажуулах код : ${otp}`,
  };

  const get_request_args = querystring.stringify(parameters);

  const options = {
    url: "https://api.messagepro.mn/send?" + get_request_args,
    json: true,
  };

  request.get(options, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(`Status: ${res.statusCode}`);
    console.log(body);
  });
};
