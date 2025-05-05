import { DashboardLoading } from "@/components/assistant/dashboard-loading"

export default function Loading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <DashboardLoading />
    </div>
  )
}

