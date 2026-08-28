import { network } from "hardhat";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAddress, keccak256 } from "viem";

describe("OilValidator", async function () {
  const { viem, networkHelpers } = await network.create();

  async function deployValidator() {
    const validator = await viem.deployContract("OilValidator");
    return { validator };
  }

  /* ── addVariant ─────────────────────────────────────────────────────── */

  describe("addVariant", async function () {
    it("should allow admin to add a variant", async function () {
      const { validator } = await networkHelpers.loadFixture(deployValidator);
      const [admin] = await viem.getWalletClients();

      await validator.write.addVariant(["Shell", "Helix Ultra 5W-40"], { account: admin.account });
      const total = await validator.read.totalVariants();
      assert.equal(total, 1);

      const variant = await validator.read.variants([1]);
      assert.equal(variant[0], "Shell");
      assert.equal(variant[1], "Helix Ultra 5W-40");
    });

    it("should emit VariantAdded event", async function () {
      const { validator } = await networkHelpers.loadFixture(deployValidator);
      const [admin] = await viem.getWalletClients();

      await viem.assertions.emitWithArgs(
        validator.write.addVariant(["Shell", "Helix Ultra 5W-40"], { account: admin.account }),
        validator,
        "VariantAdded",
        [1, "Shell", "Helix Ultra 5W-40"]
      );
    });

    it("should revert when non-admin adds variant", async function () {
      const { validator } = await networkHelpers.loadFixture(deployValidator);
      const [, user] = await viem.getWalletClients();

      await viem.assertions.revertWith(
        validator.write.addVariant(["Shell", "Helix Ultra 5W-40"], { account: user.account }),
        "OilValidator: caller is not the admin"
      );
    });
  });

  /* ── registerProductBatch ───────────────────────────────────────────── */

  describe("registerProductBatch", async function () {
    async function deployWithVariant() {
      const validator = await viem.deployContract("OilValidator");
      const [admin] = await viem.getWalletClients();
      await validator.write.addVariant(["Shell", "Helix Ultra 5W-40"], { account: admin.account });
      return { validator, admin };
    }

    it("should allow admin to register a batch", async function () {
      const { validator, admin } = await networkHelpers.loadFixture(deployWithVariant);
      const ids = [keccak256("0x494431"), keccak256("0x494432")];

      await validator.write.registerProductBatch([ids, 1n], { account: admin.account });
      const total = await validator.read.totalRegisteredProducts();
      assert.equal(total, 2);
    });

    it("should emit ProductRegistered events", async function () {
      const { validator, admin } = await networkHelpers.loadFixture(deployWithVariant);
      const ids = [keccak256("0x494431")];

      await viem.assertions.emit(
        validator.write.registerProductBatch([ids, 1n], { account: admin.account }),
        validator,
        "ProductRegistered"
      );
    });

    it("should revert for invalid variant ID", async function () {
      const { validator, admin } = await networkHelpers.loadFixture(deployWithVariant);
      const ids = [keccak256("0x494431")];

      await viem.assertions.revertWith(
        validator.write.registerProductBatch([ids, 2n], { account: admin.account }),
        "OilValidator: invalid variant ID"
      );
    });

    it("should revert for empty batch", async function () {
      const { validator, admin } = await networkHelpers.loadFixture(deployWithVariant);

      await viem.assertions.revertWith(
        validator.write.registerProductBatch([[], 1n], { account: admin.account }),
        "OilValidator: empty batch"
      );
    });

    it("should revert when product already registered", async function () {
      const { validator, admin } = await networkHelpers.loadFixture(deployWithVariant);
      const ids = [keccak256("0x494431")];

      await validator.write.registerProductBatch([ids, 1n], { account: admin.account });
      await viem.assertions.revertWith(
        validator.write.registerProductBatch([ids, 1n], { account: admin.account }),
        "OilValidator: product already registered"
      );
    });

    it("should revert when non-admin registers", async function () {
      const { validator } = await networkHelpers.loadFixture(deployWithVariant);
      const [, user] = await viem.getWalletClients();
      const ids = [keccak256("0x494431")];

      await viem.assertions.revertWith(
        validator.write.registerProductBatch([ids, 1n], { account: user.account }),
        "OilValidator: caller is not the admin"
      );
    });
  });

  /* ── validateProduct ────────────────────────────────────────────────── */

  describe("validateProduct", async function () {
    async function deployWithRegisteredProduct() {
      const validator = await viem.deployContract("OilValidator");
      const [admin, user] = await viem.getWalletClients();
      await validator.write.addVariant(["Shell", "Helix Ultra 5W-40"], { account: admin.account });
      const productId = keccak256("0x494431");
      await validator.write.registerProductBatch([[productId], 1n], { account: admin.account });
      return { validator, admin, user, productId };
    }

    it("should allow public to validate a NEW product", async function () {
      const { validator, user, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);

      await validator.write.validateProduct([productId, "Jakarta"], { account: user.account });
      const product = await validator.read.products([productId]);
      assert.equal(product[3], 2); // ProductStatus.USED = 2
      assert.equal(product[4], "Jakarta");
      assert.ok(product[2] > 0);

      const totalValidated = await validator.read.totalValidatedProducts();
      assert.equal(totalValidated, 1);
    });

    it("should emit ProductValidated event", async function () {
      const { validator, user, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);

      await viem.assertions.emit(
        validator.write.validateProduct([productId, "Jakarta"], { account: user.account }),
        validator,
        "ProductValidated"
      );
    });

    it("should revert for unregistered product", async function () {
      const { validator, user } = await networkHelpers.loadFixture(deployWithRegisteredProduct);
      const fakeId = keccak256("0x46414B45");

      await viem.assertions.revertWith(
        validator.write.validateProduct([fakeId, "Jakarta"], { account: user.account }),
        "OilValidator: product not available for validation"
      );
    });

    it("should revert for already USED product", async function () {
      const { validator, user, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);
      const [, , other] = await viem.getWalletClients();

      await validator.write.validateProduct([productId, "Jakarta"], { account: user.account });
      await viem.assertions.revertWith(
        validator.write.validateProduct([productId, "Bandung"], { account: other.account }),
        "OilValidator: product not available for validation"
      );
    });

    it("should revert for REVOKED product", async function () {
      const { validator, admin, user, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);

      await validator.write.emergencyRevoke([[productId]], { account: admin.account });
      await viem.assertions.revertWith(
        validator.write.validateProduct([productId, "Jakarta"], { account: user.account }),
        "OilValidator: product not available for validation"
      );
    });
  });

  /* ── transferOwnership ──────────────────────────────────────────────── */

  describe("transferOwnership", async function () {
    it("should allow admin to transfer ownership", async function () {
      const { validator } = await networkHelpers.loadFixture(deployValidator);
      const [admin, newAdmin] = await viem.getWalletClients();

      await validator.write.transferOwnership([newAdmin.account.address], { account: admin.account });
      const currentAdmin = await validator.read.admin();
      assert.equal(currentAdmin, getAddress(newAdmin.account.address));
    });

    it("should emit OwnershipTransferred event", async function () {
      const { validator } = await networkHelpers.loadFixture(deployValidator);
      const [admin, newAdmin] = await viem.getWalletClients();

      await viem.assertions.emitWithArgs(
        validator.write.transferOwnership([newAdmin.account.address], { account: admin.account }),
        validator,
        "OwnershipTransferred",
        [getAddress(admin.account.address), getAddress(newAdmin.account.address)]
      );
    });

    it("should revert for zero address", async function () {
      const { validator } = await networkHelpers.loadFixture(deployValidator);
      const [admin] = await viem.getWalletClients();

      await viem.assertions.revertWith(
        validator.write.transferOwnership(["0x0000000000000000000000000000000000000000"], { account: admin.account }),
        "OilValidator: new admin is zero address"
      );
    });

    it("should revert when non-admin transfers", async function () {
      const { validator } = await networkHelpers.loadFixture(deployValidator);
      const [, user] = await viem.getWalletClients();

      await viem.assertions.revertWith(
        validator.write.transferOwnership([user.account.address], { account: user.account }),
        "OilValidator: caller is not the admin"
      );
    });

    it("should allow new admin to perform admin actions", async function () {
      const { validator } = await networkHelpers.loadFixture(deployValidator);
      const [admin, newAdmin] = await viem.getWalletClients();

      await validator.write.transferOwnership([newAdmin.account.address], { account: admin.account });
      await validator.write.addVariant(["Shell", "Helix Ultra 5W-40"], { account: newAdmin.account });
      const total = await validator.read.totalVariants();
      assert.equal(total, 1);
    });

    it("should prevent old admin from performing admin actions", async function () {
      const { validator } = await networkHelpers.loadFixture(deployValidator);
      const [admin, newAdmin] = await viem.getWalletClients();

      await validator.write.transferOwnership([newAdmin.account.address], { account: admin.account });
      await viem.assertions.revertWith(
        validator.write.addVariant(["Shell", "Helix Ultra 5W-40"], { account: admin.account }),
        "OilValidator: caller is not the admin"
      );
    });
  });

  /* ── emergencyRevoke ────────────────────────────────────────────────── */

  describe("emergencyRevoke", async function () {
    async function deployWithRegisteredProduct() {
      const validator = await viem.deployContract("OilValidator");
      const [admin, user] = await viem.getWalletClients();
      await validator.write.addVariant(["Shell", "Helix Ultra 5W-40"], { account: admin.account });
      const productId = keccak256("0x494431");
      await validator.write.registerProductBatch([[productId], 1n], { account: admin.account });
      return { validator, admin, user, productId };
    }

    it("should allow admin to revoke a NEW product", async function () {
      const { validator, admin, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);

      await validator.write.emergencyRevoke([[productId]], { account: admin.account });
      const product = await validator.read.products([productId]);
      assert.equal(product[3], 3); // ProductStatus.REVOKED = 3
    });

    it("should emit ProductRevoked event", async function () {
      const { validator, admin, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);

      await viem.assertions.emitWithArgs(
        validator.write.emergencyRevoke([[productId]], { account: admin.account }),
        validator,
        "ProductRevoked",
        [productId]
      );
    });

    it("should revert when non-admin revokes", async function () {
      const { validator, user, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);

      await viem.assertions.revertWith(
        validator.write.emergencyRevoke([[productId]], { account: user.account }),
        "OilValidator: caller is not the admin"
      );
    });

    it("should revert for unregistered product", async function () {
      const { validator, admin } = await networkHelpers.loadFixture(deployWithRegisteredProduct);
      const fakeId = keccak256("0x46414B45");

      await viem.assertions.revertWith(
        validator.write.emergencyRevoke([[fakeId]], { account: admin.account }),
        "OilValidator: product not revocable"
      );
    });

    it("should revert for already USED product", async function () {
      const { validator, admin, user, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);

      await validator.write.validateProduct([productId, "Jakarta"], { account: user.account });
      await viem.assertions.revertWith(
        validator.write.emergencyRevoke([[productId]], { account: admin.account }),
        "OilValidator: product not revocable"
      );
    });

    it("should revert for already REVOKED product", async function () {
      const { validator, admin, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);

      await validator.write.emergencyRevoke([[productId]], { account: admin.account });
      await viem.assertions.revertWith(
        validator.write.emergencyRevoke([[productId]], { account: admin.account }),
        "OilValidator: product not revocable"
      );
    });
  });

  /* ── getProductDetails ──────────────────────────────────────────────── */

  describe("getProductDetails", async function () {
    async function deployWithRegisteredProduct() {
      const validator = await viem.deployContract("OilValidator");
      const [admin, user] = await viem.getWalletClients();
      await validator.write.addVariant(["Shell", "Helix Ultra 5W-40"], { account: admin.account });
      const productId = keccak256("0x494431");
      await validator.write.registerProductBatch([[productId], 1n], { account: admin.account });
      return { validator, admin, user, productId };
    }

    it("should return correct details for NEW product", async function () {
      const { validator, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);

      const details = await validator.read.getProductDetails([productId]);
      assert.equal(details[0], 1); // variantId
      assert.ok(details[1] > 0);   // registeredAt
      assert.equal(details[2], 0n); // validatedAt
      assert.equal(details[3], 1);  // NEW
      assert.equal(details[4], ""); // scanLocation
      assert.equal(details[5], "Shell");
      assert.equal(details[6], "Helix Ultra 5W-40");
    });


    it("should return empty data for unregistered product", async function () {
      const { validator } = await networkHelpers.loadFixture(deployWithRegisteredProduct);
      const fakeId = keccak256("0x46414B45asdfa");

      const details = await validator.read.getProductDetails([fakeId]);
      assert.equal(details[0], 0); // variantId
      assert.equal(details[1], 0n); // registeredAt
      assert.equal(details[2], 0n); // validatedAt
      assert.equal(details[3], 0);  // UNREGISTERED
      assert.equal(details[4], ""); // scanLocation
      assert.equal(details[5], ""); // brand
      assert.equal(details[6], ""); // oilType
    });

    it("should return correct details for USED product", async function () {
      const { validator, user, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);

      await validator.write.validateProduct([productId, "Jakarta"], { account: user.account });
      const details = await validator.read.getProductDetails([productId]);
      assert.equal(details[0], 1);
      assert.ok(details[1] > 0);
      assert.ok(details[2] > 0);
      assert.equal(details[3], 2);  // USED
      assert.equal(details[4], "Jakarta");
      assert.equal(details[5], "Shell");
      assert.equal(details[6], "Helix Ultra 5W-40");
    });

    it("should return correct details for REVOKED product", async function () {
      const { validator, admin, productId } = await networkHelpers.loadFixture(deployWithRegisteredProduct);

      await validator.write.emergencyRevoke([[productId]], { account: admin.account });
      const details = await validator.read.getProductDetails([productId]);
      assert.equal(details[0], 1);
      assert.ok(details[1] > 0);
      assert.equal(details[2], 0n);
      assert.equal(details[3], 3);  // REVOKED
      assert.equal(details[4], "");
      assert.equal(details[5], "Shell");
      assert.equal(details[6], "Helix Ultra 5W-40");
    });
  });

  /* ── getSystemStats ─────────────────────────────────────────────────── */

  describe("getSystemStats", async function () {
    it("should return zero initially", async function () {
      const { validator } = await networkHelpers.loadFixture(deployValidator);
      const stats = await validator.read.getSystemStats();
      assert.equal(stats[0], 0);
      assert.equal(stats[1], 0);
    });

    it("should return correct stats after operations", async function () {
      const validator = await viem.deployContract("OilValidator");
      const [admin, user] = await viem.getWalletClients();
      await validator.write.addVariant(["Shell", "Helix Ultra 5W-40"], { account: admin.account });

      const ids = [keccak256("0x494431"), keccak256("0x494432"), keccak256("0x494433")];
      await validator.write.registerProductBatch([ids, 1n], { account: admin.account });
      await validator.write.validateProduct([ids[0], "Jakarta"], { account: user.account });

      const stats = await validator.read.getSystemStats();
      assert.equal(stats[0], 3);
      assert.equal(stats[1], 1);
    });
  });
});
