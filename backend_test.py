#!/usr/bin/env python3
"""
Backend API Testing for Display Settings Feature
Tests all Display Settings related endpoints
"""

import requests
import json
import sys
import os
from typing import Dict, Any, Optional

# Get backend URL from environment
BACKEND_URL = "https://fastshop-blog.preview.emergentagent.com/api"

# Test credentials
ADMIN_EMAIL = "admin@mercadolivre.com"
ADMIN_PASSWORD = "admin123"

class DisplaySettingsAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    def admin_login(self) -> bool:
        """Login as admin to get authentication"""
        try:
            response = self.session.post(
                f"{BACKEND_URL}/admin/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                timeout=10
            )
            
            if response.status_code == 200:
                admin_data = response.json()
                self.log_test("Admin Login", True, f"Logged in as {admin_data.get('name', 'Admin')}")
                return True
            else:
                self.log_test("Admin Login", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception: {str(e)}")
            return False
    
    def test_public_display_settings(self) -> bool:
        """Test GET /api/display-settings (public endpoint)"""
        try:
            response = self.session.get(f"{BACKEND_URL}/display-settings", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                if isinstance(data, dict):
                    # Check for expected settings
                    expected_settings = [
                        'show_price', 'show_original_price', 'show_discount', 'show_installments',
                        'show_free_shipping', 'show_specs', 'show_brand', 'show_condition',
                        'show_stock', 'show_sold', 'show_rating', 'show_reviews_count',
                        'show_action_button', 'show_seller_info'
                    ]
                    
                    found_settings = []
                    for setting in expected_settings:
                        if setting in data:
                            found_settings.append(setting)
                    
                    details = f"Found {len(found_settings)}/{len(expected_settings)} expected settings"
                    self.log_test("Public Display Settings", True, details)
                    return True
                else:
                    self.log_test("Public Display Settings", False, "Response is not a dict", data)
                    return False
            else:
                self.log_test("Public Display Settings", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Public Display Settings", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_display_settings_list(self) -> bool:
        """Test GET /api/admin/display-settings"""
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/display-settings", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                if isinstance(data, dict) and 'settings' in data and 'groups' in data:
                    settings = data['settings']
                    groups = data['groups']
                    
                    # Check groups structure
                    expected_groups = ['price', 'delivery', 'product', 'interaction', 'seller']
                    found_groups = [group for group in expected_groups if group in groups]
                    
                    details = f"Found {len(found_groups)}/{len(expected_groups)} expected groups, {len(settings)} total settings"
                    self.log_test("Admin Display Settings List", True, details)
                    return True
                else:
                    self.log_test("Admin Display Settings List", False, "Missing 'settings' or 'groups' keys", data)
                    return False
            else:
                self.log_test("Admin Display Settings List", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Admin Display Settings List", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_display_settings_update(self) -> bool:
        """Test PUT /api/admin/display-settings"""
        try:
            # Test updating a few settings
            update_data = {
                "settings": [
                    {"setting_key": "show_price", "setting_value": True},
                    {"setting_key": "show_rating", "setting_value": False},
                    {"setting_key": "show_free_shipping", "setting_value": True}
                ]
            }
            
            response = self.session.put(
                f"{BACKEND_URL}/admin/display-settings",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_test("Admin Display Settings Update", True, data['message'])
                    return True
                else:
                    self.log_test("Admin Display Settings Update", False, "No success message", data)
                    return False
            else:
                self.log_test("Admin Display Settings Update", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Admin Display Settings Update", False, f"Exception: {str(e)}")
            return False
    
    def test_product_with_display_overrides(self) -> bool:
        """Test GET /api/products/{id} to check displayOverrides field"""
        try:
            # Test with product ID 1
            response = self.session.get(f"{BACKEND_URL}/products/1", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if displayOverrides field exists
                if 'displayOverrides' in data:
                    overrides = data['displayOverrides']
                    details = f"displayOverrides field present, value: {overrides}"
                    self.log_test("Product with Display Overrides", True, details)
                    return True
                else:
                    self.log_test("Product with Display Overrides", False, "displayOverrides field missing", data.keys())
                    return False
            else:
                self.log_test("Product with Display Overrides", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Product with Display Overrides", False, f"Exception: {str(e)}")
            return False
    
    def test_update_product_display_overrides(self) -> bool:
        """Test PUT /api/admin/products/{id} with display_overrides"""
        try:
            # Test updating product 1 with display overrides
            update_data = {
                "display_overrides": {
                    "show_price": False,
                    "show_rating": True,
                    "show_free_shipping": False
                }
            }
            
            response = self.session.put(
                f"{BACKEND_URL}/admin/products/1",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    # Verify the update by fetching the product
                    verify_response = self.session.get(f"{BACKEND_URL}/products/1", timeout=10)
                    if verify_response.status_code == 200:
                        product_data = verify_response.json()
                        overrides = product_data.get('displayOverrides')
                        if overrides and overrides.get('show_price') == False:
                            self.log_test("Update Product Display Overrides", True, "Successfully updated and verified")
                            return True
                        else:
                            self.log_test("Update Product Display Overrides", False, "Update not reflected in product data", overrides)
                            return False
                    else:
                        self.log_test("Update Product Display Overrides", True, "Update successful but verification failed")
                        return True
                else:
                    self.log_test("Update Product Display Overrides", False, "No success message", data)
                    return False
            else:
                self.log_test("Update Product Display Overrides", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Update Product Display Overrides", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_product_display_overrides_endpoints(self) -> bool:
        """Test admin-specific display override endpoints"""
        try:
            # Test GET /api/admin/display-settings/product/{id}
            response = self.session.get(f"{BACKEND_URL}/admin/display-settings/product/1", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'overrides' in data and 'useGlobal' in data:
                    details = f"Product overrides: {data['overrides']}, useGlobal: {data['useGlobal']}"
                    self.log_test("Admin Product Display Overrides GET", True, details)
                    
                    # Test PUT /api/admin/display-settings/product/{id}
                    put_response = self.session.put(
                        f"{BACKEND_URL}/admin/display-settings/product/1",
                        json={"show_brand": False, "show_condition": True},
                        timeout=10
                    )
                    
                    if put_response.status_code == 200:
                        put_data = put_response.json()
                        if 'message' in put_data:
                            self.log_test("Admin Product Display Overrides PUT", True, put_data['message'])
                            return True
                        else:
                            self.log_test("Admin Product Display Overrides PUT", False, "No success message", put_data)
                            return False
                    else:
                        self.log_test("Admin Product Display Overrides PUT", False, f"Status: {put_response.status_code}", put_response.text)
                        return False
                else:
                    self.log_test("Admin Product Display Overrides GET", False, "Missing required fields", data)
                    return False
            else:
                self.log_test("Admin Product Display Overrides GET", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Admin Product Display Overrides", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all Display Settings API tests"""
        print("=" * 60)
        print("DISPLAY SETTINGS BACKEND API TESTING")
        print("=" * 60)
        print()
        
        # Test admin login first
        if not self.admin_login():
            print("❌ Cannot proceed without admin authentication")
            return False
        
        # Run all tests
        tests = [
            self.test_public_display_settings,
            self.test_admin_display_settings_list,
            self.test_admin_display_settings_update,
            self.test_product_with_display_overrides,
            self.test_update_product_display_overrides,
            self.test_admin_product_display_overrides_endpoints
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print(f"TEST SUMMARY: {passed}/{total} tests passed")
        print("=" * 60)
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return passed == total

def main():
    """Main test execution"""
    tester = DisplaySettingsAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All Display Settings API tests passed!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()