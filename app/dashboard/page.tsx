"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, ArrowRight } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/components/language-provider"
import { IncomeExpenseChart } from "@/components/income-expense-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { CustomizableDashboard } from "@/components/customizable-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
    transactionCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchStats() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Get current month's transactions
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        const startOfMonthStr = startOfMonth.toISOString().split("T")[0]

        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", user.id)
          .gte("date", startOfMonthStr)

        if (transactions) {
          const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)

          const expenses = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0)

          setStats({
            totalIncome: income,
            totalExpenses: expenses,
            profit: income - expenses,
            transactionCount: transactions.length,
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t("dashboard", "common")}</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
            >
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t("dashboard", "common")}
          </h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <Link href="/dashboard/add">
          <Button className="shadow-md hover:shadow-lg transition-all">
            <Plus className="h-4 w-4 mr-2" />
            {t("add", "common")}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("income", "common")}</CardTitle>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              KES {stats.totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("thisMonth", "common")}</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("expense", "common")}</CardTitle>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              KES {stats.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("thisMonth", "common")}</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("profit", "common")}</CardTitle>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${stats.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              KES {stats.profit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("thisMonth", "common")}</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.transactionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("thisMonth", "common")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="custom">Custom Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 animate-fade-in">
          {/* Charts and Recent Transactions */}
          <div className="grid gap-6 md:grid-cols-2">
            <IncomeExpenseChart />
            <RecentTransactions />
          </div>

          <div className="flex justify-center mt-4">
            <Link href="/dashboard/transactions">
              <Button variant="outline" className="group">
                View All Transactions
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="animate-fade-in">
          <CustomizableDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
