const mongoose = require("mongoose");

const pool = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {});

  console.log(
    `MongoDB connected success : ${conn.connection.host}`.cyan.underline.inverse
  );
};

module.exports = pool;
