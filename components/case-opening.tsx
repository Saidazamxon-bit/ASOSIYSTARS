'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic'
type RewardType = 'Telegram Gift' | 'Telegram Stars' | 'Telegram Premium' | 'Balance'

type RewardItem = {
  id: string
  label: string
  type: RewardType
  rarity: Rarity
  chance: number
  icon: string
  description: string
}

type CaseDefinition = {
  id: string
  title: string
  price: number
  icon: string
  rewardPool: RewardItem[]
}

const CASES: CaseDefinition[] = [
  {
    id: 'mini',
    title: 'Mini Case',
    price: 25000,
    icon: '🎁',
    rewardPool: [
      { id: 'stars-50', label: '50 Stars', type: 'Telegram Stars', rarity: 'Common', chance: 40, icon: '⭐', description: 'Stars reward' },
      { id: 'balance-25k', label: '25k Balance', type: 'Balance', rarity: 'Common', chance: 30, icon: '💰', description: 'Balance' },
      { id: 'premium', label: 'Premium', type: 'Telegram Premium', rarity: 'Rare', chance: 20, icon: '👑', description: 'Premium' },
      { id: 'stars-500', label: '500 Stars', type: 'Telegram Stars', rarity: 'Epic', chance: 10, icon: '🌟', description: 'Epic reward' },
    ],
  },
]

const RARITY_STYLES: Record<Rarity, string> = {
  Common: 'text-white/70 bg-white/5 border-white/10',
  Rare: 'text-cyan-300 bg-cyan-400/10 border-cyan-300/20',
  Epic: 'text-violet-300 bg-violet-500/10 border-violet-300/20',
  Legendary: 'text-amber-300 bg-amber-400/10 border-amber-300/20',
  Mythic: 'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-300/20',
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('uz-UZ')} som`
}

function chooseReward(pool: RewardItem[]) {
  const total = pool.reduce((sum, item) => sum + item.chance, 0)
  const roll = Math.random() * total
  let accumulator = 0
  for (const item of pool) {
    accumulator += item.chance
    if (roll < accumulator) return item
  }
  return pool[pool.length - 1]
}

function playAudio(src: string) {
  if (typeof window === 'undefined') return
  try {
    const audio = new Audio(src)
    audio.volume = 0.18
    void audio.play()
  } catch {
    // ignore
  }
}

function vibratePattern() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([20, 30, 20])
  }
}

export function CaseOpening() {
  const [balance, setBalance] = useState(1250000)
  const [selectedCase, setSelectedCase] = useState<CaseDefinition>(CASES[0])
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [reelOffset, setReelOffset] = useState(0)
  const [reelKey, setReelKey] = useState(0)
  const timeoutRef = useRef<number | null>(null)

  const rewardItems = useMemo(() => {
    return Array.from({ length: 5 }, () => selectedCase.rewardPool).flat()
  }, [selectedCase])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleOpenCase = useCallback(
    (caseItem: CaseDefinition) => {
      if (isOpening) return
      if (balance < caseItem.price) {
        playAudio('/sounds/default.mp3')
        return
      }

      const reward = chooseReward(caseItem.rewardPool)
      const winnerIndex = caseItem.rewardPool.findIndex((item) => item.id === reward.id)
      const safeIndex = winnerIndex === -1 ? 0 : winnerIndex
      const targetIndex = safeIndex + caseItem.rewardPool.length * 3
      const targetPosition = targetIndex * 156

      setSelectedCase(caseItem)
      setSelectedReward(reward)
      setBalance((current) => current - caseItem.price)
      setShowResult(false)
      setIsOpening(true)
      setReelKey((current) => current + 1)
      setReelOffset(0)

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setReelOffset(targetPosition)
        })
      })

      playAudio('/sounds/modern.mp3')
      vibratePattern()

      timeoutRef.current = window.setTimeout(() => {
        setShowResult(true)
        setIsOpening(false)
        playAudio('/sounds/asmr.mp3')
        vibratePattern()
      }, 2800)
    },
    [balance, isOpening],
  )

  const handleRetry = useCallback(() => {
    handleOpenCase(selectedCase)
  }, [handleOpenCase, selectedCase])

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-[0_35px_120px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8">
        <h1 className="text-4xl font-semibold uppercase tracking-[0.2em] text-white sm:text-5xl">Premium Case Opening</h1>
        <p className="mt-4 text-slate-300">Balance: {formatCurrency(balance)}</p>
      </div>

      <div className="mb-10 rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-[0_35px_120px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {CASES.map((caseItem) => {
            const isDisabled = balance < caseItem.price || isOpening
            const isActive = selectedCase.id === caseItem.id
            return (
              <button
                key={caseItem.id}
                type="button"
                disabled={isDisabled}
                onClick={() => handleOpenCase(caseItem)}
                className={`rounded-[28px] border border-white/10 bg-slate-950/85 p-6 text-left shadow-[0_26px_90px_rgba(15,23,42,0.35)] transition duration-300 ${isActive ? 'shadow-[0_32px_120px_rgba(168,85,247,0.26)]' : 'hover:-translate-y-1'} ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-fuchsia-500">
                    <span className="text-4xl">{caseItem.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase text-white/55">{caseItem.title}</p>
                    <p className="text-2xl font-semibold text-white mt-2">{formatCurrency(caseItem.price)}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/90 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
          <div className="relative mx-auto flex w-full max-w-5xl items-center justify-start overflow-hidden px-[calc(50%-84px)] py-8">
            <div
              key={reelKey}
              className="inline-flex items-center gap-4 transition-transform duration-[2800ms] ease-[cubic-bezier(0.22,0.76,0.2,1)] will-change-transform"
              style={{ transform: `translate3d(-${reelOffset}px, 0, 0)` }}
            >
              {rewardItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex h-36 min-w-[156px] flex-col items-center justify-between rounded-[28px] border border-white/10 bg-slate-900/80 p-4 text-center text-xs text-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.28)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/5 text-2xl">{item.icon}</div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase ${RARITY_STYLES[item.rarity]}`}>
                      {item.rarity}
                    </span>
                  </div>
                  <p className="text-[11px] leading-5 text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(isOpening || showResult) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_35px_120px_rgba(15,23,42,0.65)]">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-[11px] uppercase text-amber-200">
                {isOpening ? 'Opening...' : 'Congratulations!'}
              </span>
              <div className="relative mx-auto mt-6 flex h-64 w-64 items-center justify-center rounded-[40px] border border-white/10 bg-slate-950/95 shadow-[0_0_140px_rgba(168,85,247,0.25)]">
                <span className="text-6xl">{selectedCase.icon}</span>
                {showResult && selectedReward ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-6">
                      <div className="flex h-24 w-24 items-center justify-center text-5xl">{selectedReward.icon}</div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-5">
                  <p className="text-xs uppercase text-white/40">Result</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {showResult && selectedReward ? selectedReward.label : 'Loading...'}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowResult(false)
                    setSelectedReward(null)
                  }}
                  className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-slate-900/90 px-5 py-3 text-sm font-semibold uppercase text-white/70 transition hover:bg-white/5"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold uppercase text-white shadow-[0_18px_80px_rgba(168,85,247,0.28)] transition hover:brightness-110"
                >
                  Open Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
