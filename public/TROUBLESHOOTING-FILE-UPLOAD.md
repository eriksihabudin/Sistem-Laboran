# 🔧 Troubleshooting: Foto Barang & Surat Tidak Tampil

## ❌ Masalah

Setelah deploy di hosting:
- ✅ File berhasil di-upload (ada di server)
- ❌ Foto barang tidak tampil di browser
- ❌ Surat peminjaman tidak bisa diakses

---

## 🔍 Penyebab Umum

### 1. **File Permissions** (Paling Sering!)
File/folder tidak memiliki permission yang benar untuk diakses via web.

### 2. **Base URL Salah**
URL foto tidak sesuai dengan domain hosting.

### 3. **Next.js Static Files**
Next.js di production tidak serve folder `public/` dengan benar.

### 4. **Path Salah di Database**
Path yang tersimpan di database tidak match dengan struktur folder.

---

## ✅ Solusi 1: Fix File Permissions (WAJIB!)

### **Via SSH:**

```bash
# Navigate ke folder aplikasi
cd ~/public_html/laboran-dkv

# Set permission folder uploads
chmod -R 755 public/uploads

# Set ownership (ganti 'username' dengan username cPanel Anda)
chown -R username:username public/uploads

# Verifikasi permission
ls -la public/uploads
# Output harus: drwxr-xr-x
```

### **Via cPanel File Manager:**

1. **Navigate** ke folder: `public_html/laboran-dkv/public/uploads`
2. **Klik kanan** pada folder `uploads`
3. **Pilih "Change Permissions"**
4. **Set permission:**
   - ✅ Owner: Read, Write, Execute (7)
   - ✅ Group: Read, Execute (5)
   - ✅ Public: Read, Execute (5)
   - **Result: 755**
5. **Centang "Recurse into subdirectories"**
6. **Klik "Change Permissions"**

---

## ✅ Solusi 2: Cek Base URL

### **Verifikasi .env File:**

```bash
# Via SSH
cat ~/public_html/laboran-dkv/.env
```

**Pastikan NEXT_PUBLIC_BASE_URL benar:**

```env
# ✅ BENAR
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# ❌ SALAH (ada trailing slash)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com/

# ❌ SALAH (masih localhost)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Jika salah, edit:**

```bash
# Via SSH
nano ~/public_html/laboran-dkv/.env

# Update NEXT_PUBLIC_BASE_URL
# Save: Ctrl+X, Y, Enter

# Restart aplikasi
# Via cPanel: Setup Node.js App → Restart
```

---

## ✅ Solusi 3: Test Akses File Langsung

### **Test via Browser:**

**Format URL yang benar:**
```
https://yourdomain.com/uploads/barang/1234567890-filename.jpg
```

**Contoh:**
```
https://yourdomain.com/uploads/barang/1732558789053-camera.jpg
https://yourdomain.com/uploads/surat/1732558789053-surat.pdf
```

### **Test via curl (SSH):**

```bash
# Test akses file
curl -I https://yourdomain.com/uploads/barang/filename.jpg

# Expected output:
# HTTP/1.1 200 OK
# Content-Type: image/jpeg

# Jika 403 Forbidden → Problem permission
# Jika 404 Not Found → Problem path atau file tidak ada
```

---

## ✅ Solusi 4: Create .htaccess (Untuk Apache)

Jika pakai Apache server, buat file `.htaccess` di folder `public/uploads/`:

```bash
# Via SSH
cd ~/public_html/laboran-dkv/public/uploads
nano .htaccess
```

**Paste ini:**

```apache
# Allow access to uploaded files
<FilesMatch "\.(jpg|jpeg|png|gif|pdf|doc|docx)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>

# Enable CORS if needed
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>

# Set correct MIME types
<IfModule mod_mime.c>
    AddType image/jpeg .jpg .jpeg
    AddType image/png .png
    AddType image/gif .gif
    AddType application/pdf .pdf
</IfModule>
```

**Save** (Ctrl+X, Y, Enter)

---

## ✅ Solusi 5: Fix Next.js Public Folder

Next.js di production kadang tidak serve `public/` folder dengan benar di cPanel.

### **Opsi A: Symlink ke public_html (Recommended)**

```bash
# Via SSH
cd ~/public_html/laboran-dkv

# Buat symlink dari public/uploads ke root public_html
ln -s ~/public_html/laboran-dkv/public/uploads ~/public_html/uploads

# Test akses
curl -I https://yourdomain.com/uploads/barang/test.jpg
```

### **Opsi B: Copy Uploads ke Document Root**

```bash
# Via SSH
cp -r ~/public_html/laboran-dkv/public/uploads ~/public_html/

# Update permission
chmod -R 755 ~/public_html/uploads
```

⚠️ **Note:** Dengan opsi B, file upload baru tidak akan sync. Lebih baik pakai Opsi A.

---

## ✅ Solusi 6: Update Next.js Config

Edit `next.config.js` untuk configure static file serving:

```bash
# Via SSH
cd ~/public_html/laboran-dkv
nano next.config.js
```

**Tambahkan/Update:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing config...
  
  // Add this for static file serving
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*', // Serve via API route
      },
    ]
  },
  
  // Or use headers for CORS
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

**Save & Restart:**
```bash
# cPanel → Setup Node.js App → Restart
```

---

## ✅ Solusi 7: Serve via Custom API Route

Buat API route khusus untuk serve uploaded files:

**Create file:** `app/api/uploads/[...path]/route.js`

```javascript
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request, { params }) {
  try {
    const { path: filePath } = params;
    const fullPath = join(process.cwd(), 'public', 'uploads', ...filePath);
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Read file
    const fileBuffer = await readFile(fullPath);
    
    // Determine content type
    const ext = fullPath.split('.').pop().toLowerCase();
    const contentTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
```

**Restart aplikasi setelah ini.**

---

## ✅ Solusi 8: Check Database Path

Verifikasi path yang tersimpan di database:

```bash
# Via SSH - Connect ke MongoDB
mongosh "your-connection-string"

# Switch database
use laboran_dkv

# Check sample foto path
db.barang.findOne({foto: {$ne: null}}, {nama: 1, foto: 1})

# Expected output:
# {
#   "_id": ObjectId("..."),
#   "nama": "Canon EOS 90D",
#   "foto": "/uploads/barang/1732558789053-camera.jpg"
# }
```

**Path harus dimulai dengan `/uploads/`**

**Jika path salah (misalnya full path), fix dengan:**

```javascript
// Update all wrong paths
db.barang.updateMany(
  { foto: { $regex: "^/app/public" } },
  [
    {
      $set: {
        foto: {
          $replaceOne: {
            input: "$foto",
            find: "/app/public",
            replacement: ""
          }
        }
      }
    }
  ]
)
```

---

## 🔍 Diagnostic Checklist

Run checklist ini untuk identify masalah:

### **1. Check Folder Exists:**
```bash
ls -la ~/public_html/laboran-dkv/public/uploads
```
**Expected:** Folder `barang`, `surat` ada

### **2. Check Files Exist:**
```bash
find ~/public_html/laboran-dkv/public/uploads -type f | head -10
```
**Expected:** List file foto/surat

### **3. Check Permissions:**
```bash
stat ~/public_html/laboran-dkv/public/uploads/barang
```
**Expected:** Access: (0755/drwxr-xr-x)

### **4. Check Ownership:**
```bash
ls -la ~/public_html/laboran-dkv/public/uploads
```
**Expected:** Owner = cPanel username

### **5. Test Direct Access:**
```bash
curl -I https://yourdomain.com/uploads/barang/filename.jpg
```
**Expected:** HTTP/1.1 200 OK

### **6. Check .env:**
```bash
grep NEXT_PUBLIC_BASE_URL ~/public_html/laboran-dkv/.env
```
**Expected:** NEXT_PUBLIC_BASE_URL=https://yourdomain.com (no trailing slash)

### **7. Check Next.js Serving:**
```bash
curl https://yourdomain.com/api/barang | jq '.[0].foto'
```
**Expected:** "/uploads/barang/filename.jpg"

---

## 🎯 Quick Fix Command (Run All at Once)

```bash
#!/bin/bash
# Quick fix script - Run via SSH

cd ~/public_html/laboran-dkv

# Fix permissions
echo "Fixing permissions..."
chmod -R 755 public/uploads
chown -R $USER:$USER public/uploads

# Create .htaccess
echo "Creating .htaccess..."
cat > public/uploads/.htaccess << 'EOF'
<FilesMatch "\.(jpg|jpeg|png|gif|pdf|doc|docx)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>
EOF

# Test file access
echo ""
echo "Testing file access..."
SAMPLE_FILE=$(find public/uploads -type f -name "*.jpg" | head -1)
if [ -n "$SAMPLE_FILE" ]; then
    FILENAME=$(basename "$SAMPLE_FILE")
    FOLDER=$(basename $(dirname "$SAMPLE_FILE"))
    echo "Test URL: https://$(hostname)/uploads/$FOLDER/$FILENAME"
    curl -I "https://$(hostname)/uploads/$FOLDER/$FILENAME" | head -1
fi

echo ""
echo "✅ Quick fix completed!"
echo "Now restart your application via cPanel Node.js App manager"
```

**Save as:** `fix-uploads.sh`
**Run:** `bash fix-uploads.sh`

---

## 🐛 Error Messages & Solutions

### ❌ Error: "403 Forbidden"
**Cause:** Permission issue
**Fix:**
```bash
chmod -R 755 public/uploads
chown -R username:username public/uploads
```

### ❌ Error: "404 Not Found"
**Cause:** File path salah atau Next.js tidak serve public folder
**Fix:** Gunakan Solusi 5 (Symlink) atau Solusi 7 (API Route)

### ❌ Error: "ERR_CONNECTION_REFUSED"
**Cause:** Aplikasi tidak running
**Fix:** cPanel → Setup Node.js App → Start

### ❌ Error: "Mixed Content" (HTTP vs HTTPS)
**Cause:** NEXT_PUBLIC_BASE_URL pakai HTTP tapi site pakai HTTPS
**Fix:**
```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com  # ← HTTPS!
```

### ❌ Error: "CORS Policy"
**Cause:** Cross-origin request blocked
**Fix:** Add `.htaccess` (Solusi 4) atau headers di `next.config.js`

---

## 📊 Comparison: Serving Methods

| Method | Pros | Cons | Recommended |
|--------|------|------|-------------|
| **Direct Public Access** | ⚡ Fast, simple | May not work on all hosting | ✅ Yes (if works) |
| **Symlink** | ✅ Auto-sync uploads | Requires SSH | ✅ Yes |
| **Copy to Root** | ✅ Works everywhere | ❌ Manual sync needed | ⚠️ Not recommended |
| **API Route** | ✅ Full control | Slightly slower | ✅ Yes (fallback) |

---

## 💡 Best Practice

### **For Production:**

1. **Use Symlink** (Solusi 5A) untuk auto-sync
2. **Set correct permissions** (755)
3. **Add .htaccess** untuk Apache
4. **Configure NEXT_PUBLIC_BASE_URL** dengan benar
5. **Test access** setelah setiap upload

### **For Development:**

1. Files auto-served dari `public/uploads/`
2. No special config needed
3. Just `npm run dev`

---

## ✅ Verification

Setelah apply fix, test ini:

### **1. Upload Foto Baru:**
1. Login → Inventaris → Tambah Barang
2. Upload foto
3. Simpan
4. ✅ Foto harus langsung tampil

### **2. Test Existing Files:**
1. Menu Inventaris
2. Klik detail barang yang sudah ada foto
3. ✅ Foto harus tampil

### **3. Test Surat:**
1. Menu Peminjaman
2. Klik detail peminjaman
3. Klik "Lihat Surat"
4. ✅ PDF/Image harus terbuka

### **4. Test Direct URL:**
```
https://yourdomain.com/uploads/barang/filename.jpg
```
✅ Harus tampil foto, bukan error

---

## 🎉 Done!

Jika semua solusi sudah dicoba dan masih error, **contact hosting support** untuk:
- Enable static file serving
- Check server configuration
- Review security settings

---

## 📞 Need Help?

**Common Issues:**
1. Most cases: Permission issue → Run Quick Fix Script
2. cPanel shared hosting: Use Symlink (Solusi 5A)
3. VPS/Dedicated: Direct access should work

**Still Not Working?**
Share these details:
- Hosting type (Shared/VPS/Cloud)
- Web server (Apache/Nginx)
- Node.js version
- Error message exact text
- Output dari Diagnostic Checklist

---

**Good luck! 🚀**

---

*Troubleshooting guide untuk Sistem Laboran DKV v1.0*
*Last updated: 16 Desember 2025*
