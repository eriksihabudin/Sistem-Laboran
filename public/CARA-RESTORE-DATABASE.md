# 📦 Cara Restore Database Sistem Laboran DKV

## 📥 Download File Backup

File backup database tersedia di:
- **URL**: https://dkvlab.preview.emergentagent.com/backup-laboran-dkv-2025-12-16.json
- **Size**: ~17.65 KB
- **Format**: JSON

### Isi Database:
- ✅ **3 Users** (admin, laboran, dan 1 user tambahan)
- ✅ **14 Barang** inventaris
- ✅ **9 Peminjaman** (history lengkap)
- ✅ **9 Kategori** barang
- ✅ **1 Setting** profil sekolah

---

## 🔐 Default User Credentials

Setelah restore, Anda bisa login dengan:

### 👤 Admin
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator (full access)

### 👤 Laboran
- **Username**: `laboran`
- **Password**: `laboran123`
- **Role**: Laboran

### 👤 User Test
- **Username**: `testsiswa`
- **Password**: `testsiswa123`
- **Role**: Guru

---

## 🚀 Cara Restore di Hosting Anda

### Metode 1: Menggunakan UI (Paling Mudah)

1. **Login sebagai Admin**
   - Buka aplikasi Anda
   - Login dengan username: `admin`, password: `admin123`

2. **Buka Menu Setting**
   - Klik tab "Setting" di navigasi

3. **Scroll ke "Manajemen Database"**
   - Cari section berwarna orange dengan judul "Manajemen Database"

4. **Restore Database**
   - Klik tombol **"Pilih File Backup"**
   - Upload file `backup-laboran-dkv-2025-12-16.json`
   - Konfirmasi peringatan (data lama akan diganti)
   - Tunggu proses restore selesai
   - Halaman akan reload otomatis

5. **✅ Selesai!**
   - Dashboard akan menampilkan semua data
   - Cek grafik dan statistik untuk verifikasi

---

### Metode 2: Menggunakan API (Advanced)

```bash
# 1. Login untuk mendapatkan token
TOKEN=$(curl -s 'https://your-domain.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

# 2. Restore database
curl -X POST 'https://your-domain.com/api/database/restore' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d @backup-laboran-dkv-2025-12-16.json
```

---

### Metode 3: Menggunakan Node.js Script

```javascript
const fs = require('fs');
const https = require('https');

// Read backup file
const backup = JSON.parse(fs.readFileSync('backup-laboran-dkv-2025-12-16.json', 'utf8'));

// Login
const loginData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

const loginReq = https.request('https://your-domain.com/api/auth/login', {
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
    
    // Restore
    const restoreData = JSON.stringify(backup);
    const restoreReq = https.request('https://your-domain.com/api/database/restore', {
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

---

## ⚠️ Penting: Sebelum Restore

### ✅ Pastikan:
1. **MongoDB sudah terinstall** dan running di hosting Anda
2. **Environment variable** `MONGO_URL` sudah di-set dengan benar
3. **Aplikasi Next.js** sudah berjalan
4. Anda sudah **backup data lama** (jika ada)

### 🔒 Keamanan:
- Setelah restore, **SEGERA GANTI PASSWORD** default untuk semua user
- Password default hanya untuk setup awal
- Pastikan hanya admin yang bisa akses fitur Database Management

---

## 🔄 Update Password Setelah Restore

### Via UI:
1. Login sebagai admin
2. Buka menu "Users"
3. Klik tombol "Edit" pada user
4. Masukkan password baru
5. Klik "Simpan Perubahan"

### Via API:
```bash
curl -X PUT 'https://your-domain.com/api/users/{user_id}' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nama": "Administrator",
    "role": "admin",
    "password": "password_baru_yang_kuat"
  }'
```

---

## 📊 Verifikasi Setelah Restore

Cek bahwa semua data berhasil di-restore:

### Dashboard Stats:
- ✅ Total Barang: **14**
- ✅ Barang Normal: **7**
- ✅ Barang Rusak: **3**
- ✅ Peminjaman Aktif: sesuai tanggal

### Grafik:
- ✅ **Grafik Peminjaman Bulanan**: harus menampilkan data Oktober & November 2025
- ✅ **Grafik Kerusakan Barang**: harus menampilkan data per kategori

### Data:
- ✅ Menu **Inventaris**: harus ada 14 barang (Kamera, Lensa, Audio, dll)
- ✅ Menu **Peminjaman**: harus ada 9 peminjaman dengan status berbeda
- ✅ Menu **Users**: harus ada 3 users (admin, laboran, testsiswa)
- ✅ Menu **Setting > Kategori**: harus ada 9 kategori

---

## 🛠️ Troubleshooting

### Grafik Peminjaman Kosong Setelah Restore
✅ **SUDAH DIPERBAIKI!** Versi terbaru sudah include fix untuk konversi date.

Jika masih ada masalah:
1. Pastikan menggunakan endpoint `/api/database/restore` versi terbaru
2. Endpoint ini otomatis mengkonversi string date ke Date object
3. Refresh halaman setelah restore

### Error "Format backup tidak valid"
- Pastikan file JSON tidak corrupt
- Cek struktur file memiliki `data` dan `version` field
- Download ulang file backup

### Error "Unauthorized"
- Pastikan login sebagai **admin**
- Hanya admin yang bisa restore database
- Cek token masih valid

---

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Cek file log di `/var/log/supervisor/nextjs.out.log`
2. Pastikan MongoDB running: `sudo supervisorctl status`
3. Restart aplikasi: `sudo supervisorctl restart nextjs`

---

## 📝 Catatan Tambahan

### Backup Reguler:
Disarankan untuk membuat backup secara berkala:
- **Harian**: jika data sering berubah
- **Mingguan**: untuk operasi normal
- **Sebelum update**: selalu backup sebelum update sistem

### Format Backup:
File backup berisi semua data dalam format JSON dengan struktur:
```json
{
  "timestamp": "2025-12-16T...",
  "version": "1.0",
  "data": {
    "users": [...],
    "barang": [...],
    "peminjaman": [...],
    "kategori": [...],
    "setting": [...]
  }
}
```

---

✅ **Database siap digunakan!** Selamat menggunakan Sistem Laboran DKV! 🎉
