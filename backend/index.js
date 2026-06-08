// index.js
const express = require('express');
require('dotenv').config(); // Membaca file .env (RPC_URL, JWT_SECRET, dll.)

// Inisialisasi Database SQLite & Redis Cache secara otomatis saat server start
require('./config/database');
require('./config/redis');

// Jalur Import Router Baru
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const variantRoutes = require('./routes/variantRoutes');
const productRoutes = require('./routes/productRoutes'); // Import file baru kita
const validationRoutes = require('./routes/validationRoutes');
const statRoutes = require('./routes/statRoutes');

const app = express();

// ─── MIDDLEWARES ──────────────────────────────────────────────────
// Memungkinkan Express membaca payload data berformat JSON dari Bruno/Postman di req.body
app.use(express.json()); 

// ─── ROUTES MAPPING ───────────────────────────────────────────────
// Menghubungkan rute admin dengan prefix '/admin'
// Rute seperti '/batches' atau '/emergency-revoke' diakses via /admin/batches & /admin/emergency-revoke
// Pemasangan Middleware Endpoint Jalur Rute Express
// Jalur Mounting Middleware Express Endpoints
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/variants', variantRoutes);
app.use('/products', productRoutes); // GET /products/:serialNumber dialihkan ke sini
app.use('/validate', validationRoutes); // POST /validate/:serialNumber tetap di sini
app.use('/stats', statRoutes);

// ─── HEALTH CHECK ROUTE ───────────────────────────────────────────
// Jalur tes dasar untuk memastikan backend menyala dan merespons
app.get('/ping', (req, res) => {
    return res.status(200).json({ 
        success: true, 
        message: "Pong! Server Express berjalan lancar." 
    });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────
// Menangkap bad format JSON atau runtime error tak terduga agar server tidak langsung crash
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            error: { code: "BAD_REQUEST", message: "Invalid JSON format." }
        });
    }
    console.error("Server Error:", err.stack);
    return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong on the server." }
    });
});

// ─── START SERVER ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Oil-Chain Backend Server sukses berjalan di port ${PORT}`);
    console.log(`==================================================`);
});