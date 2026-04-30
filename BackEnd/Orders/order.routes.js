import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
} from "./order.controller.js";
import { protect } from "../middleware/authmiddleware.js";
const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);

export default router;