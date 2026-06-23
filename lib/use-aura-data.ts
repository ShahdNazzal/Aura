"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
  type AvatarConfig,
  type CardCategory,
  type LifeCard,
  type Reflection,
  type Task,
  DEFAULT_AVATAR,
} from "@/lib/types"

function computeProgress(tasks: Task[]) {
  if (tasks.length === 0) return 0
  const done = tasks.filter((t) => t.is_done).length
  return Math.round((done / tasks.length) * 100)
}

function statusFromProgress(progress: number): LifeCard["status"] {
  if (progress >= 100) return "completed"
  if (progress > 0) return "improving"
  return "active"
}

export function useAuraData(userId: string) {
  const supabase = createClient()
  const [cards, setCards] = useState<LifeCard[]>([])
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const [cardsRes, tasksRes, reflRes, avatarRes] = await Promise.all([
        supabase.from("cards").select("*").eq("user_id", userId).order("created_at"),
        supabase.from("tasks").select("*"),
        supabase.from("reflections").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("avatar_state").select("*").eq("user_id", userId).maybeSingle(),
      ])
      if (!active) return

      const tasksByCard = new Map<string, Task[]>()
      for (const t of (tasksRes.data ?? []) as Task[]) {
        const arr = tasksByCard.get(t.card_id) ?? []
        arr.push(t)
        tasksByCard.set(t.card_id, arr)
      }

      const loadedCards: LifeCard[] = ((cardsRes.data ?? []) as LifeCard[]).map((c) => ({
        ...c,
        tasks: tasksByCard.get(c.id) ?? [],
      }))

      setCards(loadedCards)
      setReflections((reflRes.data ?? []) as Reflection[])
      if (avatarRes.data?.avatar_config && Object.keys(avatarRes.data.avatar_config).length > 0) {
        setAvatar({ ...DEFAULT_AVATAR, ...(avatarRes.data.avatar_config as AvatarConfig) })
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [supabase, userId])

  /* ---------------- Cards ---------------- */
  const createCard = useCallback(
    async (title: string, category: CardCategory, description: string) => {
      const { data, error } = await supabase
        .from("cards")
        .insert({ user_id: userId, title, category, description, progress: 0, status: "active" })
        .select()
        .single()
      if (error || !data) {
        toast.error("Could not create card")
        return
      }
      setCards((prev) => [...prev, { ...(data as LifeCard), tasks: [] }])
      toast.success("Life Card created")
    },
    [supabase, userId],
  )

  const deleteCard = useCallback(
    async (cardId: string) => {
      setCards((prev) => prev.filter((c) => c.id !== cardId))
      const { error } = await supabase.from("cards").delete().eq("id", cardId)
      if (error) toast.error("Could not delete card")
      else toast.success("Card removed")
    },
    [supabase],
  )

  const syncCardProgress = useCallback(
    async (cardId: string, tasks: Task[]) => {
      const progress = computeProgress(tasks)
      const status = statusFromProgress(progress)
      await supabase.from("cards").update({ progress, status }).eq("id", cardId)
    },
    [supabase],
  )

  /* ---------------- Tasks ---------------- */
  const addTask = useCallback(
    async (cardId: string, text: string) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ card_id: cardId, text, is_done: false })
        .select()
        .single()
      if (error || !data) {
        toast.error("Could not add task")
        return
      }
      setCards((prev) =>
        prev.map((c) => {
          if (c.id !== cardId) return c
          const tasks = [...c.tasks, data as Task]
          const progress = computeProgress(tasks)
          return { ...c, tasks, progress, status: statusFromProgress(progress) }
        }),
      )
      const card = cards.find((c) => c.id === cardId)
      if (card) syncCardProgress(cardId, [...card.tasks, data as Task])
    },
    [supabase, cards, syncCardProgress],
  )

  const toggleTask = useCallback(
    async (cardId: string, taskId: string, isDone: boolean) => {
      let nextTasks: Task[] = []
      setCards((prev) =>
        prev.map((c) => {
          if (c.id !== cardId) return c
          const tasks = c.tasks.map((t) =>
            t.id === taskId ? { ...t, is_done: isDone } : t,
          )
          nextTasks = tasks
          const progress = computeProgress(tasks)
          return { ...c, tasks, progress, status: statusFromProgress(progress) }
        }),
      )
      const { error } = await supabase.from("tasks").update({ is_done: isDone }).eq("id", taskId)
      if (error) {
        toast.error("Could not toggle task")
        return
      }
      syncCardProgress(cardId, nextTasks)
    },
    [supabase, syncCardProgress],
  )

  const savePendingToggles = useCallback(
    async (cardId: string, toggles: Record<string, boolean>) => {
      for (const [taskId, isDone] of Object.entries(toggles)) {
        await toggleTask(cardId, taskId, isDone)
      }
    },
    [toggleTask],
  )

  const deleteTask = useCallback(
    async (cardId: string, taskId: string) => {
      let nextTasks: Task[] = []
      setCards((prev) =>
        prev.map((c) => {
          if (c.id !== cardId) return c
          const tasks = c.tasks.filter((t) => t.id !== taskId)
          nextTasks = tasks
          const progress = computeProgress(tasks)
          return { ...c, tasks, progress, status: statusFromProgress(progress) }
        }),
      )
      await supabase.from("tasks").delete().eq("id", taskId)
      syncCardProgress(cardId, nextTasks)
    },
    [supabase, syncCardProgress],
  )

  /* ---------------- Reflections ---------------- */
  const addReflection = useCallback(
    async (content: string) => {
      const { data, error } = await supabase
        .from("reflections")
        .insert({ user_id: userId, content })
        .select()
        .single()
      if (error || !data) {
        toast.error("Could not save reflection")
        return
      }
      setReflections((prev) => [data as Reflection, ...prev])
      toast.success("Reflection saved")
    },
    [supabase, userId],
  )

  const deleteReflection = useCallback(
    async (id: string) => {
      setReflections((prev) => prev.filter((r) => r.id !== id))
      await supabase.from("reflections").delete().eq("id", id)
      toast.success("Reflection deleted")
    },
    [supabase],
  )

  /* ---------------- Avatar ---------------- */
  const saveAvatar = useCallback(
    async (config: AvatarConfig) => {
      setAvatar(config)
      const { error } = await supabase.from("avatar_state").upsert(
        {
          user_id: userId,
          mood: config.mood,
          energy_level: config.energyLevel,
          style: config.outfit,
          avatar_config: config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      if (error) toast.error("Could not save avatar")
      else toast.success("Avatar saved")
    },
    [supabase, userId],
  )

  const overallProgress =
    cards.length === 0
      ? 0
      : Math.round(cards.reduce((sum, c) => sum + c.progress, 0) / cards.length)

  return {
    cards,
    reflections,
    avatar,
    setAvatar,
    loading,
    overallProgress,
    createCard,
    deleteCard,
    addTask,
    toggleTask,
    deleteTask,
    savePendingToggles,
    addReflection,
    deleteReflection,
    saveAvatar,
  }
}