/**
 * Edge-case item fixtures: defensive image-cascade branches, sanitization
 * inputs, the live-transcribed Solana· impersonator, and malformed-input cases
 * the normalizer must reject. Each item docstring marks live vs synthetic.
 */
import { FIXTURE_OWNER } from './owner'

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

/**
 * Positive-balance fungible whose token_info omits `token_program`. Drives the
 * malformed-input path: the normalizer must throw after the balance check and
 * the existing per-asset try/catch must warn-and-skip. Consumed only by the
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
 * Positive-balance fungible whose token_info carries a syntactically valid but
 * unsupported `token_program` (the Memo Program). Same malformed-input shape
 * as the missing case but exercises the unknown-program branch separately.
 * Consumed only by its dedicated malformed-input test in isolation.
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
