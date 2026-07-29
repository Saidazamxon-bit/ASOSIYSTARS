// Faqat statik fayllarni (rasm, shrift, ovoz) keshlaymiz.
// API so'rovlari (catalog.php, gifts.php va h.k.) HECH QACHON keshlanmaydi —
// aks holda admin panelda narx/gift o'zgartirilganda foydalanuvchi eski
// (keshlangan) ma'lumotni ko'raverdi va sahifani yangilash ham yordam bermasdi.
const CACHE_NAME = 'ultra-sw-v2'
const ASSETS = ['/favicon.ico', '/styles.css']

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS).catch(() => {}))
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

function isApiRequest(url) {
  return url.pathname.includes('/api/') || url.pathname.endsWith('.php')
}

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)

  // HTML navigatsiya so'rovlari — doim tarmoqdan (eski sahifa keshlanmasin)
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/favicon.ico')))
    return
  }

  // Barcha API / backend so'rovlari — doim tarmoqdan, HECH QACHON keshdan emas.
  // Bu StarsWeb balans, katalog narxlari va giftlar ro'yxati doim real vaqtda
  // (admin panelda o'zgartirilgan zahoti) yangilanishini kafolatlaydi.
  if (req.method !== 'GET' || isApiRequest(url)) {
    e.respondWith(fetch(req))
    return
  }

  // Faqat statik assetlar uchun: tarmoqni birinchi urinib ko'r, muvaffaqiyatsiz
  // bo'lsa keshdan ber (offline fallback). Bu "cache-first" emas "network-first".
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(req, clone)).catch(() => {})
        }
        return res
      })
      .catch(() => caches.match(req))
  )
})
