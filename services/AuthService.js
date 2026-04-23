const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthService {
  // Login
  static async login(email, password) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return { 
          success: false, 
          message: 'Email atau password salah' 
        };
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return { 
          success: false, 
          message: 'Email atau password salah' 
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

      return {
        success: true,
        message: 'Login berhasil',
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
        message: 'Terjadi kesalahan saat login' 
      };
    }
  }

  // Get user profile
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
          message: 'User tidak ditemukan' 
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
        message: 'Terjadi kesalahan saat mengambil profil' 
      };
    }
  }
}

module.exports = AuthService;
