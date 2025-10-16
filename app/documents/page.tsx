"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDocumentStore } from "@/store/document-store"
import { useUserStore } from "@/store/user-store"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { FileText, Plus, User, LogOut, ClipboardList, ArrowRight } from "lucide-react"
import { createNewDocument } from "@/lib/utils"
import type { Document } from "@/types/data-models"
import { Button } from "@/components/ui/button"

// Helper function to strip HTML tags
function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export default function DocumentsPage() {
  const { documents, setDocuments, setCurrentDocument } = useDocumentStore()
  const { user, updatePreferences } = useUserStore()
  const supabase = getSupabaseClient()
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.user_id) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)

      // First check onboarding status
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("user_id", user.user_id)
        .single()

      // Determine if the user has previously dismissed the onboarding reminder.
      const localDismissKey = `onboarding_dismissed_${user.user_id}`
      const hasDismissed = typeof window !== "undefined" && localStorage.getItem(localDismissKey) === "true"

      // Only show the dialog if onboarding is not completed and the user hasn't dismissed it before.
      if (!profile?.onboarding_completed && !hasDismissed) {
        setShowOnboardingDialog(true)
      }

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.user_id)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error fetching documents:", error)
        setDocuments([])
      } else {
        const validDocuments = (data || []).reduce<Document[]>((acc, doc) => {
          if (
            doc &&
            typeof doc === "object" &&
            "document_id" in doc &&
            typeof doc.document_id === "string" &&
            "user_id" in doc &&
            typeof doc.user_id === "string" &&
            "title" in doc &&
            typeof doc.title === "string" &&
            "content" in doc &&
            typeof doc.content === "string" &&
            "metadata" in doc &&
            typeof doc.metadata === "object" &&
            "created_at" in doc &&
            typeof doc.created_at === "string" &&
            "updated_at" in doc &&
            typeof doc.updated_at === "string"
          ) {
            acc.push({
              document_id: doc.document_id,
              user_id: doc.user_id,
              title: doc.title,
              content: doc.content,
              metadata: doc.metadata as Document["metadata"],
              created_at: doc.created_at,
              updated_at: doc.updated_at,
            })
          }
          return acc
        }, [])
        setDocuments(validDocuments)
      }
      setIsLoading(false)
    }

    fetchDocuments()
  }, [user, setDocuments, supabase])

  const handleCreateNewDocument = async () => {
    if (!user?.user_id) return
    await createNewDocument(supabase, user.user_id, setIsLoading, setCurrentDocument, router)
  }

  const handleDismissOnboarding = () => {
    setShowOnboardingDialog(false)
    // Persist the dismissal so we never show this dialog to the user again on this browser.
    if (user?.user_id) {
      const localDismissKey = `onboarding_dismissed_${user.user_id}`
      if (typeof window !== "undefined") {
        localStorage.setItem(localDismissKey, "true")
      }
    }
    // Still keep it in the in-memory store to hide for current session.
    updatePreferences({ dismissedOnboardingReminder: true })
  }

  // Handler for signing the user out
  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex-1 dark:bg-gray-900 flex flex-col items-center p-6 md:p-10">
      {/* Onboarding Dialog */}
      <Dialog open={showOnboardingDialog} onOpenChange={setShowOnboardingDialog}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white dark:bg-gray-950">
          <div className="bg-primary/5 p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <ClipboardList className="h-6 w-6 text-primary" />
                Complete Your Profile
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 pt-4">
            <DialogDescription className="space-y-4">
              <p className="font-medium text-base">
                Enhance your writing experience by completing your profile. This helps us:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Customize essay suggestions to your background</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Provide relevant examples and templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Tailor the writing style to your preferences</span>
                </li>
              </ul>
            </DialogDescription>
            <div className="flex justify-between items-center mt-8 gap-4">
              <Button variant="outline" onClick={handleDismissOnboarding} className="flex-1">
                I&apos;ll do it later
              </Button>
              <Button onClick={() => router.push('/onboarding')} className="flex-1 bg-primary hover:bg-primary/90">
                Complete Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="sticky-note inline-block px-4 py-2 text-3xl font-bold tracking-tight rotate-[1deg]">Your Essays</h1>

          {/* Profile & Sign-out buttons */}
          <div className="flex gap-4">
            {/* Profile navigation button */}
            <button
              onClick={() => router.push("/profile")}
              className="group relative inline-block"
              aria-label="Go to profile"
            >
              <div className="relative z-10 bg-white inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-6 font-medium text-neutral-600 dark:text-neutral-300 transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3">
                <User className="mr-2 h-5 w-5" />
                Profile
              </div>
              <div className="absolute inset-0 z-0 h-full w-full rounded-md transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3 group-hover:[box-shadow:5px_5px_#a3a3a3,10px_10px_#d4d4d4,15px_15px_#e5e5e5]"></div>
            </button>

            {/* Sign-out button */}
            <button
              onClick={handleSignOut}
              className="group relative inline-block"
              aria-label="Sign out"
            >
              <div className="relative z-10 bg-white inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-red-200 dark:border-red-700 bg-transparent px-6 font-medium text-red-600 dark:text-red-300 transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3">
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </div>
              <div className="absolute inset-0 z-0 h-full w-full rounded-md transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3 group-hover:[box-shadow:5px_5px_#f87171,10px_10px_#fca5a5,15px_15px_#fecaca]"></div>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-12 sm:grid-cols-3 lg:grid-cols-5">
          {/* Create New Document page card */}
          <Card
            onClick={handleCreateNewDocument}
            className="page-card flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 hover:-translate-y-1 border-2 border-dashed border-gray-400/70 w-48 h-56"
            style={{ borderStyle: "dashed" }}
          >
            <Plus className="h-10 w-10 mb-2" />
            <span className="font-semibold">Start Writing</span>
          </Card>

          {/* Existing documents */}
          {documents.map((doc) => (
            <Card
              key={doc.document_id}
              onClick={() => router.push(`/documents/${doc.document_id}`)}
              className="page-card w-48 h-56 flex flex-col hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[12px] text-nowrap font-semibold">
                  <FileText className="h-5 w-5 text-primary" />
                  {doc.title || "Untitled Document"}
                </CardTitle>
                <CardDescription className="text-[12px]">
                  Last updated: {format(new Date(doc.updated_at), "MMM dd, yyyy HH:mm")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-[12px] text-muted-foreground mb-4 line-clamp-4">
                  {stripHtml(doc.content)?.slice(0, 160) || "No content yet."}
                  {stripHtml(doc.content).length > 160 ? "…" : ""}
                </p>
                {/* Click anywhere on the note to open */}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
