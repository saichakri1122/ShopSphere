function validateCreateOrderInput(data) {
  const { addressId } = data;

  if (!addressId || !addressId.trim()) {
    return "Address ID is required";
  }

  return null;
}

module.exports = {
  validateCreateOrderInput,
};