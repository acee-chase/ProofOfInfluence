// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ImmortalityBadgeV2
 * @notice Enhanced badge collection with self-minting and platform minting capabilities.
 * Supports dual minting channels: user self-mint (mintSelf) and platform mint (mintFor).
 */
contract ImmortalityBadgeV2 is ERC721, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant BADGE_TYPE_TEST = 1;

    struct BadgeMeta {
        bool enabled;
        bool transferable;
        string uri;
    }

    mapping(uint256 => BadgeMeta) public badgeTypes;
    mapping(uint256 => uint256) private _badgeTypeOfToken;
    mapping(address => mapping(uint256 => bool)) private _hasBadge;
    mapping(address => bool) public hasMinted; // Track if address has minted (any badge type)
    
    uint256 public mintPrice; // Price in wei (can be 0 for free minting)
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    error BadgeDisabled(uint256 badgeType);
    error BadgeAlreadyClaimed(uint256 badgeType, address account);
    error BadgeTransferDisabled(uint256 badgeType);
    error AlreadyMinted(address account);
    error InsufficientPayment(uint256 required, uint256 provided);
    error ZeroAddress();

    event BadgeMinted(address indexed to, uint256 indexed badgeType, uint256 tokenId);
    event Minted(address indexed to, uint256 tokenId);

    constructor(
        string memory baseUri,
        address admin,
        uint256 _mintPrice
    ) ERC721("ImmortalityBadgeV2", "IMBADGE2") {
        require(admin != address(0), "Badge: admin zero");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _nextTokenId = 1;
        _baseTokenURI = baseUri;
        mintPrice = _mintPrice;
    }

    function configureBadgeType(uint256 badgeType, BadgeMeta calldata meta) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(badgeType != 0, "Badge: zero type");
        badgeTypes[badgeType] = meta;
    }

    function setBaseURI(string calldata newBaseUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = newBaseUri;
    }

    function setMintPrice(uint256 _mintPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        mintPrice = _mintPrice;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice User self-mint function - allows users to mint their own badge
     * @dev Requires payment if mintPrice > 0, and address must not have minted before
     */
    function mintSelf() external payable whenNotPaused nonReentrant returns (uint256 tokenId) {
        if (hasMinted[msg.sender]) {
            revert AlreadyMinted(msg.sender);
        }

        if (msg.value < mintPrice) {
            revert InsufficientPayment(mintPrice, msg.value);
        }

        // Use default badge type (BADGE_TYPE_TEST = 1)
        uint256 badgeType = BADGE_TYPE_TEST;
        BadgeMeta memory meta = badgeTypes[badgeType];
        
        if (!meta.enabled) {
            revert BadgeDisabled(badgeType);
        }

        if (_hasBadge[msg.sender][badgeType]) {
            revert BadgeAlreadyClaimed(badgeType, msg.sender);
        }

        tokenId = _nextTokenId++;
        _badgeTypeOfToken[tokenId] = badgeType;
        _hasBadge[msg.sender][badgeType] = true;
        hasMinted[msg.sender] = true;

        _safeMint(msg.sender, tokenId);
        emit BadgeMinted(msg.sender, badgeType, tokenId);
        emit Minted(msg.sender, tokenId);
    }

    /**
     * @notice Platform mint function - allows owner to mint badges for users
     * @param to Address to mint the badge to
     * @dev Only callable by owner, does not check hasMinted (allows platform to mint for anyone)
     */
    function mintFor(address to) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256 tokenId) {
        if (to == address(0)) {
            revert ZeroAddress();
        }

        uint256 badgeType = BADGE_TYPE_TEST;
        BadgeMeta memory meta = badgeTypes[badgeType];
        
        if (!meta.enabled) {
            revert BadgeDisabled(badgeType);
        }

        if (_hasBadge[to][badgeType]) {
            revert BadgeAlreadyClaimed(badgeType, to);
        }

        tokenId = _nextTokenId++;
        _badgeTypeOfToken[tokenId] = badgeType;
        _hasBadge[to][badgeType] = true;

        _safeMint(to, tokenId);
        emit BadgeMinted(to, badgeType, tokenId);
        emit Minted(to, tokenId);
    }

    /**
     * @notice Legacy mint function - maintained for backward compatibility
     */
    function mintBadge(address to, uint256 badgeType) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        BadgeMeta memory meta = badgeTypes[badgeType];
        if (!meta.enabled) {
            revert BadgeDisabled(badgeType);
        }
        if (to == address(0)) {
            revert ZeroAddress();
        }
        if (_hasBadge[to][badgeType]) {
            revert BadgeAlreadyClaimed(badgeType, to);
        }

        tokenId = _nextTokenId++;
        _badgeTypeOfToken[tokenId] = badgeType;
        _hasBadge[to][badgeType] = true;

        _safeMint(to, tokenId);
        emit BadgeMinted(to, badgeType, tokenId);
    }

    function hasBadge(address account, uint256 badgeType) external view returns (bool) {
        return _hasBadge[account][badgeType];
    }

    function badgeTypeOf(uint256 tokenId) external view returns (uint256) {
        return _badgeTypeOfToken[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        BadgeMeta memory meta = badgeTypes[_badgeTypeOfToken[tokenId]];
        if (bytes(meta.uri).length > 0) {
            return meta.uri;
        }
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            uint256 badgeType = _badgeTypeOfToken[tokenId];
            if (!badgeTypes[badgeType].transferable) {
                revert BadgeTransferDisabled(badgeType);
            }
        }
        return from;
    }

    /**
     * @notice Withdraw collected funds (if any)
     */
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
}
