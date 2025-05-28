"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/components/language-provider"

export function IncomeExpenseChart() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Get last 6 months of data
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, type, date")
          .eq("user_id", user.id)
          .gte("date", sixMonthsAgo.toISOString().split("T")[0])

        if (transactions) {
          // Group by month
          const monthlyData: { [key: string]: { income: number; expense: number } } = {}

          transactions.forEach((transaction) => {
            const month = new Date(transaction.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })

            if (!monthlyData[month]) {
              monthlyData[month] = { income: 0, expense: 0 }
            }

            if (transaction.type === "income") {
              monthlyData[month].income += Number(transaction.amount)
            } else {
              monthlyData[month].expense += Number(transaction.amount)
            }
          })

          const chartData = Object.entries(monthlyData).map(([month, values]) => ({
            month,
            income: values.income,
            expense: values.expense,
          }))

          setData(chartData)
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-2">
          <CardTitle>{t("incomeVsExpense", "dashboard")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-2">
        <CardTitle>{t("incomeVsExpense", "dashboard")}</CardTitle>
        <CardDescription>Monthly comparison of income vs expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            income: {
              label: "Income",
              color: "hsl(var(--chart-income))",
            },
            expense: {
              label: "Expense",
              color: "hsl(var(--chart-expense))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={40} />
              <ChartTooltip cursor={{ opacity: 0.1 }} content={<ChartTooltipContent />} />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                animationDuration={1000}
              />
              <Bar
                dataKey="expense"
                fill="var(--color-expense)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
