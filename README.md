# Dokumen Desain Teknis: Sistem Verifikasi Keaslian Oli Berbasis Blockchain

## 1. Pendahuluan

Proyek ini bertujuan untuk membangun sistem anti-pemalsuan pelumas kendaraan menggunakan teknologi blockchain. Sistem ini memitigasi kelemahan QR Code konvensional dengan menerapkan logika *state-change* yang bersifat mutlak (*immutable*) melalui *smart contract*. Pendekatan ini memastikan bahwa setiap identitas produk hanya memiliki satu hak validasi (menghindari *double-spending* atau fotokopi QR).

## 2. Arsitektur & Tech Stack Pendukung

Untuk mencapai siklus pengembangan yang efisien dan mengikuti standar industri (*best practice*), arsitektur proyek ini akan menggunakan:

* **Smart Contract Development:** Hardhat sebagai *framework* pengujian dan kompilasi, diintegrasikan dengan TypeScript untuk *scripting* dan *testing*.
* **Frontend (User Interface):** *Framework* modern dengan performa tinggi dan waktu muat cepat seperti Vite Preact atau React sangat direkomendasikan. Kecepatan *render* sangat krusial karena aplikasi harus segera memproses validasi otomatis begitu konsumen memindai QR melalui peramban web di ponsel mereka.

## 3. Alur Kerja Sistem (System Workflow)

Sistem ini dibagi menjadi siklus hidup produk yang terintegrasi secara *end-to-end*, dari pabrik hingga ke tangan konsumen.

### Tahap 1: Registrasi Produk oleh Produsen

Produsen (bertindak sebagai entitas yang memiliki otoritas/Admin) akan berinteraksi dengan sistem untuk mendaftarkan *batch* oli baru.

* **Proses:** Produsen memasukkan parameter data produk, seperti: Merek, Tipe Oli, Nomor *Batch*, dan sebuah Kode Unik awal.
* **Pemrosesan Blockchain:** Data tersebut dikirim sebagai argumen transaksi ke *smart contract*. Kontrak akan memproses input tersebut (biasanya dengan melakukan *hashing* kriptografik) untuk menghasilkan pengenal mutlak (*Immutable Unique Identifier*) di dalam jaringan.
* **Hasil:** Sekalipun produsen memasukkan kombinasi parameter yang sama berulang kali, nilai identitas yang telah terenkripsi dan tersimpan di blockchain tidak dapat diganggu gugat atau dimanipulasi oleh pihak mana pun.

### Tahap 2: Pembuatan dan Distribusi QR Code

Setelah identitas produk resmi tercatat di blok (*mined*), sistem akan membawa data tersebut kembali ke ranah publik (*off-chain*).

* **Proses:** Nilai unik yang dihasilkan oleh blockchain disisipkan sebagai *path parameter* ke dalam sebuah URL, misalnya: `[https://domainanda.com/validate/](https://domainanda.com/validate/){hash_kode_unik}`.
* **Hasil:** URL tersebut di- *generate* menjadi sebuah bentuk visual QR Code yang kemudian dicetak dan ditempelkan pada kemasan fisik botol oli.

### Tahap 3: Pemindaian dan Validasi Otomatis (Konsumen)

Ini adalah titik interaksi utama yang membedakan sistem ini dengan database konvensional.

* **Proses:** Konsumen memindai QR Code menggunakan kamera ponsel biasa. Ponsel akan otomatis membuka URL *frontend* (Web App).
* **Aksi Latar Belakang (Otomatis):** Saat halaman dimuat, aplikasi *frontend* segera meminta izin akses lokasi perangkat konsumen. Aplikasi kemudian mengirimkan transaksi verifikasi ke *smart contract*, membawa argumen berupa `{hash_kode_unik}`, data waktu pemindaian (*timestamp*), dan region/lokasi dari perangkat.
* **Perubahan State:** *Smart contract* memverifikasi bahwa kode tersebut masih berstatus "Baru". Setelah divalidasi, *smart contract* akan mengubah status kode tersebut menjadi "Hangus" (*Used* / *Invalid*), serta mencatat lokasi dan waktu secara permanen.
* **Tampilan Pengguna:** Layar konsumen akan menampilkan pesan sukses bahwa produk tersebut **ORIGINAL**, beserta detail informasi pabrikan, merek, dan spesifikasi oli.

### Tahap 4: Penolakan Duplikasi (Peringatan Produk Palsu)

Mekanisme ini dirancang untuk mengatasi oknum yang menampung botol bekas atau memfotokopi QR Code.

* **Proses:** Jika QR Code yang sama dipindai untuk kedua kalinya, atau konsumen melakukan *refresh* pada halaman web hasil pindaian tadi.
* **Aksi:** Aplikasi web akan kembali membaca data dari blockchain. Namun kali ini, *smart contract* akan mengembalikan status bahwa kode tersebut sudah "Hangus".
* **Tampilan Pengguna:** UI *frontend* akan menampilkan halaman informasi detail produk yang sama persis seperti pindaian pertama, namun dengan indikator visual merah/peringatan keras. Tampilan ini memberikan *disclaimer* tegas bahwa kode tersebut sudah pernah digunakan pada tanggal, waktu, dan lokasi tertentu, sehingga konsumen dilarang membeli produk tersebut karena terindikasi kuat sebagai barang bekas atau palsu.

## 4. Panduan Pemodelan Smart Contract (Konseptual)

Untuk mengimplementasikan logika di atas, *smart contract* tim Anda perlu dirancang dengan struktur data berikut:

1. **Struktur Data Produk:** Sebuah *record* yang menyimpan detail manufaktur (Merek, Tipe), Status ketersediaan (Baru/Hangus), Waktu Verifikasi, dan Data Wilayah/Lokasi (*String* atau *Geohash*).
2. **Otorisasi Pembuatan (Access Control):** Fungsi untuk mendaftarkan produk (Tahap 1) harus dilindungi sedemikian rupa sehingga hanya dompet kripto milik perusahaan (Admin) yang dapat mengeksekusinya.
3. **Fungsi Verifikasi Terbuka:** Fungsi untuk mengubah status menjadi "Hangus" (Tahap 3) dapat diakses oleh publik, tetapi fungsi tersebut harus memiliki aturan ketat yang akan menggagalkan transaksi (Revert) apabila mencoba memverifikasi kode yang sudah hangus.

## 5. Pertimbangan UX & Best Practice Relayer

Sebagai catatan tambahan untuk tim: Meminta konsumen awam untuk membayar *gas fee* atau memiliki dompet kripto saat melakukan pemindaian (Tahap 3) bukanlah *user experience* yang baik.
Sebagai *best practice*, pertimbangkan untuk membangun sistem *Backend Relayer* (sebagai API perantara). *Frontend* akan mengirim perintah validasi beserta data lokasi ke API, dan API tersebut (yang didanai oleh perusahaan pelumas) yang akan membayarkan *gas fee* ke blockchain atas nama konsumen, sehingga proses otomatisasi berjalan mulus di balik layar.

---

## List of function

### 1. Kategori: Core Supply Chain (Fungsi Inti)

Ini adalah fungsi-fungsi yang sudah kita bahas sebelumnya untuk memenuhi siklus bisnis utama:

* Fungsi 1: `addVariant(string brand, string oilType)`
* **Kegunaan:** Menambahkan master data varian oli baru (hanya bisa dilakukan Admin).
* Fungsi 2: `registerProductBatch(bytes32[] productIds, uint256 variantId)`
* **Kegunaan:** Mendaftarkan ratusan/ribuan ID oli sekaligus ke dalam blockchain (hanya bisa dilakukan Admin).
* Fungsi 3: `validateProduct(bytes32 productId, string scanLocation)`
* **Kegunaan:** Fungsi publik untuk konsumen saat memindai QR Code. Mengubah status produk menjadi "Hangus" dan mencatat lokasi.

### 2. Kategori: Security & Incident Management (Pola Keamanan Ekstra)

Di dunia nyata, sistem blockchain rawan terhadap peretasan atau *human error*. Menambahkan fungsi-fungsi ini akan membuat tugas Anda terlihat sangat canggih:

* Fungsi 4: `transferOwnership(address newAdmin)` *(Pola: Ownable)*
* **Kegunaan:** Memindahkan hak akses Admin ke *wallet* lain. Ini wajib ada di dunia nyata, berjaga-jaga jika *private key* dompet Admin pertama bocor atau perusahaan mengganti direktur IT.

* Fungsi 5: emergencyRevoke(bytes32[] compromisedIds) (Pola: Exception Handling)
* **Kegunaan**: Bayangkan ada oknum pabrik yang mencuri stiker QR Code sebelum oli didistribusikan. Admin membutuhkan fungsi ini untuk menghanguskan ID tersebut secara sepihak sebelum sempat di-scan oleh konsumen, bukan menghapus record pada chain melainkan mengubah status si record menjadi sebuah identitas yang invalid atau ilegal.

### 3. Kategori: Data Retrieval (Fungsi Pembaca / View)

Fungsi yang tidak mengubah *state* (tidak butuh *gas fee*) sangat dibutuhkan oleh *Frontend / Web App* untuk menampilkan antarmuka yang baik:

* Fungsi 5: `getProductDetails(bytes32 productId)`
* **Kegunaan:** Mengembalikan data detail untuk satu botol oli (Status Baru/Hangus, timestamp scan, dan lokasi scan).
* Fungsi 6: `getSystemStats()`
* **Kegunaan:** Mengembalikan total oli yang pernah didaftarkan dan total oli yang sudah berhasil divalidasi konsumen. Ini sangat bagus untuk ditampilkan di halaman *Dashboard* web perusahaan.
