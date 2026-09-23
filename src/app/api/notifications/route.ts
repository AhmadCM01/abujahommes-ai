import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: true, message: 'Notifications endpoint ready' })
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json()
    return NextResponse.json({ success: true, id, message: 'Notification marked as read' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
