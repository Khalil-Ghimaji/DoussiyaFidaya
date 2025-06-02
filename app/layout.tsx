import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { graphqlClient } from "@/lib/graphql/client"
import { GET_SITE_CONFIG } from "@/lib/graphql/queries/content"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import "./globals.css"
import { ApolloWrapper } from "@/providers/ApolloProvider"


const inter = Inter({ subsets: ["latin"] })

// This component uses Server-Side Rendering (SSR) to fetch global site data

async function getSiteConfig() {
    return {
      siteName: "MediSystem",
      logoUrl: "/logo.svg",
      primaryColor: "#0070f3",
      secondaryColor: "#00a8ff",
      contactEmail: "contact@medisystem.com",
      contactPhone: "+33 1 23 45 67 89",
      socialLinks: [
        { platform: "twitter", url: "https://twitter.com/medisystem" },
        { platform: "facebook", url: "https://facebook.com/medisystem" },
        { platform: "linkedin", url: "https://linkedin.com/company/medisystem" },
      ],
    }
  }


export const metadata: Metadata = {
  title: {
    default: "MediSystem | Plateforme de santé numérique",
    template: "%s | MediSystem",
  },
  description:
    "MediSystem est une plateforme de santé numérique qui connecte les patients et les médecins pour des consultations en ligne, des prescriptions électroniques et plus encore.",
  keywords: ["santé", "médecine", "téléconsultation", "prescription", "médecin", "patient"],
  authors: [{ name: "MediSystem" }],
  creator: "MediSystem",
  publisher: "MediSystem",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteConfig = await getSiteConfig()

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content={siteConfig.primaryColor} />
      </head>
      <body className={inter.className}>
        <ApolloWrapper>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NotificationProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </NotificationProvider>
        </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  )
}



import './globals.css'
import {NotificationProvider} from "@/components/notification-provider";
