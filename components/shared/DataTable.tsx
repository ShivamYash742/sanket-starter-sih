import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableProps<T> {
  columns: { key: keyof T | string; title: string; render?: (item: T) => React.ReactNode }[]
  data: T[]
}

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="relative w-full overflow-auto rounded-md border border-border">
      <Table className="w-full">
        <TableHeader className="sticky top-0 bg-muted/50 z-10">
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={String(col.key)} className="h-9 py-2 text-xs font-medium">
                {col.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={i} className="hover:bg-muted/30">
                {columns.map((col) => (
                  <TableCell key={String(col.key)} className="py-2 text-sm">
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key as string] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
