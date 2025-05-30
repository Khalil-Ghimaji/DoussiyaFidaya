"use client"

import { useState } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { regenerateAssistantCredentials } from "@/app/doctor/actions"

export function CredentialsForm({ assistantId }: { assistantId: string }) {
  const { toast } = useToast()
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null)

  async function handleRegenerateCredentials() {
    try {
      setIsRegenerating(true)

      const result = await regenerateAssistantCredentials(assistantId)

      if (result.success) {
        setCredentials(result.credentials)
        toast({
          title: "Identifiants régénérés",
          description: "Les identifiants de l'assistant ont été régénérés avec succès.",
        })
      } else {
        throw new Error(result.message || "Une erreur est survenue")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de régénérer les identifiants. Veuillez réessayer.",
        variant: "destructive",
      })
      console.error("Error regenerating credentials:", error)
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {credentials && (
        <Alert className="mb-6">
          <AlertTitle>Nouveaux identifiants générés</AlertTitle>
          <AlertDescription>
            Veuillez les partager avec l'assistant de manière sécurisée. Ces informations ne seront plus visibles après
            avoir quitté cette page.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Nom d'utilisateur</label>
        <Input value={credentials ? credentials.username : "********"} readOnly />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Mot de passe</label>
        <Input type="text" value={credentials ? credentials.password : "********"} readOnly />
      </div>

      <div className="pt-4">
        <Button
          onClick={handleRegenerateCredentials}
          disabled={isRegenerating}
          variant="destructive"
          className="w-full"
        >
          {isRegenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Régénérer les identifiants
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Attention: Cette action invalidera les identifiants existants.
        </p>
      </div>
    </div>
  )
}

