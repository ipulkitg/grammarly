import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"
import type { Document } from "@/types/data-models"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function createNewDocument(
  supabase: SupabaseClient,
  user_id: string,
  setIsLoading?: (loading: boolean) => void,
  setCurrentDocument?: (doc: Document) => void,
  router?: AppRouterInstance,
  setShowGallery?: (show: boolean) => void
) {
  if (!user_id) {
    alert("Please log in to create a new document.")
    return null
  }
  
  setIsLoading?.(true)
  const newDocumentId = uuidv4()
  const { data, error } = await supabase
    .from("documents")
    .insert({
      document_id: newDocumentId,
      user_id: user_id,
      title: "Untitled Document",
      content: "Start typing....",
      metadata: { word_count: 0 },
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating new document:", error)
    alert("Failed to create new document.")
    setIsLoading?.(false)
    return null
  }

  if (
    data &&
    typeof data === "object" &&
    "document_id" in data &&
    typeof data.document_id === "string" &&
    "user_id" in data &&
    typeof data.user_id === "string" &&
    "title" in data &&
    typeof data.title === "string" &&
    "content" in data &&
    typeof data.content === "string" &&
    "metadata" in data &&
    typeof data.metadata === "object" &&
    "created_at" in data &&
    typeof data.created_at === "string" &&
    "updated_at" in data &&
    typeof data.updated_at === "string"
  ) {
    const newDoc = {
      document_id: data.document_id,
      user_id: data.user_id,
      title: data.title,
      content: data.content,
      metadata: data.metadata,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
    
    if (setCurrentDocument) {
      setCurrentDocument(newDoc)
    }
    
    if (router) {
      router.push(`/documents/${newDoc.document_id}`)
    }
    
    if (setShowGallery) {
      setShowGallery(false)
    }
    
    setIsLoading?.(false)
    return newDoc
  }

  setIsLoading?.(false)
  return null
}
