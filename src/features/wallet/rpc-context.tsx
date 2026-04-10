import { createClient } from '@solana/kit'
import { rpc } from '@solana/kit-plugin-rpc'
import { useWalletUi } from '@wallet-ui/react'
import { createContext, type ReactNode, useContext, useMemo } from 'react'
import { das } from '@/features/portfolio/das-plugin'

function createSolanaClient(endpoint: string) {
  return createClient().use(rpc(endpoint)).use(das(endpoint))
}

type SolanaClient = ReturnType<typeof createSolanaClient>

const RpcCtx = createContext<SolanaClient | null>(null)

export function RpcContextProvider({ children }: { children: ReactNode }) {
  const { cluster } = useWalletUi()
  const endpoint = cluster.url

  const client = useMemo(() => createSolanaClient(endpoint), [endpoint])

  return <RpcCtx.Provider value={client}>{children}</RpcCtx.Provider>
}

export function useClient() {
  const client = useContext(RpcCtx)
  if (client == null) {
    throw new Error('useClient must be used within RpcContextProvider')
  }
  return client
}

export function useRpc() {
  const client = useClient()
  return { rpc: client.rpc, rpcSubscriptions: client.rpcSubscriptions }
}
