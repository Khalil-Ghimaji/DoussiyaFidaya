import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { executeGraphQL } from "@/lib/graphql-client"
import { MARK_NOTIFICATION_AS_READ } from "@/lib/graphql/mutations"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { notificationId } = await request.json()

        if (!notificationId) {
            return NextResponse.json({ error: "Missing notificationId" }, { status: 400 })
        }

        const result = await executeGraphQL(MARK_NOTIFICATION_AS_READ, { notificationId })

        return NextResponse.json({
            success: result.markNotificationAsRead.success,
            message: result.markNotificationAsRead.message,
        })
    } catch (error) {
        console.error("Error marking notification as read:", error)
        return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
    }
}
