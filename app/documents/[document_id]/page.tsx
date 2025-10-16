"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useDocumentStore } from "@/store/document-store";
import { useUserStore } from "@/store/user-store";
import DocumentEditor, {
  DocumentEditorRef,
} from "@/components/document-editor";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WritingCoachPanel } from "@/components/writing-coach-panel";
import type { Document } from "@/types/data-models";
import type { FullCoachResponse } from "@/types/writing-coach";
import { use } from "react";
import { spellcheckKey } from "@/components/extensions/SpellcheckHighlight";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import { charIndexToPos } from "@/lib/prosemirror-utils";

interface DocumentPageProps {
  params: Promise<{
    document_id: string;
  }>;
}

type Misspelling = {
  word: string;
  from: number;
  to: number;
  suggestions: string[];
};

interface DocumentRow {
  document_id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  metadata: Document["metadata"] | null;
  created_at: string;
  updated_at: string;
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const { document_id } = use(params);
  const { currentDocument, setCurrentDocument, updateDocumentTitle } =
    useDocumentStore();
  const { user } = useUserStore();
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const editorRef = useRef<DocumentEditorRef>(null);
  const [coachData, setCoachData] = useState<FullCoachResponse | null>(null);
  const [combinedData, setCombinedData] = useState<{
    document: {
      metadata: Record<string, unknown>;
      document_id: string;
    } | null;
    user_profile: Record<string, unknown> | null;
  } | null>(null);
  // ----------------- Auto Grammar & Spelling helpers -----------------
  // Track last meaningful user input time and last time we ran the grammar fix.
  const [lastInputTime, setLastInputTime] = useState<Date>(() => new Date());
  const [lastFixTime, setLastFixTime] = useState<Date>(() => new Date(0)); // epoch
  // Whether the document has changed since the last grammar check. Reset back to false after a check.
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const charsEditedSinceParagraph = useRef(0);
  const PARAGRAPH_CHAR_THRESHOLD = 20; // n chars before triggering on blur

  // Configuration constants – tweak as desired.
  const IDLE_DELAY_MS = 5_000; // 5 s after last input
  const PARAGRAPH_BLUR_DELAY_MS = 10_000; // 10 sec gap between paragraph-blur triggered checks

  // Helper that wraps handleFixGrammar so we can centralise bookkeeping.
  const runFixGrammar = async () => {
    await handleSpelling();
    setLastFixTime(new Date());
    setHasPendingChanges(false);
  };

  // 1) Idle while typing — fire once 45-60 s after last keystroke.
  useEffect(() => {
    if (!hasPendingChanges) return;
    const now = Date.now();
    const elapsed = now - lastInputTime.getTime();
    // If the user is already idle for > delay, trigger immediately; otherwise schedule.
    const timeout = elapsed >= IDLE_DELAY_MS ? 0 : IDLE_DELAY_MS - elapsed;

    const timer = setTimeout(() => {
      // Ensure we still have pending changes and we haven't triggered too recently.
      if (
        hasPendingChanges &&
        Date.now() - lastFixTime.getTime() >= PARAGRAPH_BLUR_DELAY_MS
      ) {
        runFixGrammar();
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [lastInputTime, hasPendingChanges, lastFixTime]);

  // Content change handler from the editor (debounced in DocumentEditor)
  const handleContentChange = (delta: number) => {
    setLastInputTime(new Date());
    // Consider the change meaningful if more than 0 characters changed.
    if (delta !== 0) {
      setHasPendingChanges(true);
      charsEditedSinceParagraph.current += Math.abs(delta);
    }
  };

  // Paragraph blur handler – trigger if threshold met and limited by last fix time.
  const handleParagraphBlur = () => {
    if (
      hasPendingChanges &&
      charsEditedSinceParagraph.current >= PARAGRAPH_CHAR_THRESHOLD &&
      Date.now() - lastFixTime.getTime() >= PARAGRAPH_BLUR_DELAY_MS
    ) {
      runFixGrammar();
      charsEditedSinceParagraph.current = 0;
    }
  };

  useEffect(() => {
    const fetchDocument = async () => {
      if (!user?.user_id) {
        router.push("/");
        return;
      }

      setIsLoading(true);
      setError(null);

      // Fetch both document and user profile in parallel
      const [documentResult, profileResult] = await Promise.all([
        supabase
          .from("documents")
          .select("*")
          .eq("document_id", document_id)
          .eq("user_id", user.user_id)
          .single(),
        supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.user_id)
          .single(),
      ]);

      // Prepare the combined data object
      const combinedDataObj = {
        document: documentResult.data
          ? {
              metadata: documentResult.data.metadata,
              document_id: documentResult.data.document_id,
            }
          : null,
        user_profile: profileResult.data || null,
      };

      // Set the combined data in state
      setCombinedData(combinedDataObj);
      // Continue with existing document error handling
      if (documentResult.error) {
        console.error("Error fetching document:", documentResult.error);
        setError(
          "Failed to load document. It might not exist or you don't have permission."
        );
        setCurrentDocument(null);
      } else if (!documentResult.data) {
        setError("Document not found.");
        setCurrentDocument(null);
      } else {
        // Type assertion after validating the required fields
        if (
          typeof documentResult.data.document_id === "string" &&
          typeof documentResult.data.user_id === "string" &&
          typeof documentResult.data.created_at === "string" &&
          typeof documentResult.data.updated_at === "string"
        ) {
          const row: DocumentRow = {
            document_id: documentResult.data.document_id,
            user_id: documentResult.data.user_id,
            title: (documentResult.data.title as string) || null,
            content: (documentResult.data.content as string) || null,
            metadata:
              (documentResult.data.metadata as Document["metadata"]) || null,
            created_at: documentResult.data.created_at,
            updated_at: documentResult.data.updated_at,
          };

          const document: Document = {
            document_id: row.document_id,
            user_id: row.user_id,
            title: row.title || "Untitled Document",
            content: row.content || "",
            metadata: row.metadata || {},
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
          setCurrentDocument(document);
          setTitleDraft(document.title);
        } else {
          setError("Invalid document data received from server.");
          setCurrentDocument(null);
        }
      }
      setIsLoading(false);
    };

    fetchDocument();
  }, [document_id, user, supabase, setCurrentDocument, router]);

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (!currentDocument) return;

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        title: titleDraft,
        updated_at: new Date().toISOString(),
      })
      .match({ document_id: currentDocument.document_id });

    if (updateError) {
      console.error("Error updating document title:", updateError);
      return;
    }

    updateDocumentTitle(titleDraft);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTitleDraft(currentDocument?.title || "Untitled Document");
    setIsEditingTitle(false);
  };


  /* ---------- GRAMMAR & SPELLING ---------- */
  const handleSpelling = async () => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    try {
      const res = await fetch("/api/fix/spelling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editor.getText() }),
      });
      if (!res.ok) throw new Error(`Spell-check failed: ${res.status}`);

      // ← new flat array
      const misspellings: Misspelling[] = await res.json();

      // If your route ever returns an object by mistake, guard it:
      if (!Array.isArray(misspellings))
        throw new Error("Spell-check payload is not an array");

      const { state } = editor;
      const decos = misspellings.map(({ from, to, suggestions }) => ({
        from: charIndexToPos(state.doc, from),
        to: charIndexToPos(state.doc, to),
        suggestions,
      }));

      editor.commands.command(({ tr, dispatch }) => {
        tr.setMeta(spellcheckKey, decos);
        dispatch?.(tr);
        return true;
      });
    } catch (err) {
      console.error("Error processing spelling fixes:", err);
    }
  };

  /* ---------- FULL SOP REVIEW ---------- */
  const handleAnalyzeSOP = async () => {
    if (!editorRef.current?.editor) return;
    const content = editorRef.current.editor.getText();

    const res = await fetch("/api/coach/sop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    const data: FullCoachResponse = await res.json();
    setCoachData(data);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">{error}</p>
        <Button onClick={() => router.push("/documents")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Documents
        </Button>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">
          No Document Selected
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Please select a document from the list.
        </p>
        <Button onClick={() => router.push("/documents")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Documents
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 cork-board dark:bg-gray-900 flex flex-col h-full">
      <div className="flex justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/documents")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to Documents</span>
        </Button>
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="text-xl font-bold"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleTitleSave}
              className="text-green-600"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleTitleCancel}
              className="text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
            onClick={handleTitleEdit}
          >
            {currentDocument.title || "Untitled Document"}
          </h1>
        )}
        <div className="flex items-center gap-2"/>
      </div>
      <div className="flex flex-1 gap-4">
        <DocumentEditor
          ref={editorRef}
          initialContent={currentDocument.content || ""}
          onContentChange={handleContentChange}
          onParagraphBlur={handleParagraphBlur}
          onRunSpellCheck={handleSpelling}
          onHandleSpelling={handleSpelling}
          onAnalyzeSOP={handleAnalyzeSOP}
          metadata={currentDocument?.metadata}
          onSaveMetadata={async (metadata) => {
            if (!currentDocument) return;

            const { error: updateError } = await supabase
              .from("documents")
              .update({
                metadata,
                updated_at: new Date().toISOString(),
              })
              .match({ document_id: currentDocument.document_id });

            if (updateError) {
              console.error("Error updating document metadata:", updateError);
              return;
            }

            setCurrentDocument({
              ...currentDocument,
              metadata,
            });
          }}
          combinedData={combinedData}
        />
        <WritingCoachPanel
          onHandleSpelling={handleSpelling}
          onAnalyzeSOP={handleAnalyzeSOP}
          coachData={coachData}
          metadata={currentDocument?.metadata}
          onSaveMetadata={async (metadata) => {
            if (!currentDocument) return;

            const { error: updateError } = await supabase
              .from("documents")
              .update({
                metadata,
                updated_at: new Date().toISOString(),
              })
              .match({ document_id: currentDocument.document_id });

            if (updateError) {
              console.error("Error updating document metadata:", updateError);
              return;
            }

            setCurrentDocument({
              ...currentDocument,
              metadata,
            });
          }}
        />
      </div>
    </div>
  );
}
