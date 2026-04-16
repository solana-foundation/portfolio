import { TableCell, TableRow } from '@/components/ui/table'
import { formatBalance } from '../format'
import type { PortfolioAsset } from '../types'

type TokenRowProps = { asset: PortfolioAsset }

export function TokenRow({ asset }: TokenRowProps) {
  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <div className="flex items-center gap-3">
          {asset.imageUrl !== null ? (
            <img
              src={asset.imageUrl}
              alt={`${asset.name} icon`}
              className="size-8 rounded-full"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
            >
              {asset.symbol.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium">{asset.symbol}</span>
            <span className="text-xs text-muted-foreground">{asset.name}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatBalance(asset.rawBalance, asset.decimals)}
      </TableCell>
    </TableRow>
  )
}
