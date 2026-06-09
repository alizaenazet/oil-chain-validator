// index.js
const express = require('express');
require('dotenv').config();

// Inisialisasi Database SQLite & Redis Cache secara otomatis saat server start
require('./config/database');
require('./config/redis');

// Jalur Import Router Baru (Semua berbasis Viem)
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const variantRoutes = require('./routes/variantRoutes');
const productRoutes = require('./routes/productRoutes');
const validationRoutes = require('./routes/validationRoutes');
const statRoutes = require('./routes/statRoutes');

const app = express();

app.use(express.json());

// ─── ROUTES MAPPING ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/validate', validationRoutes);
app.use('/api/stats', statRoutes);

app.get('/ping', (req, res) => {
  return res.status(200).json({ success: true, message: "Pong! Server Express berjalan lancar dengan Viem." });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid JSON format." } });
  }
  console.error("Server Error:", err.stack);
  return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong on the server." } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Oil-Chain Backend Server (Viem Version) sukses di port ${PORT}`);
  console.log(`==================================================`);
});
