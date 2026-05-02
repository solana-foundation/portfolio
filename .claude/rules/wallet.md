---
globs: src/features/wallet/**
---

# Wallet Feature Rules

- `@wallet-ui/*`, `@solana/kit-plugin-rpc`, and `@wallet-standard/*` imports are confined to this directory
- `@solana/kit` is the core Solana SDK — used project-wide by any feature that needs addresses, RPC types, or plugin primitives
- wallet-ui handles wallet UI (connect/disconnect, dropdown, address display, accessibility)
- We handle RPC via Kit plugin client (`createClient().use(rpc(...))`)
- The rest of the app imports wallet hooks from `@/features/wallet` barrel — never from library packages directly
- wallet-ui sets the dropdown positioner's z-index inline (via `--z-index`), so a non-important `z-*` utility doesn't beat it. Page-level stacking fixes target `[data-wu="base-dropdown-wrapper"]` from the parent cluster that owns the wallet surface and use a scoped important utility (e.g. `!z-50`).
