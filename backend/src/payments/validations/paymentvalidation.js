function validateCreatePaymentInput(data) {
  const { orderId } = data;

  if (!orderId || !orderId.trim()) {
    return "Order ID is required";
  }

  return null;
}


function validatePaymentVerificationInput(data) {
  const {
    paymentId,
    razorpayPaymentId,
    razorpaySignature,
  } = data;

  if (!paymentId || !paymentId.trim()) {
    return "Payment ID is required";
  }

  if (!razorpayPaymentId || !razorpayPaymentId.trim()) {
    return "Razorpay payment ID is required";
  }

  if (!razorpaySignature || !razorpaySignature.trim()) {
    return "Razorpay signature is required";
  }

  return null;
}


module.exports = {
  validateCreatePaymentInput,
  validatePaymentVerificationInput,
};