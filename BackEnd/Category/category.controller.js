import cloudinary from "../utils/cloud.js";
import Category from "./category.schema.js";
import slugify from "slugify";
import CustomError from "../utils/customError.js";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
////////////////////////////
// Create Category
////////////////////////////
export const createCategory = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new CustomError("Category image is required!", 400));
  }

  const result = await uploadToCloudinary(req.file.buffer, `${process.env.FOLDER_CLOUD_NAME}/Category`);

  const category = await Category.create({
    name: req.body.name,
    slug: slugify(req.body.name, { lower: true }),
    image: {
      id: result.public_id,
      url: result.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});

////////////////////////////
// Get Categories
////////////////////////////
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  res.status(200).json({
    success: true,
    results: categories.length,
    data: categories,
  });
});

////////////////////////////
// Update Category
////////////////////////////
export const updateCategory = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
    return next(new CustomError("Invalid category ID", 400));
  }

  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    return next(new CustomError("Category not found!", 404));
  }

  if (req.body.name) {
    category.name = req.body.name;
    category.slug = slugify(req.body.name, { lower: true });
  }

  if (req.file) {
    if (category.image?.id) {
      await cloudinary.uploader.destroy(category.image.id);
    }

    const result = await uploadToCloudinary(req.file.buffer, `${process.env.FOLDER_CLOUD_NAME}/Category`);

    category.image = {
      id: result.public_id,
      url: result.secure_url,
    };
  }

  await category.save();

  res.status(200).json({
    success: true,
    data: category,
  });
});

////////////////////////////
// Delete Category
////////////////////////////
export const deleteCategory = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
    return next(new CustomError("Invalid category ID", 400));
  }

  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    return next(new CustomError("Category not found!", 404));
  }

  if (category.image?.id) {
    await cloudinary.uploader.destroy(category.image.id);
  }

  await Category.findByIdAndDelete(req.params.categoryId);

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});