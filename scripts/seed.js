const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

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
    await db.collection('peminjaman').deleteMany({});
    await db.collection('setting').deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const laboranPassword = await bcrypt.hash('laboran123', 10);
    const guruPassword = await bcrypt.hash('guru123', 10);
    
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
      },
      {
        username: 'guru',
        password: guruPassword,
        nama: 'Guru DKV',
        role: 'guru',
        jabatan: 'Guru Mata Pelajaran',
        createdAt: new Date()
      }
    ]);
    
    console.log('Created users:');
    console.log('  - admin / admin123 (Role: admin)');
    console.log('  - laboran / laboran123 (Role: laboran)');
    console.log('  - guru / guru123 (Role: guru)');
    
    // Create categories
    const categories = await db.collection('kategori').insertMany([
      { nama: 'Kamera', deskripsi: 'Kamera DSLR, Mirrorless, dll', createdAt: new Date() },
      { nama: 'Lensa', deskripsi: 'Berbagai jenis lensa kamera', createdAt: new Date() },
      { nama: 'Tripod', deskripsi: 'Tripod dan monopod', createdAt: new Date() },
      { nama: 'Lighting', deskripsi: 'Peralatan pencahayaan', createdAt: new Date() },
      { nama: 'Komputer', deskripsi: 'PC dan laptop untuk editing', createdAt: new Date() },
      { nama: 'Audio', deskripsi: 'Mikrofon dan peralatan audio', createdAt: new Date() },
      { nama: 'Aksesoris', deskripsi: 'Aksesoris pendukung lainnya', createdAt: new Date() }
    ]);
    
    console.log('Created categories');
    
    // Create sample barang
    await db.collection('barang').insertMany([
      {
        nama: 'Canon EOS 90D',
        kategori: 'Kamera',
        serial: 'CAM-001',
        kondisi: 'normal',
        lokasi: 'Rak A1',
        jumlah: 2,
        spesifikasi: 'Sensor APS-C 32.5MP, Video 4K 30fps',
        tahunPembelian: '2023',
        foto: null,
        galeri: [],
        riwayatKerusakan: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Sony A7 III',
        kategori: 'Kamera',
        serial: 'CAM-002',
        kondisi: 'normal',
        lokasi: 'Rak A2',
        jumlah: 1,
        spesifikasi: 'Full Frame 24.2MP, Video 4K',
        tahunPembelian: '2024',
        foto: null,
        galeri: [],
        riwayatKerusakan: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Nikon D850',
        kategori: 'Kamera',
        serial: 'CAM-003',
        kondisi: 'rusak_bisa_dipakai',
        lokasi: 'Rak A3',
        jumlah: 1,
        spesifikasi: 'Full Frame 45.7MP',
        tahunPembelian: '2021',
        foto: null,
        galeri: [],
        riwayatKerusakan: [
          {
            tanggal: new Date('2024-11-15'),
            deskripsi: 'Tombol shutter agak macet, tapi masih bisa digunakan',
            oleh: 'Laboran'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Canon EF 50mm f/1.8',
        kategori: 'Lensa',
        serial: 'LENS-001',
        kondisi: 'normal',
        lokasi: 'Rak B1',
        jumlah: 3,
        spesifikasi: 'Lensa prime 50mm aperture f/1.8',
        tahunPembelian: '2023',
        foto: null,
        galeri: [],
        riwayatKerusakan: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Manfrotto MT055',
        kategori: 'Tripod',
        serial: 'TRI-001',
        kondisi: 'normal',
        lokasi: 'Rak C1',
        jumlah: 5,
        spesifikasi: 'Tripod aluminium max height 170cm',
        tahunPembelian: '2022',
        foto: null,
        galeri: [],
        riwayatKerusakan: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Godox SL-60W',
        kategori: 'Lighting',
        serial: 'LIGHT-001',
        kondisi: 'rusak',
        lokasi: 'Rak D1',
        jumlah: 1,
        spesifikasi: 'LED Video Light 60W',
        tahunPembelian: '2020',
        foto: null,
        galeri: [],
        riwayatKerusakan: [
          {
            tanggal: new Date('2024-12-01'),
            deskripsi: 'Lampu tidak menyala, diduga masalah power supply',
            oleh: 'Laboran'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'iMac 27\" 2020',
        kategori: 'Komputer',
        serial: 'COMP-001',
        kondisi: 'normal',
        lokasi: 'Meja Edit 1',
        jumlah: 1,
        spesifikasi: 'i7, 32GB RAM, 1TB SSD, Retina 5K',
        tahunPembelian: '2020',
        foto: null,
        galeri: [],
        riwayatKerusakan: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Rode VideoMic Pro',
        kategori: 'Audio',
        serial: 'MIC-001',
        kondisi: 'normal',
        lokasi: 'Rak E1',
        jumlah: 2,
        spesifikasi: 'Shotgun microphone',
        tahunPembelian: '2022',
        foto: null,
        galeri: [],
        riwayatKerusakan: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Zhiyun Crane 3S',
        kategori: 'Aksesoris',
        serial: 'ACC-001',
        kondisi: 'normal',
        lokasi: 'Rak F1',
        jumlah: 1,
        spesifikasi: 'Gimbal stabilizer untuk kamera DSLR',
        tahunPembelian: '2023',
        foto: null,
        galeri: [],
        riwayatKerusakan: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'SanDisk Extreme Pro 128GB',
        kategori: 'Aksesoris',
        serial: 'ACC-002',
        kondisi: 'normal',
        lokasi: 'Lemari Kecil',
        jumlah: 10,
        spesifikasi: 'SD Card 128GB UHS-I U3',
        tahunPembelian: '2024',
        foto: null,
        galeri: [],
        riwayatKerusakan: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    console.log('Created sample barang');
    
    // Create school settings
    await db.collection('setting').insertOne({
      key: 'sekolah',
      namaSekolah: 'SMK Negeri 1 Jakarta - Jurusan DKV',
      alamat: 'Jl. Pendidikan No. 123, Jakarta Pusat',
      telepon: '021-12345678',
      email: 'laboran.dkv@smkn1jkt.sch.id',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Created school settings');
    
    console.log('\\n✅ Seed data berhasil dibuat!');
    console.log('\\n🔐 Login credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Laboran: laboran / laboran123');
    console.log('   Guru: guru / guru123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.close();
  }
}

seed();
