import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.STARSTG_API_KEY || 'sj_860f22eae0212652c17bdc00816188568e66a92df86391daf26b9aaa'
const STARSTG_BASE_URL = 'https://api.starstg.uz/api/purchase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productType = searchParams.get('product_type')
    const query = searchParams.get('query')
    const quantity = searchParams.get('quantity')
    const months = searchParams.get('months')

    if (!productType || !query) {
      return NextResponse.json(
        { success: false, error: 'Missing product_type or query' },
        { status: 400 }
      )
    }

    const body: any = { product_type: productType, query }
    if (quantity) body.quantity = quantity
    if (months) body.months = months

    const response = await fetch(`${STARSTG_BASE_URL}/v1/search`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Search failed', details: String(error) },
      { status: 500 }
    )
  }
}
