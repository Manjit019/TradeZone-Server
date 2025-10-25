import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "../errors/index.js";

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Authentication invalid");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.SOCKET_TOKEN_SECRET);
    req.user = { userId: payload.userId, email: payload.email,name : payload?.name };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication Failed");
  }
};


export default auth;