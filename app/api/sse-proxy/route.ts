import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value

    if (!token) {
        return new Response("Unauthorized", { status: 401 })
    }

    try {
        const response = await fetch(`${process.env.API_URL}/sse`, {
            headers: {
                Accept: "text/event-stream",
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        })

        if (!response.ok) {
            console.error(`Upstream SSE error: ${response.status} ${response.statusText}`)
            return new Response(`Upstream error: ${response.statusText}`, {
                status: response.status
            })
        }

        if (!response.body) {
            return new Response("No response body from upstream", { status: 502 })
        }

        // Create a readable stream that properly handles the SSE format
        const stream = new ReadableStream({
            start(controller) {
                const reader = response.body!.getReader()
                const decoder = new TextDecoder()
                let isClosed = false
                let buffer = ""

                const closeController = () => {
                    if (!isClosed) {
                        try {
                            controller.close()
                        } catch (closeError) {
                            console.log('Controller already closed:', closeError.message)
                        }
                        isClosed = true
                    }
                }

                const enqueueData = (data: string) => {
                    if (!isClosed) {
                        try {
                            controller.enqueue(new TextEncoder().encode(data))
                            return true
                        } catch (enqueueError) {
                            console.log('Controller closed during enqueue:', enqueueError.message)
                            isClosed = true
                            return false
                        }
                    }
                    return false
                }

                const pump = async () => {
                    try {
                        console.log('SSE proxy pump started')

                        while (!isClosed) {
                            const { done, value } = await reader.read()

                            if (done) {
                                console.log('Upstream SSE connection ended')
                                closeController()
                                break
                            }

                            if (isClosed) {
                                console.log('Controller closed, stopping pump')
                                break
                            }

                            // Decode the chunk
                            const chunk = decoder.decode(value, { stream: true })
                            buffer += chunk

                            // Process complete SSE messages (ending with \n\n)
                            let messageEndIndex = buffer.indexOf('\n\n')
                            while (messageEndIndex !== -1 && !isClosed) {
                                const message = buffer.substring(0, messageEndIndex + 2)
                                buffer = buffer.substring(messageEndIndex + 2)

                                console.log('Processing SSE message:', message.substring(0, 100) + '...')

                                if (!enqueueData(message)) {
                                    console.log('Failed to enqueue message, stopping pump')
                                    break
                                }

                                messageEndIndex = buffer.indexOf('\n\n')
                            }
                        }
                    } catch (error) {
                        console.error('SSE proxy pump error:', error)
                        if (!isClosed) {
                            try {
                                controller.error(error)
                            } catch (controllerError) {
                                console.log('Controller already closed, cannot send error:', controllerError.message)
                            }
                            isClosed = true
                        }
                    } finally {
                        console.log('SSE proxy pump cleanup')
                        // Clean up reader
                        try {
                            await reader.cancel()
                        } catch (cancelError) {
                            console.log('Reader cancel error:', cancelError.message)
                        }
                        closeController()
                    }
                }

                pump()
            },
            cancel(reason) {
                console.log('SSE proxy stream cancelled by client:', reason)
                try {
                    response.body?.cancel()
                } catch (cancelError) {
                    console.log('Error cancelling upstream:', cancelError.message)
                }
            }
        })

        return new Response(stream, {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control",
                "X-Accel-Buffering": "no", // Disable nginx buffering
            },
        })

    } catch (error) {
        console.error('SSE proxy error:', error)
        return new Response("Internal server error", { status: 500 })
    }
}