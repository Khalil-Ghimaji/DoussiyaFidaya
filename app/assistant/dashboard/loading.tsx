import { DashboardLoading } from "@/components/assistant/dashboard-loading"

export default function Loading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <DashboardLoading />
    </div>
  )
}

