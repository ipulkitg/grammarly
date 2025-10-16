"use client"

import { Wand2, FileSearch, PencilIcon } from "lucide-react"
import { EssayContextDialog } from "@/components/ui/essay-context-dialog"
import type { FullCoachResponse, EssayMetadata } from "@/types/writing-coach"
import { LoadingSpinner } from "./loading-spinner"
import { useState } from "react"

interface WritingCoachPanelProps {
  onHandleSpelling?: () => Promise<void>
  onAnalyzeSOP?: () => Promise<void>
  coachData?: FullCoachResponse | null
  metadata?: Partial<EssayMetadata>
  onSaveMetadata?: (metadata: EssayMetadata) => void
}

export function WritingCoachPanel({ 
  onHandleSpelling, 
  onAnalyzeSOP, 
  coachData,
  metadata,
  onSaveMetadata 
}: WritingCoachPanelProps) {
  const [isFixingGrammar, setIsFixingGrammar] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSpelling = async () => {
    if (!onHandleSpelling) return;
    setIsFixingGrammar(true);
    try {
      await onHandleSpelling();
    } finally {
      setIsFixingGrammar(false);
    }
  };

  const handleAnalyzeSOP = async () => {
    if (!onAnalyzeSOP) return;
    setIsAnalyzing(true);
    try {
      await onAnalyzeSOP();
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-1/4 px-6 ml-4 flex flex-col gap-6 overflow-y-auto">
      <div className="flex flex-wrap gap-4 justify-start">
        {coachData ? (
          <>
            {/* Tone */}
            <div className="postit postit-yellow -rotate-2">
              <p className="font-medium mb-2">Tone</p>
              <p className="text-sm">{coachData.tone}</p>
            </div>

            {/* Outline */}
            <div className="postit postit-blue rotate-1">
              <p className="font-medium mb-2">Outline</p>
              <p className="text-sm">{coachData.outline.join(" → ")}</p>
            </div>

            {/* Repetition */}
            {coachData.repetition.length > 0 && (
              <div className="postit postit-pink -rotate-1">
                <p className="font-medium mb-2">Repetition</p>
                <ul className="list-disc ml-4 text-sm space-y-1">
                  {coachData.repetition.map((r) => (
                    <li key={r.word}>
                      <span className="font-medium">{r.word}</span> ×{r.count}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clarity prompts */}
            {coachData.clarityPrompts.length > 0 && (
              <div className="postit postit-green rotate-2">
                <p className="font-medium mb-2">Clarity</p>
                <ul className="list-disc ml-4 text-sm space-y-1">
                  {coachData.clarityPrompts.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trim suggestions */}
            {coachData.trimSuggestions.length > 0 && (
              <div className="postit postit-orange -rotate-3">
                <p className="font-medium mb-2">Trim</p>
                <ul className="list-disc ml-4 text-sm space-y-1">
                  {coachData.trimSuggestions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Coach perspective */}
            {coachData.coachPerspective.length > 0 && (
              <div className="postit postit-amber rotate-1">
                <p className="font-medium mb-2">Coach</p>
                <ul className="list-disc ml-4 text-sm space-y-1">
                  {coachData.coachPerspective.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Checklist */}
            <div className="postit postit-green -rotate-2">
              <p className="font-medium mb-2">Checklist</p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-1">
                  <span>●</span> Goals {coachData.checklist.goalsClear ? "✅" : "❌"}
                </li>
                <li className="flex items-center gap-1">
                  <span>●</span> Fit {coachData.checklist.collegeFit ? "✅" : "❌"}
                </li>
                <li className="flex items-center gap-1">
                  <span>●</span> Voice {coachData.checklist.personalVoice ? "✅" : "❌"}
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="postit postit-yellow rotate-1">
            <Wand2 className="h-8 w-8 text-purple-400 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-center">
              Click <span className="font-medium text-purple-500">Analyze SOP</span> to see suggestions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
