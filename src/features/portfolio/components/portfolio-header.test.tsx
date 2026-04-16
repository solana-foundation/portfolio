import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PortfolioHeader } from './portfolio-header'

describe('PortfolioHeader', () => {
  it('renders the Net Worth eyebrow label', () => {
    render(<PortfolioHeader assetCount={3} isPending={false} />)
    expect(screen.getByText(/net worth/i)).toBeInTheDocument()
  })

  it('renders a pluralized asset count', () => {
    render(<PortfolioHeader assetCount={3} isPending={false} />)
    expect(screen.getByText('3 assets')).toBeInTheDocument()
  })

  it('renders the singular form when count is 1', () => {
    render(<PortfolioHeader assetCount={1} isPending={false} />)
    expect(screen.getByText('1 asset')).toBeInTheDocument()
  })

  it('renders placeholder dash tokens for USD and 24h change', () => {
    render(<PortfolioHeader assetCount={3} isPending={false} />)
    expect(screen.getByText('$—.——')).toBeInTheDocument()
    expect(screen.getByText('+—.——%')).toBeInTheDocument()
  })

  it('hides the asset count when assetCount is undefined', () => {
    render(<PortfolioHeader assetCount={undefined} isPending={false} />)
    expect(screen.queryByText(/asset/i)).not.toBeInTheDocument()
  })

  it('renders skeletons when isPending is true', () => {
    const { container } = render(
      <PortfolioHeader assetCount={undefined} isPending={true} />,
    )
    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/net worth/i)).not.toBeInTheDocument()
  })
})
