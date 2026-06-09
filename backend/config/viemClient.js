// config/viemClient.js
const { createPublicClient, createWalletClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { hardhat } = require('viem/chains');

const adminAccount = privateKeyToAccount(process.env.ADMIN_PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(process.env.RPC_URL),
});

const walletClient = createWalletClient({
  account: adminAccount,
  chain: hardhat,
  transport: http(process.env.RPC_URL),
});

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const contractABI = [
  {
    inputs: [{ name: "brand", type: "string" }, { name: "oilType", type: "string" }],
    name: "addVariant", outputs: [], stateMutability: "external", type: "function"
  },
  {
    inputs: [{ name: "productIds", type: "bytes32[]" }, { name: "variantId", type: "uint256" }],
    name: "registerProductBatch", outputs: [], stateMutability: "external", type: "function"
  },
  {
    inputs: [{ name: "compromisedIds", type: "bytes32[]" }],
    name: "emergencyRevoke", outputs: [], stateMutability: "external", type: "function"
  },
  {
    inputs: [],
    name: "totalVariants", outputs: [{ type: "uint32" }], stateMutability: "view", type: "function"
  },
  {
    inputs: [{ name: "variantId", type: "uint256" }],
    name: "variants",
    outputs: [{ name: "brand", type: "string" }, { name: "oilType", type: "string" }],
    stateMutability: "view", type: "function"
  },
  {
    inputs: [{ name: "productHash", type: "bytes32" }],
    name: "products",
    outputs: [
      { name: "variantId", type: "uint32" },
      { name: "registeredAt", type: "uint64" },
      { name: "validatedAt", type: "uint64" },
      { name: "status", type: "uint8" },
      { name: "scanLocation", type: "string" }
    ],
    stateMutability: "view", type: "function"
  },
  {
    inputs: [{ name: "productHash", type: "bytes32" }, { name: "scanLocation", type: "string" }],
    name: "validateProduct", outputs: [], stateMutability: "external", type: "function"
  },
  {
    inputs: [{ name: "newAdmin", type: "address" }],
    name: "transferOwnership", outputs: [], stateMutability: "external", type: "function"
  },
  {
    inputs: [],
    name: "admin", outputs: [{ type: "address" }], stateMutability: "view", type: "function"
  }
];

module.exports = { publicClient, walletClient, CONTRACT_ADDRESS, contractABI };