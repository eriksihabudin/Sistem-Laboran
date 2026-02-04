# 🚀 Panduan Lengkap Setup MongoDB untuk Sistem Laboran DKV

## 📋 Daftar Isi
1. [Setup MongoDB Atlas (Cloud - GRATIS)](#setup-mongodb-atlas)
2. [Setup MongoDB di cPanel](#setup-mongodb-di-cpanel)
3. [Konfigurasi Aplikasi](#konfigurasi-aplikasi)
4. [Restore Database](#restore-database)
5. [Troubleshooting](#troubleshooting)

---

## 1️⃣ Setup MongoDB Atlas (Cloud - GRATIS) ⭐ RECOMMENDED

MongoDB Atlas adalah layanan cloud database yang **GRATIS** dan sangat mudah digunakan!

### ✅ Kelebihan MongoDB Atlas:
- 🆓 **Gratis 512MB** (cukup untuk 10,000+ dokumen)
- 🌐 **Web Dashboard** (seperti phpMyAdmin)
- 💾 **Backup otomatis**
- 🔒 **Security terbaik**
- 🚀 **Performance tinggi**
- 📊 **Monitoring real-time**

---

### 📝 Step 1: Daftar Akun MongoDB Atlas

1. **Buka Browser** dan akses:
   ```
   https://www.mongodb.com/cloud/atlas/register
   ```

2. **Isi Form Pendaftaran:**
   - **Email**: Masukkan email Anda
   - **First Name**: Nama depan
   - **Last Name**: Nama belakang
   - **Password**: Buat password yang kuat
   - Centang "I agree to the Terms of Service..."
   - Klik **"Sign Up"**

3. **Verifikasi Email:**
   - Cek inbox email Anda
   - Klik link verifikasi dari MongoDB
   - Akun Anda siap!

---

### 📝 Step 2: Buat Cluster Database (FREE)

1. **Setelah login**, Anda akan melihat halaman "Deploy a cloud database"

2. **Pilih Plan GRATIS:**
   - Klik **"M0 FREE"** (paling kiri)
   - Shared cluster
   - 512 MB Storage (GRATIS SELAMANYA!)

3. **Pilih Provider & Region:**
   - **Provider**: Pilih **AWS** (recommended)
   - **Region**: Pilih yang terdekat dengan Indonesia:
     - ✅ **Singapore (ap-southeast-1)** ← PALING DEKAT!
     - atau **Mumbai (ap-south-1)**
   
4. **Cluster Name:**
   - Biarkan default atau ganti: `Cluster-Laboran-DKV`

5. **Klik "Create"**
   - Proses pembuatan cluster ~3-5 menit
   - Tunggu sampai status "Active"

---

### 📝 Step 3: Setup Database Access (User)

1. **Klik "Database Access"** di sidebar kiri

2. **Klik "Add New Database User"**

3. **Isi Form User:**
   - **Authentication Method**: Pilih **Password**
   - **Username**: `laboran_admin`
   - **Password**: 
     - Klik **"Autogenerate Secure Password"** (recommended)
     - ATAU buat password sendiri (minimal 8 karakter)
     - **⚠️ SIMPAN password ini!** Akan digunakan nanti
   
4. **Database User Privileges:**
   - Pilih **"Read and write to any database"**

5. **Klik "Add User"**

✅ **User database berhasil dibuat!**

---

### 📝 Step 4: Setup Network Access (IP Whitelist)

1. **Klik "Network Access"** di sidebar kiri

2. **Klik "Add IP Address"**

3. **Pilih Opsi:**
   
   **Opsi A - Allow dari Semua IP (Mudah):**
   - Klik **"Allow Access from Anywhere"**
   - IP: `0.0.0.0/0`
   - Klik **"Confirm"**
   
   **Opsi B - Hanya IP Hosting Anda (Lebih Aman):**
   - Masukkan IP address hosting cPanel Anda
   - Klik **"Add Entry"**

4. **Tunggu status menjadi "Active"** (~2 menit)

✅ **Network access berhasil dikonfigurasi!**

---

### 📝 Step 5: Dapatkan Connection String

1. **Klik "Database"** di sidebar kiri

2. **Klik tombol "Connect"** pada cluster Anda

3. **Pilih "Connect your application"**

4. **Driver & Version:**
   - **Driver**: Node.js
   - **Version**: 4.1 or later

5. **Copy Connection String:**
   ```
   mongodb+srv://laboran_admin:<password>@cluster-laboran-dkv.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **⚠️ PENTING - Edit Connection String:**
   - Ganti `<password>` dengan password yang Anda simpan di Step 3
   - Tambahkan nama database: `/laboran_dkv` setelah `.net`
   
   **Contoh Final:**
   ```
   mongodb+srv://laboran_admin:MySecurePass123@cluster-laboran-dkv.xxxxx.mongodb.net/laboran_dkv?retryWrites=true&w=majority
   ```

7. **📋 SIMPAN connection string ini!** Akan digunakan di cPanel

---

### 📝 Step 6: Verifikasi Koneksi (Optional)

Test koneksi dari komputer Anda:

```bash
# Install mongosh (MongoDB Shell) - optional
npm install -g mongosh

# Test connection
mongosh "mongodb+srv://laboran_admin:PASSWORD@cluster-laboran-dkv.xxxxx.mongodb.net/laboran_dkv"
```

Jika berhasil, Anda akan masuk ke MongoDB shell!

✅ **MongoDB Atlas siap digunakan!**

---

## 2️⃣ Setup MongoDB di cPanel

### ⚠️ CATATAN PENTING:
**MongoDB biasanya TIDAK tersedia di shared hosting cPanel!**

Hanya tersedia di:
- ✅ VPS / Cloud Hosting
- ✅ Dedicated Server
- ✅ Hosting dengan SSH access

### 🔍 Cek Apakah cPanel Anda Support MongoDB:

**Cara 1: Cek cPanel Features**
1. Login ke cPanel
2. Cari "MongoDB" atau "Database"
3. Jika tidak ada MongoDB Manager → Tidak support

**Cara 2: SSH Access**
```bash
# Login via SSH
ssh username@your-server.com

# Cek apakah MongoDB installed
which mongod
# atau
mongo --version
```

---

### 📝 Setup MongoDB di cPanel (Jika Tersedia)

#### **Step 1: Install MongoDB via SSH**

**Ubuntu/Debian:**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

**CentOS/RHEL:**
```bash
# Create repository file
sudo nano /etc/yum.repos.d/mongodb-org-6.0.repo

# Paste this:
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc

# Install
sudo yum install -y mongodb-org

# Start
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

#### **Step 2: Konfigurasi MongoDB**

1. **Edit Config File:**
```bash
sudo nano /etc/mongod.conf
```

2. **Update Settings:**
```yaml
# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1,your-server-ip

# Security
security:
  authorization: enabled
```

3. **Restart MongoDB:**
```bash
sudo systemctl restart mongod
```

---

#### **Step 3: Buat User Admin**

```bash
# Login ke MongoDB shell
mongosh

# Switch to admin database
use admin

# Create admin user
db.createUser({
  user: "admin",
  pwd: "YourStrongPassword123!",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})

# Exit
exit
```

---

#### **Step 4: Buat Database & User untuk Aplikasi**

```bash
# Login dengan admin
mongosh -u admin -p --authenticationDatabase admin

# Create database
use laboran_dkv

# Create user
db.createUser({
  user: "laboran_admin",
  pwd: "LabSecurePass123!",
  roles: [{ role: "readWrite", db: "laboran_dkv" }]
})

# Exit
exit
```

---

#### **Step 5: Connection String untuk cPanel MongoDB**

```
mongodb://laboran_admin:LabSecurePass123!@localhost:27017/laboran_dkv
```

---

## 3️⃣ Konfigurasi Aplikasi di cPanel

### 📝 Upload Aplikasi Next.js

1. **Login ke cPanel**

2. **Buka "File Manager"**

3. **Upload file aplikasi:**
   - Upload semua file Next.js ke folder: `~/public_html/laboran-dkv/`
   - Atau gunakan Git untuk clone repository

4. **Install Dependencies:**
```bash
cd ~/public_html/laboran-dkv
npm install
# atau
yarn install
```

---

### 📝 Setup Environment Variables (.env)

1. **Buat/Edit file `.env`:**
```bash
cd ~/public_html/laboran-dkv
nano .env
```

2. **Untuk MongoDB Atlas:**
```env
# MongoDB Atlas Connection
MONGO_URL=mongodb+srv://laboran_admin:PASSWORD@cluster-laboran-dkv.xxxxx.mongodb.net/laboran_dkv?retryWrites=true&w=majority

# App URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Other settings
CORS_ORIGINS=*
```

3. **Untuk MongoDB Lokal di cPanel:**
```env
# MongoDB Local Connection
MONGO_URL=mongodb://laboran_admin:LabSecurePass123!@localhost:27017/laboran_dkv

# App URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Other settings
CORS_ORIGINS=*
```

4. **Save & Exit** (Ctrl+X, Y, Enter)

---

### 📝 Setup Node.js App di cPanel

1. **Buka "Setup Node.js App"** di cPanel

2. **Create Application:**
   - **Node.js version**: Pilih 18.x atau 20.x
   - **Application mode**: Production
   - **Application root**: `laboran-dkv`
   - **Application URL**: `yourdomain.com` atau subdomain
   - **Application startup file**: `server.js` (atau `node_modules/.bin/next`)
   - **Passenger log file**: Biarkan default

3. **Klik "Create"**

4. **Install Dependencies:**
   - Setelah app dibuat, klik "Run NPM Install"
   - Tunggu sampai selesai

5. **Restart App:**
   - Klik "Restart" untuk apply changes

---

## 4️⃣ Restore Database

### 📝 Via UI (Web Interface)

1. **Akses aplikasi**: `https://yourdomain.com`

2. **Login sebagai admin:**
   - Username: `admin`
   - Password: `admin123`

3. **Buka menu "Setting"**

4. **Scroll ke "Manajemen Database"**

5. **Klik "Pilih File Backup"**

6. **Upload file:**
   - File: `backup-laboran-dkv-2025-12-16.json`
   - Download dari: https://asset-tracker-dkv.preview.emergentagent.com/backup-laboran-dkv-2025-12-16.json

7. **Konfirmasi restore**

8. **Tunggu proses selesai** → Halaman akan reload

9. **✅ Database berhasil di-restore!**

---

### 📝 Via SSH/Terminal (Advanced)

```bash
cd ~/public_html/laboran-dkv

# Download backup file
wget https://asset-tracker-dkv.preview.emergentagent.com/backup-laboran-dkv-2025-12-16.json

# Create restore script
nano restore.js
```

Paste script ini:
```javascript
const https = require('https');
const fs = require('fs');

const backup = JSON.parse(fs.readFileSync('backup-laboran-dkv-2025-12-16.json', 'utf8'));

const loginData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

const loginReq = https.request('https://yourdomain.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const { token } = JSON.parse(data);
    
    const restoreData = JSON.stringify(backup);
    const restoreReq = https.request('https://yourdomain.com/api/database/restore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': restoreData.length,
        'Authorization': 'Bearer ' + token
      }
    }, (res2) => {
      let data2 = '';
      res2.on('data', (chunk) => data2 += chunk);
      res2.on('end', () => {
        console.log('✅ Restore berhasil!');
        console.log(JSON.parse(data2));
      });
    });
    
    restoreReq.write(restoreData);
    restoreReq.end();
  });
});

loginReq.write(loginData);
loginReq.end();
```

Run script:
```bash
node restore.js
```

---

## 5️⃣ Troubleshooting

### ❌ Error: "Cannot connect to MongoDB"

**Solusi:**
1. **Cek connection string** di `.env` - pastikan tidak ada typo
2. **Cek password** - pastikan tidak ada karakter special yang belum di-escape
3. **Cek IP whitelist** di MongoDB Atlas - pastikan sudah allow 0.0.0.0/0
4. **Test connection:**
   ```bash
   mongosh "your-connection-string"
   ```

---

### ❌ Error: "Authentication failed"

**Solusi:**
1. **Cek username & password** di connection string
2. **Ganti password user** di MongoDB Atlas:
   - Database Access → Edit User → Update Password
3. **Update connection string** di `.env`

---

### ❌ Error: "Network timeout"

**Solusi:**
1. **Cek Network Access** di MongoDB Atlas
2. **Pastikan IP hosting sudah di-whitelist**
3. **Test dari server:**
   ```bash
   curl -I https://cluster-laboran-dkv.xxxxx.mongodb.net
   ```

---

### ❌ Error: "App tidak bisa start di cPanel"

**Solusi:**
1. **Cek Node.js version** - minimal 18.x
2. **Install ulang dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. **Cek log error:**
   ```bash
   tail -f ~/logs/laboran-dkv.log
   ```

---

## 📊 Verifikasi Instalasi

### ✅ Checklist:

- [ ] MongoDB Atlas cluster active
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied & updated
- [ ] Aplikasi uploaded ke cPanel
- [ ] File `.env` configured dengan MONGO_URL
- [ ] Dependencies installed (`node_modules/` ada)
- [ ] Node.js app created di cPanel
- [ ] App running (status: Running)
- [ ] Database restored (3 users, 14 barang)
- [ ] Dashboard menampilkan data dengan benar
- [ ] Password default sudah diganti

---

## 🎉 Selesai!

Aplikasi Sistem Laboran DKV sekarang running di hosting Anda dengan MongoDB Atlas!

### 📱 Test Aplikasi:
1. Akses: `https://yourdomain.com`
2. Login: `admin` / `admin123`
3. Cek Dashboard - harus ada 14 barang
4. Cek Grafik - harus menampilkan data
5. ✅ Semua berfungsi!

### 🔒 Keamanan:
1. **Ganti password** semua user
2. **Backup database** secara rutin
3. **Update** aplikasi secara berkala

---

## 📞 Bantuan Lebih Lanjut

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- MongoDB Manual: https://docs.mongodb.com/manual/
- Next.js Docs: https://nextjs.org/docs

---

**✅ Setup Complete! Selamat menggunakan Sistem Laboran DKV!** 🎉
