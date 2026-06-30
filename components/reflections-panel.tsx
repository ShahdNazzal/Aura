"use client"

import { useState } from "react"
import { Trash2, Sparkles } from "lucide-react"
import type { useAuraData } from "@/lib/use-aura-data"

type Data = ReturnType<typeof useAuraData>

const PROMPTS = [
  "What gave you energy today?",
  "What is one small win you can celebrate?",
  "What drained you, and why?",
  "What are you grateful for right now?",
  "What would your future self thank you for?",
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ReflectionsPanel({ data }: { data: Data }) {
  const { reflections, addReflection, deleteReflection } = data
  const [content, setContent] = useState("")
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    await addReflection(content.trim())
    setContent("")
  }

  const sorted = [...reflections].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border/60 px-5 py-4">
        <h2 className="text-balance text-lg font-semibold text-foreground">Reflections</h2>
        <p className="text-xs text-muted-foreground">Journal moments that shape your aura</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <form onSubmit={submit} className="glass rounded-xl p-4">
          <div className="mb-2 flex items-center gap-2 text-accent">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs italic text-muted-foreground">{prompt}</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              // عند الضغط على Enter يتم الحفظ مباشرة
              // أما إذا ضغط Shift + Enter فيتم عمل سطر جديد (طبيعي في التكست اريا)
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder="Write your reflection…"
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus:border-primary"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={!content.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              Save reflection
            </button>
          </div>
        </form>

        {sorted.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Sparkles className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No reflections yet.</p>
            <p className="text-xs text-muted-foreground">Your written thoughts will appear here.</p>
          </div>
        )}

        {sorted.map((r) => {
          return (
            <article
              key={r.id}
              className="glass group rounded-xl p-4 transition"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <time className="font-mono-label text-[10px] text-muted-foreground">
                  {formatDate(r.created_at)}
                </time>
                {/* زر الحذف يعمل بكفاءة على الموبايل (مرئي دائماً ومساحة لمس كبيرة) */}
                <button
                  type="button"
                  onClick={() => deleteReflection(r.id)}
                  aria-label="Delete reflection"
                  className="rounded-lg p-2 text-muted-foreground transition-all active:scale-95 hover:bg-destructive/10 hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{r.content}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
