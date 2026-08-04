import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.STARSTG_API_KEY || 'sj_860f22eae0212652c17bdc00816188568e66a92df86391daf26b9aaa'
const STARSTG_BASE_URL = 'https://api.starstg.uz/api/purchase'

// NOTE: purchase-stars/purchase-premium javobida status "processing" bo'lishi
// mumkin (StarsTG darhol emas, biroz keyin yakunlaydi). Bu route o'sha
// buyurtmaning YAKUNIY holatini StarsTG'dan so'raydi. Agar StarsTG'ning
// haqiqiy status-tekshirish manzili shu yerdagidan farq qilsa (masalan
// `/v1/orders/{id}` emas, boshqacha bo'lsa), StarsTG hujjatiga qarab shu
// faylni moslashtiring — hozircha eng ko'p tarqalgan REST andozasi ishlatildi.
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('order_id')
  if (!orderId) {
    return NextResponse.json({ success: false, error: 'order_id required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${STARSTG_BASE_URL}/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'status_check_failed', details: String(error) },
      { status: 500 },
    )
  }
}
