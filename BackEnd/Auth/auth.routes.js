import express from "express";

import {
  register,
  login,
  refreshTokens,
  logout,
  verifyEmail,
  googleAuth,
  getProfile,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "./auth.controller.js";

import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

/* Auth Routes */
router.post("/signup", register);
router.post("/login", login);

router.post("/refresh-token", refreshTokens);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/google", googleAuth);

/* Protected Routes */
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile);
router.put("/change-password", protect, changePassword);

export default router;