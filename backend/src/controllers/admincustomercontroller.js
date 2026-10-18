const customerService = require("../services/admincustomerlistservices");

async function getCustomerCount(req, res) {
  try {
    const totalCustomers = await customerService.getCustomerCount();

    return res.status(200).json({
      success: true,
      totalCustomers,
    });
  } catch (error) {
    console.error("Get customer count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer count",
    });
  }
}

module.exports = {
  getCustomerCount,
};