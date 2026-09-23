import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getCanonicalUserById } from '@/lib/db/users'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024 // 8MB

export async function POST(req: NextRequest) {
  try {
    // 1. Session check via Better Auth
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Role authorization check (seller, agent, or admin)
    const profile = await getCanonicalUserById(session.user.id)
    const role = profile?.role || 'buyer'

    if (role !== 'seller' && role !== 'agent' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only verified sellers, agents, or admins can upload listing photos' },
        { status: 403 }
      )
    }

    // 3. Supabase credentials check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('placeholder')) {
      return NextResponse.json(
        {
          error:
            'Supabase Storage is unavailable. Please ensure SUPABASE_SERVICE_ROLE_KEY is configured in .env.local and bucket "listing-photos" is created in the Supabase dashboard.',
        },
        { status: 503 }
      )
    }

    // 4. Parse multipart form data
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided in "file" form field' },
        { status: 400 }
      )
    }

    // 5. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported image format (${file.type}). Allowed formats are JPEG, PNG, and WebP.`,
        },
        { status: 400 }
      )
    }

    // 6. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      return NextResponse.json(
        { error: `File size (${sizeMB}MB) exceeds the 8MB limit` },
        { status: 400 }
      )
    }

    // 7. Generate storage path: ${userId}/${timestamp}-${random}.${ext}
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }
    const ext = extMap[file.type] || 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const storagePath = `${session.user.id}/${timestamp}-${random}.${ext}`

    // 8. Convert to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const supabase = createAdminClient()
    const { error: uploadError } = await supabase.storage
      .from('listing-photos')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[POST /api/uploads/listing-photo] Supabase Storage upload error:', uploadError)
      return NextResponse.json(
        {
          error: `Supabase Storage upload failed: ${uploadError.message}. Please verify the "listing-photos" bucket exists and is public in the Supabase dashboard.`,
        },
        { status: 503 }
      )
    }

    // 9. Retrieve public URL
    const { data: urlData } = supabase.storage
      .from('listing-photos')
      .getPublicUrl(storagePath)

    return NextResponse.json(
      {
        url: urlData.publicUrl,
        filename: storagePath,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/uploads/listing-photo] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process file upload',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
