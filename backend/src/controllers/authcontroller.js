const jwt = require("jsonwebtoken");
const { validateRegisterInput } = require("../validations/authvalidation");
const { registerUser,loginUser, } = require("../services/authservices");

async function register(req, res) {
  try {
    const validationError = validateRegisterInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating your account",
    });
  }
}
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

const user = await loginUser({
  email,
  password,
});

const token = jwt.sign(
  {
    userId: user.id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

return res.status(200).json({
  success: true,
  message: "Login successful",
  user,
});
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(401).json({
      success: false,
      message: error.message || "Invalid email or password",
    });
  }
}
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.userId;

    const pool = require("../config/database");

    const result = await pool.query(
      `
        SELECT
          id,
          first_name,
          last_name,
          email,
          phone,
          role,
          is_active,
          email_verified,
          created_at
        FROM users
        WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Account is inactive",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging out",
    });
  }
}
module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};
