# 🚀 Hướng Dẫn Nhanh - REST API Testing

## ✨ Tính năng mới: Token Tự động!

**Không cần copy/paste token thủ công nữa!** Mỗi file `.rest` đã có sẵn phần login để tự động lấy token.

---

## 📖 Cách sử dụng

### Bước 1: Mở bất kỳ file `.rest` nào

Ví dụ: Mở `categories.rest`

### Bước 2: Login để lấy token

Tìm phần này ở đầu file:

```rest
### Login to get token
# @name loginResponse
POST {{baseUrl}}/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Click **"Send Request"** → Token tự động được lưu! ✅

### Bước 3: Sử dụng các API khác

Sau khi login, bạn có thể click "Send Request" trên bất kỳ endpoint nào:

```rest
### Get All Categories
GET {{baseUrl}}/categories
Authorization: Bearer {{token}}  ← Token tự động
```

---

## 🎯 Workflow Chuẩn

### 1️⃣ Categories (`categories.rest`)
```
1. Login (đầu file)
2. Create category
3. Copy category ID từ response
```

### 2️⃣ Products (`create_product.rest`)
```
1. Login (đầu file)
2. Paste category ID vào biến:
   @categoryId = 67817b5f9d8e7a2b3c4d5e6f
3. Create product
4. Copy product ID từ response
```

### 3️⃣ Orders (`orders.rest`)
```
1. Login (đầu file)
2. Paste product ID vào biến:
   @productId = 67817c1a9d8e7a2b3c4d5e70
3. Create order
```

### 4️⃣ Cart (`cart.rest`)
```
1. Login (đầu file)
2. Paste product ID
3. Add to cart
```

### 5️⃣ Users (`users.rest`)
```
1. Login (đầu file)
2. Create/manage users
```

---

## 💡 Tips Hay

### Tip 1: Extract ID từ Response

Thêm `# @name` vào request:

```rest
### Create Category
# @name createCat
POST {{baseUrl}}/categories
...
```

Sau đó extract ID:

```rest
@categoryId = {{createCat.response.body.data.category._id}}
```

### Tip 2: Mỗi File Độc Lập

- Mỗi file có phần login riêng
- Không cần phụ thuộc file khác
- Có thể test bất kỳ file nào trước

### Tip 3: Token Hết Hạn?

Nếu gặp lỗi "401 Unauthorized":
1. Scroll lên đầu file
2. Click "Send Request" trên Login
3. Token tự động refresh! 🔄

---

## 📋 Checklist Trước Khi Test

- [ ] Backend server đang chạy (`npm run dev`)
- [ ] MongoDB đang chạy
- [ ] VS Code REST Client extension đã cài
- [ ] Đã có tài khoản admin (server tự tạo khi khởi động)

---

## ❓ Các File Nào Cần Token?

| File | Cần Login? | Lý do |
|------|-----------|-------|
| `get_all_products.rest` | ❌ No | Public endpoint |
| `get_product.rest` | ❌ No | Public endpoint |
| `categories.rest` | ✅ Yes | Admin actions |
| `create_product.rest` | ✅ Yes | Admin only |
| `update_product.rest` | ✅ Yes | Admin only |
| `delete_product.rest` | ✅ Yes | Admin only |
| `orders.rest` | ✅ Yes | Protected |
| `cart.rest` | ✅ Yes | Protected |
| `users.rest` | ✅ Yes | Admin only |

---

## 🆘 Troubleshooting

### Lỗi: "Token invalid"
→ **Giải pháp**: Login lại ở đầu file

### Lỗi: "404 Not Found" 
→ **Giải pháp**: Kiểm tra ID có đúng không, tạo resource trước nếu chưa có

### Lỗi: "Connection refused"
→ **Giải pháp**: Khởi động backend server

### Lỗi: "Duplicate SKU"
→ **Giải pháp**: Đổi SKU thành giá trị khác

---

## 🎉 Bắt đầu ngay!

1. Mở `categories.rest`
2. Click "Send Request" trên Login
3. Click "Send Request" trên Create Category
4. Done! 🎊

---

**Happy Testing!** 🚀

Xem thêm chi tiết tại: [README.md](./README.md)
