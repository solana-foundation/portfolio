import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PortfolioHeader } from './portfolio-header'

describe('PortfolioHeader', () => {
  it('renders the sentence-case "Net Worth" eyebrow without uppercase tracking', () => {
    render(<PortfolioHeader isPending={false} />)

    const eyebrow = screen.getByText('Net Worth')
    expect(eyebrow).toBeInTheDocument()
    expect(eyebrow.className).not.toMatch(/uppercase/)
    expect(eyebrow.className).not.toMatch(/tracking-/)
  })

  it('renders honest dash placeholders for total, SOL equivalent, 24h delta, and stat pills', () => {
    render(<PortfolioHeader isPending={false} />)

    // Total + two stat-pill values all render the same dollar dash.
    expect(screen.getAllByText('$—.——').length).toBeGreaterThanOrEqual(3)
    // SOL equivalent: numeric and unit are separate elements.
    expect(screen.getByText('—.——')).toBeInTheDocument()
    expect(screen.getByText('SOL')).toBeInTheDocument()
    // 24h delta dash, single element.
    expect(screen.getByText('+—.——%')).toBeInTheDocument()
  })

  it('renders the "since yesterday" suffix beside the 24h delta', () => {
    render(<PortfolioHeader isPending={false} />)

    expect(screen.getByText('since yesterday')).toBeInTheDocument()
  })

  it('renders both stat-pill labels: "Token Holdings" and "Staked"', () => {
    render(<PortfolioHeader isPending={false} />)

    expect(screen.getByText('Token Holdings')).toBeInTheDocument()
    expect(screen.getByText('Staked')).toBeInTheDocument()
  })

  it('renders the hide-values pill as a keyboard-focusable button', () => {
    render(<PortfolioHeader isPending={false} />)

    const pill = screen.getByRole('button', { name: /hide values/i })
    expect(pill).toBeInTheDocument()
    expect(pill.tagName).toBe('BUTTON')
  })

  it('does not throw when the hide-values pill is activated and onToggleHide is omitted', async () => {
    const user = userEvent.setup()
    render(<PortfolioHeader isPending={false} />)

    const pill = screen.getByRole('button', { name: /hide values/i })
    await user.click(pill)
  })

  it('invokes onToggleHide when the hide-values pill is clicked', async () => {
    const user = userEvent.setup()
    const onToggleHide = vi.fn()
    render(<PortfolioHeader isPending={false} onToggleHide={onToggleHide} />)

    await user.click(screen.getByRole('button', { name: /hide values/i }))

    expect(onToggleHide).toHaveBeenCalledTimes(1)
  })

  it('invokes onToggleHide when the hide-values pill receives Enter via keyboard', async () => {
    const user = userEvent.setup()
    const onToggleHide = vi.fn()
    render(<PortfolioHeader isPending={false} onToggleHide={onToggleHide} />)

    const pill = screen.getByRole('button', { name: /hide values/i })
    pill.focus()
    expect(pill).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(onToggleHide).toHaveBeenCalledTimes(1)
  })

  it('renders the skeleton with at least five blocks when isPending is true', () => {
    const { container } = render(<PortfolioHeader isPending={true} />)

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThanOrEqual(5)
    expect(screen.queryByText('Net Worth')).not.toBeInTheDocument()
  })
})
