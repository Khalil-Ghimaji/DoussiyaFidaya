"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CardFooter } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { scheduleAppointmentRequestAction } from "@/app/assistant/actions"

export function ScheduleRequestForm({ request }: { request: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock availability data (would come from API in real app)
  const availableSlots = [
    { startTime: "09:00", endTime: "09:30" },
    { startTime: "09:30", endTime: "10:00" },
    { startTime: "10:00", endTime: "10:30" },
    { startTime: "10:30", endTime: "11:00" },
    { startTime: "11:00", endTime: "11:30" },
    { startTime: "11:30", endTime: "12:00" },
    { startTime: "14:00", endTime: "14:30" },
    { startTime: "14:30", endTime: "15:00" },
    { startTime: "15:00", endTime: "15:30" },
    { startTime: "15:30", endTime: "16:00" },
  ]

  async function handleSchedule() {
    if (!selectedDate || !startTime || !endTime) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a date and time for the appointment",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("date", format(selectedDate, "yyyy-MM-dd"))
      formData.append("startTime", startTime)
      formData.append("endTime", endTime)

      const result = await scheduleAppointmentRequestAction(request._id, formData)

      if (result.success) {
        toast({
          title: "Appointment scheduled",
          description: "The appointment has been successfully scheduled.",
        })
        router.push("/assistant/appointments")
      } else {
        throw new Error(result.error || "Failed to schedule appointment")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to schedule appointment",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Date Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
            >
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Start Time</label>
          <Select value={startTime} onValueChange={setStartTime} disabled={!selectedDate}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {!selectedDate ? (
                <SelectItem value="none" disabled>
                  Select a date first
                </SelectItem>
              ) : (
                availableSlots.map((slot, index) => (
                  <SelectItem key={index} value={slot.startTime}>
                    {slot.startTime}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">End Time</label>
          <Select value={endTime} onValueChange={setEndTime} disabled={!startTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {!startTime ? (
                <SelectItem value="none" disabled>
                  Select start time first
                </SelectItem>
              ) : (
                availableSlots
                  .filter((slot) => slot.startTime > startTime)
                  .map((slot, index) => (
                    <SelectItem key={index} value={slot.endTime}>
                      {slot.endTime}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <CardFooter className="flex justify-end gap-4 w-full col-span-1 md:col-span-2 px-0 pt-4">
        <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSchedule} disabled={isSubmitting || !selectedDate || !startTime || !endTime}>
          {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
        </Button>
      </CardFooter>
    </div>
  )
}

