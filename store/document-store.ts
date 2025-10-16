import { create } from "zustand"
import type { Document } from "@/types/data-models"

interface DocumentState {
  currentDocument: Document | null
  documents: Document[]
  setDocuments: (documents: Document[]) => void
  setCurrentDocument: (document: Document | null) => void
  updateDocumentContent: (content: string) => void
  updateDocumentTitle: (title: string) => void
  updateDocumentMetadata: (metadata: Partial<Document["metadata"]>) => void
  addDocument: (document: Document) => void
  removeDocument: (documentId: string) => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  currentDocument: null,
  documents: [],
  setDocuments: (documents) => set({ documents }),
  setCurrentDocument: (document) => set({ currentDocument: document }),
  updateDocumentContent: (content) =>
    set((state) => ({
      currentDocument: state.currentDocument
        ? { ...state.currentDocument, content, updated_at: new Date().toISOString() }
        : null,
      documents: state.documents.map((doc) =>
        doc.document_id === state.currentDocument?.document_id
          ? { ...doc, content, updated_at: new Date().toISOString() }
          : doc,
      ),
    })),
  updateDocumentTitle: (title) =>
    set((state) => ({
      currentDocument: state.currentDocument
        ? { ...state.currentDocument, title, updated_at: new Date().toISOString() }
        : null,
      documents: state.documents.map((doc) =>
        doc.document_id === state.currentDocument?.document_id
          ? { ...doc, title, updated_at: new Date().toISOString() }
          : doc,
      ),
    })),
  updateDocumentMetadata: (metadata) =>
    set((state) => ({
      currentDocument: state.currentDocument
        ? { ...state.currentDocument, metadata: { ...state.currentDocument.metadata, ...metadata } }
        : null,
      documents: state.documents.map((doc) =>
        doc.document_id === state.currentDocument?.document_id
          ? { ...doc, metadata: { ...doc.metadata, ...metadata } }
          : doc,
      ),
    })),
  addDocument: (document) =>
    set((state) => ({
      documents: [...state.documents, document],
    })),
  removeDocument: (documentId) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.document_id !== documentId),
      currentDocument: state.currentDocument?.document_id === documentId ? null : state.currentDocument,
    })),
}))
