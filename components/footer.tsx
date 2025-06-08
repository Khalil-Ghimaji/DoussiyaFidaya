import Link from "next/link"

// This component uses Static Site Generation (SSG) since footer content rarely changes
export const revalidate = 86400 // Revalidate once per day

async function getFooterContent() {
  try {
    //TODO: Uncomment when GraphQL API is ready
    //const { footerLinks, companyInfo } = await graphqlClient.request(GET_FOOTER_CONTENT)
    //return { footerLinks, companyInfo }
    throw new Error("GraphQL API not ready")
  } catch (error) {
    //console.error("Error fetching footer content:", error)
    // Return fallback content
    return {
      footerLinks: [
        {
          category: "Services",
          links: [
            { id: "1", label: "Consultations", url: "/services#consultations" },
            { id: "2", label: "Prescriptions", url: "/services#prescriptions" },
            { id: "3", label: "Suivi médical", url: "/services#suivi" },
          ],
        },
        {
          category: "Informations",
          links: [
            { id: "4", label: "À propos", url: "/about" },
            { id: "5", label: "Médecins", url: "/doctors" },
            { id: "6", label: "FAQ", url: "/faq" },
          ],
        },
        {
          category: "Légal",
          links: [
            { id: "7", label: "Conditions d'utilisation", url: "/terms" },
            { id: "8", label: "Politique de confidentialité", url: "/privacy" },
            { id: "9", label: "Mentions légales", url: "/legal" },
          ],
        },
      ],
      companyInfo: {
        name: "MediSystem",
        address: "123 Avenue de la Médecine, 75001 Paris, France",
        phone: "+33 1 23 45 67 89",
        email: "contact@medisystem.com",
      },
    }
  }
}

export default async function Footer() {
  const { footerLinks, companyInfo } = await getFooterContent()

  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">MediSystem</h3>
            <p className="text-muted-foreground mb-4">
              Votre plateforme de santé numérique pour des soins accessibles et efficaces.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>{companyInfo.address}</p>
              <p>{companyInfo.phone}</p>
              <p>{companyInfo.email}</p>
            </div>
          </div>

          {footerLinks.map((category) => (
            <div key={category.category}>
              <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.id}>
                    <Link href={link.url} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {companyInfo.name}. Tous droits réservés.
          </p>

          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Conditions d&apos;utilisation
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

