import cloudinary from "../utils/cloud.js";
import Product from "./product.schema.js";
import slugify from "slugify";
import CustomError from "../utils/customError.js";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

////////////////////////////
// Create Product
////////////////////////////
export const createProduct = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new CustomError("Product image is required!", 400));
  }

  const { name, description, price, categoryId } = req.body;

  if (!name || !description || !price || !categoryId) {
    return next(new CustomError("Please provide all required fields (name, description, price, categoryId)", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return next(new CustomError("Invalid category ID", 400));
  }

  const result = await uploadToCloudinary(req.file.buffer, `${process.env.FOLDER_CLOUD_NAME}/Product`);

  const product = await Product.create({
    name,
    description,
    price,
    categoryId,
    slug: slugify(name, { lower: true }),
    image: {
      id: result.public_id,
      url: result.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    data: product,
  });
});

////////////////////////////
// Get Products
////////////////////////////
export const getProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.categoryId) {
    filter.categoryId = req.query.categoryId;
  }

  const products = await Product.find(filter).populate("categoryId", "name slug image");

  res.status(200).json({
    success: true,
    results: products.length,
    data: products,
  });
});

////////////////////////////
// Get Single Product
////////////////////////////
export const getProductById = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
    return next(new CustomError("Invalid product ID", 400));
  }

  const product = await Product.findById(req.params.productId).populate("categoryId", "name slug image");

  if (!product) {
    return next(new CustomError("Product not found!", 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

////////////////////////////
// Update Product
////////////////////////////
export const updateProduct = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
    return next(new CustomError("Invalid product ID", 400));
  }

  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new CustomError("Product not found!", 404));
  }

  const { name, description, price, categoryId } = req.body;

  if (name) {
    product.name = name;
    product.slug = slugify(name, { lower: true });
  }
  if (description) product.description = description;
  if (price) product.price = price;
  if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return next(new CustomError("Invalid category ID", 400));
      }
      product.categoryId = categoryId;
  }

  if (req.file) {
    if (product.image?.id) {
      await cloudinary.uploader.destroy(product.image.id);
    }

    const result = await uploadToCloudinary(req.file.buffer, `${process.env.FOLDER_CLOUD_NAME}/Product`);

    product.image = {
      id: result.public_id,
      url: result.secure_url,
    };
  }

  await product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

////////////////////////////
// Delete Product
////////////////////////////
export const deleteProduct = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
    return next(new CustomError("Invalid product ID", 400));
  }

  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new CustomError("Product not found!", 404));
  }

  if (product.image?.id) {
    await cloudinary.uploader.destroy(product.image.id);
  }

  await Product.findByIdAndDelete(req.params.productId);

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
