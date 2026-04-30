import Order from "./order.schema.js";
import Product from "../Product/product.schema.js";
import asyncHandler from "../utils/asyncHandler.js";

////////////////////////////
//    Create new order
//   POST /api/orders
////////////////////////////
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

////////////////////////////
//     Get all orders
//    GET /api/orders
////////////////////////////
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


////////////////////////////
//     Get order by ID
//    GET /api/orders/:id
////////////////////////////
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

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Order fetched successfully",
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