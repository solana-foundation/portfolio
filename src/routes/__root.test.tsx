import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '@/test/render'

vi.mock('@wallet-ui/react', async () => {
  const { createWalletUiMock } = await import('@/test/wallet-ui-mock')
  return createWalletUiMock()
})

// Store the query client reference captured by the spy component
let capturedQueryClient: unknown = null

vi.mock('@/routes/index', async () => {
  const { createFileRoute } = await import('@tanstack/react-router')
  const { useQueryClient: useQC } = await import('@tanstack/react-query')
  const { createElement } = await import('react')

  return {
    Route: createFileRoute('/')({
      component: () => {
        const qc = useQC()
        capturedQueryClient = qc
        return createElement('h1', null, 'Dashboard')
      },
    }),
  }
})

describe('Root layout', () => {
  it('renders nav links', async () => {
    await renderWithRouter('/')

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Portfolio' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Transactions' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Swap' })).toBeInTheDocument()
  })

  it('renders a wallet connection button in the header', async () => {
    await renderWithRouter('/')

    const header = screen.getByRole('banner')
    expect(within(header).getByRole('button')).toBeInTheDocument()
  })

  it('does not render a disabled wallet button in the header', async () => {
    await renderWithRouter('/')

    const header = screen.getByRole('banner')
    const buttons = within(header).getAllByRole('button')
    for (const button of buttons) {
      expect(button).not.toBeDisabled()
    }
  })

  it('renders routed child content', async () => {
    await renderWithRouter('/')

    expect(
      screen.getByRole('heading', { name: 'Dashboard', level: 1 }),
    ).toBeInTheDocument()
  })
})

describe('renderWithRouter QueryClientProvider', () => {
  it('provides QueryClient to components rendered via renderWithRouter', async () => {
    capturedQueryClient = null
    await renderWithRouter('/')

    expect(capturedQueryClient).not.toBeNull()
    expect(capturedQueryClient).toBeDefined()
  })
})
