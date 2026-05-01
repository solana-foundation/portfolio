import { BaseDropdown, useWalletUiDropdown } from '@wallet-ui/react'
import { cn } from '@/lib/utils'

const TRIGGER_DATA_SLOT = { 'data-slot': 'wallet-button-trigger' } as const

export function WalletButton({ className }: { className?: string }) {
  const { buttonProps, connected, dropdown, items } = useWalletUiDropdown()

  return (
    <BaseDropdown
      buttonProps={{
        ...buttonProps,
        ...TRIGGER_DATA_SLOT,
        className: cn(
          '!flex !items-center !justify-center',
          '!gap-2.5 !rounded-medium !border !border-white/10',
          '!px-6 !py-2.5',
          '!font-numeric !font-semibold !text-sm !text-foreground',
          '!bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(90deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.03)_100%)]',
          'max-w-[180px] truncate',
          className,
        ),
        leftSection: connected ? (
          <span
            data-slot="wallet-status-dot"
            aria-hidden
            className="inline-block size-2 shrink-0 rounded-[4px] border-2 border-success/15 bg-success"
          />
        ) : (
          buttonProps.leftSection
        ),
      }}
      dropdown={dropdown}
      items={items}
    />
  )
}
