// Shopping cart in localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:3000/api"
  : `${window.location.origin}/api`;

// ============ FETCH & DISPLAY PRODUCTS ============
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();

    if (result.success) {
      displayProducts(result.data);
    } else {
      console.error("Failed to load products");
    }
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

function displayProducts(products) {
  const productsSection = document.querySelector(".products");
  productsSection.innerHTML = ""; // Clear existing products

  products.forEach(product => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-content">
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <div class="price">Tsh.${product.price.toLocaleString()}/=</div>
        <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
          Add to Cart
        </button>
        <a class="order-link" href="${product.orderLink || '#'}" target="_blank" rel="noopener noreferrer">
          Order Now
        </a>
      </div>
    `;
    productsSection.appendChild(productCard);
  });
}

// ============ SHOPPING CART FUNCTIONS ============
function addToCart(productId, productName, price) {
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: price,
      quantity: 1
    });
  }

  saveCart();
  alert(`✅ ${productName} added to cart!`);
  updateCartCount();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartBadge = document.getElementById("cart-count");
  if (cartBadge) {
    cartBadge.textContent = totalItems;
  }
}

// ============ VIEW CART ============
function viewCart() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let cartContent = "🛒 Your Shopping Cart:\n\n";
  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    cartContent += `${item.name}\n  Qty: ${item.quantity} × Tsh.${item.price.toLocaleString()} = Tsh.${itemTotal.toLocaleString()}\n\n`;
  });

  cartContent += `\n💰 Total: Tsh.${total.toLocaleString()}/=`;
  alert(cartContent);
}

// ============ CHECKOUT ============
async function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const customerName = prompt("Enter your name:");
  if (!customerName) return;

  const email = prompt("Enter your email:");
  if (!email) return;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customer_name: customerName,
        email: email,
        items: cart,
        total: total
      })
    });

    const result = await response.json();

    if (result.success) {
      const message = result.message || "Order placed successfully!";
      alert(`✅ ${message}\n\nOrder ID: ${result.order.id}\nTotal: Tsh.${total.toLocaleString()}/=\n\nWe'll contact you at ${email} shortly!`);
      cart = [];
      saveCart();
      updateCartCount();
    } else {
      alert("❌ Error placing order: " + result.message);
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("❌ Error processing order. Please try again.");
  }
}

// ============ INITIALIZE ============
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateCartCount();
});
