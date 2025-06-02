"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { MessagesList } from "./messages-list"
import { NewMessageDialog } from "./new-message-dialog"

export default function MessagesPage() {
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
                <MessagesList />
            </Suspense>
        </div>
    )
}
