import express from "express";
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrdersByUserId,
  getOrder,
  updateOrderStatus,
} from "./order.controller.js";
import { protect, admin } from "../middleware/authmiddleware.js";

const router = express.Router();

////////////////////////////// Admin Routes //////////////////////////////

// Get all orders
router.get("/all", protect, admin, getOrders);

// Get Orders By User ID
router.get("/user/:userId", protect, admin, getOrdersByUserId);

// Update Order Status
router.put("/:id/status", protect, admin, updateOrderStatus);

////////////////////////////// User Routes //////////////////////////////

// Create a new order
router.post("/", protect, createOrder);

// Get My Orders
router.get("/", protect, getMyOrders);

// Get single order details
router.get("/:id", protect, getOrder);

export default router;