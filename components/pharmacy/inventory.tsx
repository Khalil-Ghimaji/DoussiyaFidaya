import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"

// Exemple de données d'inventaire
const inventoryItems = [
  {
    id: 1,
    name: "Amlodipine",
    dosage: "5mg",
    form: "Comprimé",
    stock: 120,
    threshold: 30,
    status: "in-stock",
  },
  {
    id: 2,
    name: "Aspirine",
    dosage: "100mg",
    form: "Comprimé",
    stock: 85,
    threshold: 50,
    status: "in-stock",
  },
  {
    id: 3,
    name: "Cortisone crème",
    dosage: "1%",
    form: "Crème",
    stock: 8,
    threshold: 10,
    status: "low",
  },
  {
    id: 4,
    name: "Furosémide",
    dosage: "40mg",
    form: "Comprimé",
    stock: 0,
    threshold: 20,
    status: "out-of-stock",
  },
  {
    id: 5,
    name: "Ventoline",
    dosage: "100mcg",
    form: "Inhalateur",
    stock: 5,
    threshold: 10,
    status: "low",
  },
  {
    id: 6,
    name: "Bisoprolol",
    dosage: "5mg",
    form: "Comprimé",
    stock: 45,
    threshold: 20,
    status: "in-stock",
  },
  {
    id: 7,
    name: "Atorvastatine",
    dosage: "20mg",
    form: "Comprimé",
    stock: 0,
    threshold: 30,
    status: "out-of-stock",
  },
]

export default function PharmacyInventory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventaire des médicaments</CardTitle>
        <CardDescription>Gérez votre stock de médicaments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Input placeholder="Rechercher un médicament..." className="w-[300px]" />
            <Button variant="outline">Rechercher</Button>
          </div>
          <Button>Ajouter un médicament</Button>
        </div>

        <div className="flex gap-2 mb-4">
          <Badge variant="outline" className="cursor-pointer">
            Tous
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
          >
            En stock
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
          >
            Stock bas
          </Badge>
          <Badge variant="outline" className="cursor-pointer bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            Rupture de stock
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Médicament</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Forme</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Seuil d'alerte</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.dosage}</TableCell>
                <TableCell>{item.form}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>{item.threshold}</TableCell>
                <TableCell>
                  {item.status === "in-stock" && (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    >
                      En stock
                    </Badge>
                  )}
                  {item.status === "low" && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Stock bas
                    </Badge>
                  )}
                  {item.status === "out-of-stock" && (
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      Rupture de stock
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    <Button size="sm">
                      <Package className="mr-2 h-4 w-4" />
                      Commander
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

