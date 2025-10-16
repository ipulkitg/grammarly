"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="rounded-lg bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-destructive">
          Something went wrong!
        </h2>
        <p className="mb-4 text-muted-foreground">
          {error.message || "An error occurred while loading the onboarding flow."}
        </p>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          <Button onClick={() => reset()}>Try Again</Button>
        </div>
      </div>
    </div>
  )
} 