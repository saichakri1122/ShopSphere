function validateRegisterInput(data) {
  const { firstName, lastName, email, password, phone } = data;

  if (!firstName || !firstName.trim()) {
    return "First name is required";
  }

  if (!email || !email.trim()) {
    return "Email is required";
  }

  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return "Please provide a valid email address";
  }

  if (phone && !/^[0-9]{10,15}$/.test(phone)) {
    return "Please provide a valid phone number";
  }

  return null;
}

module.exports = {
  validateRegisterInput,
};