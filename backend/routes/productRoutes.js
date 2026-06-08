// routes/productRoutes.js
const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

const contractABI = [
    "function getProductDetails(bytes32 productHash) external view returns (uint32 variantId, uint64 registeredAt, uint64 validatedAt, uint8 status, string memory scanLocation, string memory brand, string memory oilType)"
];

const oilValidatorContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
const STATUS_MAP = ["UNREGISTERED", "NEW", "USED", "REVOKED"];

// ─── GET /products/:serialNumber (AMBIL DETAIL PRODUK - FIX HASHING) ───
router.get('/:serialNumber', async (req, res) => {
    try {
        const { serialNumber } = req.params;

        if (!serialNumber || String(serialNumber).trim() === "") {
            return res.status(400).json({
                success: false,
                error: { code: "VALIDATION_ERROR", message: "Nomor seri (serialNumber) wajib diisi." }
            });
        }

        const cleanSerialNumber = String(serialNumber).trim();
        
        // FIX: Gunakan Keccak256 persis seperti di adminRoutes agar ID produknya SINKRON!
        const mockProductId = ethers.solidityPackedKeccak256(["string"], [cleanSerialNumber]);

        let product = null;

        // 1. Cek di memori dinamis global (/admin/batches)
        if (global.dummyRegisteredProducts && global.dummyRegisteredProducts[mockProductId]) {
            const dynamicProd = global.dummyRegisteredProducts[mockProductId];
            
            const vId = dynamicProd.variantId;
            const variantInfo = global.dummyVariants && global.dummyVariants[vId] 
                ? global.dummyVariants[vId] 
                : { brand: "Pertamina", oilType: "SAE 10W-40" };

            product = {
                productId: mockProductId,
                serialNumber: cleanSerialNumber,
                variantId: vId,
                brand: variantInfo.brand,
                oilType: variantInfo.oilType,
                status: dynamicProd.status,
                registeredAt: dynamicProd.registeredAt
            };
        } 
        // 2. Fallback baseline static dummy
        else if (cleanSerialNumber === "OIL-PERT-NEW") {
            product = {
                productId: mockProductId,
                serialNumber: "OIL-PERT-NEW",
                variantId: 1,
                brand: "Pertamina",
                oilType: "SAE 10W-40",
                status: "NEW",
                registeredAt: "2024-07-01T00:00:00.000Z"
            };
        } else if (cleanSerialNumber === "OIL-SHELL-REVOKED") {
            product = {
                productId: mockProductId,
                serialNumber: "OIL-SHELL-REVOKED",
                variantId: 2,
                brand: "Shell",
                oilType: "Helix HX7 10W-40",
                status: "REVOKED",
                registeredAt: "2024-07-01T00:00:00.000Z"
            };
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "PRODUCT_NOT_FOUND",
                    message: `Product dengan nomor seri ${cleanSerialNumber} tidak terdaftar di sistem.`
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                productId: product.productId,
                serialNumber: product.serialNumber,
                status: product.status,
                registeredAt: product.registeredAt,
                variant: {
                    variantId: product.variantId,
                    brand: product.brand,
                    oilType: product.oilType
                }
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "DUMMY_PRODUCT_DETAIL_ERROR", message: error.message }
        });
    }
});

module.exports = router;