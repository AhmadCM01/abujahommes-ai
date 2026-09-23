import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { updateCanonicalUserProfile, DatabaseUnavailableError } from '@/lib/db/users'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticated session check via Better Auth
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required to update profile photo' },
        { status: 401 }
      )
    }

    // 2. Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided in "file" form field' },
        { status: 400 }
      )
    }

    // 3. Validate image format
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported image format (${file.type}). Allowed formats: JPEG, PNG, WebP` },
        { status: 400 }
      )
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      return NextResponse.json(
        { error: `File size (${sizeMB}MB) exceeds 5MB limit` },
        { status: 400 }
      )
    }

    // 5. Supabase Admin Storage Client
    const supabase = createAdminClient()

    // Ensure 'avatars' bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((b) => b.name === 'avatars')
      if (!bucketExists) {
        await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE_BYTES,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        })
      }
    } catch (bucketErr) {
      console.warn('[AVATAR UPLOAD] Notice checking/creating avatars bucket:', bucketErr)
    }

    // 6. Generate filename and upload
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }
    const ext = extMap[file.type] || 'jpg'
    const storagePath = `${session.user.id}/avatar-${Date.now()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[POST /api/uploads/avatar] Storage upload failed:', uploadError)
      return NextResponse.json(
        {
          error: `Storage upload failed: ${uploadError.message}. Please ensure "avatars" bucket exists and is public in Supabase dashboard.`,
        },
        { status: 502 }
      )
    }

    // 7. Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(storagePath)

    const publicUrl = urlData.publicUrl

    // 8. Persist profiles.avatar_url directly into PostgreSQL
    const updatedProfile = await updateCanonicalUserProfile(session.user.id, {
      avatar_url: publicUrl,
    })

    return NextResponse.json(
      {
        success: true,
        avatar_url: publicUrl,
        profile: updatedProfile,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: 'Database service unavailable. Could not save avatar to database.' },
        { status: 503 }
      )
    }
    console.error('[POST /api/uploads/avatar] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload profile photo',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
