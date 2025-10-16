"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { Achievement } from "@/types/user-profile"

const achievementSchema = z.object({
  title: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional()
})

const achievementsFormSchema = z.object({
  achievements: z.array(achievementSchema).optional()
})

type AchievementsFormProps = {
  onComplete: (data: { achievements: Achievement[] }) => void
  initialData?: Achievement[]
}

export function AchievementsForm({ onComplete, initialData }: AchievementsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof achievementsFormSchema>>({
    resolver: zodResolver(achievementsFormSchema),
    defaultValues: {
      achievements: initialData || []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "achievements"
  })

  const onSubmit = async (data: z.infer<typeof achievementsFormSchema>) => {
    setIsSubmitting(true)
    try {
      await onComplete({ achievements: data.achievements as Achievement[] })
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    { value: "award", label: "Award" },
    { value: "publication", label: "Publication" },
    { value: "competition", label: "Competition" },
    { value: "other", label: "Other" }
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            Share your awards, publications, competition wins, and other notable achievements.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Achievement {index + 1}</h3>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`achievements.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., First Place in Hackathon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`achievements.${index}.date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`achievements.${index}.category`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`achievements.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your achievement and its significance..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => append({
              title: "",
              date: "",
              description: "",
              category: "award"
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
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