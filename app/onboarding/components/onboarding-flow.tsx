"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { PersonalDetailsForm } from "./personal-details-form"
import { AcademicsForm } from "./academics-form"
import { ExperienceForm } from "./experience-form"
import { ExtracurricularsForm } from "./extracurriculars-form"
import { AchievementsForm } from "./achievements-form"
import { QualitiesForm } from "./qualities-form"
import { TonePreferenceForm } from "./tone-preference-form"
import { SupportingDocsForm } from "./supporting-docs-form"
import type {
  PersonalDetails,
  Academic,
  Experience,
  Extracurricular,
  Achievement,
  PersonalQualities,
  TonePreference,
  SupportingDocs
} from "@/types/user-profile"

export type StepData = {
  personal_details?: PersonalDetails
  academics?: Academic[]
  experience?: Experience[]
  extracurriculars?: Extracurricular[]
  achievements?: Achievement[]
  qualities?: PersonalQualities
  tone_preference?: TonePreference
  supporting_docs?: SupportingDocs
  onboarding_completed?: boolean
}

type Step = {
  id: keyof StepData
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>
}

const STEPS: Step[] = [
  {
    id: "supporting_docs",
    title: "Supporting Documents",
    Component: SupportingDocsForm
  },
  {
    id: "personal_details",
    title: "Personal Details",
    Component: PersonalDetailsForm
  },
  {
    id: "academics",
    title: "Academic Background",
    Component: AcademicsForm
  },
  {
    id: "experience",
    title: "Work Experience",
    Component: ExperienceForm
  },
  {
    id: "extracurriculars",
    title: "Extracurricular Activities",
    Component: ExtracurricularsForm
  },
  {
    id: "achievements",
    title: "Achievements",
    Component: AchievementsForm
  },
  {
    id: "qualities",
    title: "Personal Qualities",
    Component: QualitiesForm
  },
  {
    id: "tone_preference",
    title: "Writing Tone",
    Component: TonePreferenceForm
  }
]

type OnboardingFlowProps = {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: StepData) => Promise<void>
  initialData?: StepData
  isEditMode?: boolean
}

export function OnboardingFlow({ isOpen, onClose, onComplete, initialData, isEditMode }: OnboardingFlowProps) {
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState<StepData>(initialData || {})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStep = STEPS[currentStepIndex]
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStepComplete = async (stepData: any) => {
    // Merge the new step data first.
    let updatedData: StepData = {
      ...formData,
      [currentStep.id]: Object.values(stepData)[0]
    }

    // If the user just finished uploading supporting docs AND supplied at least one file, let's
    // attempt to parse those docs via the backend so we can pre-fill subsequent forms.
    if (currentStep.id === "supporting_docs") {
      const docs = updatedData.supporting_docs
      if (docs && (docs.resume || (docs.transcripts && docs.transcripts.length > 0))) {
        try {
          const res = await fetch("/api/parse-supporting-docs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(docs)
          })

          if (res.ok) {
            const { data: parsed } = await res.json()
            // Merge whatever fields we managed to extract.
            updatedData = { ...updatedData, ...parsed }
          } else {
            console.error("Failed to parse supporting docs", await res.text())
          }
        } catch (err) {
          console.error("Error parsing supporting docs:", err)
        }
      }
    }

    setFormData(updatedData)

    // Persist progress after every step
    setIsSubmitting(true)
    try {
      if (currentStepIndex === STEPS.length - 1) {
        await onComplete({ ...updatedData, onboarding_completed: true })
        router.push(isEditMode ? "/profile" : "/documents")
      } else {
        await onComplete(updatedData)
        // Advance to next step only after save succeeds
        setCurrentStepIndex((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prevent closing the dialog while submitting
  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const handleSkip = () => {
    if (currentStepIndex === STEPS.length - 1) {
      onComplete(formData)
      router.push(isEditMode ? "/profile" : "/documents")
    } else {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const CurrentFormComponent = currentStep.Component

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {currentStep.title}
            </h2>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {STEPS.length}
            </p>
          </div>

          <CurrentFormComponent
            onComplete={handleStepComplete}
            initialData={formData[currentStep.id]}
          />

          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              {isEditMode ? "Skip" : "Fill Later"}
            </Button>
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 