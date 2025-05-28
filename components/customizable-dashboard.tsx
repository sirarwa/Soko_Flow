"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Settings, Plus, Loader2, MoveVertical } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { supabase } from "@/lib/supabase"

// Import dashboard widgets
import { IncomeExpenseChart } from "./income-expense-chart"
import { RecentTransactions } from "./recent-transactions"

// Simple widget components for missing ones
function FinancialSummary() {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Income</span>
            <span className="font-medium text-green-600">KES 50,000</span>
          </div>
          <div className="flex justify-between">
            <span>Total Expenses</span>
            <span className="font-medium text-red-600">KES 30,000</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>Net Profit</span>
            <span className="font-bold text-blue-600">KES 20,000</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfitChart() {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Profit Trend</h3>
        <div className="h-32 bg-muted rounded flex items-center justify-center">
          <span className="text-muted-foreground">Profit chart placeholder</span>
        </div>
      </CardContent>
    </Card>
  )
}

function FinancialGoals() {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Financial Goals</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Monthly Savings</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Revenue Target</span>
              <span>60%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: "60%" }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Widget definitions
const availableWidgets = [
  { id: "summary", name: "Financial Summary", component: FinancialSummary },
  { id: "income-expense", name: "Income vs Expense", component: IncomeExpenseChart },
  { id: "profit", name: "Profit Trend", component: ProfitChart },
  { id: "recent", name: "Recent Transactions", component: RecentTransactions },
  { id: "goals", name: "Financial Goals", component: FinancialGoals },
]

// Sortable widget item
function SortableWidget({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative">
      <div className="absolute top-2 right-2 z-10 bg-background/80 rounded-md p-1 cursor-move">
        <MoveVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  )
}

export function CustomizableDashboard() {
  const [activeWidgets, setActiveWidgets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Load user's dashboard preferences
  useEffect(() => {
    async function loadDashboardPreferences() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data } = await supabase
            .from("user_preferences")
            .select("dashboard_widgets")
            .eq("user_id", user.id)
            .single()

          if (data?.dashboard_widgets) {
            setActiveWidgets(data.dashboard_widgets)
          } else {
            // Default widgets if none are saved
            setActiveWidgets(["summary", "income-expense", "recent", "profit"])
          }
        }
      } catch (error) {
        console.error("Error loading dashboard preferences:", error)
        // Set default widgets on error
        setActiveWidgets(["summary", "income-expense", "recent", "profit"])
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardPreferences()
  }, [])

  // Save user's dashboard preferences
  const saveDashboardPreferences = async (widgets: string[]) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("user_preferences").select("id").eq("user_id", user.id).single()

        if (data) {
          await supabase.from("user_preferences").update({ dashboard_widgets: widgets }).eq("user_id", user.id)
        } else {
          await supabase.from("user_preferences").insert({ user_id: user.id, dashboard_widgets: widgets })
        }
      }
    } catch (error) {
      console.error("Error saving dashboard preferences:", error)
    }
  }

  // Handle widget selection
  const handleWidgetToggle = (widgetId: string) => {
    setActiveWidgets((prev) => {
      if (prev.includes(widgetId)) {
        return prev.filter((id) => id !== widgetId)
      } else {
        return [...prev, widgetId]
      }
    })
  }

  // Handle widget reordering
  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setActiveWidgets((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)

        const newOrder = arrayMove(items, oldIndex, newIndex)
        saveDashboardPreferences(newOrder)
        return newOrder
      })
    }
  }

  // Save widget configuration when dialog closes
  const handleDialogClose = () => {
    saveDashboardPreferences(activeWidgets)
    setIsDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("dashboard", "common")}</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customize Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Select which widgets to display on your dashboard.</p>
              <div className="space-y-2">
                {availableWidgets.map((widget) => (
                  <div key={widget.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`widget-${widget.id}`}
                      checked={activeWidgets.includes(widget.id)}
                      onCheckedChange={() => handleWidgetToggle(widget.id)}
                    />
                    <Label htmlFor={`widget-${widget.id}`}>{widget.name}</Label>
                  </div>
                ))}
              </div>
              <Button onClick={handleDialogClose} className="w-full">
                Save Layout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={activeWidgets} strategy={verticalListSortingStrategy}>
          <div className="grid gap-4 md:grid-cols-2">
            {activeWidgets.map((widgetId) => {
              const widget = availableWidgets.find((w) => w.id === widgetId)
              if (!widget) return null

              const WidgetComponent = widget.component

              return (
                <SortableWidget key={widgetId} id={widgetId}>
                  <WidgetComponent />
                </SortableWidget>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {activeWidgets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">No widgets selected</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Widgets
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Widgets</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    {availableWidgets.map((widget) => (
                      <div key={widget.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`add-widget-${widget.id}`}
                          checked={activeWidgets.includes(widget.id)}
                          onCheckedChange={() => handleWidgetToggle(widget.id)}
                        />
                        <Label htmlFor={`add-widget-${widget.id}`}>{widget.name}</Label>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleDialogClose} className="w-full">
                    Save Layout
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
