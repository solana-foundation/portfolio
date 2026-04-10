import { QueryClient } from '@tanstack/react-query'

export function createPortfolioQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      },
    },
  })
}

export const portfolioKeys = {
  all: ['portfolio'] as const,
  byOwner(cluster: string, address: string) {
    return ['portfolio', cluster, address] as const
  },
  assets(cluster: string, address: string) {
    return ['portfolio', cluster, address, 'assets'] as const
  },
}
