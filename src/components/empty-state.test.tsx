import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No tokens found"
        description="Connect a wallet to view your portfolio"
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'No tokens found' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Connect a wallet to view your portfolio'),
    ).toBeInTheDocument()
  })
})
