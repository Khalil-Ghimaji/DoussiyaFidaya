import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { GET_HOME_PAGE_CONTENT } from "@/lib/graphql/queries/content"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, FileText, ArrowRight } from "lucide-react"
import {client} from "@/lib/graphql/client";

export const metadata: Metadata = {
  title: "MediSystem | Plateforme de santé numérique",
  description:
    "MediSystem est une plateforme de santé numérique qui connecte les patients et les médecins pour des consultations en ligne, des prescriptions électroniques et plus encore.",
}

// This page uses Incremental Static Regeneration (ISR) since content changes occasionally
export const revalidate = 3600 // Revalidate every hour

async function getHomePageContent() {
  try {
    const { homePageContent } = await client.request(GET_HOME_PAGE_CONTENT)
    return homePageContent
  } catch (error) {
    console.error("Error fetching home page content:", error)
    // Return fallback content
    return {
      hero: {
        title: "Votre santé, notre priorité",
        subtitle: "MediSystem connecte les patients et les médecins pour des soins de santé accessibles et efficaces.",
        ctaText: "Commencer",
        imageUrl: "/placeholder.svg?height=600&width=800",
      },
      features: [
        {
          id: "1",
          title: "Consultations en ligne",
          description: "Consultez un médecin depuis le confort de votre domicile, sans attente ni déplacement.",
          iconName: "video",
        },
        {
          id: "2",
          title: "Prescriptions électroniques",
          description: "Recevez vos ordonnances directement sur votre téléphone et envoyez-les à votre pharmacie.",
          iconName: "file-text",
        },
        {
          id: "3",
          title: "Suivi médical",
          description: "Suivez votre historique médical et partagez-le en toute sécurité avec vos médecins.",
          iconName: "activity",
        },
      ],
      testimonials: [],
      statistics: {
        patients: 10000,
        doctors: 500,
        consultations: 25000,
        prescriptions: 50000,
      },
    }
  }
}

export default async function HomePage() {
  const content = await getHomePageContent()

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{content.hero.title}</h1>
            <p className="text-xl text-muted-foreground">{content.hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/register">{content.hero.ctaText}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src={content.hero.imageUrl || "/placeholder.svg"}
              alt="MediSystem Platform"
              fill
              className="object-cover rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Nos services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              MediSystem offre une gamme complète de services pour améliorer votre expérience de soins de santé.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {content.features.map((feature) => (
              <Card key={feature.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {/* Dynamically render icon based on iconName */}
                    {feature.iconName === "video" && <Calendar className="h-6 w-6 text-primary" />}
                    {feature.iconName === "file-text" && <FileText className="h-6 w-6 text-primary" />}
                    {feature.iconName === "activity" && <CheckCircle className="h-6 w-6 text-primary" />}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="link" className="p-0" asChild>
                    <Link href={`/services#${feature.id}`}>
                      En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-muted">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {new Intl.NumberFormat("fr-FR").format(content.statistics.patients)}+
              </div>
              <div className="text-muted-foreground">Patients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {new Intl.NumberFormat("fr-FR").format(content.statistics.doctors)}+
              </div>
              <div className="text-muted-foreground">Médecins</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {new Intl.NumberFormat("fr-FR").format(content.statistics.consultations)}+
              </div>
              <div className="text-muted-foreground">Consultations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {new Intl.NumberFormat("fr-FR").format(content.statistics.prescriptions)}+
              </div>
              <div className="text-muted-foreground">Prescriptions</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à prendre soin de votre santé?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Rejoignez MediSystem aujourd'hui et découvrez une nouvelle façon de gérer votre santé.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">Créer un compte gratuit</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

