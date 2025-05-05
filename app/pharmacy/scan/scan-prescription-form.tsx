"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, QrCode, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { scanPrescriptionAction } from "@/app/pharmacy/actions"

export function ScanPrescriptionForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [prescriptionCode, setPrescriptionCode] = useState("")
  const [activeTab, setActiveTab] = useState("manual")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prescriptionCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prescription code",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await scanPrescriptionAction({ code: prescriptionCode })

      if (result.success) {
        toast({
          title: "Prescription Found",
          description: `Found prescription for ${result.data.patientName}`,
        })
        router.push(`/pharmacy/prescriptions/${result.data.id}`)
      } else {
        throw new Error(result.error || "Failed to find prescription")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find prescription. Please check the code and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEnableCamera = () => {
    toast({
      title: "Camera Access Required",
      description: "Please allow camera access to scan prescription QR codes.",
    })
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="manual">
          <Search className="mr-2 h-4 w-4" />
          Manual Entry
        </TabsTrigger>
        <TabsTrigger value="scan">
          <QrCode className="mr-2 h-4 w-4" />
          QR Scanner
        </TabsTrigger>
      </TabsList>

      <TabsContent value="manual">
        <form onSubmit={handleScan} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="prescriptionCode">Prescription Code</Label>
            <Input
              id="prescriptionCode"
              value={prescriptionCode}
              onChange={(e) => setPrescriptionCode(e.target.value)}
              placeholder="Enter prescription code"
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Find Prescription"
            )}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="scan">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-muted aspect-square w-full max-w-sm flex items-center justify-center rounded-lg border border-dashed">
            <div className="text-center p-4">
              <QrCode className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Position the QR code within the frame to scan</p>
              <p className="text-xs text-muted-foreground mt-2">Camera access is required for scanning</p>
            </div>
          </div>

          <Button className="w-full max-w-sm" onClick={handleEnableCamera}>
            Enable Camera
          </Button>

          <p className="text-sm text-muted-foreground">
            Having trouble scanning? Try{" "}
            <button className="text-primary underline" onClick={() => setActiveTab("manual")}>
              manual entry
            </button>{" "}
            instead.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  )
}

