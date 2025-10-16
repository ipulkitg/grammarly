"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { Extracurricular } from "@/types/user-profile"

const extracurricularSchema = z.object({
  activity: z.string().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
  duration: z.string().optional()
})

const extracurricularsFormSchema = z.object({
  extracurriculars: z.array(extracurricularSchema).optional()
})

type ExtracurricularsFormProps = {
  onComplete: (data: { extracurriculars: Extracurricular[] }) => void
  initialData?: Extracurricular[]
}

export function ExtracurricularsForm({ onComplete, initialData }: ExtracurricularsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof extracurricularsFormSchema>>({
    resolver: zodResolver(extracurricularsFormSchema),
    defaultValues: {
      extracurriculars: initialData || []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "extracurriculars"
  })

  const onSubmit = async (data: z.infer<typeof extracurricularsFormSchema>) => {
    setIsSubmitting(true)
    try {
      await onComplete({ extracurriculars: data.extracurriculars as Extracurricular[] })
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
          <CardTitle>Extracurricular Activities</CardTitle>
          <CardDescription>
            Share your involvement in clubs, organizations, volunteer work, or hobbies.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Activity {index + 1}</h3>
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
                name={`extracurriculars.${index}.activity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Robotics Club" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`extracurriculars.${index}.role`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Team Lead" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`extracurriculars.${index}.duration`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 years (2020-2022)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`extracurriculars.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your involvement and achievements..."
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
              activity: "",
              role: "",
              description: "",
              duration: ""
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
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