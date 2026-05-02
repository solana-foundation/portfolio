/**
 * DAS `getAssetsByOwner` fixtures. Mixed-source: `fungibleTokenItem` and
 * `impersonatorItem` are live-transcribed from Helius mainnet; everything
 * else is synthetic with placeholder mints and `example.invalid` URLs. Each
 * docstring marks its kind.
 *
 * Image-cascade branch: `fungibleTokenItem` (USDC) and `impersonatorItem`
 * both land in the image-mime `cdn_uri` branch. Integration parity
 * assertions depend on both rows resolving through the same branch.
 *
 * To refresh live items, query Helius getAssetsByOwner on mainnet
 * 5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9 and devnet
 * BoTsCAFmRe35ghBXN18kBz6AdmEJYXwMzDUwZXr4Pa9R, plus getAsset on USDC
 * (EPjFWdd5...), mainnet PYUSD (2b1kV6Dk...), and `Solana·`
 * (JEDuhcjUgxtnpD48Cfcs3FKokRAN6y81GFRvVQiVEaLs).
 *
 * Bigint literals reflect runtime types. No das-types imports — tests
 * type-check via assignment.
 */

/** Owner wallet address used across the fixture */
export const FIXTURE_OWNER = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV'

// ---------------------------------------------------------------------------
// Individual item fixtures (exported for targeted tests)
// ---------------------------------------------------------------------------

/**
 * USDC: well-known fungible token with full metadata, token_info.symbol, and
 * representative price_info fields.
 */
export const fungibleTokenItem = {
  interface: 'FungibleToken',
  id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  content: {
    $schema: 'https://schema.metaplex.com/nft1.0.json',
    json_uri: '',
    files: [
      {
        uri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        cdn_uri:
          'https://cdn.helius-rpc.com/cdn-cgi/image//https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        mime: 'image/png',
      },
    ],
    metadata: {
      name: 'USD Coin',
      symbol: 'USDC',
      description: 'USD-backed stablecoin by Circle',
    },
    links: {
      image:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      external_url: 'https://www.centre.io/',
    },
  },
  authorities: [
    {
      address: '2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2kPdBJig',
      scopes: ['full'],
    },
  ],
  compression: {
    eligible: false,
    compressed: false,
    data_hash: '',
    creator_hash: '',
    asset_hash: '',
    tree: '',
    seq: 0n,
    leaf_id: 0n,
  },
  grouping: [],
  royalty: {
    royalty_model: 'creators',
    target: null,
    percent: 0.0,
    basis_points: 0n,
    primary_sale_happened: false,
    locked: false,
  },
  creators: [],
  ownership: {
    frozen: false,
    delegated: false,
    delegate: null,
    ownership_model: 'token',
    owner: FIXTURE_OWNER,
  },
  supply: null,
  mutable: true,
  burnt: false,
  token_info: {
    symbol: 'USDC',
    balance: 50_000_000n,
    supply: 26_000_000_000_000_000n,
    decimals: 6,
    token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    associated_token_address: '3emsAVdmGKoHYRDjKMh81bFSynfEDMYmU1XNGqpwChFV',
    mint_authority: '2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2kPdBJig',
    freeze_authority: '3sNBr7kMccME5D55xNgsmYpZFLFL28izq2bVjMpiMoo7',
    price_info: {
      price_per_token: 0.99989,
      total_price: 49.9945,
      currency: 'USDC',
    },
  },
}

/**
 * Fungible asset (mSOL) with content metadata but no image links/files.
 * token_info has no symbol or price_info — tests metadata fallback chains.
 */
export const fungibleAssetItem = {
  interface: 'FungibleAsset',
  id: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  content: {
    $schema: 'https://schema.metaplex.com/nft1.0.json',
    json_uri: '',
    metadata: {
      name: 'Marinade staked SOL',
      symbol: 'mSOL',
      description: 'Represents staked SOL in Marinade Finance',
    },
    // No links or files — image should resolve to null via fallback chain
  },
  authorities: [],
  compression: {
    eligible: false,
    compressed: false,
    data_hash: '',
    creator_hash: '',
    asset_hash: '',
    tree: '',
    seq: 0n,
    leaf_id: 0n,
  },
  grouping: [],
  royalty: {
    royalty_model: 'creators',
    target: null,
    percent: 0.0,
    basis_points: 0n,
    primary_sale_happened: false,
    locked: false,
  },
  creators: [],
  ownership: {
    frozen: false,
    delegated: false,
    delegate: null,
    ownership_model: 'token',
    owner: FIXTURE_OWNER,
  },
  supply: null,
  mutable: true,
  burnt: false,
  token_info: {
    balance: 3_500_000_000n,
    decimals: 9,
    token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    associated_token_address: 'B9fC4iMofqZ1xrzPxjJgJfBQEmYgjQ4ArqFxVSiNYae7',
  },
}

/**
 * V1_NFT — should be filtered out by the normalizer (not a fungible asset).
 * Has full content but no token_info.
 */
export const nftItem = {
  interface: 'V1_NFT',
  id: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  content: {
    $schema: 'https://schema.metaplex.com/nft1.0.json',
    json_uri: 'https://arweave.net/abc123-metadata.json',
    files: [
      {
        uri: 'https://arweave.net/abc123',
        cdn_uri:
          'https://cdn.helius-rpc.com/cdn-cgi/image//https://arweave.net/abc123',
        mime: 'image/png',
      },
    ],
    metadata: {
      name: 'Mad Lads #1234',
      symbol: 'MAD',
      description: 'Mad Lads NFT collection',
      token_standard: 'NonFungible',
    },
    links: {
      image: 'https://arweave.net/abc123',
    },
  },
  authorities: [
    {
      address: 'HkjmgbH3thKKeuXFcE342uJYx3FBe3MtB1oU7HQbfbsm',
      scopes: ['full'],
    },
  ],
  compression: {
    eligible: false,
    compressed: false,
    data_hash: '',
    creator_hash: '',
    asset_hash: '',
    tree: '',
    seq: 0n,
    leaf_id: 0n,
  },
  grouping: [
    {
      group_key: 'collection',
      group_value: '7gCKeoTNBq8BvX5KQgeMiwbkBrtuxMcUN4JRMNfizTSK',
    },
  ],
  royalty: {
    royalty_model: 'creators',
    target: null,
    percent: 0.05,
    basis_points: 500n,
    primary_sale_happened: true,
    locked: false,
  },
  creators: [
    {
      address: 'BeVVXuvvGNmFBeK1bazfc2CYdvvJ5AFi4aNv75Ah7vo8',
      share: 100n,
      verified: true,
    },
  ],
  ownership: {
    frozen: false,
    delegated: false,
    delegate: null,
    ownership_model: 'single',
    owner: FIXTURE_OWNER,
  },
  supply: {
    print_max_supply: 0n,
    print_current_supply: 0n,
    edition_nonce: null,
  },
  mutable: true,
  burnt: false,
  // NFTs have no token_info
}

/**
 * Unknown token with no content (absent from response).
 * token_info uses a representative balance above MAX_SAFE_INTEGER and decimals
 * but no symbol or price_info. Tests defensive handling of missing metadata
 * and large integer values.
 */
export const unknownTokenItem = {
  interface: 'FungibleToken',
  id: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  // content is absent — not present in response for tokens with no metadata
  authorities: [],
  compression: {
    eligible: false,
    compressed: false,
    data_hash: '',
    creator_hash: '',
    asset_hash: '',
    tree: '',
    seq: 0n,
    leaf_id: 0n,
  },
  grouping: [],
  royalty: {
    royalty_model: 'creators',
    target: null,
    percent: 0.0,
    basis_points: 0n,
    primary_sale_happened: false,
    locked: false,
  },
  creators: [],
  ownership: {
    frozen: false,
    delegated: false,
    delegate: null,
    ownership_model: 'token',
    owner: FIXTURE_OWNER,
  },
  supply: null,
  mutable: true,
  burnt: false,
  token_info: {
    balance: 9_314_309_076_870_502_293n,
    decimals: 5,
    token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    associated_token_address: 'A1b2C3d4E5f6G7h8I9j0K1L2M3N4O5P6Q7R8S9T0U1V2',
  },
}

/**
 * Token with token_info but no balance field.
 * Should be skipped by the normalizer.
 */
export const noBalanceItem = {
  interface: 'FungibleToken',
  id: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
  content: {
    $schema: 'https://schema.metaplex.com/nft1.0.json',
    json_uri: '',
    metadata: {
      name: 'Lido Staked SOL',
      symbol: 'stSOL',
      description: 'Staked SOL via Lido',
    },
  },
  authorities: [],
  compression: {
    eligible: false,
    compressed: false,
    data_hash: '',
    creator_hash: '',
    asset_hash: '',
    tree: '',
    seq: 0n,
    leaf_id: 0n,
  },
  grouping: [],
  royalty: {
    royalty_model: 'creators',
    target: null,
    percent: 0.0,
    basis_points: 0n,
    primary_sale_happened: false,
    locked: false,
  },
  creators: [],
  ownership: {
    frozen: false,
    delegated: false,
    delegate: null,
    ownership_model: 'token',
    owner: FIXTURE_OWNER,
  },
  supply: null,
  mutable: true,
  burnt: false,
  token_info: {
    decimals: 9,
    // balance intentionally omitted — normalizer should skip this item
    token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  },
}

/**
 * Synthetic defensive case. The mainnet probe (see file header for re-run
 * details) found 46/46 fungibles with `files[]` had image/* mime; 2
 * fungibles had no `files[]`; 0 no-mime file cases observed. So this branch
 * is convention-based defense — the Metaplex "first file is the logo"
 * convention — rather than an observed real-world shape. Standalone export,
 * not in the integration response. If the cascade ever drops the no-mime
 * branch, drop this fixture with it.
 */
export const fungibleTokenWithCdnNoMime = {
  interface: 'FungibleToken',
  id: 'GmAxym41jdMQ6WG92btzgfizva7gLKbCTQKu8bWFNzPm',
  content: {
    files: [
      {
        uri: 'https://example.invalid/no-mime/logo.png',
        cdn_uri:
          'https://cdn.helius-rpc.com/cdn-cgi/image//https://example.invalid/no-mime/logo.png',
        // mime intentionally omitted — exercises the no-mime safety branch
      },
    ],
    metadata: {
      name: 'No-Mime Token',
      symbol: 'NMT',
    },
  },
  ownership: {
    owner: FIXTURE_OWNER,
  },
  token_info: {
    balance: 1_500_000n,
    decimals: 6,
    token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  },
}

/**
 * Synthetic defensive case. Non-image mime in `files[]` plus `links.image` —
 * asserts the cascade skips non-image files AND falls through to
 * `links.image` (a single "skip" assertion alone could be passed by
 * short-circuiting to `null`). Metaplex permits non-image media in
 * `files[]`; the value here is preventing `<img src="…video.mp4">`-style
 * mis-rendering. Standalone export, not in the integration response.
 */
export const fungibleTokenNonImageMime = {
  interface: 'FungibleToken',
  id: 'D4U95uqcHxx7sN6jmU8WdTkgK2dtHUDQhrMZthGPtDWJ',
  content: {
    files: [
      {
        uri: 'https://example.invalid/asset.bin',
        cdn_uri:
          'https://cdn.helius-rpc.com/cdn-cgi/image//https://example.invalid/asset.bin',
        mime: 'application/octet-stream',
      },
    ],
    metadata: {
      name: 'Binary Blob Token',
      symbol: 'BLOB',
    },
    links: {
      image: 'https://example.invalid/blob/icon.png',
    },
  },
  ownership: {
    owner: FIXTURE_OWNER,
  },
  token_info: {
    balance: 2_500_000n,
    decimals: 6,
    token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  },
}

/**
 * Synthetic. `metadata.name` carries U+202E (right-to-left override). Escape
 * form is intentional — pasted raw, the editor mirrors trailing text.
 */
export const fungibleTokenBidiName = {
  interface: 'FungibleToken',
  id: '39xw2rXMKoKtbxHAFeDReTixYSyZMxHbegDpPtyyy6oe',
  content: {
    metadata: {
      name: 'Safe\u202EBidiToken',
      symbol: 'BIDI',
    },
  },
  ownership: {
    owner: FIXTURE_OWNER,
  },
  token_info: {
    balance: 1_000n,
    decimals: 6,
    token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  },
}

/** Synthetic. `metadata.name` exceeds the 60-character display cap. */
export const fungibleTokenLongName = {
  interface: 'FungibleToken',
  id: '4ohXkT61ZXpHwQXJfPak4nCdZdnqm8oj3xp5ShLpJuxX',
  content: {
    metadata: {
      name: 'This is an excessively verbose token name designed to overflow the sixty-character display cap',
      symbol: 'LONG',
    },
  },
  ownership: {
    owner: FIXTURE_OWNER,
  },
  token_info: {
    balance: 1_000n,
    decimals: 6,
    token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  },
}

/**
 * Live-transcribed mainnet `Solana·` (U+00B7) Token-2022 impersonator.
 * Balance, supply, and URLs preserved from `getAssetsByOwner`. Lands in the
 * same image-mime `cdn_uri` cascade branch as `fungibleTokenItem`;
 * integration tests assert that parity.
 */
export const impersonatorItem = {
  interface: 'FungibleToken',
  id: 'JEDuhcjUgxtnpD48Cfcs3FKokRAN6y81GFRvVQiVEaLs',
  content: {
    $schema: 'https://schema.metaplex.com/nft1.0.json',
    json_uri:
      'https://ipfs.io/ipfs/bafkreifrmdpc5uvno2bylt5m3urzpjysfumhqpg2fm2ofcufatxegp2nfq',
    files: [
      {
        uri: 'https://ipfs.io/ipfs/bafkreieuhreooyhmof7vknrygudh2ua76s6wqjncs4zkdckv4fa3uu3gai',
        cdn_uri:
          'https://cdn.helius-rpc.com/cdn-cgi/image//https://ipfs.io/ipfs/bafkreieuhreooyhmof7vknrygudh2ua76s6wqjncs4zkdckv4fa3uu3gai',
        mime: 'image/png',
      },
    ],
    metadata: {
      description: 'Solana',
      name: 'Solana·',
      symbol: '$SOL',
    },
    links: {
      image:
        'https://ipfs.io/ipfs/bafkreieuhreooyhmof7vknrygudh2ua76s6wqjncs4zkdckv4fa3uu3gai',
    },
  },
  authorities: [],
  compression: {
    eligible: false,
    compressed: false,
    data_hash: '',
    creator_hash: '',
    asset_hash: '',
    tree: '',
    seq: 0n,
    leaf_id: 0n,
  },
  grouping: [],
  royalty: {
    royalty_model: 'creators',
    target: null,
    percent: 0.0,
    basis_points: 0n,
    primary_sale_happened: false,
    locked: false,
  },
  creators: [],
  ownership: {
    frozen: false,
    delegated: false,
    delegate: null,
    ownership_model: 'token',
    owner: FIXTURE_OWNER,
  },
  supply: null,
  mutable: true,
  burnt: false,
  token_info: {
    balance: 5_534_023_222_112_865_480n,
    supply: 16_602_069_666_338_596_440n,
    decimals: 6,
    token_program: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
    associated_token_address: 'HQrDHKEdw1iNj8doU41F3zjKgcahrYGRPzmzU7twpCeW',
  },
}

// ---------------------------------------------------------------------------
// Native balance fixture. Shape verified from live API; values are
// representative test data.
// ---------------------------------------------------------------------------

export const nativeBalanceFixture = {
  lamports: 2_500_000_000n,
  price_per_sol: 82.00442504882812,
  total_price: 205.01106262207031,
}

// ---------------------------------------------------------------------------
// Full response fixtures
// ---------------------------------------------------------------------------

/**
 * Realistic `getAssetsByOwner` response with mixed asset types and native
 * balance. Includes the impersonator and the bidi / long-name sanitization
 * cases so route-level tests exercise them through the rendered table. The
 * no-mime and non-image-mime defensive cases stay out of this response —
 * they are standalone exports for targeted Phase 1 unit tests.
 */
export const dasGetAssetsByOwnerResponse = {
  total: 8,
  limit: 1000,
  page: 1,
  items: [
    fungibleTokenItem,
    fungibleAssetItem,
    nftItem,
    unknownTokenItem,
    noBalanceItem,
    fungibleTokenBidiName,
    fungibleTokenLongName,
    impersonatorItem,
  ],
  nativeBalance: nativeBalanceFixture,
}

/**
 * Synthetic display fixture exercising the native + wSOL collision: the
 * wallet holds both native SOL and the wrapped-SOL SPL token, which share
 * the canonical `So11...112` mint and (per Metaplex convention) the symbol
 * 'SOL'. Visual disambiguation in the route-level test is by row count and
 * a duplicate-key spy, not by distinct symbol text.
 */
export const dasNativeAndWrappedSolResponse = {
  total: 1,
  limit: 1000,
  page: 1,
  items: [
    {
      interface: 'FungibleToken',
      id: 'So11111111111111111111111111111111111111112',
      content: {
        metadata: {
          name: 'Wrapped SOL',
          symbol: 'SOL',
        },
      },
      ownership: {
        owner: FIXTURE_OWNER,
      },
      token_info: {
        symbol: 'SOL',
        balance: 1_500_000_000n,
        decimals: 9,
        token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      },
    },
  ],
  nativeBalance: {
    lamports: 2_000_000_000n,
    price_per_sol: 82.0,
    total_price: 164.0,
  },
}

/**
 * Empty portfolio — no items, no native balance.
 */
export const dasEmptyResponse = {
  total: 0,
  limit: 1000,
  page: 1,
  items: [],
}

/**
 * Native balance present but zero lamports — native SOL should be skipped.
 */
export const dasZeroNativeBalanceResponse = {
  total: 0,
  limit: 1000,
  page: 1,
  items: [],
  nativeBalance: {
    lamports: 0n,
    price_per_sol: 82.0,
    total_price: 0,
  },
}

/**
 * Positive-balance fungible whose token_info omits `token_program`.
 * Drives the malformed-input path: the normalizer must throw after the
 * balance check and the existing per-asset try/catch must warn-and-skip.
 *
 * Not added to dasGetAssetsByOwnerResponse — it is consumed only by the
 * malformed-input normalizer test in isolation.
 */
export const fungibleMissingTokenProgramItem = {
  interface: 'FungibleToken',
  id: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  content: {
    metadata: { name: 'Missing Program Token', symbol: 'MISS' },
  },
  token_info: {
    balance: 1_000n,
    decimals: 6,
    // token_program intentionally omitted to exercise the malformed-input branch
  },
  ownership: {
    owner: FIXTURE_OWNER,
  },
}

/**
 * Positive-balance fungible whose token_info carries a syntactically valid
 * but unsupported `token_program` (the Memo Program). Same malformed-input
 * shape as the missing case but exercises the unknown-program branch
 * separately.
 *
 * Not added to dasGetAssetsByOwnerResponse — consumed only by its dedicated
 * malformed-input test in isolation.
 */
export const fungibleUnknownTokenProgramItem = {
  interface: 'FungibleToken',
  id: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
  content: {
    metadata: { name: 'Unknown Program Token', symbol: 'UNK' },
  },
  token_info: {
    balance: 2_000n,
    decimals: 9,
    token_program: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
  },
  ownership: {
    owner: FIXTURE_OWNER,
  },
}

/**
 * Fungible asset with content present but inner metadata/files/links objects
 * all empty. Observed in live DAS responses for some FungibleAssets — the
 * normalizer must fall back to the truncated address rather than surface
 * empty strings or throw.
 */
export const emptyMetadataItem = {
  id: 'BRLsMczKuaR5w9vSubF4j8HwEGGkZwyTDt1vEmptyMet',
  interface: 'FungibleAsset',
  content: {
    metadata: {},
    files: [],
    links: {},
  },
  token_info: {
    balance: 1000n,
    decimals: 6,
    token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  },
  ownership: {
    owner: FIXTURE_OWNER,
  },
}
