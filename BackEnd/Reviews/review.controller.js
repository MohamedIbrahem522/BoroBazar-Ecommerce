import Review from "./review.schema.js";
import CustomError from "../utils/customError.js";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";

////////////////////////////
// Create Review
////////////////////////////
export const createReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, reviewerName, productId } = req.body;

  if (!rating || !comment || !reviewerName || !productId) {
    return next(
      new CustomError(
        "All fields are required (rating, comment, reviewerName, productId)",
        400
      )
    );
  }

  const review = await Review.create({
    rating,
    comment,
    reviewerName,
    productId,
  });

  res.status(201).json({
    success: true,
    data: review,
  });
});

////////////////////////////
// Get All Reviews
////////////////////////////
export const getReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.productId) {
    filter.productId = req.query.productId;
  }

  const reviews = await Review.find(filter);

  res.status(200).json({
    success: true,
    results: reviews.length,
    data: reviews,
  });
});

////////////////////////////
// Update Review
////////////////////////////
export const updateReview = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.reviewId)) {
    return next(new CustomError("Invalid review ID", 400));
  }

  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    return next(new CustomError("Review not found!", 404));
  }

  if (req.body.rating) review.rating = req.body.rating;
  if (req.body.comment) review.comment = req.body.comment;

  await review.save();

  res.status(200).json({
    success: true,
    data: review,
  });
});

////////////////////////////
// Delete Review
////////////////////////////
export const deleteReview = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.reviewId)) {
    return next(new CustomError("Invalid review ID", 400));
  }

  const review = await Review.findByIdAndDelete(req.params.reviewId);

  if (!review) {
    return next(new CustomError("Review not found!", 404));
  }

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});
