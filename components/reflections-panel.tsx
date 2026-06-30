"use client"

import { useState, useMemo } from "react"
import { Trash2, Sparkles, RefreshCw, PenLine, Flame } from "lucide-react"
import type { useAuraData } from "@/lib/use-aura-data"

type Data = ReturnType<typeof useAuraData>

const PROMPTS = [
  "What gave you energy today?",
  "What is one small win you can celebrate?",
  "What drained you, and why?",
  "What are you grateful for right now?",
  "What would your future self thank you for?",
  "What pattern keeps repeating in your life?",
  "What did you learn the hard way?",
  "When did you feel most alive this week?",
  "What are you avoiding, and what would happen if you faced it?",
  "What does your body need right now?",
]

const MOODS = [
  { emoji: "🌿", label: "Calm", color: "#6ee7b7" },
  { emoji: "☀️", label: "Bright", color: "#fcd34d" },
  { emoji: "🔥", label: "Fired up", color: "#fca5a5" },
  { emoji: "🌊", label: "Wavy", color: "#93c5fd" },
  { emoji: "🌙", label: "Reflective", color: "#c4b5fd" },
] as const

type MoodValue = (typeof MOODS)[number]["label"]

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  let relative = ""
  if (diffMins < 1) relative = "Just now"
  else if (diffMins < 60) relative = `${diffMins}m ago`
  else if (diffHrs < 24) relative = `${diffHrs}h ago`
  else if (diffDays === 1) relative = "Yesterday"
  else if (diffDays < 7) relative = `${diffDays}d ago`
  else relative = d.toLocaleDateString(undefined, { month: "short", day: "numeric" })

  return { relative, full: d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }
}

function getDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getStreakDays(reflections: { created_at: string }[]): number {
  if (reflections.length === 0) return 0

  const days = new Set<string>()
  for (const r of reflections) {
    const d = new Date(r.created_at)
    days.add(getDateKey(d))
  }

  let streak = 0
  const now = new Date()
  for (let i = 0; i < 365; i++) {
    const check = new Date(now)
    check.setDate(check.getDate() - i)
    const key = getDateKey(check)
    if (days.has(key)) streak++
    else break
  }

  return streak
}

export function ReflectionsPanel({ data }: { data: Data }) {
  const { reflections, addReflection, deleteReflection } = data
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<MoodValue | null>(null)
  const [promptIdx, setPromptIdx] = useState(() => Math.floor(Math.random() * PROMPTS.length))
  const [isFocused, setIsFocused] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const prompt = PROMPTS[promptIdx]
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const streak = useMemo(() => getStreakDays(reflections), [reflections])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    const moodPrefix = mood ? `[${mood}] ` : ""
    await addReflection(moodPrefix + content.trim())
    setContent("")
    setMood(null)
    setPromptIdx(Math.floor(Math.random() * PROMPTS.length))
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteReflection(id)
    setDeletingId(null)
  }

  const sorted = [...reflections].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const grouped = useMemo(() => {
    const map = new Map<string, typeof sorted>()
    for (const r of sorted) {
      const d = new Date(r.created_at)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      const group = map.get(key) ?? []
      group.push(r)
      map.set(key, group)
    }
    return [...map.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, items]) => {
        const [year, month, day] = key.split("-").map((part) => Number(part))
        const d = new Date(year, month, day)
        const today = new Date()
        const isToday = d.toDateString() === today.toDateString()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const isYesterday = d.toDateString() === yesterday.toDateString()
        const label = isToday ? "Today" : isYesterday ? "Yesterday" : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
        return { key, label, items }
      })
  }, [sorted])

  function extractMood(text: string): { mood: (typeof MOODS)[number] | null; clean: string } {
    for (const m of MOODS) {
      if (text.startsWith(`[${m.label}] `)) {
        return { mood: m, clean: text.slice(m.label.length + 3) }
      }
    }
    return { mood: null, clean: text }
  }

  const selectedMoodObj = MOODS.find((m) => m.label === mood)

  return (
    <div className="flex h-full flex-col bg-[#0a0a0f]">
      {/* ── Header ── */}
      <header className="relative px-6 pt-6 pb-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
              Journal
            </p>
            <h2 className="mt-1 text-xl font-light tracking-tight text-white/95">
              Reflections
            </h2>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1">
              <Flame className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-semibold tabular-nums text-amber-400">
                {streak}d
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* ── Compose Area ── */}
        <form onSubmit={submit} className="mb-6">
          <div
            className="overflow-hidden rounded-2xl border transition-all duration-300"
            style={{
              borderColor: isFocused ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
              backgroundColor: isFocused ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
            }}
          >
            {/* Prompt */}
            <div className="px-5 pt-4 pb-0">
              <div
                className={`flex items-start gap-2.5 transition-all duration-500 ${
                  isFocused ? "max-h-0 translate-y-[-4px] overflow-hidden opacity-0" : "max-h-12 opacity-100"
                }`}
              >
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-white/40" />
                <p className="text-[12px] leading-relaxed text-white/50 italic">
                  {prompt}
                </p>
                <button
                  type="button"
                  onClick={() => setPromptIdx((i) => (i + 1) % PROMPTS.length)}
                  className="ml-auto shrink-0 rounded-md p-1 text-white/25 transition-colors hover:bg-white/[0.08] hover:text-white/50"
                  aria-label="New prompt"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>

            {/* Mood Selector */}
            <div className="px-5 pt-4 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                  Mood
                </span>
                <div className="flex items-center gap-1.5">
                  {MOODS.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMood(mood === m.label ? null : m.label)}
                      className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 active:scale-90"
                      style={{
                        backgroundColor: mood === m.label ? `${m.color}25` : "transparent",
                        boxShadow: mood === m.label ? `0 0 0 1.5px ${m.color}70` : `0 0 0 1px rgba(255,255,255,0.1)`,
                      }}
                      title={m.label}
                    >
                      <span className="text-[14px] leading-none">{m.emoji}</span>
                    </button>
                  ))}
                </div>
                {selectedMoodObj && (
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: selectedMoodObj.color }}
                  >
                    {selectedMoodObj.label}
                  </span>
                )}
              </div>
            </div>

            {/* Textarea */}
            <div className="px-5 pt-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    e.currentTarget.form?.requestSubmit()
                  }
                }}
                placeholder="What's on your mind…"
                rows={4}
                className="w-full resize-none bg-transparent text-[13px] leading-[1.8] text-white/90 placeholder-white/25 outline-none"
              />
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
              <span className="font-mono text-[10px] tabular-nums text-white/30">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>

              <button
                type="submit"
                disabled={!content.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-white/[0.08] px-4 py-1.5 text-[11px] font-medium text-white/70 transition-all duration-200 hover:bg-white/[0.14] hover:text-white/90 active:scale-[0.97] disabled:opacity-20 disabled:hover:bg-white/[0.08] disabled:hover:text-white/70"
              >
                <PenLine className="h-2.5 w-2.5" />
                Save
              </button>
            </div>
          </div>
        </form>

        {/* ── Empty State ── */}
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
              <Sparkles className="h-6 w-6 text-white/20" />
            </div>
            <p className="text-sm font-light text-white/40">Your journal is empty</p>
            <p className="mt-1 max-w-[200px] text-center text-[11px] leading-relaxed text-white/25">
              Start writing to capture the moments that shape your aura
            </p>
          </div>
        )}

        {/* ── Timeline ── */}
        {grouped.map(({ label, items }) => (
          <div key={label} className="mb-6 last:mb-0">
            <div className="mb-3 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">
                {label}
              </span>
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[10px] tabular-nums text-white/25">
                {items.length} {items.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            <div className="relative ml-2.5 border-l border-white/[0.06] pl-5 space-y-2.5">
              {items.map((r) => {
                const { mood: entryMood, clean: entryText } = extractMood(r.content)
                const { relative, full } = formatDate(r.created_at)
                const isDeleting = deletingId === r.id

                return (
                  <div key={r.id} className="relative">
                    <span
                      className="absolute -left-[22px] top-4 h-1.5 w-1.5 rounded-full border-[1.5px] border-[#0a0a0f]"
                      style={{
                        backgroundColor: entryMood ? entryMood.color : "rgba(255,255,255,0.25)",
                        boxShadow: entryMood ? `0 0 6px ${entryMood.color}40` : "none",
                      }}
                    />

                    <article
                      className={`group rounded-xl border transition-all duration-300 ${
                        isDeleting
                          ? "scale-[0.97] border-white/[0.02] opacity-0"
                          : "border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between px-4 pt-3 pb-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {entryMood && (
                            <span className="text-[11px] shrink-0">{entryMood.emoji}</span>
                          )}
                          <time
                            className="font-mono text-[10px] tabular-nums text-white/40 truncate"
                            title={full}
                          >
                            {relative}
                          </time>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          aria-label="Delete reflection"
                          className="shrink-0 rounded-md p-1 text-white/0 transition-all duration-200 group-hover:text-white/30 hover:!bg-red-500/10 hover:!text-red-400/70 active:scale-95"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="whitespace-pre-wrap break-words px-4 pb-3 pt-1.5 text-[13px] leading-[1.75] text-white/75">
                        {entryText}
                      </p>

                      <div className="border-t border-white/[0.04] px-4 py-2">
                        <span className="font-mono text-[9px] tabular-nums text-white/20">
                          {entryText.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                    </article>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
