"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FilePenLineIcon as Signature, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SignaturePadProps {
  onSignatureComplete: (signatureData: string) => void
  signatureData?: string
}

export default function SignaturePad({ onSignatureComplete, signatureData }: SignaturePadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasSignature, setHasSignature] = useState(!!signatureData)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    setHasSignature(!!signatureData)
  }, [signatureData])

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.lineWidth = 2
        context.lineCap = "round"
        context.strokeStyle = "#000000"

        // Si une signature existe déjà, la dessiner
        if (signatureData) {
          const img = new Image()
          img.onload = () => {
            context.drawImage(img, 0, 0)
          }
          img.src = signatureData
        }
      }
    }
  }, [isOpen, signatureData])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (context) {
      setIsDrawing(true)

      const rect = canvas.getBoundingClientRect()
      let clientX, clientY

      if ("touches" in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      context.beginPath()
      context.moveTo(clientX - rect.left, clientY - rect.top)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (context) {
      const rect = canvas.getBoundingClientRect()
      let clientX, clientY

      if ("touches" in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      context.lineTo(clientX - rect.left, clientY - rect.top)
      context.stroke()
    }
  }

  const stopDrawing = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (context && isDrawing) {
      context.closePath()
      setIsDrawing(false)
    }
  }

  const clearCanvas = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (context) {
      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  const saveSignature = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const signatureData = canvas.toDataURL("image/png")

    onSignatureComplete(signatureData)
    setHasSignature(true)
    setIsOpen(false)

    toast({
      title: "Signature enregistrée",
      description: "Votre signature a été enregistrée avec succès.",
    })
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        {hasSignature ? (
          <div className="border rounded-md p-4 flex items-center justify-center bg-muted/50 w-full">
            <img src={signatureData || "/placeholder.svg"} alt="Signature" className="max-h-16" />
          </div>
        ) : (
          <Button type="button" variant="outline" className="w-full" onClick={() => setIsOpen(true)}>
            <Signature className="mr-2 h-4 w-4" />
            Signer le document
          </Button>
        )}

        {hasSignature && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsOpen(true)}
            title="Modifier la signature"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Signature électronique</DialogTitle>
            <DialogDescription>Veuillez signer dans la zone ci-dessous pour confirmer le document.</DialogDescription>
          </DialogHeader>
          <div className="border rounded-md p-2 bg-white">
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              className="w-full touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={clearCanvas}>
              Effacer
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button type="button" onClick={saveSignature}>
                Confirmer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

