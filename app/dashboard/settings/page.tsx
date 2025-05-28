"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Globe,
  Bell,
  Shield,
  Download,
  Upload,
  Trash2,
  LogOut,
  Save,
  Camera,
  Mic,
  Smartphone,
  Target,
  HelpCircle,
  Mail,
  Phone,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [preferences, setPreferences] = useState({
    language: "en",
    currency: "KES",
    notifications_enabled: true,
    dashboard_widgets: ["summary", "income-expense", "recent", "profit"],
  })
  const [profile, setProfile] = useState({
    full_name: "",
    business_name: "",
    phone: "",
    location: "",
  })
  const [appSettings, setAppSettings] = useState({
    voice_enabled: true,
    photo_enabled: true,
    auto_categorize: true,
    offline_sync: true,
    biometric_auth: false,
    auto_backup: true,
    receipt_quality: "high",
    voice_language: "en",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Fetch user preferences
      const { data: userPrefs } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

      if (userPrefs) {
        setPreferences(userPrefs)
        setLanguage(userPrefs.language)
      }

      // Set profile data from user metadata or create default
      setProfile({
        full_name: user.user_metadata?.full_name || "",
        business_name: user.user_metadata?.business_name || "",
        phone: user.user_metadata?.phone || "",
        location: user.user_metadata?.location || "",
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Update user preferences
      const { data: existing } = await supabase.from("user_preferences").select("id").eq("user_id", user.id).single()

      if (existing) {
        await supabase.from("user_preferences").update(preferences).eq("user_id", user.id)
      } else {
        await supabase.from("user_preferences").insert({ ...preferences, user_id: user.id })
      }

      // Update user metadata
      await supabase.auth.updateUser({
        data: profile,
      })

      setLanguage(preferences.language)

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: transactions } = await supabase.from("transactions").select("*").eq("user_id", user.id)

      const dataToExport = {
        user_profile: profile,
        preferences: preferences,
        transactions: transactions,
        exported_at: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sokoflow-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export your data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    try {
      // In a real app, you would call a server function to properly delete the account
      // For now, we'll just sign out
      await supabase.auth.signOut()

      toast({
        title: "Account Deletion",
        description: "Please contact support to complete account deletion.",
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed Out",
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("settings", "common")}</h1>
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("settings", "common")}</h1>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Manage your personal and business information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={profile.business_name}
                  onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                  placeholder="Your business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+254 700 000 000"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Business Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                </p>
              </div>
              <Badge variant="secondary">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & Region
            </CardTitle>
            <CardDescription>Set your preferred language and currency settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Display Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="sw">🇰🇪 Kiswahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={preferences.currency}
                  onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">🇰🇪 Kenyan Shilling (KES)</SelectItem>
                    <SelectItem value="USD">🇺🇸 US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">🇬🇧 British Pound (GBP)</SelectItem>
                    <SelectItem value="TZS">🇹🇿 Tanzanian Shilling (TZS)</SelectItem>
                    <SelectItem value="UGX">🇺🇬 Ugandan Shilling (UGX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice_language">Voice Input Language</Label>
                <Select
                  value={appSettings.voice_language}
                  onValueChange={(value) => setAppSettings({ ...appSettings, voice_language: value })}
                >
                  <SelectTrigger id="voice_language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Kiswahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">☀️ Light</SelectItem>
                    <SelectItem value="dark">🌙 Dark</SelectItem>
                    <SelectItem value="system">💻 System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              App Features
            </CardTitle>
            <CardDescription>Configure how the app works for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    <Label htmlFor="voice_enabled">Voice Input</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Enable voice recording for transaction input</p>
                </div>
                <Switch
                  id="voice_enabled"
                  checked={appSettings.voice_enabled}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, voice_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <Label htmlFor="photo_enabled">Photo Input</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Enable camera for receipt scanning</p>
                </div>
                <Switch
                  id="photo_enabled"
                  checked={appSettings.photo_enabled}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, photo_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <Label htmlFor="auto_categorize">Auto Categorization</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Automatically suggest categories for transactions</p>
                </div>
                <Switch
                  id="auto_categorize"
                  checked={appSettings.auto_categorize}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, auto_categorize: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <Label htmlFor="offline_sync">Offline Sync</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Save transactions offline and sync when online</p>
                </div>
                <Switch
                  id="offline_sync"
                  checked={appSettings.offline_sync}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, offline_sync: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <Label htmlFor="biometric_auth">Biometric Authentication</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Use fingerprint or face ID to secure the app</p>
                </div>
                <Switch
                  id="biometric_auth"
                  checked={appSettings.biometric_auth}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, biometric_auth: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <Label htmlFor="auto_backup">Auto Backup</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Automatically backup your data to the cloud</p>
                </div>
                <Switch
                  id="auto_backup"
                  checked={appSettings.auto_backup}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, auto_backup: checked })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receipt_quality">Receipt Photo Quality</Label>
                <Select
                  value={appSettings.receipt_quality}
                  onValueChange={(value) => setAppSettings({ ...appSettings, receipt_quality: value })}
                >
                  <SelectTrigger id="receipt_quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Faster processing)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Better accuracy)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Higher quality improves OCR accuracy but uses more storage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications about transactions and goals</p>
              </div>
              <Switch
                id="notifications"
                checked={preferences.notifications_enabled}
                onCheckedChange={(checked) => setPreferences({ ...preferences, notifications_enabled: checked })}
              />
            </div>

            {preferences.notifications_enabled && (
              <div className="ml-4 space-y-3 border-l-2 border-muted pl-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Transaction reminders</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Goal progress updates</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Weekly summaries</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Bill payment reminders</Label>
                  <Switch />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data & Privacy
            </CardTitle>
            <CardDescription>Manage your data and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={exportData} className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export My Data
              </Button>
              <Button variant="outline" className="justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Data usage analytics</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Crash reporting</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Performance monitoring</Label>
                <Switch />
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Your data is encrypted and stored securely. We never share your financial information with third
                parties.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support & Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Support & Help
            </CardTitle>
            <CardDescription>Get help and contact support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help Center
              </Button>
              <Button variant="outline" className="justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" className="justify-start">
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp Support
              </Button>
              <Button variant="outline" className="justify-start">
                <Smartphone className="h-4 w-4 mr-2" />
                App Tutorial
              </Button>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span>App Version</span>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={handleSignOut} className="flex-1">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button variant="destructive" onClick={deleteAccount} className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Deleting your account will permanently remove all your data and cannot be undone.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
