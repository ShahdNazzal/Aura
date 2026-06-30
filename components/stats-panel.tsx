"use client"

import { CATEGORY_COLORS, type CardCategory } from "@/lib/types"
import type { useAuraData } from "@/lib/use-aura-data"

type Data = ReturnType<typeof useAuraData>

export function StatsPanel({ data }: { data: Data }) {
  const { cards, reflections, overallProgress } = data

  const totalTasks = cards.reduce((s, c) => s + c.tasks.length, 0)
  const doneTasks = cards.reduce((s, c) => s + c.tasks.filter((t) => t.is_done).length, 0)
  const completedCards = cards.filter((c) => c.status === "completed").length

  const byCategory = new Map<CardCategory, { sum: number; count: number }>()
  for (const c of cards) {
    const entry = byCategory.get(c.category) ?? { sum: 0, count: 0 }
    entry.sum += c.progress
    entry.count += 1
    byCategory.set(c.category, entry)
  }

  const circumference = 2 * Math.PI * 58
  const offset = circumference - (overallProgress / 100) * circumference

  const taskRatio = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0
  const taskOffset = circumference - (taskRatio / 100) * circumference

  const stats = [
    {
      label: "Active",
      value: cards.length,
      sub: "cards in flow",
      accent: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    {
      label: "Completed",
      value: completedCards,
      sub: "closed out",
      accent: "text-violet-400",
      bg: "bg-violet-400/10",
      border: "border-violet-400/20",
    },
    {
      label: "Steps",
      value: `${doneTasks}/${totalTasks}`,
      sub: "tasks finished",
      accent: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      label: "Reflections",
      value: reflections.length,
      sub: "moments captured",
      accent: "text-sky-400",
      bg: "bg-sky-400/10",
      border: "border-sky-400/20",
    },
  ]

  return (
    <div className="flex h-full flex-col bg-[#0a0a0f]">
      {/* ── Header ── */}
      <header className="relative px-6 pt-6 pb-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
              Dashboard
            </p>
            <h2 className="mt-1 text-xl font-light tracking-tight text-white/90">
              Your Aura
            </h2>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-medium text-white/50">Live</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* ── Dual Ring Progress ── */}
        <div className="relative mb-8 flex items-center justify-center rounded-2xl border border-white/[0.04] bg-white/[0.02] py-8">
          {/* Background glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle at 50% 50%, var(--primary) 0%, transparent 70%)`,
            }}
          />

          <div className="relative flex items-center gap-10">
            {/* Aura Ring */}
            <div className="relative flex flex-col items-center">
              <svg width="132" height="132" className="-rotate-90">
                <circle
                  cx="66"
                  cy="66"
                  r="58"
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="6"
                />
                <circle
                  cx="66"
                  cy="66"
                  r="58"
                  fill="none"
                  stroke="url(#auraGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extralight tabular-nums text-white/90">
                  {overallProgress}
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/30">
                  Aura
                </span>
              </div>
            </div>

            {/* Task Ring */}
            <div className="relative flex flex-col items-center">
              <svg width="100" height="100" className="-rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 - (taskRatio / 100) * (2 * Math.PI * 42)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-extralight tabular-nums text-white/70">
                  {Math.round(taskRatio)}%
                </span>
                <span className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                  Tasks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Rows ── */}
        <div className="mb-8 space-y-1">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-colors duration-200 hover:bg-white/[0.03]"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg} border ${s.border}`}
              >
                <span className={`text-sm font-semibold ${s.accent}`}>{s.value}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white/80">{s.label}</p>
                <p className="text-[11px] text-white/25">{s.sub}</p>
              </div>
              <svg
                className="h-3.5 w-3.5 text-white/10 transition-colors group-hover:text-white/20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>

        {/* ── Category Breakdown ── */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
              By Category
            </p>
            <span className="text-[10px] text-white/15">
              {byCategory.size} {byCategory.size === 1 ? "group" : "groups"}
            </span>
          </div>

          {byCategory.size === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.06] py-10">
              <svg
                className="mb-3 h-8 w-8 text-white/10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13h2v8H3zm6-4h2v12H9zm6-6h2v18h-2zm6 10h2v8h-2z"
                />
              </svg>
              <p className="text-xs text-white/20">No categories yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...byCategory.entries()]
                .sort((a, b) => b[1].sum / b[1].count - a[1].sum / a[1].count)
                .map(([cat, { sum, count }], idx) => {
                  const avg = Math.round(sum / count)
                  const color = CATEGORY_COLORS[cat]
                  return (
                    <div
                      key={cat}
                      className="group relative overflow-hidden rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3.5 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.03]"
                    >
                      {/* Progress fill from left */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-xl opacity-[0.06] transition-all duration-700"
                        style={{ width: `${avg}%`, backgroundColor: color }}
                      />

                      <div className="relative flex items-center gap-3">
                        {/* Rank number */}
                        <span className="w-4 text-right font-mono text-[10px] text-white/15">
                          {String(idx + 1).padStart(2, "0")}
                        </span>

                        {/* Color dot */}
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor: color,
                            boxShadow: `0 0 6px ${color}80`,
                          }}
                        />

                        {/* Category name */}
                        <span className="flex-1 text-sm capitalize text-white/70">
                          {cat}
                        </span>

                        {/* Bar */}
                        <div className="hidden w-20 sm:block">
                          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${avg}%`,
                                backgroundColor: color,
                                boxShadow: `0 0 4px ${color}60`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Value */}
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-sm font-semibold tabular-nums"
                            style={{ color }}
                          >
                            {avg}%
                          </span>
                          <span className="text-[9px] text-white/20">({count})</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* ── Footer Quote ── */}
        <div className="mt-8 border-t border-white/[0.04] pt-5">
          <p className="text-center text-[11px] leading-relaxed italic text-white/15">
            {overallProgress === 0
              ? "Every journey begins with a single step."
              : overallProgress < 25
                ? "You've started — that's everything."
                : overallProgress < 50
                  ? "Momentum is building. Keep going."
                  : overallProgress < 75
                    ? "Past the halfway mark. Real growth happening."
                    : overallProgress < 100
                      ? "Almost there. The finish line is close."
                      : "Complete. Your aura is fully realized."}
          </p>
        </div>
      </div>
    </div>
  )
}
