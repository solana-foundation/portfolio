import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e']

export function TokenTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead className="text-right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SKELETON_KEYS.map((key) => (
          <TableRow key={key}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="ml-auto h-4 w-20" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
