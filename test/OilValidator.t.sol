// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { OilValidator } from "../contracts/OilValidator.sol";

contract OilValidatorTest is Test {
    OilValidator public validator;
    address public admin;
    address public user;

    event VariantAdded(uint32 indexed variantId, string brand, string oilType);
    event ProductRegistered(bytes32 indexed productHash, uint32 indexed variantId, uint64 registeredAt);
    event ProductValidated(bytes32 indexed productHash, uint32 indexed variantId, uint64 validatedAt, string scanLocation);
    event OwnershipTransferred(address indexed previousAdmin, address indexed newAdmin);
    event ProductRevoked(bytes32 indexed productHash);

    function setUp() public {
        admin = address(this);
        user = address(0x1234);
        validator = new OilValidator();
    }

    /* ── addVariant ─────────────────────────────────────────────────────── */

    function test_AddVariant_AsAdmin() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        assertEq(validator.totalVariants(), 1);
        (string memory brand, string memory oilType) = validator.variants(1);
        assertEq(brand, "Shell");
        assertEq(oilType, "Helix Ultra 5W-40");
    }

    function test_AddVariant_MultipleVariants() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        validator.addVariant("Castrol", "Magnatec 10W-40");
        assertEq(validator.totalVariants(), 2);
        (string memory brand2, string memory oilType2) = validator.variants(2);
        assertEq(brand2, "Castrol");
        assertEq(oilType2, "Magnatec 10W-40");
    }

    function test_AddVariant_EmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit VariantAdded(1, "Shell", "Helix Ultra 5W-40");
        validator.addVariant("Shell", "Helix Ultra 5W-40");
    }

    function test_AddVariant_NonAdmin_Reverts() public {
        vm.prank(user);
        vm.expectRevert("OilValidator: caller is not the admin");
        validator.addVariant("Shell", "Helix Ultra 5W-40");
    }

    /* ── registerProductBatch ───────────────────────────────────────────── */

    function test_RegisterProductBatch_AsAdmin() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32[] memory ids = new bytes32[](2);
        ids[0] = keccak256("ID1");
        ids[1] = keccak256("ID2");
        validator.registerProductBatch(ids, 1);
        assertEq(validator.totalRegisteredProducts(), 2);
    }

    function test_RegisterProductBatch_EmitsEvents() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = keccak256("ID1");

        vm.expectEmit(true, true, false, true);
        emit ProductRegistered(ids[0], 1, uint64(block.timestamp));
        validator.registerProductBatch(ids, 1);
    }

    function test_RegisterProductBatch_InvalidVariant_Reverts() public {
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = keccak256("ID1");
        vm.expectRevert("OilValidator: invalid variant ID");
        validator.registerProductBatch(ids, 1);
    }

    function test_RegisterProductBatch_EmptyBatch_Reverts() public {
        bytes32[] memory ids = new bytes32[](0);
        vm.expectRevert("OilValidator: empty batch");
        validator.registerProductBatch(ids, 1);
    }

    function test_RegisterProductBatch_Duplicate_Reverts() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = keccak256("ID1");
        validator.registerProductBatch(ids, 1);
        vm.expectRevert("OilValidator: product already registered");
        validator.registerProductBatch(ids, 1);
    }

    function test_RegisterProductBatch_NonAdmin_Reverts() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = keccak256("ID1");
        vm.prank(user);
        vm.expectRevert("OilValidator: caller is not the admin");
        validator.registerProductBatch(ids, 1);
    }

    /* ── validateProduct ────────────────────────────────────────────────── */

    function test_ValidateProduct_Success() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);

        vm.prank(user);
        validator.validateProduct(id, "Jakarta");

        (uint32 variantId, uint64 registeredAt, uint64 validatedAt, OilValidator.ProductStatus status, string memory scanLocation) = validator.products(id);
        assertEq(variantId, 1);
        assertGt(registeredAt, 0);
        assertGt(validatedAt, 0);
        assertEq(uint8(status), uint8(OilValidator.ProductStatus.USED));
        assertEq(scanLocation, "Jakarta");
        assertEq(validator.totalValidatedProducts(), 1);
    }

    function test_ValidateProduct_EmitsEvent() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);

        vm.prank(user);
        vm.expectEmit(true, true, false, true);
        emit ProductValidated(id, 1, uint64(block.timestamp), "Jakarta");
        validator.validateProduct(id, "Jakarta");
    }

    function test_ValidateProduct_Unregistered_Reverts() public {
        vm.prank(user);
        vm.expectRevert("OilValidator: product not available for validation");
        validator.validateProduct(keccak256("ID1"), "Jakarta");
    }

    function test_ValidateProduct_AlreadyUsed_Reverts() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);
        vm.prank(user);
        validator.validateProduct(id, "Jakarta");

        vm.prank(address(0xBEEF));
        vm.expectRevert("OilValidator: product not available for validation");
        validator.validateProduct(id, "Bandung");
    }

    function test_ValidateProduct_Revoked_Reverts() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);

        bytes32[] memory revokeIds = new bytes32[](1);
        revokeIds[0] = id;
        validator.emergencyRevoke(revokeIds);

        vm.prank(user);
        vm.expectRevert("OilValidator: product not available for validation");
        validator.validateProduct(id, "Jakarta");
    }

    /* ── transferOwnership ──────────────────────────────────────────────── */

    function test_TransferOwnership_Success() public {
        validator.transferOwnership(user);
        assertEq(validator.admin(), user);
    }

    function test_TransferOwnership_EmitsEvent() public {
        vm.expectEmit(true, true, false, false);
        emit OwnershipTransferred(admin, user);
        validator.transferOwnership(user);
    }

    function test_TransferOwnership_ZeroAddress_Reverts() public {
        vm.expectRevert("OilValidator: new admin is zero address");
        validator.transferOwnership(address(0));
    }

    function test_TransferOwnership_NonAdmin_Reverts() public {
        vm.prank(user);
        vm.expectRevert("OilValidator: caller is not the admin");
        validator.transferOwnership(user);
    }

    function test_TransferOwnership_NewAdminCanAct() public {
        validator.transferOwnership(user);
        vm.prank(user);
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        assertEq(validator.totalVariants(), 1);
    }

    function test_TransferOwnership_OldAdminCannotAct() public {
        validator.transferOwnership(user);
        vm.expectRevert("OilValidator: caller is not the admin");
        validator.addVariant("Shell", "Helix Ultra 5W-40");
    }

    /* ── emergencyRevoke ────────────────────────────────────────────────── */

    function test_EmergencyRevoke_Success() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);

        bytes32[] memory revokeIds = new bytes32[](1);
        revokeIds[0] = id;
        validator.emergencyRevoke(revokeIds);

        (,,, OilValidator.ProductStatus status,) = validator.products(id);
        assertEq(uint8(status), uint8(OilValidator.ProductStatus.REVOKED));
    }

    function test_EmergencyRevoke_EmitsEvent() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);

        bytes32[] memory revokeIds = new bytes32[](1);
        revokeIds[0] = id;

        vm.expectEmit(true, false, false, false);
        emit ProductRevoked(id);
        validator.emergencyRevoke(revokeIds);
    }

    function test_EmergencyRevoke_NonAdmin_Reverts() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);

        bytes32[] memory revokeIds = new bytes32[](1);
        revokeIds[0] = id;
        vm.prank(user);
        vm.expectRevert("OilValidator: caller is not the admin");
        validator.emergencyRevoke(revokeIds);
    }

    function test_EmergencyRevoke_Unregistered_Reverts() public {
        bytes32[] memory revokeIds = new bytes32[](1);
        revokeIds[0] = keccak256("ID1");
        vm.expectRevert("OilValidator: product not revocable");
        validator.emergencyRevoke(revokeIds);
    }

    function test_EmergencyRevoke_AlreadyUsed_Reverts() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);
        validator.validateProduct(id, "Jakarta");

        bytes32[] memory revokeIds = new bytes32[](1);
        revokeIds[0] = id;
        vm.expectRevert("OilValidator: product not revocable");
        validator.emergencyRevoke(revokeIds);
    }

    function test_EmergencyRevoke_AlreadyRevoked_Reverts() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);

        bytes32[] memory revokeIds = new bytes32[](1);
        revokeIds[0] = id;
        validator.emergencyRevoke(revokeIds);

        vm.expectRevert("OilValidator: product not revocable");
        validator.emergencyRevoke(revokeIds);
    }

    /* ── getProductDetails ──────────────────────────────────────────────── */

    function test_GetProductDetails_Unregistered() public view {
        (uint32 variantId, uint64 registeredAt, uint64 validatedAt, OilValidator.ProductStatus status, string memory scanLocation, string memory brand, string memory oilType) = validator.getProductDetails(keccak256("ID1"));
        assertEq(variantId, 0);
        assertEq(registeredAt, 0);
        assertEq(validatedAt, 0);
        assertEq(uint8(status), uint8(OilValidator.ProductStatus.UNREGISTERED));
        assertEq(scanLocation, "");
        assertEq(brand, "");
        assertEq(oilType, "");
    }

    function test_GetProductDetails_RegisteredProduct() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);

        (uint32 variantId, uint64 registeredAt, uint64 validatedAt, OilValidator.ProductStatus status, string memory scanLocation, string memory brand, string memory oilType) = validator.getProductDetails(id);
        assertEq(variantId, 1);
        assertGt(registeredAt, 0);
        assertEq(validatedAt, 0);
        assertEq(uint8(status), uint8(OilValidator.ProductStatus.NEW));
        assertEq(scanLocation, "");
        assertEq(brand, "Shell");
        assertEq(oilType, "Helix Ultra 5W-40");
    }

    function test_GetProductDetails_UsedProduct() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);
        vm.prank(user);
        validator.validateProduct(id, "Jakarta");

        (uint32 variantId, uint64 registeredAt, uint64 validatedAt, OilValidator.ProductStatus status, string memory scanLocation, string memory brand, string memory oilType) = validator.getProductDetails(id);
        assertEq(variantId, 1);
        assertGt(registeredAt, 0);
        assertGt(validatedAt, 0);
        assertEq(uint8(status), uint8(OilValidator.ProductStatus.USED));
        assertEq(scanLocation, "Jakarta");
        assertEq(brand, "Shell");
        assertEq(oilType, "Helix Ultra 5W-40");
    }

    function test_GetProductDetails_RevokedProduct() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32 id = keccak256("ID1");
        bytes32[] memory ids = new bytes32[](1);
        ids[0] = id;
        validator.registerProductBatch(ids, 1);

        bytes32[] memory revokeIds = new bytes32[](1);
        revokeIds[0] = id;
        validator.emergencyRevoke(revokeIds);

        (uint32 variantId, uint64 registeredAt, uint64 validatedAt, OilValidator.ProductStatus status, string memory scanLocation, string memory brand, string memory oilType) = validator.getProductDetails(id);
        assertEq(variantId, 1);
        assertGt(registeredAt, 0);
        assertEq(validatedAt, 0);
        assertEq(uint8(status), uint8(OilValidator.ProductStatus.REVOKED));
        assertEq(scanLocation, "");
        assertEq(brand, "Shell");
        assertEq(oilType, "Helix Ultra 5W-40");
    }

    /* ── getSystemStats ─────────────────────────────────────────────────── */

    function test_GetSystemStats_Initial() public view {
        (uint32 registered, uint32 validated) = validator.getSystemStats();
        assertEq(registered, 0);
        assertEq(validated, 0);
    }

    function test_GetSystemStats_AfterOperations() public {
        validator.addVariant("Shell", "Helix Ultra 5W-40");
        bytes32[] memory ids = new bytes32[](3);
        ids[0] = keccak256("ID1");
        ids[1] = keccak256("ID2");
        ids[2] = keccak256("ID3");
        validator.registerProductBatch(ids, 1);

        vm.prank(user);
        validator.validateProduct(ids[0], "Jakarta");

        (uint32 registered, uint32 validated) = validator.getSystemStats();
        assertEq(registered, 3);
        assertEq(validated, 1);
    }
}
