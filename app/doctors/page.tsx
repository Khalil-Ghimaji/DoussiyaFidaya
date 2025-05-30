import { Suspense } from "react"
import type { Metadata } from "next"
import { getDoctors, getSpecialties } from "@/lib/graphql/queries/content"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Languages, GraduationCap, Clock } from "lucide-react"
import Link from "next/link"
import DoctorSearch from "./doctor-search"
import DoctorFilters from "./doctor-filters"
import { bookAppointment } from "./actions"

export const metadata: Metadata = {
  title: "Our Doctors | Healthcare Platform",
  description: "Meet our team of experienced healthcare professionals",
}

// Use PPR for this page
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: { specialty?: string; language?: string; accepting?: string }
}) {
  // These can be pre-rendered
  const specialties = await getSpecialties()

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Our Medical Team</h1>
        <p className="text-muted-foreground max-w-3xl">
          Our team of experienced healthcare professionals is dedicated to providing you with the highest quality care.
          Find the right doctor for your needs and book an appointment today.
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

          <Suspense fallback={<DoctorsListSkeleton />}>
            <DoctorsList
              specialty={searchParams.specialty}
              language={searchParams.language}
              acceptingNewPatients={searchParams.accepting === "true"}
            />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

async function DoctorsList({
  specialty,
  language,
  acceptingNewPatients,
}: {
  specialty?: string
  language?: string
  acceptingNewPatients?: boolean
}) {
  // This part is dynamically rendered
  const doctors = await getDoctors(specialty)

  // Apply client-side filters
  const filteredDoctors = doctors.filter((doctor) => {
    if (language && !doctor.languages.includes(language)) return false
    if (acceptingNewPatients && !doctor.acceptingNewPatients) return false
    return true
  })

  if (filteredDoctors.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No doctors found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your filters or search criteria</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {filteredDoctors.map((doctor) => (
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
          <AvatarImage src={doctor.profileImage} alt={doctor.name} />
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
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Link href={`/doctors/${doctor.id}`} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full">
            View Profile
          </Button>
        </Link>
        <form action={bookAppointment} className="w-full sm:w-auto">
          <input type="hidden" name="doctorId" value={doctor.id} />
          <Button type="submit" className="w-full">
            <Calendar className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

function DoctorsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
              {[...Array(3)].map((_, j) => (
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

