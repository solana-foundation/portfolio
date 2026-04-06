import {
  createSolanaDevnet,
  createWalletUiConfig,
  WalletUi,
} from '@wallet-ui/react'
import type { ReactNode } from 'react'
import { RpcContextProvider } from './rpc-context'

const config = createWalletUiConfig({
  clusters: [createSolanaDevnet()],
})

export function SolanaProvider({ children }: { children: ReactNode }) {
  return (
    <WalletUi config={config}>
      <RpcContextProvider>{children}</RpcContextProvider>
    </WalletUi>
  )
}
