# 🌱 Panduan Seed Database ke MongoDB Atlas

## 📋 Tentang MongoDB Atlas

MongoDB Atlas adalah **NoSQL database**, jadi:
- ✅ **Tidak perlu skema** seperti SQL
- ✅ Collections dibuat otomatis saat insert pertama
- ✅ Field bisa berbeda antar dokumen
- ✅ Sangat flexible dan mudah

**Tapi Anda tetap perlu:**
1. Membuat database
2. Menjalankan seed script
3. Verifikasi data

---

## 🚀 Metode 1: Seed via Script Lokal (RECOMMENDED)

### **Step 1: Pastikan MongoDB Atlas Sudah Setup**

Pastikan Anda sudah:
- ✅ Buat cluster di MongoDB Atlas
- ✅ Buat user database
- ✅ Allow network access (0.0.0.0/0)
- ✅ Punya connection string

**Connection String Example:**
```
mongodb+srv://laboran_admin:YourPassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

### **Step 2: Update Connection String Lokal**

Di komputer Anda, buat file `.env`:

```env
MONGO_URL=mongodb+srv://laboran_admin:YourPassword@cluster0.xxxxx.mongodb.net/laboran_dkv?retryWrites=true&w=majority
```

**⚠️ PENTING:**
- Ganti `YourPassword` dengan password Anda
- Tambahkan `/laboran_dkv` sebelum `?` (nama database)

---

### **Step 3: Download Script Seed**

**Opsi A: Clone Repository (Jika punya Git)**
```bash
git clone your-repo-url
cd laboran-dkv
```

**Opsi B: Download Manual**
1. Download file `seed.js` dari: https://creative-lab-12.preview.emergentagent.com/scripts/seed.js
2. Buat folder project: `mkdir laboran-dkv && cd laboran-dkv`
3. Buat folder: `mkdir scripts`
4. Save `seed.js` ke folder `scripts/`

**Opsi C: Copy Script** (lihat di bawah untuk full script)

---

### **Step 4: Install Dependencies**

```bash
# Di folder project
npm init -y
npm install mongodb bcryptjs
```

---

### **Step 5: Jalankan Seed Script**

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

---

### **Step 6: Verifikasi di MongoDB Atlas**

1. **Login ke MongoDB Atlas**: https://cloud.mongodb.com
2. **Klik "Browse Collections"** pada cluster Anda
3. **Database:** `laboran_dkv` harus muncul
4. **Collections:**
   - `users` → 3 documents
   - `kategori` → 7 documents
   - `barang` → 10 documents
   - `setting` → 1 document

✅ **Database berhasil di-seed!**

---

## 🌐 Metode 2: Seed via MongoDB Compass (GUI)

MongoDB Compass adalah **aplikasi desktop** untuk manage MongoDB.

### **Step 1: Install MongoDB Compass**

Download: https://www.mongodb.com/try/download/compass

**Pilih:**
- Platform: Windows/Mac/Linux
- Version: Latest stable
- Package: Full (bukan readonly)

---

### **Step 2: Connect ke MongoDB Atlas**

1. **Buka MongoDB Compass**
2. **Paste connection string:**
   ```
   mongodb+srv://laboran_admin:Password@cluster0.xxxxx.mongodb.net/
   ```
3. **Klik "Connect"**
4. **Tunggu sampai terhubung**

---

### **Step 3: Buat Database**

1. **Klik "Create Database"** (tombol hijau)
2. **Database Name:** `laboran_dkv`
3. **Collection Name:** `users` (collection pertama)
4. **Klik "Create Database"**

---

### **Step 4: Import Data**

**A) Import Users:**

1. **Pilih database:** `laboran_dkv`
2. **Pilih collection:** `users`
3. **Klik "ADD DATA" → Import File**
4. **Select File:** `users.json` (buat dulu, lihat template di bawah)
5. **Klik "Import"**

**Template `users.json`:**
```json
[
  {
    "username": "admin",
    "password": "$2a$10$YourBcryptHashHere",
    "nama": "Administrator",
    "role": "admin",
    "createdAt": {"$date": "2025-12-16T00:00:00.000Z"}
  },
  {
    "username": "laboran",
    "password": "$2a$10$YourBcryptHashHere",
    "nama": "Laboran DKV",
    "role": "laboran",
    "createdAt": {"$date": "2025-12-16T00:00:00.000Z"}
  }
]
```

**B) Import Kategori:**

1. **Create collection:** `kategori`
2. **Import file:** `kategori.json`

**Template `kategori.json`:**
```json
[
  {"nama": "Kamera", "deskripsi": "Kamera DSLR, Mirrorless", "createdAt": {"$date": "2025-12-16T00:00:00.000Z"}},
  {"nama": "Lensa", "deskripsi": "Berbagai jenis lensa", "createdAt": {"$date": "2025-12-16T00:00:00.000Z"}},
  {"nama": "Tripod", "deskripsi": "Tripod dan monopod", "createdAt": {"$date": "2025-12-16T00:00:00.000Z"}},
  {"nama": "Lighting", "deskripsi": "Peralatan pencahayaan", "createdAt": {"$date": "2025-12-16T00:00:00.000Z"}},
  {"nama": "Komputer", "deskripsi": "PC dan laptop", "createdAt": {"$date": "2025-12-16T00:00:00.000Z"}},
  {"nama": "Audio", "deskripsi": "Mikrofon dan audio", "createdAt": {"$date": "2025-12-16T00:00:00.000Z"}},
  {"nama": "Aksesoris", "deskripsi": "Aksesoris pendukung", "createdAt": {"$date": "2025-12-16T00:00:00.000Z"}}
]
```

**C) Ulangi untuk collections lain:**
- `barang`
- `peminjaman`
- `setting`

---

## 📤 Metode 3: Restore Backup ke Atlas

Cara paling mudah jika sudah ada file backup!

### **Step 1: Download Backup**

Download: https://creative-lab-12.preview.emergentagent.com/backup-laboran-dkv-2025-12-16.json

---

### **Step 2: Buat Script Restore**

Buat file `restore-to-atlas.js`:

```javascript
const https = require('https');
const fs = require('fs');

// Read backup file
const backup = JSON.parse(fs.readFileSync('backup-laboran-dkv-2025-12-16.json', 'utf8'));

// Your MongoDB Atlas connection
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://laboran_admin:Password@cluster0.xxxxx.mongodb.net/laboran_dkv?retryWrites=true&w=majority";

async function restore() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('laboran_dkv');
    
    // Helper to convert date strings to Date objects
    const convertDates = (obj) => {
      const dateFields = ['createdAt', 'updatedAt', 'tanggalPinjam', 'tanggalDikembalikan', 'tanggalKembaliRencana', 'tanggal'];
      
      for (const field of dateFields) {
        if (obj[field] && typeof obj[field] === 'string') {
          obj[field] = new Date(obj[field]);
        }
      }
      
      if (obj.riwayatKerusakan && Array.isArray(obj.riwayatKerusakan)) {
        obj.riwayatKerusakan = obj.riwayatKerusakan.map(riwayat => {
          if (riwayat.tanggal && typeof riwayat.tanggal === 'string') {
            riwayat.tanggal = new Date(riwayat.tanggal);
          }
          return riwayat;
        });
      }
      
      return obj;
    };
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('barang').deleteMany({});
    await db.collection('peminjaman').deleteMany({});
    await db.collection('kategori').deleteMany({});
    await db.collection('setting').deleteMany({});
    
    // Insert data with date conversion
    if (backup.data.users && backup.data.users.length > 0) {
      const usersWithDates = backup.data.users.map(convertDates);
      await db.collection('users').insertMany(usersWithDates);
      console.log(`✅ Inserted ${usersWithDates.length} users`);
    }
    
    if (backup.data.barang && backup.data.barang.length > 0) {
      const barangWithDates = backup.data.barang.map(convertDates);
      await db.collection('barang').insertMany(barangWithDates);
      console.log(`✅ Inserted ${barangWithDates.length} barang`);
    }
    
    if (backup.data.peminjaman && backup.data.peminjaman.length > 0) {
      const peminjamanWithDates = backup.data.peminjaman.map(convertDates);
      await db.collection('peminjaman').insertMany(peminjamanWithDates);
      console.log(`✅ Inserted ${peminjamanWithDates.length} peminjaman`);
    }
    
    if (backup.data.kategori && backup.data.kategori.length > 0) {
      const kategoriWithDates = backup.data.kategori.map(convertDates);
      await db.collection('kategori').insertMany(kategoriWithDates);
      console.log(`✅ Inserted ${kategoriWithDates.length} kategori`);
    }
    
    if (backup.data.setting && backup.data.setting.length > 0) {
      const settingWithDates = backup.data.setting.map(convertDates);
      await db.collection('setting').insertMany(settingWithDates);
      console.log(`✅ Inserted ${settingWithDates.length} setting`);
    }
    
    console.log('\n✅ Restore completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${backup.data.users?.length || 0}`);
    console.log(`   Barang: ${backup.data.barang?.length || 0}`);
    console.log(`   Peminjaman: ${backup.data.peminjaman?.length || 0}`);
    console.log(`   Kategori: ${backup.data.kategori?.length || 0}`);
    console.log(`   Setting: ${backup.data.setting?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

restore();
```

---

### **Step 3: Update Connection String**

Edit file `restore-to-atlas.js`:
- Ganti `Password` dengan password Atlas Anda
- Ganti `cluster0.xxxxx` dengan cluster Anda

---

### **Step 4: Install Dependencies**

```bash
npm install mongodb
```

---

### **Step 5: Run Restore**

```bash
node restore-to-atlas.js
```

**Output:**
```
✅ Connected to MongoDB Atlas
🗑️  Clearing existing data...
✅ Inserted 3 users
✅ Inserted 14 barang
✅ Inserted 9 peminjaman
✅ Inserted 9 kategori
✅ Inserted 1 setting

✅ Restore completed successfully!

📊 Summary:
   Users: 3
   Barang: 14
   Peminjaman: 9
   Kategori: 9
   Setting: 1
```

✅ **Database Atlas sekarang terisi lengkap!**

---

## 🔧 Metode 4: Via MongoDB Shell (mongosh)

### **Step 1: Install mongosh**

```bash
# Mac (Homebrew)
brew install mongosh

# Windows (Chocolatey)
choco install mongosh

# Linux
wget https://downloads.mongodb.com/compass/mongosh-latest-linux-x64.tgz
tar -zxvf mongosh-latest-linux-x64.tgz
sudo mv mongosh-*/bin/* /usr/local/bin/
```

---

### **Step 2: Connect ke Atlas**

```bash
mongosh "mongodb+srv://laboran_admin:Password@cluster0.xxxxx.mongodb.net/laboran_dkv"
```

---

### **Step 3: Create Database & Collections**

```javascript
// Switch to database (auto-create)
use laboran_dkv

// Insert sample user
db.users.insertOne({
  username: "admin",
  password: "$2a$10$...", // bcrypt hash
  nama: "Administrator",
  role: "admin",
  createdAt: new Date()
})

// Insert kategori
db.kategori.insertMany([
  {nama: "Kamera", deskripsi: "Kamera DSLR", createdAt: new Date()},
  {nama: "Lensa", deskripsi: "Lensa kamera", createdAt: new Date()}
])

// Verify
db.users.countDocuments()
db.kategori.countDocuments()
```

---

## ✅ Verifikasi Seed Berhasil

### **Via MongoDB Atlas Dashboard:**

1. **Login** https://cloud.mongodb.com
2. **Klik cluster** Anda
3. **Klik "Browse Collections"**
4. **Check:**
   - Database: `laboran_dkv` ✅
   - Collections: `users`, `kategori`, `barang`, `peminjaman`, `setting` ✅
   - Documents count sesuai

---

### **Via MongoDB Compass:**

1. **Connect** ke cluster
2. **Expand database:** `laboran_dkv`
3. **Check each collection:**
   - users: 3 docs
   - kategori: 7 docs
   - barang: 10 docs

---

### **Via Aplikasi Web:**

1. **Update `.env` di aplikasi:**
   ```env
   MONGO_URL=mongodb+srv://user:pass@cluster.net/laboran_dkv?retryWrites=true&w=majority
   ```

2. **Restart aplikasi**

3. **Login:**
   - URL: `https://yourdomain.com`
   - User: `admin`
   - Pass: `admin123`

4. **Check Dashboard:**
   - Total Barang: 10 ✅
   - Grafik muncul ✅
   - Menu berfungsi ✅

---

## 🐛 Troubleshooting

### ❌ **Error: "Authentication failed"**

**Penyebab:** Password salah atau user belum dibuat

**Solusi:**
1. **Check password** di connection string
2. **MongoDB Atlas → Database Access**
3. **Edit user** → Update password
4. **Try again** dengan password baru

---

### ❌ **Error: "Network timeout"**

**Penyebab:** IP tidak di-whitelist

**Solusi:**
1. **MongoDB Atlas → Network Access**
2. **Check IP whitelist**
3. **Add:** `0.0.0.0/0` (allow all)
4. **Wait 2 minutes** untuk propagasi
5. **Try again**

---

### ❌ **Error: "Database not found"**

**Penyebab:** Database name salah

**Solusi:**
1. **Check connection string:** harus ada `/laboran_dkv`
2. **Format benar:**
   ```
   mongodb+srv://user:pass@cluster.net/laboran_dkv?retryWrites=true
   ```
3. **Jika masih error:** buat database manual di Atlas

---

### ❌ **Error: "Module not found"**

**Penyebab:** Dependencies belum terinstall

**Solusi:**
```bash
npm install mongodb bcryptjs
# atau
yarn add mongodb bcryptjs
```

---

### ❌ **Database created tapi empty**

**Penyebab:** Script error atau insert gagal

**Solusi:**
1. **Check script output** - ada error message?
2. **Check network** - internet stable?
3. **Run script again:**
   ```bash
   node scripts/seed.js
   ```
4. **Check logs** untuk error detail

---

## 🔐 Password Hashing untuk Manual Insert

Jika insert user manual, password harus di-hash dengan bcrypt.

### **Generate Hash:**

```javascript
const bcrypt = require('bcryptjs');

// Generate hash
const hash = await bcrypt.hash('admin123', 10);
console.log(hash);
// Output: $2a$10$abcdefghijklmnopqrstuvwxyz...
```

**Atau online:** https://bcrypt-generator.com/
- Input: `admin123`
- Rounds: `10`
- Copy hasil hash

---

## 📋 Checklist Seed Atlas

Sebelum seed:
- [ ] MongoDB Atlas cluster created
- [ ] User database created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied
- [ ] Connection string tested (mongosh/Compass)

After seed:
- [ ] Database `laboran_dkv` exists
- [ ] Collection `users` has 3 documents
- [ ] Collection `kategori` has 7 documents
- [ ] Collection `barang` has 10 documents
- [ ] Can login to web app (admin/admin123)
- [ ] Dashboard shows correct stats

---

## 🎯 Recommended Workflow

### **Untuk Production:**

1. **Setup MongoDB Atlas** (FREE M0 cluster)
2. **Run seed script locally** dengan Atlas connection
3. **Verify via Atlas dashboard**
4. **Deploy aplikasi** ke hosting
5. **Update .env** di hosting dengan Atlas connection
6. **Test login** dari aplikasi web
7. **Ganti password** default
8. **Backup database** via web UI

---

### **Untuk Development:**

1. **MongoDB Atlas** untuk dev database
2. **Seed via script** kapan saja butuh reset
3. **Test features** dengan data fresh
4. **Backup** sebelum experiment

---

## 🎉 Selesai!

Database MongoDB Atlas sekarang terisi dengan data dan siap digunakan!

### 📊 **Yang Sudah Di-Seed:**
- ✅ 3 Users (admin, laboran, guru)
- ✅ 7 Kategori
- ✅ 10 Barang sample
- ✅ 1 Setting profil sekolah

### 🔐 **Login Credentials:**
- Admin: `admin` / `admin123`
- Laboran: `laboran` / `laboran123`

### ⚠️ **JANGAN LUPA:**
**Ganti password default sebelum production!**

---

**Happy seeding to Atlas! ☁️**

---

*Panduan ini dibuat untuk Sistem Laboran DKV v1.0*
*Last updated: 16 Desember 2025*
