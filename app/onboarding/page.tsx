"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { OnboardingFlow } from "./components/onboarding-flow"
import type { StepData } from "./components/onboarding-flow"
import { userProfileSchema } from "@/types/user-profile"
import { useToast } from "@/hooks/use-toast"

export default function OnboardingPage() {
  const [isOpen, setIsOpen] = useState(true)
  const [initialData, setInitialData] = useState<StepData | undefined>(undefined)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/")
        return
      }

      // Attempt to fetch any previously saved onboarding progress so we can
      // resume where the user left off (e.g. keep the uploaded resume visible).
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("personal_details, academics, experience, extracurriculars, achievements, qualities, tone_preference, supporting_docs, onboarding_completed")
        .eq("user_id", session.user.id)
        .single()

      if (error && error.code !== "PGRST116") { // Ignore row not found errors
        console.error("Error fetching existing profile:", error)
      } else if (profile) {
        setInitialData(profile as StepData)
      }
    }
    initialize()
  }, [router, supabase])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripNulls = (value: any): any => {
    if (value === null) return undefined
    if (Array.isArray(value)) return value.map(stripNulls)
    if (typeof value === "object" && value !== null) {
      return Object.entries(value).reduce<Record<string, any>>((acc: any, [k, v]) => {
        const cleaned = stripNulls(v)
        if (cleaned !== undefined) acc[k] = cleaned
        return acc
      }, {})
    }
    return value
  }

  const handleComplete = async (raw: StepData) => {
    const data = stripNulls(raw) as StepData
    try {
      // Validate the data against our schema
      const validationResult = userProfileSchema.safeParse(data)
      
      if (!validationResult.success) {
        console.error("Validation error:", validationResult.error)
        toast({
          title: "Validation Error",
          description: "Some fields have invalid data. Please check your inputs.",
          variant: "destructive"
        })
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/")
        return
      }

      const { error } = await supabase
        .from("user_profiles")
        .upsert(
          {
            user_id: session.user.id,
            ...validationResult.data
          },
          { onConflict: "user_id" }
        )
        .select()
        .single()

      if (error) {
        console.error("Error saving profile:", error)
        toast({
          title: "Error",
          description: `Failed to save profile: ${error.message}`,
          variant: "destructive"
        })
        throw new Error(`Failed to save profile: ${error.message}`)
      }

      // Only redirect the user once the onboarding flow has been fully completed.
      // We can detect this by checking the `onboarding_completed` flag which is
      // set by `OnboardingFlow` after the final step.
      if (data.onboarding_completed) {
        toast({
          title: "Success",
          description: "Your profile has been saved successfully.",
        })

        router.push("/documents")
      } else {
        // For intermediate steps just show a subtle confirmation that progress
        // has been saved and keep the dialog open so the user can continue.
        toast({
          title: "Progress saved",
          description: "You can continue filling out your profile.",
        })
      }
    } catch (error) {
      console.error("Error in handleComplete:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    router.push("/documents")
  }

  return (
    <OnboardingFlow
      isOpen={isOpen}
      onClose={handleClose}
      onComplete={handleComplete}
      initialData={initialData}
    />
  )
} 