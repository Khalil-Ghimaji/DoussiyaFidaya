"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ScanPrescriptionForm } from "./scan-prescription-form"

export default function ScanPrescriptionPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Scan Prescription</h1>
        <Button variant="outline" asChild>
          <Link href="/pharmacy">Back to Prescriptions</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Prescription</CardTitle>
          <CardDescription>Scan a prescription QR code or enter the prescription code manually</CardDescription>
        </CardHeader>
        <CardContent>
          <ScanPrescriptionForm />
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">Need help? Contact IT support at support@medicalsystem.com</p>
        </CardFooter>
      </Card>
    </div>
  )
}

