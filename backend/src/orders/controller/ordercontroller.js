const {
  getOrdersByUserId,
  getOrderById,
  createOrder,
  cancelOrder,
} = require("../services/orderservices");

const {
  validateCreateOrderInput,
} = require("../validations/ordervalidation");


// =========================================================
// GET ALL ORDERS
// =========================================================

async function getOrders(req, res) {
  try {
    const userId = req.user.id;

    const orders = await getOrdersByUserId(userId);

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
}


// =========================================================
// GET ONE ORDER
// =========================================================

async function getOrder(req, res) {
  try {
    const userId = req.user.id;
    const { id: orderId } = req.params;

    const order = await getOrderById(
      userId,
      orderId
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
}


// =========================================================
// CREATE ORDER
// =========================================================

async function createNewOrder(req, res) {
  try {
    const validationError =
      validateCreateOrderInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const userId = req.user.id;
    const { addressId } = req.body;

    const order = await createOrder(
      userId,
      addressId
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });

  } catch (error) {

    console.error(
      "Create order error:",
      error.message
    );


    if (error.message === "ADDRESS_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }


    if (error.message === "CART_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }


    if (error.message === "CART_EMPTY") {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }


    if (error.message.startsWith("PRODUCT_INACTIVE:")) {
      return res.status(400).json({
        success: false,
        message: "One or more products are no longer available",
      });
    }


    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for one or more products",
      });
    }


    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
}


// =========================================================
// CANCEL ORDER
// =========================================================

async function cancelExistingOrder(req, res) {
  try {
    const userId = req.user.id;
    const { id: orderId } = req.params;

    const order = await cancelOrder(
      userId,
      orderId
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });

  } catch (error) {

    console.error(
      "Cancel order error:",
      error.message
    );


    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }


    if (error.message === "ORDER_CANNOT_BE_CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled",
      });
    }


    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
}


module.exports = {
  getOrders,
  getOrder,
  createNewOrder,
  cancelExistingOrder,
};