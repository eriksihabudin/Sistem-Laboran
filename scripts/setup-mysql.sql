-- ============================================
-- SISTEM LABORAN DKV - MySQL Database Schema
-- ============================================

-- Drop database if exists (HATI-HATI!)
-- DROP DATABASE IF EXISTS laboran_dkv;

-- Create database
CREATE DATABASE IF NOT EXISTS laboran_dkv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE laboran_dkv;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    role ENUM('admin', 'laboran', 'waka_sarpras', 'guru', 'staff') NOT NULL DEFAULT 'laboran',
    kelas VARCHAR(50) NULL,
    jabatan VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: kategori
-- ============================================
CREATE TABLE IF NOT EXISTS kategori (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: barang
-- ============================================
CREATE TABLE IF NOT EXISTS barang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    kategori_id INT NULL,
    serial VARCHAR(100) NULL,
    kondisi ENUM('normal', 'rusak', 'hilang') NOT NULL DEFAULT 'normal',
    lokasi VARCHAR(255) NULL,
    jumlah INT DEFAULT 1,
    spesifikasi TEXT NULL,
    tahun_pembelian YEAR NULL,
    foto VARCHAR(500) NULL,
    status_peminjaman ENUM('tersedia', 'dipinjam') DEFAULT 'tersedia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL,
    INDEX idx_nama (nama),
    INDEX idx_kategori (kategori_id),
    INDEX idx_kondisi (kondisi),
    INDEX idx_status (status_peminjaman)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: barang_galeri (untuk foto tambahan)
-- ============================================
CREATE TABLE IF NOT EXISTS barang_galeri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barang_id INT NOT NULL,
    foto_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE,
    INDEX idx_barang (barang_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: barang_kerusakan (riwayat kerusakan)
-- ============================================
CREATE TABLE IF NOT EXISTS barang_kerusakan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barang_id INT NOT NULL,
    tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deskripsi TEXT NOT NULL,
    foto VARCHAR(500) NULL,
    oleh VARCHAR(100) NULL,
    FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE,
    INDEX idx_barang (barang_id),
    INDEX idx_tanggal (tanggal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: peminjaman
-- ============================================
CREATE TABLE IF NOT EXISTS peminjaman (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_peminjam VARCHAR(255) NOT NULL,
    kelas_jabatan VARCHAR(100) NOT NULL,
    tanggal_pinjam DATETIME NOT NULL,
    jam_pinjam TIME NOT NULL,
    tanggal_kembali_rencana DATE NULL,
    jam_kembali_rencana TIME NULL,
    tanggal_dikembalikan DATETIME NULL,
    jam_dikembalikan TIME NULL,
    status ENUM('dipinjam', 'dikembalikan') DEFAULT 'dipinjam',
    surat VARCHAR(500) NULL,
    catatan TEXT NULL,
    kondisi_pengembalian ENUM('normal', 'rusak', 'hilang') NULL,
    catatan_pengembalian TEXT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_nama_peminjam (nama_peminjam),
    INDEX idx_status (status),
    INDEX idx_tanggal_pinjam (tanggal_pinjam),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: peminjaman_barang (junction table)
-- ============================================
CREATE TABLE IF NOT EXISTS peminjaman_barang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    peminjaman_id INT NOT NULL,
    barang_id INT NOT NULL,
    FOREIGN KEY (peminjaman_id) REFERENCES peminjaman(id) ON DELETE CASCADE,
    FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE,
    INDEX idx_peminjaman (peminjaman_id),
    INDEX idx_barang (barang_id),
    UNIQUE KEY unique_peminjaman_barang (peminjaman_id, barang_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: setting
-- ============================================
CREATE TABLE IF NOT EXISTS setting (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Default Data
-- ============================================

-- Default admin user (password: admin123)
-- Password hash dibuat dengan bcrypt
INSERT INTO users (username, password, nama, role) VALUES 
('admin', '$2a$10$YourHashedPasswordHere', 'Administrator', 'admin'),
('laboran', '$2a$10$YourHashedPasswordHere', 'Laboran DKV', 'laboran')
ON DUPLICATE KEY UPDATE username=username;

-- Default categories
INSERT INTO kategori (nama, deskripsi) VALUES 
('Kamera', 'Kamera digital dan DSLR'),
('Lensa', 'Lensa kamera berbagai jenis'),
('Tripod', 'Tripod dan stabilizer'),
('Audio', 'Peralatan audio dan mikrofon'),
('Lighting', 'Lighting dan peralatan pencahayaan'),
('Komputer', 'Komputer dan laptop'),
('Aksesoris', 'Aksesoris kamera dan lainnya'),
('Monitor', 'Monitor dan display'),
('Software', 'Lisensi software')
ON DUPLICATE KEY UPDATE nama=nama;

-- ============================================
-- Done!
-- ============================================
