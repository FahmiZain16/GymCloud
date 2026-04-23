# 🏋️ GymCloud - Multi-Branch SaaS Platform (Backend API)

Proyek ini adalah purwarupa (*prototype*) layanan *Software as a Service* (SaaS) multi-tenant untuk manajemen gym berbasis *cloud*, yang dikembangkan secara spesifik untuk memenuhi tugas **Mini Project Komputasi Awan**.

Fokus utama repositori ini adalah pada **logika operasional backend**, **Operations as a Code (OaC)**, dan **logical data isolation**, sehingga aplikasi dibangun tanpa menggunakan antarmuka grafis (GUI) manual dan diuji murni melalui *REST API endpoints*.

---

## 📋 Fitur Utama

### ✅ 1. Create Branch (Flow Otomatisasi Provisioning - 8 Langkah)
Ketika Super Admin membuat cabang baru, sistem mempraktikkan konsep *dynamic tenant provisioning* dengan menjalankan 8 langkah otomatis secara transaksional. Jika satu langkah gagal, seluruh proses akan di-*rollback*.

1. **Validasi Data** - Mengecek kelengkapan input HTTP *request*.
2. **Backend Validasi** - Memastikan integritas data di level *server*.
3. **Simpan ke Database** - Menyimpan profil cabang baru ke PostgreSQL.
4. **Buat Admin Cabang** - Meng-*generate* akun administrator khusus untuk cabang tersebut secara otomatis.
5. **Buat Membership Plan** - Meng-*generate* 3 paket keanggotaan bawaan (Bulanan, 3 Bulan, 6 Bulan).
6. **Buat Folder Storage (OaC)** - Mengeksekusi otomatisasi penyediaan ruang kerja/penyimpanan terisolasi (`/storage/branch_id`) menggunakan Node.js `fs.promises`.
7. **Activity Log** - Mencatat riwayat operasional ke dalam database (*audit trail*).
8. **Kirim Email** - Mengirimkan *credential login* otomatis ke email admin cabang (opsional melalui `nodemailer`).

### 🔒 2. Logical Data Isolation (Arsitektur Multi-Tenant)
Sistem menggunakan model *Shared Schema, Shared Table*. Seluruh data (cabang, *member*, log) tersimpan dalam satu database yang sama, namun dipisahkan secara ketat di level logika menggunakan `branch_id`. Admin dari Cabang A tidak akan pernah bisa mengakses data atau log dari Cabang B.

### 📝 3. Activity Logging (Audit Trail)
Pencatatan otomatis seluruh aktivitas pengguna seperti login, logout, dan create branch sebagai bentuk fitur operasional *cloud*. Akses untuk melihat laporan log ini dilindungi oleh *Role-Based Access Control* (RBAC).

### 🔐 4. Authentication & Authorization
- JWT-based authentication
- Role-based access control untuk Super Admin dan Branch Admin
- Secure password hashing menggunakan `bcrypt`

### 📊 5. Database Layer
- PostgreSQL dengan relasi lengkap
- Tabel utama untuk users, branches, membership_plans, members, payments, dan activity_logs
- Indexes untuk performa yang lebih baik

---

## 🚀 Quick Start (Manual Setup)

Karena proyek ini adalah *Backend API*, ikuti langkah-langkah instalasi berikut menggunakan Node.js dan PostgreSQL.

### Prerequisites
- Node.js v18 atau lebih baru
- PostgreSQL 15 atau lebih baru
- Postman, Insomnia, atau Thunder Client untuk pengujian API

### Langkah Instalasi

#### 1. Clone dan install dependencies
```bash
git clone https://github.com/FahmiZain16/GymCloud.git
cd GymCloud
npm install
```

#### 2. Configure environment variables
Buat file bernama `.env` di root direktori proyek dan isi dengan kredensial berikut, sesuaikan dengan database lokal Anda:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gymcloud_db
DB_USER=postgres
DB_PASSWORD=password_postgres_anda

# Security
JWT_SECRET=rahasia_gymcloud_super_aman_123

# Server & OaC Storage
PORT=3000
NODE_ENV=development
STORAGE_PATH=./storage

# Email Configuration (Opsional untuk langkah 8)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
```

#### 3. Inisialisasi database (Operations as a Code)
Sesuai aturan operasional tanpa GUI, jalankan skrip berikut satu kali untuk mengotomatisasi pembuatan tabel relasional di PostgreSQL.

```bash
node init-db.js
```

#### 4. Jalankan API server
```bash
node server.js
```

Jika sukses, terminal akan memunculkan banner **"GymCloud API Server Running"** di port 3000.

---

## 📁 Struktur Project Inti

```text
GymCloud/
├── middleware/
│   └── auth.js             # Verifikasi JWT dan RBAC (isSuperAdmin)
├── routes/
│   ├── auth.js             # Endpoint login & logout
│   ├── branches.js         # Endpoint pembuatan dan manajemen cabang
│   └── logs.js             # Endpoint pemantauan audit trail
├── services/
│   ├── AuthService.js      # Logika JWT Token & fire-and-forget logs
│   ├── BranchService.js    # Eksekusi transaksi 8 langkah Create Branch
│   ├── init-storage.js     # OaC untuk isolasi direktori folder cabang
│   └── LogService.js       # OaC untuk penulisan riwayat ke database
├── init-db.js              # Skrip OaC inisialisasi tabel database awal
├── database.js             # Koneksi PostgreSQL (pg Pool)
├── server.js               # Resepsionis API Server (Main Entry)
├── package.json            # Daftar dependencies
└── .env                    # (Gitignored) Kredensial lingkungan
```

---

## 🔌 API Endpoints & Cara Pengujian

Gunakan Postman untuk menguji endpoint di bawah ini pada `http://localhost:3000`.

### 1. Authentication
```http
POST /api/auth/login     - Men-generate JWT Token
POST /api/auth/logout    - Mencatat log logout pengguna
GET  /api/auth/profile   - Mengambil data pengguna tersesi
```

### 2. Branches (Provisioning)
```http
POST /api/branches/      - (Super Admin Only) Memicu 8 langkah OaC Create Branch otomatis
GET  /api/branches/      - Mengambil daftar seluruh cabang
GET  /api/branches/:id   - Mengambil detail cabang spesifik
PUT  /api/branches/:id   - (Super Admin Only) Mengedit informasi cabang
```

### 3. Activity Logs (Audit Trail)
```http
GET  /api/logs/                 - (Super Admin Only) Mengambil rekap seluruh aktivitas semua cabang
GET  /api/logs/branch/:branchId - Mengambil aktivitas cabang secara terisolasi
GET  /api/logs/user/:userId     - Mengambil log spesifik milik satu pengguna
```

---

## 🔧 Troubleshooting Umum

### invalid ELF header pada modul bcrypt
Jika Anda berpindah dari Windows/Mac ke Linux dan menemui error ini saat menjalankan `server.js`, hapus folder modul dan instal ulang agar C++ bindings `bcrypt` disesuaikan dengan OS Anda.

### Database Connection Error / role "postgres" does not exist
Pastikan PostgreSQL menyala dan konfigurasi nama user serta password di file `.env` sudah sama persis dengan kredensial PostgreSQL lokal Anda.

### Email credential tidak terkirim
Pengiriman email bersifat opsional. Jika variabel `EMAIL_USER` di file `.env` dikosongkan, sistem hanya akan melewati langkah ini dan tetap menganggap pembuatan cabang sukses.

---

## 📚 Tech Stack

Proyek ini dibangun murni di atas ekosistem Node.js:

- **Backend Framework:** Node.js + Express.js
- **Database:** PostgreSQL (dengan `pg`)
- **Security & Auth:** JSON Web Token (`jsonwebtoken`) & `bcrypt`
- **Infrastructure Automation:** Node.js File System (`fs.promises`)
- **Email Service:** `nodemailer`

---

## 🔐 Security Notes & Kepatuhan Cloud

- **Tenant Isolation:** Sistem secara absolut menolak permintaan silang (*cross-branch requests*) melalui validasi `branch_id` yang tertanam dalam token JWT yang diterbitkan saat login.
- **Transaction Integrity:** Proses Create Branch dibungkus dengan perintah SQL `BEGIN` dan `COMMIT`. Apabila skrip OaC gagal di tengah jalan, seluruh entitas dicabut kembali (`ROLLBACK`).
- **Environment Security:** Variabel kredensial tidak ditanam pada kode (di-hardcode), melainkan dilindungi menggunakan `dotenv`.

---

## 📞 Support & 📄 License

Proyek akademik untuk Mini Project Cloud Computing (*IaaS / SaaS Implementation*).

**Lisensi:** MIT License - Free to use and modify.

Happy Coding! 🚀
