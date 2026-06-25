export type CardCategory = "mind" | "body" | "soul" | "habits" | "lifestyle" | "custom"
export type CardStatus = "active" | "improving" | "completed"
export type Gender = "male" | "female"

export interface Task {
  id: string
  card_id: string
  text: string
  is_done: boolean
}

export interface LifeCard {
  id: string
  user_id: string
  title: string
  category: CardCategory
  description: string
  progress: number
  status: CardStatus
  created_at: string
  tasks: Task[]
}

export interface Reflection {
  id: string
  user_id: string
  content: string
  created_at: string
}

export type FaceShape = "round" | "oval" | "square" | "sharp"
export type EyeShape = "round" | "sharp" | "soft"
export type HairStyle = "short" | "long" | "curly" | "fade" | "bun" | "futuristic" | "none"
export type BodyType = "slim" | "athletic" | "muscular" | "heavy"
export type OutfitStyle = "casual" | "sporty" | "formal" | "futuristic" | "minimalist"
export type Mood = "energized" | "flowing" | "focused" | "reflective" | "inspired" | "calm"

export interface AvatarConfig {
  gender: Gender
  buildScale: number
  faceShape: FaceShape
  skinTone: string
  eyeShape: EyeShape
  eyeColor: string
  hairStyle: HairStyle
  hairColor: string
  bodyType: BodyType
  outfit: OutfitStyle
  accessories: {
    glasses: boolean
    headset: boolean
    necklace: boolean
    wristTech: boolean
  }
  mood: Mood
  energyLevel: number
}

export interface AvatarState {
  id?: string
  user_id: string
  mood: string
  energy_level: number
  style: string
  avatar_config: AvatarConfig
  updated_at?: string
}

export const SKIN_TONES = [
  "#FDDBB4",
  "#F1C27D",
  "#E0AC69",
  "#C68642",
  "#A5683B",
  "#8D5524",
  "#6B4226",
  "#4E2B17",
  "#3D1A08",
]

export const EYE_COLORS = [
  "#4f8fff",
  "#06d6c7",
  "#3fbf6f",
  "#f472b6",
  "#f5c842",
  "#a78bfa",
  "#8a99b3",
  "#7a4a2a",
]

export const HAIR_COLORS = [
  "#2b2620",
  "#4a3526",
  "#6b4a2f",
  "#a06a3a",
  "#c9a14a",
  "#d9d9e0",
  "#8a99b3",
  "#a78bfa",
  "#e0506a",
  "#06d6c7",
]

export const CATEGORY_COLORS: Record<CardCategory, string> = {
  mind: "#4f8fff",
  body: "#06d6c7",
  soul: "#a78bfa",
  habits: "#f5c842",
  lifestyle: "#f472b6",
  custom: "#8a99b3",
}

export const MOODS: { id: Mood; label: string; symbol: string }[] = [
  { id: "energized", label: "Energized", symbol: "⚡" },
  { id: "flowing", label: "Flowing", symbol: "🌊" },
  { id: "focused", label: "Focused", symbol: "🔥" },
  { id: "reflective", label: "Reflective", symbol: "🌙" },
  { id: "inspired", label: "Inspired", symbol: "✦" },
  { id: "calm", label: "Calm", symbol: "🌿" },
]

export const DEFAULT_AVATAR: AvatarConfig = {
  gender: "male",
  buildScale: 50,
  faceShape: "oval",
  skinTone: "#E0AC69",
  eyeShape: "round",
  eyeColor: "#4f8fff",
  hairStyle: "short",
  hairColor: "#2b2620",
  bodyType: "athletic",
  outfit: "futuristic",
  accessories: {
    glasses: false,
    headset: false,
    necklace: false,
    wristTech: true,
  },
  mood: "focused",
  energyLevel: 70,
}