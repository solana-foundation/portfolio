import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PortfolioAsset } from '../types'
import { TokenRow } from './token-row'

type TokenTableProps = { assets: PortfolioAsset[] }

export function TokenTable({ assets }: TokenTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead className="text-right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TokenRow key={asset.mint} asset={asset} />
        ))}
      </TableBody>
    </Table>
  )
}
