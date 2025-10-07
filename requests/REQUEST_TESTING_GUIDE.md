# Hướng dẫn Test API với REST Client

> **Tài liệu hướng dẫn thứ tự chạy các file `.rest` để test backend API của hệ thống Admin Mart**

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Chuẩn bị](#chuẩn-bị)
- [Thứ tự chạy các requests](#thứ-tự-chạy-các-requests)
- [Chi tiết từng file](#chi-tiết-từng-file)
- [Lưu ý quan trọng](#lưu-ý-quan-trọng)
- [Các vấn đề thường gặp](#các-vấn-đề-thường-gặp)

---

## 🎯 Giới thiệu

Hệ thống bao gồm 10 modules với 9 file `.rest` để test API:
1. **users.rest** - Quản lý người dùng (✅ Implemented)
2. **categories.rest** - Quản lý danh mục (✅ Implemented)
3. **create_all_products.rest** - Tạo sản phẩm mẫu (✅ Implemented)
4. **orders.rest** - Quản lý đơn hàng (✅ Implemented)
5. **customers.rest** - Quản lý khách hàng (🟡 Pending)
6. **inventory.rest** - Quản lý tồn kho (🟡 Pending)
7. **payments.rest** - Quản lý thanh toán (🟡 Pending)
8. **purchaseOrders.rest** - Quản lý đơn mua hàng (🟡 Pending)
9. **suppliers.rest** - Quản lý nhà cung cấp (🟡 Pending)
10. **reports.rest** - Báo cáo thống kê (🟡 Pending)

**Chú thích trạng thái:**
- ✅ Implemented: Controller đã được triển khai, có thể test ngay
- 🟡 Pending: Model đã sẵn sàng, đang chờ triển khai controller

---

## 🔧 Chuẩn bị

### 1. Cài đặt Extension
Cài đặt **REST Client** extension trong VS Code:
- Extension ID: `humao.rest-client`
- Hoặc tìm "REST Client" trong VS Code Extension Marketplace

### 2. Khởi động Backend Server
```bash
cd backend
npm install
npm run dev
```

Server sẽ chạy tại: `http://localhost:3001`

### 3. Kiểm tra Database
Đảm bảo MongoDB đang chạy và kết nối thành công:
```bash
# Kiểm tra connection string trong backend/utils/config.js
# MONGODB_URI=mongodb://localhost:27017/admin-mart
```

### 4. Seed Admin User (Chỉ chạy lần đầu)
```bash
cd backend
node utils/seedAdmin.js
```

Thông tin đăng nhập mặc định:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `admin`

---

## 📝 Thứ tự chạy các requests

### **GIAI ĐOẠN 1: AUTHENTICATION & USERS** ✅
**File:** `backend/requests/users.rest`

**Bước 1.1: Đăng nhập Admin**
```http
POST {{baseUrl}}/login
```
- ⚠️ **BẮT BUỘC chạy đầu tiên!**
- Token sẽ được tự động lưu vào biến `@token`
- Token này sẽ được dùng cho tất cả các requests sau

**Bước 1.2: Tạo users mẫu** (Tùy chọn)
```http
POST {{baseUrl}}/users
# Tạo employee, manager, regular users
```

---

### **GIAI ĐOẠN 2: CATEGORIES** ✅
**File:** `backend/requests/categories.rest`

**Bước 2.1: Đăng nhập** (Nếu chưa có token)
```http
POST {{baseUrl}}/login
```

**Bước 2.2: Tạo 8 categories**
```http
# Chạy lần lượt 8 requests tạo categories:
1. POST /categories - Thực phẩm tươi sống
2. POST /categories - Thực phẩm chế biến
3. POST /categories - Đồ uống
4. POST /categories - Đồ gia dụng
5. POST /categories - Chăm sóc cá nhân
6. POST /categories - Nguyên liệu làm bánh (nested)
7. POST /categories - Thịt, hải sản (nested)
8. POST /categories - Rau, củ, quả (nested)
```
- ✅ Các ID categories sẽ tự động lưu vào biến: `@freshFoodId`, `@processedFoodId`, etc.
- ✅ Các biến này sẽ được dùng trong file `create_all_products.rest`

---

### **GIAI ĐOẠN 3: PRODUCTS** ✅
**File:** `backend/requests/create_all_products.rest`

**Bước 3.1: Cập nhật Category IDs**
- Mở file `create_all_products.rest`
- Dán các category IDs từ bước 2.2 vào section REFERENCE IDs:
```rest
@freshFoodId = 67e3775b81ace97f65644530  # Copy từ categories.rest
@processedFoodId = 67e3775b81ace97f65644531
@beverageId = 67e3775b81ace97f65644532
# ... etc
```

**Bước 3.2: Tạo 15 sản phẩm mẫu**
```http
# Chạy lần lượt 15 requests tạo products
POST /products - Thịt bò Úc
POST /products - Cá hồi Na Uy
POST /products - Gạo ST25
# ... 12 products khác
```
- ✅ Product IDs sẽ tự động lưu vào biến: `@productId1`, `@productId2`, etc.

---

### **GIAI ĐOẠN 4: ORDERS** ✅
**File:** `backend/requests/orders.rest`

**Bước 4.1: Cập nhật Product IDs**
```rest
@productId1 = 67e1a93da89f2e0013b39b5d  # Copy từ create_all_products.rest
@productId2 = 67e1a93da89f2e0013b39b5e
# ... etc
```

**Bước 4.2: Tạo orders mẫu**
```http
# 5 kịch bản order khác nhau:
1. POST /orders - Guest order (không cần login)
2. POST /orders - Multiple products
3. POST /orders - Auth user order
4. POST /orders - E-wallet payment
5. POST /orders - Bulk order
```

**Bước 4.3: Test order workflow**
```http
# Update order status:
PATCH /orders/{id}/status - pending → confirmed
PATCH /orders/{id}/status - confirmed → processing
PATCH /orders/{id}/status - processing → shipped
PATCH /orders/{id}/status - shipped → delivered
```

---

### **GIAI ĐOẠN 5: SUPPLIERS** 🟡
**File:** `backend/requests/suppliers.rest`
**Trạng thái:** Chờ triển khai controller

**Bước 5.1: Tạo suppliers**
```http
POST /suppliers - Food Manufacturer
POST /suppliers - Beverage Distributor
POST /suppliers - Household Wholesaler
POST /suppliers - Beauty Importer
POST /suppliers - Retail Goods
```
- ✅ Supplier IDs sẽ lưu vào: `@supplier1Id`, `@supplier2Id`, etc.

---

### **GIAI ĐOẠN 6: PURCHASE ORDERS** 🟡
**File:** `backend/requests/purchaseOrders.rest`
**Trạng thái:** Chờ triển khai controller
**Dependencies:** Suppliers, Products

**Bước 6.1: Cập nhật Reference IDs**
```rest
@supplierId1 = XXX  # Copy từ suppliers.rest
@productId1 = XXX   # Copy từ create_all_products.rest
```

**Bước 6.2: Tạo purchase orders**
```http
POST /purchase-orders - Single product PO (Draft)
POST /purchase-orders - Multiple products PO
POST /purchase-orders - PO with discount
POST /purchase-orders - Urgent order
```

**Bước 6.3: Test PO workflow**
```http
# PO Status workflow:
PATCH /purchase-orders/{id}/status - draft → pending
PATCH /purchase-orders/{id}/status - pending → approved
POST /purchase-orders/{id}/receive - Receive goods (full/partial)
```

---

### **GIAI ĐOẠN 7: CUSTOMERS** 🟡
**File:** `backend/requests/customers.rest`
**Trạng thái:** Chờ triển khai controller
**Dependencies:** Không (Độc lập)

**Bước 7.1: Tạo customers**
```http
POST /customers - Retail customer
POST /customers - Wholesale customer
POST /customers - VIP customer
POST /customers - Walk-in customer
```

**Bước 7.2: Test CRM features**
```http
# Loyalty points management:
POST /customers/{id}/loyalty/add - Add points
POST /customers/{id}/loyalty/redeem - Redeem points
GET /customers/{id}/loyalty/history - Points history
```

---

### **GIAI ĐOẠN 8: INVENTORY** 🟡
**File:** `backend/requests/inventory.rest`
**Trạng thái:** Chờ triển khai controller
**Dependencies:** Products, Purchase Orders

**Bước 8.1: Xem inventory**
```http
GET /inventory - All inventory
GET /inventory/low-stock - Low stock items
GET /inventory/out-of-stock - Out of stock items
```

**Bước 8.2: Stock adjustments**
```http
POST /inventory/adjust - Manual adjustment
POST /inventory/reserve - Reserve stock for order
POST /inventory/release - Release reserved stock
POST /inventory/stock-in - Receive from supplier
POST /inventory/stock-out - Ship to customer
```

**Bước 8.3: Reconciliation**
```http
POST /inventory/reconciliation/start - Start reconciliation
POST /inventory/reconciliation/{id}/complete - Complete reconciliation
```

---

### **GIAI ĐOẠN 9: PAYMENTS** 🟡
**File:** `backend/requests/payments.rest`
**Trạng thái:** Chờ triển khai controller
**Dependencies:** Orders, Purchase Orders, Customers, Suppliers

**Bước 9.1: Cập nhật Reference IDs**
```rest
@orderId1 = XXX       # Copy từ orders.rest
@customerId1 = XXX    # Copy từ customers.rest
@supplierId1 = XXX    # Copy từ suppliers.rest
@poId1 = XXX          # Copy từ purchaseOrders.rest
```

**Bước 9.2: Record sales payments**
```http
POST /payments - Cash payment
POST /payments - Card payment
POST /payments - Bank transfer
POST /payments - E-wallet payment
```

**Bước 9.3: Record purchase payments**
```http
POST /payments - Check payment to supplier
POST /payments - Bank transfer to supplier
POST /payments - Credit payment
```

**Bước 9.4: Refund processing**
```http
POST /payments/{id}/refund - Full refund
POST /payments/{id}/refund - Partial refund
```

---

### **GIAI ĐOẠN 10: REPORTS** 🟡
**File:** `backend/requests/reports.rest`
**Trạng thái:** Chờ triển khai controller
**Dependencies:** Tất cả các modules trước

**Bước 10.1: Generate reports**
```http
POST /reports - Sales report (Daily)
POST /reports - Inventory report (Monthly)
POST /reports - Revenue report (Quarterly)
POST /reports - Profit report (Monthly)
POST /reports - Customer report (Yearly)
POST /reports - Product report (Monthly)
POST /reports - Supplier report (Quarterly)
```

**Bước 10.2: Quick reports**
```http
GET /reports/quick/sales/today
GET /reports/quick/sales/week
GET /reports/quick/sales/month
GET /reports/quick/inventory/current
GET /reports/quick/inventory/low-stock
```

**Bước 10.3: Scheduled reports**
```http
POST /reports/schedule - Daily sales report
POST /reports/schedule - Weekly inventory report
POST /reports/schedule - Monthly revenue summary
```

---

## 📚 Chi tiết từng file

### 1. **users.rest** ✅
**Mục đích:** Authentication và quản lý users
**Implemented:** ✅ Yes
**Endpoints:** 15+ endpoints
**Key Features:**
- Login/Register
- CRUD users
- Role management (admin, employee, user)
- Token-based authentication

---

### 2. **categories.rest** ✅
**Mục đích:** Quản lý danh mục sản phẩm
**Implemented:** ✅ Yes
**Endpoints:** 20+ endpoints
**Key Features:**
- Tạo 8 categories (5 main + 3 nested)
- Hierarchical categories (parent-child)
- CRUD operations
**Variables exported:**
- `@freshFoodId`, `@processedFoodId`, `@beverageId`, `@householdId`, `@personalCareId`
- `@bakingMaterialId`, `@meatsId`, `@vegetablesId`

---

### 3. **create_all_products.rest** ✅
**Mục đích:** Tạo 15 sản phẩm mẫu
**Implemented:** ✅ Yes
**Endpoints:** 20+ endpoints
**Dependencies:** Requires `categories.rest` IDs
**Products:**
1. Thịt bò Úc (200.000đ/kg)
2. Cá hồi Na Uy (450.000đ/kg)
3. Gạo ST25 (120.000đ/5kg)
4. Dầu ăn Neptune (85.000đ/5L)
5. Coca Cola (15.000đ/330ml)
6. Bột mì đa dụng (35.000đ/1kg)
7. Sữa tươi Vinamilk (28.000đ/1L)
8. Thịt gà tươi (85.000đ/kg)
9. Cà rốt Đà Lạt (25.000đ/kg)
10. Dầu gội Clear (180.000đ/650ml)
11. Nước rửa chén Sunlight (45.000đ/800ml)
12. Khăn tắm cotton (120.000đ/chiếc)
13. Bàn chải đánh răng (25.000đ/chiếc)
14. Bánh quy Danisa (180.000đ/hộp)
15. Mỳ tôm Hảo Hảo (3.000đ/gói)

**Variables exported:**
- `@productId1` to `@productId15`

---

### 4. **orders.rest** ✅
**Mục đích:** Quản lý đơn hàng bán lẻ
**Implemented:** ✅ Yes
**Endpoints:** 40+ endpoints
**Dependencies:** Requires `create_all_products.rest` IDs
**Key Features:**
- 5 order scenarios (guest, multiple products, auth user, e-wallet, bulk)
- Order status workflow (pending → confirmed → processing → shipped → delivered → cancelled)
- Payment status (unpaid → partial → paid → refunded)
- Order statistics

---

### 5. **suppliers.rest** 🟡
**Mục đích:** Quản lý nhà cung cấp
**Implemented:** 🟡 Pending (Model ready)
**Endpoints:** 50+ endpoints
**Dependencies:** Không
**Suppliers:**
1. Food Manufacturer (NET30, 100M credit)
2. Beverage Distributor (NET15, 50M credit)
3. Household Wholesaler (COD, 30M credit)
4. Beauty Importer (NET60, 200M credit)
5. Retail Goods (NET90, 75M credit)

**Key Features:**
- Supplier types: manufacturer, distributor, wholesaler, importer, retailer
- Payment terms: COD, NET15, NET30, NET60, NET90
- Credit limit management
- Performance ratings

**Variables exported:**
- `@supplier1Id` to `@supplier5Id`

---

### 6. **purchaseOrders.rest** 🟡
**Mục đích:** Quản lý đơn mua hàng từ suppliers
**Implemented:** 🟡 Pending (Model ready)
**Endpoints:** 40+ endpoints
**Dependencies:** `suppliers.rest`, `create_all_products.rest`
**Key Features:**
- PO status workflow (draft → pending → approved → received → cancelled)
- Receiving process (full/partial receipt, damaged items tracking)
- Integration with inventory (auto stock-in)
- Payment tracking

**Variables exported:**
- `@po1Id`, `@po2Id`, etc.

---

### 7. **customers.rest** 🟡
**Mục đích:** CRM - Quản lý khách hàng
**Implemented:** 🟡 Pending (Model ready)
**Endpoints:** 45+ endpoints
**Dependencies:** Không
**Key Features:**
- Customer types: retail, wholesale, VIP
- Loyalty points program (add, redeem, history)
- Order history tracking
- Customer segmentation
- Bulk operations (import/export CSV/Excel)

**Variables exported:**
- `@customer1Id`, `@customer2Id`, etc.

---

### 8. **inventory.rest** 🟡
**Mục đích:** Quản lý tồn kho
**Implemented:** 🟡 Pending (Model ready)
**Endpoints:** 55+ endpoints
**Dependencies:** `create_all_products.rest`, `purchaseOrders.rest`
**Key Features:**
- Stock tracking (current, reserved, available)
- Movement history (in, out, adjustment, damage, theft, expiry, return)
- Reorder management (min/max levels, auto-reorder)
- Stock reconciliation
- Low stock alerts
- Inventory reports (valuation, turnover, aging analysis)

**⚠️ Known Issues:**
- Line 108: `userId` variable not defined (fix: add `@userId = {{loginResponse.response.body.data.user.id}}`)
- Line 344: `alertId` variable not defined (fix: extract from alerts list response)

---

### 9. **payments.rest** 🟡
**Mục đích:** Quản lý thanh toán
**Implemented:** 🟡 Pending (Model ready)
**Endpoints:** 50+ endpoints
**Dependencies:** `orders.rest`, `purchaseOrders.rest`, `customers.rest`, `suppliers.rest`
**Key Features:**
- Payment types: sales (from customers), purchase (to suppliers)
- Payment methods: cash, card, bank_transfer, e_wallet, check, credit
- Refund processing (full/partial)
- Payment status: pending, completed, failed, refunded, cancelled
- Revenue statistics (by method, by period)
- Auto payment number: PAY2025000001

**Variables exported:**
- `@payment1Id`, etc.

---

### 10. **reports.rest** 🟡
**Mục đích:** Báo cáo thống kê BI
**Implemented:** 🟡 Pending (Model ready)
**Endpoints:** 60+ endpoints
**Dependencies:** Tất cả các modules
**Key Features:**
- Report types: sales, inventory, revenue, profit, customer, product, supplier
- Formats: PDF, Excel, CSV, JSON
- Quick reports (today, week, month, year)
- Scheduled reports (daily, weekly, monthly)
- Email notifications
- Auto report number: RPT2025000001

---

## ⚠️ Lưu ý quan trọng

### 1. Token Authentication
- **BẮT BUỘC** đăng nhập trước khi test bất kỳ endpoint nào
- Token tự động lưu vào biến `@token` sau khi login
- Token có thời hạn (mặc định 24h), hết hạn cần login lại

### 2. Variable Dependencies
**Sơ đồ phụ thuộc biến:**
```
users.rest (login)
    ├─> @token (dùng cho tất cả requests)
    └─> @userId (dùng cho purchaseOrders, inventory)

categories.rest
    └─> @categoryIds (dùng cho create_all_products.rest)

create_all_products.rest
    └─> @productIds (dùng cho orders, purchaseOrders, inventory)

orders.rest
    └─> @orderIds (dùng cho payments)

suppliers.rest
    └─> @supplierIds (dùng cho purchaseOrders, payments)

purchaseOrders.rest
    └─> @poIds (dùng cho payments)

customers.rest
    └─> @customerIds (dùng cho payments)
```

### 3. Status Workflow
**Order Status:**
```
pending → confirmed → processing → shipped → delivered
                                        ↓
                                    cancelled
```

**Purchase Order Status:**
```
draft → pending → approved → received
                        ↓
                   cancelled
```

**Payment Status:**
```
pending → completed → refunded
               ↓
            failed/cancelled
```

### 4. Auto-Generated Fields
Các ID tự động được tạo theo format:
- Order: `ORD2025000001`
- Customer: `CUST2025000001`
- Payment: `PAY2025000001`
- Purchase Order: `PO2025000001`
- Supplier: `SUP2025000001`
- Report: `RPT2025000001`

### 5. Testing Best Practices
1. **Chạy theo thứ tự:** Tuân thủ thứ tự chạy từ GIAI ĐOẠN 1 → 10
2. **Kiểm tra response:** Xác nhận status code 200/201 trước khi chạy request tiếp theo
3. **Lưu IDs:** Copy các IDs từ response và cập nhật vào section REFERENCE IDs
4. **Validation tests:** Chạy các test cases ở cuối mỗi file để kiểm tra error handling
5. **Clean data:** Sau khi test xong, có thể xóa dữ liệu test hoặc reset database

---

## 🔧 Các vấn đề thường gặp

### 1. **401 Unauthorized**
**Nguyên nhân:** Token không hợp lệ hoặc hết hạn
**Giải pháp:**
```http
# Đăng nhập lại để lấy token mới
POST {{baseUrl}}/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 2. **404 Not Found - Category/Product ID**
**Nguyên nhân:** Chưa tạo categories/products hoặc IDs không đúng
**Giải pháp:**
1. Chạy `categories.rest` để tạo categories
2. Copy category IDs vào `create_all_products.rest`
3. Chạy `create_all_products.rest`
4. Copy product IDs vào các file khác

### 3. **400 Bad Request - Validation Error**
**Nguyên nhân:** Dữ liệu không hợp lệ (thiếu field bắt buộc, format sai, etc.)
**Giải pháp:**
- Kiểm tra response body để xem error message chi tiết
- Đảm bảo tất cả required fields có giá trị
- Kiểm tra format dữ liệu (email, phone, date, etc.)

### 4. **500 Internal Server Error**
**Nguyên nhân:** Lỗi server (database connection, code bug, etc.)
**Giải pháp:**
1. Kiểm tra backend console log
2. Kiểm tra MongoDB connection
3. Restart backend server: `npm run dev`
4. Kiểm tra file `.env` có đầy đủ biến môi trường

### 5. **Variable not defined**
**Nguyên nhân:** Biến chưa được extract từ response trước đó
**Giải pháp:**
- Chạy request tạo dữ liệu trước để extract ID
- Hoặc copy ID thủ công từ response và paste vào section REFERENCE IDs

**Ví dụ inventory.rest errors:**
```rest
# Thêm dòng này vào section Extract token:
@userId = {{loginResponse.response.body.data.user.id}}

# Hoặc lấy alertId từ alerts list response:
# @name alertsResponse
GET {{baseUrl}}/inventory/alerts
@alertId = {{alertsResponse.response.body.data.alerts[0]._id}}
```

### 6. **Connection Refused**
**Nguyên nhân:** Backend server chưa chạy
**Giải pháp:**
```bash
cd backend
npm run dev
# Server should start at http://localhost:3001
```

### 7. **Database Connection Error**
**Nguyên nhân:** MongoDB không chạy hoặc connection string sai
**Giải pháp:**
```bash
# Start MongoDB (Windows)
net start MongoDB

# Hoặc kiểm tra connection string
# backend/utils/config.js
MONGODB_URI=mongodb://localhost:27017/admin-mart
```

### 8. **CORS Error** (Nếu test từ browser)
**Nguyên nhân:** Backend chưa enable CORS
**Giải pháp:**
- REST Client trong VS Code không bị CORS
- Nếu test từ browser/Postman, cần enable CORS trong backend:
```javascript
// backend/app.js
const cors = require('cors');
app.use(cors());
```

---

## 📊 Tiến độ triển khai

| Module | File | Status | Controller | Endpoints | Priority |
|--------|------|--------|------------|-----------|----------|
| Users | users.rest | ✅ Ready | ✅ Done | 15+ | High |
| Categories | categories.rest | ✅ Ready | ✅ Done | 20+ | High |
| Products | create_all_products.rest | ✅ Ready | ✅ Done | 20+ | High |
| Orders | orders.rest | ✅ Ready | ✅ Done | 40+ | High |
| Customers | customers.rest | 🟡 Model Ready | 🔴 Pending | 45+ | Medium |
| Inventory | inventory.rest | 🟡 Model Ready | 🔴 Pending | 55+ | High |
| Payments | payments.rest | 🟡 Model Ready | 🔴 Pending | 50+ | High |
| Purchase Orders | purchaseOrders.rest | 🟡 Model Ready | 🔴 Pending | 40+ | Medium |
| Suppliers | suppliers.rest | 🟡 Model Ready | 🔴 Pending | 50+ | Medium |
| Reports | reports.rest | 🟡 Model Ready | 🔴 Pending | 60+ | Low |

**Tổng số endpoints:** 395+

---

## 📞 Liên hệ & Hỗ trợ

Nếu gặp vấn đề không thể giải quyết:
1. Kiểm tra backend console log
2. Kiểm tra database data
3. Xem file README.md trong backend folder
4. Xem file MODELS_SUMMARY.md để hiểu rõ data structure

---

## 🎓 Tips & Tricks

1. **Sử dụng Send All:** REST Client có tính năng "Send All Requests" để chạy nhiều requests liên tiếp
2. **Tổ chức file:** Mỗi file `.rest` đã được chia section rõ ràng bằng comment `###`
3. **Variable scope:** Biến được extract ở đầu file sẽ available cho tất cả requests sau đó
4. **Environment switching:** Có thể đổi `@baseUrl` để test production/staging/local
5. **Copy cURL:** REST Client có thể convert sang cURL command để test với curl/Postman

---

**Chúc bạn test thành công! 🚀**
