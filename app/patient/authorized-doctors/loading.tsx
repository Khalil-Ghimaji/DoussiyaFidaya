import { Loader2 } from "lucide-react"

export default function AuthorizedDoctorsLoading() {
  return (
    <div className="container py-8">
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Chargement des médecins autorisés...</p>
        </div>
      </div>
    </div>
  )
}

