import asyncHandler from "./asyncHandler";
import jwt from "jsonwebtoken";
const tokenHandler = asyncHandler(async (req, res, next) => {
  if (!req.headers.authorization) throw Error("Not authorizartion");
  const token = req.headers.authorization.split(" ")[1];
  if (!token) throw Error("Not authorizartion");
  const tokenObj = jwt.verify(token, process.env.SECRET);
  console.log("tokenObj", tokenObj);
  req.user = tokenObj;
  next();
});
module.exports = tokenHandler;
