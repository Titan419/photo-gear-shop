# 🎯 Photo Gear Shop - API Integration Guide

## Project Structure

```
Shopping_website/
├── Backend/
│   ├── server.js          # Express API server
│   └── package.json       # Node.js dependencies
└── Frontend/
    ├── index.html         # Main website (NOW DYNAMIC!)
    ├── app.js             # Frontend API client & cart logic
    └── Products/          # Product images
```

---

## 🚀 Quick Start

### 1️⃣ Install Backend Dependencies

Open terminal and navigate to the Backend folder:

```bash
cd "d:\My Workspace\HTML\Shopping_website\Backend"
npm install
```

This installs:
- **express** - Web framework
- **cors** - Cross-Origin requests
- **nodemon** - Auto-restart during development (optional)

### 2️⃣ Start the Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

You should see:
```
✅ API running on http://localhost:3000
📦 Products: GET http://localhost:3000/api/products
📝 Place Order: POST http://localhost:3000/api/orders
```

### 3️⃣ Open Your Website

Open `Frontend/index.html` in a browser or navigate to:
```
http://localhost:3000
```

The page will automatically load products from the API and display them!

---

## 📡 API Endpoints

### Get All Products
```
GET http://localhost:3000/api/products

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Mirrorless Camera",
      "price": 2550000,
      "image": "Products/Mirrorless_Camera.jpg",
      "description": "..."
    },
    ...
  ]
}
```

### Get Single Product
```
GET http://localhost:3000/api/products/1

Response:
{
  "success": true,
  "data": { product object }
}
```

### Place Order (Checkout)
```
POST http://localhost:3000/api/orders

Request Body:
{
  "customer_name": "John Doe",
  "email": "john@example.com",
  "items": [
    { "id": 1, "name": "Mirrorless Camera", "price": 2550000, "quantity": 1 }
  ],
  "total": 2550000
}

Response:
{
  "success": true,
  "message": "Order placed successfully!",
  "order": { order object with ID }
}
```

### View All Orders (Admin)
```
GET http://localhost:3000/api/orders

Response:
{
  "success": true,
  "data": [ array of orders ]
}
```

---

## 🛒 Frontend Features

### 1. **Dynamic Product Loading**
- Products are fetched from API on page load
- No more hardcoded HTML!

### 2. **Shopping Cart**
- Click "Add to Cart" to add products
- Cart is stored in browser's localStorage (persists after refresh)
- Shows item count badge

### 3. **View Cart**
- Click "🛒 Cart" button to see all items
- Shows quantities and totals

### 4. **Checkout**
- Click "💳 Checkout" button
- Enter name and email
- Order is submitted to API
- Get confirmation with order ID

---

## 🔧 How It Works

### Frontend Flow:
```
1. Page loads → app.js executes
2. loadProducts() calls /api/products
3. Products are rendered to HTML
4. User clicks "Add to Cart"
5. Item added to cart array + saved to localStorage
6. User clicks "Checkout"
7. checkout() sends POST request with cart data
8. Order stored in server
9. Confirmation sent to user
```

### Backend Flow:
```
1. Server starts on port 3000
2. Products array holds product data
3. Orders array stores customer orders
4. API endpoints handle GET/POST requests
5. CORS enabled to accept requests from frontend
```

---

## ✨ Features You Can Add Next

### 1. **Database Integration**
Replace the in-memory arrays with MongoDB/MySQL:
```javascript
// Instead of: let products = [];
// Use: const products = await Product.find();
```

### 2. **Admin Panel**
- Add/Edit/Delete products
- View all orders
- Mark orders as shipped

### 3. **User Authentication**
- Login/Register
- Order history
- Saved addresses

### 4. **Payment Integration**
- Stripe/PayPal integration
- Track payment status

### 5. **Email Notifications**
- Send order confirmation email
- Send shipping updates

### 6. **Advanced Cart Features**
- Remove items from cart
- Update quantities
- Apply discount codes
- Save cart across devices

---

## 🐛 Troubleshooting

### Products not loading?
- ✅ Server running on port 3000?
- ✅ API returns data at `/api/products`?
- ✅ Open browser console (F12) to check for errors

### Cart not persisting?
- Check if localStorage is enabled in browser
- Clear browser cache and reload

### CORS Error?
- ✅ `cors` is imported in server.js
- ✅ `app.use(cors())` is called

### Port 3000 already in use?
Change in server.js:
```javascript
const PORT = process.env.PORT || 5000; // Use 5000 instead
```

---

## 📝 Example Usage

**User Journey:**
1. Opens website
2. Sees 4 products loaded from API
3. Clicks "Add to Cart" on Camera (price: 2,550,000)
4. Cart count shows "1"
5. Clicks "Add to Cart" on Lens (price: 1,000,000)
6. Cart count shows "2"
7. Clicks "🛒 Cart" - sees summary
8. Clicks "💳 Checkout"
9. Enters name "Juma" and email "juma@example.com"
10. Order submitted to API
11. Gets confirmation: "Order ID: 1"
12. Order stored in backend `/api/orders`

---

## 💡 Tips

- Use **Postman** to test API endpoints before integrating with frontend
- Run `npm run dev` for auto-reload during development
- Add more products by editing the `products` array in server.js
- Use browser DevTools (F12) to debug JavaScript errors

---

Happy coding! 🚀
