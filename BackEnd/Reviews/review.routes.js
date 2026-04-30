import { Router } from "express";
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} from "./review.controller.js";

const router = Router();

/////////////////(CreateReview)\\\\\\\\\\\\\\\\\\\
router.post("/", createReview);

/////////////////(GetReviews)\\\\\\\\\\\\\\\\\\\\\
router.get("/", getReviews);

/////////////////(UpdateReview)\\\\\\\\\\\\\\\\\\\
router.patch("/:reviewId", updateReview);

/////////////////(DeleteReview)\\\\\\\\\\\\\\\\\\\
router.delete("/:reviewId", deleteReview);

export default router;
