# TGESale

## Overview
- Handles primary sale of POI tokens in exchange for USDC.
- Supports tiered pricing with automatic advancement when a tier sells out.
- Enforces whitelist allocations via Merkle proofs, contribution bounds, blacklisting, and pausing.
- Raised USDC is withdrawable to a treasury account.

## Key Functions
- `configureTiers(uint256[] prices, uint256[] supplies)` – owner sets tier prices and allocations.
- `purchase(uint256 usdcAmount, bytes32[] proof)` – buyers acquire POI by providing USDC.
- `setContributionBounds(uint256 min, uint256 max)` – min/max purchase amounts.
- `setMerkleRoot(bytes32 root)` – updates whitelist.
- `setPaused(bool status)` / `setBlacklist(address,bool)` – sale controls.
- `withdraw()` / `withdrawPOI(uint256 amount)` – treasury withdrawals.

## Deployment Notes
- Constructor arguments: `poiToken`, `usdcToken`, `owner`, `treasury`.
- Tier price is denominated in 6-decimal USDC per 1 POI (18 decimals).
- Merkle proof array must append the user allocation as the last element.
