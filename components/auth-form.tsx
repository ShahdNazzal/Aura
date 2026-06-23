"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { AvatarSVG } from "@/components/avatar-svg"
import { DEFAULT_AVATAR } from "@/lib/types"

type Mode = "signin" | "signup"

export function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }
    setLoading(true)
    const supabase = createClient()

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
              `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        toast.success("Account created. Check your email to confirm, then sign in.")
        setMode("signin")
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success("Welcome back to AURA")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up relative z-10 w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-2 h-40 w-40 animate-float">
          <AvatarSVG config={DEFAULT_AVATAR} progress={60} showAura />
        </div>
        <h1 className="font-mono-label text-sm tracking-[0.4em] text-primary glow-text">◈ AURA</h1>
        <p className="mt-3 text-balance font-heading text-2xl font-semibold text-foreground">
          Evolve your self, one goal at a time
        </p>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          Track your growth through Life Cards and watch your avatar transform.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 shadow-2xl">
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-secondary/60 p-1">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg py-2 text-sm font-medium transition-all ${
                mode === m
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-mono-label text-xs text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@cosmos.io"
              className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-mono-label text-xs text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "..." : mode === "signin" ? "Enter AURA" : "Begin Your Journey"}
          </button>
        </form>
      </div>
    </div>
  )
}
