import Link from "next/link"
import { ArrowRight, Mic, Camera, BarChart3, Target, Globe, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SokoFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Financial Tracking Made Simple for Small Traders</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Track your income and expenses effortlessly using voice commands and photo receipts. Built specifically for
          small business owners who need simple, powerful financial management.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Tracking Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Manage Your Finances
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Mic className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Voice Input</CardTitle>
              <CardDescription>
                Simply speak your transactions. "Sold 5 shirts for 200 shillings each to John"
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Camera className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Photo Receipts</CardTitle>
              <CardDescription>
                Take photos of receipts and let AI extract the transaction details automatically
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                See your profit, income, and expenses with beautiful charts and insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Target className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>Set and track your financial goals with progress monitoring and alerts</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Multi-Language</CardTitle>
              <CardDescription>Available in English and Swahili, with more languages coming soon</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>Your financial data is encrypted and secure. Works offline when needed</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of small traders who are already using SokoFlow to grow their business
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BarChart3 className="h-6 w-6" />
            <span className="text-xl font-bold">SokoFlow</span>
          </div>
          <p className="text-gray-400">© 2024 SokoFlow. Built for small traders, by small business enthusiasts.</p>
        </div>
      </footer>
    </div>
  )
}
