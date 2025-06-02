import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { executeGraphQL } from "@/lib/graphql-client"
import { MARK_ALL_NOTIFICATIONS_AS_READ } from "@/lib/graphql/mutations"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const result = await executeGraphQL(MARK_ALL_NOTIFICATIONS_AS_READ, {
            userId: session.user.id,
        })

        return NextResponse.json({
            success: result.markAllNotificationsAsRead.success,
            message: result.markAllNotificationsAsRead.message,
        })
    } catch (error) {
        console.error("Error marking all notifications as read:", error)
        return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
    }
}
