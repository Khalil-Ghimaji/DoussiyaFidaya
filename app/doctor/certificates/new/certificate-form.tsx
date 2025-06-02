"use client";

import { FC, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActionState } from "react";
import { CertificateFormState, createMedicalCertificate } from "@/app/doctor/actions";
import { useFormStatus } from "react-dom";

interface Patient {
  id: string;
  date_of_birth: string;
  users: {
    first_name: string;
    last_name: string;
  };
}

interface CertificateFormProps {
  patients: Patient[];
}


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Créer le certificat
      </Button>
  );
}

const NewCertificateForm: FC<CertificateFormProps> = ({ patients }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState<CertificateFormState, FormData>(createMedicalCertificate, {
    message: "",
    success: false,
    certificateId: undefined,
    errors: {
      patientId: "",
      diagnose: "",
      startDate: "",
      endDate: "",
      duration: "",
      restType: "",
    },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [duration, setDuration] = useState(7);
  console.log("this is the patientsss", patients);
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    const lowerSearch = searchTerm.toLowerCase();
    return patients.filter(
        (patient) =>
            patient.users.first_name.toLowerCase().includes(lowerSearch) ||
            patient.users.last_name.toLowerCase().includes(lowerSearch)
    );
  }, [patients, searchTerm]);

  const handleSelectPatient = (patientId: string, patientName: string) => {
    setSelectedPatient({ id: patientId, name: patientName });
    setIsPopoverOpen(false);
    setSearchTerm("");
  };

  const updateDuration = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setDuration(diffDays);
  };

  const updateEndDate = (newDuration: number) => {
    const newEndDate = new Date(startDate);
    newEndDate.setDate(startDate.getDate() + newDuration - 1);
    setEndDate(newEndDate);
  };

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    updateDuration(date, endDate);
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    updateDuration(startDate, date);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Number.parseInt(e.target.value);
    if (!isNaN(newDuration) && newDuration > 0) {
      setDuration(newDuration);
      updateEndDate(newDuration);
    }
  };
  const handleSubmit = async (formData: FormData) => {
    const result = await formAction(formData);
    console.log("this is the result", result);
  };

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Certificat créé",
        description: "Le certificat médical a été créé avec succès.",
      });
      router.push("/doctor/patients/"+selectedPatient?.id);
      router.refresh();
    } else if (state.message && !state.success) {
      toast({
        title: "Erreur",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, router, toast]);

  return (
      <form action={handleSubmit} className="space-y-6">
        <input type="hidden" name="startDate" value={startDate.toISOString()} />
        <input type="hidden" name="endDate" value={endDate.toISOString()} />

        <div className="space-y-2">
          <Label htmlFor="patientName">Patient</Label>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={isPopoverOpen} className="w-full justify-between">
                {selectedPatient?.name || "Sélectionner un patient"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                    placeholder="Rechercher un patient..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                />
                <CommandList>
                  <CommandEmpty>Aucun patient trouvé.</CommandEmpty>
                  <CommandGroup>
                    {filteredPatients.map((patient) => (
                        <CommandItem
                            key={patient.id}
                            value={patient.id}
                            onSelect={() =>
                                handleSelectPatient(
                                    patient.id,
                                    `${patient.users.first_name} ${patient.users.last_name}`
                                )
                            }
                        >
                          {patient.users.first_name} {patient.users.last_name} -{" "}
                          {new Date(patient.date_of_birth).toLocaleDateString()}
                        </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {state.errors.patientId && <p className="text-sm text-red-500">{state.errors.patientId}</p>}
          <input type="hidden" name="patientId" value={selectedPatient?.id || ""} />
          <input type="hidden" name="patientName" value={selectedPatient?.name || ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagnose">Diagnostic</Label>
          <Input name="diagnose" placeholder="Diagnostic..." />
          {state.errors.diagnose && <p className="text-sm text-red-500">{state.errors.diagnose}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début</Label>
            <DatePicker date={startDate} setDate={handleStartDateChange} />
            {state.errors.startDate && <p className="text-sm text-red-500">{state.errors.startDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Date de fin</Label>
            <DatePicker date={endDate} setDate={handleEndDateChange} />
            {state.errors.endDate && <p className="text-sm text-red-500">{state.errors.endDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Durée (jours)</Label>
            <Input name="duration" type="number" min={1} value={duration} onChange={handleDurationChange} />
            {state.errors.duration && <p className="text-sm text-red-500">{state.errors.duration}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="restType">Type de repos</Label>
            <Input name="restType" placeholder="ex: Repos total" />
            {state.errors.restType && <p className="text-sm text-red-500">{state.errors.restType}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes supplémentaires (optionnel)</Label>
          <Textarea name="notes" placeholder="Notes supplémentaires..." className="min-h-[100px]" />
        </div>

        {state.message && !state.success && <div className="bg-red-50 p-4 rounded-md text-red-800">{state.message}</div>}

        <SubmitButton />
      </form>
  );
};

export default NewCertificateForm;