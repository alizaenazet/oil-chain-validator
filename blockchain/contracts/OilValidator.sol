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
    event VariantAdded(uint32 indexed variantId, string brand, string oilType);

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

    /**
     * @notice Emitted when an admin revokes compromised product IDs
     * @param productHash keccak256 hash of the revoked product identifier
     */
    event ProductRevoked(bytes32 indexed productHash);

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

    /* ── Core Supply Chain Functions ────────────────────────────────────── */

    /**
     * @notice Adds a new lubricant variant to the master data
     * @param brand Brand name of the lubricant
     * @param oilType Oil classification/type
     * @dev Only callable by the admin. Auto-increments variantId.
     */
    function addVariant(
        string calldata brand,
        string calldata oilType
    ) external onlyAdmin {
        totalVariants += 1;
        variants[totalVariants] = Variant(brand, oilType);
        emit VariantAdded(totalVariants, brand, oilType);
    }

    /**
     * @notice Registers a batch of product IDs on-chain
     * @param productIds Array of keccak256-hashed product identifiers
     * @param variantId The variant ID these products belong to
     * @dev Only callable by the admin. Reverts if variantId is invalid or if any product is already registered.
     */
    function registerProductBatch(
        bytes32[] calldata productIds,
        uint256 variantId
    ) external onlyAdmin {
        require(productIds.length > 0, "OilValidator: empty batch");
        require(
            variantId > 0 && variantId <= totalVariants,
            "OilValidator: invalid variant ID"
        );

        uint32 vId = uint32(variantId);
        uint64 registeredAt = uint64(block.timestamp);

        for (uint256 i = 0; i < productIds.length; i++) {
            bytes32 productHash = productIds[i];
            require(
                products[productHash].status == ProductStatus.UNREGISTERED,
                "OilValidator: product already registered"
            );

            products[productHash] = Product({
                variantId: vId,
                registeredAt: registeredAt,
                validatedAt: 0,
                status: ProductStatus.NEW,
                scanLocation: ""
            });

            totalRegisteredProducts += 1;
            emit ProductRegistered(productHash, vId, registeredAt);
        }
    }

    /**
     * @notice Validates a product scan by a consumer
     * @param productId The keccak256-hashed product identifier
     * @param scanLocation Human-readable geographic location of the scan
     * @dev Public function. Reverts if product is not registered or already used/revoked.
     */
    function validateProduct(
        bytes32 productId,
        string calldata scanLocation
    ) external {
        Product storage product = products[productId];
        require(
            product.status == ProductStatus.NEW,
            "OilValidator: product not available for validation"
        );

        uint64 validatedAt = uint64(block.timestamp);
        product.status = ProductStatus.USED;
        product.validatedAt = validatedAt;
        product.scanLocation = scanLocation;

        totalValidatedProducts += 1;
        emit ProductValidated(
            productId,
            product.variantId,
            validatedAt,
            scanLocation
        );
    }

    /* ── Security & Incident Management ─────────────────────────────────── */

    /**
     * @notice Transfers administrative ownership to a new address
     * @param newAdmin Address of the new administrator
     * @dev Only callable by the current admin. Reverts if newAdmin is zero address.
     */
    function transferOwnership(address newAdmin) external onlyAdmin {
        require(
            newAdmin != address(0),
            "OilValidator: new admin is zero address"
        );
        address previousAdmin = admin;
        admin = newAdmin;
        emit OwnershipTransferred(previousAdmin, newAdmin);
    }

    /**
     * @notice Revokes compromised product IDs before they can be validated
     * @param compromisedIds Array of keccak256-hashed product identifiers to revoke
     * @dev Only callable by the admin. Only products with NEW status can be revoked.
     */
    function emergencyRevoke(
        bytes32[] calldata compromisedIds
    ) external onlyAdmin {
        for (uint256 i = 0; i < compromisedIds.length; i++) {
            bytes32 productHash = compromisedIds[i];
            Product storage product = products[productHash];

            require(
                product.status == ProductStatus.NEW,
                "OilValidator: product not revocable"
            );

            product.status = ProductStatus.REVOKED;
            emit ProductRevoked(productHash);
        }
    }

    /* ── Data Retrieval ─────────────────────────────────────────────────── */

    /**
     * @notice Returns detailed information for a single product
     * @param productId The keccak256-hashed product identifier
     * @return variantId The variant ID of the product
     * @return registeredAt Unix timestamp of registration
     * @return validatedAt Unix timestamp of validation (0 if not validated)
     * @return status Current lifecycle status of the product
     * @return scanLocation Human-readable geographic location of the scan (empty if not validated)
     * @return brand Brand name of the lubricant variant
     * @return oilType Oil classification/type of the variant
     */
    function getProductDetails(
        bytes32 productId
    )
        external
        view
        returns (
            uint32 variantId,
            uint64 registeredAt,
            uint64 validatedAt,
            ProductStatus status,
            string memory scanLocation,
            string memory brand,
            string memory oilType
        )
    {
        Product storage product = products[productId];
        Variant storage variant = variants[product.variantId];
        return (
            product.variantId,
            product.registeredAt,
            product.validatedAt,
            product.status,
            product.scanLocation,
            variant.brand,
            variant.oilType
        );
    }

    /**
     * @notice Returns high-level system statistics
     * @return registered Total number of products ever registered
     * @return validated Total number of products successfully validated by consumers
     */
    function getSystemStats()
        external
        view
        returns (uint32 registered, uint32 validated)
    {
        return (totalRegisteredProducts, totalValidatedProducts);
    }
}
