"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, File, Image, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // en MB
  className?: string
  label?: string
}

export function FileUpload({
  onFileSelect,
  accept = "image/*,application/pdf",
  maxSize = 10,
  className,
  label = "Glissez-déposez un fichier ou cliquez pour parcourir",
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    // Vérifier la taille du fichier
    if (file.size > maxSize * 1024 * 1024) {
      setError(`La taille du fichier dépasse ${maxSize}MB`)
      return false
    }

    // Vérifier le type de fichier
    const acceptedTypes = accept.split(",")
    const fileType = file.type

    if (
      !acceptedTypes.some((type) => {
        if (type.includes("*")) {
          return fileType.startsWith(type.split("*")[0])
        }
        return type === fileType
      })
    ) {
      setError("Type de fichier non pris en charge")
      return false
    }

    setError(null)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-10 w-10 text-muted-foreground" />

    const fileType = selectedFile.type
    if (fileType.startsWith("image/")) {
      return <Image className="h-10 w-10 text-blue-500" />
    } else if (fileType === "application/pdf") {
      return <FileText className="h-10 w-10 text-red-500" />
    } else {
      return <File className="h-10 w-10 text-gray-500" />
    }
  }

  return (
    <div className={className}>
      <Card
        className={cn(
          "border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          error && "border-destructive bg-destructive/5",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={handleChange} />

          {selectedFile ? (
            <div className="flex flex-col items-center">
              {getFileIcon()}
              <p className="mt-2 font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          ) : (
            <>
              {getFileIcon()}
              <p className="mt-2 text-sm text-muted-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Formats acceptés: {accept.replace("image/*", "Images").replace("application/pdf", "PDF")} (max {maxSize}
                MB)
              </p>
            </>
          )}

          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

