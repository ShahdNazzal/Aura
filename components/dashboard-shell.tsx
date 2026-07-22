"use client"



//C:\Users\lenovo\Desktop\build-aura-gamified-platform\components\dashboard-shell.tsx


import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuraData } from "@/lib/use-aura-data"
import { MOODS, type LifeCard } from "@/lib/types"
import { AvatarSVG } from "@/components/avatar-svg"
import { StarField } from "@/components/star-field"
import { OrbitCards } from "@/components/orbit-cards"
import { Dock, type PanelKey } from "@/components/dock"
import { CardsPanel } from "@/components/cards-panel"
import { ReflectionsPanel } from "@/components/reflections-panel"
import { AvatarStudio } from "@/components/avatar-studio"
import { StatsPanel } from "@/components/stats-panel"
import { ChatPanel } from "@/components/chat-panel"

export function DashboardShell({ userId, email }: { userId: string; email: string }) {
  const router = useRouter()
  const data = useAuraData(userId)
  const [panel, setPanel] = useState<PanelKey | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const mood = MOODS.find((m) => m.id === data.avatar.mood) ?? MOODS[0]

  function openCard(card: LifeCard) {
    setSelectedCardId(card.id)
    setPanel("cards")
  }

  function handleNewCard(card: LifeCard) {
  data.addLiveCard(card)
  data.refresh()
}

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth")
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background">
      <StarField />

      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="aura-logo text-lg font-bold tracking-[0.3em] text-foreground">AURA</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex">
            <span className="text-base leading-none">{mood.symbol}</span>
            <span className="text-xs text-muted-foreground">{mood.label}</span>
          </div>
          <button
            type="button"
            onClick={signOut}
            aria-label="Sign out"
            title={email}
            className="glass rounded-full p-2 text-muted-foreground transition hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Center stage */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <OrbitCards cards={data.cards} onSelect={openCard} />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-56 sm:w-64 md:w-72 aura-float">
            {data.loading ? (
              <div className="aspect-[3/4] w-full animate-pulse rounded-3xl bg-secondary/40" />
            ) : (
              <AvatarSVG
                config={data.avatar}
                progress={data.overallProgress}
                showAura
                className="w-full"
              />
            )}
          </div>
          <div className="mt-2 text-center">
            <p className="font-mono-label text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Aura Level
            </p>
            <p className="text-3xl font-bold text-foreground">{data.overallProgress}%</p>
          </div>
        </div>
      </div>

      {/* Hint when no cards */}
      {!data.loading && data.cards.length === 0 && !panel && (
        <div className="pointer-events-none absolute inset-x-0 bottom-28 z-10 text-center">
          <p className="text-sm text-muted-foreground">
            Tap <span className="text-foreground">Cards</span> to plant your first seed of growth.
          </p>
        </div>
      )}

      {/* Side panel */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-md transform border-l border-border/60 bg-card/95 backdrop-blur-xl transition-transform duration-300 ${
          panel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {panel && (
          <div className="relative h-full">
            <button
              type="button"
              onClick={() => {
                setPanel(null)
                setSelectedCardId(null)
              }}
              aria-label="Close panel"
              className="absolute right-3 top-3 z-50 rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {panel === "cards" && (
              <CardsPanel
                data={data}
                selectedCardId={selectedCardId}
                onClearSelection={() => setSelectedCardId(null)}
              />
            )}
            {panel === "reflect" && <ReflectionsPanel data={data} />}
            {panel === "avatar" && <AvatarStudio data={data} />}
            {panel === "stats" && <StatsPanel data={data} />}
            {panel === ("chat" as PanelKey) && (
              <ChatPanel
                userId={userId}
                onNewCard={handleNewCard}
              />
            )}
          </div>
        )}
      </div>

      {/* Backdrop (mobile) */}
      {panel && (
        <button
          type="button"
          aria-label="Close panel"
          onClick={() => {
            setPanel(null)
            setSelectedCardId(null)
          }}
          className="fixed inset-0 z-30 bg-background/40 backdrop-blur-sm md:hidden"
        />
      )}

      <Dock
        active={panel}
        onSelect={(key) => setPanel((p) => (p === key ? null : key))}
      />
    </main>
  )
}