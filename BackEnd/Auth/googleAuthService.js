import { OAuth2Client } from "google-auth-library";
import User from "../User/user.schema.js";
import { generateTokens } from "./tokens.js";
import { AuthenticationError, ConflictError } from "./errors.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      profilePicture: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    console.error("Google token verification error:", error.message);
    throw new AuthenticationError("Invalid Google token");
  }
};

export const authenticateWithGoogle = async (idToken) => {
  const googleData = await verifyGoogleToken(idToken);

  if (!googleData.emailVerified) {
    throw new AuthenticationError("Please verify your Google email first");
  }

  let user = await User.findOne({ email: googleData.email });

  if (user) {
    if (user.authProvider === "local" && !user.googleId) {
      throw new ConflictError("Email already registered with password. Please login with password");
    }

    user.googleId = googleData.googleId;
    user.lastLogin = new Date();
    user.name = googleData.name;
    if (googleData.profilePicture) {
      user.profilePicture = googleData.profilePicture;
    }
    if (!user.isVerified) {
      user.isVerified = true;
    }
    await user.save();
  } else {
    user = await User.create({
      googleId: googleData.googleId,
      email: googleData.email,
      name: googleData.name,
      profilePicture: googleData.profilePicture,
      authProvider: "google",
      isVerified: true,
    });
  }

  const tokens = generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return {
    ...user.toJSON(),
    ...tokens,
  };
};

export const linkGoogleAccount = async (userId, idToken) => {
  const googleData = await verifyGoogleToken(idToken);

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const existingGoogleUser = await User.findOne({
    googleId: googleData.googleId,
    _id: { $ne: userId },
  });

  if (existingGoogleUser) {
    throw new ConflictError("This Google account is already linked to another user");
  }

  user.googleId = googleData.googleId;
  user.authProvider = "google";
  await user.save();

  return { message: "Google account linked successfully" };
};

export const unlinkGoogleAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (!user.password) {
    throw new ConflictError("Cannot unlink: No password set. Set a password first");
  }

  user.googleId = null;
  user.authProvider = "local";
  await user.save();

  return { message: "Google account unlinked successfully" };
};