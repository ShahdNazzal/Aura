"use client"

import { useEffect, useState } from "react"

interface Star {
  x: number
  y: number
  size: number
  delay: number
  duration: number
  color: string
}

const COLORS = ["#dde8ff", "#4f8fff", "#a78bfa", "#06d6c7", "#f5c842"]

export function StarField({ count = 90 }: { count?: number }) {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    const generated = Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.2 + 0.6,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    setStars(generated)
  }, [count])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
            animation: `twinkle ${s.duration}s ease-in-out infinite ${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}