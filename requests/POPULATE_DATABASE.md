# 📦 Database Population Guide

Hướng dẫn chi tiết để tạo categories và products từ mock data vào MongoDB.

---

## 🎯 Mục Đích

Import **15 products** và **5 categories** từ mock data (`admin/src/data/products.js`) vào MongoDB database để frontend có thể hiển thị data thật.

---

## 📋 Chuẩn Bị

### Bước 1: Đảm bảo Backend đang chạy

```bash
cd backend
npm run dev
```

### Bước 2: Kiểm tra Admin Account

Default admin đã được tạo tự động:
- **Username**: `admin`
- **Password**: `admin123`

---

## 🏗️ Quy Trình Tạo Data (QUAN TRỌNG: Làm theo thứ tự!)

### ⚠️ Lưu Ý Quan Trọng:
**PHẢI tạo Categories TRƯỚC, rồi mới tạo Products!**

Vì: Products cần `category._id` làm foreign key.

---

## BƯỚC 1: Tạo Categories

### File: `backend/requests/categories.rest`

#### 1.1. Login để lấy token

```http
POST http://localhost:3001/api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Click "Send Request"** → Copy token từ response

#### 1.2. Tạo 5 Categories (Chạy lần lượt từ trên xuống)

Trong file `categories.rest`, tìm section **"Create Categories from Mock Data"**:

1. ✅ **Category 1: Baking material** - Click "Send Request"
2. ✅ **Category 2: Meats** - Click "Send Request"
3. ✅ **Category 3: Milks & Dairies** - Click "Send Request"
4. ✅ **Category 4: Vegetables** - Click "Send Request"
5. ✅ **Category 5: Fresh Fruits** - Click "Send Request"

#### 1.3. Copy Category IDs

Sau khi tạo xong, mỗi response sẽ có:
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "67e2af1298783e455763fc76"  ← COPY ID này
    }
  }
}
```

**Lưu 5 IDs này để dùng cho bước 2!**

---

## BƯỚC 2: Tạo Products

### File: `backend/requests/create_all_products.rest`

#### 2.1. Cập nhật Category IDs

Mở file `create_all_products.rest`, tìm phần variables ở đầu file:

```http
### CATEGORY IDs (Update these after creating categories)
@bakingMaterialId = YOUR_BAKING_MATERIAL_ID  ← Paste ID từ bước 1.3
@meatsId = YOUR_MEATS_ID
@milksDairiesId = YOUR_MILKS_DAIRIES_ID
@vegetablesId = YOUR_VEGETABLES_ID
@freshFruitsId = YOUR_FRESH_FRUITS_ID
```

**Replace các YOUR_XXX_ID với IDs thực tế!**

#### 2.2. Login (nếu chưa có token)

```http
POST http://localhost:3001/api/login
```

#### 2.3. Tạo 15 Products (Chạy lần lượt)

Click "Send Request" cho từng product (1-15):

1. ✅ Product 1: Seeds of Change Organic Quinoa, Brown
2. ✅ Product 2: All Natural Italian-Style Chicken Meatballs
3. ✅ Product 3: Angie's Boomchickapop Sweet & Salty
4. ✅ Product 4: Foster Farms Takeout Crispy Classic
5. ✅ Product 5: Blue Diamond Almonds Lightly Salted
6. ✅ Product 6: Chobani Complete Vanilla Greek Yogurt
7. ✅ Product 7: Canada Dry Ginger Ale – 2 L Bottle
8. ✅ Product 8: Encore Seafoods Stuffed Alaskan Salmon
9. ✅ Product 9: Gorton's Beer Battered Fish Fillets
10. ✅ Product 10: Haagen-Dazs Caramel Cone Ice Cream
11. ✅ Product 11: Fresh Organic Broccoli Crowns
12. ✅ Product 12: Fresh Organic Strawberries
13. ✅ Product 13: Fresh Organic Bananas
14. ✅ Product 14: Fresh Organic Carrots
15. ✅ Product 15: Organic Whole Milk

---

## ✅ Verification (Kiểm Tra)

### Kiểm tra Categories đã tạo:

```http
GET http://localhost:3001/api/categories
```

**Expected**: 5 categories

### Kiểm tra Products đã tạo:

```http
GET http://localhost:3001/api/products?per_page=20
```

**Expected**: 15 products

### Kiểm tra Products theo Category:

```http
GET http://localhost:3001/api/products?category={{bakingMaterialId}}
```

---

## 📊 Data Summary

### Categories (5 total):
1. **Baking material** - 7 products
2. **Meats** - 3 products  
3. **Milks & Dairies** - 3 products
4. **Vegetables** - 2 products
5. **Fresh Fruits** - 2 products

### Products (15 total):

| ID | Name | Category | Price | Stock |
|----|------|----------|-------|-------|
| 1 | Seeds of Change Organic Quinoa | Baking material | $28.85 | 8 |
| 2 | Italian-Style Chicken Meatballs | Meats | $52.85 | 12 |
| 3 | Angie's Boomchickapop | Baking material | $48.85 | 15 |
| 4 | Foster Farms Crispy Classic | Meats | $17.85 | 6 |
| 5 | Blue Diamond Almonds | Baking material | $23.85 | 20 |
| 6 | Chobani Vanilla Greek Yogurt | Milks & Dairies | $54.85 | 25 |
| 7 | Canada Dry Ginger Ale | Baking material | $32.85 | 50 |
| 8 | Encore Stuffed Alaskan Salmon | Meats | $35.85 | 4 |
| 9 | Gorton's Beer Battered Fish | Meats | $23.85 | 18 |
| 10 | Haagen-Dazs Caramel Cone | Milks & Dairies | $22.85 | 14 |
| 11 | Fresh Organic Broccoli | Vegetables | $15.85 | 30 |
| 12 | Fresh Organic Strawberries | Fresh Fruits | $28.85 | 22 |
| 13 | Fresh Organic Bananas | Fresh Fruits | $12.85 | 40 |
| 14 | Fresh Organic Carrots | Vegetables | $8.85 | 35 |
| 15 | Organic Whole Milk | Milks & Dairies | $18.85 | 28 |

---

## 🚨 Troubleshooting

### Lỗi: "Category not found"
→ Bạn chưa tạo categories hoặc sai category ID
→ **Giải pháp**: Tạo categories trước (Bước 1)

### Lỗi: "SKU already exists"
→ Product với SKU đó đã tồn tại
→ **Giải pháp**: Skip hoặc xóa product cũ trước

### Lỗi: "Token missing or invalid"
→ Token expired hoặc chưa login
→ **Giải pháp**: Login lại để lấy token mới

### Lỗi: "Unauthorized"
→ Account không phải admin
→ **Giải pháp**: Dùng account admin mặc định

---

## 🔄 Reset Database (Nếu Cần)

### Xóa tất cả products:

Sử dụng MongoDB shell hoặc Compass:

```javascript
db.products.deleteMany({})
db.categories.deleteMany({})
```

Sau đó chạy lại từ đầu.

---

## 🎯 Quick Start (TL;DR)

1. **Start backend**: `npm run dev`
2. **Open**: `backend/requests/categories.rest`
3. **Login**: Run login request
4. **Create 5 categories**: Click "Send" cho mỗi category
5. **Copy category IDs**: Save vào notepad
6. **Open**: `backend/requests/create_all_products.rest`
7. **Update category IDs**: Paste vào variables
8. **Create 15 products**: Click "Send" cho mỗi product
9. **Verify**: Run GET requests để check

---

## ✅ Expected Result

Sau khi hoàn thành, frontend sẽ:
- ✅ Hiển thị 15 products trong `/products/view`
- ✅ Pagination: 2 pages (8 items/page)
- ✅ Product detail pages hoạt động
- ✅ Categories hiển thị đúng
- ✅ Images hiển thị từ Figma CDN
- ✅ All product info complete

---

## 📝 Notes

- All products có **originalPrice** → discount badges sẽ hiển thị
- Products 1 & 3 có **detailDescription** đầy đủ
- Product 8 có **stock = 4** (low stock warning nếu implement)
- All images từ Figma CDN (từ mock data gốc)
- All data match với mock data trong `admin/src/data/products.js`

---

**Bắt đầu từ BƯỚC 1: Tạo Categories!** 🚀

**File**: `backend/requests/categories.rest`

