import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as "resume" | "transcript"

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or Word document" },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 }
      )
    }
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${type}-${session.user.id}-${Date.now()}.${fileExt}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const fileData = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from("supporting-docs")
      .upload(fileName, fileData, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      if (uploadError.message.includes("storage quota")) {
        return NextResponse.json(
          { error: "Storage quota exceeded. Please contact support." },
          { status: 500 }
        )
      }
      if (uploadError.message.includes("bucket not found")) {
        return NextResponse.json(
          { error: "Storage not configured. Please contact support." },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: `Error uploading file: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("supporting-docs")
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("Error handling file upload:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
} 