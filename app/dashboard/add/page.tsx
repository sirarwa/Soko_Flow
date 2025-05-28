"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Camera, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { VoiceInput } from "@/components/voice-input"
import { PhotoInput } from "@/components/photo-input"
import { TransactionForm } from "@/components/transaction-form"

export default function AddTransactionPage() {
  const [detectedTransaction, setDetectedTransaction] = useState<any>(null)
  const router = useRouter()
  const { t } = useLanguage()

  const handleTransactionDetected = (transaction: any) => {
    setDetectedTransaction(transaction)
  }

  const handleTransactionSaved = () => {
    router.push("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title", "addTransaction")}</h1>
        <p className="text-muted-foreground">Add a new transaction using voice, photo, or manual input</p>
      </div>

      <Tabs defaultValue="voice" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            {t("voiceInput", "addTransaction")}
          </TabsTrigger>
          <TabsTrigger value="photo" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            {t("photoInput", "addTransaction")}
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            {t("manualInput", "addTransaction")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("voiceInput", "addTransaction")}</CardTitle>
              <CardDescription>
                Speak naturally about your transaction. For example: "Sold 5 shirts for 200 shillings each to John"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceInput onTransactionDetected={handleTransactionDetected} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("photoInput", "addTransaction")}</CardTitle>
              <CardDescription>Take a photo of your receipt or upload an existing image</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoInput onTransactionDetected={handleTransactionDetected} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("manualInput", "addTransaction")}</CardTitle>
              <CardDescription>Manually enter your transaction details</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionForm initialData={detectedTransaction} onSave={handleTransactionSaved} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Show detected transaction form */}
      {detectedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle>Review Transaction</CardTitle>
            <CardDescription>Please review and confirm the detected transaction details</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm initialData={detectedTransaction} onSave={handleTransactionSaved} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
