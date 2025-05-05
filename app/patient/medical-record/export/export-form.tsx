"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { FileDown, Shield, AlertTriangle, FileText, FileIcon as FilePdf, FileJson } from "lucide-react"
import { exportMedicalRecord } from "@/app/patient/actions"

export function ExportMedicalRecordForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState("pdf")
  const [selectedSections, setSelectedSections] = useState({
    personalInfo: true,
    medicalHistory: true,
    currentTreatments: true,
    cardiology: true,
    neurology: true,
    pneumology: true,
    generalMedicine: true,
    ophthalmology: true,
    orthopedics: true,
    prescriptions: true,
    labResults: true,
  })
  const [encrypt, setEncrypt] = useState(false)

  const handleSectionChange = (section: string, checked: boolean) => {
    setSelectedSections({
      ...selectedSections,
      [section]: checked,
    })
  }

  const handleExport = async () => {
    // Vérifier qu'au moins une section est sélectionnée
    const hasSelectedSection = Object.values(selectedSections).some((value) => value)
    if (!hasSelectedSection) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une section à exporter",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      // Convert selectedSections object to array of section names
      const sections = Object.entries(selectedSections)
        .filter(([_, isSelected]) => isSelected)
        .map(([section]) => section)

      const response = await exportMedicalRecord(exportFormat, encrypt, sections)

      if (response.success && response.downloadUrl) {
        toast({
          title: "Succès",
          description: "Votre dossier médical a été exporté avec succès",
        })
        // In a real app, we would redirect to the download URL or trigger a download
        window.open(response.downloadUrl, "_blank")
      } else {
        toast({
          title: "Erreur",
          description: response.message || "Une erreur est survenue lors de l'export",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive",
      })
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Format d'export</CardTitle>
            <CardDescription>Choisissez le format de votre dossier médical exporté</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center">
                  <FilePdf className="mr-2 h-4 w-4" />
                  PDF (Document portable)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center">
                  <FileJson className="mr-2 h-4 w-4" />
                  JSON (Format structuré)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="txt" id="txt" />
                <Label htmlFor="txt" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  TXT (Texte brut)
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>Options de sécurité pour votre export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="encrypt" checked={encrypt} onCheckedChange={(checked) => setEncrypt(!!checked)} />
              <Label htmlFor="encrypt" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Chiffrer le fichier exporté
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Le fichier exporté sera protégé par un mot de passe que vous devrez conserver en lieu sûr.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sections à exporter</CardTitle>
          <CardDescription>Sélectionnez les sections de votre dossier médical à inclure dans l'export</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personalInfo"
                  checked={selectedSections.personalInfo}
                  onCheckedChange={(checked) => handleSectionChange("personalInfo", !!checked)}
                />
                <Label htmlFor="personalInfo">Informations personnelles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medicalHistory"
                  checked={selectedSections.medicalHistory}
                  onCheckedChange={(checked) => handleSectionChange("medicalHistory", !!checked)}
                />
                <Label htmlFor="medicalHistory">Antécédents médicaux</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="currentTreatments"
                  checked={selectedSections.currentTreatments}
                  onCheckedChange={(checked) => handleSectionChange("currentTreatments", !!checked)}
                />
                <Label htmlFor="currentTreatments">Traitements en cours</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cardiology"
                  checked={selectedSections.cardiology}
                  onCheckedChange={(checked) => handleSectionChange("cardiology", !!checked)}
                />
                <Label htmlFor="cardiology">Cardiologie</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="neurology"
                  checked={selectedSections.neurology}
                  onCheckedChange={(checked) => handleSectionChange("neurology", !!checked)}
                />
                <Label htmlFor="neurology">Neurologie</Label>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pneumology"
                  checked={selectedSections.pneumology}
                  onCheckedChange={(checked) => handleSectionChange("pneumology", !!checked)}
                />
                <Label htmlFor="pneumology">Pneumologie</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generalMedicine"
                  checked={selectedSections.generalMedicine}
                  onCheckedChange={(checked) => handleSectionChange("generalMedicine", !!checked)}
                />
                <Label htmlFor="generalMedicine">Médecine générale</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ophthalmology"
                  checked={selectedSections.ophthalmology}
                  onCheckedChange={(checked) => handleSectionChange("ophthalmology", !!checked)}
                />
                <Label htmlFor="ophthalmology">Ophtalmologie</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="orthopedics"
                  checked={selectedSections.orthopedics}
                  onCheckedChange={(checked) => handleSectionChange("orthopedics", !!checked)}
                />
                <Label htmlFor="orthopedics">Orthopédie</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prescriptions"
                  checked={selectedSections.prescriptions}
                  onCheckedChange={(checked) => handleSectionChange("prescriptions", !!checked)}
                />
                <Label htmlFor="prescriptions">Ordonnances</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="labResults"
                  checked={selectedSections.labResults}
                  onCheckedChange={(checked) => handleSectionChange("labResults", !!checked)}
                />
                <Label htmlFor="labResults">Résultats d'analyses</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Information importante</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Votre dossier médical contient des informations sensibles. Assurez-vous de stocker le fichier exporté dans
              un endroit sécurisé et de ne le partager qu'avec des professionnels de santé de confiance.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button onClick={handleExport} disabled={isExporting} className="flex items-center">
          {isExporting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Exportation en cours...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Exporter le dossier
            </>
          )}
        </Button>
      </div>
    </>
  )
}

