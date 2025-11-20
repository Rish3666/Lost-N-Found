"use client"

import * as React from "react"
import Image from "next/image"
import { X, Upload, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value: string[]
    onChange: (value: string[]) => void
    maxFiles?: number
}

export function ImageUpload({ value, onChange, maxFiles = 5 }: ImageUploadProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const newImages: string[] = []
        Array.from(files).forEach((file) => {
            if (value.length + newImages.length >= maxFiles) return
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    onChange([...value, event.target.result as string])
                }
            }
            reader.readAsDataURL(file)
        })
    }

    const removeImage = (index: number) => {
        const newValue = [...value]
        newValue.splice(index, 1)
        onChange(newValue)
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {value.map((url, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                        <Image
                            src={url}
                            alt="Uploaded image"
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                {value.length < maxFiles && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/50 text-muted-foreground hover:bg-muted"
                    >
                        <ImagePlus className="h-8 w-8" />
                        <span className="text-xs">Upload Photo</span>
                    </button>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
                Upload up to {maxFiles} photos. First photo will be the cover.
            </p>
        </div>
    )
}
