import User from "../User/user.schema.js";
import { generateTokens, verifyToken } from "./tokens.js";
import { authenticateWithGoogle } from "./googleAuthService.js";
import { sendEmail } from "../email/emailService.js";
import {
  AppError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "./errors.js";
import Joi from "joi";

const sanitizeUser = (user) => user.toJSON();

const sendVerificationEmail = async (user, otp) => {
  await sendEmail({
    to: user.email,
    subject: "Boro Bazar - Verify Your Email",
    html: `<h2>Welcome to Boro Bazar!</h2>
           <p>Hello ${user.name},</p>
           <p>Your OTP code: <strong>${otp}</strong></p>
           <p>Expires in 10 minutes.</p>`,
  });
};

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  name: Joi.string().min(2).max(50).required(),
});

export const register = async ({ name, email, password }) => {
  const { error, value } = registerSchema.validate({ name, email, password });
  if (error) throw new ValidationError(error.details[0].message);

  const normalizedEmail = value.email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser?.authProvider === "google")
    throw new ConflictError("Email registered with Google");
  if (existingUser) throw new ConflictError("Email already registered");

  let user;
  try {
    user = await User.create({ name, email: normalizedEmail, password, authProvider: "local" });
    const otp = user.generateOTP();
    await user.save();
    await sendVerificationEmail(user, otp);
  } catch (err) {
    if (user) await User.deleteOne({ _id: user._id });
    throw new AppError("Registration failed: " + err.message, 500, "REGISTER_FAIL");
  }

  const tokens = generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { ...sanitizeUser(user), ...tokens };
};

export const login = async ({ email, password, name }) => {
  const { error, value } = loginSchema.validate({ email, password, name });
  if (error) throw new ValidationError(error.details[0].message);

  const normalizedEmail = value.email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || user.authProvider === "google")
    throw new AuthenticationError("Invalid email or password");
  if (!user.password) throw new AuthenticationError("Invalid email or password");

  if (user.name !== name)
    throw new AuthenticationError("Invalid email or password");

  const isValid = await user.comparePassword(password);
  if (!isValid) throw new AuthenticationError("Invalid email or password");

  user.lastLogin = new Date();
  const tokens = generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { ...sanitizeUser(user), ...tokens };
};

export const refreshTokens = async ({ refreshToken }) => {
  if (!refreshToken) throw new AppError("Refresh token required", 400, "TOKEN_REQUIRED");

  let decoded;
  try {
    decoded = verifyToken(refreshToken, "refresh");
  } catch (error) {
    throw new AuthenticationError("Invalid refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AuthenticationError("User not found");

  if (user.refreshToken !== refreshToken) {
    throw new AuthenticationError("Refresh token mismatch");
  }

  user.refreshToken = null;
  await user.save();

  const tokens = generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return tokens;
};

export const logout = async (userId) => {
  await User.clearRefreshToken(userId);
};

export const googleLogin = async ({ idToken }) => {
  return await authenticateWithGoogle(idToken);
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  return sanitizeUser(user);
};

export const changePassword = async (userId, { currentPassword, password }) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  if (user.authProvider === "google")
    throw new AppError("Cannot change Google account password", 400, "OAUTH_ACCOUNT");

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) throw new AuthenticationError("Current password is incorrect");

  user.password = password;
  user.refreshToken = null;
  await user.save();

  return { message: "Password changed successfully" };
};
