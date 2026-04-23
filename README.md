# 🏋️ GymCloud - Multi-Branch SaaS Platform

Platform manajemen gym berbasis cloud dengan sistem multi-cabang (multi-tenant).

## 📋 Fitur Utama

### ✅ Create Branch (Flow Otomatisasi - 8 Langkah)
Ketika Super Admin membuat cabang baru, sistem otomatis menjalankan:

1. **Validasi Data** - Cek kelengkapan input
2. **Backend Validasi** - Validasi di server
3. **Simpan ke Database** - Insert data cabang
4. **Buat Admin Cabang** - Generate akun admin otomatis
5. **Buat Membership Plan** - 3 paket default (Bulanan, 3 Bulan, 6 Bulan)
6. **Buat Folder Storage** - Struktur folder untuk dokumen cabang
7. **Activity Log** - Catat semua aktivitas
8. **Kirim Email** - Credential login ke email admin cabang

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Super Admin, Branch Admin)
- Secure password hashing (bcrypt)

### 📊 Database
- PostgreSQL dengan relasi lengkap
- 6 tabel utama: users, branches, membership_plans, members, payments, activity_logs
- Indexes untuk performa optimal

### 🎨 Frontend Dashboard
- Web-based dashboard untuk Super Admin
- Responsive design
- Real-time statistics
- Activity logs monitoring

---

## 🚀 Quick Start

### Metode 1: Menggunakan Docker (Recommended)

```bash
# 1. Clone atau extract project
cd gymcloud-backend

# 2. Jalankan dengan Docker Compose
docker-compose up -d

# 3. Cek status
docker-compose ps

# 4. Lihat logs
docker-compose logs -f api
```

**Akses aplikasi:**
- API Server: http://localhost:3000
- Frontend Dashboard: http://localhost:3000 (buka di browser)
- Database: localhost:5432

**Default Login:**
- Email: `admin@gymcloud.com`
- Password: (lihat di schema.sql atau gunakan hash yang di-generate)

---

### Metode 2: Manual Setup

#### Prerequisites
- Node.js v18+ 
- PostgreSQL 15+
- npm atau yarn

#### Langkah Instalasi

**1. Install Dependencies**
```bash
npm install
```

**2. Setup Database**
```bash
# Buat database
createdb gymcloud_db

# Import schema
psql -d gymcloud_db -f schema.sql
```

**3. Configure Environment**
```bash
# Copy .env dan sesuaikan
cp .env.example .env

# Edit .env
nano .env
```

Isi `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gymcloud_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key
PORT=3000
NODE_ENV=development

# Email (Optional - untuk kirim credential)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

STORAGE_PATH=./storage
```

**4. Buat Super Admin**
```sql
-- Login ke PostgreSQL
psql -d gymcloud_db

-- Buat Super Admin (password: admin123)
INSERT INTO users (name, email, password_hash, role) 
VALUES (
  'Super Admin', 
  'admin@gymcloud.com', 
  '$2b$10$qZ7.XvZxvzqKp6YRQ.gJkeO4RqJKZ3Q8X9XvZxvzqKp6YRQ.gJkeO',
  'super_admin'
);
```

**5. Jalankan Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

**6. Buka Frontend**
Buka browser: `http://localhost:3000`

---

## 📁 Struktur Project

```
gymcloud-backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   └── auth.js              # JWT authentication
├── services/
│   ├── AuthService.js       # Login & JWT
│   ├── BranchService.js     # Create Branch (8-step automation)
│   └── LogService.js        # Activity logging
├── routes/
│   ├── auth.js              # Auth endpoints
│   ├── branches.js          # Branch CRUD
│   └── logs.js              # Activity logs
├── public/
│   └── index.html           # Frontend dashboard
├── storage/                 # File storage (auto-created)
│   ├── branch_1/
│   ├── branch_2/
│   └── ...
├── server.js                # Main Express app
├── schema.sql               # Database schema
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .env
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login       - Login
GET    /api/auth/profile     - Get user profile (auth required)
```

### Branches
```
POST   /api/branches         - Create branch (Super Admin only)
GET    /api/branches         - Get all branches
GET    /api/branches/:id     - Get branch by ID
PUT    /api/branches/:id     - Update branch (Super Admin only)
```

### Activity Logs
```
GET    /api/logs             - Get all logs (Super Admin only)
GET    /api/logs/branch/:id  - Get logs by branch
GET    /api/logs/user/:id    - Get logs by user
```

---

## 📝 Cara Menggunakan

### 1. Login sebagai Super Admin
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@gymcloud.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "admin@gymcloud.com",
      "role": "super_admin"
    }
  }
}
```

### 2. Buat Cabang Baru (8 Langkah Otomatis)
```bash
POST /api/branches
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "GymCloud Jakarta Selatan",
  "city": "Jakarta",
  "address": "Jl. Sudirman No. 123, Jakarta Selatan",
  "adminName": "Budi Santoso",
  "adminEmail": "budi@gymcloud.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Branch berhasil dibuat dengan lengkap (8 langkah otomatis)",
  "data": {
    "branch": {
      "id": 1,
      "name": "GymCloud Jakarta Selatan",
      "city": "Jakarta",
      "address": "Jl. Sudirman No. 123, Jakarta Selatan",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "admin": {
      "id": 2,
      "email": "budi@gymcloud.com",
      "temporaryPassword": "Abc123XyZ!@#",
      "name": "Budi Santoso"
    },
    "membershipPlans": 3,
    "storagePath": "./storage/branch_1"
  }
}
```

**Yang terjadi di background:**
- ✅ Branch tersimpan di database
- ✅ Akun admin cabang dibuat
- ✅ 3 paket membership default dibuat
- ✅ Folder storage dibuat
- ✅ Activity log dicatat
- ✅ Email credential dikirim (jika konfigurasi email aktif)

### 3. Lihat Daftar Cabang
```bash
GET /api/branches
Authorization: Bearer <token>
```

### 4. Lihat Activity Logs
```bash
GET /api/logs?limit=50
Authorization: Bearer <token>
```

---

## 🎯 Testing dengan Frontend

1. **Buka Dashboard**
   - Browser: `http://localhost:3000`
   
2. **Login**
   - Email: `admin@gymcloud.com`
   - Password: `admin123`

3. **Tambah Cabang**
   - Klik tombol "Tambah Cabang Baru"
   - Isi form (nama, kota, alamat)
   - Klik "Buat Cabang (8 Langkah Otomatis)"
   - Lihat credential admin yang ter-generate

4. **Monitor Activity**
   - Scroll ke bawah untuk lihat activity logs
   - Semua aktivitas tercatat otomatis

---

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f api

# Restart services
docker-compose restart

# Remove everything (including volumes)
docker-compose down -v

# Access database
docker exec -it gymcloud-db psql -U postgres -d gymcloud_db
```

---

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Cek apakah PostgreSQL running
docker-compose ps

# Restart database
docker-compose restart postgres
```

### Port Already in Use
```bash
# Cek port yang digunakan
lsof -i :3000
lsof -i :5432

# Ganti port di docker-compose.yml atau .env
```

### Email Not Sending
```bash
# Email bersifat optional
# Jika tidak dikonfigurasi, credential hanya muncul di response API
# Untuk Gmail, gunakan App Password, bukan password biasa
```

---

## 📚 Tech Stack

- **Backend:** Node.js + Express
- **Database:** PostgreSQL 15
- **Auth:** JWT (jsonwebtoken)
- **Password:** bcrypt
- **Email:** nodemailer
- **Container:** Docker + Docker Compose
- **Frontend:** Vanilla HTML/CSS/JavaScript

---

## 🔐 Security Notes

1. **Production Checklist:**
   - ✅ Ganti `JWT_SECRET` dengan random string yang kuat
   - ✅ Update default Super Admin password
   - ✅ Aktifkan HTTPS
   - ✅ Set `NODE_ENV=production`
   - ✅ Enable rate limiting
   - ✅ Configure CORS properly

2. **Password Policy:**
   - Minimum 8 karakter
   - Gunakan bcrypt untuk hashing
   - Generated password untuk admin cabang: 12 karakter (mixed)

---

## 📞 Support

Jika ada pertanyaan atau issues, silakan buat issue di repository atau hubungi tim development.

---

## 📄 License

MIT License - Free to use and modify

---

**Happy Coding! 🚀**
