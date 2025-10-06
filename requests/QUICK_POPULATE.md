# ⚡ Quick Database Population Guide

**5 phút để có đầy đủ data!**

---

## 🎯 Mục Tiêu

Tạo **5 categories** + **15 products** vào database.

---

## ✅ Checklist (Làm theo thứ tự!)

### □ BƯỚC 1: Start Backend

```bash
cd backend
npm run dev
```

### □ BƯỚC 2: Tạo Categories

**File**: `backend/requests/categories.rest`

1. □ Run request **"Login to get token"** 
2. □ Run request **"Category 1: Baking material"**
3. □ Run request **"Category 2: Meats"**
4. □ Run request **"Category 3: Milks & Dairies"**
5. □ Run request **"Category 4: Vegetables"**
6. □ Run request **"Category 5: Fresh Fruits"**

**→ Copy 5 category IDs từ responses!**

### □ BƯỚC 3: Update Category IDs

**File**: `backend/requests/create_all_products.rest`

Paste 5 IDs vào phần variables (line 24-28):
```http
@bakingMaterialId = 67e2af1298783e455763fc76  ← Paste here
@meatsId = 67e2af1998783e455763fc7d
@milksDairiesId = 67e2af2098783e455763fc85
@vegetablesId = 67e2af2498783e455763fc92
@freshFruitsId = 67e2af2c98783e455763fc99
```

### □ BƯỚC 4: Tạo Products

Trong file `create_all_products.rest`:

1. □ Run request **"Login"** (nếu token expired)
2. □ Run **Product 1** - Seeds of Change Organic Quinoa
3. □ Run **Product 2** - Italian-Style Chicken Meatballs
4. □ Run **Product 3** - Angie's Boomchickapop
5. □ Run **Product 4** - Foster Farms Crispy Classic
6. □ Run **Product 5** - Blue Diamond Almonds
7. □ Run **Product 6** - Chobani Greek Yogurt
8. □ Run **Product 7** - Canada Dry Ginger Ale
9. □ Run **Product 8** - Stuffed Alaskan Salmon
10. □ Run **Product 9** - Beer Battered Fish Fillets
11. □ Run **Product 10** - Haagen-Dazs Ice Cream
12. □ Run **Product 11** - Organic Broccoli
13. □ Run **Product 12** - Organic Strawberries
14. □ Run **Product 13** - Organic Bananas
15. □ Run **Product 14** - Organic Carrots
16. □ Run **Product 15** - Organic Whole Milk

### □ BƯỚC 5: Verify

Run verification request:
```http
GET http://localhost:3001/api/products?per_page=20
```

**Expected**: Array with 15 products

---

## 🎉 Done!

Reload frontend (`http://localhost:5173/products/view`) để xem products!

---

## 📝 Tips

### Tip 1: Chạy nhanh
- Use REST Client extension trong VS Code
- Click "Send Request" cho mỗi request
- Hoặc Ctrl+Alt+R

### Tip 2: Token Variables
File `.rest` tự động extract token:
```http
@token = {{loginResponse.response.body.data.token}}
```
Không cần copy/paste token manually!

### Tip 3: Category ID Variables
Tương tự, có thể dùng variables:
```http
@bakingMaterialId = {{bakingMaterial.response.body.data.category.id}}
```
**Nhưng** cần run từng request lần lượt để variables được set!

### Tip 4: Reset nếu lỗi
```javascript
// MongoDB shell or Compass
db.products.deleteMany({})
db.categories.deleteMany({})
```

---

## ⏱️ Time Estimate

- Categories (5): ~2 minutes
- Products (15): ~5 minutes
- **Total**: ~7 minutes

---

## 🚀 Alternative: Script (Future)

Có thể tạo seed script:

```bash
npm run seed
```

But for now, use REST files! 📝

