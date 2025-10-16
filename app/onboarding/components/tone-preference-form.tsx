"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

const toneOptions = [
  "professional",
  "academic",
  "conversational",
  "persuasive",
  "narrative"
] as const

type ToneType = typeof toneOptions[number]

const tonePreferenceSchema = z.object({
  tone: z.enum(toneOptions).optional(),
  description: z.string().optional()
})

type TonePreferenceFormData = z.infer<typeof tonePreferenceSchema>

type TonePreferenceFormProps = {
  onComplete: (data: { tone_preference: TonePreferenceFormData }) => void
  initialData?: TonePreferenceFormData
}

export function TonePreferenceForm({ onComplete, initialData }: TonePreferenceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TonePreferenceFormData>({
    resolver: zodResolver(tonePreferenceSchema),
    defaultValues: initialData || {
      tone: undefined,
      description: ""
    }
  })

  const onSubmit = async (data: TonePreferenceFormData) => {
    setIsSubmitting(true)
    try {
      await onComplete({ tone_preference: data })
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toneOptionsConfig = [
    {
      value: "professional" as ToneType,
      label: "Professional",
      description: "Clear, concise, and business-oriented writing style"
    },
    {
      value: "academic" as ToneType,
      label: "Academic",
      description: "Formal, research-oriented writing with scholarly language"
    },
    {
      value: "conversational" as ToneType,
      label: "Conversational",
      description: "Natural, engaging, and easy-to-read style"
    },
    {
      value: "persuasive" as ToneType,
      label: "Persuasive",
      description: "Compelling arguments with strong supporting evidence"
    },
    {
      value: "narrative" as ToneType,
      label: "Narrative",
      description: "Story-like approach that engages through personal experiences"
    }
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CardHeader>
          <CardTitle>Writing Tone Preference</CardTitle>
          <CardDescription>
            Choose your preferred writing style for your Statement of Purpose.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="tone"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Preferred Tone</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-3"
                  >
                    {toneOptionsConfig.map((option) => (
                      <FormItem
                        key={option.value}
                        className="flex items-start space-x-3 space-y-0 rounded-md border p-4"
                      >
                        <FormControl>
                          <RadioGroupItem value={option.value} />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium">
                            {option.label}
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Preferences</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain why you prefer this tone and any specific elements you&apos;d like to emphasize in your writing..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>

        <div className="flex justify-end px-6 pb-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 