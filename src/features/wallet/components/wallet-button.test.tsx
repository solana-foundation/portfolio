import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockUseWalletUiDropdown = vi.fn()

vi.mock('@wallet-ui/react', () => ({
  useWalletUiDropdown: () => mockUseWalletUiDropdown(),
  BaseDropdown: ({
    buttonProps,
  }: {
    buttonProps: {
      label: ReactNode
      className?: string
      leftSection?: ReactNode
      [key: `data-${string}`]: string | undefined
    }
  }) => {
    const { label, leftSection, className, ...rest } = buttonProps
    return (
      <button type="button" className={className} {...rest}>
        {leftSection}
        {label}
      </button>
    )
  },
}))

import { WalletButton } from './wallet-button'

beforeEach(() => {
  mockUseWalletUiDropdown.mockReset()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('WalletButton', () => {
  it('renders the dropdown label as the button content', () => {
    mockUseWalletUiDropdown.mockReturnValue({
      buttonProps: { label: 'Select Wallet' },
      connected: false,
      dropdown: { open: () => {}, close: () => {}, api: {} },
      items: [],
    })

    render(<WalletButton />)

    expect(
      screen.getByRole('button', { name: /select wallet/i }),
    ).toBeInTheDocument()
  })

  it('exposes a data-slot anchor on the trigger', () => {
    mockUseWalletUiDropdown.mockReturnValue({
      buttonProps: { label: 'Select Wallet' },
      connected: false,
      dropdown: { open: () => {}, close: () => {}, api: {} },
      items: [],
    })

    render(<WalletButton />)

    expect(
      document.querySelector('[data-slot="wallet-button-trigger"]'),
    ).not.toBeNull()
  })

  it('renders a status-dot indicator when connected', () => {
    mockUseWalletUiDropdown.mockReturnValue({
      buttonProps: { label: '7xKX..gAsU' },
      connected: true,
      dropdown: { open: () => {}, close: () => {}, api: {} },
      items: [],
    })

    render(<WalletButton />)

    expect(
      document.querySelector('[data-slot="wallet-status-dot"]'),
    ).not.toBeNull()
    expect(
      screen.getByRole('button', { name: /7xKX..gAsU/ }),
    ).toBeInTheDocument()
  })

  it('does not render a status-dot indicator when disconnected', () => {
    mockUseWalletUiDropdown.mockReturnValue({
      buttonProps: { label: 'Select Wallet' },
      connected: false,
      dropdown: { open: () => {}, close: () => {}, api: {} },
      items: [],
    })

    render(<WalletButton />)

    expect(document.querySelector('[data-slot="wallet-status-dot"]')).toBeNull()
  })
})
