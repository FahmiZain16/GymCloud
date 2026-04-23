const db = require('../database');
const provisionBranchStorage = require('./init-storage');
const LogService = require('./LogService'); 

class BranchService {
  static async createBranch(branchData, superAdminId) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const branchRes = await client.query(
        `INSERT INTO branches (name, city, address, status) VALUES ($1, $2, $3, $4) RETURNING *`,
        [branchData.name, branchData.city, branchData.address, 'active']
      );

      const branch = branchRes.rows;

      const storagePath = await provisionBranchStorage(branch.id);

      if (!storagePath) {
        throw new Error(`Failed to create storage workspace for branch ${branch.id}`);
      }

      await LogService.createLog(
        superAdminId,
        branch.id,
        'CREATE_BRANCH',
        `Successfully created a new branch along with its automatic workspace.`,
        client
      );

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Branch created successfully along with its workspace and logs.',
        data: branch
      };

    } catch (error) {
      await client.query('ROLLBACK');

      console.error('An error occurred, performing rollback:', error.message);

      return {
        success: false,
        message: 'Failed to create branch: ' + error.message
      };

    } finally {
      client.release();
    }
  }
}

module.exports = BranchService;
