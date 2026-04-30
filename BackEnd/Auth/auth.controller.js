import * as authService from "./auth.service.js";
import * as otpService from "./otpService.js";
import { catchAsync, sendSuccess, AppError } from "./errors.js";

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge,
});

const setTokenCookies = (res, { accessToken, refreshToken }) => {
  res.cookie("accessToken", accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
  res.cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));
};

const clearTokenCookies = (res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
};

const sendTokenResponse = (res, userWithTokens, message, statusCode = 200) => {
  const { accessToken, refreshToken, ...user } = userWithTokens;
  setTokenCookies(res, { accessToken, refreshToken });
  sendSuccess(res, { user }, message, statusCode);
};

export const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  sendTokenResponse(res, result, "Registration successful. Please verify your email.", 201);
});

export const login = catchAsync(async (req, res) => {
  const { email, password, name } = req.body;
  const result = await authService.login({ email, password, name });
  sendTokenResponse(res, result, "Login successful");
});

export const refreshTokens = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw new AppError("Refresh token required", 400, "TOKEN_REQUIRED");

  const tokens = await authService.refreshTokens({ refreshToken });
  setTokenCookies(res, tokens);

  sendSuccess(res, null, "Tokens refreshed");
});

export const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user.id);
  clearTokenCookies(res);
  sendSuccess(res, null, "Logged out successfully");
});

export const verifyEmail = catchAsync(async (req, res) => {
  const result = await otpService.verifyEmail(req.body);
  sendSuccess(res, result);
});

export const googleAuth = catchAsync(async (req, res) => {
  const result = await authService.googleLogin(req.body);
  sendTokenResponse(res, result, "Google authentication successful");
});

export const getProfile = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  sendSuccess(res, user);
});

export const changePassword = catchAsync(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);
  sendSuccess(res, result);
});

export const forgotPassword = catchAsync(async (req, res) => {
  const result = await otpService.requestReset(req.body);
  sendSuccess(res, result);
});

export const verifyOtp = catchAsync(async (req, res) => {
  const result = await otpService.verifyOtp(req.body);
  sendSuccess(res, result);
});

export const resetPassword = catchAsync(async (req, res) => {
  const result = await otpService.reset(req.body);
  sendSuccess(res, result);
});