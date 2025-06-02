"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

export interface FileUploadProps {
  onUpload: (file: File) => void
  acceptedFileTypes: string
  maxSizeMB: number
}

export function FileUpload({ onUpload, acceptedFileTypes, maxSizeMB }: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.match(acceptedFileTypes)) {
      alert('Type de fichier non supporté')
      return
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      alert(`La taille du fichier doit être inférieure à ${maxSizeMB}MB`)
      return
    }

    onUpload(file)
  }

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
      />
      <Button variant="outline" asChild>
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          Télécharger un fichier
        </label>
      </Button>
    </div>
  )
}

