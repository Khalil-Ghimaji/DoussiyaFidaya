"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { declineAppointmentRequestAction } from "@/app/assistant/actions"

export function DeclineRequestForm({ requestId }: { requestId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleDecline() {
    if (!reason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for declining the request",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("reason", reason)

      const result = await declineAppointmentRequestAction(requestId, formData)

      if (result.success) {
        toast({
          title: "Request declined",
          description: "The appointment request has been declined.",
        })
        router.push("/assistant/appointments?status=pending")
      } else {
        throw new Error(result.error || "Failed to decline request")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to decline request",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-4">
      <h3 className="text-sm font-medium mb-2">Reason for Declining</h3>
      <Textarea
        placeholder="Please provide a reason for declining this appointment request"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="min-h-[100px]"
      />

      <CardFooter className="flex justify-end gap-4 w-full px-0 pt-4">
        <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleDecline} disabled={isSubmitting || !reason.trim()}>
          {isSubmitting ? "Declining..." : "Decline Request"}
        </Button>
      </CardFooter>
    </div>
  )
}

