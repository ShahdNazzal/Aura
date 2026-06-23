"use client"

import { Layers, Sparkles, Moon, BarChart3 } from "lucide-react"

export type PanelKey = "cards" | "reflect" | "avatar" | "stats" | "chat"

const ITEMS: { key: PanelKey; label: string; icon: typeof Layers }[] = [
  { key: "cards", label: "Cards", icon: Layers },
  { key: "reflect", label: "Reflect", icon: Moon },
  { key: "avatar", label: "Avatar", icon: Sparkles },
  { key: "stats", label: "Stats", icon: BarChart3 },
  { key: "chat", label: "Chat", icon: BarChart3 },
]

export function Dock({
  active,
  onSelect,
}: {
  active: PanelKey | null
  onSelect: (key: PanelKey) => void
}) {
  return (
    <nav className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2">
      <div className="glass flex items-center gap-1 rounded-2xl p-1.5 shadow-2xl">
        {ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-label={label}
              aria-pressed={isActive}
              className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
