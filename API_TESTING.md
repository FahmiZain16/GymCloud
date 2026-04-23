# 🧪 API Testing Guide - GymCloud

Panduan lengkap untuk testing API GymCloud menggunakan curl atau Postman.

---

## 🔐 Authentication

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gymcloud.com",
    "password": "admin123"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "admin@gymcloud.com",
      "role": "super_admin",
      "branch_id": null
    }
  }
}
```

**Simpan token untuk request berikutnya!**

---

### 2. Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🏢 Branch Management

### 3. Create Branch (8-Step Automation)
```bash
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "GymCloud Jakarta Selatan",
    "city": "Jakarta",
    "address": "Jl. Sudirman No. 123, Jakarta Selatan 12920",
    "adminName": "Budi Santoso",
    "adminEmail": "budi@gymcloud.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Branch berhasil dibuat dengan lengkap (8 langkah otomatis)",
  "data": {
    "branch": {
      "id": 1,
      "name": "GymCloud Jakarta Selatan",
      "city": "Jakarta",
      "address": "Jl. Sudirman No. 123, Jakarta Selatan 12920",
      "status": "active",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "admin": {
      "id": 2,
      "email": "budi@gymcloud.com",
      "temporaryPassword": "Abc123!@#XyZ",
      "name": "Budi Santoso"
    },
    "membershipPlans": 3,
    "storagePath": "./storage/branch_1"
  }
}
```

**Console Output (Server-side):**
```
✅ Step 1: Data validated
✅ Step 3: Branch created with ID: 1
✅ Step 4: Branch Admin created - budi@gymcloud.com
✅ Step 5: Default membership plans created
✅ Step 6: Storage folder created at ./storage/branch_1
✅ Step 7: Activity logged
✅ Step 8: Credential email sent to budi@gymcloud.com
```

---

### 4. Create Multiple Branches
```bash
# Cabang Jakarta Pusat
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "GymCloud Jakarta Pusat",
    "city": "Jakarta",
    "address": "Jl. Thamrin No. 45, Jakarta Pusat"
  }'

# Cabang Bandung
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "GymCloud Bandung",
    "city": "Bandung",
    "address": "Jl. Dago No. 78, Bandung"
  }'

# Cabang Surabaya
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "GymCloud Surabaya",
    "city": "Surabaya",
    "address": "Jl. Pemuda No. 56, Surabaya"
  }'
```

---

### 5. Get All Branches
```bash
curl -X GET http://localhost:3000/api/branches \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "GymCloud Jakarta Selatan",
      "city": "Jakarta",
      "address": "Jl. Sudirman No. 123",
      "status": "active",
      "created_at": "2024-01-15T10:30:00.000Z",
      "total_members": "0",
      "total_admins": "1"
    },
    {
      "id": 2,
      "name": "GymCloud Jakarta Pusat",
      "city": "Jakarta",
      "address": "Jl. Thamrin No. 45",
      "status": "active",
      "created_at": "2024-01-15T10:35:00.000Z",
      "total_members": "0",
      "total_admins": "1"
    }
  ]
}
```

---

### 6. Get Branch by ID
```bash
curl -X GET http://localhost:3000/api/branches/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 7. Update Branch
```bash
curl -X PUT http://localhost:3000/api/branches/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "GymCloud Jakarta Selatan - Premium",
    "status": "active"
  }'
```

---

## 📊 Activity Logs

### 8. Get All Logs (Super Admin)
```bash
curl -X GET "http://localhost:3000/api/logs?limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "branch_id": 1,
      "action": "CREATE_BRANCH",
      "description": "Branch baru \"GymCloud Jakarta Selatan\" berhasil dibuat di Jakarta",
      "created_at": "2024-01-15T10:30:00.000Z",
      "user_name": "Super Admin",
      "user_email": "admin@gymcloud.com",
      "branch_name": "GymCloud Jakarta Selatan"
    }
  ]
}
```

---

### 9. Get Logs by Branch
```bash
curl -X GET "http://localhost:3000/api/logs/branch/1?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 10. Get Logs by User
```bash
curl -X GET "http://localhost:3000/api/logs/user/1?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Complete Testing Workflow

### Step-by-Step Test Scenario

**1. Start Server**
```bash
docker-compose up -d
# atau
npm start
```

**2. Login as Super Admin**
```bash
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gymcloud.com","password":"admin123"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"
```

**3. Create First Branch**
```bash
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "GymCloud Jakarta Selatan",
    "city": "Jakarta",
    "address": "Jl. Sudirman No. 123"
  }' | jq '.'
```

**4. Verify Branch Creation**
```bash
# Check branches list
curl -X GET http://localhost:3000/api/branches \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Check activity logs
curl -X GET http://localhost:3000/api/logs \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Check storage folder
ls -la storage/
```

**5. Login as Branch Admin**
```bash
# Gunakan credential yang didapat dari response create branch
BRANCH_TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.gymcloudjakartaselatan@gymcloud.com",
    "password": "PASSWORD_DARI_RESPONSE"
  }' | jq -r '.data.token')

# Get profile
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $BRANCH_TOKEN" | jq '.'
```

---

## 📋 Test Cases Checklist

### ✅ Authentication Tests
- [ ] Login dengan credential yang benar
- [ ] Login dengan password salah (harus ditolak)
- [ ] Login dengan email tidak terdaftar (harus ditolak)
- [ ] Access endpoint tanpa token (harus 401)
- [ ] Access endpoint dengan token invalid (harus 401)
- [ ] Get profile dengan token valid

### ✅ Create Branch Tests
- [ ] Create branch dengan data lengkap
- [ ] Create branch tanpa adminName/adminEmail (auto-generate)
- [ ] Create branch tanpa nama (harus ditolak)
- [ ] Create branch tanpa kota (harus ditolak)
- [ ] Create branch tanpa alamat (harus ditolak)
- [ ] Create branch sebagai non-super-admin (harus ditolak)
- [ ] Verify 8 steps executed (check console logs)
- [ ] Verify storage folder created
- [ ] Verify membership plans created
- [ ] Verify activity log created

### ✅ Branch Management Tests
- [ ] Get all branches
- [ ] Get specific branch by ID
- [ ] Get non-existent branch (harus 404)
- [ ] Update branch sebagai super admin
- [ ] Update branch sebagai branch admin (harus ditolak)

### ✅ Activity Logs Tests
- [ ] Get all logs sebagai super admin
- [ ] Get branch logs
- [ ] Get user logs
- [ ] Get logs dengan limit parameter

---

## 🔍 Validation Tests

### Invalid Requests
```bash
# Missing required fields
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Branch"
  }'
# Expected: 400 Bad Request

# Without authentication
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "city": "Test",
    "address": "Test"
  }'
# Expected: 401 Unauthorized
```

---

## 📊 Database Verification

### Check Database After Operations
```bash
# Access database
docker exec -it gymcloud-db psql -U postgres -d gymcloud_db

# Check branches
SELECT * FROM branches;

# Check users (admins)
SELECT * FROM users;

# Check membership plans
SELECT * FROM membership_plans;

# Check activity logs
SELECT * FROM activity_logs;

# Check storage structure
SELECT 
  b.name, 
  COUNT(mp.id) as total_plans,
  COUNT(u.id) as total_admins
FROM branches b
LEFT JOIN membership_plans mp ON b.id = mp.branch_id
LEFT JOIN users u ON b.id = u.branch_id
GROUP BY b.id, b.name;
```

---

## 🎯 Performance Testing

### Load Testing (Create Multiple Branches)
```bash
#!/bin/bash
TOKEN="YOUR_TOKEN_HERE"

for i in {1..10}
do
  curl -X POST http://localhost:3000/api/branches \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"name\": \"Test Branch $i\",
      \"city\": \"City $i\",
      \"address\": \"Address $i\"
    }" &
done

wait
echo "Done creating 10 branches"
```

---

## 📝 Expected Results

### Successful Branch Creation Should:
1. ✅ Return 201 status code
2. ✅ Include branch data in response
3. ✅ Include generated admin credentials
4. ✅ Create 1 branch record
5. ✅ Create 1 user (admin) record
6. ✅ Create 3 membership_plans records
7. ✅ Create 1 activity_log record
8. ✅ Create storage folder: `storage/branch_{id}/`
9. ✅ Send email (if configured)

### Console Should Show:
```
✅ Step 1: Data validated
✅ Step 3: Branch created with ID: X
✅ Step 4: Branch Admin created - email@example.com
✅ Step 5: Default membership plans created
✅ Step 6: Storage folder created at ./storage/branch_X
✅ Step 7: Activity logged
✅ Step 8: Credential email sent to email@example.com
```

---

**Happy Testing! 🚀**
