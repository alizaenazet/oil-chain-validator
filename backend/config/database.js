// config/database.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 1. Ambil string path setelah 'sqlite:///' dari file .env
//    Jika DATABASE_URL tidak diset, default akan mengarah ke 'data/oilchain.db'
const dbPath = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL.replace('sqlite:///', '') 
  : 'data/oilchain.db';

// 2. Dapatkan path absolut untuk file database agar aman saat dipanggil dari mana saja
const resolvedPath = path.resolve(__dirname, '../', dbPath);

// 3. Validasi & Proteksi Direktori:
//    Cek apakah folder tempat database berada (folder 'data') sudah ada.
//    Jika belum ada, buat foldernya terlebih dahulu secara otomatis.
const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[SQLite Config] Folder baru berhasil dibuat: ${dir}`);
}

// 4. Hubungkan ke database SQLite menggunakan library better-sqlite3
const db = new Database(resolvedPath);

// 5. Buat tabel history batch admin secara otomatis jika belum ada di database
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    variant_id INTEGER,
    total_registered INTEGER,
    tx_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log(`[SQLite Config] Sukses terhubung ke database di: ${resolvedPath}`);

// 6. Export instance database agar bisa dipakai di file routes atau controllers lain
module.exports = db;