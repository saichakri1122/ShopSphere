const bcrypt = require("bcrypt");
const pool = require("../config/database");

async function registerUser({
  firstName,
  lastName,
  email,
  password,
  phone,
}) {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if email already exists
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("An account with this email already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const result = await pool.query(
    `
      INSERT INTO users (
        first_name,
        last_name,
        email,
        password_hash,
        phone
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        is_active,
        email_verified,
        created_at
    `,
    [
      firstName.trim(),
      lastName ? lastName.trim() : null,
      normalizedEmail,
      passwordHash,
      phone || null,
    ]
  );

  return result.rows[0];
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `
      SELECT
        id,
        first_name,
        last_name,
        email,
        password_hash,
        phone,
        role,
        is_active,
        email_verified
      FROM users
      WHERE email = $1
    `,
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new Error("This account is inactive");
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  delete user.password_hash;

  return user;
}

module.exports = {
  registerUser,
  loginUser,
};