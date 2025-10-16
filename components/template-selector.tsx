"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useDocumentStore } from "@/store/document-store"
import { useUserStore } from "@/store/user-store"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "./loading-spinner"
import { createNewDocument } from "@/lib/utils"

interface Template {
  id: string
  name: string
  content: string
  description: string
}

const TemplateCard = ({ template, isSelected, onClick }: { template: Template; isSelected: boolean; onClick: () => void }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"}`}
    role="button"
    tabIndex={0}
  >
    <Card>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-3">{template.content}</p>
      </CardContent>
    </Card>
  </div>
)

const templates: Template[] = [
  {
    id: "template-1",
    name: "General SOP Template",
    content: `Dear Admissions Committee,

I am writing to express my keen interest in the [Program Name] at [University Name]. My academic background in [Your Field] has provided me with a strong foundation in [relevant skills/knowledge].

During my undergraduate studies, I focused on [specific projects/courses]. My experience at [Company/Lab Name] further solidified my passion for [area of interest].

I am particularly drawn to [University Name]'s [specific research, faculty, or program features]. I believe my skills in [skill 1] and [skill 2] align well with your program's objectives.

My long-term goal is to [career goal]. I am confident that the [Program Name] will equip me with the necessary expertise to achieve this.

Thank you for considering my application. I look forward to the opportunity to contribute to your esteemed program.

Sincerely,
[Your Name]`,
    description: "A versatile template suitable for most graduate programs.",
  },
  {
    id: "template-2",
    name: "Research-Focused SOP Template",
    content: `To the Faculty Admissions Committee,

My fascination with [specific research area] has been a driving force throughout my academic journey. I am applying to the [Program Name] at [University Name] with a strong desire to contribute to cutting-edge research in this field.

My undergraduate research experience, particularly my work on [specific project] under Dr. [Professor's Name], allowed me to develop proficiency in [research methods/tools]. This project culminated in [achievement, e.g., publication, presentation].

I am deeply impressed by the research conducted by Professor [Target Professor's Name] on [their research topic] at [University Name]. My research interests align perfectly with [specific aspect of their research]. I am eager to explore [specific research questions] within your laboratory.

My objective is to pursue a career in academic research, and I am confident that the rigorous training and research opportunities at [University Name] will prepare me for this path.

Thank you for your time and consideration.

Respectfully,
[Your Name]`,
    description: "Ideal for applicants emphasizing research experience and interests.",
  },
  {
    id: "template-3",
    name: "Career-Change SOP Template",
    content: `Dear Admissions Committee,

After [Number] years of professional experience in [Previous Field], I have made the deliberate decision to transition my career into [New Field]. My journey has led me to recognize a profound passion for [specific aspect of new field], which I believe can be best cultivated through the [Program Name] at [University Name].

While my background in [Previous Field] may seem unconventional, the skills I developed, such as [transferable skill 1], [transferable skill 2], and [transferable skill 3], are highly applicable to the demands of [New Field]. My decision is further informed by [specific experience or realization that prompted the change].

I am particularly drawn to [University Name]'s [specific program features, e.g., interdisciplinary approach, practical focus, specific courses]. I am confident that the curriculum and faculty expertise will provide the necessary bridge for my career transition.

My ultimate goal is to [career goal in new field]. I am committed to dedicating myself fully to this new path and believe [University Name] is the ideal environment for me to achieve my aspirations.

Thank you for your consideration of my unique background and aspirations.

Sincerely,
[Your Name]`,
    description: "Designed for applicants transitioning from a different career path.",
  },
]

export function TemplateSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { user } = useUserStore()
  const { setCurrentDocument } = useDocumentStore()
  const supabase = getSupabaseClient()
  const { toast } = useToast()
  const router = useRouter()

  const selectedTemplate = selectedTemplateId ? templates.find((t) => t.id === selectedTemplateId) : null

  const handleUseTemplate = async () => {
    if (!selectedTemplate || !user?.user_id) {
      toast({
        title: "Error",
        description: "Please select a template and ensure you are logged in.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    const doc = await createNewDocument(supabase, user.user_id, undefined, setCurrentDocument, router)
    if (doc) {
      // Update the document with template content
      const { error: updateError } = await supabase
        .from("documents")
        .update({
          title: selectedTemplate.name,
          content: selectedTemplate.content,
          metadata: { word_count: selectedTemplate.content.split(/\s+/).filter(Boolean).length },
        })
        .eq("document_id", doc.document_id)

      if (updateError) {
        console.error("Error updating document with template:", updateError)
        toast({
          title: "Error",
          description: "Failed to apply template to document.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `"${selectedTemplate.name}" loaded into a new document.`,
        })
        setIsOpen(false)
      }
    }
    setIsCreating(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Browse Templates</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select a Template</DialogTitle>
          <DialogDescription>Choose from our collection of Statement of Purpose templates.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-1 overflow-auto">
          <div className="grid gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateId === template.id}
                onClick={() => setSelectedTemplateId(template.id)}
              />
            ))}
          </div>

          {selectedTemplate && (
            <Card className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col">
              <CardHeader className="p-0 mb-4">
                <CardTitle>{selectedTemplate.name}</CardTitle>
                <CardDescription>{selectedTemplate.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-auto">
                <Textarea
                  value={selectedTemplate.content}
                  readOnly
                  className="w-full h-full min-h-[200px] resize-none border-none focus-visible:ring-0"
                />
              </CardContent>
              <Button onClick={handleUseTemplate} disabled={isCreating} className="mt-4">
                {isCreating ? (
                  <>
                    <LoadingSpinner className="mr-2" /> Using Template...
                  </>
                ) : (
                  "Use Template"
                )}
              </Button>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
