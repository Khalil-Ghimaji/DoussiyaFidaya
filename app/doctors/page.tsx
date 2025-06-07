import type { Metadata } from "next"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Languages, GraduationCap, Clock, Map, Grid } from "lucide-react"
import Link from "next/link"
import DoctorSearch from "./doctor-search"
import DoctorFilters from "./doctor-filters"
import { getDoctorsWithLocation} from "./actions"
import DoctorTabs from "@/app/doctors/doctor-tabs";
import DoctorMap from "@/app/doctors/doctor-map";

export const metadata: Metadata = {
  title: "Find Doctors Near You | Healthcare Platform",
  description: "Find experienced healthcare professionals near your location with our interactive map and search",
}

// This page is accessible to all users
export const dynamic = "force-dynamic"
export const runtime = "nodejs"
enum doctors_specialty_enum {
  generaliste = "generaliste",
  cardiologue = "cardiologue",
  dermatologue = "dermatologue",
  gynecologue = "gynecologue",
  pediatre = "pediatre",
  orthopediste = "orthopediste",
  psychiatre = "psychiatre",
  ophtalmologue = "ophtalmologue",
  otorhinolaryngologue = "otorhinolaryngologue",
  neurologue = "neurologue",
  urologue = "urologue",
  endocrinologue = "endocrinologue",
  gastroenterologue = "gastroenterologue",
  rheumatologue = "rheumatologue",
  anesthesiste = "anesthesiste",
  radiologue = "radiologue",
  oncologue = "oncologue",
  chirurgien = "chirurgien",
  nutritionniste = "nutritionniste",
  physiotherapeute = "physiotherapeute",
  psychologue = "psychologue",
  sexologue = "sexologue",
  geriatre = "geriatre",
  allergologue = "allergologue",
  hematologue = "hematologue",
  nephrologue = "nephrologue",
  pneumologue = "pneumologue",
  dentiste = "dentiste",
  orthodontiste = "orthodontiste",
  autre = "autre"
}
export default async function DoctorsPage({
                                            searchParams,
                                          }: {
  searchParams: {
    specialty?: string
    language?: string
    accepting?: string
    search?: string
    lat?: string
    lng?: string
    radius?: string
    view?: string
  }
}) {
  function getSpecialties() {
    return Object.entries(doctors_specialty_enum).map(([key, value]) => ({ id: key, name: value }));
  }

  // Fetch specialties and doctors with location data
  const specialties = getSpecialties();
  const doctors = (await getDoctorsWithLocation({
      specialty: searchParams.specialty,
      search: searchParams.search,
      lat: searchParams.lat ? Number.parseFloat(searchParams.lat) : undefined,
      lng: searchParams.lng ? Number.parseFloat(searchParams.lng) : undefined,
      radius: searchParams.radius ? Number.parseInt(searchParams.radius) : undefined,
      language: searchParams.language?.toLowerCase(),
    })).filter((doctor) => doctor.name.includes(searchParams.search || ""));
  console.log("these are the doctors in page.tsx", doctors)
  console.dir(doctors, { depth: null })
  const defaultView = searchParams.view || "map";
  return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Find Doctors Near You</h1>
          <p className="text-muted-foreground max-w-3xl">
            Discover experienced healthcare professionals in your area. Use our interactive map to find doctors by
            location, specialty, and availability. Book appointments directly or view detailed profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <DoctorFilters specialties={specialties} />
            </div>
          </div>

          <div className="lg:col-span-3">
            <DoctorSearch />
            <DoctorTabs
                defaultValue={defaultView}
                mapTab={<DoctorMap doctors={doctors} searchParameters={searchParams}/> }
                listTab={<DoctorsList doctors={doctors} searchParams={searchParams}/>}
            />
          </div>
        </div>
      </main>
  )
}

function DoctorsList({
                       doctors,
                       searchParams,
                     }: {
  doctors: any[]
  searchParams: any
}) {
  if (doctors.length === 0) {
    return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No doctors found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your filters or search criteria</p>
        </div>
    )
  }

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
  )
}

function DoctorCard({ doctor }: { doctor: any }) {
  const initials = doctor.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()

  return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-start gap-4 pb-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={doctor.profileImage || "/placeholder.svg"} alt={doctor.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-none">{doctor.name}</h3>
            <p className="text-sm text-muted-foreground">{doctor.title}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{doctor.specialty}</Badge>
              {doctor.acceptingNewPatients && <Badge variant="secondary">Accepting New Patients</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm line-clamp-3 mb-4">{doctor.bio}</p>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Education</p>
                <p className="text-muted-foreground">{doctor.education}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Experience</p>
                <p className="text-muted-foreground">{doctor.experience} years</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Languages className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Languages</p>
                <p className="text-muted-foreground">{doctor.languages.join(", ")}</p>
              </div>
            </div>

            {doctor.location && (
                <div className="flex items-start gap-2">
                  <Map className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{doctor.location.address}</p>
                    {doctor.distance && (
                        <p className="text-xs text-muted-foreground">{doctor.distance.toFixed(1)} km away</p>
                    )}
                  </div>
                </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Link href={`/doctors/${doctor.id}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
          <Link href={`/patients/appointments/new?doctorId=${doctor.id}`} className="w-full sm:w-auto">
            <Button type="submit" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
        </CardFooter>
      </Card>
  )
}

function DoctorsListSkeleton() {
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
                    <div className="h-5 w-32 bg-muted rounded-full animate-pulse" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="h-12 bg-muted rounded animate-pulse mb-4" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <div className="h-4 w-4 mt-0.5 bg-muted rounded animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <div className="h-10 bg-muted rounded animate-pulse w-full" />
                <div className="h-10 bg-muted rounded animate-pulse w-full" />
              </CardFooter>
            </Card>
        ))}
      </div>
  )
}

function MapSkeleton() {
  return (
      <div className="w-full h-[600px] bg-muted rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-center">
          <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
  )
}
