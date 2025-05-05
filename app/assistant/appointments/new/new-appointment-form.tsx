"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { createAppointmentAction } from "@/app/assistant/actions"

const formSchema = z.object({
  patientId: z.string().min(1, { message: "Patient is required" }),
  doctorId: z.string().min(1, { message: "Doctor is required" }),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  reason: z.string().min(1, { message: "Reason is required" }),
  notes: z.string().optional(),
})

export function NewAppointmentForm({ doctors }: { doctors: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock patient data (would come from API in real app)
  const patients = [
    { id: "patient-1", name: "John Smith" },
    { id: "patient-2", name: "Jane Doe" },
    { id: "patient-3", name: "Robert Johnson" },
  ].filter((patient) => patient.name.toLowerCase().includes(searchQuery.toLowerCase()))

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      reason: "",
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (key === "date") {
          formData.append(key, format(value, "yyyy-MM-dd"))
        } else {
          formData.append(key, value as string)
        }
      })

      const result = await createAppointmentAction(formData)

      if (result.success) {
        toast({
          title: "Appointment created",
          description: "The appointment has been successfully created.",
        })
        router.push("/assistant/appointments")
      } else {
        throw new Error(result.error || "Failed to create appointment")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to create appointment",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Selection */}
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <div className="space-y-2">
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-2"
                  />
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No patients found
                          </SelectItem>
                        ) : (
                          patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Doctor Selection */}
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Selection */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date)
                        setSelectedDate(date)
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDate}>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!form.watch("startTime")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {!form.watch("startTime") ? (
                          <SelectItem value="none" disabled>
                            Select start time first
                          </SelectItem>
                        ) : (
                          availableSlots
                            .filter((slot) => slot.startTime > form.watch("startTime"))
                            .map((slot, index) => (
                              <SelectItem key={index} value={slot.endTime}>
                                {slot.endTime}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Reason and Notes */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Visit</FormLabel>
              <FormControl>
                <Input placeholder="Brief reason for the appointment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information about the appointment"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

