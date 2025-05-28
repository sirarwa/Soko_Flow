"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Home,
  Plus,
  Receipt,
  Settings,
  Menu,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Bell,
  Search,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Suspense } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t, language } = useLanguage()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      setUser(user)
      setIsLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/auth")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const navigation = [
    { name: t("dashboard", "common"), href: "/dashboard", icon: Home },
    { name: t("add", "common"), href: "/dashboard/add", icon: Plus },
    { name: t("transactions", "common"), href: "/dashboard/transactions", icon: Receipt },
    { name: t("settings", "common"), href: "/dashboard/settings", icon: Settings },
  ]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Loading SokoFlow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm shadow-sm"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-r border-border/50">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 p-6 border-b">
              <div className="bg-primary/10 p-2 rounded-md">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                SokoFlow
              </span>
            </div>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 bg-muted/50" />
              </div>
            </div>

            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-foreground hover:bg-muted/80 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="bg-primary/10 p-1.5 rounded-md">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span>{item.name}</span>
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Free Account</p>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>

              <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout", "settings")}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border/50 shadow-md overflow-y-auto">
          <div className="flex items-center gap-3 p-6 border-b">
            <div className="bg-primary/10 p-2 rounded-md">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SokoFlow
            </span>
          </div>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 bg-muted/50" />
            </div>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-1">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200
                  ${
                    item.href === "/dashboard"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground hover:bg-muted/80"
                  }
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`p-1.5 rounded-md ${item.href === "/dashboard" ? "bg-primary-foreground/20" : "bg-primary/10"}`}
                >
                  <item.icon
                    className={`h-4 w-4 ${item.href === "/dashboard" ? "text-primary-foreground" : "text-primary"}`}
                  />
                </div>
                <span>{item.name}</span>
                {item.name === t("transactions", "common") && (
                  <Badge className="ml-auto bg-primary/20 text-primary hover:bg-primary/30 px-1.5">3</Badge>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-4 mt-auto">
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Need help?</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Contact our support team for assistance with your account.
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs">
                Contact Support
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Free Account</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-72">
        <main className="p-4 md:p-8 animate-fade-in">
          <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}
