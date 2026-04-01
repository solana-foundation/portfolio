import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/render'

describe('Root layout', () => {
  it('renders nav links and connect wallet button', async () => {
    await renderWithRouter('/')

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Portfolio' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Transactions' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Swap' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Connect Wallet' }),
    ).toBeInTheDocument()

    // Routed child content from the index route renders inside the layout
    expect(
      screen.getByRole('heading', { name: 'Dashboard', level: 1 }),
    ).toBeInTheDocument()
  })
})
