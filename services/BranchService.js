const db = require('../config/database');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

class BranchService {
  /**
   * FLOW OTOMATISASI - CREATE BRANCH (8 Langkah)
   * Sesuai dengan diagram arsitektur
   */
  static async createBranch(branchData, superAdminId) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // STEP 1: Validasi data (sudah dilakukan di controller)
      console.log('✅ Step 1: Data validated');

      // STEP 2 & 3: Simpan Branch ke Database
      const branchResult = await client.query(
        `INSERT INTO branches (name, city, address, status) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [branchData.name, branchData.city, branchData.address, 'active']
      );
      const branch = branchResult.rows[0];
      console.log(`✅ Step 3: Branch created with ID: ${branch.id}`);

      // STEP 4: Buat Akun Admin Cabang
      const adminEmail = branchData.adminEmail || `admin.${branch.name.toLowerCase().replace(/\s+/g, '')}@gymcloud.com`;
      const defaultPassword = this.generatePassword();
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const adminResult = await client.query(
        `INSERT INTO users (branch_id, name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [branch.id, branchData.adminName || `Admin ${branch.name}`, adminEmail, hashedPassword, 'branch_admin']
      );
      const admin = adminResult.rows[0];
      console.log(`✅ Step 4: Branch Admin created - ${adminEmail}`);

      // STEP 5: Buat Default Membership Plan
      const defaultPlans = [
        { name: 'Paket Bulanan', price: 300000, duration_days: 30 },
        { name: 'Paket 3 Bulan', price: 800000, duration_days: 90 },
        { name: 'Paket 6 Bulan', price: 1500000, duration_days: 180 }
      ];

      for (const plan of defaultPlans) {
        await client.query(
          `INSERT INTO membership_plans (branch_id, name, price, duration_days) 
           VALUES ($1, $2, $3, $4)`,
          [branch.id, plan.name, plan.price, plan.duration_days]
        );
      }
      console.log(`✅ Step 5: Default membership plans created`);

      // STEP 6: Buat Folder Penyimpanan
      const storagePath = path.join(process.env.STORAGE_PATH || './storage', `branch_${branch.id}`);
      await fs.mkdir(storagePath, { recursive: true });
      
      // Create subfolders
      await fs.mkdir(path.join(storagePath, 'invoices'), { recursive: true });
      await fs.mkdir(path.join(storagePath, 'documents'), { recursive: true });
      await fs.mkdir(path.join(storagePath, 'reports'), { recursive: true });
      console.log(`✅ Step 6: Storage folder created at ${storagePath}`);

      // STEP 7: Catat ke Activity Log
      await client.query(
        `INSERT INTO activity_logs (user_id, branch_id, action, description) 
         VALUES ($1, $2, $3, $4)`,
        [
          superAdminId, 
          branch.id, 
          'CREATE_BRANCH', 
          `Branch baru "${branch.name}" berhasil dibuat di ${branch.city}`
        ]
      );
      console.log(`✅ Step 7: Activity logged`);

      // STEP 8: Kirim Email Credential
      try {
        await this.sendCredentialEmail(adminEmail, defaultPassword, branch);
        console.log(`✅ Step 8: Credential email sent to ${adminEmail}`);
      } catch (emailError) {
        console.warn('⚠️ Step 8: Email failed (continuing anyway):', emailError.message);
      }

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Branch berhasil dibuat dengan lengkap (8 langkah otomatis)',
        data: {
          branch: {
            id: branch.id,
            name: branch.name,
            city: branch.city,
            address: branch.address,
            status: branch.status,
            created_at: branch.created_at
          },
          admin: {
            id: admin.id,
            email: adminEmail,
            temporaryPassword: defaultPassword,
            name: admin.name
          },
          membershipPlans: defaultPlans.length,
          storagePath: storagePath
        }
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating branch:', error);
      return {
        success: false,
        message: 'Gagal membuat branch: ' + error.message
      };
    } finally {
      client.release();
    }
  }

  // Generate random password
  static generatePassword(length = 12) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Send credential email
  static async sendCredentialEmail(email, password, branch) {
    // Skip if email config is not set
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.log('Email configuration not found, skipping email send');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: `"GymCloud System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Akun Admin Cabang ${branch.name} - GymCloud`,
      html: `
        <h2>Selamat Datang di GymCloud!</h2>
        <p>Akun admin untuk cabang <strong>${branch.name}</strong> telah berhasil dibuat.</p>
        <h3>Credential Login Anda:</h3>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
          <li><strong>Cabang:</strong> ${branch.name} (${branch.city})</li>
        </ul>
        <p>Silakan login dan segera ganti password Anda.</p>
        <p><strong>PENTING:</strong> Simpan credential ini dengan aman!</p>
        <hr>
        <p><em>Email ini dikirim otomatis oleh sistem GymCloud</em></p>
      `
    };

    await transporter.sendMail(mailOptions);
  }

  // Get all branches
  static async getAllBranches() {
    try {
      const result = await db.query(
        `SELECT b.*, 
                COUNT(DISTINCT m.id) as total_members,
                COUNT(DISTINCT u.id) as total_admins
         FROM branches b
         LEFT JOIN members m ON b.id = m.branch_id
         LEFT JOIN users u ON b.id = u.branch_id
         GROUP BY b.id
         ORDER BY b.created_at DESC`
      );

      return {
        success: true,
        data: result.rows
      };
    } catch (error) {
      console.error('Error getting branches:', error);
      return {
        success: false,
        message: 'Gagal mengambil data cabang'
      };
    }
  }

  // Get branch by ID
  static async getBranchById(branchId) {
    try {
      const result = await db.query(
        `SELECT b.*, 
                COUNT(DISTINCT m.id) as total_members,
                COUNT(DISTINCT u.id) as total_staff
         FROM branches b
         LEFT JOIN members m ON b.id = m.branch_id
         LEFT JOIN users u ON b.id = u.branch_id
         WHERE b.id = $1
         GROUP BY b.id`,
        [branchId]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Branch tidak ditemukan'
        };
      }

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('Error getting branch:', error);
      return {
        success: false,
        message: 'Gagal mengambil data cabang'
      };
    }
  }

  // Update branch
  static async updateBranch(branchId, updateData) {
    try {
      const result = await db.query(
        `UPDATE branches 
         SET name = COALESCE($1, name),
             city = COALESCE($2, city),
             address = COALESCE($3, address),
             status = COALESCE($4, status)
         WHERE id = $5
         RETURNING *`,
        [updateData.name, updateData.city, updateData.address, updateData.status, branchId]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Branch tidak ditemukan'
        };
      }

      return {
        success: true,
        message: 'Branch berhasil diupdate',
        data: result.rows[0]
      };
    } catch (error) {
      console.error('Error updating branch:', error);
      return {
        success: false,
        message: 'Gagal mengupdate branch'
      };
    }
  }
}

module.exports = BranchService;
