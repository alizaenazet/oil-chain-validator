# AGENTS.md

Hardhat 3 smart-contract project for an oil-authenticity verification system. Uses pnpm, Viem, and Hardhat Ignition.

## Commands

- Run everything through `pnpm hardhat <task>` (no scripts in `package.json`).
- Build/compile: `pnpm hardhat build` (alias `compile`). Use `--build-profile production` for optimized output.
- Test (both runners): `pnpm hardhat test`
  - Node.js tests only: `pnpm hardhat test nodejs`
  - Solidity tests only: `pnpm hardhat test solidity`
- Deploy (Ignition): `pnpm hardhat ignition deploy ignition/modules/<Module>.ts --network <network>`
- Run a script: `pnpm hardhat run scripts/<file>.ts`

## Project structure

- `contracts/` — Solidity source files **and** Foundry-style Solidity tests (`*.t.sol`).
- `test/` — TypeScript integration tests using the Node.js built-in test runner (`node:test`).
- `ignition/modules/` — Hardhat Ignition deployment modules.
- `scripts/` — One-off Viem scripts.

## Toolchain quirks

- Hardhat 3 — config and CLI differ from v2. Config uses `defineConfig` from `hardhat/config`.
- ESM only (`"type": "module"` in `package.json`). All `.ts` scripts/tests are ESM.
- Viem is the RPC client, not Ethers.js. Tests/scripts use `await network.create()` then `viem.getPublicClient()` / `viem.deployContract()`.
- Solidity version is pinned to `0.8.28`. Build profiles: `default` (no optimizer) and `production` (optimizer, 200 runs).
- Solidity tests depend on `forge-std` (Foundry standard library) but are executed by Hardhat’s built-in runner, not `forge test`.

## Networks & environment

- Default in-memory network: `hardhatMainnet` (L1 simulated).
- OP-stack simulated network: `hardhatOp`.
- Live testnet: `sepolia` — requires env vars `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY`.
