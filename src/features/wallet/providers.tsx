import {
  createSolanaDevnet,
  createWalletUiConfig,
  WalletUi,
} from '@wallet-ui/react'
import type { ReactNode } from 'react'
import { RpcContextProvider } from './rpc-context'

const rpcUrl = import.meta.env.VITE_RPC_URL as string | undefined
if (!rpcUrl) {
  console.warn(
    'VITE_RPC_URL is not set — falling back to public devnet RPC. ' +
      'Set VITE_RPC_URL to a Helius or other private endpoint for production use.',
  )
}

const config = createWalletUiConfig({
  clusters: [createSolanaDevnet(rpcUrl)],
})

export function SolanaProvider({ children }: { children: ReactNode }) {
  return (
    <WalletUi config={config}>
      <RpcContextProvider>{children}</RpcContextProvider>
    </WalletUi>
  )
}
