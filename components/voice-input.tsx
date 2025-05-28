"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Loader2, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { extractTransactionFromText, type ExtractedTransaction } from "@/lib/ai-service"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type VoiceInputProps = {
  onTransactionDetected: (transaction: {
    type: "income" | "expense"
    amount: number
    description: string
    category?: string
    vendor?: string
    customer?: string
    items?: { name: string; quantity: number; price: number }[]
    date?: string
  }) => void
}

export function VoiceInput({ onTransactionDetected }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedTransaction | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isListening, setIsListening] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  const { toast } = useToast()
  const { t, language } = useLanguage()

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition: SpeechRecognitionStatic = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = language === "sw" ? "sw-KE" : "en-US"

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript + interimTranscript)
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
        if (event.error !== "aborted") {
          toast({
            title: "Speech Recognition Error",
            description: "Could not process your voice. Please try again.",
            variant: "destructive",
          })
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        if (isRecording) {
          // Restart recognition if still recording
          recognition.start()
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [language, isRecording, toast])

  // Audio level monitoring
  const monitorAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)

      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average / 255)

      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(monitorAudioLevel)
      }
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Set up audio context for level monitoring
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      // Start audio level monitoring
      monitorAudioLevel()

      // Set up media recorder for backup
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      setIsRecording(true)
      setTranscript("")
      setExtractedData(null)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    setIsRecording(false)
    setAudioLevel(0)

    // Process the transcript if we have one
    if (transcript.trim()) {
      processTranscript(transcript)
    }
  }

  const processTranscript = async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "No Speech Detected",
        description: "Please try speaking more clearly.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const extractedTransaction = await extractTransactionFromText(text, language)

      if (extractedTransaction.confidence < 0.3) {
        toast({
          title: "Low Confidence",
          description: "Could not clearly understand the transaction. Please try again or use manual input.",
          variant: "destructive",
        })
        return
      }

      setExtractedData(extractedTransaction)

      // Convert to the format expected by the parent component
      const transactionData = {
        type: extractedTransaction.type,
        amount: extractedTransaction.amount,
        description: extractedTransaction.description,
        category: extractedTransaction.category,
        vendor: extractedTransaction.vendor,
        customer: extractedTransaction.customer,
        items: extractedTransaction.items,
      }

      onTransactionDetected(transactionData)

      toast({
        title: "Transaction Detected",
        description: `${extractedTransaction.type === "income" ? "Income" : "Expense"} of ${extractedTransaction.amount} detected with ${Math.round(extractedTransaction.confidence * 100)}% confidence.`,
      })
    } catch (error: any) {
      console.error("Error processing transcript:", error)
      toast({
        title: "Processing Error",
        description: error.message || "Could not process your voice input. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const retryProcessing = () => {
    if (transcript.trim()) {
      processTranscript(transcript)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Recording Button */}
      <div className="relative">
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className={`h-20 w-20 rounded-full transition-all duration-200 ${isRecording ? "animate-pulse" : ""}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          style={{
            transform: isRecording ? `scale(${1 + audioLevel * 0.3})` : "scale(1)",
          }}
        >
          {isRecording ? (
            <MicOff className="h-8 w-8" />
          ) : isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>

        {/* Audio level indicator */}
        {isRecording && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-blue-500 rounded-full transition-all duration-100 ${
                    audioLevel * 5 > i ? "h-4" : "h-1"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center">
        {isRecording ? (
          <div className="space-y-1">
            <p className="text-sm font-medium animate-pulse flex items-center justify-center gap-2">
              {isListening ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {t("stopRecording", "addTransaction")}...
            </p>
            <p className="text-xs text-muted-foreground">
              {language === "sw" ? "Sema kwa uwazi kuhusu muamala wako" : "Speak clearly about your transaction"}
            </p>
          </div>
        ) : isProcessing ? (
          <p className="text-sm font-medium">{t("processingVoice", "addTransaction")}</p>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium">{t("startRecording", "addTransaction")}</p>
            <p className="text-xs text-muted-foreground">
              {language === "sw"
                ? 'Mfano: "Niliuza mashati 5 kwa shilingi 200 kila moja kwa John"'
                : 'Example: "Sold 5 shirts for 200 shillings each to John"'}
            </p>
          </div>
        )}
      </div>

      {/* Live Transcript */}
      {transcript && (
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Transcript</h4>
                {isRecording && (
                  <Badge variant="secondary" className="animate-pulse">
                    Listening...
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{transcript}</p>
              {!isRecording && !isProcessing && !extractedData && (
                <Button size="sm" variant="outline" onClick={retryProcessing}>
                  Process Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Data Preview */}
      {extractedData && (
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Detected Transaction</h4>
                <Badge variant={extractedData.confidence > 0.7 ? "default" : "secondary"}>
                  {Math.round(extractedData.confidence * 100)}% confidence
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span
                    className={`ml-2 font-medium ${
                      extractedData.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {extractedData.type === "income" ? "Income" : "Expense"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="ml-2 font-medium">KES {extractedData.amount.toLocaleString()}</span>
                </div>
                {extractedData.category && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2">{extractedData.category}</span>
                  </div>
                )}
                {extractedData.vendor && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">
                      {extractedData.type === "income" ? "Customer:" : "Vendor:"}
                    </span>
                    <span className="ml-2">{extractedData.vendor}</span>
                  </div>
                )}
              </div>

              {extractedData.items && extractedData.items.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Items:</span>
                  <div className="mt-1 space-y-1">
                    {extractedData.items.map((item, index) => (
                      <div key={index} className="text-xs bg-muted p-2 rounded">
                        {item.quantity}x {item.name} @ KES {item.price}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {extractedData.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Notes:</span>
                  <p className="text-sm mt-1">{extractedData.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
