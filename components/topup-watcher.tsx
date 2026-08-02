'use client'

import { useEffect, useRef } from 'react'
import { useBalance, formatUZS } from '@/components/balance-provider'
import { useNotifications } from '@/components/notification-context'

/**
 * Har doim (to'lov modali ochiq yoki yopiq bo'lishidan qat'iy nazar) fonda ishlaydi.
 * BalanceProvider fon rejimida "pending" so'rovni tekshirib turadi (humo webhook
 * kelib, balans oshgach status "approved"ga o'tadi) — bu komponent aynan shu
 * paytni ushlab, foydalanuvchiga "chek" ko'rinishidagi bildirishnoma ko'rsatadi,
 * hatto u modalni yopib qo'ygan yoki boshqa sahifada bo'lsa ham.
 */
export function TopUpWatcher() {
  const { topUpRequest } = useBalance()
  const { addNotification } = useNotifications()
  const notifiedIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (
      topUpRequest &&
      topUpRequest.status === 'approved' &&
      notifiedIdRef.current !== topUpRequest.id
    ) {
      notifiedIdRef.current = topUpRequest.id
      addNotification("To'lov qabul qilindi!", `${formatUZS(topUpRequest.amount)} so'm hisobingizga tushdi ✅`, {
        variant: 'success',
      })
    }
  }, [topUpRequest, addNotification])

  return null
}
