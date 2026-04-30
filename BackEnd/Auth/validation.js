import Joi from "joi";

const email = Joi.string().email().trim().lowercase().required();
const string = Joi.string().trim();

export const registerSchema = Joi.object({
  name: string.min(2).max(50).required(),
  email,
  password: string.min(8).required(),
  confirmPassword: string.valid(Joi.ref("password")).required(),
});

export const loginSchema = Joi.object({
  email,
  password: string.required(),
});

export const forgotSchema = Joi.object({
  email,
});

export const otpSchema = Joi.object({
  email,
  otp: string.length(6).pattern(/^\d{6}$/).required(),
});

export const resetSchema = Joi.object({
  email,
  otp: string.length(6).pattern(/^\d{6}$/).required(),
  password: string.min(8).required(),
  confirmPassword: string.valid(Joi.ref("password")).required(),
});

export const changeSchema = Joi.object({
  currentPassword: string.required(),
  password: string.min(8).required(),
  confirmPassword: string.valid(Joi.ref("password")).required(),
});

export const googleSchema = Joi.object({
  idToken: string.required(),
});

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((d) => ({ field: d.path.join("."), message: d.message })),
    });
  }

  req.body = value;
  next();
};