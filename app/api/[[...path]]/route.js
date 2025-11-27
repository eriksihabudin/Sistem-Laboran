import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const uri = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'laboran-dkv-secret-key-2025';

let client;
let clientPromise;

if (!client) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

async function getDb() {
  const client = await clientPromise;
  return client.db('laboran_dkv');
}

// Helper untuk verifikasi token
function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Helper untuk mendapatkan waktu Jakarta (UTC+7)
function getJakartaTime() {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
}

// Helper untuk upload file
async function saveFile(file, folder = 'barang') {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    return `/uploads/${folder}/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const pathname = request.nextUrl.pathname.replace('/api', '');
    const db = await getDb();

    // === AUTH ENDPOINTS ===
    if (pathname === '/auth/login') {
      const { username, password } = await request.json();
      
      const users = db.collection('users');
      const user = await users.findOne({ username });
      
      if (!user) {
        return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
      }
      
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return NextResponse.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          nama: user.nama,
          role: user.role
        }
      });
    }

    if (pathname === '/auth/register') {
      const userData = verifyToken(request);
      if (!userData || userData.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const data = await request.json();
      const users = db.collection('users');
      
      const exists = await users.findOne({ username: data.username });
      if (exists) {
        return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
      }
      
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newUser = {
        username: data.username,
        password: hashedPassword,
        nama: data.nama,
        role: data.role,
        kelas: data.kelas || null,
        jabatan: data.jabatan || null,
        createdAt: new Date()
      };
      
      const result = await users.insertOne(newUser);
      return NextResponse.json({ id: result.insertedId, message: 'User berhasil ditambahkan' });
    }

    // === BARANG ENDPOINTS ===
    if (pathname === '/barang') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const formData = await request.formData();
      const nama = formData.get('nama');
      const kategori = formData.get('kategori');
      const serial = formData.get('serial');
      const kondisi = formData.get('kondisi');
      const lokasi = formData.get('lokasi');
      const jumlah = parseInt(formData.get('jumlah'));
      const spesifikasi = formData.get('spesifikasi');
      const tahunPembelian = formData.get('tahunPembelian');
      const foto = formData.get('foto');
      
      let fotoUrl = null;
      if (foto && foto.size > 0) {
        fotoUrl = await saveFile(foto, 'barang');
      }
      
      const barang = {
        nama,
        kategori,
        serial,
        kondisi: kondisi || 'normal',
        lokasi,
        jumlah,
        spesifikasi,
        tahunPembelian,
        foto: fotoUrl,
        galeri: [],
        riwayatKerusakan: [],
        createdAt: getJakartaTime(),
        updatedAt: getJakartaTime()
      };
      
      const result = await db.collection('barang').insertOne(barang);
      return NextResponse.json({ id: result.insertedId, message: 'Barang berhasil ditambahkan' });
    }

    if (pathname === '/barang/galeri') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const formData = await request.formData();
      const barangId = formData.get('barangId');
      const foto = formData.get('foto');
      
      if (foto && foto.size > 0) {
        const fotoUrl = await saveFile(foto, 'barang');
        
        await db.collection('barang').updateOne(
          { _id: new ObjectId(barangId) },
          { 
            $push: { galeri: fotoUrl },
            $set: { updatedAt: getJakartaTime() }
          }
        );
        
        return NextResponse.json({ fotoUrl, message: 'Foto ditambahkan ke galeri' });
      }
      
      return NextResponse.json({ error: 'Foto tidak valid' }, { status: 400 });
    }

    // === PEMINJAMAN ENDPOINTS ===
    if (pathname === '/peminjaman') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const formData = await request.formData();
      const namaPeminjam = formData.get('namaPeminjam');
      const kelasjabatan = formData.get('kelasjabatan');
      const barangIds = formData.get('barangIds');
      const tanggalKembali = formData.get('tanggalKembali');
      const jamKembali = formData.get('jamKembali');
      const catatan = formData.get('catatan');
      const suratFile = formData.get('surat');
      
      // Auto-generate tanggal dan jam pinjam (saat ini) - UTC+7 Jakarta
      const now = new Date();
      const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const jamPinjam = jakartaTime.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false,
        timeZone: 'Asia/Jakarta'
      });
      
      let suratUrl = null;
      if (suratFile && suratFile.size > 0) {
        suratUrl = await saveFile(suratFile, 'surat');
      }
      
      const barangList = JSON.parse(barangIds);
      
      const peminjaman = {
        namaPeminjam,
        kelasjabatan,
        barang: barangList,
        tanggalPinjam: jakartaTime,
        jamPinjam,
        tanggalKembaliRencana: tanggalKembali ? new Date(tanggalKembali) : null,
        jamKembaliRencana: jamKembali || null,
        status: 'dipinjam',
        surat: suratUrl,
        catatan,
        createdBy: userData.id,
        createdAt: jakartaTime,
        updatedAt: jakartaTime
      };
      
      const result = await db.collection('peminjaman').insertOne(peminjaman);
      
      // Update status barang menjadi sedang dipinjam
      for (const barangId of barangList) {
        await db.collection('barang').updateOne(
          { _id: new ObjectId(barangId) },
          { 
            $set: { statusPeminjaman: 'dipinjam', updatedAt: getJakartaTime() }
          }
        );
      }
      
      return NextResponse.json({ id: result.insertedId, message: 'Peminjaman berhasil dicatat' });
    }

    // === KATEGORI ENDPOINTS ===
    if (pathname === '/kategori') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { nama, deskripsi } = await request.json();
      
      const kategori = {
        nama,
        deskripsi,
        createdAt: new Date()
      };
      
      const result = await db.collection('kategori').insertOne(kategori);
      return NextResponse.json({ id: result.insertedId, message: 'Kategori berhasil ditambahkan' });
    }

    // === SETTING ENDPOINTS ===
    if (pathname === '/setting') {
      const userData = verifyToken(request);
      if (!userData || userData.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const data = await request.json();
      
      await db.collection('setting').updateOne(
        { key: 'sekolah' },
        { $set: { ...data, updatedAt: getJakartaTime() } },
        { upsert: true }
      );
      
      return NextResponse.json({ message: 'Setting berhasil disimpan' });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const pathname = request.nextUrl.pathname.replace('/api', '');
    const { searchParams } = request.nextUrl;
    const db = await getDb();

    // === AUTH CHECK ===
    if (pathname === '/auth/me') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const users = db.collection('users');
      const user = await users.findOne({ _id: new ObjectId(userData.id) });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({
        id: user._id,
        username: user.username,
        nama: user.nama,
        role: user.role
      });
    }

    // === DASHBOARD STATS ===
    if (pathname === '/dashboard/stats') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const barangCollection = db.collection('barang');
      const peminjamanCollection = db.collection('peminjaman');
      
      const totalBarang = await barangCollection.countDocuments();
      const barangNormal = await barangCollection.countDocuments({ kondisi: 'normal' });
      const barangRusak = await barangCollection.countDocuments({ kondisi: 'rusak' });
      const barangRusakBisaDipakai = await barangCollection.countDocuments({ kondisi: 'rusak_bisa_dipakai' });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const peminjamanAktifHariIni = await peminjamanCollection.countDocuments({
        status: 'dipinjam',
        tanggalPinjam: { $gte: today, $lt: tomorrow }
      });
      
      return NextResponse.json({
        totalBarang,
        barangNormal,
        barangRusak,
        barangRusakBisaDipakai,
        peminjamanAktifHariIni
      });
    }

    if (pathname === '/dashboard/peminjaman-terbaru') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const peminjamanCollection = db.collection('peminjaman');
      
      // Get 10 peminjaman terbaru
      const peminjaman = await peminjamanCollection
        .find()
        .sort({ tanggalPinjam: -1 })
        .limit(10)
        .toArray();
      
      // Populate barang data
      for (let p of peminjaman) {
        const barangData = [];
        for (let barangId of p.barang) {
          const b = await db.collection('barang').findOne({ _id: new ObjectId(barangId) });
          if (b) barangData.push(b);
        }
        p.barangData = barangData;
      }
      
      return NextResponse.json(peminjaman);
    }

    if (pathname === '/dashboard/chart/peminjaman') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const year = parseInt(searchParams.get('year') || new Date().getFullYear());
      const peminjamanCollection = db.collection('peminjaman');
      
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      
      const peminjaman = await peminjamanCollection.find({
        tanggalPinjam: { $gte: startDate, $lte: endDate }
      }).toArray();
      
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        bulan: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'][i],
        jumlah: 0
      }));
      
      peminjaman.forEach(p => {
        const month = p.tanggalPinjam.getMonth();
        monthlyData[month].jumlah++;
      });
      
      return NextResponse.json(monthlyData);
    }

    if (pathname === '/dashboard/chart/kerusakan') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const barangCollection = db.collection('barang');
      const kategoriCollection = db.collection('kategori');
      
      // Get all kategori dari database
      const allKategori = await kategoriCollection.find().toArray();
      
      // Aggregate data kerusakan per kategori
      const kerusakanData = await barangCollection.aggregate([
        {
          $group: {
            _id: '$kategori',
            rusak: {
              $sum: { $cond: [{ $eq: ['$kondisi', 'rusak'] }, 1, 0] }
            },
            rusakBisaDipakai: {
              $sum: { $cond: [{ $eq: ['$kondisi', 'rusak_bisa_dipakai'] }, 1, 0] }
            },
            normal: {
              $sum: { $cond: [{ $eq: ['$kondisi', 'normal'] }, 1, 0] }
            }
          }
        }
      ]).toArray();
      
      // Create result array dengan semua kategori dari database
      const result = allKategori.map(k => {
        const data = kerusakanData.find(kd => kd._id === k.nama);
        return {
          kategori: k.nama,
          rusak: data?.rusak || 0,
          rusakBisaDipakai: data?.rusakBisaDipakai || 0,
          normal: data?.normal || 0
        };
      });
      
      // Add kategori 'Lainnya' untuk barang tanpa kategori
      const uncategorized = kerusakanData.find(kd => !kd._id || kd._id === '');
      if (uncategorized) {
        result.push({
          kategori: 'Lainnya',
          rusak: uncategorized.rusak || 0,
          rusakBisaDipakai: uncategorized.rusakBisaDipakai || 0,
          normal: uncategorized.normal || 0
        });
      }
      
      // Filter out kategori dengan total 0 barang
      const filteredResult = result.filter(r => (r.rusak + r.rusakBisaDipakai + r.normal) > 0);
      
      return NextResponse.json(filteredResult);
    }

    // === BARANG ENDPOINTS ===
    if (pathname === '/barang') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const kondisi = searchParams.get('kondisi');
      const kategori = searchParams.get('kategori');
      const search = searchParams.get('search');
      const tahun = searchParams.get('tahun');
      
      let query = {};
      
      if (kondisi) query.kondisi = kondisi;
      if (kategori) query.kategori = kategori;
      if (tahun) query.tahunPembelian = tahun;
      if (search) {
        query.$or = [
          { nama: { $regex: search, $options: 'i' } },
          { serial: { $regex: search, $options: 'i' } }
        ];
      }
      
      const barang = await db.collection('barang').find(query).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(barang);
    }

    if (pathname.startsWith('/barang/')) {
      const id = pathname.split('/').pop();
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const barang = await db.collection('barang').findOne({ _id: new ObjectId(id) });
      if (!barang) {
        return NextResponse.json({ error: 'Barang tidak ditemukan' }, { status: 404 });
      }
      
      // Get riwayat peminjaman
      const peminjaman = await db.collection('peminjaman')
        .find({ barang: id })
        .sort({ tanggalPinjam: -1 })
        .limit(10)
        .toArray();
      
      return NextResponse.json({ ...barang, riwayatPeminjaman: peminjaman });
    }

    // === PEMINJAMAN ENDPOINTS ===
    if (pathname === '/peminjaman') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const status = searchParams.get('status');
      const search = searchParams.get('search');
      const bulan = searchParams.get('bulan');
      const tahun = searchParams.get('tahun');
      
      let query = {};
      
      if (status) query.status = status;
      if (search) {
        query.namaPeminjam = { $regex: search, $options: 'i' };
      }
      if (bulan && tahun) {
        const month = parseInt(bulan) - 1;
        const year = parseInt(tahun);
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        query.tanggalPinjam = { $gte: startDate, $lte: endDate };
      }
      
      const peminjaman = await db.collection('peminjaman')
        .find(query)
        .sort({ tanggalPinjam: -1 })
        .toArray();
      
      // Populate barang data
      for (let p of peminjaman) {
        const barangData = [];
        for (let barangId of p.barang) {
          const b = await db.collection('barang').findOne({ _id: new ObjectId(barangId) });
          if (b) barangData.push(b);
        }
        p.barangData = barangData;
      }
      
      return NextResponse.json(peminjaman);
    }

    if (pathname.startsWith('/peminjaman/')) {
      const id = pathname.split('/').pop();
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const peminjaman = await db.collection('peminjaman').findOne({ _id: new ObjectId(id) });
      if (!peminjaman) {
        return NextResponse.json({ error: 'Peminjaman tidak ditemukan' }, { status: 404 });
      }
      
      // Populate barang data
      const barangData = [];
      for (let barangId of peminjaman.barang) {
        const b = await db.collection('barang').findOne({ _id: new ObjectId(barangId) });
        if (b) barangData.push(b);
      }
      peminjaman.barangData = barangData;
      
      return NextResponse.json(peminjaman);
    }

    // === USER ENDPOINTS ===
    if (pathname === '/users') {
      const userData = verifyToken(request);
      if (!userData || userData.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const users = await db.collection('users')
        .find({}, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
      
      return NextResponse.json(users);
    }

    // === KATEGORI ENDPOINTS ===
    if (pathname === '/kategori') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const kategori = await db.collection('kategori').find().sort({ nama: 1 }).toArray();
      return NextResponse.json(kategori);
    }

    // === SETTING ENDPOINTS ===
    if (pathname === '/setting') {
      const userData = verifyToken(request);
      if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const setting = await db.collection('setting').findOne({ key: 'sekolah' });
      return NextResponse.json(setting || {});
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const pathname = request.nextUrl.pathname.replace('/api', '');
    const db = await getDb();
    const userData = verifyToken(request);
    
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // === BARANG KONDISI UPDATE === (Check this BEFORE /barang/:id)
    if (pathname === '/barang/kondisi') {
      const { barangId, kondisi, deskripsi, foto } = await request.json();
      
      const updateData = {
        kondisi,
        updatedAt: getJakartaTime()
      };
      
      if (kondisi === 'rusak' || kondisi === 'rusak_bisa_dipakai') {
        const kerusakan = {
          tanggal: new Date(),
          deskripsi,
          foto,
          oleh: userData.username || 'System'
        };
        
        await db.collection('barang').updateOne(
          { _id: new ObjectId(barangId) },
          { 
            $set: updateData,
            $push: { riwayatKerusakan: kerusakan }
          }
        );
      } else {
        await db.collection('barang').updateOne(
          { _id: new ObjectId(barangId) },
          { $set: updateData }
        );
      }
      
      return NextResponse.json({ message: 'Kondisi barang berhasil diupdate' });
    }

    // === BARANG UPDATE ===
    if (pathname.startsWith('/barang/')) {
      const id = pathname.split('/').pop();
      
      const formData = await request.formData();
      const updateData = {};
      
      const fields = ['nama', 'kategori', 'serial', 'kondisi', 'lokasi', 'spesifikasi', 'tahunPembelian'];
      fields.forEach(field => {
        const value = formData.get(field);
        if (value !== null) updateData[field] = value;
      });
      
      const jumlah = formData.get('jumlah');
      if (jumlah !== null) updateData.jumlah = parseInt(jumlah);
      
      const foto = formData.get('foto');
      if (foto && foto.size > 0) {
        updateData.foto = await saveFile(foto, 'barang');
      }
      
      updateData.updatedAt = new Date();
      
      await db.collection('barang').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      return NextResponse.json({ message: 'Barang berhasil diupdate' });
    }

    // === PEMINJAMAN RETURN ===
    if (pathname === '/peminjaman/return') {
      const { peminjamanId, kondisiBarang, catatan } = await request.json();
      
      // Auto-generate timestamp pengembalian - UTC+7 Jakarta
      const now = new Date();
      const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const jamDikembalikan = jakartaTime.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false,
        timeZone: 'Asia/Jakarta'
      });
      
      await db.collection('peminjaman').updateOne(
        { _id: new ObjectId(peminjamanId) },
        { 
          $set: { 
            status: 'dikembalikan',
            tanggalDikembalikan: jakartaTime,
            jamDikembalikan: jamDikembalikan,
            kondisiPengembalian: kondisiBarang,
            catatanPengembalian: catatan,
            updatedAt: jakartaTime
          }
        }
      );
      
      // Update status barang
      const peminjaman = await db.collection('peminjaman').findOne({ _id: new ObjectId(peminjamanId) });
      for (const barangId of peminjaman.barang) {
        await db.collection('barang').updateOne(
          { _id: new ObjectId(barangId) },
          { 
            $set: { statusPeminjaman: 'tersedia', updatedAt: new Date() }
          }
        );
      }
      
      return NextResponse.json({ message: 'Barang berhasil dikembalikan' });
    }

    // === USER UPDATE ===
    if (pathname.startsWith('/users/')) {
      if (userData.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const id = pathname.split('/').pop();
      const data = await request.json();
      
      const updateData = {
        nama: data.nama,
        role: data.role,
        kelas: data.kelas,
        jabatan: data.jabatan,
        updatedAt: new Date()
      };
      
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }
      
      await db.collection('users').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      return NextResponse.json({ message: 'User berhasil diupdate' });
    }

    // === KATEGORI UPDATE ===
    if (pathname.startsWith('/kategori/')) {
      const id = pathname.split('/').pop();
      const { nama, deskripsi } = await request.json();
      
      await db.collection('kategori').updateOne(
        { _id: new ObjectId(id) },
        { $set: { nama, deskripsi, updatedAt: new Date() } }
      );
      
      return NextResponse.json({ message: 'Kategori berhasil diupdate' });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const pathname = request.nextUrl.pathname.replace('/api', '');
    const db = await getDb();
    const userData = verifyToken(request);
    
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // === BARANG DELETE ===
    if (pathname.startsWith('/barang/')) {
      const id = pathname.split('/').pop();
      
      await db.collection('barang').deleteOne({ _id: new ObjectId(id) });
      return NextResponse.json({ message: 'Barang berhasil dihapus' });
    }

    // === USER DELETE ===
    if (pathname.startsWith('/users/')) {
      if (userData.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const id = pathname.split('/').pop();
      await db.collection('users').deleteOne({ _id: new ObjectId(id) });
      return NextResponse.json({ message: 'User berhasil dihapus' });
    }

    // === KATEGORI DELETE ===
    if (pathname.startsWith('/kategori/')) {
      const id = pathname.split('/').pop();
      await db.collection('kategori').deleteOne({ _id: new ObjectId(id) });
      return NextResponse.json({ message: 'Kategori berhasil dihapus' });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}