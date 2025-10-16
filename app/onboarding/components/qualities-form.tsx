"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PersonalQualities, QualityValue } from "@/types/user-profile"

const LeadershipStyles = ['democratic_leadership', 'directive_leadership', 'coaching_leadership'] as const
const CommunicationStyles = ['direct_communication', 'diplomatic_communication', 'analytical_communication'] as const
const WorkStyles = ['structured_work', 'flexible_work', 'innovative_work'] as const

// Zod schema allowing each field to be optional.
const qualitiesFormSchema = z.object({
  leadership: z.enum(LeadershipStyles).optional(),
  communication: z.enum(CommunicationStyles).optional(),
  work: z.enum(WorkStyles).optional()
})

type QualitiesFormProps = {
  onComplete: (data: { qualities: PersonalQualities }) => void
  initialData?: PersonalQualities
}

export function QualitiesForm({ onComplete, initialData }: QualitiesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof qualitiesFormSchema>>({
    resolver: zodResolver(qualitiesFormSchema),
    defaultValues: {
      leadership: (initialData?.find(q => q.endsWith('_leadership')) ?? undefined) as unknown as z.infer<typeof qualitiesFormSchema>["leadership"],
      communication: (initialData?.find(q => q.endsWith('_communication')) ?? undefined) as unknown as z.infer<typeof qualitiesFormSchema>["communication"],
      work: (initialData?.find(q => q.endsWith('_work')) ?? undefined) as unknown as z.infer<typeof qualitiesFormSchema>["work"]
    }
  })

  const onSubmit = async (data: z.infer<typeof qualitiesFormSchema>) => {
    setIsSubmitting(true)
    try {
      const qualities: PersonalQualities = []
      if (data.leadership) qualities.push(data.leadership as QualityValue)
      if (data.communication) qualities.push(data.communication as QualityValue)
      if (data.work) qualities.push(data.work as QualityValue)
      await onComplete({ qualities })
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CardHeader>
          <CardTitle>Personal Qualities</CardTitle>
          <CardDescription>
            Help us understand your personal characteristics and working style.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="leadership"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Leadership Style</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="democratic_leadership" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Democratic - I value team input and collaborative decision-making
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="directive_leadership" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Directive - I provide clear direction and take charge when needed
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="coaching_leadership" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Coaching - I focus on developing others and sharing knowledge
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="communication"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Communication Style</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="direct_communication" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Direct - I communicate clearly and straightforwardly
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="diplomatic_communication" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Diplomatic - I am tactful and consider others&apos; perspectives
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="analytical_communication" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Analytical - I focus on data and detailed explanations
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="work"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Work Style</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="structured_work" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Structured - I prefer organized, methodical approaches
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="flexible_work" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Flexible - I adapt easily to change and new situations
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="innovative_work" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Innovative - I enjoy creative problem-solving and new ideas
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
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