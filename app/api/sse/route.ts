import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const token = searchParams.get("token")

    if (!userId) {
        return new Response("Missing userId", { status: 400 })
    }

    // Verify authentication
    try {
        const session = await auth()
        if (!session?.user || session.user.id !== userId) {
            return new Response("Unauthorized", { status: 401 })
        }
    } catch (error) {
        return new Response("Authentication failed", { status: 401 })
    }

    // Create SSE stream
    const stream = new ReadableStream({
        start(controller) {
            // Store connection
            connections.set(userId, controller)

            // Send initial connection message
            controller.enqueue(
                `data: ${JSON.stringify({
                    type: "connected",
                    message: "SSE connection established",
                })}\n\n`,
            )

            // Send initial notifications (you would fetch these from your database)
            fetchInitialNotifications(userId).then((notifications) => {
                controller.enqueue(
                    `data: ${JSON.stringify({
                        type: "initial_notifications",
                        notifications,
                    })}\n\n`,
                )
            })

            // Send heartbeat every 30 seconds to keep connection alive
            const heartbeatInterval = setInterval(() => {
                try {
                    controller.enqueue(
                        `data: ${JSON.stringify({
                            type: "heartbeat",
                            timestamp: new Date().toISOString(),
                        })}\n\n`,
                    )
                } catch (error) {
                    console.error("Error sending heartbeat:", error)
                    clearInterval(heartbeatInterval)
                    connections.delete(userId)
                }
            }, 30000)

            // Cleanup on close
            request.signal.addEventListener("abort", () => {
                clearInterval(heartbeatInterval)
                connections.delete(userId)
                try {
                    controller.close()
                } catch (error) {
                    // Connection already closed
                }
            })
        },
        cancel() {
            connections.delete(userId)
        },
    })

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        },
    })
}

// Function to send notification to specific user
export function sendNotificationToUser(userId: string, notification: any) {
    const controller = connections.get(userId)
    if (controller) {
        try {
            controller.enqueue(
                `data: ${JSON.stringify({
                    type: "notification",
                    notification,
                })}\n\n`,
            )
        } catch (error) {
            console.error("Error sending notification to user:", error)
            connections.delete(userId)
        }
    }
}

// Function to broadcast notification to all connected users
export function broadcastNotification(notification: any) {
    connections.forEach((controller, userId) => {
        try {
            controller.enqueue(
                `data: ${JSON.stringify({
                    type: "notification",
                    notification,
                })}\n\n`,
            )
        } catch (error) {
            console.error("Error broadcasting notification:", error)
            connections.delete(userId)
        }
    })
}

// Mock function to fetch initial notifications
async function fetchInitialNotifications(userId: string) {
    // In a real implementation, you would fetch from your database
    // For now, return empty array
    return []
}
