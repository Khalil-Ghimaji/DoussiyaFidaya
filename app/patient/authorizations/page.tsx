import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import PatientAuthorizationsContent from "./patient-authorizations-content"

export default async function PatientAuthorizationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/patient/authorizations")
  }

  return (
    <div className="container py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des autorisations</h1>
        <p className="text-muted-foreground">Gérez les médecins qui ont accès à votre dossier médical</p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement des autorisations...</p>
            </div>
          </div>
        }
      >
        <PatientAuthorizationsContent patientId={session.user.id} />
      </Suspense>
    </div>
  )
}

