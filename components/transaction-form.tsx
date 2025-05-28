"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Plus, Trash2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { supabase } from "@/lib/supabase"

type TransactionFormProps = {
  initialData?: {
    type: "income" | "expense"
    amount: number
    description: string
    category?: string
    vendor?: string
    items?: { name: string; quantity: number; price: number }[]
    date?: string
    receipt_url?: string
  }
  onSave: () => void
}

export function TransactionForm({ initialData, onSave }: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">(initialData?.type || "expense")
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [category, setCategory] = useState(initialData?.category || "")
  const [vendor, setVendor] = useState(initialData?.vendor || "")
  const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date())
  const [items, setItems] = useState<{ name: string; quantity: number; price: number }[]>(initialData?.items || [])
  const [receiptUrl, setReceiptUrl] = useState(initialData?.receipt_url || "")
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: userCategories } = await supabase.from("categories").select("*").eq("user_id", user.id)

          const { data: defaultCategories } = await supabase.from("categories").select("*").is("user_id", null)

          const allCategories = [...(userCategories || []), ...(defaultCategories || [])]
          setCategories(allCategories)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, price: 0 }])
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    // @ts-ignore
    newItems[index][field] = value
    setItems(newItems)

    if (field === "quantity" || field === "price") {
      const total = newItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
      setAmount(total.toString())
    }
  }

  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)

    const total = newItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
    setAmount(total.toString())
  }

  const saveTransaction = async () => {
    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }

    if (!description) {
      toast({
        title: "Missing Description",
        description: "Please enter a description.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const transaction = {
        user_id: user.id,
        type,
        amount: Number.parseFloat(amount),
        description,
        category,
        vendor,
        date: format(date, "yyyy-MM-dd"),
        items: items.length > 0 ? items : null,
        receipt_url: receiptUrl || null,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("transactions").insert(transaction)
      if (error) throw error

      toast({
        title: "Transaction Saved",
        description: "Your transaction has been saved successfully.",
      })

      onSave()
    } catch (error: any) {
      console.error("Error saving transaction:", error)
      toast({
        title: "Save Failed",
        description: error.message || "Could not save your transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredCategories = categories.filter((cat) => cat.type === type || cat.type === "both")

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        saveTransaction()
      }}
    >
      <div className="space-y-2">
        <Label>{t("type", "addTransaction")}</Label>
        <RadioGroup
          value={type}
          onValueChange={(value) => setType(value as "income" | "expense")}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="income" id="income" />
            <Label htmlFor="income" className="font-normal">
              {t("income", "common")}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expense" id="expense" />
            <Label htmlFor="expense" className="font-normal">
              {t("expense", "common")}
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t("amount", "addTransaction")}</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("description", "addTransaction")}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter transaction description"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">{t("category", "addTransaction")}</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("date", "addTransaction")}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vendor">{type === "income" ? "Customer" : t("vendor", "addTransaction")}</Label>
        <Input
          id="vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          placeholder={type === "income" ? "Customer name" : "Vendor name"}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>{t("items", "addTransaction")}</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            {t("addItem", "addTransaction")}
          </Button>
        </div>

        {items.length > 0 && (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Item</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    placeholder="Item name"
                  />
                </div>
                <div className="w-20">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="w-24">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {receiptUrl && (
        <div className="space-y-2">
          <Label>Receipt</Label>
          <div className="relative">
            <img
              src={receiptUrl || "/placeholder.svg"}
              alt="Receipt"
              className="w-full h-48 object-contain bg-muted rounded-md"
            />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          t("saveTransaction", "addTransaction")
        )}
      </Button>
    </form>
  )
}
