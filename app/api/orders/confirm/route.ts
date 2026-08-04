import { NextRequest, NextResponse } from 'next/server'

// PHP backend bazaviy manzili — .env.local'da NEXT_PUBLIC_API_BASE_URL bilan bir xil bo'lishi kerak.
const PHP_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://6a4cc7f182c08.xvest2.ru').replace(/\/$/, '')
// PHP config.php dagi ADMIN_API_TOKEN bilan bir xil bo'lishi shart — bu token
// faqat serverda ishlatiladi, brauzerga hech qachon yuborilmaydi.
const ADMIN_API_TOKEN = process.env.PHP_ADMIN_API_TOKEN || 'Saidazam'

// StarsTG orqali xarid tugagach (yoki muvaffaqiyatli, yoki muvaffaqiyatsiz)
// shu route chaqiriladi: buyurtma yakuniy holatga o'tkaziladi — "fulfilled"
// bo'lsa foydalanuvchiga "tushdi" xabari ketadi, "failed" bo'lsa pul avtomatik
// balansga qaytariladi. Bundan oldin frontend hech narsani kutmasdan darhol
// "yuborildi" deb ko'rsatib qo'yardi — shu yerdagi tasdiqlash aynan shu xato
// (loadingdan keyin haqiqiy holat ko'rinmasligi va balans "sirli" qaytishi) ni tuzatadi.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, status, deliveredName, reason } = body as {
      orderId?: number
      status?: 'fulfilled' | 'failed'
      deliveredName?: string
      reason?: string
    }

    if (!orderId || (status !== 'fulfilled' && status !== 'failed')) {
      return NextResponse.json({ success: false, error: 'invalid_payload' }, { status: 400 })
    }

    const res = await fetch(`${PHP_BASE}/api/auto_confirm.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_API_TOKEN}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        status,
        delivered_name: deliveredName || null,
        reason: reason || '',
      }),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({ ok: false, error: 'bad_response' }))

    if (!res.ok || data?.ok === false) {
      return NextResponse.json({ success: false, error: data?.error || 'confirm_failed' }, { status: res.status || 500 })
    }

    return NextResponse.json({ success: true, order: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'confirm_failed', details: String(error) }, { status: 500 })
  }
}
