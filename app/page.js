'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Package, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  ClipboardList, 
  Users, 
  Settings, 
  FileText, 
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Upload,
  Camera,
  LogOut,
  Eye,
  Filter,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Dashboard state
  const [stats, setStats] = useState(null);
  const [chartPeminjaman, setChartPeminjaman] = useState([]);
  const [chartKerusakan, setChartKerusakan] = useState([]);
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [peminjamanTerbaru, setPeminjamanTerbaru] = useState([]);

  // Barang state
  const [barang, setBarang] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [barangDetail, setBarangDetail] = useState(null);
  const [filterKondisi, setFilterKondisi] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [searchBarang, setSearchBarang] = useState('');
  const [sortBarang, setSortBarang] = useState('terbaru'); // terbaru, terlama, abjad-az, abjad-za
  const [fotoType, setFotoType] = useState('upload'); // upload atau link
  const [fotoLink, setFotoLink] = useState('');
  const [editFotoType, setEditFotoType] = useState('upload'); // untuk edit barang
  const [editFotoLink, setEditFotoLink] = useState('');

  // Peminjaman state
  const [peminjaman, setPeminjaman] = useState([]);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [filterStatusPeminjaman, setFilterStatusPeminjaman] = useState('');
  const [searchBarangPeminjaman, setSearchBarangPeminjaman] = useState('');
  const [selectedBarangIds, setSelectedBarangIds] = useState([]); // Barang yang dipilih untuk peminjaman

  // Kategori state
  const [kategori, setKategori] = useState([]);

  // Users state
  const [users, setUsers] = useState([]);

  // Setting state
  const [setting, setSetting] = useState({});

  // Laporan state
  const [laporanType, setLaporanType] = useState('Barang Normal');
  const [laporanData, setLaporanData] = useState([]);
  const [laporanSearch, setLaporanSearch] = useState('');
  const [laporanFilterKategori, setLaporanFilterKategori] = useState('');
  const [laporanFilterTahun, setLaporanFilterTahun] = useState('');

  // Clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [laporanMenuExpanded, setLaporanMenuExpanded] = useState(false);
  
  // Filter peminjaman
  const [filterTanggal, setFilterTanggal] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());

  // Dialogs
  const [showBarangDialog, setShowBarangDialog] = useState(false);
  const [showBarangEditDialog, setShowBarangEditDialog] = useState(false);
  const [showBarangDetailDialog, setShowBarangDetailDialog] = useState(false);
  const [showPeminjamanDialog, setShowPeminjamanDialog] = useState(false);
  const [showPengembalianDialog, setShowPengembalianDialog] = useState(false);
  const [showPeminjamanDetailDialog, setShowPeminjamanDetailDialog] = useState(false);
  const [selectedPeminjamanDetail, setSelectedPeminjamanDetail] = useState(null);
  const [selectedPeminjamanReturn, setSelectedPeminjamanReturn] = useState(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showUserEditDialog, setShowUserEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showKategoriDialog, setShowKategoriDialog] = useState(false);
  const [showKategoriEditDialog, setShowKategoriEditDialog] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [showKerusakanDialog, setShowKerusakanDialog] = useState(false);
  const [kerusakanBarang, setKerusakanBarang] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      if (activeTab === 'dashboard') {
        loadDashboard();
        loadBarang(); // Load barang untuk statistik per kategori
        loadKategori(); // Load kategori untuk statistik per kategori
      }
      if (activeTab === 'inventaris') {
        loadBarang();
        loadKategori(); // Load kategori untuk dropdown
      }
      if (activeTab === 'peminjaman') {
        loadPeminjaman();
        loadBarang(); // Load barang untuk form peminjaman baru
      }
      if (activeTab === 'users') loadUsers();
      if (activeTab === 'kategori') loadKategori();
      if (activeTab === 'setting') {
        loadSetting();
        loadKategori();
      }
      if (activeTab === 'laporan') {
        loadLaporan(laporanType);
      }
    }
  }, [user, token, activeTab]);

  useEffect(() => {
    if (user && token && activeTab === 'laporan') {
      loadLaporan(laporanType);
      loadKategori(); // Load kategori untuk filter di Inventaris Lengkap
    }
  }, [laporanType]);

  useEffect(() => {
    if (user && token && activeTab === 'dashboard') {
      loadDashboard();
    }
  }, [chartYear]);

  // Update clock setiap detik dengan timezone Asia/Jakarta
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const apiCall = async (endpoint, options = {}) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    // Don't add Content-Type header if body is FormData
    const isFormData = options.body instanceof FormData;
    if (!isFormData && options.headers && !options.headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: isFormData ? { 'Authorization': `Bearer ${token}` } : headers
    });

    if (response.status === 401) {
      handleLogout();
      throw new Error('Session expired');
    }

    return response;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login gagal');
        setLoading(false);
        return;
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess('Login berhasil!');
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setActiveTab('dashboard');
  };

  const loadDashboard = async () => {
    try {
      const [statsRes, chartPeminjamanRes, chartKerusakanRes, peminjamanTerbaruRes] = await Promise.all([
        apiCall('/dashboard/stats'),
        apiCall(`/dashboard/chart/peminjaman?year=${chartYear}`),
        apiCall('/dashboard/chart/kerusakan'),
        apiCall('/dashboard/peminjaman-terbaru')
      ]);

      const statsData = await statsRes.json();
      const chartPeminjamanData = await chartPeminjamanRes.json();
      const chartKerusakanData = await chartKerusakanRes.json();
      const peminjamanTerbaruData = await peminjamanTerbaruRes.json();

      setStats(statsData);
      setChartPeminjaman(chartPeminjamanData);
      setChartKerusakan(chartKerusakanData);
      setPeminjamanTerbaru(peminjamanTerbaruData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const loadBarang = async () => {
    try {
      let url = '/barang?';
      if (filterKondisi) url += `kondisi=${filterKondisi}&`;
      if (filterKategori) url += `kategori=${filterKategori}&`;
      if (searchBarang) url += `search=${searchBarang}&`;

      const response = await apiCall(url);
      const data = await response.json();
      setBarang(data);
    } catch (err) {
      console.error('Error loading barang:', err);
    }
  };

  const loadBarangDetail = async (id) => {
    try {
      const response = await apiCall(`/barang/${id}`);
      const data = await response.json();
      setBarangDetail(data);
      setShowBarangDetailDialog(true);
    } catch (err) {
      console.error('Error loading barang detail:', err);
      setError('Gagal memuat detail barang');
    }
  };

  const openEditBarang = async (id) => {
    try {
      const response = await apiCall(`/barang/${id}`);
      const data = await response.json();
      setSelectedBarang(data);
      setShowBarangEditDialog(true);
    } catch (err) {
      console.error('Error loading barang for edit:', err);
      setError('Gagal memuat data barang');
    }
  };

  const loadPeminjaman = async () => {
    try {
      let url = '/peminjaman?';
      if (filterStatusPeminjaman) url += `status=${filterStatusPeminjaman}&`;

      const response = await apiCall(url);
      const data = await response.json();
      setPeminjaman(data);
    } catch (err) {
      console.error('Error loading peminjaman:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiCall('/users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const openEditUser = (userObj) => {
    setSelectedUser(userObj);
    setShowUserEditDialog(true);
  };

  const deleteUser = async (userId, username) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${username}"?`)) {
      return;
    }

    try {
      const response = await apiCall(`/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('User berhasil dihapus!');
        loadUsers();
      } else {
        const result = await response.json();
        setError(result.error || 'Gagal menghapus user');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghapus user');
    }
  };

  const loadKategori = async () => {
    try {
      const response = await apiCall('/kategori');
      const data = await response.json();
      setKategori(data);
    } catch (err) {
      console.error('Error loading kategori:', err);
    }
  };

  const loadSetting = async () => {
    try {
      const response = await apiCall('/setting');
      const data = await response.json();
      setSetting(data);
    } catch (err) {
      console.error('Error loading setting:', err);
    }
  };

  const loadLaporan = async (type) => {
    setLaporanType(type);
    setLoading(true);
    setLaporanSearch(''); // Reset search saat ganti tab
    
    try {
      if (type === 'Barang Normal' || type === 'Barang Rusak' || type === 'Barang Rusak Bisa Dipakai') {
        const kondisiMap = {
          'Barang Normal': 'normal',
          'Barang Rusak': 'rusak',
          'Barang Rusak Bisa Dipakai': 'rusak_bisa_dipakai'
        };
        
        const response = await apiCall(`/barang?kondisi=${kondisiMap[type]}`);
        const data = await response.json();
        setLaporanData(data);
      } else if (type === 'Peminjaman Bulanan') {
        const response = await apiCall('/peminjaman');
        const data = await response.json();
        setLaporanData(data);
      } else if (type === 'Inventaris Lengkap') {
        const response = await apiCall('/barang');
        const data = await response.json();
        setLaporanData(data);
      }
    } catch (err) {
      console.error('Error loading laporan:', err);
      setError('Gagal memuat data laporan');
    }
    
    setLoading(false);
  };

  const getFilteredLaporanData = () => {
    let filtered = laporanData;
    
    // Filter by search
    if (laporanSearch) {
      const searchLower = laporanSearch.toLowerCase();
      
      if (laporanType === 'Peminjaman Bulanan') {
        filtered = filtered.filter(item => 
          item.namaPeminjam?.toLowerCase().includes(searchLower) ||
          item.kelasjabatan?.toLowerCase().includes(searchLower) ||
          item.catatan?.toLowerCase().includes(searchLower)
        );
      } else {
        filtered = filtered.filter(item => 
          item.nama?.toLowerCase().includes(searchLower) ||
          item.kategori?.toLowerCase().includes(searchLower) ||
          item.serial?.toLowerCase().includes(searchLower) ||
          item.lokasi?.toLowerCase().includes(searchLower)
        );
      }
    }
    
    // Filter by date for Peminjaman
    if (laporanType === 'Peminjaman Bulanan') {
      filtered = filtered.filter(item => {
        const tanggalPinjam = new Date(item.tanggalPinjam);
        
        // Filter by tanggal (specific date)
        if (filterTanggal) {
          const selectedDate = new Date(filterTanggal);
          if (tanggalPinjam.toDateString() !== selectedDate.toDateString()) {
            return false;
          }
        }
        
        // Filter by bulan
        if (filterBulan) {
          const bulan = parseInt(filterBulan);
          if (tanggalPinjam.getMonth() + 1 !== bulan) {
            return false;
          }
        }
        
        // Filter by tahun
        if (filterTahun) {
          const tahun = parseInt(filterTahun);
          if (tanggalPinjam.getFullYear() !== tahun) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    // Filter by kategori and tahun pembelian for Inventaris Lengkap
    if (laporanType === 'Inventaris Lengkap') {
      // Filter by kategori
      if (laporanFilterKategori && laporanFilterKategori.trim()) {
        filtered = filtered.filter(item => item.kategori === laporanFilterKategori);
      }
      
      // Filter by tahun pembelian
      if (laporanFilterTahun && laporanFilterTahun.trim()) {
        filtered = filtered.filter(item => item.tahunPembelian === laporanFilterTahun);
      }
    }
    
    return filtered;
  };

  const handlePrintLaporan = () => {
    window.print();
  };

  const getAvailableBarang = () => {
    return barang.filter(item => {
      // Filter pencarian
      if (searchBarangPeminjaman) {
        const searchLower = searchBarangPeminjaman.toLowerCase();
        const matchSearch = 
          item.nama?.toLowerCase().includes(searchLower) ||
          item.kategori?.toLowerCase().includes(searchLower) ||
          item.serial?.toLowerCase().includes(searchLower);
        if (!matchSearch) return false;
      }

      // Filter kondisi - hanya normal dan rusak bisa dipakai yang bisa dipinjam
      if (item.kondisi === 'rusak') return false;

      // Check stok - jika jumlah <= 0, tidak bisa dipinjam
      if (!item.jumlah || item.jumlah <= 0) return false;

      return true;
    });
  };

  const isBarangDisabled = (barangId) => {
    const item = barang.find(b => b._id === barangId);
    if (!item) return true;

    // Disabled jika rusak
    if (item.kondisi === 'rusak') return true;

    // Disabled jika stok habis
    if (!item.jumlah || item.jumlah <= 0) return true;

    // Disabled jika sedang dipinjam dan stok = 1
    if (item.statusPeminjaman === 'dipinjam' && item.jumlah <= 1) return true;

    return false;
  };

  const getFilterInfo = () => {
    const info = [];
    
    if (filterTanggal) {
      const date = new Date(filterTanggal);
      info.push(`Tanggal: ${date.toLocaleDateString('id-ID')}`);
    }
    
    if (filterBulan) {
      const bulanNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      info.push(`Bulan: ${bulanNames[parseInt(filterBulan)]}`);
    }
    
    if (filterTahun) {
      info.push(`Tahun: ${filterTahun}`);
    }
    
    return info.length > 0 ? ` (${info.join(', ')})` : '';
  };

  const handleEditKategori = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.target);
      const data = {
        nama: formData.get('nama'),
        deskripsi: formData.get('deskripsi')
      };

      const response = await apiCall(`/kategori/${selectedKategori._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Gagal update kategori');
        setLoading(false);
        return;
      }

      setSuccess('Kategori berhasil diupdate!');
      setTimeout(() => setSuccess(''), 3000);
      setShowKategoriEditDialog(false);
      setSelectedKategori(null);
      loadKategori();
    } catch (err) {
      setError('Terjadi kesalahan saat update kategori');
    }
    setLoading(false);
  };

  const handleDeleteKategori = async (id) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;

    setLoading(true);
    try {
      const response = await apiCall(`/kategori/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menghapus kategori');
        setLoading(false);
        return;
      }

      setSuccess('Kategori berhasil dihapus!');
      setTimeout(() => setSuccess(''), 3000);
      loadKategori();
    } catch (err) {
      setError('Terjadi kesalahan');
    }
    setLoading(false);
  };

  const handleAddBarang = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.target);
      
      // Jika menggunakan link foto, tambahkan ke formData
      if (fotoType === 'link' && fotoLink) {
        formData.set('fotoUrl', fotoLink);
        formData.delete('foto'); // Hapus file foto jika ada
      }
      
      const response = await apiCall('/barang', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menambah barang');
        setLoading(false);
        return;
      }

      setSuccess('Barang berhasil ditambahkan!');
      setShowBarangDialog(false);
      setFotoType('upload'); // Reset ke default
      setFotoLink(''); // Reset link
      loadBarang();
      e.target.reset();
    } catch (err) {
      setError('Terjadi kesalahan saat menambah barang');
    }
    setLoading(false);
  };

  const handleEditBarang = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.target);
      
      // Jika menggunakan link foto, tambahkan ke formData
      if (editFotoType === 'link' && editFotoLink) {
        formData.set('fotoUrl', editFotoLink);
        formData.delete('foto'); // Hapus file foto jika ada
      }
      
      const response = await apiCall(`/barang/${selectedBarang._id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal mengupdate barang');
        setLoading(false);
        return;
      }

      setSuccess('Barang berhasil diupdate!');
      setTimeout(() => setSuccess(''), 3000);
      setShowBarangEditDialog(false);
      setSelectedBarang(null);
      setEditFotoType('upload'); // Reset ke default
      setEditFotoLink(''); // Reset link
      loadBarang();
    } catch (err) {
      setError('Terjadi kesalahan saat mengupdate barang');
    }
    setLoading(false);
  };

  const handleAddPeminjaman = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.target);
      
      // Override barangIds dengan state yang benar
      formData.set('barangIds', JSON.stringify(selectedBarangIds));
      
      const response = await apiCall('/peminjaman', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menambah peminjaman');
        setLoading(false);
        return;
      }

      setSuccess('Peminjaman berhasil dicatat!');
      setShowPeminjamanDialog(false);
      setSelectedBarangIds([]); // Reset selected barang
      loadPeminjaman();
      loadBarang(); // Reload barang untuk update status
      e.target.reset();
    } catch (err) {
      setError('Terjadi kesalahan saat menambah peminjaman');
    }
    setLoading(false);
  };

  const handleReturnBarang = async (peminjaman) => {
    setSelectedPeminjamanReturn(peminjaman);
    setShowPengembalianDialog(true);
  };

  const submitReturnBarang = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target);
      const response = await apiCall('/peminjaman/return', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peminjamanId: selectedPeminjamanReturn._id,
          kondisiBarang: formData.get('kondisiBarang'),
          catatan: formData.get('catatan')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal mengembalikan barang');
        setLoading(false);
        return;
      }

      setSuccess('Barang berhasil dikembalikan!');
      setShowPengembalianDialog(false);
      setSelectedPeminjamanReturn(null);
      loadPeminjaman();
    } catch (err) {
      setError('Terjadi kesalahan');
    }
    setLoading(false);
  };

  const handleDeleteBarang = async (id) => {
    if (!confirm('Yakin ingin menghapus barang ini?')) return;

    setLoading(true);
    try {
      const response = await apiCall(`/barang/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menghapus barang');
        setLoading(false);
        return;
      }

      setSuccess('Barang berhasil dihapus!');
      loadBarang();
    } catch (err) {
      setError('Terjadi kesalahan');
    }
    setLoading(false);
  };

  const handleDeletePeminjaman = async (id) => {
    if (!confirm('Yakin ingin menghapus data peminjaman ini?')) return;

    setLoading(true);
    try {
      const response = await apiCall(`/peminjaman/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menghapus peminjaman');
        setLoading(false);
        return;
      }

      setSuccess('Data peminjaman berhasil dihapus!');
      loadPeminjaman();
    } catch (err) {
      setError('Terjadi kesalahan');
    }
    setLoading(false);
  };

  const handleUpdateKondisi = async (barangId, kondisi) => {
    // Jika kondisi rusak atau rusak_bisa_dipakai, buka dialog untuk catatan
    if (kondisi === 'rusak' || kondisi === 'rusak_bisa_dipakai') {
      setKerusakanBarang({ id: barangId, kondisi });
      setShowKerusakanDialog(true);
    } else {
      // Jika normal, langsung update tanpa catatan
      await submitUpdateKondisi(barangId, kondisi, 'Dikembalikan ke kondisi normal');
    }
  };

  const submitUpdateKondisi = async (barangId, kondisi, deskripsi) => {
    setLoading(true);
    setError('');
    try {
      const body = JSON.stringify({
        barangId,
        kondisi,
        deskripsi
      });

      const response = await fetch('/api/barang/kondisi', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: body
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal update kondisi');
        setLoading(false);
        return;
      }

      setSuccess('Kondisi berhasil diupdate!');
      setTimeout(() => setSuccess(''), 3000);
      setShowKerusakanDialog(false);
      setKerusakanBarang(null);
      loadBarang();
    } catch (err) {
      console.error('Error updating kondisi:', err);
      setError('Terjadi kesalahan: ' + err.message);
    }
    setLoading(false);
  };

  const getKondisiBadge = (kondisi) => {
    if (kondisi === 'normal') return <Badge className="bg-green-500">Normal</Badge>;
    if (kondisi === 'rusak') return <Badge className="bg-red-500">Rusak</Badge>;
    if (kondisi === 'rusak_bisa_dipakai') return <Badge className="bg-yellow-500">Rusak Bisa Dipakai</Badge>;
    return <Badge>{kondisi}</Badge>;
  };

  const downloadPDF = async (type) => {
    setLoading(true);
    setError('');
    
    try {
      // Import libraries dinamis
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(16);
      doc.text(setting.namaSekolah || 'Laboran DKV', 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Laporan ${type}`, 105, 22, { align: 'center' });
      doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 105, 28, { align: 'center' });
      
      let yPos = 40;
      
      if (type === 'Barang Normal' || type === 'Barang Rusak' || type === 'Barang Rusak Bisa Dipakai') {
        const kondisiMap = {
          'Barang Normal': 'normal',
          'Barang Rusak': 'rusak',
          'Barang Rusak Bisa Dipakai': 'rusak_bisa_dipakai'
        };
        
        const filteredBarang = barang.filter(b => b.kondisi === kondisiMap[type]);
        
        doc.setFontSize(10);
        doc.text(`Total: ${filteredBarang.length} barang`, 20, yPos);
        yPos += 10;
        
        filteredBarang.forEach((b, idx) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(`${idx + 1}. ${b.nama}`, 20, yPos);
          doc.text(`   Kategori: ${b.kategori || '-'}`, 20, yPos + 5);
          doc.text(`   Serial: ${b.serial || '-'}`, 20, yPos + 10);
          doc.text(`   Lokasi: ${b.lokasi || '-'}`, 20, yPos + 15);
          yPos += 22;
        });
      } else if (type === 'Peminjaman Bulanan') {
        doc.setFontSize(10);
        doc.text(`Total: ${peminjaman.length} peminjaman`, 20, yPos);
        yPos += 10;
        
        peminjaman.forEach((p, idx) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(`${idx + 1}. ${p.namaPeminjam}`, 20, yPos);
          doc.text(`   Tanggal: ${new Date(p.tanggalPinjam).toLocaleDateString('id-ID')}`, 20, yPos + 5);
          doc.text(`   Status: ${p.status}`, 20, yPos + 10);
          yPos += 17;
        });
      } else if (type === 'Inventaris Lengkap') {
        doc.setFontSize(10);
        doc.text(`Total: ${barang.length} barang`, 20, yPos);
        yPos += 10;
        
        barang.forEach((b, idx) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(`${idx + 1}. ${b.nama}`, 20, yPos);
          doc.text(`   Kategori: ${b.kategori || '-'}`, 20, yPos + 5);
          doc.text(`   Kondisi: ${b.kondisi}`, 20, yPos + 10);
          doc.text(`   Jumlah: ${b.jumlah || 0}`, 20, yPos + 15);
          yPos += 22;
        });
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' });
      }
      
      doc.save(`laporan-${type.toLowerCase().replace(/ /g, '-')}-${Date.now()}.pdf`);
      setSuccess('PDF berhasil diunduh!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Gagal membuat PDF');
    }
    setLoading(false);
  };

  // Login Screen
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo-smk.png" 
                alt="Logo SMK Al Basthomi" 
                className="w-24 h-24 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Sistem Laboran DKV</CardTitle>
            <CardDescription className="text-center">SMK Al Basthomi Loceret</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Masukkan username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : 'Masuk'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Application
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-all duration-300`}>
        {/* Sidebar Header */}
        <div className={`${sidebarCollapsed ? 'p-3' : 'p-4'} border-b`}>
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <img 
                src="/logo-smk.png" 
                alt="Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img 
                src="/logo-smk.png" 
                alt="Logo SMK Al Basthomi" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Sistem Laboran</h1>
                <p className="text-xs text-gray-500">SMK Al Basthomi Loceret</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Menu */}
        <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-1`}>
          <button
            onClick={() => { setActiveTab('dashboard'); setError(''); setSuccess(''); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg text-left transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Dashboard"
          >
            <Package className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
          </button>
          
          <button
            onClick={() => { setActiveTab('inventaris'); setError(''); setSuccess(''); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg text-left transition-colors ${
              activeTab === 'inventaris' 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Inventaris"
          >
            <ClipboardList className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Inventaris</span>}
          </button>
          
          <button
            onClick={() => { setActiveTab('kondisi'); setError(''); setSuccess(''); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg text-left transition-colors ${
              activeTab === 'kondisi' 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Kondisi"
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Kondisi</span>}
          </button>
          
          <button
            onClick={() => { setActiveTab('peminjaman'); setError(''); setSuccess(''); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg text-left transition-colors ${
              activeTab === 'peminjaman' 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Peminjaman"
          >
            <Calendar className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Peminjaman</span>}
          </button>
          
          {/* Laporan Menu with Sub-menu */}
          <div>
            <button
              onClick={() => { 
                if (sidebarCollapsed) {
                  setActiveTab('laporan'); 
                  setLaporanType('Barang Normal');
                } else {
                  setLaporanMenuExpanded(!laporanMenuExpanded);
                }
                setError(''); 
                setSuccess(''); 
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'} py-3 rounded-lg text-left transition-colors ${
                activeTab === 'laporan' 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Laporan"
            >
              <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                <FileText className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">Laporan</span>}
              </div>
              {!sidebarCollapsed && (
                laporanMenuExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {/* Sub-menu items */}
            {!sidebarCollapsed && laporanMenuExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  onClick={() => { setActiveTab('laporan'); setLaporanType('Barang Normal'); setError(''); setSuccess(''); }}
                  className={`w-full flex items-center gap-2 pl-6 pr-4 py-2 rounded-lg text-left text-sm transition-colors ${
                    activeTab === 'laporan' && laporanType === 'Barang Normal'
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  Barang Normal
                </button>
                <button
                  onClick={() => { setActiveTab('laporan'); setLaporanType('Barang Rusak'); setError(''); setSuccess(''); }}
                  className={`w-full flex items-center gap-2 pl-6 pr-4 py-2 rounded-lg text-left text-sm transition-colors ${
                    activeTab === 'laporan' && laporanType === 'Barang Rusak'
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  Barang Rusak
                </button>
                <button
                  onClick={() => { setActiveTab('laporan'); setLaporanType('Barang Rusak Bisa Dipakai'); setError(''); setSuccess(''); }}
                  className={`w-full flex items-center gap-2 pl-6 pr-4 py-2 rounded-lg text-left text-sm transition-colors ${
                    activeTab === 'laporan' && laporanType === 'Barang Rusak Bisa Dipakai'
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Rusak Bisa Dipakai
                </button>
                <button
                  onClick={() => { setActiveTab('laporan'); setLaporanType('Peminjaman Bulanan'); setError(''); setSuccess(''); }}
                  className={`w-full flex items-center gap-2 pl-6 pr-4 py-2 rounded-lg text-left text-sm transition-colors ${
                    activeTab === 'laporan' && laporanType === 'Peminjaman Bulanan'
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Peminjaman
                </button>
                <button
                  onClick={() => { setActiveTab('laporan'); setLaporanType('Inventaris Lengkap'); setError(''); setSuccess(''); }}
                  className={`w-full flex items-center gap-2 pl-6 pr-4 py-2 rounded-lg text-left text-sm transition-colors ${
                    activeTab === 'laporan' && laporanType === 'Inventaris Lengkap'
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Inventaris Lengkap
                </button>
              </div>
            )}
          </div>
          
          {user.role === 'admin' && (
            <button
              onClick={() => { setActiveTab('users'); setError(''); setSuccess(''); }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg text-left transition-colors ${
                activeTab === 'users' 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Users"
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Users</span>}
            </button>
          )}
          
          <button
            onClick={() => { setActiveTab('setting'); setError(''); setSuccess(''); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg text-left transition-colors ${
              activeTab === 'setting' 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Setting"
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Setting</span>}
          </button>
        </nav>
        
        {/* Sidebar Footer - User Info & Collapse Button */}
        <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.nama}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          
          {sidebarCollapsed ? (
            <div className="space-y-2">
              <Button variant="outline" size="icon" className="w-full" onClick={handleLogout} title="Keluar">
                <LogOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-full" 
                onClick={() => setSidebarCollapsed(false)}
                title="Expand Sidebar"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-gray-500 hover:text-gray-700" 
                onClick={() => setSidebarCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Top Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h2>
              <p className="text-sm text-gray-500">Kelola data {activeTab} sistem inventaris</p>
            </div>
            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border">
              <Clock className="h-5 w-5 text-blue-600" />
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500">
                  {currentTime.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'Asia/Jakarta'
                  })}
                </div>
                <div className="text-lg font-bold">
                  {currentTime.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Jakarta'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="px-6 mt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        {success && (
          <div className="px-6 mt-4">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Page Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setError(''); setSuccess(''); }}>
            {/* Hidden TabsList - navigation handled by sidebar */}
            <TabsList className="hidden">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="inventaris">Inventaris</TabsTrigger>
              <TabsTrigger value="kondisi">Kondisi</TabsTrigger>
              <TabsTrigger value="peminjaman">Peminjaman</TabsTrigger>
              <TabsTrigger value="laporan">Laporan</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="setting">Setting</TabsTrigger>
            </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Barang</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.totalUnit || 0}</div>
                      <p className="text-xs text-gray-500 mt-1">{stats.totalBarang} jenis barang</p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-700">Barang Normal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-700">{stats.unitNormal || 0}</div>
                      <p className="text-xs text-green-600 mt-1">{stats.barangNormal} jenis barang</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-700">Barang Rusak</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-700">{stats.unitRusak || 0}</div>
                      <p className="text-xs text-red-600 mt-1">{stats.barangRusak} jenis barang</p>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-yellow-700">Rusak Bisa Dipakai</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-700">{stats.unitRusakBisaDipakai || 0}</div>
                      <p className="text-xs text-yellow-600 mt-1">{stats.barangRusakBisaDipakai} jenis barang</p>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700">Peminjaman Hari Ini</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-700">{stats.peminjamanAktifHariIni}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Jumlah Barang per Kategori */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Jumlah Barang per Kategori
                    </CardTitle>
                    <CardDescription>Distribusi inventaris berdasarkan kategori</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {kategori.map((kat) => {
                        const count = barang.filter(b => b.kategori === kat.nama).length;
                        const totalUnit = barang.filter(b => b.kategori === kat.nama).reduce((sum, b) => sum + (b.jumlah || 1), 0);
                        return (
                          <div 
                            key={kat._id} 
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="text-2xl font-bold text-blue-700">{count}</div>
                            <div className="text-sm font-medium text-gray-700 truncate" title={kat.nama}>{kat.nama}</div>
                            <div className="text-xs text-gray-500 mt-1">{totalUnit} unit</div>
                          </div>
                        );
                      })}
                      {kategori.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>Belum ada kategori</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Grafik Peminjaman Bulanan</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => setChartYear(chartYear - 1)}>Tahun Sebelumnya</Button>
                        <span className="px-4 py-2 font-semibold">{chartYear}</span>
                        <Button size="sm" variant="outline" onClick={() => setChartYear(chartYear + 1)}>Tahun Berikutnya</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartPeminjaman}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="bulan" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="jumlah" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Grafik Kerusakan Barang per Kategori</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartKerusakan}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="kategori" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="normal" fill="#22c55e" />
                          <Bar dataKey="rusakBisaDipakai" fill="#eab308" />
                          <Bar dataKey="rusak" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Peminjaman Terbaru */}
                <Card>
                  <CardHeader>
                    <CardTitle>Peminjaman Terbaru</CardTitle>
                    <CardDescription>10 peminjaman terakhir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {peminjamanTerbaru.length > 0 ? (
                      <div className="space-y-3">
                        {peminjamanTerbaru.map((item) => (
                          <div key={item._id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <p className="font-semibold text-gray-900">{item.namaPeminjam}</p>
                                  <p className="text-sm text-gray-600">{item.kelasjabatan}</p>
                                </div>
                                <div className="flex-shrink-0">
                                  {item.status === 'dipinjam' ? (
                                    <Badge className="bg-orange-500">Dipinjam</Badge>
                                  ) : (
                                    <Badge className="bg-green-500">Dikembalikan</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(item.tanggalPinjam).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}</span>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>{item.jamPinjam}</span>
                              </div>
                              {item.barangData && item.barangData.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {item.barangData.map((b, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                      <Package className="h-3 w-3" />
                                      {b.nama}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ClipboardList className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Belum ada data peminjaman</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Inventaris Tab */}
          <TabsContent value="inventaris" className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Cari barang..."
                  value={searchBarang}
                  onChange={(e) => setSearchBarang(e.target.value)}
                  className="w-48 lg:w-64"
                />
                <Select value={filterKategori} onValueChange={setFilterKategori}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Semua Kategori</SelectItem>
                    {kategori.map((k) => (
                      <SelectItem key={k._id} value={k.nama}>{k.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterKondisi} onValueChange={setFilterKondisi}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Semua Kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Semua Kondisi</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="rusak">Rusak</SelectItem>
                    <SelectItem value="rusak_bisa_dipakai">Rusak Bisa Dipakai</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBarang} onValueChange={setSortBarang}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terbaru">Terbaru Ditambahkan</SelectItem>
                    <SelectItem value="terlama">Terlama Ditambahkan</SelectItem>
                    <SelectItem value="abjad-az">Nama (A-Z)</SelectItem>
                    <SelectItem value="abjad-za">Nama (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={showBarangDialog} onOpenChange={setShowBarangDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Barang
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tambah Barang Baru</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddBarang} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nama">Nama Barang *</Label>
                        <Input id="nama" name="nama" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kategori">Kategori</Label>
                        <Select name="kategori">
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {kategori.map((k) => (
                              <SelectItem key={k._id} value={k.nama}>{k.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serial">Serial/Code</Label>
                        <Input id="serial" name="serial" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kondisi">Kondisi</Label>
                        <Select name="kondisi" defaultValue="normal">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="rusak">Rusak</SelectItem>
                            <SelectItem value="rusak_bisa_dipakai">Rusak Bisa Dipakai</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lokasi">Lokasi Penyimpanan</Label>
                        <Input id="lokasi" name="lokasi" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jumlah">Jumlah Unit *</Label>
                        <Input id="jumlah" name="jumlah" type="number" defaultValue="1" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tahunPembelian">Tahun Pembelian</Label>
                        <Input id="tahunPembelian" name="tahunPembelian" type="number" placeholder="2024" />
                      </div>
                    </div>
                    
                    {/* Foto Barang - Pilihan Upload atau Link */}
                    <div className="space-y-3">
                      <Label>Foto Barang</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={fotoType === 'upload' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFotoType('upload')}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                        <Button
                          type="button"
                          variant={fotoType === 'link' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFotoType('link')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Link URL
                        </Button>
                      </div>
                      
                      {fotoType === 'upload' ? (
                        <Input id="foto" name="foto" type="file" accept="image/*" />
                      ) : (
                        <div className="space-y-2">
                          <Input 
                            id="fotoLink" 
                            placeholder="https://example.com/foto.jpg" 
                            value={fotoLink}
                            onChange={(e) => setFotoLink(e.target.value)}
                          />
                          {fotoLink && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Preview:</p>
                              <img 
                                src={fotoLink} 
                                alt="Preview" 
                                className="w-32 h-32 object-cover rounded border"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spesifikasi">Spesifikasi</Label>
                      <Textarea id="spesifikasi" name="spesifikasi" rows={3} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowBarangDialog(false)}>Batal</Button>
                      <Button type="submit" disabled={loading}>Simpan</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Detail Barang Dialog */}
            <Dialog open={showBarangDetailDialog} onOpenChange={setShowBarangDetailDialog}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detail Barang</DialogTitle>
                </DialogHeader>
                {barangDetail && (
                  <div className="space-y-6">
                    {/* Header dengan Foto dan Info Utama */}
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Foto Utama */}
                      <div className="w-full md:w-64 flex-shrink-0">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {barangDetail.foto ? (
                            <img src={barangDetail.foto} alt={barangDetail.nama} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="h-20 w-20 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Informasi Utama */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold">{barangDetail.nama}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          {getKondisiBadge(barangDetail.kondisi)}
                          <span className="text-sm text-gray-500">• {barangDetail.jumlah || 0} unit</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Serial/Code</p>
                            <p className="font-medium">{barangDetail.serial || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Kategori</p>
                            <p className="font-medium">{barangDetail.kategori || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Lokasi</p>
                            <p className="font-medium">{barangDetail.lokasi || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Tahun Pembelian</p>
                            <p className="font-medium">{barangDetail.tahunPembelian || '-'}</p>
                          </div>
                        </div>
                        
                        {/* Tombol Aksi */}
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Button size="sm" onClick={() => {
                            setShowBarangDetailDialog(false);
                            openEditBarang(barangDetail._id);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Barang
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowBarangDetailDialog(false)}>
                            Tutup
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Spesifikasi */}
                    {barangDetail.spesifikasi && (
                      <div>
                        <h4 className="font-semibold mb-2">Spesifikasi</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{barangDetail.spesifikasi}</p>
                      </div>
                    )}

                    {/* Galeri Foto */}
                    {barangDetail.galeri && barangDetail.galeri.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Galeri Foto</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {barangDetail.galeri.map((foto, idx) => (
                            <img key={idx} src={foto} alt={`Galeri ${idx + 1}`} className="w-full aspect-square object-cover rounded" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Riwayat Kerusakan */}
                    {barangDetail.riwayatKerusakan && barangDetail.riwayatKerusakan.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Riwayat Kerusakan</h4>
                        <div className="space-y-2">
                          {barangDetail.riwayatKerusakan.map((riwayat, idx) => (
                            <div key={idx} className="p-3 border border-red-200 rounded bg-red-50">
                              <p className="text-sm text-gray-600">{new Date(riwayat.tanggal).toLocaleDateString('id-ID')}</p>
                              <p className="text-sm">{riwayat.deskripsi}</p>
                              <p className="text-xs text-gray-500 mt-1">Dicatat oleh: {riwayat.oleh}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Riwayat Peminjaman */}
                    {barangDetail.riwayatPeminjaman && barangDetail.riwayatPeminjaman.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Riwayat Peminjaman (10 Terakhir)</h4>
                        <div className="space-y-2">
                          {barangDetail.riwayatPeminjaman.map((peminjaman) => (
                            <div key={peminjaman._id} className="p-3 border rounded">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold">{peminjaman.namaPeminjam}</p>
                                  <p className="text-sm text-gray-600">{peminjaman.kelasjabatan}</p>
                                </div>
                                <Badge className={peminjaman.status === 'dipinjam' ? 'bg-orange-500' : 'bg-green-500'}>
                                  {peminjaman.status === 'dipinjam' ? 'Dipinjam' : 'Dikembalikan'}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(peminjaman.tanggalPinjam).toLocaleDateString('id-ID')} - {peminjaman.jamPinjam}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end pt-4 border-t">
                      <Button variant="outline" onClick={() => setShowBarangDetailDialog(false)}>Tutup</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Barang Dialog */}
            <Dialog open={showBarangEditDialog} onOpenChange={setShowBarangEditDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Barang</DialogTitle>
                </DialogHeader>
                {selectedBarang && (
                  <form onSubmit={handleEditBarang} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-nama">Nama Barang *</Label>
                        <Input id="edit-nama" name="nama" defaultValue={selectedBarang.nama} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-kategori">Kategori</Label>
                        <Select name="kategori" defaultValue={selectedBarang.kategori}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {kategori.map((k) => (
                              <SelectItem key={k._id} value={k.nama}>{k.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-serial">Serial/Code</Label>
                        <Input id="edit-serial" name="serial" defaultValue={selectedBarang.serial} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-kondisi">Kondisi</Label>
                        <Select name="kondisi" defaultValue={selectedBarang.kondisi}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="rusak">Rusak</SelectItem>
                            <SelectItem value="rusak_bisa_dipakai">Rusak Bisa Dipakai</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-lokasi">Lokasi Penyimpanan</Label>
                        <Input id="edit-lokasi" name="lokasi" defaultValue={selectedBarang.lokasi} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-jumlah">Jumlah Unit *</Label>
                        <Input id="edit-jumlah" name="jumlah" type="number" defaultValue={selectedBarang.jumlah} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-tahunPembelian">Tahun Pembelian</Label>
                        <Input id="edit-tahunPembelian" name="tahunPembelian" type="number" defaultValue={selectedBarang.tahunPembelian} placeholder="2024" />
                      </div>
                    </div>
                    
                    {/* Foto Barang - Pilihan Upload atau Link */}
                    <div className="space-y-3">
                      <Label>Foto Barang (Kosongkan jika tidak ingin diubah)</Label>
                      
                      {selectedBarang.foto && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-2">Foto saat ini:</p>
                          <img src={selectedBarang.foto} alt="Current" className="w-24 h-24 object-cover rounded border" />
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={editFotoType === 'upload' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEditFotoType('upload')}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                        <Button
                          type="button"
                          variant={editFotoType === 'link' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEditFotoType('link')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Link URL
                        </Button>
                      </div>
                      
                      {editFotoType === 'upload' ? (
                        <Input id="edit-foto" name="foto" type="file" accept="image/*" />
                      ) : (
                        <div className="space-y-2">
                          <Input 
                            id="editFotoLink" 
                            placeholder="https://example.com/foto.jpg" 
                            value={editFotoLink}
                            onChange={(e) => setEditFotoLink(e.target.value)}
                          />
                          {editFotoLink && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Preview foto baru:</p>
                              <img 
                                src={editFotoLink} 
                                alt="Preview" 
                                className="w-24 h-24 object-cover rounded border"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-spesifikasi">Spesifikasi</Label>
                      <Textarea id="edit-spesifikasi" name="spesifikasi" rows={3} defaultValue={selectedBarang.spesifikasi} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => {
                        setShowBarangEditDialog(false);
                        setSelectedBarang(null);
                      }}>Batal</Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Update Barang'}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(() => {
                // Filter dan sort barang client-side
                let filteredBarang = [...barang];
                
                // Filter berdasarkan pencarian
                if (searchBarang.trim()) {
                  filteredBarang = filteredBarang.filter(item => 
                    item.nama?.toLowerCase().includes(searchBarang.toLowerCase()) ||
                    item.serial?.toLowerCase().includes(searchBarang.toLowerCase()) ||
                    item.kategori?.toLowerCase().includes(searchBarang.toLowerCase())
                  );
                }
                
                // Filter berdasarkan kategori
                if (filterKategori && filterKategori.trim()) {
                  filteredBarang = filteredBarang.filter(item => item.kategori === filterKategori);
                }
                
                // Filter berdasarkan kondisi
                if (filterKondisi && filterKondisi.trim()) {
                  filteredBarang = filteredBarang.filter(item => item.kondisi === filterKondisi);
                }
                
                // Sorting
                filteredBarang.sort((a, b) => {
                  switch (sortBarang) {
                    case 'abjad-az':
                      return (a.nama || '').localeCompare(b.nama || '', 'id');
                    case 'abjad-za':
                      return (b.nama || '').localeCompare(a.nama || '', 'id');
                    case 'terlama':
                      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                    case 'terbaru':
                    default:
                      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                  }
                });
                
                if (filteredBarang.length === 0) {
                  return (
                    <div className="col-span-full text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Tidak ada barang yang sesuai dengan filter</p>
                    </div>
                  );
                }
                
                return filteredBarang.map((item) => (
                  <Card 
                    key={item._id} 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => loadBarangDetail(item._id)}
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      {item.foto ? (
                        <img src={item.foto} alt={item.nama} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{item.nama}</h3>
                        {getKondisiBadge(item.kondisi)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Kategori: {item.kategori || '-'}</p>
                        <p>Serial: {item.serial || '-'}</p>
                        <p>Lokasi: {item.lokasi || '-'}</p>
                        <p>Jumlah: {item.jumlah || 0} unit</p>
                      </div>
                      <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => openEditBarang(item._id)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteBarang(item._id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>
          </TabsContent>

          {/* Kondisi Tab */}
          <TabsContent value="kondisi" className="space-y-4">
            {/* Dialog Catatan Kerusakan */}
            <Dialog open={showKerusakanDialog} onOpenChange={setShowKerusakanDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Catatan Kerusakan</DialogTitle>
                  <CardDescription>
                    Tambahkan catatan kerusakan untuk barang ini
                  </CardDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const deskripsi = formData.get('deskripsi');
                  if (kerusakanBarang) {
                    submitUpdateKondisi(kerusakanBarang.id, kerusakanBarang.kondisi, deskripsi);
                  }
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deskripsi">Deskripsi Kerusakan *</Label>
                    <Textarea
                      id="deskripsi"
                      name="deskripsi"
                      placeholder="Jelaskan detail kerusakan barang..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => {
                      setShowKerusakanDialog(false);
                      setKerusakanBarang(null);
                    }}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Barang Normal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {barang.filter(b => b.kondisi === 'normal').map((item) => (
                        <div key={item._id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            {item.foto && <img src={item.foto} className="w-12 h-12 object-cover rounded" />}
                            <div className="flex-1">
                              <p className="font-semibold">{item.nama}</p>
                              <p className="text-xs text-gray-600">{item.kategori}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateKondisi(item._id, 'rusak')}>
                              Rusak
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateKondisi(item._id, 'rusak_bisa_dipakai')}>
                              Rusak (Pakai)
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Barang Rusak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {barang.filter(b => b.kondisi === 'rusak').map((item) => (
                        <div key={item._id} className="p-3 border border-red-200 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            {item.foto && <img src={item.foto} className="w-12 h-12 object-cover rounded" />}
                            <div className="flex-1">
                              <p className="font-semibold">{item.nama}</p>
                              <p className="text-xs text-gray-600">{item.kategori}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateKondisi(item._id, 'normal')}>
                              Normal
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateKondisi(item._id, 'rusak_bisa_dipakai')}>
                              Rusak (Pakai)
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Rusak Bisa Dipakai
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {barang.filter(b => b.kondisi === 'rusak_bisa_dipakai').map((item) => (
                        <div key={item._id} className="p-3 border border-yellow-200 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            {item.foto && <img src={item.foto} className="w-12 h-12 object-cover rounded" />}
                            <div className="flex-1">
                              <p className="font-semibold">{item.nama}</p>
                              <p className="text-xs text-gray-600">{item.kategori}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateKondisi(item._id, 'normal')}>
                              Normal
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateKondisi(item._id, 'rusak')}>
                              Rusak
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Peminjaman Tab */}
          <TabsContent value="peminjaman" className="space-y-4">
            {/* Dialog Pengembalian */}
            <Dialog open={showPengembalianDialog} onOpenChange={setShowPengembalianDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pengembalian Barang</DialogTitle>
                  <CardDescription>
                    Catatan kondisi barang saat dikembalikan
                  </CardDescription>
                </DialogHeader>
                {selectedPeminjamanReturn && (
                  <form onSubmit={submitReturnBarang} className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm font-semibold">Peminjam: {selectedPeminjamanReturn.namaPeminjam}</p>
                      <p className="text-xs text-gray-600">Tanggal Pinjam: {new Date(selectedPeminjamanReturn.tanggalPinjam).toLocaleDateString('id-ID')}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="kondisiBarang">Kondisi Barang *</Label>
                      <Select name="kondisiBarang" defaultValue="baik" required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baik">Baik (Normal)</SelectItem>
                          <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                          <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="catatan">Catatan Pengembalian *</Label>
                      <Textarea
                        id="catatan"
                        name="catatan"
                        placeholder="Jelaskan kondisi barang saat dikembalikan..."
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => {
                        setShowPengembalianDialog(false);
                        setSelectedPeminjamanReturn(null);
                      }}>
                        Batal
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Tandai Dikembalikan'}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            {/* Dialog Detail Peminjaman */}
            <Dialog open={showPeminjamanDetailDialog} onOpenChange={setShowPeminjamanDetailDialog}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detail Peminjaman</DialogTitle>
                </DialogHeader>
                {selectedPeminjamanDetail && (
                  <div className="space-y-6">
                    {/* Info Peminjam */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Nama Peminjam</p>
                        <p className="font-semibold text-lg">{selectedPeminjamanDetail.namaPeminjam}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kelas/Jabatan</p>
                        <p className="font-semibold">{selectedPeminjamanDetail.kelasjabatan}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tanggal & Jam Pinjam</p>
                        <p className="font-semibold">
                          {new Date(selectedPeminjamanDetail.tanggalPinjam).toLocaleDateString('id-ID', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' 
                          })}
                        </p>
                        <p className="text-sm">{selectedPeminjamanDetail.jamPinjam || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rencana Pengembalian</p>
                        {selectedPeminjamanDetail.tanggalKembaliRencana ? (
                          <>
                            <p className="font-semibold">
                              {new Date(selectedPeminjamanDetail.tanggalKembaliRencana).toLocaleDateString('id-ID', { 
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' 
                              })}
                            </p>
                            <p className="text-sm">{selectedPeminjamanDetail.jamKembaliRencana || '-'}</p>
                          </>
                        ) : (
                          <p className="text-gray-500">Tidak ditentukan</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        {selectedPeminjamanDetail.status === 'dipinjam' ? (
                          <Badge className="bg-orange-500 mt-1">Dipinjam</Badge>
                        ) : (
                          <Badge className="bg-green-500 mt-1">Dikembalikan</Badge>
                        )}
                      </div>
                      {selectedPeminjamanDetail.status === 'dikembalikan' && selectedPeminjamanDetail.tanggalDikembalikan && (
                        <div>
                          <p className="text-sm text-gray-600">Tanggal Dikembalikan</p>
                          <p className="font-semibold">
                            {new Date(selectedPeminjamanDetail.tanggalDikembalikan).toLocaleDateString('id-ID', { 
                              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Surat Peminjaman */}
                    {selectedPeminjamanDetail.surat && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Surat Peminjaman</p>
                        <Button variant="outline" asChild>
                          <a href={selectedPeminjamanDetail.surat} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            Lihat Surat Peminjaman
                          </a>
                        </Button>
                      </div>
                    )}

                    {/* Daftar Barang yang Dipinjam */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Daftar Barang yang Dipinjam
                      </h4>
                      {selectedPeminjamanDetail.barangData && selectedPeminjamanDetail.barangData.length > 0 ? (
                        <div className="space-y-3">
                          {selectedPeminjamanDetail.barangData.map((b, idx) => (
                            <div key={b._id} className="flex items-center gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50">
                              <div className="text-lg font-bold text-gray-400 w-8">{idx + 1}</div>
                              {b.foto ? (
                                <img src={b.foto} className="w-16 h-16 object-cover rounded-lg border" alt={b.nama} />
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                                  <Camera className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-semibold text-lg">{b.nama}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {b.kategori && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{b.kategori}</span>
                                  )}
                                  {b.serial && (
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">SN: {b.serial}</span>
                                  )}
                                  {b.kondisi && (
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      b.kondisi === 'normal' ? 'bg-green-100 text-green-700' :
                                      b.kondisi === 'rusak' ? 'bg-red-100 text-red-700' :
                                      'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {b.kondisi === 'normal' ? 'Normal' : b.kondisi === 'rusak' ? 'Rusak' : 'Rusak Bisa Dipakai'}
                                    </span>
                                  )}
                                </div>
                                {b.lokasi && <p className="text-xs text-gray-500 mt-1">Lokasi: {b.lokasi}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">Tidak ada data barang</p>
                        </div>
                      )}
                    </div>

                    {/* Catatan */}
                    {selectedPeminjamanDetail.catatan && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 mb-1">Catatan:</p>
                        <p className="text-sm text-yellow-700">{selectedPeminjamanDetail.catatan}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end pt-4 border-t">
                      {selectedPeminjamanDetail.status === 'dipinjam' && (
                        <Button onClick={() => {
                          setShowPeminjamanDetailDialog(false);
                          handleReturnBarang(selectedPeminjamanDetail);
                        }}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Tandai Dikembalikan
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => setShowPeminjamanDetailDialog(false)}>
                        Tutup
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <div className="flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <Select value={filterStatusPeminjaman} onValueChange={setFilterStatusPeminjaman}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Semua Status</SelectItem>
                    <SelectItem value="dipinjam">Dipinjam</SelectItem>
                    <SelectItem value="dikembalikan">Dikembalikan</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={loadPeminjaman}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Dialog open={showPeminjamanDialog} onOpenChange={(open) => {
                setShowPeminjamanDialog(open);
                if (!open) setSelectedBarangIds([]); // Reset saat dialog ditutup
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Peminjaman
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Form Peminjaman Baru</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddPeminjaman} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="namaPeminjam">Nama Peminjam *</Label>
                        <Input id="namaPeminjam" name="namaPeminjam" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kelasjabatan">Kelas/Jabatan *</Label>
                        <Input id="kelasjabatan" name="kelasjabatan" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tanggalKembali">Tanggal Kembali (Rencana)</Label>
                        <Input id="tanggalKembali" name="tanggalKembali" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jamKembali">Jam Kembali (Rencana)</Label>
                        <Input id="jamKembali" name="jamKembali" type="time" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="surat">Upload Surat Peminjaman</Label>
                        <Input id="surat" name="surat" type="file" accept=".pdf,.jpg,.jpeg,.png" />
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      <p className="font-semibold">ℹ️ Informasi</p>
                      <p>Tanggal dan jam peminjaman akan tercatat otomatis saat Anda menyimpan form ini.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Barang yang Dipinjam *</Label>
                      <Input
                        placeholder="Cari barang..."
                        value={searchBarangPeminjaman}
                        onChange={(e) => setSearchBarangPeminjaman(e.target.value)}
                        className="mb-2"
                      />
                      <ScrollArea className="h-48 border rounded p-2">
                        {getAvailableBarang().length > 0 ? (
                          getAvailableBarang().map((item) => {
                            const disabled = isBarangDisabled(item._id);
                            return (
                              <label 
                                key={item._id} 
                                className={`flex items-center gap-2 p-2 rounded ${
                                  disabled 
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                    : 'hover:bg-gray-50 cursor-pointer'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  value={item._id}
                                  disabled={disabled}
                                  checked={selectedBarangIds.includes(item._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBarangIds([...selectedBarangIds, item._id]);
                                    } else {
                                      setSelectedBarangIds(selectedBarangIds.filter(id => id !== item._id));
                                    }
                                  }}
                                />
                                {item.foto && <img src={item.foto} className="w-8 h-8 object-cover rounded" />}
                                <div className="flex-1">
                                  <span className="text-sm font-medium">{item.nama}</span>
                                  <div className="flex gap-2 items-center text-xs text-gray-600">
                                    <span>{item.kategori}</span>
                                    <span>•</span>
                                    <span>Stok: {item.jumlah}</span>
                                    {item.kondisi === 'rusak_bisa_dipakai' && (
                                      <>
                                        <span>•</span>
                                        <Badge className="bg-yellow-500 h-4 text-xs">Rusak Bisa Dipakai</Badge>
                                      </>
                                    )}
                                    {item.statusPeminjaman === 'dipinjam' && (
                                      <>
                                        <span>•</span>
                                        <Badge className="bg-orange-500 h-4 text-xs">Sedang Dipinjam</Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {disabled && (
                                  <span className="text-xs text-red-500 font-medium">Tidak Tersedia</span>
                                )}
                              </label>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">Tidak ada barang yang tersedia</p>
                          </div>
                        )}
                      </ScrollArea>
                      <input type="hidden" id="barangIdsHidden" name="barangIds" defaultValue="[]" />
                      <p className="text-xs text-gray-600 mt-1">
                        Menampilkan {getAvailableBarang().filter(b => !isBarangDisabled(b._id)).length} barang tersedia
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="catatan">Catatan</Label>
                      <Textarea id="catatan" name="catatan" rows={2} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowPeminjamanDialog(false)}>Batal</Button>
                      <Button type="submit" disabled={loading}>Simpan</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {peminjaman.map((item) => (
                <Card 
                  key={item._id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedPeminjamanDetail(item);
                    setShowPeminjamanDetailDialog(true);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Peminjam</p>
                        <p className="font-semibold">{item.namaPeminjam}</p>
                        <p className="text-sm text-gray-600">{item.kelasjabatan}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tanggal & Jam Pinjam</p>
                        <p className="font-semibold">{new Date(item.tanggalPinjam).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}</p>
                        <p className="text-sm">{item.jamPinjam || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rencana Pengembalian</p>
                        {item.tanggalKembaliRencana ? (
                          <>
                            <p className="font-semibold">{new Date(item.tanggalKembaliRencana).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}</p>
                            <p className="text-sm">{item.jamKembaliRencana || '-'}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Tidak ditentukan</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        {item.status === 'dipinjam' ? (
                          <Badge className="bg-orange-500">Dipinjam</Badge>
                        ) : (
                          <Badge className="bg-green-500">Dikembalikan</Badge>
                        )}
                        {item.status === 'dikembalikan' && item.tanggalDikembalikan && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.tanggalDikembalikan).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {item.status === 'dipinjam' && (
                          <Button size="sm" onClick={() => handleReturnBarang(item)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Kembali
                          </Button>
                        )}
                        {item.surat && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={item.surat} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-1" />
                              Surat
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeletePeminjaman(item._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Preview Barang yang dipinjam */}
                    {item.barangData && item.barangData.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Barang yang dipinjam ({item.barangData.length} item) - <span className="text-blue-600">Klik untuk detail</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.barangData.slice(0, 3).map((b) => (
                            <div key={b._id} className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2">
                              {b.foto ? (
                                <img src={b.foto} className="w-8 h-8 object-cover rounded" alt={b.nama} />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                  <Camera className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <span className="text-sm font-medium">{b.nama}</span>
                                {b.kategori && <p className="text-xs text-gray-500">{b.kategori}</p>}
                              </div>
                            </div>
                          ))}
                          {item.barangData.length > 3 && (
                            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-700">
                              <span className="text-sm font-medium">+{item.barangData.length - 3} lainnya</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Laporan Tab */}
          <TabsContent value="laporan" className="space-y-4">
            <Tabs value={laporanType} onValueChange={setLaporanType}>
              {/* TabsList hidden - navigation moved to sidebar */}
              <TabsList className="hidden">
                <TabsTrigger value="Barang Normal">Barang Normal</TabsTrigger>
                <TabsTrigger value="Barang Rusak">Barang Rusak</TabsTrigger>
                <TabsTrigger value="Barang Rusak Bisa Dipakai">Rusak Bisa Dipakai</TabsTrigger>
                <TabsTrigger value="Peminjaman Bulanan">Peminjaman</TabsTrigger>
                <TabsTrigger value="Inventaris Lengkap">Inventaris Lengkap</TabsTrigger>
              </TabsList>

              {/* Barang Normal */}
              <TabsContent value="Barang Normal">
                {laporanData.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <CardTitle>Laporan Barang Normal</CardTitle>
                          <CardDescription>
                            Total: {getFilteredLaporanData().length} jenis barang ({getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)} unit)
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 print:hidden">
                          <Input
                            placeholder="Cari barang..."
                            value={laporanSearch}
                            onChange={(e) => setLaporanSearch(e.target.value)}
                            className="w-64"
                          />
                          <Button onClick={handlePrintLaporan}>
                            <Download className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                        </div>
                      </div>
                      {/* Ringkasan Total Unit */}
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-3 text-center">
                          <div className="text-3xl font-bold text-green-700">{getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)}</div>
                          <div className="text-sm text-green-600">Total Unit Normal</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-6 py-3 text-center">
                          <div className="text-3xl font-bold text-gray-700">{getFilteredLaporanData().length}</div>
                          <div className="text-sm text-gray-600">Jenis Barang</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-3 font-semibold">No</th>
                              <th className="text-left p-3 font-semibold">Foto</th>
                              <th className="text-left p-3 font-semibold">Nama Barang</th>
                              <th className="text-left p-3 font-semibold">Kategori</th>
                              <th className="text-left p-3 font-semibold">Serial</th>
                              <th className="text-left p-3 font-semibold">Kondisi</th>
                              <th className="text-left p-3 font-semibold">Lokasi</th>
                              <th className="text-left p-3 font-semibold">Jumlah</th>
                              <th className="text-left p-3 font-semibold">Tahun</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredLaporanData().map((item, idx) => (
                              <tr key={item._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3">
                                  {item.foto ? (
                                    <img src={item.foto} alt={item.nama} className="w-12 h-12 object-cover rounded" />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                      <Camera className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 font-medium">{item.nama}</td>
                                <td className="p-3">{item.kategori || '-'}</td>
                                <td className="p-3">{item.serial || '-'}</td>
                                <td className="p-3">{getKondisiBadge(item.kondisi)}</td>
                                <td className="p-3">{item.lokasi || '-'}</td>
                                <td className="p-3 font-semibold">{item.jumlah || 0}</td>
                                <td className="p-3">{item.tahunPembelian || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 bg-green-50 font-semibold">
                              <td colSpan="7" className="p-3 text-right">Total Unit:</td>
                              <td className="p-3 text-lg text-green-700">{getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)}</td>
                              <td className="p-3"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">Tidak ada data barang normal</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Barang Rusak */}
              <TabsContent value="Barang Rusak">
                {laporanData.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <CardTitle>Laporan Barang Rusak</CardTitle>
                          <CardDescription>
                            Total: {getFilteredLaporanData().length} jenis barang ({getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)} unit)
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 print:hidden">
                          <Input
                            placeholder="Cari barang..."
                            value={laporanSearch}
                            onChange={(e) => setLaporanSearch(e.target.value)}
                            className="w-64"
                          />
                          <Button onClick={handlePrintLaporan}>
                            <Download className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                        </div>
                      </div>
                      {/* Ringkasan Total Unit */}
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-3 text-center">
                          <div className="text-3xl font-bold text-red-700">{getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)}</div>
                          <div className="text-sm text-red-600">Total Unit Rusak</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-6 py-3 text-center">
                          <div className="text-3xl font-bold text-gray-700">{getFilteredLaporanData().length}</div>
                          <div className="text-sm text-gray-600">Jenis Barang</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-3 font-semibold">No</th>
                              <th className="text-left p-3 font-semibold">Foto</th>
                              <th className="text-left p-3 font-semibold">Nama Barang</th>
                              <th className="text-left p-3 font-semibold">Kategori</th>
                              <th className="text-left p-3 font-semibold">Serial</th>
                              <th className="text-left p-3 font-semibold">Kondisi</th>
                              <th className="text-left p-3 font-semibold">Lokasi</th>
                              <th className="text-left p-3 font-semibold">Jumlah</th>
                              <th className="text-left p-3 font-semibold">Tahun</th>
                              <th className="text-left p-3 font-semibold">Catatan Kerusakan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredLaporanData().map((item, idx) => (
                              <tr key={item._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3">
                                  {item.foto ? (
                                    <img src={item.foto} alt={item.nama} className="w-12 h-12 object-cover rounded" />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                      <Camera className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 font-medium">{item.nama}</td>
                                <td className="p-3">{item.kategori || '-'}</td>
                                <td className="p-3">{item.serial || '-'}</td>
                                <td className="p-3">{getKondisiBadge(item.kondisi)}</td>
                                <td className="p-3">{item.lokasi || '-'}</td>
                                <td className="p-3 font-semibold">{item.jumlah || 0}</td>
                                <td className="p-3">{item.tahunPembelian || '-'}</td>
                                <td className="p-3">
                                  {item.riwayatKerusakan && item.riwayatKerusakan.length > 0 ? (
                                    <div className="max-w-xs">
                                      <p className="text-sm text-gray-700 truncate" title={item.riwayatKerusakan[item.riwayatKerusakan.length - 1].deskripsi}>
                                        {item.riwayatKerusakan[item.riwayatKerusakan.length - 1].deskripsi}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(item.riwayatKerusakan[item.riwayatKerusakan.length - 1].tanggal).toLocaleDateString('id-ID')}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 bg-red-50 font-semibold">
                              <td colSpan="7" className="p-3 text-right">Total Unit:</td>
                              <td className="p-3 text-lg text-red-700">{getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)}</td>
                              <td colSpan="2" className="p-3"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">Tidak ada data barang rusak</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Barang Rusak Bisa Dipakai */}
              <TabsContent value="Barang Rusak Bisa Dipakai">
                {laporanData.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <CardTitle>Laporan Barang Rusak Bisa Dipakai</CardTitle>
                          <CardDescription>
                            Total: {getFilteredLaporanData().length} jenis barang ({getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)} unit)
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 print:hidden">
                          <Input
                            placeholder="Cari barang..."
                            value={laporanSearch}
                            onChange={(e) => setLaporanSearch(e.target.value)}
                            className="w-64"
                          />
                          <Button onClick={handlePrintLaporan}>
                            <Download className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                        </div>
                      </div>
                      {/* Ringkasan Total Unit */}
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-3 text-center">
                          <div className="text-3xl font-bold text-yellow-700">{getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)}</div>
                          <div className="text-sm text-yellow-600">Total Unit Rusak Bisa Dipakai</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-6 py-3 text-center">
                          <div className="text-3xl font-bold text-gray-700">{getFilteredLaporanData().length}</div>
                          <div className="text-sm text-gray-600">Jenis Barang</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-3 font-semibold">No</th>
                              <th className="text-left p-3 font-semibold">Foto</th>
                              <th className="text-left p-3 font-semibold">Nama Barang</th>
                              <th className="text-left p-3 font-semibold">Kategori</th>
                              <th className="text-left p-3 font-semibold">Serial</th>
                              <th className="text-left p-3 font-semibold">Kondisi</th>
                              <th className="text-left p-3 font-semibold">Lokasi</th>
                              <th className="text-left p-3 font-semibold">Jumlah</th>
                              <th className="text-left p-3 font-semibold">Tahun</th>
                              <th className="text-left p-3 font-semibold">Catatan Kerusakan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredLaporanData().map((item, idx) => (
                              <tr key={item._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3">
                                  {item.foto ? (
                                    <img src={item.foto} alt={item.nama} className="w-12 h-12 object-cover rounded" />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                      <Camera className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 font-medium">{item.nama}</td>
                                <td className="p-3">{item.kategori || '-'}</td>
                                <td className="p-3">{item.serial || '-'}</td>
                                <td className="p-3">{getKondisiBadge(item.kondisi)}</td>
                                <td className="p-3">{item.lokasi || '-'}</td>
                                <td className="p-3 font-semibold">{item.jumlah || 0}</td>
                                <td className="p-3">{item.tahunPembelian || '-'}</td>
                                <td className="p-3">
                                  {item.riwayatKerusakan && item.riwayatKerusakan.length > 0 ? (
                                    <div className="max-w-xs">
                                      <p className="text-sm text-gray-700 truncate" title={item.riwayatKerusakan[item.riwayatKerusakan.length - 1].deskripsi}>
                                        {item.riwayatKerusakan[item.riwayatKerusakan.length - 1].deskripsi}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(item.riwayatKerusakan[item.riwayatKerusakan.length - 1].tanggal).toLocaleDateString('id-ID')}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 bg-yellow-50 font-semibold">
                              <td colSpan="7" className="p-3 text-right">Total Unit:</td>
                              <td className="p-3 text-lg text-yellow-700">{getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)}</td>
                              <td colSpan="2" className="p-3"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">Tidak ada data barang rusak bisa dipakai</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Peminjaman Bulanan */}
              <TabsContent value="Peminjaman Bulanan">
                {laporanData.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <CardTitle>Laporan Peminjaman Bulanan</CardTitle>
                            <CardDescription>
                              Total: {getFilteredLaporanData().length} dari {laporanData.length} peminjaman
                              {getFilterInfo()}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2 print:hidden">
                            <Input
                              placeholder="Cari peminjam..."
                              value={laporanSearch}
                              onChange={(e) => setLaporanSearch(e.target.value)}
                              className="w-64"
                            />
                            <Button onClick={handlePrintLaporan}>
                              <Download className="h-4 w-4 mr-2" />
                              Print
                            </Button>
                          </div>
                        </div>
                        
                        {/* Filter Tanggal */}
                        <div className="flex flex-wrap gap-3 print:hidden border-t pt-4">
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-gray-600">Filter Tanggal Spesifik</Label>
                            <Input
                              type="date"
                              value={filterTanggal}
                              onChange={(e) => setFilterTanggal(e.target.value)}
                              className="w-48"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-gray-600">Filter Bulan</Label>
                            <Select value={filterBulan} onValueChange={setFilterBulan}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Semua Bulan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value=" ">Semua Bulan</SelectItem>
                                <SelectItem value="1">Januari</SelectItem>
                                <SelectItem value="2">Februari</SelectItem>
                                <SelectItem value="3">Maret</SelectItem>
                                <SelectItem value="4">April</SelectItem>
                                <SelectItem value="5">Mei</SelectItem>
                                <SelectItem value="6">Juni</SelectItem>
                                <SelectItem value="7">Juli</SelectItem>
                                <SelectItem value="8">Agustus</SelectItem>
                                <SelectItem value="9">September</SelectItem>
                                <SelectItem value="10">Oktober</SelectItem>
                                <SelectItem value="11">November</SelectItem>
                                <SelectItem value="12">Desember</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-gray-600">Filter Tahun</Label>
                            <Select value={filterTahun} onValueChange={setFilterTahun}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(year => (
                                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-end">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setFilterTanggal('');
                                setFilterBulan('');
                                setFilterTahun(new Date().getFullYear().toString());
                              }}
                            >
                              Reset Filter
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-3 font-semibold">No</th>
                              <th className="text-left p-3 font-semibold">Nama Peminjam</th>
                              <th className="text-left p-3 font-semibold">Kelas/Jabatan</th>
                              <th className="text-left p-3 font-semibold">Barang Dipinjam</th>
                              <th className="text-left p-3 font-semibold">Tanggal Pinjam</th>
                              <th className="text-left p-3 font-semibold">Jam Pinjam</th>
                              <th className="text-left p-3 font-semibold">Tanggal Kembali</th>
                              <th className="text-left p-3 font-semibold">Jam Kembali</th>
                              <th className="text-left p-3 font-semibold">Status</th>
                              <th className="text-left p-3 font-semibold">Surat</th>
                              <th className="text-left p-3 font-semibold">Kondisi Pengembalian</th>
                              <th className="text-left p-3 font-semibold">Catatan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredLaporanData().map((item, idx) => (
                              <tr key={item._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3 font-medium">{item.namaPeminjam}</td>
                                <td className="p-3">{item.kelasjabatan}</td>
                                <td className="p-3">
                                  {item.barangData && item.barangData.length > 0 ? (
                                    <div className="space-y-1">
                                      {item.barangData.map((b, i) => (
                                        <div key={i} className="text-sm">
                                          {i + 1}. {b.nama}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="p-3">{new Date(item.tanggalPinjam).toLocaleDateString('id-ID')}</td>
                                <td className="p-3">{item.jamPinjam}</td>
                                <td className="p-3">
                                  {item.tanggalDikembalikan ? (
                                    new Date(item.tanggalDikembalikan).toLocaleDateString('id-ID')
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {item.jamDikembalikan || <span className="text-gray-400">-</span>}
                                </td>
                                <td className="p-3">
                                  {item.status === 'dipinjam' ? (
                                    <Badge className="bg-orange-500">Dipinjam</Badge>
                                  ) : (
                                    <Badge className="bg-green-500">Dikembalikan</Badge>
                                  )}
                                </td>
                                <td className="p-3">
                                  {item.surat ? (
                                    <span className="inline-flex items-center gap-1 text-green-600">
                                      <CheckCircle className="h-4 w-4" />
                                      <span className="text-sm">Pakai Surat</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-gray-500">
                                      <AlertCircle className="h-4 w-4" />
                                      <span className="text-sm">Tidak Pakai</span>
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {item.kondisiPengembalian ? (
                                    <span className={`text-sm ${
                                      item.kondisiPengembalian === 'baik' ? 'text-green-600' :
                                      item.kondisiPengembalian === 'rusak_ringan' ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>
                                      {item.kondisiPengembalian === 'baik' ? 'Baik' :
                                       item.kondisiPengembalian === 'rusak_ringan' ? 'Rusak Ringan' :
                                       'Rusak Berat'}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="p-3 max-w-xs">
                                  <div className="text-sm">
                                    {item.catatanPengembalian || item.catatan || '-'}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">Tidak ada data peminjaman</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Inventaris Lengkap */}
              <TabsContent value="Inventaris Lengkap">
                {laporanData.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <CardTitle>Laporan Inventaris Lengkap</CardTitle>
                          <CardDescription>
                            Total: {getFilteredLaporanData().length} jenis barang ({getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)} unit)
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 print:hidden">
                          <Button onClick={handlePrintLaporan}>
                            <Download className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                        </div>
                      </div>
                      
                      {/* Filter Section */}
                      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t print:hidden">
                        <Input
                          placeholder="Cari barang..."
                          value={laporanSearch}
                          onChange={(e) => setLaporanSearch(e.target.value)}
                          className="w-48"
                        />
                        <Select value={laporanFilterKategori} onValueChange={setLaporanFilterKategori}>
                          <SelectTrigger className="w-44">
                            <SelectValue placeholder="Semua Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=" ">Semua Kategori</SelectItem>
                            {kategori.map((k) => (
                              <SelectItem key={k._id} value={k.nama}>{k.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={laporanFilterTahun} onValueChange={setLaporanFilterTahun}>
                          <SelectTrigger className="w-44">
                            <SelectValue placeholder="Semua Tahun" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=" ">Semua Tahun</SelectItem>
                            {(() => {
                              // Get unique years from laporanData
                              const years = [...new Set(laporanData.map(b => b.tahunPembelian).filter(Boolean))].sort((a, b) => b - a);
                              return years.map((year) => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                              ));
                            })()}
                          </SelectContent>
                        </Select>
                        {(laporanFilterKategori?.trim() || laporanFilterTahun?.trim() || laporanSearch) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setLaporanFilterKategori('');
                              setLaporanFilterTahun('');
                              setLaporanSearch('');
                            }}
                          >
                            Reset Filter
                          </Button>
                        )}
                      </div>
                      
                      {/* Ringkasan Total Unit */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">{getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)}</div>
                          <div className="text-xs text-gray-600">Total Unit</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-green-700">
                            {getFilteredLaporanData().filter(b => b.kondisi === 'normal').reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)}
                          </div>
                          <div className="text-xs text-green-600">Unit Normal</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-yellow-700">
                            {getFilteredLaporanData().filter(b => b.kondisi === 'rusak_bisa_dipakai').reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)}
                          </div>
                          <div className="text-xs text-yellow-600">Unit Rusak Bisa Dipakai</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-red-700">
                            {getFilteredLaporanData().filter(b => b.kondisi === 'rusak').reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)}
                          </div>
                          <div className="text-xs text-red-600">Unit Rusak</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-3 font-semibold">No</th>
                              <th className="text-left p-3 font-semibold">Foto</th>
                              <th className="text-left p-3 font-semibold">Nama Barang</th>
                              <th className="text-left p-3 font-semibold">Kategori</th>
                              <th className="text-left p-3 font-semibold">Serial</th>
                              <th className="text-left p-3 font-semibold">Kondisi</th>
                              <th className="text-left p-3 font-semibold">Lokasi</th>
                              <th className="text-left p-3 font-semibold">Jumlah</th>
                              <th className="text-left p-3 font-semibold">Tahun</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredLaporanData().map((item, idx) => (
                              <tr key={item._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3">
                                  {item.foto ? (
                                    <img src={item.foto} alt={item.nama} className="w-12 h-12 object-cover rounded" />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                      <Camera className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 font-medium">{item.nama}</td>
                                <td className="p-3">{item.kategori || '-'}</td>
                                <td className="p-3">{item.serial || '-'}</td>
                                <td className="p-3">{getKondisiBadge(item.kondisi)}</td>
                                <td className="p-3">{item.lokasi || '-'}</td>
                                <td className="p-3 font-semibold">{item.jumlah || 0}</td>
                                <td className="p-3">{item.tahunPembelian || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 bg-gray-100 font-semibold">
                              <td colSpan="7" className="p-3 text-right">Total Unit:</td>
                              <td className="p-3 text-lg">{getFilteredLaporanData().reduce((sum, b) => sum + (parseInt(b.jumlah) || 1), 0)}</td>
                              <td className="p-3"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">Tidak ada data inventaris</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Users Tab */}
          {user.role === 'admin' && (
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah User Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setLoading(true);
                      const formData = new FormData(e.target);
                      const data = {
                        username: formData.get('username'),
                        password: formData.get('password'),
                        nama: formData.get('nama'),
                        role: formData.get('role'),
                        kelas: formData.get('kelas'),
                        jabatan: formData.get('jabatan')
                      };
                      
                      try {
                        const response = await apiCall('/auth/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(data)
                        });
                        const result = await response.json();
                        if (response.ok) {
                          setSuccess('User berhasil ditambahkan!');
                          setShowUserDialog(false);
                          loadUsers();
                          e.target.reset();
                        } else {
                          setError(result.error);
                        }
                      } catch (err) {
                        setError('Terjadi kesalahan');
                      }
                      setLoading(false);
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username *</Label>
                        <Input id="username" name="username" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input id="password" name="password" type="password" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nama">Nama Lengkap *</Label>
                        <Input id="nama" name="nama" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select name="role" defaultValue="laboran">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="laboran">Laboran</SelectItem>
                            <SelectItem value="waka_sarpras">Waka Sarpras</SelectItem>
                            <SelectItem value="guru">Guru</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kelas">Kelas (untuk siswa)</Label>
                        <Input id="kelas" name="kelas" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jabatan">Jabatan (untuk guru/staff)</Label>
                        <Input id="jabatan" name="jabatan" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setShowUserDialog(false)}>Batal</Button>
                        <Button type="submit" disabled={loading}>Simpan</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((u) => (
                  <Card key={u._id}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-lg">{u.nama}</p>
                            <p className="text-sm text-gray-600">@{u.username}</p>
                          </div>
                          <Badge>{u.role}</Badge>
                        </div>
                        {u.kelas && <p className="text-sm">Kelas: {u.kelas}</p>}
                        {u.jabatan && <p className="text-sm">Jabatan: {u.jabatan}</p>}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditUser(u)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUser(u._id, u.nama)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Dialog Edit User */}
              <Dialog open={showUserEditDialog} onOpenChange={setShowUserEditDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                  </DialogHeader>
                  {selectedUser && (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setLoading(true);
                      const formData = new FormData(e.target);
                      const data = {
                        nama: formData.get('nama'),
                        role: formData.get('role'),
                        kelas: formData.get('kelas'),
                        jabatan: formData.get('jabatan')
                      };
                      
                      // Only include password if it's provided
                      const password = formData.get('password');
                      if (password && password.trim() !== '') {
                        data.password = password;
                      }
                      
                      try {
                        const response = await apiCall(`/users/${selectedUser._id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(data)
                        });
                        const result = await response.json();
                        if (response.ok) {
                          setSuccess('User berhasil diupdate!');
                          setShowUserEditDialog(false);
                          setSelectedUser(null);
                          loadUsers();
                        } else {
                          setError(result.error);
                        }
                      } catch (err) {
                        setError('Terjadi kesalahan');
                      }
                      setLoading(false);
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input value={selectedUser.username} disabled className="bg-gray-100" />
                        <p className="text-xs text-gray-500">Username tidak bisa diubah</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-password">Password Baru</Label>
                        <Input id="edit-password" name="password" type="password" placeholder="Kosongkan jika tidak ingin mengubah password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-nama">Nama Lengkap *</Label>
                        <Input id="edit-nama" name="nama" defaultValue={selectedUser.nama} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-role">Role *</Label>
                        <Select name="role" defaultValue={selectedUser.role}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="laboran">Laboran</SelectItem>
                            <SelectItem value="waka_sarpras">Waka Sarpras</SelectItem>
                            <SelectItem value="guru">Guru</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-kelas">Kelas (untuk siswa)</Label>
                        <Input id="edit-kelas" name="kelas" defaultValue={selectedUser.kelas || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-jabatan">Jabatan (untuk guru/staff)</Label>
                        <Input id="edit-jabatan" name="jabatan" defaultValue={selectedUser.jabatan || ''} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => {
                          setShowUserEditDialog(false);
                          setSelectedUser(null);
                        }}>Batal</Button>
                        <Button type="submit" disabled={loading}>Simpan Perubahan</Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>
          )}

          {/* Setting Tab */}
          <TabsContent value="setting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kategori Barang</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Dialog open={showKategoriDialog} onOpenChange={setShowKategoriDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Kategori
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Kategori Baru</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        const formData = new FormData(e.target);
                        const data = {
                          nama: formData.get('nama'),
                          deskripsi: formData.get('deskripsi')
                        };
                        
                        try {
                          const response = await apiCall('/kategori', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                          });
                          const result = await response.json();
                          if (response.ok) {
                            setSuccess('Kategori berhasil ditambahkan!');
                            setShowKategoriDialog(false);
                            loadKategori();
                            e.target.reset();
                          } else {
                            setError(result.error);
                          }
                        } catch (err) {
                          setError('Terjadi kesalahan');
                        }
                        setLoading(false);
                      }} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="nama">Nama Kategori *</Label>
                          <Input id="nama" name="nama" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deskripsi">Deskripsi</Label>
                          <Textarea id="deskripsi" name="deskripsi" rows={3} />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button type="button" variant="outline" onClick={() => setShowKategoriDialog(false)}>Batal</Button>
                          <Button type="submit" disabled={loading}>Simpan</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {kategori.map((k) => (
                      <div key={k._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{k.nama}</p>
                            <p className="text-sm text-gray-600 mt-1">{k.deskripsi}</p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedKategori(k);
                                setShowKategoriEditDialog(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteKategori(k._id)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit Kategori Dialog */}
                  <Dialog open={showKategoriEditDialog} onOpenChange={setShowKategoriEditDialog}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Kategori</DialogTitle>
                      </DialogHeader>
                      {selectedKategori && (
                        <form onSubmit={handleEditKategori} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-kategori-nama">Nama Kategori *</Label>
                            <Input id="edit-kategori-nama" name="nama" defaultValue={selectedKategori.nama} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-kategori-deskripsi">Deskripsi</Label>
                            <Textarea id="edit-kategori-deskripsi" name="deskripsi" rows={3} defaultValue={selectedKategori.deskripsi} />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => {
                              setShowKategoriEditDialog(false);
                              setSelectedKategori(null);
                            }}>Batal</Button>
                            <Button type="submit" disabled={loading}>
                              {loading ? 'Menyimpan...' : 'Update Kategori'}
                            </Button>
                          </div>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Database Management - Admin Only */}
            {user.role === 'admin' && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Manajemen Database
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    Backup, restore, dan kelola database sistem. Fitur ini hanya tersedia untuk Admin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Backup Database */}
                    <div className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Backup Database
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Download semua data sistem dalam format JSON. Backup dapat digunakan untuk restore di kemudian hari.
                          </p>
                        </div>
                        <Button
                          onClick={async () => {
                            try {
                              setLoading(true);
                              const response = await apiCall('/database/backup');
                              const backup = await response.json();
                              
                              // Create download
                              const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `backup-laboran-dkv-${new Date().toISOString().split('T')[0]}.json`;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                              
                              setSuccess('Backup berhasil diunduh!');
                            } catch (err) {
                              setError('Gagal membuat backup');
                            }
                            setLoading(false);
                          }}
                          disabled={loading}
                          className="ml-4"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Backup Sekarang
                        </Button>
                      </div>
                    </div>

                    {/* Restore Database */}
                    <div className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Restore Database
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Upload file backup untuk mengembalikan data. <strong className="text-red-600">PERHATIAN:</strong> Semua data saat ini akan diganti dengan data dari backup.
                          </p>
                        </div>
                        <div className="ml-4">
                          <input
                            type="file"
                            accept=".json"
                            id="restore-file"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              if (!confirm('PERINGATAN: Restore akan mengganti semua data saat ini dengan data dari backup. Apakah Anda yakin ingin melanjutkan?')) {
                                e.target.value = '';
                                return;
                              }

                              try {
                                setLoading(true);
                                const text = await file.text();
                                const backup = JSON.parse(text);
                                
                                const response = await apiCall('/database/restore', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(backup)
                                });
                                
                                const result = await response.json();
                                if (response.ok) {
                                  setSuccess(`Database berhasil di-restore! ${result.stats.users} users, ${result.stats.barang} barang, ${result.stats.peminjaman} peminjaman, ${result.stats.kategori} kategori`);
                                  // Reload semua data
                                  setTimeout(() => window.location.reload(), 2000);
                                } else {
                                  setError(result.error || 'Gagal restore database');
                                }
                              } catch (err) {
                                setError('File backup tidak valid atau terjadi kesalahan');
                              }
                              setLoading(false);
                              e.target.value = '';
                            }}
                          />
                          <Button
                            onClick={() => document.getElementById('restore-file').click()}
                            disabled={loading}
                            variant="outline"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Pilih File Backup
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Clear Database */}
                    <div className="p-4 border-2 border-red-300 rounded-lg bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-red-900 flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Hapus Semua Data
                          </h3>
                          <p className="text-sm text-red-700 mt-1">
                            <strong>BAHAYA:</strong> Menghapus semua data barang, peminjaman, kategori, dan setting. User admin akan tetap dipertahankan. Tindakan ini tidak dapat dibatalkan!
                          </p>
                        </div>
                        <Button
                          onClick={async () => {
                            const confirm1 = confirm('⚠️ PERINGATAN PERTAMA:\n\nAnda akan menghapus SEMUA DATA dari sistem!\n\nApakah Anda yakin?');
                            if (!confirm1) return;

                            const confirm2 = confirm('⚠️ KONFIRMASI TERAKHIR:\n\nSemua data barang, peminjaman, kategori akan TERHAPUS PERMANEN!\n\nUser admin akan tetap ada.\n\nKlik OK untuk HAPUS atau Cancel untuk membatalkan.');
                            if (!confirm2) return;

                            try {
                              setLoading(true);
                              const response = await apiCall('/database/clear', {
                                method: 'DELETE'
                              });
                              
                              const result = await response.json();
                              if (response.ok) {
                                setSuccess(result.message);
                                setTimeout(() => window.location.reload(), 2000);
                              } else {
                                setError(result.error || 'Gagal menghapus database');
                              }
                            } catch (err) {
                              setError('Terjadi kesalahan');
                            }
                            setLoading(false);
                          }}
                          disabled={loading}
                          variant="destructive"
                          className="ml-4"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus Semua Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}