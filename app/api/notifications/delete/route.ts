import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { executeGraphQL } from "@/lib/graphql-client"
import { DELETE_NOTIFICATION } from "@/lib/graphql/mutations"

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { notificationId } = await request.json()

        if (!notificationId) {
            return NextResponse.json({ error: "Missing notificationId" }, { status: 400 })
        }

        const result = await executeGraphQL(DELETE_NOTIFICATION, { notificationId })

        return NextResponse.json({
            success: result.deleteNotification.success,
            message: result.deleteNotification.message,
        })
    } catch (error) {
        console.error("Error deleting notification:", error)
        return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
    }
}
