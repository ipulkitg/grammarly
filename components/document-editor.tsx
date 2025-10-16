"use client";
import {
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { useDocumentStore } from "@/store/document-store";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import TextAlign from "@tiptap/extension-text-align";
import History from "@tiptap/extension-history";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Blockquote from "@tiptap/extension-blockquote";
import Highlight from "@tiptap/extension-highlight";
import { delegate } from "tippy.js";
import "tippy.js/dist/tippy.css";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  CircleCheck,
  Settings,
  Wand2,
  FileSearch,
  PencilIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import React from "react";
import type { SpellingFix } from "@/types/writing-coach";
import { LoadingSpinner } from "./loading-spinner";
import { SpellcheckHighlight, spellcheckKey } from "./extensions/SpellcheckHighlight";
import { SentenceRange } from "./extensions/SentenceRange";
import { Popover, PopoverContent } from "./ui/popover";
import { FlashHighlight } from "./extensions/FlashHighlight";
import { HoverSentenceHighlight } from "./extensions/HoverSentenceHighlight";
import { Skeleton } from "./ui/skeleton";
import { EssayContextDialog } from "./ui/essay-context-dialog";
import { charIndexToPos } from "@/lib/prosemirror-utils";

interface DocumentEditorProps {
  initialContent: string;
  /**
   * Fires whenever the document content is updated (e.g., on every editor onUpdate).
   */
  onContentChange?: (delta: number) => void;
  /**
   * Fires when the user ends the current paragraph – approximated by Enter/Tab key press.
   */
  onParagraphBlur?: () => void;
  /**
   * Optional callback to trigger a fresh spell-check (defined in the parent).
   * We call this right after the user accepts a correction so that a new set
   * of misspelling highlights is generated.
   */
  onRunSpellCheck?: () => void;
  onHandleSpelling?: () => Promise<void>;
  onAnalyzeSOP?: () => Promise<void>;
  metadata?: Partial<import("@/types/writing-coach").EssayMetadata>;
  onSaveMetadata?: (
    metadata: import("@/types/writing-coach").EssayMetadata
  ) => void;
  combinedData?: {
    document: {
      metadata: Record<string, unknown>;
      document_id: string;
    } | null;
    user_profile: Record<string, unknown> | null;
  } | null;
}

export interface DocumentEditorRef {
  editor: Editor | null;
  updateSpellingSuggestions: (fixes: SpellingFix[]) => void;
}

interface SpellingSuggestion {
  wrong: string;
  suggestions: string[];
  position: { from: number; to: number };
}

interface MenuBarProps {
  editor: Editor | null;
  onGenerateDraft?: () => void;
  isGeneratingDraft: boolean;
}

function DocumentEditorInner(
  {
    initialContent,
    onContentChange,
    onParagraphBlur,
    onRunSpellCheck,
    onHandleSpelling,
    onAnalyzeSOP,
    metadata,
    onSaveMetadata,
    combinedData,
  }: DocumentEditorProps,
  ref: React.ForwardedRef<DocumentEditorRef>
) {
  const { currentDocument, updateDocumentContent, updateDocumentMetadata } =
    useDocumentStore();
  const supabase = getSupabaseClient();
  const { toast } = useToast();
  // Track async draft generation state (used by the toolbar button).
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [sentenceCard, setSentenceCard] = useState<{
    from: number;
    to: number;
    anchorRect: DOMRect;
    rewrites: string[] | null;
  } | null>(null);

  // Local loading states for toolbar actions
  const [isFixingGrammar, setIsFixingGrammar] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPopoverTimer, setShowPopoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [shouldShowPopover, setShouldShowPopover] = useState(false);

  // Define the save function
  const saveToDatabase = useCallback(
    async (content: string, wordCount: number = 0) => {
      if (!currentDocument) return;

      const { error } = await supabase
        .from("documents")
        .update({
          content: content,
          title: currentDocument.title,
          metadata: { ...currentDocument.metadata, word_count: wordCount },
          updated_at: new Date().toISOString(),
        })
        .eq("document_id", currentDocument.document_id);

      if (error) {
        console.error("Error saving document:", error);
        toast({
          title: "Error",
          description: "Failed to save your changes. Please try again.",
          variant: "destructive",
        });
      }
    },
    [currentDocument, supabase, toast]
  );

  // Create debounced version of save function
  const debouncedSave = useDebounce(saveToDatabase, 2000);

  const handleGenerateDraft = async () => {
    if (!combinedData || !editor) {
      console.error("No data available for draft generation");
      return;
    }

    setIsGeneratingDraft(true);
    try {
      const response = await fetch("/api/coach/sop/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ combinedData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate draft");
      }

      const data = await response.json();
      editor.commands.setContent(data.content);
    } catch (error) {
      console.error("Error generating draft:", error);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const MenuBar = ({
    editor,
    onGenerateDraft,
    isGeneratingDraft,
  }: MenuBarProps) => {
    if (!editor) {
      return null;
    }

    return (
      <div className="flex w-full flex-nowrap gap-2 px-2 py-1 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-t-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={
            editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""
          }
          title="Bold"
        >
          <BoldIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={
            editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""
          }
          title="Italic"
        >
          <ItalicIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={
            editor.isActive("strike") ? "bg-gray-200 dark:bg-gray-700" : ""
          }
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={
            editor.isActive({ textAlign: "left" })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={
            editor.isActive({ textAlign: "right" })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        {/* ---------- RIGHT ACTIONS GROUP ---------- */}
        <div className="flex gap-4 ml-auto">
          {/* Fix Grammar */}
          {onHandleSpelling && (
            <button
              onClick={async () => {
                setIsFixingGrammar(true);
                try {
                  await onHandleSpelling();
                } finally {
                  setIsFixingGrammar(false);
                }
              }}
              disabled={isFixingGrammar}
              className="group relative disabled:opacity-50"
              title="Fix Grammar"
            >
              <div
                className="relative bg-white z-10 inline-flex h-10 items-center justify-center overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-4 font-medium text-neutral-600 dark:text-neutral-300 gap-2 transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3"
              >
                {isFixingGrammar ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">Fix&nbsp;Grammar</span>
              </div>
              <div
                className="absolute inset-0 z-0 h-full w-full rounded-md transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3 group-hover:[box-shadow:5px_5px_#a3a3a3,10px_10px_#d4d4d4,15px_15px_#e5e5e5]"
              />
            </button>
          )}

          {/* Analyze SOP */}
          {onAnalyzeSOP && (
            <button
              onClick={async () => {
                setIsAnalyzing(true);
                try {
                  await onAnalyzeSOP();
                } finally {
                  setIsAnalyzing(false);
                }
              }}
              disabled={isAnalyzing}
              className="group relative disabled:opacity-50"
              title="Analyze SOP"
            >
              <div
                className="relative bg-white z-10 inline-flex h-10 items-center justify-center overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-4 font-medium text-neutral-600 dark:text-neutral-300 gap-2 transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3"
              >
                {isAnalyzing ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <FileSearch className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">Analyze</span>
              </div>
              <div
                className="absolute inset-0 z-0 h-full w-full rounded-md transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3 group-hover:[box-shadow:5px_5px_#a3a3a3,10px_10px_#d4d4d4,15px_15px_#e5e5e5]"
              />
            </button>
          )}

          {/* Edit Context */}
          {metadata !== undefined && onSaveMetadata && (
            <EssayContextDialog metadata={metadata} onSave={onSaveMetadata}>
              <button className="group relative" title="Edit Context">
                <div
                  className="relative bg-white z-10 inline-flex h-10 items-center justify-center overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-4 font-medium text-neutral-600 dark:text-neutral-300 gap-2 transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Context</span>
                </div>
                <div
                  className="absolute inset-0 z-0 h-full w-full rounded-md transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3 group-hover:[box-shadow:5px_5px_#a3a3a3,10px_10px_#d4d4d4,15px_15px_#e5e5e5]"
                />
              </button>
            </EssayContextDialog>
          )}

          {/* Gear / Generate Draft */}
          <button
            onClick={onGenerateDraft}
            disabled={isGeneratingDraft}
            className="group relative ml-auto disabled:opacity-50 disabled:pointer-events-none"
            title="Generate Draft"
          >
            <div
              className="relative bg-white z-10 inline-flex h-10 items-center justify-center overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-4 font-medium text-neutral-600 dark:text-neutral-300 gap-2 transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3"
            >
              {isGeneratingDraft ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
              )}
              <span className="text-sm font-medium">Draft</span>
            </div>
            <div
              className="absolute inset-0 z-0 h-full w-full rounded-md transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3 group-hover:[box-shadow:5px_5px_#a3a3a3,10px_10px_#d4d4d4,15px_15px_#e5e5e5]"
            />
          </button>
        </div>
      </div>
    );
  };

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph.configure({
        HTMLAttributes: {
          class: "my-2",
        },
      }),
      Text.configure({
        preserveWhitespace: true,
      }),
      Bold,
      Italic,
      Strike,
      History,
      Blockquote,
      TextAlign.configure({
        types: ["paragraph"],
        alignments: ["left", "center", "right"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      SpellcheckHighlight,
      SentenceRange,
      FlashHighlight,
      HoverSentenceHighlight,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[600px] min-w-[600px] p-4",
      },
      handleClick: () => {
        // Handled by the spell-check tooltip system
        return false;
      },
      // Detect paragraph exits via Enter or Tab key presses to optionally trigger grammar checks.
      handleKeyDown: (_view, event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === "Tab") {
          onParagraphBlur?.();
        }
        return false;
      },
    },
    onUpdate: ({
      editor,
      transaction,
    }: {
      editor: Editor;
      transaction: { docChanged: boolean };
    }) => {
      const content = editor.getHTML();
      const wordCount = editor.storage.wordCount ?? 0;

      // The SpellcheckHighlight extension handles decoration updates automatically

      if (currentDocument) {
        // Update local state immediately
        updateDocumentContent(content);
        updateDocumentMetadata({ word_count: wordCount });

        // Notify listeners (DocumentPage) about content changes so they can implement side-effects.
        // Inform parent how many characters changed so it can decide if the change is significant.
        const newLen = editor.state.doc.textContent.length;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const storage: any = editor.storage;
        const prevLen = storage.__prevLen ?? newLen;
        const deltaChars = newLen - prevLen;
        storage.__prevLen = newLen;
        onContentChange?.(deltaChars);

        // Debounced save to database
        debouncedSave(content, wordCount as number);
      }
    },
  });

  /*
   * ---------------------------------------------------------------------
   * Tooltip integration — delegate a single tippy instance for all elements
   * with the `.spell-error` class (added by the SpellcheckHighlight extension).
   * When a misspelled word is clicked we show a list of suggestions; clicking
   * a suggestion replaces the word in-place.
   * ---------------------------------------------------------------------
   */

  /* ---------------------------------------------------------------------
   * Tooltip integration — pointerdown freezes rect, click opens tooltip
   * ------------------------------------------------------------------- */
  useEffect(() => {
    if (!editor) return;

    const root = editor.view.dom as HTMLElement; // ProseMirror root

    /* 1 Create ONE hidden tippy instance ----------------------------- */
    const tip =
      (window as any)._spellTip ??
      delegate(root, {
        target: ".spell-error",
        trigger: "manual", // we'll call .show() ourselves
        interactive: true,
        appendTo: () => document.body,
        placement: "bottom-start",
        offset: [0, 8],
        theme: "light-border",
      });
    (window as any)._spellTip = tip; // cache for HMR

    /* 2 Freeze rect early ------------------------------------------- */
    function handlePointerDown(ev: PointerEvent) {
      const el = (ev.target as HTMLElement).closest(".spell-error");
      if (!el) return;

      const rect = el.getBoundingClientRect(); // copy while alive
      tip.setProps({
        getReferenceClientRect: () => rect,
        onShow(instance) {
          buildMenu(instance, el); // fill content
        },
      });
    }

    /* 3 Open on click ---------------------------------------------- */
    function handleClick(ev: MouseEvent) {
      const el = (ev.target as HTMLElement).closest(".spell-error");
      if (!el) return;
      tip.show(el); // manual trigger
      ev.preventDefault();
      ev.stopPropagation();
    }

    root.addEventListener("pointerdown", handlePointerDown);
    root.addEventListener("click", handleClick);

    return () => {
      root.removeEventListener("pointerdown", handlePointerDown);
      root.removeEventListener("click", handleClick);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    async function handle(ev: Event) {
      const { from, to, sentence, domEvent } = (ev as CustomEvent).detail;
      const anchorRect = new DOMRect(
        (domEvent as MouseEvent).clientX,
        (domEvent as MouseEvent).clientY,
        0,
        0
      );

      // Clear any existing timer
      if (showPopoverTimer) {
        clearTimeout(showPopoverTimer);
      }

      // Set initial state without showing popover
      setSentenceCard({ from, to, anchorRect, rewrites: null });
      setShouldShowPopover(false);

      editor?.view.dispatch(editor.state.tr.setMeta("lock-hover", true));

      try {
        const res = await fetch("/api/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sentence }),
        });
        const rewrites: string[] = await res.json();
        
        // Start the delay timer after getting the rewrites
        const timer = setTimeout(() => {
          setShouldShowPopover(true);
        }, 1500); // 1.5 seconds delay
        
        setShowPopoverTimer(timer);
        setSentenceCard({ from, to, anchorRect, rewrites });
      } catch (error) {
        console.error("Error fetching rewrites:", error);
        setSentenceCard({ from, to, anchorRect, rewrites: [] });
      }
    }

    const dom = editor.view.dom;
    dom.addEventListener("sentence-click", handle);
    return () => {
      dom.removeEventListener("sentence-click", handle);
      // Clean up timer on unmount
      if (showPopoverTimer) {
        clearTimeout(showPopoverTimer);
      }
    };
  }, [editor, showPopoverTimer]);

  /* ------------------------------------------------------------------ */
  /* Build the suggestion menu                                          */
  /* ------------------------------------------------------------------ */
  function buildMenu(instance: any, el: HTMLElement) {
    const suggestions: string[] = JSON.parse(el.dataset.suggestions ?? "[]");

    const wrap = document.createElement("div");
    wrap.className = "flex flex-col w-36 p-1";

    if (!suggestions.length) {
      wrap.innerHTML =
        '<span class="text-sm text-muted-foreground px-2 py-1">No suggestions</span>';
    } else {
      suggestions.forEach((text) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = text;
        btn.className =
          "text-left px-2 py-1 hover:bg-muted rounded flex justify-between";
        btn.onclick = () => {
          const from =
            Number(el.dataset.pmFrom) || editor!.view.posAtDOM(el, 0);
          const to = Number(el.dataset.pmTo) || from + el.textContent!.length;

          editor!
            .chain()
            .focus()
            .setTextSelection({ from, to })
            .unsetHighlight()
            .insertContent(text)
            .run();

          // After applying the replacement, ask parent to run a new spell-check
          // so we get an updated list of misspellings/highlights.
          onRunSpellCheck?.();

          instance.hide();
        };
        wrap.appendChild(btn);
      });
    }

    instance.setContent(wrap);
  }

  // Function to update spelling suggestions
  const updateSpellingSuggestions = useCallback(
    (fixes: SpellingFix[]) => {
      if (!editor) return;

      // Convert text-based fixes to position-based decorations
      const text = editor.state.doc.textContent;
      const decos: { from: number; to: number; suggestions: string[] }[] = [];
      
      fixes.forEach((fix) => {
        let pos = 0;
        while ((pos = text.indexOf(fix.wrong, pos)) !== -1) {
          // Convert text offset to ProseMirror position
          const from = charIndexToPos(editor.state.doc, pos);
          const to = charIndexToPos(editor.state.doc, pos + fix.wrong.length);
          
          decos.push({
            from,
            to,
            suggestions: fix.suggestions || [],
          });
          
          pos += fix.wrong.length;
        }
      });

      // Update the SpellcheckHighlight extension with new decorations
      editor.commands.command(({ tr, dispatch }) => {
        tr.setMeta(spellcheckKey, decos);
        dispatch?.(tr);
        return true;
      });
    },
    [editor]
  );
  

  // Expose editor and updateSpellingSuggestions to parent
  useImperativeHandle(
    ref,
    () => ({
      editor,
      updateSpellingSuggestions,
    }),
    [editor, updateSpellingSuggestions]
  );

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && editor.getHTML() !== initialContent && !editor.isFocused) {
      editor.commands.setContent(initialContent, false);
    }
  }, [editor, initialContent]);

  // Clean up editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const renderToolbar = () => {
    return (
      <div className="flex items-center gap-1 border-b p-1">
        <MenuBar
          editor={editor}
          onGenerateDraft={handleGenerateDraft}
          isGeneratingDraft={isGeneratingDraft}
        />
      </div>
    );
  };

  return (
    <div className="flex-1 flex gap-6 max-w-4xl mx-auto">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
        <div className="border-gray-200 dark:border-gray-700 rounded-b-lg relative">
          {renderToolbar()}

          <div className="p-4 relative notepad-dots rounded-b-lg">
            <EditorContent editor={editor} />

            {/* 🔹 Grammarly-style rewrite card */}
            {sentenceCard && shouldShowPopover && (
              <Popover
                open
                onOpenChange={(open) => {
                  if (!open) {
                    setSentenceCard(null);
                    setShouldShowPopover(false);
                    if (showPopoverTimer) {
                      clearTimeout(showPopoverTimer);
                      setShowPopoverTimer(null);
                    }
                    editor?.view.dispatch(
                      editor.state.tr.setMeta("unlock-hover", true)
                    );
                  }
                }}
              >
                <PopoverContent
                  sideOffset={6}
                  align="start"
                  style={{
                    position: "fixed",
                    left: sentenceCard.anchorRect.left,
                    top: sentenceCard.anchorRect.bottom + 8,
                    width: 480,
                  }}
                  className="rounded-lg border bg-white p-3 shadow-xl w-[30rem] z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <span className="popover-arrow" />
                  {sentenceCard.rewrites === null ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  ) : (
                    sentenceCard.rewrites.map((r) => (
                      <button
                        key={r}
                        className="
                        group flex items-start gap-2 px-3 py-2 w-full rounded
                        hover:bg-indigo-50 dark:hover:bg-indigo-900
                        text-left transition-colors"
                        onClick={() => {
                          editor
                            ?.chain()
                            .focus()
                            .setTextSelection({
                              from: sentenceCard.from,
                              to: sentenceCard.to,
                            })
                            .insertContent(r)
                            .run();

                          /* ✨ trigger 600-ms flash */
                          editor?.view.dispatch(
                            editor.state.tr.setMeta("flash-sentence", {
                              from: sentenceCard.from,
                              to: sentenceCard.to,
                            })
                          );
                          setSentenceCard(null);

                          /* remove after 600 ms so it doesn't persist on undo/redo */
                          setTimeout(() => {
                            editor?.view.dispatch(
                              editor.state.tr.setMeta(
                                "flash-sentence-remove",
                                true
                              )
                            );
                          }, 600);
                        }}
                      >
                        <span className="flex-1">{r}</span>
                        <CircleCheck className="h-4 w-4 text-indigo-500 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))
                  )}
                </PopoverContent>
              </Popover>
            )}
            {/* 🔹 end rewrite card */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default forwardRef(DocumentEditorInner);
