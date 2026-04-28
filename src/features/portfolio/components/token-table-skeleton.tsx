import { ArrowUpDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type Alignment = 'start' | 'end'

const COLUMNS: ReadonlyArray<{ label: string; align: Alignment }> = [
  { label: 'Asset', align: 'start' },
  { label: 'Balance', align: 'start' },
  { label: 'Price/24h', align: 'end' },
  { label: 'Value', align: 'end' },
]

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e']

export function TokenTableSkeleton() {
  return (
    <div
      data-slot="token-table"
      className="overflow-clip rounded-medium border border-border bg-background"
    >
      <Table>
        <TableHeader>
          <TableRow className="flex w-full items-center justify-between border-b-0 bg-card px-5 py-3 hover:bg-card">
            {COLUMNS.map(({ label, align }) => (
              <TableHead
                key={label}
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
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {SKELETON_KEYS.map((key) => (
            <TableRow
              key={key}
              className="flex w-full items-center justify-between border-b-0 px-5 py-4 hover:bg-transparent"
            >
              <TableCell className="flex min-w-px flex-1 items-center gap-2 p-0">
                <Skeleton className="size-4 rounded-full lg:size-5" />
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell className="flex min-w-px flex-1 items-center p-0">
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="flex min-w-px flex-1 items-center justify-end p-0">
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="flex min-w-px flex-1 items-center justify-end p-0">
                <Skeleton className="h-4 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
