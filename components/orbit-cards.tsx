"use client"

import { CATEGORY_COLORS, type LifeCard } from "@/lib/types"

interface OrbitCardsProps {
  cards: LifeCard[]
  onSelect: (card: LifeCard) => void
}

export function OrbitCards({ cards, onSelect }: OrbitCardsProps) {
  const visible = cards.slice(0, 8)
  if (visible.length === 0) return null

  return (
    <div
      aria-hidden={false}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div
        className="relative"
        style={{
          width: "min(78vw, 620px)",
          height: "min(78vw, 620px)",
          animation: "orbit-spin 60s linear infinite",
        }}
      >
        {visible.map((card, i) => {
          const angle = (i / visible.length) * Math.PI * 2
          // elliptical path
          const x = 50 + Math.cos(angle) * 46
          const y = 50 + Math.sin(angle) * 38
          const color = CATEGORY_COLORS[card.category] ?? "#8a99b3"
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelect(card)}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                animation: "orbit-counter 60s linear infinite",
              }}
            >
              <div
                className="glass group w-36 rounded-xl p-3 text-left transition-transform duration-300 hover:scale-110"
                style={{ boxShadow: `0 0 22px ${color}33`, borderColor: `${color}55` }}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                  />
                  <span className="font-mono-label text-[10px] text-muted-foreground">
                    {card.category}
                  </span>
                </div>
                <p className="truncate text-sm font-semibold text-foreground">{card.title}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${card.progress}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}`,
                    }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
