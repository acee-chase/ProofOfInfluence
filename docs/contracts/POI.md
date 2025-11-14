# POI Token

## Overview
- ERC20 token with 18 decimals named **Proof Of Influence (POI)**.
- Supports [EIP-2612](https://eips.ethereum.org/EIPS/eip-2612) permits for gasless approvals.
- Role based access control with `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, and `PAUSER_ROLE`.
- Transfers are pausable.
- Minting restricted to accounts with the minter role and burning supported via `ERC20Burnable`.

## Key Functions
- `mint(address account, uint256 amount)` – only callable by minters.
- `pause()` / `unpause()` – toggles transferability.
- Standard ERC20 interface plus `permit` from `ERC20Permit`.

## Deployment Notes
- Constructor arguments: `admin`, `initialRecipient`, `initialSupply`.
- Grant roles to additional operators with `grantRole` after deployment.
