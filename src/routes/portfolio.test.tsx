import type { Address } from '@solana/kit'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PortfolioAssetList } from '@/features/portfolio'
import { renderWithRouter } from '@/test/render'

// --- Wallet mock: control connection state per-test ---
let mockAccount: { address: string } | undefined

vi.mock('@wallet-ui/react', async () => {
  const { createWalletUiMock } = await import('@/test/wallet-ui-mock')
  const base = createWalletUiMock()
  return {
    ...base,
    useWalletUiAccount: () => ({
      ...base.useWalletUiAccount(),
      account: mockAccount,
    }),
  }
})

// --- Portfolio hook mock: control query state per-test ---
const mockRefetch = vi.fn()
let mockPortfolio: {
  data: PortfolioAssetList | undefined
  isPending: boolean
  isError: boolean
  error: Error | null
  refetch: ReturnType<typeof vi.fn>
}

vi.mock('@/features/portfolio', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/features/portfolio')>()
  return {
    ...original,
    usePortfolioAssets: () => mockPortfolio,
  }
})

beforeEach(() => {
  mockAccount = undefined
  mockPortfolio = {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch: mockRefetch,
  }
  mockRefetch.mockReset()
})

describe('/portfolio route', () => {
  it('renders an empty state with connect prompt when no wallet is connected', async () => {
    await renderWithRouter('/portfolio')

    expect(screen.getByText(/no wallet connected/i)).toBeInTheDocument()
    expect(screen.getByText(/connect a wallet/i)).toBeInTheDocument()

    const main = screen.getByRole('main')
    expect(
      within(main).getByRole('button', { name: /select wallet/i }),
    ).toBeInTheDocument()
  })

  it('renders skeletons and aria-busy while data is loading', async () => {
    mockAccount = { address: 'TestAddr123' }
    mockPortfolio = { ...mockPortfolio, isPending: true }

    await renderWithRouter('/portfolio')

    const tableRegion = screen.getByRole('region', { name: /token list/i })
    expect(tableRegion).toHaveAttribute('aria-busy', 'true')
    expect(within(tableRegion).queryByText('SOL')).not.toBeInTheDocument()
    // Header skeleton renders (no "Net Worth" text)
    expect(screen.queryByText(/net worth/i)).not.toBeInTheDocument()
    // Skeletons are present in both header and table regions
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThanOrEqual(2)
    // Table skeleton renders expected column headers
    expect(
      screen.getByRole('columnheader', { name: 'Token' }),
    ).toBeInTheDocument()
    // Screen reader loading announcement
    expect(screen.getByRole('status')).toHaveTextContent(/loading portfolio/i)
  })

  it('renders a destructive alert with retry when the fetch fails', async () => {
    mockAccount = { address: 'TestAddr123' }
    mockPortfolio = {
      ...mockPortfolio,
      isError: true,
      error: new Error('Network failure'),
    }

    await renderWithRouter('/portfolio')

    expect(screen.getByText(/net worth/i)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()

    const retryButton = screen.getByRole('button', { name: /retry/i })
    await userEvent.click(retryButton)
    expect(mockRefetch).toHaveBeenCalledOnce()
  })

  it('renders a no-tokens empty state when the wallet has zero assets', async () => {
    mockAccount = { address: 'TestAddr123' }
    mockPortfolio = {
      ...mockPortfolio,
      data: { items: [], total: 0 },
    }

    await renderWithRouter('/portfolio')

    expect(screen.getByText(/net worth/i)).toBeInTheDocument()
    expect(screen.getByText(/no tokens/i)).toBeInTheDocument()
    const tableRegion = screen.getByRole('region', { name: /token list/i })
    expect(within(tableRegion).queryByText('SOL')).not.toBeInTheDocument()
  })

  it('renders the header and token rows when the wallet has assets', async () => {
    mockAccount = { address: 'TestAddr123' }
    mockPortfolio = {
      ...mockPortfolio,
      data: {
        items: [
          {
            mint: 'So11111111111111111111111111111111111111112' as Address,
            symbol: 'SOL',
            name: 'Solana',
            imageUrl: 'https://example.com/sol.png',
            rawBalance: 5_000_000_000n,
            decimals: 9,
            kind: 'native',
          },
          {
            mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' as Address,
            symbol: 'USDC',
            name: 'USD Coin',
            imageUrl: 'https://example.com/usdc.png',
            rawBalance: 1_000_000n,
            decimals: 6,
            kind: 'spl-token',
          },
        ],
        total: 2,
      },
    }

    await renderWithRouter('/portfolio')

    expect(screen.getByText(/net worth/i)).toBeInTheDocument()
    const tableRegion = screen.getByRole('region', { name: /token list/i })
    expect(within(tableRegion).getByText('SOL')).toBeInTheDocument()
    expect(within(tableRegion).getByText('USDC')).toBeInTheDocument()
  })
})
