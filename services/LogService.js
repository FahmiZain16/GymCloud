const db = require('../database');

class LogService {
  static async createLog(userId, branchId, action, description, client = db) {
    try {
      const result = await client.query(
        `INSERT INTO activity_logs (user_id, branch_id, action, description) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [userId, branchId, action, description]
      );

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('Error creating log:', error.message);
      throw new Error(`Failed to record activity: ${error.message}`);
    }
  }

  static async getAllLogs(limit = 100) {
    try {
      const result = await db.query(
        `SELECT al.*, 
                u.name as user_name, 
                u.email as user_email,
                b.name as branch_name
         FROM activity_logs al
         LEFT JOIN users u ON al.user_id = u.id
         LEFT JOIN branches b ON al.branch_id = b.id
         ORDER BY al.created_at DESC
         LIMIT $1`,
        [limit]
      );

      return {
        success: true,
        data: result.rows
      };
    } catch (error) {
      console.error('Error getting logs:', error);

      return {
        success: false,
        message: 'Failed to retrieve activity logs'
      };
    }
  }

  static async getLogsByBranch(branchId, limit = 50) {
    try {
      const result = await db.query(
        `SELECT al.*, 
                u.name as user_name, 
                u.email as user_email
         FROM activity_logs al
         LEFT JOIN users u ON al.user_id = u.id
         WHERE al.branch_id = $1
         ORDER BY al.created_at DESC
         LIMIT $2`,
        [branchId, limit]
      );

      return {
        success: true,
        data: result.rows
      };
    } catch (error) {
      console.error('Error getting branch logs:', error);

      return {
        success: false,
        message: 'Failed to retrieve branch activity logs'
      };
    }
  }

  static async getLogsByUser(userId, limit = 50) {
    try {
      const result = await db.query(
        `SELECT al.*, 
                b.name as branch_name
         FROM activity_logs al
         LEFT JOIN branches b ON al.branch_id = b.id
         WHERE al.user_id = $1
         ORDER BY al.created_at DESC
         LIMIT $2`,
        [userId, limit]
      );

      return {
        success: true,
        data: result.rows
      };
    } catch (error) {
      console.error('Error getting user logs:', error);

      return {
        success: false,
        message: 'Failed to retrieve user activity logs'
      };
    }
  }
}

module.exports = LogService;
