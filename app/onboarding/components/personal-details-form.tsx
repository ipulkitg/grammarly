"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { PersonalDetails } from "@/types/user-profile"

const personalDetailsSchema = z.object({
  name: z.string().optional(),
  pronouns: z.string().optional(),
  cultural_background: z.string().optional(),
  first_gen_status: z.boolean().optional()
})

type PersonalDetailsFormProps = {
  onComplete: (data: { personal_details: PersonalDetails }) => void
  initialData?: PersonalDetails
}

export function PersonalDetailsForm({ onComplete, initialData }: PersonalDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof personalDetailsSchema>>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      name: initialData?.name || "",
      pronouns: initialData?.pronouns || "",
      cultural_background: initialData?.cultural_background || "",
      first_gen_status: initialData?.first_gen_status || false
    }
  })

  const onSubmit = async (data: z.infer<typeof personalDetailsSchema>) => {
    setIsSubmitting(true)
    try {
      await onComplete({ personal_details: data as PersonalDetails })
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
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>
            Tell us about yourself. This information helps us personalize your experience.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormDescription>
                  Your name as you&apos;d like it to appear in your documents.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pronouns"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pronouns</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., they/them, she/her, he/him" {...field} />
                </FormControl>
                <FormDescription>
                  Optional: Share your pronouns to help us address you correctly.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cultural_background"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cultural Background</FormLabel>
                <FormControl>
                  <Input placeholder="Optional: Share your cultural background" {...field} />
                </FormControl>
                <FormDescription>
                  Optional: This helps us understand your unique perspective.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="first_gen_status"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">First-Generation Student</FormLabel>
                  <FormDescription>
                    Are you the first in your family to attend college?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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