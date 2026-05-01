import Order from "./order.schema.js";
import Product from "../Product/product.schema.js";
import asyncHandler from "../utils/asyncHandler.js";

////////////////////////////// User Controllers //////////////////////////////

// Create New Order
// POST /api/orders

export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  let totalPrice = 0;

  const items = await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.productId);

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      totalPrice += product.price * item.quantity;

      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image.url || product.image,
      };
    })
  );

  const order = await Order.create({
    user: req.user._id,
    orderItems: items,
    shippingAddress,
    paymentMethod,
    totalPrice,
  });

  res.status(201).json({
    statusCode: 201,
    success: true,
    message: "Order created successfully",
    data: {
      orderId: order._id,
      status: order.status,
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      orderItems: order.orderItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      createdAt: order.createdAt,
    },
  });
});

// Get My Orders
// GET /api/orders

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("orderItems.productId", "name price");

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "My orders fetched successfully",
    data: {
      results: orders.length,
      orders: orders.map((order) => ({
        orderId: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        orderItems: order.orderItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        createdAt: order.createdAt,
      })),
    },
  });
});

// Get Order By ID
// GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.productId");

  if (!order) {
    return res.status(404).json({
      statusCode: 404,
      success: false,
      message: "Order not found",
    });
  }

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      statusCode: 403,
      success: false,
      message: "Not authorized to view this order",
    });
  }

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Order fetched successfully",
    data: {
      orderId: order._id,

      user: {
        id: order.user._id,
        name: order.user.name,
        email: order.user.email,
      },

      status: order.status,
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,

      orderItems: order.orderItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),

      createdAt: order.createdAt,
    },
  });
});

////////////////////////////// Admin Controllers //////////////////////////////

// Get All Orders
// GET /api/orders/all

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("orderItems.productId", "name price");

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Orders fetched successfully",
    data: {
      results: orders.length,
      orders: orders.map((order) => ({
        orderId: order._id,
        user: {
          id: order.user._id,
          name: order.user.name,
          email: order.user.email,
        },
        status: order.status,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        orderItems: order.orderItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        createdAt: order.createdAt,
      })),
    },
  });
});

// Get Orders By User ID
// GET /api/orders/user/:userId
export const getOrdersByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const orders = await Order.find({ user: userId })
    .populate("user", "name email")
    .populate("orderItems.productId", "name price");

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "User orders fetched successfully",
    data: {
      results: orders.length,
      orders: orders.map((order) => ({
        orderId: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        orderItems: order.orderItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        createdAt: order.createdAt,
      })),
    },
  });
});

// Update Order Status
// PUT /api/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "Invalid status value",
    });
  }

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      statusCode: 404,
      success: false,
      message: "Order not found",
    });
  }

  order.status = status;
  await order.save();

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Order status updated successfully",
    data: {
      orderId: order._id,
      status: order.status,
    },
  });
});