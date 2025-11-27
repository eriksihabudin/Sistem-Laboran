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
  Clock
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

  // Barang state
  const [barang, setBarang] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [barangDetail, setBarangDetail] = useState(null);
  const [filterKondisi, setFilterKondisi] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [searchBarang, setSearchBarang] = useState('');

  // Peminjaman state
  const [peminjaman, setPeminjaman] = useState([]);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [filterStatusPeminjaman, setFilterStatusPeminjaman] = useState('');

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

  // Dialogs
  const [showBarangDialog, setShowBarangDialog] = useState(false);
  const [showBarangEditDialog, setShowBarangEditDialog] = useState(false);
  const [showBarangDetailDialog, setShowBarangDetailDialog] = useState(false);
  const [showPeminjamanDialog, setShowPeminjamanDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showKategoriDialog, setShowKategoriDialog] = useState(false);

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
      if (activeTab === 'dashboard') loadDashboard();
      if (activeTab === 'inventaris') loadBarang();
      if (activeTab === 'peminjaman') loadPeminjaman();
      if (activeTab === 'users') loadUsers();
      if (activeTab === 'kategori') loadKategori();
      if (activeTab === 'setting') loadSetting();
      if (activeTab === 'laporan') {
        loadLaporan(laporanType);
      }
    }
  }, [user, token, activeTab]);

  useEffect(() => {
    if (user && token && activeTab === 'laporan') {
      loadLaporan(laporanType);
    }
  }, [laporanType]);

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
      const [statsRes, chartPeminjamanRes, chartKerusakanRes] = await Promise.all([
        apiCall('/dashboard/stats'),
        apiCall(`/dashboard/chart/peminjaman?year=${chartYear}`),
        apiCall('/dashboard/chart/kerusakan')
      ]);

      const statsData = await statsRes.json();
      const chartPeminjamanData = await chartPeminjamanRes.json();
      const chartKerusakanData = await chartKerusakanRes.json();

      setStats(statsData);
      setChartPeminjaman(chartPeminjamanData);
      setChartKerusakan(chartKerusakanData);
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
    if (!laporanSearch) return laporanData;
    
    const searchLower = laporanSearch.toLowerCase();
    
    if (laporanType === 'Peminjaman Bulanan') {
      return laporanData.filter(item => 
        item.namaPeminjam?.toLowerCase().includes(searchLower) ||
        item.kelasjabatan?.toLowerCase().includes(searchLower) ||
        item.catatan?.toLowerCase().includes(searchLower)
      );
    } else {
      return laporanData.filter(item => 
        item.nama?.toLowerCase().includes(searchLower) ||
        item.kategori?.toLowerCase().includes(searchLower) ||
        item.serial?.toLowerCase().includes(searchLower) ||
        item.lokasi?.toLowerCase().includes(searchLower)
      );
    }
  };

  const handlePrintLaporan = () => {
    window.print();
  };

  const handleAddBarang = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.target);
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
      loadPeminjaman();
      e.target.reset();
    } catch (err) {
      setError('Terjadi kesalahan saat menambah peminjaman');
    }
    setLoading(false);
  };

  const handleReturnBarang = async (peminjamanId) => {
    if (!confirm('Tandai barang sebagai dikembalikan?')) return;

    setLoading(true);
    try {
      const response = await apiCall('/peminjaman/return', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peminjamanId,
          kondisiBarang: 'baik',
          catatan: 'Dikembalikan'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal mengembalikan barang');
        setLoading(false);
        return;
      }

      setSuccess('Barang berhasil dikembalikan!');
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

  const handleUpdateKondisi = async (barangId, kondisi) => {
    setLoading(true);
    setError('');
    try {
      const body = JSON.stringify({
        barangId,
        kondisi,
        deskripsi: 'Update kondisi barang'
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
            <CardTitle className="text-2xl font-bold text-center">Sistem Laboran DKV</CardTitle>
            <CardDescription className="text-center">Masuk ke sistem inventaris dan peminjaman</CardDescription>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistem Laboran DKV</h1>
            <p className="text-sm text-gray-600">Selamat datang, {user.nama} ({user.role})</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="container mx-auto px-4 mt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      {success && (
        <div className="container mx-auto px-4 mt-4">
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 mt-6">
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setError(''); setSuccess(''); }}>
          <TabsList className="grid grid-cols-7 w-full mb-6">
            <TabsTrigger value="dashboard">
              <Package className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="inventaris">
              <ClipboardList className="h-4 w-4 mr-2" />
              Inventaris
            </TabsTrigger>
            <TabsTrigger value="kondisi">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Kondisi
            </TabsTrigger>
            <TabsTrigger value="peminjaman">
              <Calendar className="h-4 w-4 mr-2" />
              Peminjaman
            </TabsTrigger>
            <TabsTrigger value="laporan">
              <FileText className="h-4 w-4 mr-2" />
              Laporan
            </TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
            )}
            <TabsTrigger value="setting">
              <Settings className="h-4 w-4 mr-2" />
              Setting
            </TabsTrigger>
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
                      <div className="text-3xl font-bold">{stats.totalBarang}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-700">Barang Normal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-700">{stats.barangNormal}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-700">Barang Rusak</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-700">{stats.barangRusak}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-yellow-700">Rusak Bisa Dipakai</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-700">{stats.barangRusakBisaDipakai}</div>
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
                  className="w-64"
                />
                <Select value={filterKondisi} onValueChange={setFilterKondisi}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter Kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Semua Kondisi</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="rusak">Rusak</SelectItem>
                    <SelectItem value="rusak_bisa_dipakai">Rusak Bisa Dipakai</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={loadBarang}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
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
                        <Input id="kategori" name="kategori" placeholder="Kamera, Tripod, dll" />
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
                      <div className="space-y-2">
                        <Label htmlFor="foto">Foto Barang</Label>
                        <Input id="foto" name="foto" type="file" accept="image/*" />
                      </div>
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
                    {/* Foto Utama */}
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {barangDetail.foto ? (
                        <img src={barangDetail.foto} alt={barangDetail.nama} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="h-20 w-20 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Informasi Utama */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-2xl font-bold">{barangDetail.nama}</h3>
                        <div className="mt-2">{getKondisiBadge(barangDetail.kondisi)}</div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Serial/Code</p>
                        <p className="font-semibold">{barangDetail.serial || '-'}</p>
                      </div>
                    </div>

                    {/* Detail Informasi */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Kategori</p>
                        <p className="font-semibold">{barangDetail.kategori || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Lokasi Penyimpanan</p>
                        <p className="font-semibold">{barangDetail.lokasi || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Jumlah Unit</p>
                        <p className="font-semibold">{barangDetail.jumlah || 0} unit</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tahun Pembelian</p>
                        <p className="font-semibold">{barangDetail.tahunPembelian || '-'}</p>
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
                        <Input id="edit-kategori" name="kategori" defaultValue={selectedBarang.kategori} placeholder="Kamera, Tripod, dll" />
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
                      <div className="space-y-2">
                        <Label htmlFor="edit-foto">Foto Barang (Kosongkan jika tidak ingin diubah)</Label>
                        <Input id="edit-foto" name="foto" type="file" accept="image/*" />
                        {selectedBarang.foto && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1">Foto saat ini:</p>
                            <img src={selectedBarang.foto} alt="Current" className="w-20 h-20 object-cover rounded border" />
                          </div>
                        )}
                      </div>
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
              {barang.map((item) => (
                <Card key={item._id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
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
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => loadBarangDetail(item._id)}>
                        <Eye className="h-3 w-3 mr-1" />
                        Detail
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditBarang(item._id)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteBarang(item._id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Kondisi Tab */}
          <TabsContent value="kondisi" className="space-y-4">
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
              <Dialog open={showPeminjamanDialog} onOpenChange={setShowPeminjamanDialog}>
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
                        <Label htmlFor="tanggalPinjam">Tanggal Pinjam *</Label>
                        <Input id="tanggalPinjam" name="tanggalPinjam" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jamPinjam">Jam Pinjam *</Label>
                        <Input id="jamPinjam" name="jamPinjam" type="time" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tanggalKembali">Tanggal Kembali (Rencana)</Label>
                        <Input id="tanggalKembali" name="tanggalKembali" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="surat">Upload Surat Peminjaman</Label>
                        <Input id="surat" name="surat" type="file" accept=".pdf,.jpg,.jpeg,.png" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Barang yang Dipinjam *</Label>
                      <ScrollArea className="h-48 border rounded p-2">
                        {barang.filter(b => b.kondisi !== 'rusak').map((item) => (
                          <label key={item._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              value={item._id}
                              onChange={(e) => {
                                const checkbox = e.target;
                                const barangIdsInput = document.getElementById('barangIdsHidden');
                                let ids = barangIdsInput.value ? JSON.parse(barangIdsInput.value) : [];
                                if (checkbox.checked) {
                                  ids.push(item._id);
                                } else {
                                  ids = ids.filter(id => id !== item._id);
                                }
                                barangIdsInput.value = JSON.stringify(ids);
                              }}
                            />
                            {item.foto && <img src={item.foto} className="w-8 h-8 object-cover rounded" />}
                            <span className="text-sm">{item.nama} - {item.kategori}</span>
                          </label>
                        ))}
                      </ScrollArea>
                      <input type="hidden" id="barangIdsHidden" name="barangIds" defaultValue="[]" />
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
                <Card key={item._id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Peminjam</p>
                        <p className="font-semibold">{item.namaPeminjam}</p>
                        <p className="text-sm text-gray-600">{item.kelasjabatan}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tanggal & Jam Pinjam</p>
                        <p className="font-semibold">{new Date(item.tanggalPinjam).toLocaleDateString('id-ID')}</p>
                        <p className="text-sm">{item.jamPinjam}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        {item.status === 'dipinjam' ? (
                          <Badge className="bg-orange-500">Dipinjam</Badge>
                        ) : (
                          <Badge className="bg-green-500">Dikembalikan</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'dipinjam' && (
                          <Button size="sm" onClick={() => handleReturnBarang(item._id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Tandai Kembali
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
                      </div>
                    </div>
                    {item.barangData && item.barangData.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Barang yang dipinjam:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.barangData.map((b) => (
                            <div key={b._id} className="flex items-center gap-2 border rounded px-3 py-1">
                              {b.foto && <img src={b.foto} className="w-6 h-6 object-cover rounded" />}
                              <span className="text-sm">{b.nama}</span>
                            </div>
                          ))}
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
              <TabsList className="grid grid-cols-5 w-full">
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
                          <CardDescription>Total: {getFilteredLaporanData().length} dari {laporanData.length} barang</CardDescription>
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
                            {laporanData.map((item, idx) => (
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
                                <td className="p-3">{item.jumlah || 0}</td>
                                <td className="p-3">{item.tahunPembelian || '-'}</td>
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
                      <CardTitle>Laporan Barang Rusak</CardTitle>
                      <CardDescription>Total: {laporanData.length} barang</CardDescription>
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
                            {laporanData.map((item, idx) => (
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
                                <td className="p-3">{item.jumlah || 0}</td>
                                <td className="p-3">{item.tahunPembelian || '-'}</td>
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
                      <CardTitle>Laporan Barang Rusak Bisa Dipakai</CardTitle>
                      <CardDescription>Total: {laporanData.length} barang</CardDescription>
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
                            {laporanData.map((item, idx) => (
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
                                <td className="p-3">{item.jumlah || 0}</td>
                                <td className="p-3">{item.tahunPembelian || '-'}</td>
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
                      <CardTitle>Laporan Peminjaman Bulanan</CardTitle>
                      <CardDescription>Total: {laporanData.length} peminjaman</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-3 font-semibold">No</th>
                              <th className="text-left p-3 font-semibold">Nama Peminjam</th>
                              <th className="text-left p-3 font-semibold">Kelas/Jabatan</th>
                              <th className="text-left p-3 font-semibold">Tanggal Pinjam</th>
                              <th className="text-left p-3 font-semibold">Jam</th>
                              <th className="text-left p-3 font-semibold">Status</th>
                              <th className="text-left p-3 font-semibold">Jumlah Barang</th>
                              <th className="text-left p-3 font-semibold">Catatan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {laporanData.map((item, idx) => (
                              <tr key={item._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3 font-medium">{item.namaPeminjam}</td>
                                <td className="p-3">{item.kelasjabatan}</td>
                                <td className="p-3">{new Date(item.tanggalPinjam).toLocaleDateString('id-ID')}</td>
                                <td className="p-3">{item.jamPinjam}</td>
                                <td className="p-3">
                                  {item.status === 'dipinjam' ? (
                                    <Badge className="bg-orange-500">Dipinjam</Badge>
                                  ) : (
                                    <Badge className="bg-green-500">Dikembalikan</Badge>
                                  )}
                                </td>
                                <td className="p-3">{item.barang?.length || 0} item</td>
                                <td className="p-3">{item.catatan || '-'}</td>
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
                      <CardTitle>Laporan Inventaris Lengkap</CardTitle>
                      <CardDescription>Total: {laporanData.length} barang</CardDescription>
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
                            {laporanData.map((item, idx) => (
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
                                <td className="p-3">{item.jumlah || 0}</td>
                                <td className="p-3">{item.tahunPembelian || '-'}</td>
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
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-lg">{u.nama}</p>
                            <p className="text-sm text-gray-600">@{u.username}</p>
                          </div>
                          <Badge>{u.role}</Badge>
                        </div>
                        {u.kelas && <p className="text-sm">Kelas: {u.kelas}</p>}
                        {u.jabatan && <p className="text-sm">Jabatan: {u.jabatan}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Setting Tab */}
          <TabsContent value="setting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Profil Sekolah</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  const formData = new FormData(e.target);
                  const data = {
                    namaSekolah: formData.get('namaSekolah'),
                    alamat: formData.get('alamat'),
                    telepon: formData.get('telepon'),
                    email: formData.get('email')
                  };
                  
                  try {
                    const response = await apiCall('/setting', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    if (response.ok) {
                      setSuccess('Setting berhasil disimpan!');
                      loadSetting();
                    } else {
                      setError(result.error);
                    }
                  } catch (err) {
                    setError('Terjadi kesalahan');
                  }
                  setLoading(false);
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="namaSekolah">Nama Sekolah</Label>
                    <Input id="namaSekolah" name="namaSekolah" defaultValue={setting.namaSekolah} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alamat">Alamat</Label>
                    <Textarea id="alamat" name="alamat" defaultValue={setting.alamat} rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telepon">Telepon</Label>
                      <Input id="telepon" name="telepon" defaultValue={setting.telepon} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={setting.email} />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>Simpan Pengaturan</Button>
                </form>
              </CardContent>
            </Card>

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

                  <div className="grid grid-cols-2 gap-2">
                    {kategori.map((k) => (
                      <div key={k._id} className="p-3 border rounded">
                        <p className="font-semibold">{k.nama}</p>
                        <p className="text-sm text-gray-600">{k.deskripsi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}