import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { getDoctorAuthorizationDetails } from "@/lib/server/patient-queries"
import { EditAuthorizationForm } from "./edit-authorization-form"

export default async function EditAuthorizationPage({ params }: { params: { id: string } }) {
  const authorizationId = params.id

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/patient/authorizations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux autorisations
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement des détails de l'autorisation...</p>
            </div>
          </div>
        }
      >
        <EditAuthorizationContent authorizationId={authorizationId} />
      </Suspense>
    </div>
  )
}

async function EditAuthorizationContent({ authorizationId }: { authorizationId: string }) {
  const authDetails = await getDoctorAuthorizationDetails(authorizationId)

  if (!authDetails) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Une erreur est survenue</h3>
            <p className="text-muted-foreground">Impossible de charger les détails de l'autorisation</p>
            <Button className="mt-4" asChild>
              <Link href="/patient/authorizations">Retour aux autorisations</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Modifier l'autorisation</h1>
      <EditAuthorizationForm authDetails={authDetails} />
    </div>
  )
}

