import { verifyToken } from "../auth/tokens.js";
import User from "../User/user.schema.js";

export const protect = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = verifyToken(token, "access");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ success: false, message: "User not found" });
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

export const user = (req, res, next) => {
  if (req.user && req.user.role === "user") return next();
  res.status(403).json({ success: false, message: "Not authorized" });
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).json({ success: false, message: "Not authorized as admin" });
};
