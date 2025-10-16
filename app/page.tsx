"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Target,
  Zap,
  Trophy,
  ArrowRight,
  FileText,
} from "lucide-react"

export default function Home() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push("/documents")
      }
    }
    checkSession()
  }, [supabase, router])

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-stone-800" />
            <span className="text-2xl font-bold text-stone-800">WordWise</span>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-stone-700 hover:bg-stone-100"
              onClick={() => router.push("/login")}
            >
              Sign In
            </Button>
            <Button
              variant="default"
              className="bg-stone-800 hover:bg-stone-900 text-white"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-yellow-200 text-stone-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
            Trusted by ambitious students worldwide
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-stone-800 mb-6 leading-tight">
            Craft Essays Worthy of Your Dream School
          </h1>

          <p className="text-xl text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform every sentence from ordinary to{' '}
            <span className="bg-yellow-200 px-2 py-1 rounded font-medium text-stone-800">extraordinary</span>. Join
            ambitious students who&apos;ve unlocked Ivy-League doors with unforgettable storytelling.
          </p>

          <div className="mb-16">
            <Button
              size="lg"
              className="bg-stone-800 hover:bg-stone-900 text-white font-medium px-12 py-4 text-lg rounded-lg"
              onClick={() => router.push("/signup")}
            >
              🚀 Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Precision Storytelling */}
          <Card className="bg-white border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-4">Precision Storytelling</h3>
              <p className="text-stone-600 leading-relaxed">
                Our AI coach elevates your narrative, ensuring every word resonates with admissions committees.
              </p>
            </CardContent>
          </Card>

          {/* Lightning-Fast Feedback */}
          <Card className="bg-white border-yellow-300 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-yellow-200 text-stone-800 px-3 py-1 rounded-full text-xs font-medium">
                Most Popular
              </div>
            </div>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-4">Lightning-Fast Feedback</h3>
              <p className="text-stone-600 leading-relaxed">
                Get instant, actionable insights on tone, structure, and impact—polish drafts in minutes.
              </p>
            </CardContent>
          </Card>

          {/* Proven Success */}
          <Card className="bg-white border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-4">Proven Success</h3>
              <p className="text-stone-600 leading-relaxed">
                WordWise writers enjoy a{' '}
                <span className="bg-yellow-200 px-1 rounded font-medium text-stone-800">3x higher acceptance rate</span>{' '}
                at elite universities worldwide.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-yellow-200 text-stone-800 px-4 py-2 rounded-full text-sm font-medium mb-8 inline-block">
            Ready to Experience WordWise?
          </div>

          <h2 className="text-4xl font-bold text-stone-800 mb-6">
            Start crafting your winning essay today.
          </h2>

          <p className="text-xl text-stone-600 mb-10">
            No credit card required.
          </p>

          <div className="space-y-4">
            <Button
              size="lg"
              className="bg-stone-800 hover:bg-stone-900 text-white font-medium px-12 py-4 text-lg rounded-lg w-full sm:w-auto"
              onClick={() => router.push("/signup")}
            >
              🚀 Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="text-sm text-stone-500">
              Free account • No credit card • Instant access
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
