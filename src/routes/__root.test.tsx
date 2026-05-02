import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
        return createElement('h1', null, 'Root fixture')
      },
    }),
  }
})

describe('Root layout', () => {
  it('renders nav links in the redesigned order', async () => {
    await renderWithRouter('/')

    const header = screen.getByRole('banner')
    const navLinks = within(header).getAllByRole('link', {
      name: /^(Portfolio|Swap|Activity)$/,
    })

    expect(navLinks.map((link) => link.textContent)).toEqual([
      'Portfolio',
      'Swap',
      'Activity',
    ])
    expect(
      within(header).queryByRole('link', { name: 'Transactions' }),
    ).not.toBeInTheDocument()
  })

  it('keeps the route path /transactions for the Activity link', async () => {
    await renderWithRouter('/')

    const header = screen.getByRole('banner')
    const activityLinks = within(header).getAllByRole('link', {
      name: 'Activity',
    })
    for (const link of activityLinks) {
      expect(link).toHaveAttribute('href', '/transactions')
    }
  })

  it('points the brand wordmark to /portfolio', async () => {
    await renderWithRouter('/')

    const header = screen.getByRole('banner')
    const brandLink = within(header).getByRole('link', {
      name: /Solana Portfolio/i,
    })
    expect(brandLink).toHaveAttribute('href', '/portfolio')
  })

  it('renders the wordmark image with the expected dimensions', async () => {
    await renderWithRouter('/')

    const header = screen.getByRole('banner')
    const logo = within(header).getByAltText('Solana Portfolio')
    expect(logo.tagName).toBe('IMG')
    expect(logo).toHaveAttribute('width', '109')
    expect(logo).toHaveAttribute('height', '22')
  })

  it('renders a wallet connection button in the header', async () => {
    await renderWithRouter('/')

    const header = screen.getByRole('banner')
    expect(
      within(header).getByRole('button', { name: /select wallet/i }),
    ).toBeInTheDocument()
  })

  it('does not render a disabled wallet button in the header', async () => {
    await renderWithRouter('/')

    const header = screen.getByRole('banner')
    const buttons = within(header).getAllByRole('button')
    for (const button of buttons) {
      expect(button).not.toBeDisabled()
    }
  })

  it('renders a mobile nav toggle that expands nav links', async () => {
    const user = userEvent.setup()
    await renderWithRouter('/')

    const header = screen.getByRole('banner')
    const toggle = within(header).getByRole('button', {
      name: /open navigation/i,
    })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName(/close navigation/i)
  })

  it('renders routed child content', async () => {
    await renderWithRouter('/')

    expect(
      screen.getByRole('heading', { name: 'Root fixture', level: 1 }),
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
