import User from "../User/user.schema.js";
import { sendEmail } from "../email/emailService.js";
import { AppError } from "./errors.js";

const sendOtpEmail = async (user, otp) => {
  try {
    await sendEmail({
      to: user.email,
      subject: "Boro Bazar - Password Reset OTP",
      html: `<p>Your OTP: <strong>${otp}</strong></p><p>Expires in 10 minutes.</p>`,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
  }
};

export const requestReset = async ({ email }) => {
  const normalizedEmail = email?.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || user.authProvider === "google") {
    return { message: "If email exists, OTP has been sent" };
  }

  const otp = user.generateOTP();
  await user.save();
  await sendOtpEmail(user, otp);

  return { message: "If email exists, OTP has been sent" };
};

export const verifyOtp = async ({ email, otp }) => {
  const normalizedEmail = email?.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) throw new AppError("Invalid OTP or email", 400, "INVALID_OTP");

  if (!user.otp || !user.otp.code) throw new AppError("No OTP requested. Call /forgot-password first.", 400, "NO_OTP");

  if (user.otp.expiresAt < new Date()) {
    user.clearOTP();
    await user.save();
    throw new AppError("OTP expired", 400, "OTP_EXPIRED");
  }

  if (user.otp.attempts >= 3) {
    user.clearOTP();
    await user.save();
    throw new AppError("Max OTP attempts reached", 429, "OTP_MAX_ATTEMPTS");
  }

  if (user.otp.code !== otp) {
    user.otp.attempts += 1;
    await user.save();
    throw new AppError("Invalid OTP", 400, "INVALID_OTP");
  }

  user.clearOTP();
  await user.save();

  return { message: "OTP verified successfully" };
};

export const verifyEmail = async ({ email, otp }) => {
  const normalizedEmail = email?.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) throw new AppError("Invalid OTP or email", 400, "INVALID_OTP");

  if (!user.otp.code) throw new AppError("No OTP requested", 400, "NO_OTP");

  if (user.otp.expiresAt < new Date()) {
    user.clearOTP();
    await user.save();
    throw new AppError("OTP expired", 400, "OTP_EXPIRED");
  }

  if (user.otp.attempts >= 3) {
    user.clearOTP();
    await user.save();
    throw new AppError("Max OTP attempts reached", 429, "OTP_MAX_ATTEMPTS");
  }

  if (user.otp.code !== otp) {
    user.otp.attempts += 1;
    await user.save();
    throw new AppError("Invalid OTP", 400, "INVALID_OTP");
  }

  user.isVerified = true;
  user.clearOTP();
  await user.save();

  return { message: "Email verified successfully" };
};

export const reset = async ({ email, otp, password }) => {
  await verifyOtp({ email, otp });

  const normalizedEmail = email?.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  user.password = password;
  await user.save();

  return { message: "Password reset successfully" };
};
