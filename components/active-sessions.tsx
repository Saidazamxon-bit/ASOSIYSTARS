'use client'

type Session = { id: string; device: string; ip?: string; lastSeen: string; current?: boolean }

function formatLastSeen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function ActiveSessions({
  sessions,
  onRevoke,
}: {
  sessions: Session[]
  onRevoke: (id: string) => Promise<boolean>
}) {
  return (
    <div className="mt-4 space-y-2">
      {sessions.length ? (
        sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/70 p-4"
          >
            <div>
              <div className="flex items-center gap-2 font-semibold text-foreground">
                {session.device}
                {session.current ? (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                    Joriy
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {session.ip ?? '—'} • {formatLastSeen(session.lastSeen)}
              </div>
            </div>
            {session.current ? (
              <span className="text-xs text-muted-foreground">Bu qurilma</span>
            ) : (
              <button
                type="button"
                data-disable-sound="true"
                onClick={() => onRevoke(session.id)}
                className="rounded-full border border-rose-300 bg-rose-500/10 px-3 py-1.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/15"
              >
                Chiqish
              </button>
            )}
          </div>
        ))
      ) : (
        <div className="rounded-3xl border border-border bg-secondary/80 p-4 text-sm text-muted-foreground">
          Hech qanday faol seans topilmadi. Yangilash tugmasini bosib qayta urinib ko'ring.
        </div>
      )}
    </div>
  )
}
