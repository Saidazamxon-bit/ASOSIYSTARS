import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.STARSTG_API_KEY || 'sj_860f22eae0212652c17bdc00816188568e66a92df86391daf26b9aaa'
const STARSTG_BASE_URL = 'https://api.starstg.uz/api/purchase'

export async function GET() {
  try {
    const response = await fetch(`${STARSTG_BASE_URL}/v1/health`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Health check failed', details: String(error) },
      { status: 500 }
    )
  }
}
