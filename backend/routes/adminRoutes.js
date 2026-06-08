// routes/adminRoutes.js
const express = require("express");
const { ethers } = require("ethers");
const router = express.Router();
const authenticateAdminJWT = require("../middlewares/auth");
const { Variant } = require("../models"); // Import model SQLite via jangkar index.js

// 1. KONFIGURASI ETHERS.JS RELAYER (Terhubung ke Hardhat/Local Node Node)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

// Ambil interface ABI fungsi-fungsi admin dari OilValidator.sol
const contractABI = [
  "function addVariant(string calldata brand, string calldata oilType) external",
  "function registerProductBatch(bytes32[] calldata productIds, uint256 variantId) external",
  "function emergencyRevoke(bytes32[] calldata compromisedIds) external",
  "function totalVariants() external view returns (uint32)",
  "function products(bytes32 productHash) external view returns (uint32 variantId, uint64 registeredAt, uint64 validatedAt, uint8 status, string memory scanLocation)",
];

const oilValidatorContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  adminWallet,
);

// ─── 1. POST /admin/variants (DAFTARKAN MASTER VARIAN BARU) ───────────────────
router.post("/variants", authenticateAdminJWT, async (req, res) => {
  try {
    const { brand, oilType } = req.body;

    // STEP 2: Validasi Input Fields
    if (
      !brand ||
      !oilType ||
      String(brand).trim() === "" ||
      String(oilType).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Missing or empty fields: brand and oilType are required.",
        },
      });
    }

    const cleanBrand = String(brand).trim();
    const cleanOilType = String(oilType).trim();

    // STEP 3: Local Pre-flight Check (SQLite Guard)
    console.log(
      `[SQLite Guard] Memeriksa duplikasi lokal untuk: ${cleanBrand} - ${cleanOilType}`,
    );
    const existingVariant = await Variant.findOne({
      where: {
        brand: cleanBrand,
        oilType: cleanOilType,
      },
    });

    // 🛑 JIKA DUPLIKAT: Potong jalur di sini, kembalikan status 400 (Hemat Gas Blockchain)
    if (existingVariant) {
      console.log(
        `[SQLite Guard] 🛑 Request ditolak! Varian sudah terdaftar di database lokal.`,
      );
      return res.status(400).json({
        success: false,
        error: {
          code: "DUPLICATE_VARIANT",
          message: `Varian pelumas dengan brand "${cleanBrand}" dan tipe "${cleanOilType}" sudah terdaftar di sistem!`,
        },
      });
    }

    // STEP 4: On-Chain Execution via Gas Relayer Admin
    console.log(
      `[Blockchain RPC] Jalur aman. Mengirim transaksi addVariant ke On-Chain...`,
    );
    const tx = await oilValidatorContract.addVariant(cleanBrand, cleanOilType);

    // STEP 5: Mining Confirmation
    console.log(
      `[Blockchain RPC] Transaksi dikirim. Menunggu konfirmasi block (Tx: ${tx.hash})...`,
    );
    const receipt = await tx.wait();

    // STEP 6: Data Synchronization ke SQLite Lokal
    console.log(
      `[SQLite DB] 💾 Transaksi on-chain sukses! Mengunci data varian ke SQLite...`,
    );
    await Variant.create({
      brand: cleanBrand,
      oilType: cleanOilType,
      txHash: tx.hash,
    });
    console.log(`[SQLite DB] 💾 Data sukses disinkronkan ke tabel Variants.`);

    // STEP 7: Success Response payload 201 Created
    return res.status(201).json({
      success: true,
      message:
        "Master Variant berhasil didaftarkan secara permanen on-chain dan ter-sinkronisasi di SQLite lokal.",
      data: {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        variant: {
          brand: cleanBrand,
          oilType: cleanOilType,
        },
      },
    });
  } catch (error) {
    console.error("❌ Add Variant Endpoint Critical Error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "BLOCKCHAIN_TX_FAILED",
        message:
          error.message ||
          "Something went wrong on the blockchain transaction.",
      },
    });
  }
});

// ─── 2. POST /admin/batches (DAFTARKAN BATCH PRODUK DENGAN PRE-FLIGHT CHECK SINKRON) ───
router.post("/batches", authenticateAdminJWT, async (req, res) => {
  try {
    const { variantId, serialNumbers } = req.body;

    // STEP 1 & 2: Validasi Format Input Body Fields
    if (
      !variantId ||
      isNaN(variantId) ||
      !serialNumbers ||
      !Array.isArray(serialNumbers) ||
      serialNumbers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Missing fields or empty serialNumbers array.",
        },
      });
    }

    console.log(
      `[Batch Register] Memulai pre-flight lookup check untuk ${serialNumbers.length} produk...`,
    );

    // STEP 3A: Cek Validitas Variant ID ke Blockchain (404 Check)
    const totalVariantsOnChain = await oilValidatorContract.totalVariants();
    if (
      Number(variantId) <= 0 ||
      Number(variantId) > Number(totalVariantsOnChain)
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: "VARIANT_NOT_FOUND",
          message: `Provided variantId (${variantId}) does not exist on-chain.`,
        },
      });
    }

    // Jalankan looping hashing dan lookup status produk
    const hashedProductIds = [];
    const conflictingIds = [];

    for (const serial of serialNumbers) {
      const cleanSerial = String(serial).trim();
      // Critical Off-Chain Hashing Logic Keccak256
      const productIdHash = ethers.solidityPackedKeccak256(
        ["string"],
        [cleanSerial],
      );

      // STEP 3B: Cek Duplikasi ID ke Blockchain (409 Conflict Check)
      const productData = await oilValidatorContract.products(productIdHash);
      const statusEnum = Number(productData[3]); // Index ke-3 adalah ProductStatus enum (uint8)

      // Status 0 artinya UNREGISTERED di Smart Contract. Jika bukan 0, berarti sudah terdaftar!
      if (statusEnum !== 0) {
        conflictingIds.push(cleanSerial);
      } else {
        hashedProductIds.push(productIdHash);
      }
    }

    // 🛑 JIKA ADA NOMOR SERI YANG KEMBAR: Hentikan eksekusi, return error 409
    if (conflictingIds.length > 0) {
      console.log(
        `[Batch Register] 🛑 Gagal! Ditemukan ${conflictingIds.length} nomor seri yang sudah terdaftar.`,
      );
      return res.status(409).json({
        success: false,
        error: {
          code: "PRODUCT_ALREADY_EXISTS",
          message:
            "One or more product IDs in the batch are already registered.",
          conflictingIds: conflictingIds,
        },
      });
    }

    // STEP 4 & 5: Kirim Transaksi ke Smart Contract & Tunggu Konfirmasi Block
    console.log(
      `[Blockchain RPC] Seluruh data valid. Mendaftarkan batch ke on-chain...`,
    );
    const tx = await oilValidatorContract.registerProductBatch(
      hashedProductIds,
      Number(variantId),
    );
    await tx.wait();

    // STEP 7: Kembalikan Response Sukses status 202 Accepted sesuai dengan Docs
    return res.status(202).json({
      success: true,
      data: {
        variantId: Number(variantId),
        registered: hashedProductIds.length,
        txHash: tx.hash,
        productIds: hashedProductIds,
      },
    });
  } catch (error) {
    console.error("❌ Register Batch Endpoint Critical Error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "BLOCKCHAIN_TX_FAILED",
        message: error.message || "Contract reverted or RPC unreachable.",
      },
    });
  }
});

// ─── 3. POST /admin/emergency-revoke (BLOKIR PRODUK KOMPROMI MASSAL ON-CHAIN) ───
router.post("/emergency-revoke", authenticateAdminJWT, async (req, res) => {
  try {
    const { serialNumbers, reason } = req.body;

    // STEP 1 & 2: Validasi Format Input Array
    if (
      !serialNumbers ||
      !Array.isArray(serialNumbers) ||
      serialNumbers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "serialNumbers berbentuk array wajib diisi dan tidak boleh kosong.",
        },
      });
    }

    // Konversi seluruh string nomor seri menjadi array Keccak256 Bytes32
    const hashedCompromisedIds = serialNumbers.map((serial) => {
      return ethers.solidityPackedKeccak256(
        ["string"],
        [String(serial).trim()],
      );
    });

    console.log(
      `[Emergency Revoke] Memeriksa status ${serialNumbers.length} produk on-chain sebelum dieksekusi...`,
    );

    // STEP 3: Pre-flight Check Status ke Blockchain (Mencegah Revert Buta)
    for (const productId of hashedCompromisedIds) {
      const productOnChain = await oilValidatorContract.products(productId);
      const statusEnum = Number(productOnChain[3]); // Index ke-3 adalah status (uint8/enum)

      // Status 0 = UNREGISTERED di Smart Contract
      if (statusEnum === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: `Gagal memproses massal. Salah satu ID produk tidak terdaftar on-chain.`,
          },
        });
      }

      // Status 3 = REVOKED di Smart Contract
      if (statusEnum === 3) {
        return res.status(409).json({
          success: false,
          error: {
            code: "ALREADY_REVOKED",
            message: `Gagal memproses massal. Salah satu produk sudah dalam status REVOKED sebelumnya.`,
          },
        });
      }
    }

    // STEP 4: Kirim Transaksi ke Smart Contract jika seluruh data lolos seleksi
    console.log(
      `[Blockchain RPC] Seluruh data valid. Mengeksekusi Emergency Revoke massal on-chain...`,
    );
    const tx = await oilValidatorContract.emergencyRevoke(hashedCompromisedIds);

    console.log(
      `[Blockchain RPC] Menunggu konfirmasi block untuk transaksi revoke...`,
    );
    await tx.wait();

    // STEP 5: Off-Chain Audit Logging (Opsional - Bisa kamu sambungkan ke tabel SQLite jika perlu)
    console.log(
      `[SQLite Log] 💾 Skenario darurat dicatat off-chain. Alasan: ${reason || "N/A"}`,
    );

    // STEP 6: Kembalikan Response Sukses sesuai Docs
    return res.status(200).json({
      success: true,
      data: {
        revoked: hashedCompromisedIds.length,
        txHash: tx.hash,
        revokedIds: hashedCompromisedIds,
      },
    });
  } catch (error) {
    console.error("❌ Emergency Revoke Critical Error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "BLOCKCHAIN_TX_FAILED",
        message: error.message || "Transaksi blockchain gagal atau node rewel.",
      },
    });
  }
});

module.exports = router;
