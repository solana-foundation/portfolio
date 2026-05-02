// Shared module-level mock for @wallet-ui/react.
// Mock shapes verified against @wallet-ui/react@4.0.2 installed types.
//
// The mock enforces provider presence: hooks and components throw if rendered
// outside WalletUi, mirroring real wallet-ui behavior. This validates that
// our SolanaProvider correctly mounts the wallet-ui provider.

import { createContext, type ReactNode, useContext } from 'react'

const WalletUiMounted = createContext(false)

function useRequireProvider(hookName: string) {
  const mounted = useContext(WalletUiMounted)
  if (!mounted) {
    throw new Error(`${hookName} must be used within WalletUiContextProvider`)
  }
}

const MOCK_CLUSTER = {
  id: 'solana:devnet' as const,
  label: 'Devnet',
  url: 'https://api.devnet.solana.com',
}

export function createWalletUiMock() {
  return {
    WalletUi: ({ children }: { children: ReactNode; config: unknown }) => (
      <WalletUiMounted.Provider value={true}>
        {children}
      </WalletUiMounted.Provider>
    ),
    WalletUiContextProvider: ({ children }: { children: ReactNode }) => (
      <WalletUiMounted.Provider value={true}>
        {children}
      </WalletUiMounted.Provider>
    ),
    WalletUiDropdown: () => {
      useRequireProvider('WalletUiDropdown')
      return <button type="button">Select Wallet</button>
    },
    useWalletUiDropdown: () => {
      useRequireProvider('useWalletUiDropdown')
      return {
        buttonProps: { label: 'Select Wallet' },
        connected: false,
        dropdown: { open: () => {}, close: () => {}, api: {} },
        items: [],
      }
    },
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
    createWalletUiConfig: (props: unknown) => props,
    createSolanaDevnet: (url?: string) =>
      url ? { ...MOCK_CLUSTER, url } : MOCK_CLUSTER,
    useWalletUi: () => {
      useRequireProvider('useWalletUi')
      return {
        account: undefined,
        accountKeys: [],
        wallet: undefined,
        wallets: [],
        connected: false,
        copy: () => {},
        connect: () => {},
        disconnect: () => {},
        cluster: MOCK_CLUSTER,
      }
    },
    useWalletUiAccount: () => {
      useRequireProvider('useWalletUiAccount')
      return {
        account: undefined,
        setAccount: () => {},
        accountKeys: [],
        cluster: MOCK_CLUSTER,
        wallet: undefined,
      }
    },
    useWalletUiSigner: () => {
      useRequireProvider('useWalletUiSigner')
      return {}
    },
  }
}
