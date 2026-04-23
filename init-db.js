const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER || 'revy',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'proyek_cloud',
    password: process.env.DB_PASSWORD || '3r0$1v2y0s6gjlS',
    port: process.env.DB_PORT || 5432,
});

const createTablesQuery = `
    DROP TABLE IF EXISTS activity_logs, payments, members, membership_plans, users, branches CASCADE;

    CREATE TABLE branches (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        address TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE membership_plans (
        id SERIAL PRIMARY KEY,
        branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        duration_days INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE members (
        id SERIAL PRIMARY KEY,
        branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES membership_plans(id) ON DELETE SET NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expired_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active'
    );

    CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

async function runInitDB() {
    try {
        console.log("Connecting to database...");
        await client.connect();
        
        console.log("Executing OaC script to initialize table...");
        await client.query(createTablesQuery);
        
        console.log("Initialization succeeded.");
    } catch (err) {
        console.error("Initialization failed.", err.stack);
    } finally {
        await client.end();
        console.log("Database connection closed.");
    }
}

runInitDB();
