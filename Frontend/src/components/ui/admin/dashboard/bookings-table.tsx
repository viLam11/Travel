"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/admin/table"
import { Badge } from "@/components/ui/admin/badge"
import { Button } from "@/components/ui/admin/button"
import { Eye, Edit, ArrowUpDown } from "lucide-react"

interface Booking {
  id: string
  guest: string
  room: string
  checkIn: string
  checkOut: string
  guests: number
  amount: string
  status: "confirmed" | "pending"
  source: string
}

export function BookingsTable({ data }: { data: Booking[] }) {
  const [sorting, setSorting] = useState<any[]>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns: ColumnDef<Booking>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 hover:text-gray-700"
          >
            Booking ID
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "guest",
        header: "Guest",
      },
      {
        accessorKey: "room",
        header: "Room",
      },
      {
        accessorKey: "checkIn",
        header: "Check-in",
      },
      {
        accessorKey: "checkOut",
        header: "Check-out",
      },
      {
        accessorKey: "guests",
        header: "Guests",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string
          return (
            <Badge
              className={`${
                status === "confirmed" ? "bg-gray-900 hover:bg-gray-800" : "bg-yellow-500 hover:bg-yellow-600"
              } text-white`}
            >
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: "source",
        header: "Source",
      },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <div className="flex gap-2">
            <button className="p-1 hover:bg-gray-100 rounded">
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
