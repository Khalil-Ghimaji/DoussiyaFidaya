"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { AssistantCard } from "@/components/doctor/assistant-card"

// Define the assistant type
type Assistant = {
  _id: string
  name: string
  email: string
  phone: string
  status: string
  createdAt: string
  permissions: {
    manageAppointments: boolean
    viewPatientDetails: boolean
    editPatientDetails: boolean
    cancelAppointments: boolean
    rescheduleAppointments: boolean
  }
}

export function AssistantsList({ initialAssistants }: { initialAssistants: Assistant[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter assistants based on search term
  const filteredAssistants = initialAssistants.filter(
    (assistant) =>
      assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistant.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un assistant..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Assistants list */}
      {filteredAssistants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssistants.map((assistant) => (
            <AssistantCard key={assistant._id} assistant={assistant} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              {searchTerm
                ? "Aucun assistant trouvé correspondant à votre recherche."
                : "Vous n'avez pas encore d'assistant. Ajoutez-en un pour commencer."}
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un assistant
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}

