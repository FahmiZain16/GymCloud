const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const LogService = require('./LogService');
require('dotenv').config();

class AuthService {
  static async login(email, password) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          branch_id: user.branch_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      LogService.createLog(
        user.id,
        user.branch_id,
        'LOGIN',
        `User ${user.name} (${user.email}) successfully logged into the system.`
      ).catch(err =>
        console.error('Warning: Failed to record login log:', err.message)
      );

      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            branch_id: user.branch_id
          }
        }
      };
    } catch (error) {
      console.error('Error in login:', error);

      return {
        success: false,
        message: 'An internal server error occurred during login'
      };
    }
  }

  static async getProfile(userId) {
    try {
      const result = await db.query(
        `SELECT u.id, u.name, u.email, u.role, u.branch_id, b.name as branch_name
         FROM users u
         LEFT JOIN branches b ON u.branch_id = b.id
         WHERE u.id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('Error getting profile:', error);

      return {
        success: false,
        message: 'An error occurred while retrieving the profile'
      };
    }
  }
}

module.exports = AuthService;
