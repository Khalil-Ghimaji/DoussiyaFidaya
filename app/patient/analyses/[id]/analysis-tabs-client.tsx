"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AnalysisTabsClient({
  analysis,
  getResultStatus,
}: {
  analysis: any
  getResultStatus: (status: string) => { label: string; variant: string }
}) {
  const [activeTab, setActiveTab] = useState("results")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="results">Résultats</TabsTrigger>
        <TabsTrigger value="summary">Résumé</TabsTrigger>
        <TabsTrigger value="history">Historique</TabsTrigger>
      </TabsList>

      <TabsContent value="results">
        <Card>
          <CardHeader>
            <CardTitle>Résultats détaillés</CardTitle>
            <CardDescription>
              Analyse prescrite par {analysis.doctor.firstName} {analysis.doctor.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Paramètre</th>
                    <th className="py-3 px-4 text-left font-medium">Résultat</th>
                    <th className="py-3 px-4 text-left font-medium">Unité</th>
                    <th className="py-3 px-4 text-left font-medium">Valeurs de référence</th>
                    <th className="py-3 px-4 text-left font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.results.map((result: any, index: number) => {
                    const status = getResultStatus(result.status)
                    return (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">{result.name}</td>
                        <td className="py-3 px-4 font-medium">{result.value}</td>
                        <td className="py-3 px-4">{result.unit}</td>
                        <td className="py-3 px-4">{result.range}</td>
                        <td className="py-3 px-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {analysis.comments && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Commentaires du laboratoire</h3>
                <p className="text-muted-foreground">{analysis.comments}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="summary">
        <Card>
          <CardHeader>
            <CardTitle>Résumé de l'analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Principales observations</h3>
                <p className="text-muted-foreground">
                  {analysis.results.some((r: any) => r.status === "high" || r.status === "low")
                    ? "Certaines valeurs sont anormales. Consultez les détails dans l'onglet Résultats."
                    : "Tous les paramètres sont dans les normes."}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Recommandations</h3>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Suivi régulier recommandé</li>
                  <li>Consultez votre médecin pour l'interprétation complète de ces résultats</li>
                  {analysis.results.some(
                    (r: any) => r.name.toLowerCase().includes("glucose") && r.status === "high",
                  ) && (
                    <>
                      <li>Contrôle du régime alimentaire</li>
                      <li>Activité physique régulière recommandée</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Historique des analyses</CardTitle>
            <CardDescription>Évolution des paramètres clés au fil du temps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                Les données historiques ne sont pas disponibles pour cette analyse.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

