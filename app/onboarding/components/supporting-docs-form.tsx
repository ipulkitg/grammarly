"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Trash2, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { SupportingDocs } from "@/types/user-profile"

const supportingDocsSchema = z.object({
  resume: z.any().optional().nullable(),
  transcripts: z.array(z.any()).optional()
})

type SupportingDocsFormProps = {
  onComplete: (data: { supporting_docs: SupportingDocs }) => void
  initialData?: SupportingDocs
}

export function SupportingDocsForm({ onComplete, initialData }: SupportingDocsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transcriptFiles, setTranscriptFiles] = useState<File[]>(initialData?.transcripts ? [] : [])

  const form = useForm<z.infer<typeof supportingDocsSchema>>({
    resolver: zodResolver(supportingDocsSchema),
    defaultValues: {
      resume: null,
      transcripts: []
    }
  })

  const uploadFile = async (file: File, type: "resume" | "transcript"): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    const { url } = await response.json()
    return url
  }

  const onSubmit = async (data: z.infer<typeof supportingDocsSchema>) => {
    setIsSubmitting(true)
    try {
      const uploadedData: SupportingDocs = {
        resume: null,
        transcripts: []
      }

      // Upload resume if provided
      if (data.resume) {
        try {
          uploadedData.resume = await uploadFile(data.resume, "resume")
        } catch (error) {
          console.error("Error uploading resume:", error)
          toast({
            title: "Error uploading resume",
            description: "Please try again or skip this step.",
            variant: "destructive"
          })
          setIsSubmitting(false)
          return
        }
      }

      // Upload transcripts if provided
      if (transcriptFiles.length > 0) {
        try {
          uploadedData.transcripts = await Promise.all(
            transcriptFiles.map(file => uploadFile(file, "transcript"))
          )
        } catch (error) {
          console.error("Error uploading transcripts:", error)
          toast({
            title: "Error uploading transcripts",
            description: "Please try again or skip this step.",
            variant: "destructive"
          })
          setIsSubmitting(false)
          return
        }
      }

      await onComplete({ supporting_docs: uploadedData })
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error saving documents",
        description: "Please try again or skip this step.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTranscriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setTranscriptFiles((prev) => [...prev, ...newFiles])
      form.setValue("transcripts", [...transcriptFiles, ...newFiles])
    }
  }

  const removeTranscript = (index: number) => {
    const updatedFiles = transcriptFiles.filter((_, i) => i !== index)
    setTranscriptFiles(updatedFiles)
    form.setValue("transcripts", updatedFiles)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
          <CardDescription>
            Upload your resume and academic transcripts to help us better understand your background.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="resume"
            render={({ field: { onChange, value } }) => (
              <FormItem>
                <FormLabel>Resume</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        onChange(file)
                      }}
                    />
                    {value && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{value.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onChange(null)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transcripts"
            render={() => (
              <FormItem>
                <FormLabel>Transcripts</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {transcriptFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTranscript(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
                      <label
                        htmlFor="transcript-upload"
                        className="flex flex-col items-center gap-2 cursor-pointer"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload transcripts
                        </span>
                        <Input
                          id="transcript-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          multiple
                          className="hidden"
                          onChange={handleTranscriptUpload}
                        />
                      </label>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>

        <div className="flex justify-end px-6 pb-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Complete"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 