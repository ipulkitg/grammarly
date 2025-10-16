"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useDocumentStore } from "@/store/document-store"
import { useUserStore } from "@/store/user-store"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "./loading-spinner"
import { createNewDocument } from "@/lib/utils"

interface Example {
  id: string
  university: string
  program: string
  content: string
}

const examples: Example[] = [
  {
    id: "ex-1",
    university: "Stanford University",
    program: "Computer Science",
    content: `My journey into computer science began not in a classroom, but in the intricate world of competitive programming. The elegance of algorithms and the challenge of optimizing solutions captivated me, leading me to pursue a Bachelor's in Computer Science at [Your University]. During my studies, I developed a particular interest in machine learning, culminating in a research project on natural language processing under Dr. [Professor's Name]. My work involved developing a novel neural network architecture for sentiment analysis, achieving a 92% accuracy rate on a benchmark dataset. This experience solidified my desire to delve deeper into the theoretical and practical aspects of AI.

Stanford's Computer Science program, with its pioneering research in [specific Stanford research area, e.g., AI ethics, distributed systems], aligns perfectly with my aspirations. I am particularly drawn to the work of Professor [Stanford Professor's Name] on [their specific research]. I believe my strong foundation in data structures, algorithms, and machine learning, coupled with my passion for innovation, will allow me to make meaningful contributions to your research initiatives. My goal is to develop intelligent systems that can address complex societal challenges, and I am confident that Stanford's rigorous curriculum and collaborative environment will provide the ideal platform for me to achieve this.`,
  },
  {
    id: "ex-2",
    university: "MIT",
    program: "Mechanical Engineering",
    content: `From dismantling household appliances as a child to designing a prosthetic limb in my undergraduate capstone project, my fascination with mechanical engineering has been a constant. My academic record at [Your University] reflects a strong aptitude for thermodynamics, fluid mechanics, and materials science. My capstone project, "Bio-Inspired Robotic Gripper," involved designing and fabricating a gripper that mimicked the dexterity of a human hand, utilizing novel compliant mechanisms. This project not only honed my CAD and simulation skills but also ignited a passion for robotics and biomechanics.

MIT's Mechanical Engineering program, renowned for its interdisciplinary approach and cutting-edge research in [specific MIT research area, e.g., advanced manufacturing, sustainable energy systems], represents the pinnacle of engineering education. I am particularly eager to explore the research opportunities within the [specific MIT lab/center, e.g., Biomimetics Lab] and contribute to projects focused on [specific research interest]. My practical experience in prototyping and my theoretical understanding of mechanical systems make me a strong candidate for the challenges and innovations at MIT. I aspire to develop sustainable and efficient mechanical solutions that can improve quality of life, and I believe MIT is the ideal environment to cultivate these ambitions.`,
  },
  {
    id: "ex-3",
    university: "UC Berkeley",
    program: "Electrical Engineering",
    content: `The intricate dance of electrons and the profound impact of microelectronics on modern society have always captivated me. My undergraduate studies in Electrical Engineering at [Your University] provided a robust theoretical foundation, complemented by hands-on experience in circuit design and signal processing. My most significant project involved developing a low-power wireless sensor network for environmental monitoring, which required expertise in embedded systems and RF communication. This experience, coupled with my coursework in electromagnetics and digital logic, solidified my commitment to advancing the field of integrated circuits.

UC Berkeley's Electrical Engineering program, with its unparalleled legacy in semiconductor research and its vibrant ecosystem of innovation, is my top choice for graduate studies. I am particularly drawn to the work of Professor [UC Berkeley Professor's Name] in [their specific research, e.g., neuromorphic computing, quantum devices]. My goal is to contribute to the next generation of energy-efficient and high-performance electronic devices, and I am confident that Berkeley's world-class faculty and research facilities will provide the ideal environment for me to achieve this. I am eager to immerse myself in a challenging academic environment and collaborate with leading experts to push the boundaries of electrical engineering.`,
  },
  {
    id: "ex-4",
    university: "Harvard University",
    program: "Public Policy",
    content: `My commitment to public service stems from a deep-seated belief in the power of effective policy to transform communities. My undergraduate degree in Political Science from [Your University] equipped me with a critical understanding of governance, economics, and social justice. During my internship at [Organization Name], I contributed to policy analysis on [specific policy issue], which exposed me to the complexities of policy implementation and evaluation. This experience, combined with my volunteer work in [Community Initiative], reinforced my desire to pursue a career dedicated to addressing systemic inequalities.

Harvard Kennedy School's Public Policy program, with its rigorous analytical training and its emphasis on practical leadership, is the ideal next step in my journey. I am particularly interested in the research conducted by Professor [Harvard Professor's Name] on [their specific policy area, e.g., urban development, education reform]. My goal is to become a policy analyst specializing in [specific policy area], and I am confident that the Kennedy School's interdisciplinary curriculum and extensive network will provide me with the tools and connections necessary to make a tangible impact. I am eager to engage with diverse perspectives and contribute to evidence-based policymaking.`,
  },
]

interface ExampleGalleryProps {
  onClose: () => void
}

export function ExampleGallery({ onClose }: ExampleGalleryProps) {
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExample, setSelectedExample] = useState<Example | null>(null)
  const [isCopying, setIsCopying] = useState(false)

  const { user } = useUserStore()
  const { setCurrentDocument } = useDocumentStore()
  const supabase = getSupabaseClient()
  const { toast } = useToast()
  const router = useRouter()

  const uniqueUniversities = useMemo(() => {
    const universities = new Set(examples.map((ex) => ex.university))
    return Array.from(universities).sort()
  }, [])

  const uniquePrograms = useMemo(() => {
    const programs = new Set(examples.map((ex) => ex.program))
    return Array.from(programs).sort()
  }, [])

  const filteredExamples = useMemo(() => {
    return examples.filter((ex) => {
      const matchesUniversity = selectedUniversity ? ex.university === selectedUniversity : true
      const matchesProgram = selectedProgram ? ex.program === selectedProgram : true
      return matchesUniversity && matchesProgram
    })
  }, [selectedUniversity, selectedProgram])

  const handleViewExample = (example: Example) => {
    setSelectedExample(example)
    setIsModalOpen(true)
  }

  const handleCopyToEditor = async () => {
    if (!selectedExample || !user?.user_id) {
      toast({
        title: "Error",
        description: "Please select an example and ensure you are logged in.",
        variant: "destructive",
      })
      return
    }

    setIsCopying(true)
    const doc = await createNewDocument(supabase, user.user_id, undefined, setCurrentDocument, router)
    if (doc) {
      // Update the document with example content
      const { error: updateError } = await supabase
        .from("documents")
        .update({
          title: `${selectedExample.university} - ${selectedExample.program} Example`,
          content: selectedExample.content,
          metadata: {
            university: selectedExample.university,
            program: selectedExample.program,
            word_count: selectedExample.content.split(/\s+/).filter(Boolean).length,
          },
        })
        .eq("document_id", doc.document_id)

      if (updateError) {
        console.error("Error updating document with example:", updateError)
        toast({
          title: "Error",
          description: "Failed to copy example to document.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Example copied to a new document.",
        })
        setIsModalOpen(false)
      }
    }
    setIsCopying(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Example Gallery</h2>
        <Button variant="outline" onClick={onClose}>
          Close Gallery
        </Button>
      </div>
      <div className="flex gap-4 mb-6">
        <Select onValueChange={setSelectedUniversity} value={selectedUniversity || ""}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by University" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Universities</SelectItem>
            {uniqueUniversities.map((uni) => (
              <SelectItem key={uni} value={uni}>
                {uni}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setSelectedProgram} value={selectedProgram || ""}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {uniquePrograms.map((prog) => (
              <SelectItem key={prog} value={prog}>
                {prog}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSelectedUniversity(null)
            setSelectedProgram(null)
          }}
        >
          Clear Filters
        </Button>
      </div>

      {filteredExamples.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No examples found matching your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExamples.map((example) => (
            <Card key={example.id} className="shadow-md">
              <CardHeader>
                <CardTitle>{example.university}</CardTitle>
                <CardDescription>{example.program}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-5 mb-4">{example.content}</p>
                <Button onClick={() => handleViewExample(example)} className="w-full">
                  View Full Example
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedExample && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedExample.university} - {selectedExample.program}
              </DialogTitle>
              <DialogDescription>Full Statement of Purpose Example</DialogDescription>
            </DialogHeader>
            <div className="py-4 flex-1 overflow-auto">
              <Textarea
                value={selectedExample.content}
                readOnly
                className="w-full h-full min-h-[300px] resize-none border-none focus-visible:ring-0"
              />
            </div>
            <Button onClick={handleCopyToEditor} disabled={isCopying}>
              {isCopying ? (
                <>
                  <LoadingSpinner className="mr-2" /> Copying to New Document...
                </>
              ) : (
                "Copy to New Document"
              )}
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
