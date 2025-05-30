import type { Metadata } from "next"
import { executeGraphQL } from "@/lib/graphql-client"
import { GET_SERVICES } from "@/lib/graphql/queries/content"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Clock, CreditCard, Info } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Nos Services Médicaux | MediSystem",
  description: "Découvrez notre gamme complète de services médicaux et de spécialités pour tous vos besoins de santé.",
}

// Revalidate this page every 24 hours - similar to home page pattern but with longer duration
export const revalidate = 86400

// Service type definition based on GraphQL schema
type Service = {
  id: string
  name: string
  slug: string
  category: string
  shortDescription: string
  description: string
  keyPoints: string[]
  duration: string
  price?: number
  available: boolean
  image?: string
}

async function getServices() {
  try {
    const { services } = await executeGraphQL({
      query: GET_SERVICES,
    })
    return services as Service[]
  } catch (error) {
    console.error("Error fetching services:", error)
    // Fallback content similar to home page pattern
    return [
      {
        id: "1",
        name: "Consultation générale",
        slug: "consultation-generale",
        category: "Consultations",
        shortDescription: "Consultation médicale standard avec un médecin généraliste",
        description: "Une consultation complète pour évaluer votre état de santé général",
        keyPoints: ["Examen physique", "Évaluation des symptômes", "Conseils de santé"],
        duration: "30 minutes",
        price: 50,
        available: true,
      },
      {
        id: "2",
        name: "Suivi de maladies chroniques",
        slug: "suivi-maladies-chroniques",
        category: "Consultations",
        shortDescription: "Suivi régulier pour les patients atteints de maladies chroniques",
        description: "Gestion continue des conditions chroniques comme le diabète ou l'hypertension",
        keyPoints: ["Ajustement des médicaments", "Surveillance des paramètres", "Plan de traitement"],
        duration: "45 minutes",
        price: 75,
        available: true,
      },
      {
        id: "3",
        name: "Analyses de laboratoire",
        slug: "analyses-laboratoire",
        category: "Laboratoire",
        shortDescription: "Tests sanguins et autres analyses médicales",
        description: "Analyses complètes pour diagnostiquer ou suivre diverses conditions",
        keyPoints: ["Résultats rapides", "Interprétation par un médecin", "Suivi personnalisé"],
        duration: "Variable",
        price: 100,
        available: true,
      },
    ]
  }
}

export default async function ServicesPage() {
  const services = await getServices()

  // Group services by category
  const servicesByCategory = services.reduce(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push(service)
      return acc
    },
    {} as Record<string, typeof services>,
  )

  const categories = Object.keys(servicesByCategory)

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Nos Services Médicaux</h1>
        <p className="text-muted-foreground max-w-3xl">
          Nous offrons une gamme complète de services médicaux pour répondre à vos besoins de santé. Notre équipe de
          spécialistes est dédiée à fournir des soins de haute qualité en utilisant les dernières technologies médicales
          et pratiques fondées sur des preuves.
        </p>
      </div>

      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="mb-6 flex flex-wrap h-auto">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="mb-2">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesByCategory[category].map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* CTA Section styled similarly to home page */}
      <section className="mt-16 bg-gradient-to-b from-primary/10 to-background rounded-lg p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Besoin d'un service personnalisé?</h2>
            <p className="text-muted-foreground">
              Vous ne trouvez pas ce que vous cherchez? Contactez-nous pour discuter de vos besoins spécifiques en
              matière de santé.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/contact">
                  Nous contacter <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/patient/appointments/new">Prendre rendez-vous</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Professionnels de santé"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{service.name}</CardTitle>
          <Badge variant={service.available ? "default" : "outline"}>
            {service.available ? "Disponible" : "Bientôt disponible"}
          </Badge>
        </div>
        <CardDescription>{service.shortDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          {service.keyPoints?.map((point: string, i: number) => (
            <div key={i} className="flex items-start">
              <div className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-primary">
                <Info className="h-4 w-4" />
              </div>
              <p className="text-sm">{point}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>{service.duration}</span>
          </div>
          {service.price && (
            <div className="flex items-center text-sm text-muted-foreground">
              <CreditCard className="mr-1 h-4 w-4" />
              <span>{service.price}€</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/services/${service.slug}`} className="w-full">
          <Button variant="outline" className="w-full">
            En savoir plus
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

