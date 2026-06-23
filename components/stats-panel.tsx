"use client"

import { CATEGORY_COLORS, type CardCategory } from "@/lib/types"
import type { useAuraData } from "@/lib/use-aura-data"

type Data = ReturnType<typeof useAuraData>

export function StatsPanel({ data }: { data: Data }) {
  const { cards, reflections, overallProgress } = data

  const totalTasks = cards.reduce((s, c) => s + c.tasks.length, 0)
  const doneTasks = cards.reduce((s, c) => s + c.tasks.filter((t) => t.is_done).length, 0)
  const completedCards = cards.filter((c) => c.status === "completed").length

  // group progress by category
  const byCategory = new Map<CardCategory, { sum: number; count: number }>()
  for (const c of cards) {
    const entry = byCategory.get(c.category) ?? { sum: 0, count: 0 }
    entry.sum += c.progress
    entry.count += 1
    byCategory.set(c.category, entry)
  }

  const stats = [
    { label: "Aura Level", value: `${overallProgress}%` },
    { label: "Active Cards", value: cards.length },
    { label: "Completed", value: completedCards },
    { label: "Steps Done", value: `${doneTasks}/${totalTasks}` },
    { label: "Reflections", value: reflections.length },
  ]

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border/60 px-5 py-4">
        <h2 className="text-balance text-lg font-semibold text-foreground">Stats</h2>
        <p className="text-xs text-muted-foreground">The measure of your momentum</p>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <div className="glass rounded-xl p-5 text-center">
          <p className="font-mono-label text-[11px] uppercase tracking-wider text-muted-foreground">
            Overall Aura
          </p>
          <p className="my-1 text-5xl font-bold text-foreground">{overallProgress}%</p>
          <div className="mx-auto mt-3 h-2.5 max-w-xs overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${overallProgress}%`, boxShadow: "0 0 12px var(--primary)" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-xl p-4">
              <p className="font-mono-label text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-mono-label mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            Growth by category
          </h3>
          {byCategory.size === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {[...byCategory.entries()].map(([cat, { sum, count }]) => {
                const avg = Math.round(sum / count)
                const color = CATEGORY_COLORS[cat]
                return (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm capitalize text-foreground">{cat}</span>
                      <span className="font-mono-label text-xs tabular-nums text-muted-foreground">
                        {avg}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${avg}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
