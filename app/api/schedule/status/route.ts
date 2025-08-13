import { NextResponse } from 'next/server'
import { getSchedulerStatus } from '@/lib/services/scheduler'

export async function GET() {
  try {
    const status = await getSchedulerStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Error getting scheduler status:', error)
    return NextResponse.json(
      { error: 'Failed to get scheduler status' },
      { status: 500 }
    )
  }
}