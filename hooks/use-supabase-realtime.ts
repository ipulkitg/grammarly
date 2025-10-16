"use client"

import { useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useDocumentStore } from "@/store/document-store"
import { useSuggestionStore } from "@/store/suggestion-store"
import { useUserStore } from "@/store/user-store"
import type { Document, Suggestion } from "@/types/data-models"

export function useSupabaseRealtime() {
  const supabase = getSupabaseClient()
  const { addDocument, removeDocument, setDocuments, setCurrentDocument } = useDocumentStore()
  const { addSuggestion, removeSuggestion, updateSuggestion, setSuggestions } = useSuggestionStore()
  const user = useUserStore((state) => state.user) // Get current user from store

  useEffect(() => {
    if (!user?.user_id) {
      // Clear stores if user logs out
      setDocuments([])
      setSuggestions([])
      setCurrentDocument(null)
      return
    }

    // Subscribe to 'documents' table changes
    const documentsChannel = supabase
      .channel("public:documents")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documents", filter: `user_id=eq.${user.user_id}` },
        (payload) => {
          const newDocument = payload.new as Document
          const oldDocument = payload.old as Document

          switch (payload.eventType) {
            case "INSERT":
              addDocument(newDocument)
              break
            case "UPDATE":
              // Find and update the document in the documents array
              useDocumentStore.setState((state) => ({
                documents: state.documents.map((doc) =>
                  doc.document_id === newDocument.document_id ? newDocument : doc,
                ),
                // If the updated document is the current one, update it
                currentDocument:
                  state.currentDocument?.document_id === newDocument.document_id ? newDocument : state.currentDocument,
              }))
              break
            case "DELETE":
              removeDocument(oldDocument.document_id)
              break
            default:
              break
          }
        },
      )
      .subscribe()

    // Subscribe to 'suggestions' table changes
    // We rely on RLS for security, but also check client-side for relevance to current document
    const suggestionsChannel = supabase
      .channel("public:suggestions")
      .on("postgres_changes", { event: "*", schema: "public", table: "suggestions" }, async (payload) => {
        const newSuggestion = payload.new as Suggestion
        const oldSuggestion = payload.old as Suggestion
        const currentDocumentId = useDocumentStore.getState().currentDocument?.document_id

        // Only process if the suggestion is for the currently active document
        const relevantDocumentId = newSuggestion?.document_id || oldSuggestion?.document_id
        if (!currentDocumentId || currentDocumentId !== relevantDocumentId) {
          return
        }

        switch (payload.eventType) {
          case "INSERT":
            addSuggestion(newSuggestion)
            break
          case "UPDATE":
            updateSuggestion(newSuggestion.suggestion_id, newSuggestion)
            break
          case "DELETE":
            removeSuggestion(oldSuggestion.suggestion_id)
            break
          default:
            break
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(documentsChannel)
      supabase.removeChannel(suggestionsChannel)
    }
  }, [
    user?.user_id,
    supabase,
    addDocument,
    removeDocument,
    setDocuments,
    setCurrentDocument,
    addSuggestion,
    removeSuggestion,
    updateSuggestion,
    setSuggestions,
  ])
}
