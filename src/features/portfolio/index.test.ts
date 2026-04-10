import { describe, expect, it } from 'vitest'
import {
  createPortfolioQueryClient,
  das,
  formatBalance,
  normalizeDasResponse,
  portfolioKeys,
  usePortfolioAssets,
} from '@/features/portfolio'

describe('portfolio barrel export', () => {
  it('exports das as a function', () => {
    expect(typeof das).toBe('function')
  })

  it('exports formatBalance as a function', () => {
    expect(typeof formatBalance).toBe('function')
  })

  it('exports usePortfolioAssets as a function', () => {
    expect(typeof usePortfolioAssets).toBe('function')
  })

  it('exports createPortfolioQueryClient as a function', () => {
    expect(typeof createPortfolioQueryClient).toBe('function')
  })

  it('exports normalizeDasResponse as a function', () => {
    expect(typeof normalizeDasResponse).toBe('function')
  })

  it('exports portfolioKeys as an object with all, byOwner, and assets', () => {
    expect(typeof portfolioKeys).toBe('object')
    expect(portfolioKeys).toHaveProperty('all')
    expect(typeof portfolioKeys.byOwner).toBe('function')
    expect(typeof portfolioKeys.assets).toBe('function')
  })
})
