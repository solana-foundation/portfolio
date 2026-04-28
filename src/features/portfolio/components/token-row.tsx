import { TableCell, TableRow } from '@/components/ui/table'
import { formatBalance } from '../format'
import type { PortfolioAsset } from '../types'

type TokenRowProps = { asset: PortfolioAsset }

export function TokenRow({ asset }: TokenRowProps) {
  return (
    <TableRow className="flex w-full items-center justify-between px-5 py-4">
      <TableCell className="flex-1 min-w-0 p-0 text-left">
        <div className="flex items-center gap-2">
          {asset.imageUrl !== null ? (
            <img
              src={asset.imageUrl}
              alt={`${asset.name} icon`}
              className="size-4 overflow-hidden rounded-full lg:size-5"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-4 items-center justify-center overflow-hidden rounded-full bg-muted text-[12px] font-light text-muted-foreground lg:size-5"
            >
              {asset.symbol.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="flex items-center gap-1 font-sans text-sm font-normal text-foreground">
            {asset.symbol}
            {/* Verified-badge slot — wired when token-identity work lands */}
            <span data-slot="verified-badge" aria-hidden="true" />
          </span>
        </div>
      </TableCell>
      <TableCell className="flex-1 min-w-0 p-0 text-center font-numeric text-sm font-medium text-foreground tabular-nums">
        {formatBalance(asset.rawBalance, asset.decimals)}
      </TableCell>
      <TableCell className="flex-1 min-w-0 p-0 text-right" />
      <TableCell className="flex-1 min-w-0 p-0 text-right" />
    </TableRow>
  )
}
