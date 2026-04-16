import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, country, business_type, launch_month } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const db = getServiceClient()
    const { error } = await db
      .from('waitlist')
      .insert({ email, country, business_type, launch_month })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already on waitlist' })
      }
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Joined waitlist' })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
