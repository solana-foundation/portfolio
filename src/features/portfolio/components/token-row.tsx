import { TableCell, TableRow } from '@/components/ui/table'
import { formatTokenAmount } from '../format'
import type { PortfolioAsset } from '../types'
import { TokenIdentity } from './token-identity'

type TokenRowProps = { asset: PortfolioAsset }

export function TokenRow({ asset }: TokenRowProps) {
  return (
    <TableRow className="flex w-full items-center justify-between border-b-0 px-5 py-4 hover:bg-transparent">
      <TableCell className="flex-1 min-w-0 p-0 text-left">
        <TokenIdentity asset={asset} />
      </TableCell>
      <TableCell className="flex-1 min-w-0 p-0 text-center font-numeric text-sm font-medium text-foreground tabular-nums">
        {formatTokenAmount(asset.rawBalance, asset.decimals)}
      </TableCell>
      <TableCell className="flex-1 min-w-0 p-0 text-right" />
      <TableCell className="flex-1 min-w-0 p-0 text-right" />
    </TableRow>
  )
}
