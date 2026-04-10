import { describe, expect, it } from 'vitest'
import { createWalletUiMock } from '@/test/wallet-ui-mock'

describe('createSolanaDevnet', () => {
  const mock = createWalletUiMock()

  it('returns a devnet cluster with the default URL when called without args', () => {
    const cluster = mock.createSolanaDevnet()

    expect(cluster).toEqual({
      id: 'solana:devnet',
      label: 'Devnet',
      url: 'https://api.devnet.solana.com',
    })
  })

  it('accepts an optional URL and returns a cluster with that URL', () => {
    const customUrl = 'https://my-custom-rpc.example.com'
    const cluster = mock.createSolanaDevnet(customUrl)

    expect(cluster.id).toBe('solana:devnet')
    expect(cluster.label).toBe('Devnet')
    expect(cluster.url).toBe(customUrl)
  })

  it('preserves id and label when a custom URL is provided', () => {
    const defaultCluster = mock.createSolanaDevnet()
    const customCluster = mock.createSolanaDevnet('https://other.rpc.com')

    expect(customCluster.id).toBe(defaultCluster.id)
    expect(customCluster.label).toBe(defaultCluster.label)
    expect(customCluster.url).not.toBe(defaultCluster.url)
  })
})
