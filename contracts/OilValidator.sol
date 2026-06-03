// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title OilValidator
 * @notice Enterprise-grade anti-counterfeit lubricant validation system
 * @dev Manages registration and one-time consumer validation of lubricant products
 *      via securely hashed off-chain product IDs. Aggressively optimized for minimal
 *      gas consumption through strict storage packing in structs and state variables.
 */
contract OilValidator {

    /**
     * @notice Lifecycle status of a product instance
     * @dev Stored as uint8. Values must be kept sequential for predictable packing.
     */
    enum ProductStatus {
        UNREGISTERED,
        NEW,
        USED,
        REVOKED
    }

    /**
     * @notice Master data defining a lubricant variant (e.g., brand + oil type)
     * @dev Both members are dynamically-sized strings and therefore do not pack
     *      with adjacent members; each string occupies its own 32-byte storage slot.
     */
    struct Variant {
        string brand;
        string oilType;
    }

    /**
     * @notice Instance data for a single product unit
     * @dev Storage layout optimized to pack fixed-size fields into ONE 32-byte slot:
     *      - variantId  : uint32  → 4 bytes
     *      - registeredAt: uint64 → 8 bytes
     *      - validatedAt : uint64 → 8 bytes
     *      - status      : enum ProductStatus (uint8) → 1 byte
     *      Total fixed-size footprint: 21 bytes → Slot 0
     *      scanLocation is a dynamic string and occupies Slot 1 (pointer/length).
     */
    struct Product {
        uint32 variantId;
        uint64 registeredAt;
        uint64 validatedAt;
        ProductStatus status;
        string scanLocation;
    }

    /* ── Packed Admin & Statistics ──────────────────────────────────────── */

    /// @notice Contract administrator with exclusive write access
    address public admin;

    /// @notice Total master variants registered (supports up to ~4.3B variants)
    uint32 public totalVariants;

    /// @notice Total individual products registered (supports up to ~4.3B products)
    uint32 public totalRegisteredProducts;

    /// @notice Total products that have been validated by end consumers
    uint32 public totalValidatedProducts;

    /* ── Mappings ───────────────────────────────────────────────────────── */

    /// @notice Variant ID → master variant data
    mapping(uint32 => Variant) public variants;

    /// @notice Keccak256-hashed product ID → product instance data
    mapping(bytes32 => Product) public products;

    /* ── Events ─────────────────────────────────────────────────────────── */

    /**
     * @notice Emitted when a new lubricant variant is added
     * @param variantId Auto-incremented unique variant identifier
     * @param brand Brand name of the lubricant
     * @param oilType Oil classification/type
     */
    event VariantAdded(
        uint32 indexed variantId,
        string brand,
        string oilType
    );

    /**
     * @notice Emitted when a batch of products is registered on-chain
     * @param productHash keccak256 hash of the off-chain product identifier
     * @param variantId Variant the product belongs to
     * @param registeredAt Unix timestamp of registration (seconds since epoch)
     */
    event ProductRegistered(
        bytes32 indexed productHash,
        uint32 indexed variantId,
        uint64 registeredAt
    );

    /**
     * @notice Emitted when a consumer successfully validates a product scan
     * @param productHash keccak256 hash of the validated product identifier
     * @param variantId Variant of the validated product
     * @param validatedAt Unix timestamp of validation (seconds since epoch)
     * @param scanLocation Human-readable geographic location of the scan
     */
    event ProductValidated(
        bytes32 indexed productHash,
        uint32 indexed variantId,
        uint64 validatedAt,
        string scanLocation
    );

    /**
     * @notice Emitted when contract administrator rights are transferred
     * @param previousAdmin Address of the outgoing administrator
     * @param newAdmin Address of the incoming administrator
     */
    event OwnershipTransferred(
        address indexed previousAdmin,
        address indexed newAdmin
    );

    /* ── Constructor ────────────────────────────────────────────────────── */

    /**
     * @notice Sets the contract deployer as the initial administrator
     */
    constructor() {
        admin = msg.sender;
    }

    /* ── Modifiers ──────────────────────────────────────────────────────── */

    /**
     * @notice Restricts function execution to the current administrator
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "OilValidator: caller is not the admin");
        _;
    }
}
