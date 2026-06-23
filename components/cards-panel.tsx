"use client"

import { useState } from "react"
import { Plus, Trash2, Check, X, Circle, CheckCircle2 } from "lucide-react"
import { CATEGORY_COLORS, type CardCategory, type LifeCard } from "@/lib/types"
import type { useAuraData } from "@/lib/use-aura-data"

type Data = ReturnType<typeof useAuraData>

const CATEGORIES: CardCategory[] = ["mind", "body", "soul", "habits", "lifestyle", "custom"]

export function CardsPanel({
  data,
  selectedCardId,
  onClearSelection,
}: {
  data: Data
  selectedCardId: string | null
  onClearSelection: () => void
}) {
  const { cards, createCard, deleteCard, addTask, toggleTask, deleteTask } = data
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<CardCategory>("mind")
  const [description, setDescription] = useState("")
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({})

  async function submitCard(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await createCard(title.trim(), category, description.trim())
    setTitle("")
    setDescription("")
    setCategory("mind")
    setCreating(false)
  }

  async function submitTask(cardId: string) {
    const text = (taskInputs[cardId] ?? "").trim()
    if (!text) return
    await addTask(cardId, text)
    setTaskInputs((p) => ({ ...p, [cardId]: "" }))
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <h2 className="text-balance text-lg font-semibold text-foreground">Life Cards</h2>
          <p className="text-xs text-muted-foreground">Areas of growth you orbit around</p>
        </div>
        <button
  type="button"
  onClick={() => setCreating((v) => !v)}
  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 mr-6"
>
  <Plus className="h-4 w-4" /> New
</button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {creating && (
          <form onSubmit={submitCard} className="glass space-y-3 rounded-xl p-4">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title, e.g. Master Mindfulness"
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className="rounded-full px-3 py-1 text-xs font-medium capitalize transition"
                  style={{
                    backgroundColor: category === c ? CATEGORY_COLORS[c] : "transparent",
                    color: category === c ? "#06101f" : CATEGORY_COLORS[c],
                    border: `1px solid ${CATEGORY_COLORS[c]}66`,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does growth look like here?"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {cards.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm text-muted-foreground">No Life Cards yet.</p>
            <p className="text-xs text-muted-foreground">
              Create your first card to begin shaping your aura.
            </p>
          </div>
        )}

        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            highlighted={card.id === selectedCardId}
            onDelete={() => deleteCard(card.id)}
            onToggleTask={(taskId) => {
              const task = card.tasks.find(t => t.id === taskId)
              toggleTask(card.id, taskId, !task?.is_done)
            }}
            onDeleteTask={(taskId) => deleteTask(card.id, taskId)}
            taskInput={taskInputs[card.id] ?? ""}
            onTaskInput={(v) => setTaskInputs((p) => ({ ...p, [card.id]: v }))}
            onAddTask={() => submitTask(card.id)}
            onFocus={onClearSelection}
          />
        ))}
      </div>
    </div>
  )
}

function CardItem({
  card,
  highlighted,
  onDelete,
  onToggleTask,
  onDeleteTask,
  taskInput,
  onTaskInput,
  onAddTask,
  onFocus,
}: {
  card: LifeCard
  highlighted: boolean
  onDelete: () => void
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  taskInput: string
  onTaskInput: (v: string) => void
  onAddTask: () => void
  onFocus: () => void
}) {
  const color = CATEGORY_COLORS[card.category] ?? "#8a99b3"
  return (
    <div
      className="glass rounded-xl p-4 transition"
      style={
        highlighted
          ? { borderColor: color, boxShadow: `0 0 26px ${color}55` }
          : { borderColor: `${color}33` }
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
            />
            <span className="font-mono-label text-[10px] text-muted-foreground">
              {card.category}
            </span>
            <span
              className="font-mono-label text-[10px]"
              style={{ color }}
            >
              {card.status}
            </span>
          </div>
          <h3 className="truncate font-semibold text-foreground">{card.title}</h3>
          {card.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{card.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete card"
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${card.progress}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
          />
        </div>
        <span className="font-mono-label text-xs tabular-nums text-foreground">{card.progress}%</span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {card.tasks.map((task) => (
          <li key={task.id} className="group flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleTask(task.id)}
              className="shrink-0 text-muted-foreground transition hover:text-foreground"
              aria-label={task.is_done ? "Mark incomplete" : "Mark complete"}
            >
              {task.is_done ? (
                <CheckCircle2 className="h-4 w-4" style={{ color }} />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </button>
            <span
              className={`flex-1 text-sm ${task.is_done ? "text-muted-foreground line-through" : "text-foreground"}`}
            >
              {task.text}
            </span>
            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              className="shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
              aria-label="Delete task"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center gap-2">
        <input
          value={taskInput}
          onFocus={onFocus}
          onChange={(e) => onTaskInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onAddTask()
            }
          }}
          placeholder="Add a step…"
          className="flex-1 rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={onAddTask}
          aria-label="Add task"
          className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:border-primary hover:text-foreground"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
