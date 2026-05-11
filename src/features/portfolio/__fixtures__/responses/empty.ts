/** Empty and zero-native-balance `getAssetsByOwner` response fixtures. */

/** Empty portfolio — no items, no native balance. */
export const dasEmptyResponse = {
  total: 0,
  limit: 1000,
  page: 1,
  items: [],
}

/** Native balance present but zero lamports — native SOL should be skipped. */
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
