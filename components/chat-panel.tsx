"use client"

import { useState } from "react"

export function ChatPanel() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim()) return

    const userText = input

    // إضافة رسالة المستخدم مباشرة
    const userMessage = { role: "user", text: userText }
    setMessages((prev) => [...prev, userMessage])

    setInput("")
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: userText,
        }),
      })

      const data = await res.json()

      const botMessage = {
        role: "bot",
        text: data.reply || "No response",
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Server error 😢" },
      ])
    }

    setLoading(false)
  }

  return (
    <div className="flex h-full flex-col p-4">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-secondary text-foreground"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <p className="text-sm text-muted-foreground">Typing...</p>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-lg border px-3 py-2 bg-background"
          placeholder="Type a message..."
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}