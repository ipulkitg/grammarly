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
import type { Academic } from "@/types/user-profile"

const academicSchema = z.object({
  degree: z.string().optional(),
  gpa: z.string().optional(),
  major: z.string().optional(),
  coursework: z.array(z.string()).optional(),
  research: z.string().optional()
})

const academicsFormSchema = z.object({
  academics: z.array(academicSchema).optional()
})

type AcademicsFormProps = {
  onComplete: (data: { academics: Academic[] }) => void
  initialData?: Academic[]
}

export function AcademicsForm({ onComplete, initialData }: AcademicsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCoursework, setNewCoursework] = useState("")

  const form = useForm<z.infer<typeof academicsFormSchema>>({
    resolver: zodResolver(academicsFormSchema),
    defaultValues: {
      academics: initialData || [{ degree: "", gpa: "", major: "", coursework: [], research: "" }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "academics"
  })

  const onSubmit = async (data: z.infer<typeof academicsFormSchema>) => {
    setIsSubmitting(true)
    try {
      await onComplete({ academics: data.academics as Academic[] })
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddCoursework = (index: number) => {
    if (!newCoursework.trim()) return
    const currentCoursework = form.getValues(`academics.${index}.coursework`) || []
    form.setValue(`academics.${index}.coursework`, [...currentCoursework, newCoursework.trim()])
    setNewCoursework("")
  }

  const handleRemoveCoursework = (academicIndex: number, courseIndex: number) => {
    const currentCoursework = form.getValues(`academics.${academicIndex}.coursework`) || []
    form.setValue(
      `academics.${academicIndex}.coursework`,
      currentCoursework.filter((_, index) => index !== courseIndex)
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CardHeader>
          <CardTitle>Academic Background</CardTitle>
          <CardDescription>
            Tell us about your educational background and achievements.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Academic Record {index + 1}</h3>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name={`academics.${index}.degree`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bachelor of Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`academics.${index}.major`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Major</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`academics.${index}.gpa`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GPA</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3.8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Relevant Coursework</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a course"
                    value={newCoursework}
                    onChange={(e) => setNewCoursework(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddCoursework(index)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.getValues(`academics.${index}.coursework`)?.map((course, courseIndex) => (
                    <div
                      key={courseIndex}
                      className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md"
                    >
                      <span className="text-sm">{course}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => handleRemoveCoursework(index, courseIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name={`academics.${index}.research`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe any research projects or experiences"
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
            onClick={() => append({ degree: "", gpa: "", major: "", coursework: [], research: "" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Academic Record
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