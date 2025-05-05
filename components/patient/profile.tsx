import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, User, Droplets, MapPin, Phone, Mail } from "lucide-react"

interface PatientProfileProps {
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    bloodType?: string
    profileImage?: string
    address?: string
    phone?: string
    email?: string
  }
}

export function PatientProfile({ patient }: PatientProfileProps) {
  const fullName = `${patient.firstName} ${patient.lastName}`
  const initials = `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`
  const formattedDateOfBirth = format(parseISO(patient.dateOfBirth), "dd MMMM yyyy", { locale: fr })

  // Calculate age
  const birthDate = new Date(patient.dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-center">
          <Avatar className="h-24 w-24">
            {patient.profileImage && <AvatarImage src={patient.profileImage} alt={fullName} />}
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">{fullName}</h2>
          <p className="text-muted-foreground">{age} ans</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{patient.gender === "male" ? "Homme" : patient.gender === "female" ? "Femme" : patient.gender}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Né(e) le {formattedDateOfBirth}</span>
          </div>

          {patient.bloodType && (
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <span>
                Groupe sanguin: <Badge variant="outline">{patient.bloodType}</Badge>
              </span>
            </div>
          )}

          {patient.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
          )}

          {patient.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm truncate">{patient.email}</span>
            </div>
          )}

          {patient.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">{patient.address}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

