
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
  const alarmsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const [notifStatus, setNotifStatus] = useState<"default" | "granted" | "denied" | "unsupported">("default")

  // نحدد الحالة بعد ما الصفحة تفتح (client-side فقط)
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifStatus("unsupported")
    } else {
      setNotifStatus(Notification.permission as "default" | "granted" | "denied")
    }
  }, [])

  useEffect(() => {
    return () => {
      alarmsRef.current.forEach(clearTimeout)
      alarmsRef.current.clear()
    }
  }, [])

  async function requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("Your browser does not support notifications. Reminders won't fire, but your reflection will still be saved.")
      return false
    }
    if (Notification.permission === "granted") return true
    const permission = await Notification.requestPermission()
    setNotifStatus(permission as "default" | "granted" | "denied")
    return permission === "granted"
  }

  function scheduleAlarm(id: string, isoTime: string, text: string) {
    if (alarmsRef.current.has(id)) {
      clearTimeout(alarmsRef.current.get(id)!)
      alarmsRef.current.delete(id)
    }
    const delay = new Date(isoTime).getTime() - Date.now()
    if (delay <= 0) {
      alert("Please choose a future time!")
      return
    }
    const timeoutId = setTimeout(() => {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Reminder from Aura ✨", {
          body: text.length > 100 ? text.substring(0, 100) + "..." : text,
          tag: id,
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

    if (reminderTime) {
      const granted = await requestPermission()
      if (granted) {
        finalReminderTime = new Date(reminderTime).toISOString()
        const tempId = `temp-${Date.now()}`
        scheduleAlarm(tempId, finalReminderTime, content.trim())
      } else {
        // حتى لو ما في إشعارات، نحفظ الريفلكشن بدون reminder
        finalReminderTime = null
      }
    }

    await addReflection(content.trim(), finalReminderTime)
    setContent("")
    setReminderTime("")
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border/60 px-5 py-4">

        {/* زر الإشعارات — دايماً يظهر */}
        <button
          type="button"
          onClick={async () => {
            if (typeof window === "undefined" || !("Notification" in window)) {
              alert("Your browser does not support notifications. This feature is not available on your device.")
              return
            }
            const permission = await Notification.requestPermission()
            setNotifStatus(permission as "default" | "granted" | "denied")
            if (permission === "denied") {
              alert("Notifications are blocked. Please enable them manually from your browser settings.")
            }
          }}
          className={`mb-3 rounded-lg px-3 py-2 text-white text-sm transition ${
            notifStatus === "granted"
              ? "bg-green-600"
              : notifStatus === "denied"
              ? "bg-red-600"
              : notifStatus === "unsupported"
              ? "bg-gray-600"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {notifStatus === "granted"
            ? "✅ Notifications ON"
            : notifStatus === "denied"
            ? "🚫 Notifications BLOCKED"
            : notifStatus === "unsupported"
            ? "⚠️ Notifications Not Supported"
            : "🔔 Enable Notifications"}
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

          {/* حقل المنبه — دايماً يظهر */}
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
          const alarmTime = (r as any).reminder_time
          const isFutureAlarm = alarmTime && new Date(alarmTime).getTime() > Date.now()

          return (
            <article key={r.id} className="glass group rounded-xl p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <time className="font-mono-label text-[10px] text-muted-foreground">
                    {formatDate(r.created_at)}
                  </time>
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
