# 🚀 START HERE - Database Setup Guide

**Populate database với 15 products + 5 categories trong 7 phút!**

---

## ✅ Prerequisites

1. Backend đang chạy: `npm run dev` trong folder `backend`
2. MongoDB connected
3. REST Client extension installed trong VS Code

---

## 📝 Quick Steps

### 1️⃣ **Tạo Categories** (2 phút)

**File**: `categories.rest`

```
Line 9-16: Login Request
  ↓ Click "Send Request"
  
Line 50-61: Category 1: Baking material
  ↓ Click "Send Request"
  
Line 63-74: Category 2: Meats
  ↓ Click "Send Request"
  
Line 76-87: Category 3: Milks & Dairies
  ↓ Click "Send Request"
  
Line 89-100: Category 4: Vegetables
  ↓ Click "Send Request"
  
Line 102-113: Category 5: Fresh Fruits
  ↓ Click "Send Request"
```

**→ Copy 5 category IDs từ responses!**

---

### 2️⃣ **Update Category IDs** (1 phút)

**File**: `create_all_products.rest`

**Line 24-28**: Paste IDs vào đây:

```rest
@bakingMaterialId = PASTE_BAKING_ID_HERE
@meatsId = PASTE_MEATS_ID_HERE
@milksDairiesId = PASTE_MILKS_ID_HERE
@vegetablesId = PASTE_VEGETABLES_ID_HERE
@freshFruitsId = PASTE_FRUITS_ID_HERE
```

---

### 3️⃣ **Tạo Products** (4 phút)

**File**: `create_all_products.rest`

```
Line 10-16: Login Request
  ↓ Click "Send Request"

Sau đó click "Send Request" cho 15 products:
  
Line 35: Product 1 - Organic Quinoa
Line 97: Product 2 - Chicken Meatballs  
Line 158: Product 3 - Boomchickapop
Line 211: Product 4 - Crispy Classic
Line 253: Product 5 - Blue Diamond Almonds
Line 295: Product 6 - Greek Yogurt
Line 337: Product 7 - Ginger Ale
Line 379: Product 8 - Alaskan Salmon
Line 421: Product 9 - Fish Fillets
Line 463: Product 10 - Ice Cream
Line 505: Product 11 - Broccoli
Line 547: Product 12 - Strawberries
Line 589: Product 13 - Bananas
Line 631: Product 14 - Carrots
Line 673: Product 15 - Whole Milk
```

---

### 4️⃣ **Verify** (30 giây)

**File**: `create_all_products.rest`

**Line 717**: Verify all products
```rest
GET {{baseUrl}}/products?per_page=20
```

**Expected**: Array with 15 products ✅

---

## 🎉 Done!

### Refresh Frontend

1. Go to: `http://localhost:5173`
2. Login
3. Navigate to: **Products → View**
4. **See 15 products!** 🎊

---

## 📊 What You'll Get

### 5 Categories:
- Baking material (7 products)
- Meats (3 products)
- Milks & Dairies (3 products)
- Vegetables (2 products)
- Fresh Fruits (2 products)

### 15 Products:
- All with images
- All with prices & discounts
- Stock ranging from 4-50 items
- 3 products with full detailDescription
- All matching mock data from `admin/src/data/products.js`

---

## ⏱️ Time Breakdown

- **Login**: 10 seconds
- **Create 5 categories**: 2 minutes
- **Copy & paste IDs**: 1 minute
- **Create 15 products**: 4 minutes
- **Verify**: 30 seconds

**Total**: ~7 minutes ⏱️

---

## 🔗 Full Documentation

Need more details? Check these files:

- **Quick Guide**: `QUICK_POPULATE.md`
- **Detailed Guide**: `POPULATE_DATABASE.md`
- **REST Files Guide**: `README.md`
- **API Documentation**: `../API_DOCUMENTATION.md`

---

## 🆘 Need Help?

**Common Error**: "Category not found"
→ You forgot to create categories first!
→ **Go back to Step 1** ☝️

**Common Error**: "Token invalid"
→ Run login request again
→ Token auto-updates in `@token` variable

---

**Ready? Open `categories.rest` and start!** 🚀

