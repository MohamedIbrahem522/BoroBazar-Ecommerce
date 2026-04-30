import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
    },
    profilePicture: String,
    phone: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: String,
    refreshToken: String,
    otp: {
      code: String,
      expiresAt: Date,
      attempts: { type: Number, default: 0 },
    },
    passwordChangedAt: Date,
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
});

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateOTP = function () {
  const code = (crypto.randomInt(0, 900000) + 100000).toString();
  this.otp = {
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 0,
  };
  return code;
};

userSchema.methods.clearOTP = function () {
  this.otp = { code: null, expiresAt: null, attempts: 0 };
};

userSchema.statics.findByRefreshToken = function (refreshToken) {
  return this.findOne({ refreshToken });
};

userSchema.statics.clearRefreshToken = async function (userId) {
  await this.findByIdAndUpdate(userId, { refreshToken: null });
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.refreshToken;
  delete obj.otp;
  delete obj.passwordChangedAt;
  return obj;
};

const User = mongoose.models.User || model("User", userSchema);

export default User;
