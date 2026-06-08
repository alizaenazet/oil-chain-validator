const express = require('express');
const { ethers } = require('ethers'); // Tetap di-import untuk helper fungsi hashing
const router = express.Router();
const authenticateAdminJWT = require('../middlewares/auth'); // Middleware JWT kamu

// DATABASE VARIAN MASTER DUMMY (Supaya sinkron saat dicek duplikasi)
global.dummyVariants = global.dummyVariants || {
    1: { brand: "Pertamina", oilType: "SAE 10W-40" },
    2: { brand: "Shell", oilType: "Helix HX7 10W-40" }
};

// DATABASE PRODUK TERDAFTAR DUMMY DI MEMORI (Agar bisa bertambah/berubah secara dinamis)
global.dummyRegisteredProducts = global.dummyRegisteredProducts || {
    // Format key: ProductId (Hex Hash dari Keccak256 nomor seri)
    [ethers.solidityPackedKeccak256(["string"], ["OIL-PERT-NEW"])]: {
        serialNumber: "OIL-PERT-NEW",
        variantId: 1,
        status: "NEW", // NEW, USED, REVOKED
        registeredAt: new Date().toISOString()
    }
};

// ─── 1. POST /admin/variants (DAFTARKAN VARIAN OLI BARU - DUMMY) ───────────
// CATATAN: Karena di index.js pakai app.use('/admin', adminRoutes), di sini cukup tulis '/variants'
router.post('/variants', authenticateAdminJWT, async (req, res) => {
    try {
        const { brand, oilType } = req.body;

        // Validasi input data
        if (!brand || !oilType || String(brand).trim() === "" || String(oilType).trim() === "") {
            return res.status(400).json({
                success: false,
                error: { code: "VALIDATION_ERROR", message: "Missing or empty fields: brand and oilType are required." }
            });
        }

        const cleanBrand = String(brand).trim();
        const cleanOilType = String(oilType).trim();

        // PROTEKSI 409: Cek Duplikasi Varian di database dummy memori (Pre-flight Check)
        const existingVariants = Object.values(global.dummyVariants);
        for (const variant of existingVariants) {
            if (
                variant.brand.toLowerCase() === cleanBrand.toLowerCase() &&
                variant.oilType.toLowerCase() === cleanOilType.toLowerCase()
            ) {
                return res.status(409).json({
                    success: false,
                    error: {
                        code: "VARIANT_EXISTS",
                        message: `Varian dengan kombinasi brand "${cleanBrand}" dan tipe "${cleanOilType}" sudah ada.`
                    }
                });
            }
        }

        // Tentukan ID baru secara dinamis berdasarkan panjang data dummy yang ada
        const newVariantId = Object.keys(global.dummyVariants).length + 1;

        // Simpan ke database memori global agar dibaca oleh endpoint publik /variants/:variantId
        global.dummyVariants[newVariantId] = {
            brand: cleanBrand,
            oilType: cleanOilType
        };

        console.log(`[Admin API - DUMMY] 💾 Sukses mendaftarkan Varian Baru Master ID ${newVariantId}: ${cleanBrand} - ${cleanOilType}`);

        // Generate Tx Hash palsu untuk Bruno
        const mockTxHash = "0x" + require('crypto').randomBytes(32).toString('hex');

        return res.status(201).json({
            success: true,
            data: {
                variantId: newVariantId,
                brand: cleanBrand,
                oilType: cleanOilType,
                txHash: mockTxHash
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: { code: "DUMMY_VARIANT_ERROR", message: error.message } });
    }
});

// ─── 2. POST /admin/batches (DAFTARKAN PRODUK BARU - DUMMY) ───────────────────
router.post('/batches', authenticateAdminJWT, async (req, res) => {
    try {
        const { variantId, serialNumbers } = req.body;

        // Validasi Input
        if (!variantId || !serialNumbers || !Array.isArray(serialNumbers) || serialNumbers.length === 0) {
            return res.status(400).json({
                success: false,
                error: { code: "VALIDATION_ERROR", message: "variantId dan daftar serialNumbers berbentuk array wajib diisi." }
            });
        }

        console.log(`[Admin API - DUMMY] Mendaftarkan ${serialNumbers.length} nomor seri baru untuk Variant ID: ${variantId}`);
        const registeredList = [];

        // Loping dan simpan nomor seri ke dalam memori dummy blockchain
        for (const serial of serialNumbers) {
            const cleanSerial = String(serial).trim();
            const productId = ethers.solidityPackedKeccak256(["string"], [cleanSerial]);

            // Simpan ke database memori global
            global.dummyRegisteredProducts[productId] = {
                serialNumber: cleanSerial,
                variantId: Number(variantId),
                status: "NEW",
                registeredAt: new Date().toISOString()
            };

            registeredList.push({
                productId: productId,
                serialNumber: cleanSerial,
                status: "NEW"
            });
        }

        const mockTxHash = "0x" + require('crypto').randomBytes(32).toString('hex');

        return res.status(201).json({
            success: true,
            data: {
                batchSize: serialNumbers.length,
                variantId: Number(variantId),
                products: registeredList,
                txHash: mockTxHash
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: { code: "DUMMY_BATCH_ERROR", message: error.message } });
    }
});

// ─── 3. POST /admin/emergency-revoke (BLOKIR PRODUK - DUMMY) ──────────────────
router.post('/emergency-revoke', authenticateAdminJWT, async (req, res) => {
    try {
        // KITA UBAH: Menerima 'serialNumbers' dan 'reason' sesuai kiriman di Bruno
        const { serialNumbers, reason } = req.body; 

        if (!serialNumbers || !Array.isArray(serialNumbers) || serialNumbers.length === 0) {
            return res.status(400).json({
                success: false,
                error: { 
                    code: "VALIDATION_ERROR", 
                    message: "serialNumbers berbentuk array wajib diisi, Jul!" 
                }
            });
        }

        console.log(`[Admin API - DUMMY] Menerima laporan Emergency Revoke. Alasan: ${reason || "Tidak ada alasan spesifik"}`);
        const revokedList = [];

        for (const serial of serialNumbers) {
            const cleanSerial = String(serial).trim();
            const productId = ethers.solidityPackedKeccak256(["string"], [cleanSerial]);

            // 1. Jika produk ada di memori pendaftaran dinamis global
            if (global.dummyRegisteredProducts && global.dummyRegisteredProducts[productId]) {
                global.dummyRegisteredProducts[productId].status = "REVOKED";
            }

            // 2. Masukkan ke dalam daftar yang sukses dicabut untuk response
            revokedList.push({
                productId: productId,
                serialNumber: cleanSerial,
                status: "REVOKED"
            });
            
            console.log(`[Admin API - DUMMY] 🛑 Sukses me-revoke nomor seri: ${cleanSerial}`);
        }

        const mockTxHash = "0x" + require('crypto').randomBytes(32).toString('hex');

        return res.status(200).json({
            success: true,
            data: {
                totalRevoked: revokedList.length,
                revokedProducts: revokedList,
                reason: reason || "N/A",
                txHash: mockTxHash
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: { code: "DUMMY_REVOKE_ERROR", message: error.message } });
    }
});

module.exports = router;