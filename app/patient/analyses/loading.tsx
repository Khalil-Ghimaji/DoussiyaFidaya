import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
          <div className="rounded-md border">
            <div className="p-4">
              <Skeleton className="h-8 w-full mb-4" />
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full mb-2" />
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

