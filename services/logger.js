const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'revy',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'proyek_cloud',
    password: process.env.DB_PASSWORD || '3r0$1v2y0s6gjlS',
    port: process.env.DB_PORT || 5432,
});

async function logActivity(userId, branchId, action, description) {
    const query = `
        INSERT INTO activity_logs (user_id, branch_id, action, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [userId, branchId, action, description];

    try {
        const res = await pool.query(query, values);
        console.log(`[ACTIVITY LOG] Action '${action}' successfully recorded in the system.`);
        return res.rows[0];
    } catch (err) {
        console.error(`[ACTIVITY LOG] Failed to record the action '${action}':`, err.message);
    }
}

module.exports = {
    logActivity,
    pool
};

