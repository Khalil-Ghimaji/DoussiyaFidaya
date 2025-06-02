"use client";

import { FC, useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, FileText, Check, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/file-upload";
import { Switch } from "@/components/ui/switch";
import { useFormState, useFormStatus } from "react-dom";
import { createConsultation } from "@/actions/consultation";

interface Patient {
  id: string;
  users: {
    first_name: string;
    last_name: string;
  };
}

interface VitalSigns {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string;
}

interface LabRequest {
  type: string;
  priority: string;
  laboratory: string;
}

interface ConsultationFormProps {
  patients: Patient[];
}

const ConsultationForm: FC<ConsultationFormProps> = ({ patients }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(createConsultation, { error: '' });
  const { pending } = useFormStatus();
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
  });
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "", quantity: "" },
  ]);
  const [isPrescriptionSigned, setIsPrescriptionSigned] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null);
  const [labRequests, setLabRequests] = useState<LabRequest[]>([
    { type: "", priority: "medium", laboratory: "" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    const lowerSearch = searchTerm.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.users.first_name.toLowerCase().includes(lowerSearch) ||
        patient.users.last_name.toLowerCase().includes(lowerSearch)
    );
  }, [patients, searchTerm]);

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "", quantity: "" }]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    setMedications((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const addLabRequest = () => {
    setLabRequests([...labRequests, { type: "", priority: "medium", laboratory: "" }]);
  };

  const updateLabRequest = (index: number, field: keyof LabRequest, value: string) => {
    setLabRequests((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeLabRequest = (index: number) => {
    if (labRequests.length > 1) {
      setLabRequests((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handlePatientChange = (id: string) => {
    setPatientId(id);
    const patient = patients.find((p) => p.id === id);
    if (patient) {
      setPatientName(`${patient.users.first_name} ${patient.users.last_name}`);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile({
      name: file.name,
      type: file.type,
    });
    setIsUploaded(true);
    setShowUpload(false);
    toast({
      title: "Fichier téléchargé",
      description: `Le fichier ${file.name} a été téléchargé avec succès`,
    });
  };

  // if (state.error) {
  //   toast({
  //     title: "Erreur",
  //     description: state.error,
  //     variant: "destructive",
  //   });
  // }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/doctor/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Consultation rapide</h1>
            <p className="text-muted-foreground">Enregistrez rapidement une consultation pour un patient</p>
          </div>
        </div>

        <form action={formAction}>
          <input type="hidden" name="patientId" value={patientId} />
          <input type="hidden" name="notes" value={notes} />
          <input type="hidden" name="diagnosis" value={diagnosis} />
          <input type="hidden" name="vitalSigns.bloodPressure" value={vitalSigns.bloodPressure} />
          <input type="hidden" name="vitalSigns.heartRate" value={vitalSigns.heartRate} />
          <input type="hidden" name="vitalSigns.temperature" value={vitalSigns.temperature} />
          <input type="hidden" name="vitalSigns.respiratoryRate" value={vitalSigns.respiratoryRate} />
          <input type="hidden" name="vitalSigns.oxygenSaturation" value={vitalSigns.oxygenSaturation} />
          <input type="hidden" name="vitalSigns.weight" value={vitalSigns.weight} />
          <input type="hidden" name="isPrescriptionSigned" value={isPrescriptionSigned.toString()} />
          <input type="hidden" name="medications" value={JSON.stringify(medications)} />
          <input type="hidden" name="labRequests" value={JSON.stringify(labRequests)} />

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sélection du patient</CardTitle>
              <CardDescription>Choisissez le patient pour cette consultation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient</Label>
                  <Select value={patientId} onValueChange={handlePatientChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <Input
                        type="text"
                        placeholder="Rechercher un patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-2"
                      />
                      {filteredPatients.length === 0 && searchTerm && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Aucun patient trouvé
                        </div>
                      )}
                      {filteredPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {`${patient.users.first_name} ${patient.users.last_name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {patientId && (
                  <div className="p-4 bg-muted rounded-md">
                    <p className="font-medium">Patient sélectionné: {patientName}</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                      <Link href={`/doctor/patients/${patientId}`}>Voir le dossier complet</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="consultation" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="consultation">Consultation</TabsTrigger>
              <TabsTrigger value="prescription">Ordonnance</TabsTrigger>
              <TabsTrigger value="lab-request">Demande d'analyses</TabsTrigger>
            </TabsList>

            <TabsContent value="consultation">
              <Card>
                <CardHeader>
                  <CardTitle>Détails de la consultation</CardTitle>
                  <CardDescription>Enregistrez les notes et le diagnostic de la consultation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodPressure">Tension artérielle (mmHg)</Label>
                      <Input
                        id="bloodPressure"
                        value={vitalSigns.bloodPressure}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                        placeholder="ex: 120/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heartRate">Fréquence cardiaque (bpm)</Label>
                      <Input
                        id="heartRate"
                        value={vitalSigns.heartRate}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                        placeholder="ex: 75"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Température (°C)</Label>
                      <Input
                        id="temperature"
                        value={vitalSigns.temperature}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                        placeholder="ex: 37.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="respiratoryRate">Fréquence respiratoire (rpm)</Label>
                      <Input
                        id="respiratoryRate"
                        value={vitalSigns.respiratoryRate}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, respiratoryRate: e.target.value })}
                        placeholder="ex: 16"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oxygenSaturation">Saturation en oxygène (%)</Label>
                      <Input
                        id="oxygenSaturation"
                        value={vitalSigns.oxygenSaturation}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                        placeholder="ex: 98"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Poids (kg)</Label>
                      <Input
                        id="weight"
                        value={vitalSigns.weight}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                        placeholder="ex: 70"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes de consultation</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Saisissez vos observations et notes cliniques"
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnostic</Label>
                    <Textarea
                      id="diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Saisissez votre diagnostic"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescription">
              <div className="flex justify-end mb-4">
                {!isUploaded && (
                  <Button type="button" variant="outline" onClick={() => setShowUpload(!showUpload)}>
                    <Upload className="mr-2 h-4 w-4" />
                    {showUpload ? "Masquer" : "Télécharger une ordonnance"}
                  </Button>
                )}
              </div>

              {showUpload && (
                <div className="mt-4">
                  <FileUpload
                    onUpload={handleFileUpload}
                    acceptedFileTypes="application/pdf"
                    maxSizeMB={5}
                  />
                </div>
              )}

              {isUploaded && uploadedFile && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Ordonnance téléchargée</CardTitle>
                    <CardDescription>L'ordonnance a été téléchargée avec succès</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 p-4 border rounded-md">
                      <div className="bg-primary/10 p-3 rounded-md">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">{uploadedFile.type}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsUploaded(false);
                          setUploadedFile(null);
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!isUploaded && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Ordonnance</CardTitle>
                    <CardDescription>Ajoutez les médicaments à prescrire</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {medications.map((medication, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Médicament {index + 1}</h3>
                          {medications.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeMedication(index)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Supprimer
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`med-name-${index}`}>Nom du médicament</Label>
                            <Input
                              id={`med-name-${index}`}
                              value={medication.name}
                              onChange={(e) => updateMedication(index, "name", e.target.value)}
                              placeholder="ex: Amlodipine"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`med-dosage-${index}`}>Dosage</Label>
                            <Input
                              id={`med-dosage-${index}`}
                              value={medication.dosage}
                              onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                              placeholder="ex: 5mg"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`med-frequency-${index}`}>Fréquence</Label>
                            <Input
                              id={`med-frequency-${index}`}
                              value={medication.frequency}
                              onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                              placeholder="ex: 1 comprimé par jour"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`med-duration-${index}`}>Durée</Label>
                            <Input
                              id={`med-duration-${index}`}
                              value={medication.duration}
                              onChange={(e) => updateMedication(index, "duration", e.target.value)}
                              placeholder="ex: 3 mois"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`med-quantity-${index}`}>Quantité</Label>
                            <Input
                              id={`med-quantity-${index}`}
                              value={medication.quantity}
                              onChange={(e) => updateMedication(index, "quantity", e.target.value)}
                              placeholder="ex: 30"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addMedication}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un médicament
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Signature électronique</CardTitle>
                  <CardDescription>Signez électroniquement l'ordonnance pour la valider</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${isPrescriptionSigned ? "bg-green-100" : "bg-muted"}`}>
                        {isPrescriptionSigned ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {isPrescriptionSigned ? "Document signé électroniquement" : "Signature électronique"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isPrescriptionSigned
                            ? `Signé le ${new Date().toLocaleDateString()} par Dr. Karim Malouli`
                            : "Veuillez signer électroniquement ce document pour le valider"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="sign-prescription"
                        checked={isPrescriptionSigned}
                        onCheckedChange={setIsPrescriptionSigned}
                      />
                      <Label htmlFor="sign-prescription" className="cursor-pointer">
                        {isPrescriptionSigned ? "Signé" : "Signer"}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lab-request">
              <Card>
                <CardHeader>
                  <CardTitle>Demande d'analyses</CardTitle>
                  <CardDescription>Ajoutez les analyses à demander</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {labRequests.map((request, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Analyse {index + 1}</h3>
                        {labRequests.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeLabRequest(index)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`lab-type-${index}`}>Type d'analyse</Label>
                          <Input
                            id={`lab-type-${index}`}
                            value={request.type}
                            onChange={(e) => updateLabRequest(index, "type", e.target.value)}
                            placeholder="ex: Analyse sanguine"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`lab-priority-${index}`}>Priorité</Label>
                          <Select
                            value={request.priority}
                            onValueChange={(value) => updateLabRequest(index, "priority", value)}
                          >
                            <SelectTrigger id={`lab-priority-${index}`}>
                              <SelectValue placeholder="Sélectionnez une priorité" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Basse</SelectItem>
                              <SelectItem value="medium">Moyenne</SelectItem>
                              <SelectItem value="high">Haute</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`lab-laboratory-${index}`}>Laboratoire</Label>
                          <Input
                            id={`lab-laboratory-${index}`}
                            value={request.laboratory}
                            onChange={(e) => updateLabRequest(index, "laboratory", e.target.value)}
                            placeholder="ex: Laboratoire Central"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addLabRequest}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une analyse
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement..." : "Enregistrer la consultation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationForm;