"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Filter, FileText, Phone, Mail, MapPin } from "lucide-react"

type Patient = {
  _id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  email: string
  phone: string
  address: string
  profileImage: string
  lastConsultation: string
}

type PatientsFiltersProps = {
  initialPatients: Patient[]
}

export function PatientsFilters({ initialPatients }: PatientsFiltersProps) {
  const [patients, setPatients] = useState(initialPatients)
  const [filteredPatients, setFilteredPatients] = useState(initialPatients)
  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  useEffect(() => {
    let result = [...patients]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (patient) =>
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.phone.includes(searchQuery),
      )
    }

    // Apply gender filter
    if (genderFilter !== "all") {
      result = result.filter((patient) => patient.gender.toLowerCase() === genderFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
        case "date":
          return new Date(b.lastConsultation).getTime() - new Date(a.lastConsultation).getTime()
        case "age":
          return new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime()
        default:
          return 0
      }
    })

    setFilteredPatients(result)
  }, [patients, searchQuery, genderFilter, sortBy])

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatLastConsultation = (dateStr: string) => {
    if (!dateStr) return "Jamais"

    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`
    return `Il y a ${Math.floor(diffDays / 365)} ans`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Liste des patients</CardTitle>
        <CardDescription>
          {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""} trouvé
          {filteredPatients.length !== 1 ? "s" : ""}
        </CardDescription>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un patient..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="male">Homme</SelectItem>
                <SelectItem value="female">Femme</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="date">Dernière visite</SelectItem>
                <SelectItem value="age">Âge</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="grid">
              <Users className="mr-2 h-4 w-4" />
              Grille
            </TabsTrigger>
            <TabsTrigger value="list">
              <FileText className="mr-2 h-4 w-4" />
              Liste
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            {filteredPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((patient) => (
                  <Card key={patient._id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col items-center p-6">
                        <Avatar className="h-20 w-20 mb-4">
                          <AvatarImage
                            src={patient.profileImage || "/placeholder.svg?height=80&width=80"}
                            alt={`${patient.firstName} ${patient.lastName}`}
                          />
                          <AvatarFallback className="text-xl">
                            {patient.firstName[0]}
                            {patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium text-lg">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {patient.gender === "male" ? "Homme" : "Femme"}, {calculateAge(patient.dateOfBirth)} ans
                        </p>
                        <Badge variant="outline" className="mb-4">
                          Dernière visite: {formatLastConsultation(patient.lastConsultation)}
                        </Badge>
                        <div className="w-full space-y-2 text-sm">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{patient.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="truncate">{patient.email}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="truncate">{patient.address}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 w-full">
                          <Button asChild className="flex-1">
                            <Link href={`/doctor/patients/${patient._id}`}>Voir profil</Link>
                          </Button>
                          <Button variant="outline" asChild className="flex-1">
                            <Link href={`/doctor/patients/${patient._id}/consultation`}>Consultation</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun patient ne correspond à vos critères</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setGenderFilter("all")
                    setSortBy("name")
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="list">
            {filteredPatients.length > 0 ? (
              <div className="border rounded-md">
                <div className="grid grid-cols-12 gap-2 p-4 font-medium border-b text-sm">
                  <div className="col-span-4">Nom</div>
                  <div className="col-span-2">Âge / Genre</div>
                  <div className="col-span-3">Contact</div>
                  <div className="col-span-2">Dernière visite</div>
                  <div className="col-span-1"></div>
                </div>
                <div className="divide-y">
                  {filteredPatients.map((patient) => (
                    <div key={patient._id} className="grid grid-cols-12 gap-2 p-4 items-center text-sm">
                      <div className="col-span-4 flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={patient.profileImage || "/placeholder.svg?height=32&width=32"}
                            alt={`${patient.firstName} ${patient.lastName}`}
                          />
                          <AvatarFallback className="text-xs">
                            {patient.firstName[0]}
                            {patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{patient.address}</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        {calculateAge(patient.dateOfBirth)} ans / {patient.gender === "male" ? "H" : "F"}
                      </div>
                      <div className="col-span-3">
                        <p>{patient.phone}</p>
                        <p className="text-xs text-muted-foreground truncate">{patient.email}</p>
                      </div>
                      <div className="col-span-2">{formatLastConsultation(patient.lastConsultation)}</div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/doctor/patients/${patient._id}`}>Voir</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun patient ne correspond à vos critères</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setGenderFilter("all")
                    setSortBy("name")
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

