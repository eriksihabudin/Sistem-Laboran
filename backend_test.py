#!/usr/bin/env python3
"""
Backend API Testing for DKV Laboran System
Tests all authentication, dashboard, barang, peminjaman, kategori, users, and setting APIs
"""

import requests
import json
import os
from datetime import datetime
import tempfile

# Get base URL from environment
BASE_URL = "https://dkvlab.preview.emergentagent.com/api"

class DKVAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.tokens = {}
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'details': details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_auth_login(self):
        """Test authentication login for all user roles"""
        print("\n=== Testing Authentication APIs ===")
        
        # Test credentials from seed data
        credentials = [
            {"username": "admin", "password": "admin123", "expected_role": "admin"},
            {"username": "laboran", "password": "laboran123", "expected_role": "laboran"},
            {"username": "guru", "password": "guru123", "expected_role": "guru"}
        ]
        
        for cred in credentials:
            try:
                response = requests.post(
                    f"{self.base_url}/auth/login",
                    json=cred,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if 'token' in data and 'user' in data:
                        # Store token for later use
                        self.tokens[cred['expected_role']] = data['token']
                        
                        # Verify user data
                        user = data['user']
                        if user['role'] == cred['expected_role']:
                            self.log_test(
                                f"Login {cred['username']}", 
                                True, 
                                f"Successfully logged in as {user['role']}"
                            )
                        else:
                            self.log_test(
                                f"Login {cred['username']}", 
                                False, 
                                f"Role mismatch: expected {cred['expected_role']}, got {user['role']}"
                            )
                    else:
                        self.log_test(
                            f"Login {cred['username']}", 
                            False, 
                            "Missing token or user in response",
                            data
                        )
                else:
                    self.log_test(
                        f"Login {cred['username']}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_test(f"Login {cred['username']}", False, f"Exception: {str(e)}")
    
    def test_auth_me(self):
        """Test /auth/me endpoint with tokens"""
        for role, token in self.tokens.items():
            try:
                response = requests.get(
                    f"{self.base_url}/auth/me",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if 'role' in data and data['role'] == role:
                        self.log_test(
                            f"Auth/me {role}", 
                            True, 
                            f"Successfully verified {role} identity"
                        )
                    else:
                        self.log_test(
                            f"Auth/me {role}", 
                            False, 
                            f"Role verification failed",
                            data
                        )
                else:
                    self.log_test(
                        f"Auth/me {role}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_test(f"Auth/me {role}", False, f"Exception: {str(e)}")
    
    def test_dashboard_apis(self):
        """Test dashboard APIs"""
        print("\n=== Testing Dashboard APIs ===")
        
        # Test with admin token
        if 'admin' not in self.tokens:
            self.log_test("Dashboard APIs", False, "No admin token available")
            return
            
        token = self.tokens['admin']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test dashboard stats
        try:
            response = requests.get(f"{self.base_url}/dashboard/stats", headers=headers)
            if response.status_code == 200:
                data = response.json()
                required_fields = ['totalBarang', 'barangNormal', 'barangRusak', 'barangRusakBisaDipakai', 'peminjamanAktifHariIni']
                if all(field in data for field in required_fields):
                    self.log_test("Dashboard stats", True, "All required fields present")
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Dashboard stats", False, f"Missing fields: {missing}", data)
            else:
                self.log_test("Dashboard stats", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Dashboard stats", False, f"Exception: {str(e)}")
        
        # Test peminjaman chart
        try:
            response = requests.get(f"{self.base_url}/dashboard/chart/peminjaman?year=2024", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) == 12:
                    self.log_test("Dashboard peminjaman chart", True, "Chart data returned correctly")
                else:
                    self.log_test("Dashboard peminjaman chart", False, "Invalid chart data format", data)
            else:
                self.log_test("Dashboard peminjaman chart", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Dashboard peminjaman chart", False, f"Exception: {str(e)}")
        
        # Test kerusakan chart
        try:
            response = requests.get(f"{self.base_url}/dashboard/chart/kerusakan", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Dashboard kerusakan chart", True, "Chart data returned correctly")
                else:
                    self.log_test("Dashboard kerusakan chart", False, "Invalid chart data format", data)
            else:
                self.log_test("Dashboard kerusakan chart", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Dashboard kerusakan chart", False, f"Exception: {str(e)}")
    
    def test_barang_apis(self):
        """Test barang APIs"""
        print("\n=== Testing Barang APIs ===")
        
        if 'admin' not in self.tokens:
            self.log_test("Barang APIs", False, "No admin token available")
            return
            
        token = self.tokens['admin']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test get all barang
        try:
            response = requests.get(f"{self.base_url}/barang", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get all barang", True, f"Retrieved {len(data)} items")
                else:
                    self.log_test("Get all barang", False, "Invalid response format", data)
            else:
                self.log_test("Get all barang", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get all barang", False, f"Exception: {str(e)}")
        
        # Test filter by kondisi normal
        try:
            response = requests.get(f"{self.base_url}/barang?kondisi=normal", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    normal_items = [item for item in data if item.get('kondisi') == 'normal']
                    if len(normal_items) == len(data):
                        self.log_test("Filter barang normal", True, f"Retrieved {len(data)} normal items")
                    else:
                        self.log_test("Filter barang normal", False, "Filter not working correctly")
                else:
                    self.log_test("Filter barang normal", False, "Invalid response format")
            else:
                self.log_test("Filter barang normal", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Filter barang normal", False, f"Exception: {str(e)}")
        
        # Test filter by kondisi rusak
        try:
            response = requests.get(f"{self.base_url}/barang?kondisi=rusak", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    rusak_items = [item for item in data if item.get('kondisi') == 'rusak']
                    if len(rusak_items) == len(data):
                        self.log_test("Filter barang rusak", True, f"Retrieved {len(data)} rusak items")
                    else:
                        self.log_test("Filter barang rusak", False, "Filter not working correctly")
                else:
                    self.log_test("Filter barang rusak", False, "Invalid response format")
            else:
                self.log_test("Filter barang rusak", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Filter barang rusak", False, f"Exception: {str(e)}")
        
        # Test search Canon
        try:
            response = requests.get(f"{self.base_url}/barang?search=Canon", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    canon_items = [item for item in data if 'Canon' in item.get('nama', '')]
                    if len(canon_items) > 0:
                        self.log_test("Search Canon", True, f"Found {len(canon_items)} Canon items")
                    else:
                        self.log_test("Search Canon", True, "No Canon items found (expected if no Canon items exist)")
                else:
                    self.log_test("Search Canon", False, "Invalid response format")
            else:
                self.log_test("Search Canon", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Search Canon", False, f"Exception: {str(e)}")
        
        # Test POST barang (add new item)
        try:
            # Create a simple text file to simulate image upload
            with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as temp_file:
                temp_file.write(b'test image content')
                temp_file_path = temp_file.name
            
            with open(temp_file_path, 'rb') as f:
                files = {'foto': ('test.jpg', f, 'image/jpeg')}
                data = {
                    'nama': 'Test Camera API',
                    'kategori': 'Kamera',
                    'serial': 'TEST-001',
                    'kondisi': 'normal',
                    'lokasi': 'Test Rack',
                    'jumlah': '1',
                    'spesifikasi': 'Test camera for API testing',
                    'tahunPembelian': '2024'
                }
                
                response = requests.post(
                    f"{self.base_url}/barang",
                    data=data,
                    files=files,
                    headers={"Authorization": f"Bearer {token}"}
                )
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
            if response.status_code == 200:
                result = response.json()
                if 'id' in result and 'message' in result:
                    self.log_test("Add new barang", True, "Successfully added new item")
                else:
                    self.log_test("Add new barang", False, "Invalid response format", result)
            else:
                self.log_test("Add new barang", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Add new barang", False, f"Exception: {str(e)}")
    
    def test_peminjaman_apis(self):
        """Test peminjaman APIs"""
        print("\n=== Testing Peminjaman APIs ===")
        
        if 'laboran' not in self.tokens:
            self.log_test("Peminjaman APIs", False, "No laboran token available")
            return
            
        token = self.tokens['laboran']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test get all peminjaman
        try:
            response = requests.get(f"{self.base_url}/peminjaman", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get all peminjaman", True, f"Retrieved {len(data)} peminjaman records")
                else:
                    self.log_test("Get all peminjaman", False, "Invalid response format", data)
            else:
                self.log_test("Get all peminjaman", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get all peminjaman", False, f"Exception: {str(e)}")
        
        # Test POST peminjaman (add new borrowing record)
        # First, get some barang IDs to use
        try:
            barang_response = requests.get(f"{self.base_url}/barang", headers=headers)
            if barang_response.status_code == 200:
                barang_list = barang_response.json()
                if len(barang_list) > 0:
                    # Use first available barang
                    barang_id = str(barang_list[0]['_id'])
                    
                    # Create a simple text file to simulate surat upload
                    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
                        temp_file.write(b'test surat content')
                        temp_file_path = temp_file.name
                    
                    with open(temp_file_path, 'rb') as f:
                        files = {'surat': ('surat_test.pdf', f, 'application/pdf')}
                        data = {
                            'namaPeminjam': 'Siswa Test API',
                            'kelasjabatan': 'XII DKV 1',
                            'barangIds': json.dumps([barang_id]),
                            'tanggalPinjam': '2024-12-20',
                            'jamPinjam': '08:00',
                            'tanggalKembali': '2024-12-21',
                            'catatan': 'Test peminjaman via API'
                        }
                        
                        response = requests.post(
                            f"{self.base_url}/peminjaman",
                            data=data,
                            files=files,
                            headers={"Authorization": f"Bearer {token}"}
                        )
                    
                    # Clean up temp file
                    os.unlink(temp_file_path)
                    
                    if response.status_code == 200:
                        result = response.json()
                        if 'id' in result and 'message' in result:
                            self.log_test("Add new peminjaman", True, "Successfully added new peminjaman")
                        else:
                            self.log_test("Add new peminjaman", False, "Invalid response format", result)
                    else:
                        self.log_test("Add new peminjaman", False, f"HTTP {response.status_code}: {response.text}")
                else:
                    self.log_test("Add new peminjaman", False, "No barang available for testing")
            else:
                self.log_test("Add new peminjaman", False, "Could not retrieve barang for testing")
                
        except Exception as e:
            self.log_test("Add new peminjaman", False, f"Exception: {str(e)}")
    
    def test_kategori_apis(self):
        """Test kategori APIs"""
        print("\n=== Testing Kategori APIs ===")
        
        if 'admin' not in self.tokens:
            self.log_test("Kategori APIs", False, "No admin token available")
            return
            
        token = self.tokens['admin']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test get all kategori
        try:
            response = requests.get(f"{self.base_url}/kategori", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get all kategori", True, f"Retrieved {len(data)} categories")
                else:
                    self.log_test("Get all kategori", False, "Invalid response format", data)
            else:
                self.log_test("Get all kategori", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get all kategori", False, f"Exception: {str(e)}")
    
    def test_users_apis(self):
        """Test users APIs (admin only)"""
        print("\n=== Testing Users APIs ===")
        
        if 'admin' not in self.tokens:
            self.log_test("Users APIs", False, "No admin token available")
            return
            
        token = self.tokens['admin']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test get all users (admin only)
        try:
            response = requests.get(f"{self.base_url}/users", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get all users (admin)", True, f"Retrieved {len(data)} users")
                else:
                    self.log_test("Get all users (admin)", False, "Invalid response format", data)
            else:
                self.log_test("Get all users (admin)", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get all users (admin)", False, f"Exception: {str(e)}")
        
        # Test access with non-admin token (should fail)
        if 'guru' in self.tokens:
            try:
                guru_headers = {"Authorization": f"Bearer {self.tokens['guru']}"}
                response = requests.get(f"{self.base_url}/users", headers=guru_headers)
                if response.status_code == 401:
                    self.log_test("Users API authorization", True, "Correctly denied access to non-admin user")
                else:
                    self.log_test("Users API authorization", False, f"Should have denied access, got HTTP {response.status_code}")
            except Exception as e:
                self.log_test("Users API authorization", False, f"Exception: {str(e)}")
    
    def test_setting_apis(self):
        """Test setting APIs"""
        print("\n=== Testing Setting APIs ===")
        
        if 'admin' not in self.tokens:
            self.log_test("Setting APIs", False, "No admin token available")
            return
            
        token = self.tokens['admin']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test get setting
        try:
            response = requests.get(f"{self.base_url}/setting", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict):
                    self.log_test("Get setting", True, "Successfully retrieved settings")
                else:
                    self.log_test("Get setting", False, "Invalid response format", data)
            else:
                self.log_test("Get setting", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get setting", False, f"Exception: {str(e)}")
    
    def test_authorization_across_roles(self):
        """Test authorization works correctly across different roles"""
        print("\n=== Testing Authorization Across Roles ===")
        
        # Test that all roles can access basic endpoints
        endpoints_all_roles = [
            "/auth/me",
            "/barang",
            "/kategori",
            "/setting"
        ]
        
        for role, token in self.tokens.items():
            headers = {"Authorization": f"Bearer {token}"}
            for endpoint in endpoints_all_roles:
                try:
                    response = requests.get(f"{self.base_url}{endpoint}", headers=headers)
                    if response.status_code == 200:
                        self.log_test(f"{role} access {endpoint}", True, f"Successfully accessed as {role}")
                    else:
                        self.log_test(f"{role} access {endpoint}", False, f"HTTP {response.status_code} for {role}")
                except Exception as e:
                    self.log_test(f"{role} access {endpoint}", False, f"Exception for {role}: {str(e)}")
        
        # Test admin-only endpoints
        admin_only_endpoints = ["/users"]
        
        for endpoint in admin_only_endpoints:
            # Test admin access (should work)
            if 'admin' in self.tokens:
                try:
                    headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
                    response = requests.get(f"{self.base_url}{endpoint}", headers=headers)
                    if response.status_code == 200:
                        self.log_test(f"Admin access {endpoint}", True, "Admin successfully accessed")
                    else:
                        self.log_test(f"Admin access {endpoint}", False, f"Admin got HTTP {response.status_code}")
                except Exception as e:
                    self.log_test(f"Admin access {endpoint}", False, f"Admin exception: {str(e)}")
            
            # Test non-admin access (should fail)
            for role in ['laboran', 'guru']:
                if role in self.tokens:
                    try:
                        headers = {"Authorization": f"Bearer {self.tokens[role]}"}
                        response = requests.get(f"{self.base_url}{endpoint}", headers=headers)
                        if response.status_code == 401:
                            self.log_test(f"{role} denied {endpoint}", True, f"Correctly denied {role} access")
                        else:
                            self.log_test(f"{role} denied {endpoint}", False, f"{role} got HTTP {response.status_code}, should be 401")
                    except Exception as e:
                        self.log_test(f"{role} denied {endpoint}", False, f"{role} exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests"""
        print(f"🚀 Starting DKV Laboran System API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Run tests in order
        self.test_auth_login()
        self.test_auth_me()
        self.test_dashboard_apis()
        self.test_barang_apis()
        self.test_peminjaman_apis()
        self.test_kategori_apis()
        self.test_users_apis()
        self.test_setting_apis()
        self.test_authorization_across_roles()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   ❌ {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)
        return passed_tests, failed_tests

if __name__ == "__main__":
    tester = DKVAPITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)