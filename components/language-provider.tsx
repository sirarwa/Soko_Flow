"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define available languages
const languages = {
  en: {
    common: {
      dashboard: "Dashboard",
      transactions: "Transactions",
      add: "Add Transaction",
      settings: "Settings",
      income: "Income",
      expense: "Expense",
      profit: "Profit",
      today: "Today",
      thisWeek: "This Week",
      thisMonth: "This Month",
      thisYear: "This Year",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      loading: "Loading...",
    },
    dashboard: {
      recentTransactions: "Recent Transactions",
      viewAll: "View All",
      incomeVsExpense: "Income vs Expense",
      profitTrend: "Profit Trend",
      noTransactions: "No transactions yet",
      goals: "Financial Goals",
      addGoal: "Add Goal",
    },
    transactions: {
      addNew: "Add New",
      filter: "Filter",
      search: "Search transactions...",
      date: "Date",
      description: "Description",
      category: "Category",
      amount: "Amount",
      actions: "Actions",
      noResults: "No transactions found",
      export: "Export",
    },
    addTransaction: {
      title: "Add Transaction",
      voiceInput: "Voice Input",
      photoInput: "Photo Input",
      manualInput: "Manual Input",
      startRecording: "Start Recording",
      stopRecording: "Stop Recording",
      takePhoto: "Take Photo",
      uploadPhoto: "Upload Photo",
      processingVoice: "Processing your voice input...",
      processingPhoto: "Processing your receipt...",
      amount: "Amount",
      description: "Description",
      category: "Category",
      date: "Date",
      type: "Type",
      vendor: "Vendor/Customer",
      items: "Items",
      addItem: "Add Item",
      saveTransaction: "Save Transaction",
    },
    settings: {
      title: "Settings",
      language: "Language",
      currency: "Currency",
      notifications: "Notifications",
      theme: "Theme",
      account: "Account",
      help: "Help & Support",
      about: "About",
      logout: "Logout",
    },
  },
  sw: {
    common: {
      dashboard: "Dashibodi",
      transactions: "Miamala",
      add: "Ongeza Muamala",
      settings: "Mipangilio",
      income: "Mapato",
      expense: "Matumizi",
      profit: "Faida",
      today: "Leo",
      thisWeek: "Wiki Hii",
      thisMonth: "Mwezi Huu",
      thisYear: "Mwaka Huu",
      save: "Hifadhi",
      cancel: "Ghairi",
      delete: "Futa",
      edit: "Hariri",
      loading: "Inapakia...",
    },
    dashboard: {
      recentTransactions: "Miamala ya Hivi Karibuni",
      viewAll: "Ona Yote",
      incomeVsExpense: "Mapato vs Matumizi",
      profitTrend: "Mwenendo wa Faida",
      noTransactions: "Hakuna miamala bado",
      goals: "Malengo ya Kifedha",
      addGoal: "Ongeza Lengo",
    },
    transactions: {
      addNew: "Ongeza Mpya",
      filter: "Chuja",
      search: "Tafuta miamala...",
      date: "Tarehe",
      description: "Maelezo",
      category: "Kategoria",
      amount: "Kiasi",
      actions: "Vitendo",
      noResults: "Hakuna miamala iliyopatikana",
      export: "Hamisha",
    },
    addTransaction: {
      title: "Ongeza Muamala",
      voiceInput: "Ingizo la Sauti",
      photoInput: "Ingizo la Picha",
      manualInput: "Ingizo la Mkononi",
      startRecording: "Anza Kurekodi",
      stopRecording: "Acha Kurekodi",
      takePhoto: "Piga Picha",
      uploadPhoto: "Pakia Picha",
      processingVoice: "Tunachakata ingizo lako la sauti...",
      processingPhoto: "Tunachakata risiti yako...",
      amount: "Kiasi",
      description: "Maelezo",
      category: "Kategoria",
      date: "Tarehe",
      type: "Aina",
      vendor: "Muuzaji/Mteja",
      items: "Bidhaa",
      addItem: "Ongeza Bidhaa",
      saveTransaction: "Hifadhi Muamala",
    },
    settings: {
      title: "Mipangilio",
      language: "Lugha",
      currency: "Sarafu",
      notifications: "Arifa",
      theme: "Mandhari",
      account: "Akaunti",
      help: "Msaada",
      about: "Kuhusu",
      logout: "Toka",
    },
  },
}

type LanguageContextType = {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string, section?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en")

  useEffect(() => {
    // Get language from localStorage on mount
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage && Object.keys(languages).includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  // Translation function
  const t = (key: string, section = "common") => {
    try {
      // @ts-ignore - We know the structure of our languages object
      return languages[language][section][key] || key
    } catch (error) {
      return key
    }
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
