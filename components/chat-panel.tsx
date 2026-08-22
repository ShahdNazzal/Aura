"use client"

// C:\Users\lenovo\Downloads\build-aura-gamified-platform\components\chat-panel.tsx

import { useState, useRef, useEffect } from "react"

export function ChatPanel({
  userId,
  onNewCard,
}: {
  userId: string
  onNewCard?: (card: any) => void
}) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const STORAGE_KEY = `aura-chat-${userId}`

  const suggestions = [
    "Send me a plan that suits my lifestyle",
    "Give me a gym workout schedule based on my goals",
    "Give me positive words for today",
  ]

  // ─── تحميل المحادثة المحفوظة عند الفتح ───────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setMessages(parsed)
      }
    } catch {
      // localStorage فاضي أو خطأ
    }
  }, [userId])

  // ─── حفظ المحادثة عند كل تغيير ───────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // ignore storage errors
    }
  }, [messages, userId])

  // ─── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])





useEffect(() => {
  if (!textareaRef.current) return

  textareaRef.current.style.height = "0px"
  textareaRef.current.style.height =
    textareaRef.current.scrollHeight + "px"
}, [input])

  // ─── Voice recognition ────────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      sendMessage(text)
    }
    recognition.onend = () => setIsRecording(false)
    recognitionRef.current = recognition
  }, [])

  // ─── Send message ─────────────────────────────────────────────────────────
  async function sendMessage(text?: string) {
    const userText = text ?? input
    if (!userText.trim() || loading) return

    setInput("")
    setLoading(true)

    const historySnapshot = [...messages]

    setMessages((prev) => [...prev, { role: "user", text: userText }])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userText,
          userId,
          history: historySnapshot,
        }),
      })

      const data = await res.json()

      setMessages((prev) => [...prev, { role: "bot", text: data.reply }])

      if (data.newCard && onNewCard) {
        onNewCard(data.newCard)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error 😢" },
      ])
    }

    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function clearChat() {
    setMessages([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0f1a] text-white font-sans">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-semibold">
          A
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">AURA</p>
          <p className="text-xs text-white/40">Self-growth companion</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
  <span className="mr-6 flex items-center gap-1.5 text-xs text-emerald-400">
    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
    Online
  </span>
  {messages.length > 0 && (
    <button
      onClick={clearChat}
      className="mr-6 text-[10px] text-white/30 hover:text-red-400 transition-colors px-2 py-1 rounded border border-white/10 hover:border-red-400/40"
    >
      Clear
    </button>
  )}
</div>
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-center px-6">
            <span className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xl" aria-hidden="true">
              ✦
            </span>
            <p className="text-xs text-white/30 leading-relaxed max-w-xs">
              Ask about goals, habits, mindset, or anything that helps you grow.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "bot" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mb-0.5">
                A
              </div>
            )}
            <div
              className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[78%] whitespace-pre-line ${
                m.role === "user"
                  ? "bg-violet-600 text-white rounded-br-sm"
                  : "bg-white/8 text-white/90 border border-white/10 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              A
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/8 border border-white/10 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Pinned suggestions ── */}
      <div className="px-4 pt-2 flex-shrink-0 space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest text-white/25 px-1">Quick prompts</p>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => sendMessage(s)}
            disabled={loading}
            className="block w-full text-left text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl px-3 py-2 transition-colors disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Input ── */}
      <div className="px-4 pb-4 pt-3 border-t border-white/8 flex-shrink-0">
        <div className="flex items-end gap-2 bg-white/6 border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-violet-500/50 transition-colors">
          <textarea
  ref={textareaRef}
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={handleKeyDown}
  rows={1}
  placeholder="What are you working on today?"
  disabled={loading}
  className="flex-1 resize-none overflow-hidden bg-transparent text-sm text-white placeholder:text-white/30 outline-none leading-6 max-h-40"
/>
          <button
            onClick={() => {
              if (!recognitionRef.current) return
              if (!isRecording) {
                recognitionRef.current.start()
                setIsRecording(true)
              } else {
                recognitionRef.current.stop()
                setIsRecording(false)
              }
            }}
            className={`text-base transition-colors ${
              isRecording ? "text-red-400 animate-pulse" : "text-white/30 hover:text-white/70"
            }`}
            aria-label="Voice input"
          >
            🎤
          </button>
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-white/20 mt-2">Press Enter to send</p>
      </div>
    </div>
  )
}
