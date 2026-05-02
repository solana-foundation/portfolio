import { describe, expect, it } from 'vitest'
import {
  SolanaProvider,
  useChain,
  useClient,
  useRpc,
  useWallet,
  WalletButton,
  WalletUiDropdown,
} from '@/features/wallet'

describe('wallet barrel export', () => {
  it('exports SolanaProvider as a function', () => {
    expect(typeof SolanaProvider).toBe('function')
  })

  it('exports useWallet as a function', () => {
    expect(typeof useWallet).toBe('function')
  })

  it('exports useRpc as a function', () => {
    expect(typeof useRpc).toBe('function')
  })

  it('exports useClient as a function', () => {
    expect(typeof useClient).toBe('function')
  })

  it('exports useChain as a function', () => {
    expect(typeof useChain).toBe('function')
  })

  it('exports WalletUiDropdown as a function', () => {
    expect(typeof WalletUiDropdown).toBe('function')
  })

  it('exports WalletButton as a function', () => {
    expect(typeof WalletButton).toBe('function')
  })
})
