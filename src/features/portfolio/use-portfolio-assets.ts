import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import type { DasRpc } from '@/features/portfolio/das-plugin'
import { normalizeDasResponse } from '@/features/portfolio/normalize'
import { portfolioKeys } from '@/features/portfolio/query-client'
import { useClient, useWallet } from '@/features/wallet'

export function usePortfolioAssets() {
  const { account, cluster } = useWallet()
  // TODO: Remove cast once das plugin is composed into the client in rpc-context.tsx
  // (SolanaClient type will then include `das` automatically via ReturnType inference)
  const { das } = useClient() as unknown as { das: DasRpc }
  const queryClient = useQueryClient()

  const address = account?.address
  const clusterId = cluster.id

  const prevRef = useRef<{ address: string; clusterId: string } | null>(null)

  useEffect(() => {
    const prev = prevRef.current

    if (prev && prev.address !== address) {
      queryClient.removeQueries({
        queryKey: portfolioKeys.byOwner(prev.clusterId, prev.address),
      })
    }

    prevRef.current = address ? { address, clusterId } : null
  }, [address, clusterId, queryClient])

  return useQuery({
    queryKey: portfolioKeys.assets(clusterId, address ?? ''),
    queryFn: async ({ signal }) => {
      const response = await das
        .getAssetsByOwner({
          ownerAddress: address as string,
          page: 1,
          limit: 100,
          displayOptions: {
            showFungible: true,
            showNativeBalance: true,
          },
        })
        .send({ abortSignal: signal })

      return normalizeDasResponse(response)
    },
    enabled: !!address,
  })
}
