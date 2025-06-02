import { Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import NewCertificateForm from "./certificate-form";
import { fetchGraphQL } from "@/lib/graphql-client";

interface Patient {
  id: string;
  date_of_birth: string;
  users: {
    first_name: string;
    last_name: string;
  };
}

async function fetchPatients() {
  try {
    const result = await fetchGraphQL(
        `
        query FindManyPatients {
          findManyPatients {
            id
            date_of_birth
            users {
              first_name
              last_name
            }
          }
        }
      `
    );
    return result.data.findManyPatients || [];
  } catch (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
}

export default async function NewMedicalCertificatePage() {
  const patients: Patient[] = await fetchPatients();
  console.log("this is the patients", patients);

  return (
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/doctor/certificates">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux certificats
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Nouveau certificat médical</CardTitle>
              <CardDescription>Créez un certificat médical pour un patient</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                  fallback={
                    <div className="flex justify-center items-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Chargement du formulaire...</p>
                      </div>
                    </div>
                  }
              >
                <NewCertificateForm patients={patients} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}