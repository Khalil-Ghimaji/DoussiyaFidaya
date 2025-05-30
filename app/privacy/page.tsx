import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Politique de confidentialité</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Chez MediSystem, nous nous engageons à protéger votre vie privée et vos données personnelles. Cette
              politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos
              informations lorsque vous utilisez notre plateforme.
            </p>
            <p>
              En utilisant MediSystem, vous acceptez les pratiques décrites dans cette politique de confidentialité. Si
              vous n'acceptez pas cette politique, veuillez ne pas utiliser notre plateforme.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>2. Informations que nous collectons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>Informations personnelles :</strong> Lorsque vous créez un compte, nous collectons votre nom,
              prénom, adresse e-mail, numéro de téléphone et rôle (patient, médecin, laboratoire ou pharmacie).
            </p>
            <p>
              <strong>Informations médicales :</strong> En fonction de votre utilisation de la plateforme, nous pouvons
              collecter des informations médicales telles que vos antécédents médicaux, vos ordonnances, vos résultats
              d'analyses et vos rendez-vous médicaux.
            </p>
            <p>
              <strong>Informations d'utilisation :</strong> Nous collectons des informations sur la façon dont vous
              utilisez notre plateforme, y compris les pages que vous visitez, les fonctionnalités que vous utilisez et
              le temps que vous passez sur la plateforme.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3. Comment nous utilisons vos informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Nous utilisons vos informations pour :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Fournir, maintenir et améliorer notre plateforme</li>
              <li>Créer et gérer votre compte</li>
              <li>Faciliter la communication entre les patients, les médecins, les laboratoires et les pharmacies</li>
              <li>Vous envoyer des notifications importantes concernant votre compte ou votre santé</li>
              <li>Répondre à vos questions et demandes</li>
              <li>Détecter, prévenir et résoudre les problèmes techniques ou de sécurité</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>4. Partage de vos informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Nous ne vendons pas vos informations personnelles ou médicales à des tiers. Nous pouvons partager vos
              informations dans les circonstances suivantes :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Avec les professionnels de santé :</strong> Nous partageons vos informations médicales avec les
                médecins, laboratoires et pharmacies que vous avez autorisés à accéder à votre dossier médical.
              </li>
              <li>
                <strong>Avec nos prestataires de services :</strong> Nous pouvons partager vos informations avec des
                prestataires de services tiers qui nous aident à fournir et à maintenir notre plateforme.
              </li>
              <li>
                <strong>Pour des raisons légales :</strong> Nous pouvons partager vos informations si nous sommes tenus
                de le faire par la loi ou si nous croyons de bonne foi que cela est nécessaire pour protéger nos droits,
                votre sécurité ou celle d'autrui.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>5. Sécurité de vos informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques, administratives et physiques pour protéger vos
              informations contre l'accès, l'utilisation ou la divulgation non autorisés.
            </p>
            <p>
              Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement
              sécurisée. Bien que nous nous efforcions de protéger vos informations, nous ne pouvons garantir leur
              sécurité absolue.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Vos droits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Vous avez le droit d'accéder, de corriger, de mettre à jour ou de supprimer vos informations personnelles.
              Vous pouvez exercer ces droits en nous contactant à privacy@medisystem.com.
            </p>
            <p>
              Veuillez noter que certaines informations peuvent être conservées pour des raisons légales ou
              administratives, même après votre demande de suppression.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

