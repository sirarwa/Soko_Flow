import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

// Schema for transaction extraction
const TransactionSchema = z.object({
  type: z.enum(["income", "expense"]).describe("Whether this is money coming in (income) or going out (expense)"),
  amount: z.number().describe("The monetary amount of the transaction"),
  description: z.string().describe("A clear description of the transaction"),
  category: z
    .string()
    .optional()
    .describe("The category this transaction belongs to (e.g., Sales, Transport, Food, etc.)"),
  vendor: z.string().optional().describe("The name of the person, business, or entity involved in the transaction"),
  customer: z.string().optional().describe("The customer name if this is a sale"),
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number(),
        price: z.number(),
      }),
    )
    .optional()
    .describe("Individual items if mentioned in the transaction"),
  confidence: z.number().min(0).max(1).describe("Confidence level of the extraction (0-1)"),
  notes: z.string().optional().describe("Any additional notes or context"),
})

export type ExtractedTransaction = z.infer<typeof TransactionSchema>

export async function extractTransactionFromText(text: string, language = "en"): Promise<ExtractedTransaction> {
  try {
    const systemPrompt =
      language === "sw"
        ? `Wewe ni msaidizi wa kifedha unayesaidia wafanyabiashara wadogo kutambua maelezo ya miamala kutoka kwa maelezo ya sauti. 
         Tambua aina ya muamala (mapato au matumizi), kiasi, maelezo, na maelezo mengine muhimu.
         Kama hakuna kiasi kilichotajwa wazi, jaribu kukadiria kutoka kwa muktadha.
         Rudisha ujumbe wa makosa kama maelezo hayaeleweki kabisa.`
        : `You are a financial assistant helping small business owners extract transaction details from voice descriptions.
         Identify the transaction type (income or expense), amount, description, and other relevant details.
         If no amount is explicitly mentioned, try to estimate from context.
         Return an error message if the description is completely unclear.`

    const userPrompt =
      language === "sw"
        ? `Tambua maelezo ya muamala kutoka kwa maelezo haya ya sauti: "${text}"`
        : `Extract transaction details from this voice description: "${text}"`

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
      schema: TransactionSchema,
    })

    return object
  } catch (error) {
    console.error("Error extracting transaction:", error)
    throw new Error("Failed to process voice input. Please try again.")
  }
}

// Schema for receipt OCR extraction
const ReceiptSchema = z.object({
  vendor: z.string().describe("The business or vendor name from the receipt"),
  date: z.string().optional().describe("The date of the transaction (YYYY-MM-DD format)"),
  total: z.number().describe("The total amount on the receipt"),
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().default(1),
        price: z.number(),
      }),
    )
    .describe("Individual items from the receipt"),
  category: z.string().describe("Suggested category for this type of purchase"),
  confidence: z.number().min(0).max(1).describe("Confidence level of the OCR extraction"),
  currency: z.string().optional().describe("Currency if detected"),
})

export type ExtractedReceipt = z.infer<typeof ReceiptSchema>

export async function extractReceiptData(ocrText: string, language = "en"): Promise<ExtractedReceipt> {
  try {
    const systemPrompt =
      language === "sw"
        ? `Wewe ni msaidizi wa kutambua maelezo ya risiti. Tambua jina la biashara, tarehe, jumla, na bidhaa kutoka kwa maandishi ya risiti.
         Pendekeza kategoria inayofaa kwa aina hii ya ununuzi.`
        : `You are a receipt analysis assistant. Extract business name, date, total, and items from receipt text.
         Suggest an appropriate category for this type of purchase.`

    const userPrompt =
      language === "sw"
        ? `Tambua maelezo ya risiti kutoka kwa maandishi haya: "${ocrText}"`
        : `Extract receipt details from this OCR text: "${ocrText}"`

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
      schema: ReceiptSchema,
    })

    return object
  } catch (error) {
    console.error("Error extracting receipt data:", error)
    throw new Error("Failed to process receipt. Please try again.")
  }
}

// Smart categorization service
export async function suggestCategory(
  description: string,
  type: "income" | "expense",
  language = "en",
): Promise<string> {
  try {
    const categories = {
      income: ["Sales", "Services", "Consulting", "Rental", "Investment", "Other Income"],
      expense: [
        "Inventory",
        "Transport",
        "Office Supplies",
        "Marketing",
        "Utilities",
        "Food & Beverages",
        "Equipment",
        "Other Expenses",
      ],
    }

    const systemPrompt =
      language === "sw"
        ? `Pendekeza kategoria bora kwa muamala huu kutoka kwa orodha iliyotolewa. Rudisha jina la kategoria tu.`
        : `Suggest the best category for this transaction from the provided list. Return only the category name.`

    const userPrompt = `Transaction: "${description}"
Type: ${type}
Available categories: ${categories[type].join(", ")}

Suggest the most appropriate category:`

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
      schema: z.object({
        category: z.string().describe("The most appropriate category from the list"),
      }),
    })

    return object.category
  } catch (error) {
    console.error("Error suggesting category:", error)
    return type === "income" ? "Other Income" : "Other Expenses"
  }
}
