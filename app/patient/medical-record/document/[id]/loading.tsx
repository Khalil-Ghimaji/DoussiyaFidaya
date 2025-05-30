import { Loader2 } from "lucide-react"

export default function DocumentLoading() {
  return (
    <div className="container py-8">
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Chargement du document...</p>
        </div>
      </div>
    </div>
  )
}

