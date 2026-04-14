import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@wallet-ui/react', async () => {
  const { createWalletUiMock } = await import('@/test/wallet-ui-mock')
  return createWalletUiMock()
})

import {
  SolanaProvider,
  useChain,
  useClient,
  useRpc,
  useWallet,
} from '@/features/wallet'

function RpcConsumer() {
  const { rpc, rpcSubscriptions } = useRpc()
  return (
    <div>
      <span data-testid="rpc">{rpc != null ? 'defined' : 'undefined'}</span>
      <span data-testid="rpc-subscriptions">
        {rpcSubscriptions != null ? 'defined' : 'undefined'}
      </span>
    </div>
  )
}

function ClientConsumer() {
  const client = useClient()
  return <span data-testid="client">{client != null ? 'defined' : 'null'}</span>
}

function DasConsumer() {
  const client = useClient()
  return (
    <span data-testid="das">
      {(client as unknown as { das?: unknown }).das != null
        ? 'defined'
        : 'undefined'}
    </span>
  )
}

function WalletHookConsumer() {
  const { account } = useWallet()
  return (
    <div>
      <span data-testid="wallet-hook">callable</span>
      <span data-testid="wallet-account">
        {account === undefined ? 'disconnected' : 'connected'}
      </span>
    </div>
  )
}

function ChainConsumer() {
  const chain = useChain()
  return (
    <div>
      <span data-testid="chain-id">{chain.id}</span>
      <span data-testid="chain-url">{chain.url}</span>
    </div>
  )
}

describe('SolanaProvider', () => {
  it('renders children', () => {
    render(
      <SolanaProvider>
        <p>child content</p>
      </SolanaProvider>,
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('provides rpc and rpcSubscriptions via useRpc', () => {
    render(
      <SolanaProvider>
        <RpcConsumer />
      </SolanaProvider>,
    )
    expect(screen.getByTestId('rpc')).toHaveTextContent('defined')
    expect(screen.getByTestId('rpc-subscriptions')).toHaveTextContent('defined')
  })

  it('provides a non-null plugin client via useClient', () => {
    render(
      <SolanaProvider>
        <ClientConsumer />
      </SolanaProvider>,
    )
    expect(screen.getByTestId('client')).toHaveTextContent('defined')
  })

  it('allows useWallet to be called without throwing', () => {
    render(
      <SolanaProvider>
        <WalletHookConsumer />
      </SolanaProvider>,
    )
    expect(screen.getByTestId('wallet-hook')).toHaveTextContent('callable')
  })

  it('provides disconnected wallet state by default', () => {
    render(
      <SolanaProvider>
        <WalletHookConsumer />
      </SolanaProvider>,
    )
    expect(screen.getByTestId('wallet-account')).toHaveTextContent(
      'disconnected',
    )
  })

  it('provides chain context with devnet default via useChain', () => {
    render(
      <SolanaProvider>
        <ChainConsumer />
      </SolanaProvider>,
    )
    expect(screen.getByTestId('chain-id')).toHaveTextContent('solana:devnet')
    expect(screen.getByTestId('chain-url')).toHaveTextContent(
      'https://api.devnet.solana.com',
    )
  })

  it('provides a client with das property via useClient', () => {
    render(
      <SolanaProvider>
        <DasConsumer />
      </SolanaProvider>,
    )
    expect(screen.getByTestId('das')).toHaveTextContent('defined')
  })
})
