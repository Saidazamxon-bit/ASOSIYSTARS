import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.STARSTG_API_KEY || 'sj_860f22eae0212652c17bdc00816188568e66a92df86391daf26b9aaa'
const STARSTG_BASE_URL = 'https://api.starstg.uz/api/purchase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { username, stars, idempotency_key } = body

    if (!username || !stars || !idempotency_key) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: username, stars, idempotency_key' },
        { status: 400 }
      )
    }

    if (typeof stars !== 'number' || stars < 50 || stars > 10000) {
      return NextResponse.json(
        { success: false, error: 'Stars must be between 50 and 10000' },
        { status: 400 }
      )
    }

    const response = await fetch(`${STARSTG_BASE_URL}/v1/stars`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.replace(/^@/, ''),
        stars,
        idempotency_key,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Purchase failed', details: String(error) },
      { status: 500 }
    )
  }
}
