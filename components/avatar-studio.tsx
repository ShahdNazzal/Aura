"use client"

import { useState } from "react"
import { Save, RotateCcw, Sparkles } from "lucide-react"
import { AvatarSVG } from "@/components/avatar-svg"
import {
  EYE_COLORS,
  HAIR_COLORS,
  MOODS,
  SKIN_TONES,
  type AvatarConfig,
  type BodyType,
  type EyeShape,
  type FaceShape,
  type Gender,
  type HairStyle,
  type Mood,
  type OutfitStyle,
} from "@/lib/types"
import type { useAuraData } from "@/lib/use-aura-data"

type Data = ReturnType<typeof useAuraData>

const GENDERS: Gender[] = ["male", "female"]
const FACE_SHAPES: FaceShape[] = ["round", "oval", "square", "sharp"]
const EYE_SHAPES: EyeShape[] = ["round", "sharp", "soft"]
const HAIR_STYLES: HairStyle[] = ["short", "long", "curly", "fade", "bun", "futuristic", "none"]
const BODY_TYPES: BodyType[] = ["slim", "athletic", "muscular", "heavy"]
const OUTFITS: OutfitStyle[] = ["casual", "sporty", "formal", "futuristic", "minimalist"]

export function AvatarStudio({ data }: { data: Data }) {
  const { avatar, setAvatar, saveAvatar, overallProgress } = data
  const [draft, setDraft] = useState<AvatarConfig>(avatar)

  function update<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) {
    const next = { ...draft, [key]: value }
    setDraft(next)
    setAvatar(next)
  }

  function toggleAccessory(key: keyof AvatarConfig["accessories"]) {
    const next = {
      ...draft,
      accessories: { ...draft.accessories, [key]: !draft.accessories[key] },
    }
    setDraft(next)
    setAvatar(next)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -3 : 3
    const nextBuild = Math.max(0, Math.min(100, draft.buildScale + delta))
    update("buildScale", nextBuild)
  }

  function handleReset() {
    const reset: AvatarConfig = {
      gender: "male",
      faceShape: "oval",
      skinTone: SKIN_TONES[2],
      eyeShape: "round",
      eyeColor: EYE_COLORS[0],
      hairStyle: "short",
      hairColor: HAIR_COLORS[0],
      bodyType: "athletic",
      outfit: "casual",
      mood: "calm",
      energyLevel: 50,
      buildScale: 50,
      accessories: { glasses: false, headset: false, necklace: false, wristTech: false },
    }
    setDraft(reset)
    setAvatar(reset)
  }

  return (
    <div className="flex h-full flex-col bg-[#0a0a0f]">
      {/* ── Header ── */}
      <header className="relative px-6 pt-6 pb-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
              Customize
            </p>
            <h2 className="mt-1 text-xl font-light tracking-tight text-white/90">
              Avatar Studio
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/40 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.05] hover:text-white/60 active:scale-[0.97]"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => saveAvatar(draft)}
              className="flex items-center gap-1.5 rounded-lg bg-white/[0.1] px-3 py-1.5 text-[11px] font-medium text-white/80 transition-all duration-200 hover:bg-white/[0.15] hover:text-white/95 active:scale-[0.97]"
            >
              <Save className="h-2.5 w-2.5" />
              Save
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* ── Avatar Preview ── */}
        <div className="mb-6">
          <div
            className="mx-auto w-full max-w-48 cursor-ns-resize"
            onWheel={handleWheel}
            style={{ touchAction: "none" }}
          >
            <div
              className="relative overflow-hidden rounded-2xl border transition-all duration-500"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.02)",
                boxShadow: "0 0 60px -20px rgba(255,255,255,0.03)",
              }}
            >
              <AvatarSVG config={draft} progress={overallProgress} showAura className="w-full" />
              <div className="absolute bottom-0 inset-x-0 flex items-center justify-center py-2 bg-gradient-to-t from-black/40 to-transparent">
                <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                  <Sparkles className="h-2 w-2 text-white/30" />
                  <span className="font-mono text-[9px] tabular-nums text-white/40">
                    Build {draft.buildScale}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="space-y-5">
          <Section title="Gender">
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <Chip key={g} active={draft.gender === g} onClick={() => update("gender", g)}>
                  {g}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title={`Build Scale · ${draft.buildScale}%`}>
            <input
              type="range"
              min={0}
              max={100}
              value={draft.buildScale}
              onChange={(e) => update("buildScale", Number(e.target.value))}
              className="aura-range w-full"
            />
          </Section>

          <Section title="Mood">
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <Chip key={m.id} active={draft.mood === m.id} onClick={() => update("mood", m.id as Mood)}>
                  {m.label}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title={`Energy · ${draft.energyLevel}%`}>
            <input
              type="range"
              min={0}
              max={100}
              value={draft.energyLevel}
              onChange={(e) => update("energyLevel", Number(e.target.value))}
              className="aura-range w-full"
            />
          </Section>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-white/[0.04]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/15">
              Appearance
            </span>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>

          <Section title="Face shape">
            <ChipRow options={FACE_SHAPES} value={draft.faceShape} onChange={(v) => update("faceShape", v)} />
          </Section>

          <Section title="Skin tone">
            <Swatches colors={SKIN_TONES} value={draft.skinTone} onChange={(v) => update("skinTone", v)} />
          </Section>

          <Section title="Eyes">
            <ChipRow options={EYE_SHAPES} value={draft.eyeShape} onChange={(v) => update("eyeShape", v)} />
            <div className="mt-2">
              <Swatches colors={EYE_COLORS} value={draft.eyeColor} onChange={(v) => update("eyeColor", v)} />
            </div>
          </Section>

          <Section title="Hair">
            <ChipRow options={HAIR_STYLES} value={draft.hairStyle} onChange={(v) => update("hairStyle", v)} />
            <div className="mt-2">
              <Swatches colors={HAIR_COLORS} value={draft.hairColor} onChange={(v) => update("hairColor", v)} />
            </div>
          </Section>

          <Section title="Body type">
            <ChipRow options={BODY_TYPES} value={draft.bodyType} onChange={(v) => update("bodyType", v)} />
          </Section>

          <Section title="Outfit">
            <ChipRow options={OUTFITS} value={draft.outfit} onChange={(v) => update("outfit", v)} />
          </Section>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-white/[0.04]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/15">
              Extras
            </span>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>

          <Section title="Accessories">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["glasses", "Glasses"],
                  ["headset", "Headset"],
                  ["necklace", "Necklace"],
                  ["wristTech", "Wrist Tech"],
                ] as [keyof AvatarConfig["accessories"], string][]
              ).map(([key, label]) => (
                <Chip key={key} active={draft.accessories[key]} onClick={() => toggleAccessory(key)}>
                  {label}
                </Chip>
              ))}
            </div>
          </Section>
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}

/* ───────────────────── sub-components ───────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mb-2.5">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 active:scale-[0.96]"
      style={{
        color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
        backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent",
        border: active ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.05)",
        boxShadow: active ? "0 0 12px -4px rgba(255,255,255,0.08)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = "rgba(255,255,255,0.55)"
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = "rgba(255,255,255,0.35)"
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"
          e.currentTarget.style.backgroundColor = "transparent"
        }
      }}
    >
      {children}
    </button>
  )
}

function ChipRow<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} active={value === o} onClick={() => onChange(o)}>
          {o}
        </Chip>
      ))}
    </div>
  )
}

function Swatches({ colors, value, onChange }: { colors: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Select color ${c}`}
          className="h-6 w-6 rounded-full transition-all duration-200 active:scale-90"
          style={{
            backgroundColor: c,
            transform: value === c ? "scale(1.15)" : "scale(1)",
            boxShadow: value === c
              ? `0 0 0 2px #0a0a0f, 0 0 0 3.5px rgba(255,255,255,0.25), 0 0 10px -2px ${c}40`
              : `0 0 0 1px rgba(255,255,255,0.08)`,
          }}
        />
      ))}
    </div>
  )
}
