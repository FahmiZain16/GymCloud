const express = require("express");
const router = express.Router();
const AuthService = require("../services/AuthService");
const LogService = require("../services/LogService");
const { authMiddleware } = require("../middleware/auth");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await AuthService.login(email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "A server error occurred",
    });
  }
});

router.post("/logout", authMiddleware, async (req, res) => {
  try {
    await LogService.createLog(
      req.user.id,
      req.user.branch_id,
      "LOGOUT",
      `User ${req.user.email} has logged out of the system.`
    );

    res.json({
      success: true,
      message: "Logout was successfully recorded by the system",
    });
  } catch (error) {
    console.error("Logout logging error:", error);

    res.status(200).json({
      success: true,
      message: "Logout processed with logging warning",
    });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await AuthService.getProfile(req.user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "A server error occurred",
    });
  }
});

module.exports = router;
