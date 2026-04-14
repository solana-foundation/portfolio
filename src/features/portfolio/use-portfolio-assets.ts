import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { normalizeDasResponse } from '@/features/portfolio/normalize'
import { portfolioKeys } from '@/features/portfolio/query-client'
import { useClient, useWallet } from '@/features/wallet'

export function usePortfolioAssets() {
  const { account, cluster } = useWallet()
  const { das } = useClient()
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
      if (!address) throw new Error('No wallet address')

      const response = await das
        .getAssetsByOwner({
          ownerAddress: address,
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
