import { TableSkeleton } from "@/components/laboratory/table-skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
      </div>

      <TableSkeleton columns={7} rows={10} />
    </div>
  )
}

