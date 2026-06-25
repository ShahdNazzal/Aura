"use client"

import { useState } from "react"
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

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <h2 className="text-balance text-lg font-semibold text-foreground">Avatar Studio</h2>
          <p className="text-xs text-muted-foreground">Shape the being that mirrors your growth</p>
        </div>
        <button
          type="button"
          onClick={() => saveAvatar(draft)}
          className="mr-6 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Save
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div
          className="mx-auto mb-4 w-full max-w-52 relative cursor-ns-resize"
          onWheel={handleWheel}
          style={{ touchAction: "none" }}
        >
          <div className="glass rounded-2xl p-2 overflow-hidden">
            <AvatarSVG config={draft} progress={overallProgress} showAura className="w-full" />
          </div>
          <span className="absolute bottom-3 right-3 text-[10px] text-muted-foreground bg-background/50 px-2 py-1 rounded-full pointer-events-none">
            Scroll to Scale Build
          </span>
        </div>

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
      </div>
    </div>
  )
}

/* ───────────────────── sub-components ───────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-mono-label mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
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
      className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
          : "border border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
      }`}
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
          className="h-7 w-7 rounded-full transition"
          style={{
            backgroundColor: c,
            outline: value === c ? "2px solid var(--ring)" : "1px solid rgba(255,255,255,0.12)",
            outlineOffset: 2,
            transform: value === c ? "scale(1.12)" : "scale(1)",
          }}
        />
      ))}
    </div>
  )
}