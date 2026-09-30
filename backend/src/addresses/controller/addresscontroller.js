const {
  getAddressesByUserId,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../services/addressservices");

const {
  validateAddressInput,
  validateUpdateAddressInput,
} = require("../validations/addressvalidation");


// Get all addresses
async function getAddresses(req, res) {
  try {
    const userId = req.user.id;

    const addresses = await getAddressesByUserId(userId);

    return res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
}


// Get one address
async function getAddress(req, res) {
  try {
    const userId = req.user.id;
    const { id: addressId } = req.params;

    const address = await getAddressById(
      userId,
      addressId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Get address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch address",
    });
  }
}


// Create address
async function createNewAddress(req, res) {
  try {
    const validationError = validateAddressInput(
      req.body
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const userId = req.user.id;

    const address = await createAddress(
      userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      address,
    });
  } catch (error) {
    console.error("Create address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create address",
    });
  }
}


// Update address
async function updateExistingAddress(req, res) {
  try {
    const validationError = validateUpdateAddressInput(
      req.body
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const userId = req.user.id;
    const { id: addressId } = req.params;

    const address = await updateAddress(
      userId,
      addressId,
      req.body
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Update address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
}


// Delete address
async function removeAddress(req, res) {
  try {
    const userId = req.user.id;
    const { id: addressId } = req.params;

    const address = await deleteAddress(
      userId,
      addressId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
}


// Set default address
async function makeDefaultAddress(req, res) {
  try {
    const userId = req.user.id;
    const { id: addressId } = req.params;

    const address = await setDefaultAddress(
      userId,
      addressId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      address,
    });
  } catch (error) {
    console.error(
      "Set default address error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
}


module.exports = {
  getAddresses,
  getAddress,
  createNewAddress,
  updateExistingAddress,
  removeAddress,
  makeDefaultAddress,
};