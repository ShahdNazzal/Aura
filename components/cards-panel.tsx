"use client"

// C:\Users\lenovo\Downloads\build-aura-gamified-platform\components\cards-panel.tsx

import { useEffect, useRef, useState } from "react"
import { Plus, Trash2, Check, X, Circle, CheckCircle2, GripVertical, Rocket, ChevronUp, ChevronDown } from "lucide-react"
import { CATEGORY_COLORS, type CardCategory, type LifeCard } from "@/lib/types"
import type { useAuraData } from "@/lib/use-aura-data"

type Data = ReturnType<typeof useAuraData>
// بنشتق نوع التاسك من نوع الكارد نفسه، بدل ما نستورد نوع غير موجود جوا lib/types
type LifeTask = NonNullable<LifeCard["tasks"]>[number]

const CATEGORIES: CardCategory[] = ["mind", "body", "soul", "habits", "lifestyle", "custom"]

export function CardsPanel({
  data,
  selectedCardId,
  onClearSelection,
  liveCards = [],
  onDeleteLiveCard,
}: {
  data: Data
  selectedCardId: string | null
  onClearSelection: () => void
  liveCards?: LifeCard[]
  onDeleteLiveCard?: (cardId: string) => void
}) {
  const { cards, createCard, deleteCard, addTask, toggleTask, deleteTask } = data
  // reorderTasks اختيارية: لسا ما انضافت لـ useAuraData، فبنعملها optional حتى ما توقع الكود
  const reorderTasks = (data as { reorderTasks?: (cardId: string, orderedIds: string[]) => void }).reorderTasks

  async function handleDelete(cardId: string) {
    await deleteCard(cardId)
    onDeleteLiveCard?.(cardId)
  }
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<CardCategory>("mind")
  const [description, setDescription] = useState("")
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({})

  // دمج الكروت الجديدة مع الكروت من Supabase بدون تكرار
  const mergedCards: LifeCard[] = [
    ...cards,
    ...liveCards.filter((l) => !cards.find((c) => c.id === l.id)),
  ]

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
      {/* أنيميشن التاسك الأولى: نطة بسيطة لما توصل للصدارة + توهج مستمر بعدها */}
      <style>{`
        @keyframes taskFirstPop {
          0%   { transform: scale(0.82) translateY(4px); }
          45%  { transform: scale(1.06) translateY(-2px); }
          70%  { transform: scale(0.97) translateY(0); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes taskGlowPulse {
          0%, 100% { box-shadow: 0 0 8px var(--glow-color), 0 0 0px var(--glow-color) inset; }
          50%      { box-shadow: 0 0 18px var(--glow-color), 0 0 3px var(--glow-color) inset; }
        }
        .task-first-pop {
          animation: taskFirstPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both,
                     taskGlowPulse 2.2s ease-in-out 0.5s infinite;
        }
      `}</style>

      <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <h2 className="text-balance text-lg font-semibold text-foreground">Life Cards</h2>
          <p className="text-xs text-muted-foreground">Areas of growth you orbit around</p>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="mr-6 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
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

        {mergedCards.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm text-muted-foreground">No Life Cards yet.</p>
            <p className="text-xs text-muted-foreground">
              Create your first card to begin shaping your aura.
            </p>
          </div>
        )}

        {mergedCards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            highlighted={card.id === selectedCardId}
            onDelete={() => handleDelete(card.id)}
            onToggleTask={(taskId) => {
              const task = (card.tasks ?? []).find((t) => t.id === taskId)
              toggleTask(card.id, taskId, !task?.is_done)
            }}
            onDeleteTask={(taskId) => deleteTask(card.id, taskId)}
            onReorderTasks={(orderedIds) => reorderTasks?.(card.id, orderedIds)}
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
  onReorderTasks,
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
  onReorderTasks: (orderedIds: string[]) => void
  taskInput: string
  onTaskInput: (v: string) => void
  onAddTask: () => void
  onFocus: () => void
}) {
  const color = CATEGORY_COLORS[card.category] ?? "#8a99b3"

  // ترتيب محلي للتاسكات (بيبقى متزامن مع الداتا الجاية من فوق، بس بيسمح بالسحب والإفلات فورياً)
  const [orderedTasks, setOrderedTasks] = useState<LifeTask[]>(card.tasks ?? [])
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // نتابع مين كانت أول تاسك، عشان نشغّل الأنيميشن بس لما وحدة جديدة توصل للصدارة
  const prevFirstId = useRef<string | null>(null)
  const [justPromotedId, setJustPromotedId] = useState<string | null>(null)

  useEffect(() => {
    const incoming = card.tasks ?? []
    setOrderedTasks((current) => {
      // نحافظ على ترتيب المستخدم الحالي، ونضيف أي تاسك جديدة بالآخر، ونشيل المحذوفة
      const incomingIds = new Set(incoming.map((t) => t.id))
      const kept = current.filter((t) => incomingIds.has(t.id)).map((t) => incoming.find((i) => i.id === t.id)!)
      const keptIds = new Set(kept.map((t) => t.id))
      const added = incoming.filter((t) => !keptIds.has(t.id))
      return [...kept, ...added]
    })
  }, [card.tasks])

  useEffect(() => {
    const newFirstId = orderedTasks[0]?.id ?? null
    if (newFirstId && newFirstId !== prevFirstId.current) {
      setJustPromotedId(newFirstId)
      const t = setTimeout(() => setJustPromotedId(null), 600)
      prevFirstId.current = newFirstId
      return () => clearTimeout(t)
    }
    prevFirstId.current = newFirstId
  }, [orderedTasks])

  function commitReorder(next: LifeTask[]) {
    setOrderedTasks(next)
    onReorderTasks(next.map((t) => t.id))
  }

  function moveTask(taskId: string, direction: "up" | "down") {
    const current = [...orderedTasks]
    const index = current.findIndex((t) => t.id === taskId)
    if (index === -1) return
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= current.length) return
    const [moved] = current.splice(index, 1)
    current.splice(targetIndex, 0, moved)
    commitReorder(current)
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }
    const current = [...orderedTasks]
    const fromIndex = current.findIndex((t) => t.id === draggedId)
    const toIndex = current.findIndex((t) => t.id === targetId)
    if (fromIndex === -1 || toIndex === -1) return
    const [moved] = current.splice(fromIndex, 1)
    current.splice(toIndex, 0, moved)
    commitReorder(current)
    setDraggedId(null)
    setDragOverId(null)
  }

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
            <span className="font-mono-label text-[10px]" style={{ color }}>
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
            style={{
              width: `${card.progress}%`,
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
        </div>
        <span className="font-mono-label text-xs tabular-nums text-foreground">
          {card.progress}%
        </span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {orderedTasks.map((task, index) => {
          const isFirst = index === 0
          const isDragging = draggedId === task.id
          const isDragOver = dragOverId === task.id && draggedId !== task.id

          return (
            <li
              key={task.id}
              draggable
              onDragStart={() => setDraggedId(task.id)}
              onDragOver={(e) => {
                e.preventDefault()
                if (dragOverId !== task.id) setDragOverId(task.id)
              }}
              onDragLeave={() => setDragOverId((cur) => (cur === task.id ? null : cur))}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(task.id)
              }}
              onDragEnd={() => {
                setDraggedId(null)
                setDragOverId(null)
              }}
              className={`group flex items-center gap-2 rounded-lg px-1.5 py-1 transition ${
                isDragging ? "opacity-40" : ""
              } ${isDragOver ? "bg-secondary/60" : ""}`}
              style={
                isFirst && !task.is_done
                  ? ({ "--glow-color": `${color}` } as React.CSSProperties)
                  : undefined
              }
            >
              <span
                className="shrink-0 cursor-grab text-muted-foreground/50 opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
                aria-hidden
              >
                <GripVertical className="h-3.5 w-3.5" />
              </span>

              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                className="shrink-0 text-muted-foreground transition hover:text-foreground"
                aria-label={task.is_done ? "Mark incomplete" : "Mark complete"}
              >
                {task.is_done ? (
                  <CheckCircle2 className="h-4 w-4" style={{ color }} />
                ) : isFirst ? (
                  <Rocket className="h-4 w-4" style={{ color }} />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </button>

              <span
                className={`flex-1 flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm transition ${
                  task.is_done
                    ? "text-muted-foreground line-through"
                    : isFirst
                      ? `font-semibold text-foreground ${justPromotedId === task.id ? "task-first-pop" : ""}`
                      : "text-foreground"
                }`}
                style={
                  isFirst && !task.is_done
                    ? { border: `1px solid ${color}55`, backgroundColor: `${color}14` }
                    : undefined
                }
              >
                {task.text}
                {isFirst && !task.is_done && (
                  <span
                    className="font-mono-label shrink-0 rounded-full px-1.5 py-0.5 text-[9px]"
                    style={{ color, backgroundColor: `${color}22` }}
                  >
                    ابدأ من هون
                  </span>
                )}
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
          )
        })}
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