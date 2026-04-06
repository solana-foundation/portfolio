export {
  useWalletUiAccount as useWallet,
  WalletUiDropdown,
} from '@wallet-ui/react'
export { SolanaProvider } from './providers'
export { useClient, useRpc } from './rpc-context'

import { useWalletUi } from '@wallet-ui/react'

export function useChain() {
  const { cluster } = useWalletUi()
  return cluster
}
