import jwt from "jsonwebtoken";

const ACCESS_EXPIRY = process.env.JWT_EXPIRE || "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRE || "7d";

const accessSecret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error("CRITICAL: JWT secrets must be defined in environment variables");
}

export const generateTokens = (user) => {
  const payload = { id: user._id, role: user.role };

  return {
    accessToken: jwt.sign({ ...payload, type: "access" }, accessSecret, { expiresIn: ACCESS_EXPIRY }),
    refreshToken: jwt.sign({ ...payload, type: "refresh" }, refreshSecret, { expiresIn: REFRESH_EXPIRY }),
    expiresIn: ACCESS_EXPIRY,
  };
};

export const verifyToken = (token, type = "access") => {
  const secret = type === "access" ? accessSecret : refreshSecret;

  try {
    const decoded = jwt.verify(token, secret);
    if (decoded.type !== type) {
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const err = new Error(`${type} token expired`);
      err.name = "TokenExpiredError";
      throw err;
    }
    throw new Error("Invalid token");
  }
};

export const decodeToken = (token) => jwt.decode(token);