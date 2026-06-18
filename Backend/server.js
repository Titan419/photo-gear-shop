const express = require("express");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
// Serve static files from Frontend folder
app.use(express.static(path.join(__dirname, "../Frontend")));

// 🛒 Products database with full details
let products = [
  {
    id: 1,
    name: "Mirrorless Camera",
    price: 2550000,
    image: "Products/Mirrorless_Camera.jpg",
    description: "Lightweight, fast, and perfect for travel photography with stunning image quality.",
    orderLink: "https://docs.google.com/forms/d/e/1FAIpQLScXVCkdkI9Jkn4CSUK8-OT9KmBhcawlYhRR0-1-uY6l1qnn8g/viewform?usp=pp_url&entry.1290115755=Mirrorless+Camera"
  },
  {
    id: 2,
    name: "DSLR Camera",
    price: 2050000,
    image: "Products/DSLR_Camera.jpg",
    description: "Reliable professional gear for portraits, events, and creative studio work.",
    orderLink: "https://docs.google.com/forms/d/e/1FAIpQLScXVCkdkI9Jkn4CSUK8-OT9KmBhcawlYhRR0-1-uY6l1qnn8g/viewform?usp=pp_url&entry.1290115755=DSLR+Camera"
  },
  {
    id: 3,
    name: "Photo-Shoot Prints",
    price: 100000,
    image: "Products/Photoshooting.jpg",
    description: "Beautifully printed photography ready to frame, ideal for home décor or gifts.",
    orderLink: "https://docs.google.com/forms/d/e/1FAIpQLScXVCkdkI9Jkn4CSUK8-OT9KmBhcawlYhRR0-1-uY6l1qnn8g/viewform?usp=pp_url&entry.1290115755=Photoshoot+Prints"
  },
  {
    id: 4,
    name: "Portrait Lens Kit",
    price: 1000000,
    image: "Products/Lens.jpg",
    description: "Premium lens bundle designed for crisp portraits and low-light shoots.",
    orderLink: "https://docs.google.com/forms/d/e/1FAIpQLScXVCkdkI9Jkn4CSUK8-OT9KmBhcawlYhRR0-1-uY6l1qnn8g/viewform?usp=pp_url&entry.1290115755=Lens+Kit"
  }
];

// Shopping cart (in-memory for now)
let orders = [];

const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 465),
  secure: process.env.EMAIL_SECURE === "false" ? false : true,
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || ""
  },
  tls: {
    rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED === "false" ? false : true
  }
};

const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || "";
const emailTo = process.env.EMAIL_TO || process.env.EMAIL_USER || "";

const transporter = nodemailer.createTransport(emailConfig);

async function sendOrderNotification(order) {
  if (!emailConfig.auth.user || !emailConfig.auth.pass || !emailTo || !emailFrom) {
    console.warn("Email notification skipped because SMTP credentials are not configured.");
    return { success: false, message: "SMTP credentials not configured" };
  }

  const orderItemsHtml = order.items.map(item => `
      <li>${item.name} × ${item.quantity} — Tsh.${item.price.toLocaleString()}</li>
    `).join("");

  const ownerMailOptions = {
    from: emailFrom,
    to: emailTo,
    subject: `New order received: #${order.id} from ${order.customer_name}`,
    html: `
      <h2>New Order #${order.id}</h2>
      <p><strong>Name:</strong> ${order.customer_name}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Total:</strong> Tsh.${order.total.toLocaleString()}/=</p>
      <h3>Items</h3>
      <ul>${orderItemsHtml}</ul>
      <p>Reply to <a href="mailto:${order.email}">${order.email}</a> to contact the customer.</p>
    `
  };

  const customerMailOptions = {
    from: emailFrom,
    to: order.email,
    subject: `Order confirmation #${order.id}`,
    html: `
      <h2>Thank you for your order, ${order.customer_name}!</h2>
      <p>We received your request for the following items:</p>
      <ul>${orderItemsHtml}</ul>
      <p><strong>Total:</strong> Tsh.${order.total.toLocaleString()}/=</p>
      <p>We will contact you shortly using this email address: ${order.email}</p>
      <p>If you have questions, reply to this email.</p>
    `
  };

  try {
    await transporter.sendMail(ownerMailOptions);
    if (order.email) {
      await transporter.sendMail(customerMailOptions);
    }
    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, message: error.message };
  }
}

// ============ API ENDPOINTS ============

// GET all products
app.get("/api/products", (req, res) => {
  res.json({ success: true, data: products });
});

// GET single product by ID
app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (product) {
    res.json({ success: true, data: product });
  } else {
    res.status(404).json({ success: false, message: "Product not found" });
  }
});

// POST new order (shopping cart)
app.post("/api/orders", async (req, res) => {
  const { customer_name, email, items, total } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  const order = {
    id: orders.length + 1,
    customer_name,
    email,
    items,
    total,
    timestamp: new Date(),
    status: "pending"
  };

  orders.push(order);

  const emailResult = await sendOrderNotification(order);

  if (emailResult.success) {
    res.json({
      success: true,
      message: "Order placed successfully! Email notification sent.",
      order
    });
  } else {
    res.json({
      success: true,
      message: "Order placed successfully, but email notification was not sent.",
      emailError: emailResult.message,
      order
    });
  }
});

// GET all orders (admin view)
app.get("/api/orders", (req, res) => {
  res.json({ success: true, data: orders });
});

// GET single order
app.get("/api/orders/:id", (req, res) => {
  const order = orders.find(o => o.id == req.params.id);
  if (order) {
    res.json({ success: true, data: order });
  } else {
    res.status(404).json({ success: false, message: "Order not found" });
  }
});

// Serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API running on http://0.0.0.0:${PORT}`);
  console.log(`📦 Products: GET http://0.0.0.0:${PORT}/api/products`);
  console.log(`📝 Place Order: POST http://0.0.0.0:${PORT}/api/orders`);
});