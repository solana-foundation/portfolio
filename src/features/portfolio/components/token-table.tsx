import { ArrowUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { PortfolioAsset } from '../types'
import { TokenRow } from './token-row'

type TokenTableProps = { assets: PortfolioAsset[] }

type Alignment = 'start' | 'end'

const COLUMNS: ReadonlyArray<{ label: string; align: Alignment }> = [
  { label: 'Asset', align: 'start' },
  { label: 'Balance', align: 'start' },
  { label: 'Price/24h', align: 'end' },
  { label: 'Value', align: 'end' },
]

export function TokenTableHead({
  label,
  align,
}: {
  label: string
  align: Alignment
}) {
  return (
    <TableHead
      className={cn(
        'flex h-auto min-w-px flex-1 items-center gap-1 whitespace-nowrap p-0 font-sans text-xs font-light text-muted-foreground',
        align === 'end' && 'justify-end',
      )}
    >
      {label}
      <ArrowUpDown
        data-slot="sort-indicator"
        aria-hidden="true"
        className="size-3.5"
      />
    </TableHead>
  )
}

export function TokenTable({ assets }: TokenTableProps) {
  return (
    <div
      data-slot="token-table"
      className="overflow-clip rounded-medium border border-border bg-background"
    >
      <Table>
        <TableHeader>
          <TableRow className="flex w-full items-center justify-between border-b-0 bg-card px-5 py-3 hover:bg-card">
            {COLUMNS.map(({ label, align }) => (
              <TokenTableHead key={label} label={label} align={align} />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TokenRow key={asset.mint} asset={asset} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
