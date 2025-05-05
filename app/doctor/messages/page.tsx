import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_DOCTOR_MESSAGES } from "@/lib/graphql/doctor-queries"
import { auth } from "@/lib/auth"
import { MessagesList } from "./messages-list"
import { NewMessageDialog } from "./new-message-dialog"

// Define message type
type Message = {
  _id: string
  subject: string
  content: string
  date: string
  isRead: boolean
  sender: {
    _id: string
    name: string
    role: string
    profileImage: string
  }
  recipient: {
    _id: string
    name: string
    role: string
  }
}

// Get messages from the server
async function getDoctorMessages() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    const data = await executeGraphQLServer<{ doctorMessages: Message[] }>(
      GET_DOCTOR_MESSAGES,
      { doctorId: session.user.id },
      {
        cache: "no-store", // Use SSR for up-to-date data
        tags: ["messages"],
      },
    )

    return data.doctorMessages
  } catch (error) {
    console.error("Error fetching doctor messages:", error)
    return []
  }
}

export default async function MessagesPage() {
  const messages = await getDoctorMessages()

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Gérez vos communications avec les patients et collègues</p>
        </div>

        <NewMessageDialog />
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement des messages...</p>
            </div>
          </div>
        }
      >
        <MessagesList initialMessages={messages} />
      </Suspense>
    </div>
  )
}

