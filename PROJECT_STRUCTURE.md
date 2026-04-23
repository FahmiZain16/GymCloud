# 📁 Struktur Project GymCloud

## 🗂️ File Tree

```
gymcloud-project/
│
├── 📄 README.md                    # Dokumentasi utama & panduan instalasi
├── 📄 API_TESTING.md               # Panduan testing API dengan curl
├── 📄 .env                         # Konfigurasi environment variables
├── 📄 package.json                 # Dependencies Node.js
├── 📄 server.js                    # Main Express application
├── 📄 schema.sql                   # Database schema PostgreSQL
├── 📄 Dockerfile                   # Docker image untuk API server
├── 📄 docker-compose.yml           # Docker orchestration
│
├── 📂 config/
│   └── database.js                 # PostgreSQL connection pool
│
├── 📂 middleware/
│   └── auth.js                     # JWT authentication & role checking
│
├── 📂 services/
│   ├── AuthService.js              # Login & user management
│   ├── BranchService.js            # Create Branch (8-step automation) ⭐
│   └── LogService.js               # Activity logging
│
├── 📂 routes/
│   ├── auth.js                     # Authentication endpoints
│   ├── branches.js                 # Branch CRUD endpoints
│   └── logs.js                     # Activity logs endpoints
│
└── 📂 public/
    └── index.html                  # Frontend dashboard (Super Admin)
```

---

## 🎯 File Descriptions

### Root Files

| File | Deskripsi |
|------|-----------|
| `README.md` | Dokumentasi lengkap: instalasi, setup, cara pakai |
| `API_TESTING.md` | Tutorial testing API dengan contoh curl commands |
| `.env` | Environment variables (DB config, JWT secret, email) |
| `package.json` | Dependencies: express, pg, bcrypt, jwt, nodemailer |
| `server.js` | Entry point aplikasi Express |
| `schema.sql` | DDL database: 6 tabel + indexes + default data |
| `Dockerfile` | Build Node.js container |
| `docker-compose.yml` | PostgreSQL + API server orchestration |

### config/

| File | Deskripsi |
|------|-----------|
| `database.js` | PostgreSQL connection pool dengan health check |

### middleware/

| File | Deskripsi |
|------|-----------|
| `auth.js` | JWT verification & role-based authorization |

### services/

| File | Fungsi Utama |
|------|-------------|
| `AuthService.js` | `login()`, `getProfile()` |
| `BranchService.js` | `createBranch()` **(8 langkah otomatis)** ⭐, `getAllBranches()`, `getBranchById()`, `updateBranch()` |
| `LogService.js` | `createLog()`, `getAllLogs()`, `getLogsByBranch()` |

### routes/

| File | Endpoints |
|------|-----------|
| `auth.js` | `POST /api/auth/login`, `GET /api/auth/profile` |
| `branches.js` | `POST /api/branches`, `GET /api/branches`, `GET /api/branches/:id`, `PUT /api/branches/:id` |
| `logs.js` | `GET /api/logs`, `GET /api/logs/branch/:id`, `GET /api/logs/user/:id` |

### public/

| File | Deskripsi |
|------|-----------|
| `index.html` | Single-page dashboard untuk Super Admin (login, create branch, view logs) |

---

## ⭐ Core Feature: Create Branch (8-Step Automation)

File: `services/BranchService.js` → Method: `createBranch()`

### Flow Otomatis:

```javascript
1. ✅ Validasi Data
   Input: name, city, address, adminName?, adminEmail?
   
2. ✅ Backend Validation
   Cek kelengkapan field required
   
3. ✅ Simpan Branch ke Database
   INSERT INTO branches → Return branch ID
   
4. ✅ Buat Admin Cabang
   Auto-generate email & password
   INSERT INTO users (role: branch_admin)
   
5. ✅ Buat Default Membership Plans
   3 paket: Bulanan, 3 Bulan, 6 Bulan
   INSERT INTO membership_plans (x3)
   
6. ✅ Buat Folder Penyimpanan
   mkdir ./storage/branch_{id}/
   mkdir ./storage/branch_{id}/invoices
   mkdir ./storage/branch_{id}/documents
   mkdir ./storage/branch_{id}/reports
   
7. ✅ Catat Activity Log
   INSERT INTO activity_logs
   
8. ✅ Kirim Email Credential
   nodemailer → Send credentials to admin
```

### Response Example:
```json
{
  "success": true,
  "message": "Branch berhasil dibuat dengan lengkap (8 langkah otomatis)",
  "data": {
    "branch": { "id": 1, "name": "...", ... },
    "admin": { 
      "email": "admin@...", 
      "temporaryPassword": "..." 
    },
    "membershipPlans": 3,
    "storagePath": "./storage/branch_1"
  }
}
```

---

## 🗄️ Database Schema

### Tables (6)

1. **branches**
   - Primary: id, name, city, address, status, created_at
   
2. **users**
   - Primary: id, branch_id, name, email, password_hash, role, created_at
   - Roles: super_admin, branch_admin, trainer, staff
   
3. **membership_plans**
   - Primary: id, branch_id, name, price, duration_days, created_at
   
4. **members**
   - Primary: id, branch_id, plan_id, name, phone, email, joined_at, expired_at, status
   
5. **payments**
   - Primary: id, member_id, branch_id, amount, payment_method, paid_at
   
6. **activity_logs**
   - Primary: id, user_id, branch_id, action, description, created_at

### Relationships
- branches 1:N users
- branches 1:N membership_plans
- branches 1:N members
- branches 1:N payments
- membership_plans 1:N members
- members 1:N payments
- users 1:N activity_logs

---

## 🚀 Quick Start

### Dengan Docker (Recommended)
```bash
cd gymcloud-project
docker-compose up -d
```

Akses:
- API: http://localhost:3000
- Dashboard: http://localhost:3000 (browser)
- Database: localhost:5432

### Manual
```bash
npm install
createdb gymcloud_db
psql -d gymcloud_db -f schema.sql
# Edit .env
npm start
```

---

## 📡 API Endpoints Summary

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user info (auth required)

### Branches
- `POST /api/branches` - Create branch **[Super Admin only]**
- `GET /api/branches` - List all branches
- `GET /api/branches/:id` - Get branch detail
- `PUT /api/branches/:id` - Update branch **[Super Admin only]**

### Logs
- `GET /api/logs` - All logs **[Super Admin only]**
- `GET /api/logs/branch/:id` - Branch logs
- `GET /api/logs/user/:id` - User logs

---

## 🔐 Default Credentials

**Super Admin:**
- Email: `admin@gymcloud.com`
- Password: (set in schema.sql - hash bcrypt)

**Branch Admin:**
- Auto-generated setelah create branch
- Dikirim via email atau tampil di response API

---

## 🛠️ Tech Stack

- **Backend:** Node.js 18 + Express.js
- **Database:** PostgreSQL 15
- **Auth:** JWT (jsonwebtoken)
- **Password:** bcrypt
- **Email:** nodemailer
- **Container:** Docker + Docker Compose
- **Frontend:** Vanilla HTML/CSS/JavaScript

---

## 📝 Development Notes

### Environment Variables
Edit `.env` untuk konfigurasi:
- Database connection
- JWT secret key
- Email SMTP (optional)
- Storage path

### Adding New Features
1. Buat service di `services/`
2. Buat route di `routes/`
3. Import di `server.js`
4. Test dengan curl atau Postman

### Database Migrations
Schema sudah include:
- All tables
- Foreign keys
- Indexes
- Default super admin

---

**Project Status: ✅ Ready to Deploy**

Semua file sudah lengkap dan siap dijalankan!
