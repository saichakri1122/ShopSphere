function validateAddressInput(data) {
  const {
    fullName,
    phone,
    addressLine1,
    city,
    state,
    postalCode,
    country,
    addressType,
  } = data;

  if (!fullName || !fullName.trim()) {
    return "Full name is required";
  }

  if (!phone || !phone.trim()) {
    return "Phone number is required";
  }

  if (!/^[0-9]{10,15}$/.test(phone.trim())) {
    return "Phone number must contain 10 to 15 digits";
  }

  if (!addressLine1 || !addressLine1.trim()) {
    return "Address line 1 is required";
  }

  if (!city || !city.trim()) {
    return "City is required";
  }

  if (!state || !state.trim()) {
    return "State is required";
  }

  if (!postalCode || !postalCode.trim()) {
    return "Postal code is required";
  }

  if (!/^[a-zA-Z0-9 -]{3,20}$/.test(postalCode.trim())) {
    return "Please provide a valid postal code";
  }

  if (!country || !country.trim()) {
    return "Country is required";
  }

  if (
    addressType !== undefined &&
    !["home", "work", "other"].includes(
      addressType.trim().toLowerCase()
    )
  ) {
    return "Address type must be home, work, or other";
  }

  return null;
}


function validateUpdateAddressInput(data) {
  return validateAddressInput(data);
}


module.exports = {
  validateAddressInput,
  validateUpdateAddressInput,
};