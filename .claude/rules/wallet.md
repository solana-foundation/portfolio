---
globs: src/features/wallet/**
---

# Wallet Feature Rules

- All `@wallet-ui/*`, `@solana/kit`, `@solana/kit-plugin-rpc`, and `@wallet-standard/*` imports are confined to this directory
- wallet-ui handles wallet UI (connect/disconnect, dropdown, address display, accessibility)
- We handle RPC via Kit plugin client (`createClient().use(rpc(...))`)
- The rest of the app imports from `@/features/wallet` barrel — never from library packages directly
