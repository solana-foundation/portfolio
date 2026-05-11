/**
 * Mainstream fungible-token item fixtures: a happy-path live USDC capture and
 * synthetic stand-ins for representative metadata shapes (mSOL, BONK, stSOL,
 * mainstream NFT-shape filtered out by the normalizer).
 */
import { FIXTURE_OWNER } from './owner'

/**
 * USDC: well-known fungible token with full metadata, token_info.symbol, and
 * representative price_info fields. Live-transcribed from Helius mainnet.
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
 * Synthetic.
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
 * Has full content but no token_info. Synthetic.
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
 * Unknown token with no content (absent from response). token_info uses a
 * representative balance above MAX_SAFE_INTEGER and decimals but no symbol or
 * price_info. Tests defensive handling of missing metadata and large integer
 * values. Synthetic.
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
 * Token with token_info but no balance field. Should be skipped by the
 * normalizer. Synthetic.
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
