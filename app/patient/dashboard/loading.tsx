import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="container py-8 flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Chargement de votre tableau de bord...</p>
      </div>
    </div>
  )
}

