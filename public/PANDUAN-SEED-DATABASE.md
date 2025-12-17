# 🌱 Panduan Seed Database - Sistem Laboran DKV

## 📋 Apa itu Seed Database?

**Seed database** adalah proses mengisi database kosong dengan data awal (sample data) untuk keperluan:
- ✅ Setup awal aplikasi
- ✅ Testing dan development
- ✅ Reset database ke kondisi default
- ✅ Demo aplikasi

---

## 📊 Data yang Akan Di-Seed:

### 1. **Users (3 akun):**
- `admin` / `admin123` (Administrator - full access)
- `laboran` / `laboran123` (Laboran DKV)
- `guru` / `guru123` (Guru DKV)

### 2. **Kategori (7 items):**
- Kamera
- Lensa
- Tripod
- Lighting
- Komputer
- Audio
- Aksesoris

### 3. **Barang (10 items):**
- Canon EOS 90D (2 unit - Normal)
- Sony A7 III (1 unit - Normal)
- Nikon D850 (1 unit - Rusak bisa dipakai)
- Canon EF 50mm f/1.8 (3 unit - Normal)
- Manfrotto MT055 Tripod (5 unit - Normal)
- Godox SL-60W Lighting (1 unit - Rusak)
- iMac 27" 2020 (1 unit - Normal)
- Rode VideoMic Pro (2 unit - Normal)
- Zhiyun Crane 3S (1 unit - Normal)
- SanDisk Extreme Pro 128GB (10 unit - Normal)

### 4. **Setting:**
- Profil sekolah (nama, alamat, telepon, email)

---

## 🚀 Cara 1: Via SSH (Paling Mudah)

### **Untuk VPS/Dedicated/Cloud Hosting:**

**Step 1: Login SSH**
```bash
ssh username@your-server.com
```

**Step 2: Navigate ke folder aplikasi**
```bash
cd ~/public_html/laboran-dkv
# atau
cd /path/to/your/application
```

**Step 3: Pastikan file .env sudah ada**
```bash
cat .env
# Harus ada MONGO_URL
```

**Step 4: Jalankan seed script**
```bash
node scripts/seed.js
```

**Output yang diharapkan:**
```
Connected to MongoDB
Cleared existing data
Created users:
  - admin / admin123 (Role: admin)
  - laboran / laboran123 (Role: laboran)
  - guru / guru123 (Role: guru)
Created categories
Created sample barang
Created school settings

✅ Seed data berhasil dibuat!

🔐 Login credentials:
   Admin: admin / admin123
   Laboran: laboran / laboran123
   Guru: guru / guru123
```

✅ **Selesai!** Database sudah terisi dengan data sample.

---

## 🌐 Cara 2: Via cPanel Terminal (Jika Tersedia)

Beberapa cPanel modern memiliki fitur Terminal/Shell.

**Step 1: Login cPanel**

**Step 2: Cari "Terminal" atau "Shell Access"**

**Step 3: Jalankan command:**
```bash
cd ~/public_html/laboran-dkv
node scripts/seed.js
```

---

## 📝 Cara 3: Via cPanel Cron Job (Scheduled)

Jika tidak ada SSH access, gunakan Cron Job sekali jalan.

**Step 1: Login cPanel → Cron Jobs**

**Step 2: Add New Cron Job**

**Minute:** 0
**Hour:** 0 (atau jam kapan saja)
**Day:** * (semua hari)
**Month:** * (semua bulan)
**Weekday:** * (semua hari dalam minggu)

**Command:**
```bash
cd ~/public_html/laboran-dkv && /usr/bin/node scripts/seed.js > ~/seed-log.txt 2>&1
```

**Step 3: Save**

**Step 4: Tunggu cron berjalan atau trigger manual**

**Step 5: Cek hasil:**
```bash
cat ~/seed-log.txt
```

**Step 6: Hapus cron job setelah selesai**

---

## 🔄 Cara 4: Via Node.js REPL di cPanel

**Step 1: Login cPanel → Setup Node.js App**

**Step 2: Klik "Run Node.js Script"** (jika ada)

**Step 3: Paste script seed:**
```javascript
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGO_URL;

async function seed() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('laboran_dkv');
    
    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('barang').deleteMany({});
    await db.collection('kategori').deleteMany({});
    console.log('Cleared existing data');
    
    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const laboranPassword = await bcrypt.hash('laboran123', 10);
    
    await db.collection('users').insertMany([
      {
        username: 'admin',
        password: adminPassword,
        nama: 'Administrator',
        role: 'admin',
        createdAt: new Date()
      },
      {
        username: 'laboran',
        password: laboranPassword,
        nama: 'Laboran DKV',
        role: 'laboran',
        createdAt: new Date()
      }
    ]);
    
    console.log('✅ Seed completed!');
    
  } finally {
    await client.close();
  }
}

seed();
```

---

## 🛠️ Cara 5: Manual Seed via Web UI (No SSH Required)

Jika tidak ada akses SSH sama sekali, gunakan fitur **Restore Database**.

**Step 1: Download file backup**
```
https://dkvlab.preview.emergentagent.com/backup-laboran-dkv-2025-12-16.json
```

**Step 2: Login ke aplikasi**
- Username: `admin`
- Password: `admin123`
- (Jika belum ada user, buat manual dulu via MongoDB Atlas dashboard)

**Step 3: Menu Setting → Manajemen Database**

**Step 4: Klik "Pilih File Backup"**

**Step 5: Upload file JSON**

**Step 6: Konfirmasi restore**

✅ **Database terisi dengan data lengkap!**

---

## 🔧 Cara 6: Via MongoDB Compass (GUI)

**Step 1: Install MongoDB Compass**
- Download: https://www.mongodb.com/products/compass

**Step 2: Connect ke MongoDB**
- Connection string: Dari `.env` file Anda

**Step 3: Buat Database: `laboran_dkv`**

**Step 4: Import Collections:**

**a) Import Users:**
```json
[
  {
    "username": "admin",
    "password": "$2a$10$encrypted_password_here",
    "nama": "Administrator",
    "role": "admin",
    "createdAt": {"$date": "2025-12-16T00:00:00.000Z"}
  }
]
```

**b) Import Kategori:**
```json
[
  {"nama": "Kamera", "deskripsi": "Kamera DSLR, Mirrorless"},
  {"nama": "Lensa", "deskripsi": "Berbagai jenis lensa"}
]
```

**c) Atau gunakan feature "Import Data" → Select JSON file**

---

## 🧹 Reset Database (Clear & Re-Seed)

Jika ingin reset database ke kondisi awal:

**Via SSH:**
```bash
cd ~/public_html/laboran-dkv
node scripts/seed.js
```
Script otomatis akan:
1. ✅ Hapus semua data lama
2. ✅ Insert data baru
3. ✅ Konfirmasi selesai

**Via Web UI:**
```bash
# Menu Setting → Manajemen Database
# 1. Klik "Hapus Semua Data" (konfirmasi 2x)
# 2. Klik "Restore Database" → Upload backup
```

---

## ⚙️ Custom Seed Data

Jika ingin customize data seed:

**Step 1: Edit file seed**
```bash
nano ~/public_html/laboran-dkv/scripts/seed.js
```

**Step 2: Tambah/Edit data:**

**Contoh menambah user:**
```javascript
{
  username: 'newuser',
  password: await bcrypt.hash('password123', 10),
  nama: 'New User Name',
  role: 'laboran',
  createdAt: new Date()
}
```

**Contoh menambah kategori:**
```javascript
{
  nama: 'Video',
  deskripsi: 'Peralatan produksi video',
  createdAt: new Date()
}
```

**Contoh menambah barang:**
```javascript
{
  nama: 'Item Name',
  kategori: 'Kamera',
  serial: 'SERIAL-001',
  kondisi: 'normal',
  lokasi: 'Rak A1',
  jumlah: 1,
  spesifikasi: 'Detail spesifikasi',
  tahunPembelian: '2024',
  foto: null,
  galeri: [],
  riwayatKerusakan: [],
  createdAt: new Date(),
  updatedAt: new Date()
}
```

**Step 3: Save file (Ctrl+X, Y, Enter)**

**Step 4: Run seed:**
```bash
node scripts/seed.js
```

---

## 📊 Verifikasi Seed Berhasil

### **Via Web UI:**

1. **Login:** `https://yourdomain.com`
2. **Credentials:** `admin` / `admin123`
3. **Cek Dashboard:**
   - ✅ Total Barang: 10
   - ✅ Barang Normal: 8
   - ✅ Barang Rusak: 2

4. **Cek Menu Inventaris:**
   - ✅ 10 barang tampil
   - ✅ Filter kategori berfungsi

5. **Cek Menu Users (Admin):**
   - ✅ 3 users: admin, laboran, guru

6. **Cek Menu Setting:**
   - ✅ 7 kategori
   - ✅ Profil sekolah terisi

### **Via MongoDB Compass:**

1. **Connect** ke database
2. **Database:** `laboran_dkv`
3. **Check collections:**
   - `users` → 3 documents
   - `kategori` → 7 documents
   - `barang` → 10 documents
   - `setting` → 1 document

### **Via SSH (MongoDB Shell):**

```bash
# Connect ke MongoDB
mongosh "your-connection-string"

# Switch database
use laboran_dkv

# Count documents
db.users.countDocuments()
# Expected: 3

db.barang.countDocuments()
# Expected: 10

db.kategori.countDocuments()
# Expected: 7

# List users
db.users.find({}, {username: 1, role: 1})
```

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot connect to MongoDB"

**Penyebab:** Connection string salah

**Solusi:**
```bash
# Cek .env file
cat .env | grep MONGO_URL

# Test connection
mongosh "mongodb+srv://user:pass@cluster.net/laboran_dkv"
```

---

### ❌ Error: "bcryptjs not found"

**Penyebab:** Dependencies belum terinstall

**Solusi:**
```bash
cd ~/public_html/laboran-dkv
npm install bcryptjs mongodb
node scripts/seed.js
```

---

### ❌ Error: "Permission denied"

**Penyebab:** File permissions salah

**Solusi:**
```bash
chmod 755 scripts/seed.js
node scripts/seed.js
```

---

### ❌ Script berjalan tapi data tidak muncul

**Penyebab:** Database name salah

**Solusi:**
```bash
# Cek database name di seed.js (line 27)
# Harus: laboran_dkv

# Atau edit MONGO_URL di .env
# Pastikan ada /laboran_dkv di akhir URL
```

---

### ❌ Password hash tidak cocok

**Penyebab:** bcrypt version berbeda

**Solusi:**
```bash
# Reset password via web
# Login → Users → Edit user → Change password

# Atau seed ulang dengan bcryptjs versi sama
npm install bcryptjs@2.4.3
node scripts/seed.js
```

---

## 🔄 Backup Before Seed

**PENTING:** Selalu backup sebelum seed jika ada data penting!

**Via Web UI:**
```
1. Login → Setting → Manajemen Database
2. Klik "Backup Sekarang"
3. Save file: backup-YYYY-MM-DD.json
4. Jalankan seed
5. Jika ada masalah → Restore dari backup
```

**Via SSH:**
```bash
# Backup via mongodump
mongodump --uri="mongodb+srv://user:pass@cluster.net/laboran_dkv" --out=backup-$(date +%Y%m%d)

# Seed
node scripts/seed.js

# Restore jika perlu
mongorestore --uri="mongodb+srv://user:pass@cluster.net/laboran_dkv" backup-20251216/laboran_dkv
```

---

## 📝 Seed Script Package.json

Untuk kemudahan, tambahkan script di `package.json`:

```json
{
  "scripts": {
    "seed": "node scripts/seed.js",
    "seed:dev": "NODE_ENV=development node scripts/seed.js",
    "seed:prod": "NODE_ENV=production node scripts/seed.js"
  }
}
```

**Usage:**
```bash
npm run seed
# atau
yarn seed
```

---

## 🎯 Use Cases

### **Use Case 1: Setup Baru**
```bash
# Install aplikasi → Setup MongoDB → Seed
cd ~/public_html/laboran-dkv
npm install
node scripts/seed.js
# Login → admin/admin123
```

### **Use Case 2: Development/Testing**
```bash
# Reset database untuk testing
node scripts/seed.js
# Test fitur dengan data fresh
```

### **Use Case 3: Demo/Presentasi**
```bash
# Seed dengan data sample
node scripts/seed.js
# Demo aplikasi dengan data lengkap
```

### **Use Case 4: Production Setup**
```bash
# Seed user admin saja
# Edit seed.js → Comment sample barang
node scripts/seed.js
# Tambah data real via web UI
```

---

## 🔒 Security Note

**PENTING setelah seed:**

1. ✅ **Ganti password default:**
   - `admin` / `admin123` → password kuat
   - `laboran` / `laboran123` → password kuat
   - `guru` / `guru123` → password kuat atau hapus

2. ✅ **Hapus user test/demo** (jika production)

3. ✅ **Backup database** setelah setup production

4. ✅ **Jangan commit** file `.env` ke Git

---

## 📋 Checklist After Seed

- [ ] Seed script berjalan tanpa error
- [ ] Database memiliki 3 users
- [ ] Database memiliki 7 kategori
- [ ] Database memiliki 10 barang sample
- [ ] Login admin berhasil (admin/admin123)
- [ ] Dashboard menampilkan stats yang benar
- [ ] Grafik muncul (akan kosong karena belum ada peminjaman)
- [ ] Menu inventaris menampilkan 10 barang
- [ ] Password default sudah diganti
- [ ] Backup database dibuat

---

## 🎉 Selesai!

Database Anda sekarang terisi dengan data sample dan siap digunakan!

### 🔐 Login Credentials:
- **Admin**: `admin` / `admin123`
- **Laboran**: `laboran` / `laboran123`
- **Guru**: `guru` / `guru123`

### 📊 Data Sample:
- **Users**: 3
- **Kategori**: 7
- **Barang**: 10
- **Peminjaman**: 0 (tambah manual)

### ⚠️ JANGAN LUPA:
**Ganti password default sebelum production!**

---

**Happy seeding! 🌱**

---

*Panduan ini dibuat untuk Sistem Laboran DKV v1.0*
*Last updated: 16 Desember 2025*
