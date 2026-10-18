
function validateCreateOrderInput(data) {
  const { addressId, couponCode } = data;

  if (
    typeof addressId !== "string" ||
    !addressId.trim()
  ) {
    return "Address ID is required";
  }

  if (
    couponCode !== undefined &&
    (typeof couponCode !== "string" ||
      couponCode.trim().length > 50)
  ) {
    return "Invalid coupon code";
  }

  return null;
}

module.exports = {
  validateCreateOrderInput,
};
