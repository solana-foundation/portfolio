import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import {
  createPortfolioQueryClient,
  portfolioKeys,
} from '@/features/portfolio/query-client'

describe('createPortfolioQueryClient', () => {
  it('returns a QueryClient with the configured default options', () => {
    const client = createPortfolioQueryClient()

    expect(client).toBeInstanceOf(QueryClient)

    const queries = client.getDefaultOptions().queries
    expect(queries?.staleTime).toBe(30_000)
    expect(queries?.gcTime).toBe(300_000)
    expect(queries?.refetchOnWindowFocus).toBe(true)
    expect(queries?.retry).toBe(2)
  })

  it('configures retryDelay as exponential backoff capped at 10_000ms', () => {
    const client = createPortfolioQueryClient()
    const retryDelay = client.getDefaultOptions().queries?.retryDelay

    if (typeof retryDelay !== 'function') throw new Error('expected function')

    const err = new Error('test')
    expect(retryDelay(0, err)).toBe(Math.min(1000 * 2 ** 0, 10_000)) // 1000
    expect(retryDelay(1, err)).toBe(Math.min(1000 * 2 ** 1, 10_000)) // 2000
    expect(retryDelay(3, err)).toBe(Math.min(1000 * 2 ** 3, 10_000)) // 8000
    expect(retryDelay(4, err)).toBe(10_000) // 1000 * 16 -> capped
    expect(retryDelay(5, err)).toBe(10_000) // capped
  })
})

describe('portfolioKeys', () => {
  it('.all is the root prefix', () => {
    expect(portfolioKeys.all).toEqual(['portfolio'])
  })

  it('.byOwner(cluster, address) nests cluster and address under the root', () => {
    expect(portfolioKeys.byOwner('solana:devnet', 'ADDR1')).toEqual([
      'portfolio',
      'solana:devnet',
      'ADDR1',
    ])
  })

  it('.assets(cluster, address) extends the byOwner prefix with "assets"', () => {
    expect(portfolioKeys.assets('solana:devnet', 'ADDR1')).toEqual([
      'portfolio',
      'solana:devnet',
      'ADDR1',
      'assets',
    ])
  })

  it('different wallet addresses produce different assets keys', () => {
    const a = portfolioKeys.assets('solana:devnet', 'ADDR1')
    const b = portfolioKeys.assets('solana:devnet', 'ADDR2')
    expect(a).not.toEqual(b)
  })

  it('different clusters produce different assets keys', () => {
    const dev = portfolioKeys.assets('solana:devnet', 'ADDR1')
    const main = portfolioKeys.assets('solana:mainnet', 'ADDR1')
    expect(dev).not.toEqual(main)
  })
})
