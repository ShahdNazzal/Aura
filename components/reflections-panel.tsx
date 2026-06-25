"use client"

import { useState, useEffect, useRef } from "react"
import { Trash2, Sparkles, Bell, Clock } from "lucide-react"
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

// دالة لتحويل التاريخ إلى صيغة datetime-local (لتوقيت الجهاز المحلي)
function toLocalDatetimeString(date: Date) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export function ReflectionsPanel({ data }: { data: Data }) {
  const { reflections, addReflection, deleteReflection } = data
  const [content, setContent] = useState("")
  const [reminderTime, setReminderTime] = useState("")
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  
  // لحفظ مؤقتات المنبهات
  const alarmsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // تنظيف المؤقتات عند إزالة المكون
  useEffect(() => {
    return () => {
      alarmsRef.current.forEach(clearTimeout)
      alarmsRef.current.clear()
    }
  }, [])

  // دالة طلب الصلاحية
  async function requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      alert("متصفحك لا يدعم الإشعارات.")
      return false
    }
    if (Notification.permission === "granted") return true
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  // دالة جدولة المنبه
  function scheduleAlarm(id: string, isoTime: string, text: string) {
    if (alarmsRef.current.has(id)) {
      clearTimeout(alarmsRef.current.get(id)!)
      alarmsRef.current.delete(id)
    }

    const now = Date.now()
    const alarmTime = new Date(isoTime).getTime()
    const delay = alarmTime - now

    if (delay <= 0) {
      alert("الرجاء اختيار وقت في المستقبل!")
      return
    }

    const timeoutId = setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("تذكير من Aura ✨", {
          body: text.length > 100 ? text.substring(0, 100) + "..." : text,
          tag: id
        })
      }
      alarmsRef.current.delete(id)
    }, delay)

    alarmsRef.current.set(id, timeoutId)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    let finalReminderTime: string | null = null

    // إذا اختار المستخدم وقتاً للمنبه
    if (reminderTime) {
      
      
      const hasPermission = await requestPermission()



      if (!hasPermission) {
        alert("لا يمكننا ضبط المنبه بدون السماح بالإشعارات!")
        return
      }
      finalReminderTime = new Date(reminderTime).toISOString()
    }

    // إنشاء ID مؤقت
    const tempId = `temp-${Date.now()}`

    // تفعيل المنبه فوراً في الواجهة
    if (finalReminderTime) {
      scheduleAlarm(tempId, finalReminderTime, content.trim())
    }

    // ✅ إرسال النص كـ String عادي + وقت التنبيه كـ String عادي
    await addReflection(content.trim(), finalReminderTime) 

    // إعادة تعيين الحقول
    setContent("")
    setReminderTime("")
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border/60 px-5 py-4">







<button
  type="button"
  onClick={requestPermission}
  className="mb-3 rounded-lg bg-black px-3 py-2 text-white text-sm"
>
  Enable Notifications
</button>




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
          
          {/* حقل إضافة المنبه */}
          <div className="mt-3 flex items-center gap-3">
            <div className="relative flex-1">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="datetime-local"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                min={toLocalDatetimeString(new Date())}
                className="w-full rounded-lg border border-border bg-input py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            {reminderTime && (
              <div className="flex items-center gap-1 text-accent">
                <Bell className="h-4 w-4 animate-pulse" />
                <span className="text-[10px] font-medium">Alarm ON</span>
              </div>
            )}
          </div>

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

        {reflections.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No reflections yet.</p>
            <p className="text-xs text-muted-foreground">Your written thoughts will appear here.</p>
          </div>
        )}

        {reflections.map((r) => {
          // ✨ استدعاء العمود من الداتابيز والتحقق منه
          const alarmTime = (r as any).reminder_time
          // التحقق مما إذا كان المنبه لا يزال في المستقبل
          const isFutureAlarm = alarmTime && new Date(alarmTime).getTime() > Date.now()

          return (
            <article key={r.id} className="glass group rounded-xl p-4">
              <div className="mb-1.5 flex items-center justify-between">
                {/* تعديل العرض ليتسع للوقتين */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* وقت إنشاء الملاحظة */}
                  <time className="font-mono-label text-[10px] text-muted-foreground">
                    {formatDate(r.created_at)}
                  </time>
                  
                  {/* ✨ عرض وقت التنبيه إذا كان موجود ومستقبلي */}
                  {isFutureAlarm && (
                    <div className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                      <Bell className="h-2.5 w-2.5" />
                      <span>{formatDate(alarmTime)}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (alarmsRef.current.has(r.id)) {
                      clearTimeout(alarmsRef.current.get(r.id)!)
                      alarmsRef.current.delete(r.id)
                    }
                    deleteReflection(r.id)
                  }}
                  aria-label="Delete reflection"
                  className="rounded-md p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
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
