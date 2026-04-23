#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

function getGymNameFromArgs(argv) {
  const gymName = argv.slice(2).join(' ').trim();

  if (!gymName) {
    throw new Error('Gym name is required. Usage: node create_gym.js "Gold Gym Jogja"');
  }

  return gymName;
}

function sanitizeForEmail(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function buildAdminEmail(gymName) {
  const slug = sanitizeForEmail(gymName);
  return `admin@${slug || 'new-branch'}.com`;
}

async function getBranchColumns(client) {
  const query = `
    SELECT column_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'branches'
  `;

  const result = await client.query(query);

  if (result.rows.length === 0) {
    throw new Error('Table "branches" not found in schema public.');
  }

  return result.rows;
}

function buildBranchInsertPayload(columns, branchName) {
  const valuesByColumn = { name: branchName };

  if (columns.some((col) => col.column_name === 'status')) {
    valuesByColumn.status = 'active';
  }

  for (const column of columns) {
    const columnName = column.column_name;
    const isRequiredNoDefault =
      column.is_nullable === 'NO' && column.column_default === null;

    if (!isRequiredNoDefault) {
      continue;
    }

    if (columnName === 'id' || columnName in valuesByColumn) {
      continue;
    }

    if (columnName === 'city') {
      valuesByColumn.city = process.env.OAC_DEFAULT_CITY || 'Unknown City';
      continue;
    }

    if (columnName === 'address') {
      valuesByColumn.address =
        process.env.OAC_DEFAULT_ADDRESS || 'Auto-provisioned by OaC tool';
      continue;
    }

    throw new Error(
      `Unsupported required column in branches table: ${columnName}`
    );
  }

  const insertColumns = Object.keys(valuesByColumn);
  const placeholders = insertColumns.map((_, index) => `$${index + 1}`);
  const values = insertColumns.map((columnName) => valuesByColumn[columnName]);

  return {
    insertColumns,
    placeholders,
    values,
  };
}

async function createBranch(client, branchName) {
  const columns = await getBranchColumns(client);
  const payload = buildBranchInsertPayload(columns, branchName);
  const query = `
    INSERT INTO branches (${payload.insertColumns.join(', ')})
    VALUES (${payload.placeholders.join(', ')})
    RETURNING id
  `;

  const result = await client.query(query, payload.values);
  return result.rows[0].id;
}

async function createDefaultAdmin(client, branchId, branchName) {
  const adminName = 'Branch Admin';
  const adminEmail = buildAdminEmail(branchName);
  const temporaryPassword = 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);

  const query = `
    INSERT INTO users (branch_id, name, email, password_hash, role, created_at)
    VALUES ($1, $2, $3, $4, 'branch_admin', NOW())
    RETURNING id, email
  `;

  const result = await client.query(query, [
    branchId,
    adminName,
    adminEmail,
    passwordHash,
  ]);

  return {
    id: result.rows[0].id,
    email: result.rows[0].email,
  };
}

async function provisionStorageDirectory(branchId) {
  const storageRoot = path.resolve(process.env.STORAGE_PATH || './storage');
  const tenantStoragePath = path.join(storageRoot, String(branchId));

  await fs.mkdir(storageRoot, { recursive: true });
  await fs.mkdir(tenantStoragePath, { recursive: true });

  return tenantStoragePath;
}

async function logProvisioningActivity(client, branchId, description) {
  const query = `
    INSERT INTO activity_logs (branch_id, user_id, action, description, created_at)
    VALUES ($1, $2, $3, $4, NOW())
  `;

  await client.query(query, [
    branchId,
    null,
    'SYSTEM_PROVISIONING',
    description,
  ]);
}

async function rollbackAndCleanup(client, tenantStoragePath) {
  try {
    await client.query('ROLLBACK');
  } catch (rollbackError) {
    console.error('Failed to rollback transaction:', rollbackError.message);
  }

  if (tenantStoragePath) {
    try {
      await fs.rm(tenantStoragePath, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Failed to cleanup storage directory:', cleanupError.message);
    }
  }
}

async function provisionBranch(gymName) {
  const client = await pool.connect();
  let tenantStoragePath;

  try {
    await client.query('BEGIN');

    const branchId = await createBranch(client, gymName);
    const admin = await createDefaultAdmin(client, branchId, gymName);

    tenantStoragePath = await provisionStorageDirectory(branchId);

    const description = `Branch "${gymName}" provisioned successfully.`;
    await logProvisioningActivity(client, branchId, description);

    await client.query('COMMIT');

    console.log('Provisioning completed successfully.');
    console.log(`Branch ID: ${branchId}`);
    console.log(`Default Admin Email: ${admin.email}`);
    console.log(`Storage Path: ${tenantStoragePath}`);
  } catch (error) {
    await rollbackAndCleanup(client, tenantStoragePath);
    console.error(`Provisioning failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  try {
    const gymName = getGymNameFromArgs(process.argv);
    await provisionBranch(gymName);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    await pool.end();
  }
}

main();
