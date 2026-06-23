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
            placeholder="Write your reflection…"
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus:border-primary"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!content.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              Save reflection
            </button>
          </div>
        </form>

        {reflections.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No reflections yet.</p>
            <p className="text-xs text-muted-foreground">Your written thoughts will appear here.</p>
          </div>
        )}

        {reflections.map((r) => (
          <article key={r.id} className="glass group rounded-xl p-4">
            <div className="mb-1.5 flex items-center justify-between">
              <time className="font-mono-label text-[10px] text-muted-foreground">
                {formatDate(r.created_at)}
              </time>
              <button
                type="button"
                onClick={() => deleteReflection(r.id)}
                aria-label="Delete reflection"
                className="rounded-md p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{r.content}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
