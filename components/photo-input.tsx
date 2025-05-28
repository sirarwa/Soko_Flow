"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Camera, Upload, Trash2, Plus, Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { supabase } from "@/lib/supabase"
import { extractReceiptData, type ExtractedReceipt } from "@/lib/ai-service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type PhotoInputProps = {
  onTransactionDetected: (transaction: {
    type: "income" | "expense"
    amount: number
    description: string
    category?: string
    vendor?: string
    receipt_url?: string
    date?: string
    items?: { name: string; quantity: number; price: number }[]
  }) => void
}

export function PhotoInput({ onTransactionDetected }: PhotoInputProps) {
  const [photos, setPhotos] = useState<{ file: File; preview: string; processed?: ExtractedReceipt }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { t, language } = useLanguage()

  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      })

      // Create video element to capture frame
      const video = document.createElement("video")
      video.srcObject = stream
      video.play()

      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")

        if (ctx) {
          ctx.drawImage(video, 0, 0)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: "image/jpeg" })
                addPhoto(file)
              }
            },
            "image/jpeg",
            0.8,
          )
        }

        // Stop the stream
        stream.getTracks().forEach((track) => track.stop())
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files)
      newFiles.forEach((file) => {
        if (file.type.startsWith("image/")) {
          addPhoto(file)
        }
      })
    }
  }

  const addPhoto = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setPhotos((prev) => [
          ...prev,
          {
            file,
            preview: e.target!.result as string,
          },
        ])
      }
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    if (currentPhotoIndex >= index && currentPhotoIndex > 0) {
      setCurrentPhotoIndex((prev) => prev - 1)
    }
  }

  const processPhotos = async () => {
    if (photos.length === 0) {
      toast({
        title: "No Photos",
        description: "Please take or upload at least one photo.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      for (let i = 0; i < photos.length; i++) {
        setCurrentPhotoIndex(i)
        await processPhoto(photos[i], i)
      }
    } catch (error) {
      console.error("Error processing photos:", error)
      toast({
        title: "Processing Error",
        description: "Could not process your photos. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const processPhoto = async (photo: { file: File; preview: string }, index: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Upload to Supabase storage
      const filePath = `receipts/${user.id}/${Date.now()}-${photo.file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, photo.file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("receipts").getPublicUrl(filePath)

      // Simulate OCR text extraction (in a real app, you'd use a service like Google Vision API)
      const mockOcrText = generateMockOcrText()

      // Use AI to extract structured data from OCR text
      const extractedData = await extractReceiptData(mockOcrText, language)

      // Update the photo with processed data
      setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, processed: extractedData } : p)))

      // Convert to transaction format and notify parent
      const transactionData = {
        type: "expense" as const,
        amount: extractedData.total,
        description: `Purchase from ${extractedData.vendor}`,
        category: extractedData.category,
        vendor: extractedData.vendor,
        receipt_url: publicUrl,
        date: extractedData.date,
        items: extractedData.items,
      }

      onTransactionDetected(transactionData)

      toast({
        title: "Receipt Processed",
        description: `Successfully processed receipt from ${extractedData.vendor} with ${Math.round(extractedData.confidence * 100)}% confidence`,
      })
    } catch (error) {
      console.error("Error processing photo:", error)
      throw error
    }
  }

  // Mock OCR text generation (replace with real OCR service)
  const generateMockOcrText = () => {
    const mockReceipts = [
      `CENTRAL MARKET
      123 Market Street
      Nairobi, Kenya
      
      Date: ${new Date().toLocaleDateString()}
      Time: ${new Date().toLocaleTimeString()}
      
      Rice 10kg          KES 500.00
      Beans 5kg          KES 300.00
      Cooking Oil 2L     KES 200.00
      
      Subtotal:          KES 1000.00
      Tax:               KES 160.00
      Total:             KES 1160.00
      
      Payment: Cash
      Thank you for shopping with us!`,

      `CITY TRANSPORT
      Bus Terminal
      
      Date: ${new Date().toLocaleDateString()}
      
      Route: CBD - Westlands
      Fare:              KES 50.00
      
      Total:             KES 50.00
      
      Keep this receipt`,

      `OFFICE SUPPLIES LTD
      456 Business Ave
      
      Date: ${new Date().toLocaleDateString()}
      
      A4 Paper 1 ream    KES 400.00
      Pens (pack of 10)  KES 150.00
      Stapler            KES 250.00
      
      Subtotal:          KES 800.00
      VAT 16%:           KES 128.00
      Total:             KES 928.00`,
    ]

    return mockReceipts[Math.floor(Math.random() * mockReceipts.length)]
  }

  return (
    <div className="flex flex-col space-y-4">
      {photos.length > 0 && (
        <div className="relative">
          <img
            src={photos[currentPhotoIndex].preview || "/placeholder.svg"}
            alt="Receipt preview"
            className="w-full h-48 object-contain bg-muted rounded-md"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => removePhoto(currentPhotoIndex)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {photos[currentPhotoIndex].processed && (
            <div className="absolute top-2 left-2">
              <Badge variant="default" className="bg-green-600">
                <Eye className="h-3 w-3 mr-1" />
                Processed
              </Badge>
            </div>
          )}

          {photos.length > 1 && (
            <div className="flex justify-center mt-2 space-x-1">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentPhotoIndex ? "bg-primary" : "bg-muted-foreground"
                  }`}
                  onClick={() => setCurrentPhotoIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Processed Data Preview */}
      {photos[currentPhotoIndex]?.processed && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Extracted Data</h4>
                <Badge variant={photos[currentPhotoIndex].processed!.confidence > 0.7 ? "default" : "secondary"}>
                  {Math.round(photos[currentPhotoIndex].processed!.confidence * 100)}% confidence
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Vendor:</span>
                  <span className="ml-2 font-medium">{photos[currentPhotoIndex].processed!.vendor}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2 font-medium">
                    {photos[currentPhotoIndex].processed!.currency || "KES"}{" "}
                    {photos[currentPhotoIndex].processed!.total.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2">{photos[currentPhotoIndex].processed!.category}</span>
                </div>
                {photos[currentPhotoIndex].processed!.date && (
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <span className="ml-2">{photos[currentPhotoIndex].processed!.date}</span>
                  </div>
                )}
              </div>

              {photos[currentPhotoIndex].processed!.items.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Items:</span>
                  <div className="mt-1 space-y-1">
                    {photos[currentPhotoIndex].processed!.items.map((item, index) => (
                      <div key={index} className="text-xs bg-muted p-2 rounded">
                        {item.quantity}x {item.name} @ {photos[currentPhotoIndex].processed!.currency || "KES"}{" "}
                        {item.price}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={handleCapture} disabled={isProcessing} className="flex-1">
          <Camera className="mr-2 h-4 w-4" />
          {t("takePhoto", "addTransaction")}
        </Button>

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex-1"
        >
          <Upload className="mr-2 h-4 w-4" />
          {t("uploadPhoto", "addTransaction")}
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>

      {photos.length > 0 && (
        <>
          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center justify-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add More Photos
          </Button>

          <Button onClick={processPhotos} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("processingPhoto", "addTransaction")} ({currentPhotoIndex + 1}/{photos.length})
              </>
            ) : (
              `Process ${photos.length} ${photos.length === 1 ? "Photo" : "Photos"}`
            )}
          </Button>
        </>
      )}
    </div>
  )
}
