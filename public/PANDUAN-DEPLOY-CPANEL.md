# 🚀 Panduan Lengkap Deploy Aplikasi Laboran DKV di cPanel

## 📋 Daftar Isi
1. [Persiapan](#persiapan)
2. [Upload Aplikasi ke cPanel](#upload-aplikasi)
3. [Setup MongoDB](#setup-mongodb)
4. [Konfigurasi Node.js App](#konfigurasi-nodejs)
5. [Restore Database](#restore-database)
6. [Testing & Verifikasi](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## ✅ Persiapan

### 🔍 **Cek Requirements Hosting:**

Pastikan hosting cPanel Anda memiliki:
- ✅ **cPanel version**: 11.102 atau lebih baru
- ✅ **Node.js support**: Minimal version 18.x
- ✅ **SSH access**: Untuk install dependencies (opsional)
- ✅ **Disk space**: Minimal 500MB
- ✅ **Memory**: Minimal 512MB RAM

**Cara cek:**
1. Login ke cPanel
2. Cari "Setup Node.js App" atau "Application Manager"
3. Jika ada → ✅ Support Node.js
4. Jika tidak ada → ❌ Hosting tidak support (upgrade ke VPS/Cloud)

---

### 📦 **Download File Aplikasi:**

**Opsi 1: Download dari GitHub/Repository**
- Clone repository aplikasi Anda
- Extract ke folder lokal

**Opsi 2: Download dari Server Development**
Buka terminal dan buat zip file:
```bash
# Di server development
cd /app
zip -r laboran-dkv.zip . -x "node_modules/*" -x ".next/*" -x ".git/*"
```

**File yang PERLU di-upload:**
```
laboran-dkv/
├── app/                    # Folder aplikasi Next.js
├── components/             # Komponen UI
├── public/                 # File statis
├── scripts/               # Script utility
├── .env.example           # Template environment
├── package.json           # Dependencies
├── next.config.js         # Config Next.js
├── tailwind.config.js     # Config Tailwind
└── jsconfig.json          # Config JavaScript
```

**File yang TIDAK PERLU di-upload:**
- ❌ `node_modules/` (akan diinstall di server)
- ❌ `.next/` (akan di-build di server)
- ❌ `.git/` (version control)

---

## 📤 Upload Aplikasi ke cPanel

### **Step 1: Login ke cPanel**

1. Buka browser, akses: `https://yourdomain.com:2083`
2. Masukkan username & password cPanel Anda
3. Klik "Log in"

---

### **Step 2: Buat Folder Aplikasi**

1. **Klik "File Manager"** di cPanel
2. **Navigate** ke `public_html` atau home directory
3. **Klik "New Folder"**
4. **Nama folder**: `laboran-dkv`
5. **Klik "Create New Folder"**

**Struktur folder yang direkomendasikan:**
```
/home/username/
├── public_html/              # Website utama
│   └── laboran-dkv/          # Aplikasi Laboran DKV
│       ├── app/
│       ├── components/
│       ├── public/
│       └── ...
└── logs/                     # Log files (auto-created)
```

---

### **Step 3: Upload File Aplikasi**

**Metode A: Via File Manager (Mudah)**

1. **Masuk ke folder** `laboran-dkv`
2. **Klik "Upload"** di toolbar atas
3. **Drag & Drop** file `laboran-dkv.zip` atau klik "Select File"
4. **Tunggu upload selesai** (progress bar 100%)
5. **Kembali** ke File Manager
6. **Klik kanan** pada `laboran-dkv.zip`
7. **Pilih "Extract"**
8. **Extract ke**: `/home/username/public_html/laboran-dkv/`
9. **Klik "Extract File(s)"**
10. **Hapus** file zip setelah selesai

**Metode B: Via FTP (Advanced)**

1. **Install FTP Client** (FileZilla recommended)
2. **Connect** ke server:
   - Host: `ftp.yourdomain.com`
   - Username: cPanel username
   - Password: cPanel password
   - Port: 21
3. **Navigate** ke `/public_html/laboran-dkv/`
4. **Upload** semua file dari folder lokal
5. **Tunggu sampai selesai**

**Metode C: Via SSH (Fastest)**

```bash
# Login SSH
ssh username@yourdomain.com

# Navigate ke folder
cd ~/public_html

# Download dari server development
scp -r user@dev-server:/app ~/public_html/laboran-dkv

# Atau clone dari Git
git clone https://github.com/yourusername/laboran-dkv.git

# Set permissions
chmod -R 755 laboran-dkv
```

---

### **Step 4: Verifikasi Upload**

Cek file sudah terupload dengan benar:

**Via File Manager:**
1. Navigate ke `laboran-dkv/`
2. Pastikan ada folder:
   - ✅ `app/`
   - ✅ `components/`
   - ✅ `public/`
   - ✅ `package.json`
   - ✅ `next.config.js`

**Via SSH:**
```bash
cd ~/public_html/laboran-dkv
ls -la
```

---

## 🔧 Setup MongoDB

### **Opsi 1: MongoDB Atlas (RECOMMENDED)** 🌟

Ikuti panduan lengkap di: **PANDUAN-SETUP-MONGODB.md**

**Quick Steps:**
1. Daftar di https://www.mongodb.com/cloud/atlas/register
2. Buat cluster FREE (M0)
3. Buat user database
4. Allow network access (0.0.0.0/0)
5. Copy connection string

**Connection String Example:**
```
mongodb+srv://laboran_admin:YourPassword@cluster.xxxxx.mongodb.net/laboran_dkv?retryWrites=true&w=majority
```

---

### **Opsi 2: MongoDB Lokal (VPS Only)**

**Hanya jika Anda punya VPS/Dedicated Server!**

```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database & user
mongosh
use laboran_dkv
db.createUser({
  user: "laboran_admin",
  pwd: "SecurePassword123!",
  roles: [{ role: "readWrite", db: "laboran_dkv" }]
})
exit
```

**Connection String:**
```
mongodb://laboran_admin:SecurePassword123!@localhost:27017/laboran_dkv
```

---

## ⚙️ Konfigurasi Node.js App

### **Step 1: Setup Environment Variables (.env)**

1. **Via File Manager:**
   - Navigate ke `laboran-dkv/`
   - Klik "New File"
   - Nama file: `.env`
   - Klik "Create New File"

2. **Edit file `.env`:**
   - Klik kanan `.env` → "Edit"
   - Paste konfigurasi berikut:

```env
# ============================================
# MongoDB Connection
# ============================================
# Untuk MongoDB Atlas (Cloud)
MONGO_URL=mongodb+srv://laboran_admin:YourPassword@cluster.xxxxx.mongodb.net/laboran_dkv?retryWrites=true&w=majority

# Untuk MongoDB Lokal (VPS only)
# MONGO_URL=mongodb://laboran_admin:Password@localhost:27017/laboran_dkv

# ============================================
# Application Settings
# ============================================
# URL aplikasi Anda (PENTING!)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Atau jika pakai subdomain
# NEXT_PUBLIC_BASE_URL=https://laboran.yourdomain.com

# CORS Settings (biarkan default)
CORS_ORIGINS=*

# ============================================
# Optional: JWT Secret (auto-generated jika kosong)
# ============================================
# JWT_SECRET=your-super-secret-key-here
```

3. **Save** file (Ctrl+S atau klik "Save Changes")

**⚠️ PENTING:**
- Ganti `YourPassword` dengan password MongoDB Anda
- Ganti `yourdomain.com` dengan domain Anda
- Jangan ada spasi sebelum/sesudah `=`

---

### **Step 2: Setup Node.js Application**

1. **Kembali ke cPanel Dashboard**

2. **Cari "Setup Node.js App"**
   - Scroll di Software section
   - Atau search "node" di search box

3. **Klik "Create Application"**

4. **Isi Form:**

   **a) Node.js version:**
   - Pilih **18.x** atau **20.x** (latest LTS)
   - ⚠️ Jangan pilih versi lama (<18)

   **b) Application mode:**
   - Pilih **Production**

   **c) Application root:**
   - Path: `/home/username/public_html/laboran-dkv`
   - Atau klik folder icon dan pilih folder

   **d) Application URL:**
   - Domain: Pilih domain Anda dari dropdown
   - URL Path: Kosongkan (untuk root domain)
   
   **Contoh:**
   - Domain: `yourdomain.com` → https://yourdomain.com
   - Subdomain: `laboran.yourdomain.com` → https://laboran.yourdomain.com

   **e) Application startup file:**
   - File: `server.js`
   - Atau: `node_modules/next/dist/bin/next`
   - ⚠️ Jika error, coba: `npm start`

   **f) Passenger log file:**
   - Biarkan default: `/home/username/logs/laboran-dkv.log`

5. **Klik "Create"**

✅ **Aplikasi Node.js berhasil dibuat!**

---

### **Step 3: Install Dependencies**

**Metode A: Via cPanel UI (Mudah)**

1. Setelah app dibuat, scroll ke bawah
2. Cari section **"Detected configuration files"**
3. Klik tombol **"Run NPM Install"**
4. Tunggu proses selesai (~2-5 menit)
5. Check log untuk memastikan tidak ada error

**Metode B: Via SSH (Faster)**

```bash
# Login SSH
ssh username@yourdomain.com

# Navigate ke aplikasi
cd ~/public_html/laboran-dkv

# Install dependencies
npm install --production

# Atau jika pakai yarn
yarn install --production

# Build aplikasi
npm run build
```

**⚠️ Jika error "npm not found":**
```bash
# Setup Node.js environment dari cPanel Node.js App
source /home/username/nodevenv/public_html/laboran-dkv/18/bin/activate

# Lalu install
npm install --production
```

---

### **Step 4: Setup Domain/Subdomain (Optional)**

**Jika ingin pakai subdomain:**

1. **cPanel → Domains → Subdomains**
2. **Create Subdomain:**
   - Subdomain: `laboran`
   - Domain: `yourdomain.com`
   - Document Root: `/home/username/public_html/laboran-dkv/public`
3. **Klik "Create"**

4. **Update .env:**
   ```env
   NEXT_PUBLIC_BASE_URL=https://laboran.yourdomain.com
   ```

5. **Restart aplikasi**

---

### **Step 5: Start Aplikasi**

1. **Kembali ke "Setup Node.js App"**
2. **Find your application** di list
3. **Status** harus **"Running"** dengan icon hijau
4. Jika **"Stopped"**, klik tombol **"Start"**

**Atau restart via button:**
- Klik **"Restart"** button
- Tunggu beberapa detik
- Status berubah ke "Running"

✅ **Aplikasi sudah running!**

---

## 📊 Restore Database

### **Step 1: Download Backup Database**

Download file backup dari:
```
https://asset-tracker-dkv.preview.emergentagent.com/backup-laboran-dkv-2025-12-16.json
```

Save ke komputer Anda.

---

### **Step 2: Restore via Web UI**

1. **Akses aplikasi:** `https://yourdomain.com`

2. **Login halaman:**
   - Username: `admin`
   - Password: `admin123`

3. **Menu Dashboard** akan terbuka (mungkin masih kosong)

4. **Klik tab "Setting"** di navigasi

5. **Scroll ke bawah** sampai section **"Manajemen Database"** (warna orange)

6. **Restore Database:**
   - Klik tombol **"Pilih File Backup"**
   - Pilih file `backup-laboran-dkv-2025-12-16.json`
   - Konfirmasi peringatan (data akan di-replace)
   - Tunggu proses restore (~5-10 detik)

7. **Halaman akan reload otomatis**

8. **Dashboard sekarang menampilkan data:**
   - Total Barang: 14
   - Barang Normal: 7
   - Barang Rusak: 3
   - Grafik peminjaman & kerusakan

✅ **Database berhasil di-restore!**

---

### **Step 3: Verifikasi Data**

Cek menu-menu berikut:

**Dashboard:**
- ✅ Stats cards menampilkan angka
- ✅ Grafik Peminjaman Bulanan (Oktober & November)
- ✅ Grafik Kerusakan per Kategori
- ✅ Peminjam Terbaru (5 terakhir)

**Inventaris:**
- ✅ List 14 barang
- ✅ Filter kategori berfungsi
- ✅ Search berfungsi

**Peminjaman:**
- ✅ List 9 peminjaman
- ✅ Status: dipinjam & dikembalikan
- ✅ Detail peminjaman tampil

**Users (Admin only):**
- ✅ 3 users: admin, laboran, testsiswa

**Setting:**
- ✅ Kategori: 9 items
- ✅ Manajemen Database tampil

---

## ✅ Testing & Verifikasi

### **Test 1: Akses Aplikasi**

```bash
# Via browser
https://yourdomain.com

# Via curl (SSH)
curl -I https://yourdomain.com
# Expected: HTTP/1.1 200 OK
```

---

### **Test 2: Test Login**

1. **Akses**: `https://yourdomain.com`
2. **Login dengan admin:**
   - Username: `admin`
   - Password: `admin123`
3. **Expected**: Redirect ke Dashboard
4. **Logout** dan test user lain

---

### **Test 3: Test CRUD Operations**

**Create:**
1. Menu Inventaris → Tambah Barang
2. Isi form → Simpan
3. ✅ Barang baru muncul di list

**Read:**
1. Klik barang → Detail tampil
2. ✅ Foto, spesifikasi, riwayat muncul

**Update:**
1. Menu Setting → Kategori → Edit
2. Ubah nama → Simpan
3. ✅ Nama kategori berubah

**Delete:**
1. Menu Users → Klik Hapus pada user test
2. Konfirmasi
3. ✅ User terhapus

---

### **Test 4: Test Backup & Restore**

1. Menu Setting → Manajemen Database
2. Klik **"Backup Sekarang"**
3. ✅ File JSON terdownload
4. Test Restore dengan file yang sama
5. ✅ Data kembali sama

---

## 🐛 Troubleshooting

### ❌ **Error: "Application Not Running"**

**Penyebab:**
- Dependencies belum terinstall
- Port sudah digunakan
- Error di code

**Solusi:**
```bash
# Cek log error
tail -f ~/logs/laboran-dkv.log

# Atau via cPanel: Node.js App → View Log

# Install dependencies lagi
cd ~/public_html/laboran-dkv
npm install --production

# Restart
# Via cPanel Node.js App → Restart
```

---

### ❌ **Error: "502 Bad Gateway"**

**Penyebab:**
- Aplikasi crash
- Out of memory
- MongoDB connection failed

**Solusi:**
```bash
# Check aplikasi status
# cPanel → Node.js App → Check status

# Check MongoDB connection
# Edit .env → Pastikan MONGO_URL benar

# Restart
# Node.js App → Stop → Start
```

---

### ❌ **Error: "Cannot connect to MongoDB"**

**Penyebab:**
- Connection string salah
- Password salah
- IP tidak di-whitelist (MongoDB Atlas)

**Solusi:**
1. **Cek .env file:**
   ```bash
   cat ~/public_html/laboran-dkv/.env
   ```
2. **Cek MONGO_URL:** tidak ada typo
3. **Test connection:**
   ```bash
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net/laboran_dkv"
   ```
4. **MongoDB Atlas:** Cek Network Access → Allow 0.0.0.0/0
5. **Update .env** dan restart

---

### ❌ **Error: "Module not found"**

**Penyebab:**
- Dependencies tidak terinstall
- Node version salah

**Solusi:**
```bash
# Hapus node_modules
rm -rf ~/public_html/laboran-dkv/node_modules

# Install ulang
cd ~/public_html/laboran-dkv
npm install --production

# Cek Node version
node -v
# Expected: v18.x atau v20.x

# Restart app
```

---

### ❌ **Error: "Permission denied"**

**Penyebab:**
- File permissions salah

**Solusi:**
```bash
# Fix permissions
cd ~/public_html/laboran-dkv
chmod -R 755 .
chmod 644 .env
chmod 755 app public components

# Restart app
```

---

### ❌ **Grafik tidak muncul setelah restore**

**Penyebab:**
- Date format tidak terkonversi

**Solusi:**
- Sudah auto-fixed di versi terbaru!
- Jika masih error: clear database → restore ulang
- Atau: cPanel → Node.js App → Restart

---

## 🔄 Maintenance

### **Update Aplikasi**

**Via Git (Recommended):**
```bash
cd ~/public_html/laboran-dkv
git pull origin main
npm install --production
npm run build

# Restart via cPanel Node.js App
```

**Via Upload Manual:**
1. Backup database dulu (Setting → Backup)
2. Upload file baru
3. Extract
4. Restart aplikasi

---

### **Restart Aplikasi**

**Via cPanel:**
1. Setup Node.js App
2. Find aplikasi
3. Klik **"Restart"**

**Via SSH:**
```bash
# Find process
ps aux | grep node

# Kill process
pkill -f "node.*laboran-dkv"

# Start otomatis via cPanel Passenger
```

---

### **View Logs**

**Via cPanel:**
1. Setup Node.js App
2. Find aplikasi
3. Klik **"View Log"**

**Via SSH:**
```bash
# Application log
tail -f ~/logs/laboran-dkv.log

# Error log
tail -f ~/logs/laboran-dkv_error.log

# Access log
tail -f ~/logs/yourdomain.com-ssl_log
```

---

### **Backup Reguler**

**Backup Database (Weekly):**
1. Login sebagai admin
2. Setting → Manajemen Database
3. Klik "Backup Sekarang"
4. Save file dengan nama: `backup-YYYY-MM-DD.json`
5. Simpan di safe location (Google Drive, dll)

**Backup File Aplikasi (Monthly):**
```bash
# Via SSH
cd ~/public_html
tar -czf laboran-dkv-backup-$(date +%Y%m%d).tar.gz laboran-dkv/

# Download via FTP atau cPanel File Manager
```

---

### **Monitor Performance**

**Via cPanel:**
- CPU and Memory Usage → Check resource usage
- Metrics → Node.js App metrics

**Via SSH:**
```bash
# Check memory
free -h

# Check CPU
top -u username

# Check disk
df -h
```

---

### **Update Password Default**

**PENTING! Lakukan setelah restore:**

1. Login sebagai admin
2. Menu **Users** → Edit admin
3. Password baru: (min 8 karakter, mixed case, angka)
4. Simpan
5. Logout → Login dengan password baru

Ulangi untuk user `laboran` dan user lain.

---

## 📋 Checklist Deployment

Print checklist ini dan centang setiap step:

### Pre-Deployment:
- [ ] Hosting support Node.js 18.x+
- [ ] MongoDB Atlas account dibuat
- [ ] MongoDB cluster active
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string copied

### Upload & Setup:
- [ ] File aplikasi uploaded ke cPanel
- [ ] File extracted ke folder yang benar
- [ ] File `.env` dibuat dan configured
- [ ] MONGO_URL updated di .env
- [ ] NEXT_PUBLIC_BASE_URL updated
- [ ] Node.js App created di cPanel
- [ ] Node version 18.x+ selected
- [ ] Dependencies installed (npm install)
- [ ] Application started (status: Running)

### Database:
- [ ] Backup database downloaded
- [ ] Restore via web UI berhasil
- [ ] Dashboard menampilkan data
- [ ] Grafik muncul dengan benar
- [ ] Semua menu accessible

### Testing:
- [ ] Login admin berhasil
- [ ] Login laboran berhasil
- [ ] Create barang baru → OK
- [ ] Edit barang → OK
- [ ] Delete data → OK
- [ ] Backup database → OK
- [ ] Restore database → OK

### Security:
- [ ] Password admin diganti
- [ ] Password laboran diganti
- [ ] Password user lain diganti
- [ ] Backup database disimpan
- [ ] File .env permission 644

### Post-Deployment:
- [ ] Test dari berbagai device
- [ ] Test dari berbagai browser
- [ ] Setup backup schedule (weekly)
- [ ] Monitor log errors (daily)
- [ ] Document custom configuration

---

## 🎉 Selesai!

**Aplikasi Sistem Laboran DKV berhasil di-deploy di cPanel!**

### 📱 Akses Aplikasi:
```
https://yourdomain.com
```

### 🔐 Login Default:
- **Admin**: `admin` / `admin123` (GANTI PASSWORD!)
- **Laboran**: `laboran` / `laboran123` (GANTI PASSWORD!)

### 📊 Dashboard Features:
- ✅ Statistics real-time
- ✅ Grafik peminjaman & kerusakan
- ✅ CRUD inventaris
- ✅ Manajemen peminjaman
- ✅ Laporan lengkap
- ✅ Backup & restore database

### 🆘 Need Help?

**Log Files:**
- Application: `~/logs/laboran-dkv.log`
- Error: `~/logs/laboran-dkv_error.log`

**Documentation:**
- Setup MongoDB: `PANDUAN-SETUP-MONGODB.md`
- Restore Database: `CARA-RESTORE-DATABASE.md`
- Download Page: `https://asset-tracker-dkv.preview.emergentagent.com/download-database.html`

**Common Issues:**
- Check logs first
- Verify .env configuration
- Test MongoDB connection
- Restart aplikasi
- Check Node.js version

---

**Happy deploying! 🚀**

---

*Panduan ini dibuat untuk Sistem Laboran DKV v1.0*
*Last updated: 16 Desember 2025*
