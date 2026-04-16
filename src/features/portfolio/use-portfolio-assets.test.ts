import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/wallet', () => ({
  useWallet: vi.fn(),
  useClient: vi.fn(),
}))

import {
  dasGetAssetsByOwnerResponse,
  FIXTURE_OWNER,
} from '@/features/portfolio/__fixtures__/das-get-assets-by-owner'
import type { DasAssetList } from '@/features/portfolio/das-types'
import { normalizeDasResponse } from '@/features/portfolio/normalize'
import { portfolioKeys } from '@/features/portfolio/query-client'
import {
  portfolioAssetsQueryOptions,
  usePortfolioAssets,
} from '@/features/portfolio/use-portfolio-assets'
import { useClient, useWallet } from '@/features/wallet'

const MOCK_CLUSTER_DEVNET = {
  id: 'solana:devnet' as const,
  label: 'Devnet',
  url: 'https://api.devnet.solana.com',
}

const MOCK_CLUSTER_MAINNET = {
  id: 'solana:mainnet' as const,
  label: 'Mainnet',
  url: 'https://api.mainnet-beta.solana.com',
}

const ADDR_A = FIXTURE_OWNER
const ADDR_B = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'

type MockClient = {
  das: {
    getAssetsByOwner: ReturnType<typeof vi.fn>
  }
  rpc: Record<string, unknown>
}

function makeMockClient(resolveValue: unknown = dasGetAssetsByOwnerResponse): {
  client: MockClient
  getAssetsByOwner: ReturnType<typeof vi.fn>
  send: ReturnType<typeof vi.fn>
} {
  const send = vi.fn().mockResolvedValue(resolveValue)
  const getAssetsByOwner = vi.fn().mockReturnValue({ send })
  const client: MockClient = {
    das: { getAssetsByOwner },
    rpc: {},
  }
  return { client, getAssetsByOwner, send }
}

function setClient(client: MockClient) {
  vi.mocked(useClient).mockReturnValue(
    client as unknown as ReturnType<typeof useClient>,
  )
}

function setWallet(
  account: { address: string } | undefined,
  cluster:
    | typeof MOCK_CLUSTER_DEVNET
    | typeof MOCK_CLUSTER_MAINNET = MOCK_CLUSTER_DEVNET,
) {
  vi.mocked(useWallet).mockReturnValue({
    account,
    cluster,
    accountKeys: [],
    wallet: undefined,
    setAccount: () => {},
  } as unknown as ReturnType<typeof useWallet>)
}

/**
 * Builds a wrapper that exposes the QueryClient it wraps, so individual
 * tests can inspect cache state and spy on removeQueries.
 */
function createWrapper(): {
  wrapper: ({ children }: { children: ReactNode }) => ReactNode
  queryClient: QueryClient
} {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, queryClient }
}

describe('usePortfolioAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is idle when wallet is disconnected and does not call DAS', async () => {
    const { client, getAssetsByOwner } = makeMockClient()
    setClient(client)
    setWallet(undefined)

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => usePortfolioAssets(), { wrapper })

    // Allow any pending microtasks/effects to flush.
    await Promise.resolve()

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(getAssetsByOwner).not.toHaveBeenCalled()
  })

  it('fetches and returns a PortfolioAssetList when wallet is connected', async () => {
    const { client } = makeMockClient()
    setClient(client)
    setWallet({ address: ADDR_A })

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => usePortfolioAssets(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeTruthy()
    expect(result.current.data).toHaveProperty('items')
    expect(result.current.data).toHaveProperty('total')
    expect(Array.isArray(result.current.data?.items)).toBe(true)
  })

  it('calls DAS getAssetsByOwner with correct params including showFungible/showNativeBalance', async () => {
    const { client, getAssetsByOwner } = makeMockClient()
    setClient(client)
    setWallet({ address: ADDR_A })

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => usePortfolioAssets(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(getAssetsByOwner).toHaveBeenCalledTimes(1)
    expect(getAssetsByOwner).toHaveBeenCalledWith({
      ownerAddress: ADDR_A,
      page: 1,
      limit: 100,
      displayOptions: {
        showFungible: true,
        showNativeBalance: true,
      },
    })
  })

  it('passes an AbortSignal to .send() for query cancellation', async () => {
    const { client, send } = makeMockClient()
    setClient(client)
    setWallet({ address: ADDR_A })

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => usePortfolioAssets(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(send).toHaveBeenCalledTimes(1)
    const sendArg = send.mock.calls[0]?.[0] as
      | { abortSignal?: unknown }
      | undefined
    expect(sendArg).toBeDefined()
    expect(sendArg?.abortSignal).toBeInstanceOf(AbortSignal)
  })

  it('normalizes the DAS response via normalizeDasResponse', async () => {
    const { client } = makeMockClient(dasGetAssetsByOwnerResponse)
    setClient(client)
    setWallet({ address: ADDR_A })

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => usePortfolioAssets(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const expected = normalizeDasResponse(
      dasGetAssetsByOwnerResponse as DasAssetList,
    )
    expect(result.current.data).toEqual(expected)
  })

  it('caches data under portfolioKeys.assets(cluster.id, address)', async () => {
    const { client } = makeMockClient()
    setClient(client)
    setWallet({ address: ADDR_A })

    const { wrapper, queryClient } = createWrapper()
    const { result } = renderHook(() => usePortfolioAssets(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(
      portfolioKeys.assets('solana:devnet', ADDR_A),
    )
    expect(cached).toEqual(result.current.data)
  })

  it('removes the previous wallet cache entry when wallet address changes', async () => {
    const { client } = makeMockClient()
    setClient(client)
    setWallet({ address: ADDR_A })

    const { wrapper, queryClient } = createWrapper()
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')

    const { result, rerender } = renderHook(() => usePortfolioAssets(), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Switch to wallet B.
    setWallet({ address: ADDR_B })
    rerender()

    await waitFor(() => {
      const prefixA = portfolioKeys.byOwner('solana:devnet', ADDR_A)
      const matched = removeSpy.mock.calls.some((call) => {
        const arg = call[0] as { queryKey?: unknown } | undefined
        const qk = arg?.queryKey
        if (!Array.isArray(qk)) return false
        // Accept any matcher whose queryKey starts with wallet A's byOwner prefix.
        return prefixA.every((segment: unknown, i: number) => qk[i] === segment)
      })
      expect(matched).toBe(true)
    })
  })

  it('removes the last wallet cache entry when the wallet disconnects', async () => {
    const { client } = makeMockClient()
    setClient(client)
    setWallet({ address: ADDR_A })

    const { wrapper, queryClient } = createWrapper()
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')

    const { result, rerender } = renderHook(() => usePortfolioAssets(), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Disconnect.
    setWallet(undefined)
    rerender()

    await waitFor(() => {
      const prefixA = portfolioKeys.byOwner('solana:devnet', ADDR_A)
      const matched = removeSpy.mock.calls.some((call) => {
        const arg = call[0] as { queryKey?: unknown } | undefined
        const qk = arg?.queryKey
        if (!Array.isArray(qk)) return false
        return prefixA.every((segment: unknown, i: number) => qk[i] === segment)
      })
      expect(matched).toBe(true)
    })
  })

  it('also exports portfolioAssetsQueryOptions from the feature barrel', async () => {
    const barrel = await import('@/features/portfolio')
    expect(typeof barrel.portfolioAssetsQueryOptions).toBe('function')
  })

  it('stores a cluster change under a separate cache entry', async () => {
    const { client } = makeMockClient()
    setClient(client)
    setWallet({ address: ADDR_A }, MOCK_CLUSTER_DEVNET)

    const { wrapper, queryClient } = createWrapper()
    const { result, rerender } = renderHook(() => usePortfolioAssets(), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const devnetKey = portfolioKeys.assets('solana:devnet', ADDR_A)
    const devnetDataBefore = queryClient.getQueryData(devnetKey)
    expect(devnetDataBefore).toBeTruthy()

    // Rerender with a different cluster id for the same wallet address.
    setWallet({ address: ADDR_A }, MOCK_CLUSTER_MAINNET)
    rerender()

    // The old cluster's cache entry should still exist at its own key — the
    // new cluster uses a different key, so the devnet slot is not overwritten.
    const devnetDataAfter = queryClient.getQueryData(devnetKey)
    expect(devnetDataAfter).toEqual(devnetDataBefore)
  })
})

describe('portfolioAssetsQueryOptions', () => {
  it('returns an object with queryKey and queryFn', () => {
    const { client } = makeMockClient()
    const options = portfolioAssetsQueryOptions({
      address: ADDR_A,
      clusterId: 'solana:devnet',
      das: client.das as unknown as ReturnType<typeof useClient>['das'],
    })
    expect(options.queryKey).toBeDefined()
    expect(typeof options.queryFn).toBe('function')
  })

  it('uses the portfolioKeys.assets hierarchy for the queryKey', () => {
    const { client } = makeMockClient()
    const options = portfolioAssetsQueryOptions({
      address: ADDR_A,
      clusterId: 'solana:devnet',
      das: client.das as unknown as ReturnType<typeof useClient>['das'],
    })
    expect(options.queryKey).toEqual(
      portfolioKeys.assets('solana:devnet', ADDR_A),
    )
  })

  it('produces a stable queryKey across calls with the same inputs', () => {
    const { client } = makeMockClient()
    const a = portfolioAssetsQueryOptions({
      address: ADDR_A,
      clusterId: 'solana:devnet',
      das: client.das as unknown as ReturnType<typeof useClient>['das'],
    })
    const b = portfolioAssetsQueryOptions({
      address: ADDR_A,
      clusterId: 'solana:devnet',
      das: client.das as unknown as ReturnType<typeof useClient>['das'],
    })
    expect(a.queryKey).toEqual(b.queryKey)
  })

  it('differentiates queryKeys when the clusterId changes', () => {
    const { client } = makeMockClient()
    const devnet = portfolioAssetsQueryOptions({
      address: ADDR_A,
      clusterId: 'solana:devnet',
      das: client.das as unknown as ReturnType<typeof useClient>['das'],
    })
    const mainnet = portfolioAssetsQueryOptions({
      address: ADDR_A,
      clusterId: 'solana:mainnet',
      das: client.das as unknown as ReturnType<typeof useClient>['das'],
    })
    expect(devnet.queryKey).not.toEqual(mainnet.queryKey)
  })
})
