/**
 * Script untuk Restore Backup Database ke MongoDB Atlas
 * 
 * Cara pakai:
 * 1. Edit MONGO_URL di bawah dengan connection string Atlas Anda
 * 2. Download file backup: backup-laboran-dkv-2025-12-16.json
 * 3. Letakkan di folder yang sama dengan script ini
 * 4. Run: node restore-to-atlas.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// ============================================
// KONFIGURASI - EDIT BAGIAN INI!
// ============================================

// MongoDB Atlas Connection String
// Format: mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
const MONGO_URL = "mongodb+srv://laboran_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/laboran_dkv?retryWrites=true&w=majority";

// File backup yang akan di-restore
const BACKUP_FILE = "backup-laboran-dkv-2025-12-16.json";

// ============================================
// JANGAN EDIT DI BAWAH INI
// ============================================

// Helper to convert date strings to Date objects
const convertDates = (obj) => {
  if (!obj) return obj;
  
  const dateFields = ['createdAt', 'updatedAt', 'tanggalPinjam', 'tanggalDikembalikan', 
                      'tanggalKembaliRencana', 'tanggal'];
  
  for (const field of dateFields) {
    if (obj[field] && typeof obj[field] === 'string') {
      obj[field] = new Date(obj[field]);
    }
  }
  
  // Handle nested riwayatKerusakan in barang
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

async function restore() {
  console.log('🌱 MongoDB Atlas Restore Script');
  console.log('================================\n');
  
  // Check if backup file exists
  const backupPath = path.join(__dirname, BACKUP_FILE);
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Error: Backup file not found: ${BACKUP_FILE}`);
    console.error(`   Place the backup file in: ${__dirname}`);
    process.exit(1);
  }
  
  // Read backup file
  console.log(`📁 Reading backup file: ${BACKUP_FILE}`);
  let backup;
  try {
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    backup = JSON.parse(backupContent);
    console.log(`✅ Backup file loaded successfully`);
  } catch (error) {
    console.error(`❌ Error reading backup file: ${error.message}`);
    process.exit(1);
  }
  
  // Validate backup structure
  if (!backup.data || !backup.version) {
    console.error('❌ Error: Invalid backup file format');
    process.exit(1);
  }
  
  console.log(`\n📊 Backup Info:`);
  console.log(`   Version: ${backup.version}`);
  console.log(`   Timestamp: ${backup.timestamp}`);
  console.log(`   Users: ${backup.data.users?.length || 0}`);
  console.log(`   Barang: ${backup.data.barang?.length || 0}`);
  console.log(`   Peminjaman: ${backup.data.peminjaman?.length || 0}`);
  console.log(`   Kategori: ${backup.data.kategori?.length || 0}`);
  console.log(`   Setting: ${backup.data.setting?.length || 0}`);
  
  // Connect to MongoDB Atlas
  console.log(`\n🔌 Connecting to MongoDB Atlas...`);
  
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    console.log(`✅ Connected to MongoDB Atlas`);
    
    const db = client.db();
    const dbName = db.databaseName;
    console.log(`📊 Database: ${dbName}`);
    
    // Clear existing data
    console.log(`\n🗑️  Clearing existing data...`);
    await db.collection('users').deleteMany({});
    await db.collection('barang').deleteMany({});
    await db.collection('peminjaman').deleteMany({});
    await db.collection('kategori').deleteMany({});
    await db.collection('setting').deleteMany({});
    console.log(`✅ Existing data cleared`);
    
    // Insert data with date conversion
    console.log(`\n📥 Inserting data...`);
    
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
    
    console.log(`\n✅ Restore completed successfully!`);
    console.log(`\n🎉 Database Summary:`);
    console.log(`   Database: ${dbName}`);
    console.log(`   Users: ${backup.data.users?.length || 0}`);
    console.log(`   Barang: ${backup.data.barang?.length || 0}`);
    console.log(`   Peminjaman: ${backup.data.peminjaman?.length || 0}`);
    console.log(`   Kategori: ${backup.data.kategori?.length || 0}`);
    console.log(`   Setting: ${backup.data.setting?.length || 0}`);
    
    console.log(`\n🔐 Login Credentials:`);
    console.log(`   Admin: admin / admin123`);
    console.log(`   Laboran: laboran / laboran123`);
    console.log(`\n⚠️  JANGAN LUPA: Ganti password default sebelum production!`);
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error(`\nTroubleshooting:`);
    console.error(`1. Check connection string (MONGO_URL)`);
    console.error(`2. Verify username & password`);
    console.error(`3. Check network access in MongoDB Atlas (whitelist 0.0.0.0/0)`);
    console.error(`4. Ensure database name is correct in connection string`);
    process.exit(1);
  } finally {
    await client.close();
    console.log(`\n🔌 Connection closed`);
  }
}

// Run restore
restore();
