import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">À propos de MediSystem</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Notre mission</CardTitle>
            <CardDescription>Améliorer l'accès aux soins de santé grâce à la technologie</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              MediSystem est une plateforme numérique sécurisée conçue pour faciliter la gestion des dossiers médicaux
              et améliorer la communication entre les patients, les médecins, les laboratoires et les pharmacies.
            </p>
            <p>
              Notre objectif est de simplifier le parcours de soins, de réduire les erreurs médicales et d'améliorer
              l'expérience globale des patients et des professionnels de santé grâce à une solution intégrée et
              intuitive.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Notre équipe</CardTitle>
            <CardDescription>Des experts en santé et en technologie</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Notre équipe est composée de professionnels de la santé, d'ingénieurs en logiciel et d'experts en sécurité
              des données qui travaillent ensemble pour créer une solution robuste et adaptée aux besoins du secteur
              médical.
            </p>
            <p>
              Nous collaborons étroitement avec des établissements de santé et des professionnels médicaux pour garantir
              que notre plateforme répond aux exigences réelles du terrain tout en respectant les normes les plus
              strictes en matière de protection des données de santé.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nos valeurs</CardTitle>
            <CardDescription>Ce qui guide nos décisions et nos actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Confidentialité et sécurité</strong> - La protection des données de santé est notre priorité
                absolue.
              </li>
              <li>
                <strong>Accessibilité</strong> - Nous concevons nos solutions pour qu'elles soient accessibles à tous,
                indépendamment de l'âge ou des compétences techniques.
              </li>
              <li>
                <strong>Innovation</strong> - Nous recherchons constamment de nouvelles façons d'améliorer notre
                plateforme et d'intégrer les dernières avancées technologiques.
              </li>
              <li>
                <strong>Collaboration</strong> - Nous croyons en la puissance de la collaboration entre les différents
                acteurs du système de santé.
              </li>
              <li>
                <strong>Qualité</strong> - Nous nous engageons à fournir des solutions de la plus haute qualité pour
                contribuer à l'amélioration des soins de santé.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

