# 🛢️ Oil-Chain Validator Backend

Backend sistem verifikasi keaslian pelumas berbasis *Hybrid Architecture* (**Express.js + SQLite + Smart Contract Solidity**). Sistem ini menggunakan database lokal SQLite sebagai gerbang validasi awal (*Pre-flight Check*) untuk menghemat biaya *gas fee* blockchain, serta menggunakan jaringan Blockchain sebagai *Single Source of Truth* untuk validasi permanen dan pelacakan konsumen.

---

## 🚀 Fitur Utama Backend
1. **Admin Master Variant Registration (`POST /admin/variants`)**
   - Menggunakan **SQLite Guard** untuk menghadang pendaftaran brand dan tipe oli yang sama secara instan di gerbang Express (`400 DUPLICATE_VARIANT`), mencegah eksekusi transaksi duplikat ke blockchain.
2. **Product Batch Registration (`POST /admin/batches`)**
   - Menerima serial number mentah dari frontend/admin, otomatis melakukan *off-chain hashing* menggunakan **Keccak256**, melakukan validasi *collision lookup* ke blockchain, lalu mendaftarkannya secara massal ke *Smart Contract* (`202 Accepted`).
3. **Emergency Revoke (`POST /admin/emergency-revoke`)**
   - Memblokir massal nomor seri produk yang bocor atau dicuri sebelum didistribusikan. Dilengkapi dengan status inspeksi *on-chain lookup* (`404` / `409`) sebelum mengeksekusi fungsi darurat.
4. **Consumer Product Validation (`POST /validate/:serialNumber`)**
   - Tempat konsumen memindai nomor seri mentah dari kode QR. Sistem otomatis me-log riwayat pemindaian ke tabel `ScanLogs` di SQLite lokal setiap kali proses verifikasi berjalan.

---

## 🛠️ Prasyarat (Prerequisites)
Sebelum menjalankan backend ini, pastikan laptop kamu sudah terinstal perangkat lunak berikut:
* **Node.js** (Direkomendasikan versi `v22.x` ke atas)
* **npm** 
* Node Blockchain Lokal yang sedang berjalan (**Hardhat Network**)

---

## ⚙️ Panduan Pengaturan File Environment (`.env`)

Backend menggunakan pustaka `dotenv` untuk membaca konfigurasi sensitif dari file `.env`. File ini bersifat rahasia dan **tidak boleh di-push ke GitHub** (sudah otomatis dikunci oleh `.gitignore`).

### Langkah-langkah Pengaturan:

1. Buat file baru bernama **`.env`** di root folder backend kamu (sejajar dengan file `index.js` dan `package.json`).
2. Salin dan tempel blok konfigurasi di bawah ini ke dalam file `.env` tersebut:

```env
# KELOLA PORT SERVER EXPRESS
PORT=3000

# KELOLA KEAMANAN OTENTIKASI ADMIN
# Ganti dengan string acak yang panjang dan kuat untuk menandatangani JWT Token
JWT_SECRET=MasukanRahasiaJwtAdminKalianDiSini123

# KELOLA KONEKSI NODE BLOCKCHAIN
# Jika menggunakan Hardhat Node lokal, default URL-nya adalah [http://127.0.0.1:8545](http://127.0.0.1:8545)
RPC_URL=[http://127.0.0.1:8545](http://127.0.0.1:8545)

# KELOLA ALAMAT SMART CONTRACT
# Masukkan address contract "OilValidator" setelah kalian sukses melakukan deploy/run script
# npx hardhat ignition deploy ./ignition/modules/OilValidator.ts --network localhost dijalankan setelah npx hardhat node
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# KELOLA AKUN OTORITAS ADMIN RELAYER
# Masukkan Private Key dari salah satu akun Hardhat (biasanya akun nomor #0)
# Didapatkan dari npx hardhat node 
# Akun ini wajib bertindak sebagai pemilik contract (Deployer/Admin) agar fungsi on-chain tidak revert
ADMIN_PRIVATE_KEY=0xac152343f5e4120847a83d2bc214742f64180aa3152343f5e4120847a83d2bc2
```

## Untuk Jalan Kerjanya
1. npm install di OilValidator, dan di sisi Backend juga npm install 
2. npx hardhat compile di OilValidation
3. npx hardhat node di OilValidation
4. npx hardhat ignition deploy ./ignition/modules/OilValidator.ts --network localhost di OilValidation dan udahakan docker sudah menyala
5. Ke backend cd backend
6. node./index.js
7. Untuk testing API lewat Bruno