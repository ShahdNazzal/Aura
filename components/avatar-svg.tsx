"use client"

import { useId } from "react"
import type { AvatarConfig, BodyType, FaceShape, Mood } from "@/lib/types"

interface AvatarSVGProps {
  config: AvatarConfig
  progress?: number
  className?: string
  showAura?: boolean
}

/* ───────────────────── helpers ───────────────────── */

function shade(hex: string, amt: number) {
  const c = hex.replace("#", "")
  const n = parseInt(c.length === 3 ? c.split("").map((x) => x + x).join("") : c, 16)
  let r = (n >> 16) + amt
  let g = ((n >> 8) & 0xff) + amt
  let b = (n & 0xff) + amt
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

const BASE_BODY: Record<BodyType, { shoulder: number; torso: number; arm: number; hip: number; leg: number }> = {
  slim: { shoulder: 50, torso: 36, arm: 10, hip: 38, leg: 14 },
  athletic: { shoulder: 62, torso: 44, arm: 14, hip: 42, leg: 17 },
  muscular: { shoulder: 76, torso: 52, arm: 20, hip: 46, leg: 21 },
  heavy: { shoulder: 72, torso: 62, arm: 18, hip: 56, leg: 24 },
}

function faceRadii(shape: FaceShape, male: boolean) {
  switch (shape) {
    case "round": return { rx: 43, ry: 45, jaw: 0.93, chin: 36 }
    case "oval": return { rx: 37, ry: 48, jaw: 0.84, chin: 42 }
    case "square": return { rx: 41, ry: 44, jaw: 0.96, chin: 28 }
    case "sharp": return { rx: 39, ry: 48, jaw: 0.70, chin: 48 }
  }
}

function moodTraits(mood: Mood) {
  switch (mood) {
    case "energized": return { smile: 0.9, spark: 1, browY: -2 }
    case "flowing": return { smile: 0.5, spark: 0.7, browY: 0 }
    case "focused": return { smile: 0.05, spark: 0.85, browY: 2 }
    case "reflective": return { smile: -0.15, spark: 0.5, browY: 1 }
    case "inspired": return { smile: 0.8, spark: 1, browY: -3 }
    case "calm": return { smile: 0.45, spark: 0.55, browY: 0 }
  }
}

function auraPalette(p: number) {
  if (p < 30) return { inner: "#4f8fff", outer: "#1b2c54", intensity: 0.45 }
  if (p < 70) return { inner: "#7aa7ff", outer: "#3b2d6b", intensity: 0.7 }
  return { inner: "#f5c842", outer: "#a78bfa", intensity: 1 }
}

function getOutfitColors(outfit: string, male: boolean) {
  const palettes: Record<string, { m: { main: string; accent: string; shoe: string }; f: { main: string; accent: string; shoe: string } }> = {
    casual: {
      m: { main: "#2c3e50", accent: "#ecf0f1", shoe: "#8B7355" },
      f: { main: "#4A3F6B", accent: "#F5D0E0", shoe: "#C4909F" },
    },
    sporty: {
      m: { main: "#E20613", accent: "#006233", shoe: "#111111" },
      f: { main: "#2D1B4E", accent: "#FF6B9D", shoe: "#C44569" },
    },
    formal: {
      m: { main: "#0f0f1a", accent: "#d4af37", shoe: "#1a1a1a" },
      f: { main: "#1A0A2E", accent: "#E8B4F8", shoe: "#3D2066" },
    },
    futuristic: {
      m: { main: "#0b0c15", accent: "#4f8fff", shoe: "#4f8fff" },
      f: { main: "#0D0B1A", accent: "#A78BFA", shoe: "#C084FC" },
    },
    minimalist: {
      m: { main: "#1e272e", accent: "#d2dae2", shoe: "#485460" },
      f: { main: "#2D2B3D", accent: "#B8B5D0", shoe: "#6C5B7B" },
    },
  }
  const p = palettes[outfit] || palettes.casual
  return male ? p.m : p.f
}

/* ───────────────────── component ───────────────────── */

export function AvatarSVG({ config, progress = 0, className, showAura = false }: AvatarSVGProps) {
  const uid = useId().replace(/:/g, "")
  const {
    gender,
    buildScale,
    faceShape,
    skinTone,
    eyeShape,
    eyeColor,
    hairStyle,
    hairColor,
    bodyType,
    outfit,
    accessories,
    mood,
    energyLevel,
  } = config

  const male = gender === "male"
  const sc = 0.8 + (buildScale / 100) * 0.4
  const bb = BASE_BODY[bodyType]

  /* gender‑aware body proportions */
  const useSw = (bb.shoulder * sc) * (male ? 1 : 0.92)
  const useTw = (bb.torso * sc) * (male ? 1 : 0.88)
  const useAw = (bb.arm * sc) * (male ? 1 : 0.85)
  const useHw = (bb.hip * sc) * (male ? 1 : 1.08)
  const lw = bb.leg * sc

  const face = faceRadii(faceShape, male)
  const mt = moodTraits(mood)
  const aura = auraPalette(progress)
  const energy = energyLevel / 100

  /* ---- layout ---- */
  const cx = 150
  const headCy = 110
  const shoulderY = 185
  const waistY = 298
  const hipY = 312
  const legBottom = 456
  const armWristY = 310
  const legGap = 5

  /* ---- gender-only face tweaks ---- */
  const neckW = male ? 26 : 20
  const browThick = male ? 4 : 2.5
  const lipThick = male ? 2 : 3.5

  /* ---- colours ---- */
  const skinDark = shade(skinTone, -34)
  const skinLight = shade(skinTone, 22)
  const hairDark = shade(hairColor, -28)
  const hairLight = shade(hairColor, 26)
  const lipColor = male ? shade(skinTone, -45) : "#d16677"

  const oc = getOutfitColors(outfit, male)

  /* ---- eyes ---- */
  const eyeY = headCy + 4
  const eyeDx = 17
  const eyeRy = eyeShape === "round" ? 7 : eyeShape === "sharp" ? 5 : 8
  const eyeRx = eyeShape === "round" ? 7 : eyeShape === "sharp" ? 9 : 9

  /* ---- mouth ---- */
  const mouthY = headCy + face.chin - 16
  const mouthCurve = mt.smile * 10
  const mouthPath = `M ${cx - 13} ${mouthY} Q ${cx} ${mouthY + mouthCurve}, ${cx + 13} ${mouthY}`

  /* ---- clothing flags ---- */
  const isSkirt = !male && outfit === "formal"
  const isCropTop = !male && outfit === "sporty"
  const isShorts = !male && outfit === "sporty"
  const shortEndY = hipY + 35


  /* ═══════════════ PATHS ═══════════════ */

  const torsoPath = `
    M ${cx - useSw} ${shoulderY}
    C ${cx - useSw - 4} ${shoulderY + 45}, ${cx - useTw - 4} ${waistY - 35}, ${cx - useTw} ${waistY}
    L ${cx - useHw} ${hipY}
    L ${cx + useHw} ${hipY}
    L ${cx + useTw} ${waistY}
    C ${cx + useTw + 4} ${waistY - 35}, ${cx + useSw + 4} ${shoulderY + 45}, ${cx + useSw} ${shoulderY}
    C ${cx + useSw - 12} ${shoulderY - 14}, ${cx + 20} ${shoulderY - 18}, ${cx} ${shoulderY - 18}
    C ${cx - 20} ${shoulderY - 18}, ${cx - useSw + 12} ${shoulderY - 14}, ${cx - useSw} ${shoulderY}
    Z`

  const leftLegPath = `M ${cx - useHw} ${hipY} L ${cx - legGap} ${hipY} L ${cx - legGap} ${legBottom} Q ${cx - legGap} ${legBottom + 5}, ${cx - legGap - lw} ${legBottom + 5} L ${cx - useHw} ${legBottom} Z`
  const rightLegPath = `M ${cx + legGap} ${hipY} L ${cx + useHw} ${hipY} L ${cx + useHw} ${legBottom} Q ${cx + useHw} ${legBottom + 5}, ${cx + legGap + lw} ${legBottom + 5} L ${cx + legGap} ${legBottom} Z`

  const leftArmPath = `M ${cx - useSw + 4} ${shoulderY - 6} Q ${cx - useSw - useAw - 4} ${shoulderY + 50}, ${cx - useSw - useAw + 4} ${armWristY - 10} Q ${cx - useSw - useAw + 4} ${armWristY + 4}, ${cx - useSw + useAw * 0.6} ${armWristY} Q ${cx - useSw + 8} ${shoulderY + 50}, ${cx - useSw + 14} ${shoulderY} Z`
  const rightArmPath = `M ${cx + useSw - 4} ${shoulderY - 6} Q ${cx + useSw + useAw + 4} ${shoulderY + 50}, ${cx + useSw + useAw - 4} ${armWristY - 10} Q ${cx + useSw + useAw - 4} ${armWristY + 4}, ${cx + useSw - useAw * 0.6} ${armWristY} Q ${cx + useSw - 8} ${shoulderY + 50}, ${cx + useSw - 14} ${shoulderY} Z`

  /* standard pants */
  const leftPantPath = `M ${cx - useHw - 2} ${waistY} L ${cx - legGap} ${waistY} L ${cx - legGap} ${legBottom} Q ${cx - legGap} ${legBottom + 5}, ${cx - legGap - lw} ${legBottom + 5} L ${cx - useHw - 2} ${legBottom} Z`
  const rightPantPath = `M ${cx + legGap} ${waistY} L ${cx + useHw + 2} ${waistY} L ${cx + useHw + 2} ${legBottom} Q ${cx + useHw} ${legBottom + 5}, ${cx + legGap + lw} ${legBottom + 5} L ${cx + legGap} ${legBottom} Z`

  /* female sporty shorts */
  const fShortL = `M ${cx - useHw - 1} ${waistY} L ${cx - legGap - 2} ${waistY} L ${cx - legGap - 2} ${shortEndY} Q ${cx - legGap - 2} ${shortEndY + 3}, ${cx - legGap - lw + 2} ${shortEndY + 3} L ${cx - useHw + 1} ${shortEndY} Z`
  const fShortR = `M ${cx + legGap + 2} ${waistY} L ${cx + useHw + 1} ${waistY} L ${cx + useHw + 1} ${shortEndY} Q ${cx + useHw - 1} ${shortEndY + 3}, ${cx + legGap + lw - 2} ${shortEndY + 3} L ${cx + legGap + 2} ${shortEndY} Z`

  /* female formal skirt */
  const skirtEndY = hipY + 80
  const skirtPath = `M ${cx - useHw - 2} ${waistY - 5} Q ${cx - useHw - 10} ${hipY + 30}, ${cx - useHw - 16} ${skirtEndY} L ${cx + useHw + 16} ${skirtEndY} Q ${cx + useHw + 10} ${hipY + 30}, ${cx + useHw + 2} ${waistY - 5} Z`
  const lowerLeftLeg = `M ${cx - useHw - 8} ${skirtEndY - 2} L ${cx - legGap - 2} ${skirtEndY - 2} L ${cx - legGap - 2} ${legBottom} Q ${cx - legGap - 2} ${legBottom + 5}, ${cx - legGap - lw + 2} ${legBottom + 5} L ${cx - useHw - 8} ${legBottom} Z`
  const lowerRightLeg = `M ${cx + legGap + 2} ${skirtEndY - 2} L ${cx + useHw + 8} ${skirtEndY - 2} L ${cx + useHw + 8} ${legBottom} Q ${cx + useHw - 1} ${legBottom + 5}, ${cx + legGap + lw - 2} ${legBottom + 5} L ${cx + legGap + 2} ${legBottom} Z`

  /* sleeves */
  const sleeveDrop = male
    ? 75
    : (outfit === "sporty" || outfit === "futuristic") ? 40
    : outfit === "casual" ? 58
    : 65

  const leftSleevePath = `M ${cx - useSw + 4} ${shoulderY - 6} Q ${cx - useSw - useAw - 4} ${shoulderY + 50}, ${cx - useSw - useAw + 4} ${shoulderY + sleeveDrop} L ${cx - useSw + useAw * 0.6} ${shoulderY + sleeveDrop - 6} Q ${cx - useSw + 8} ${shoulderY + 50}, ${cx - useSw + 14} ${shoulderY} Z`
  const rightSleevePath = `M ${cx + useSw - 4} ${shoulderY - 6} Q ${cx + useSw + useAw + 4} ${shoulderY + 50}, ${cx + useSw + useAw - 4} ${shoulderY + sleeveDrop} L ${cx + useSw - useAw * 0.6} ${shoulderY + sleeveDrop - 6} Q ${cx + useSw - 8} ${shoulderY + 50}, ${cx + useSw - 14} ${shoulderY} Z`

  /* female sporty crop top */
  const cropTopPath = `
    M ${cx - useSw} ${shoulderY}
    C ${cx - useSw - 4} ${shoulderY + 45}, ${cx - useTw - 4} ${waistY - 65}, ${cx - useTw} ${waistY - 40}
    L ${cx + useTw} ${waistY - 40}
    C ${cx + useTw + 4} ${waistY - 65}, ${cx + useSw + 4} ${shoulderY + 45}, ${cx + useSw} ${shoulderY}
    C ${cx + useSw - 12} ${shoulderY - 14}, ${cx + 20} ${shoulderY - 18}, ${cx} ${shoulderY - 18}
    C ${cx - 20} ${shoulderY - 18}, ${cx - useSw + 12} ${shoulderY - 14}, ${cx - useSw} ${shoulderY}
    Z`

  /* ═══════════════ RENDER ═══════════════ */

  return (
    <svg viewBox="0 0 300 500" className={className} role="img" aria-label="AURA Avatar">
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor={aura.inner} stopOpacity={0.6 * (0.5 + energy / 2)} />
          <stop offset="50%" stopColor={aura.inner} stopOpacity={0.2 * (0.5 + energy / 2)} />
          <stop offset="100%" stopColor={aura.outer} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`skin-${uid}`} cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor={skinLight} />
          <stop offset="70%" stopColor={skinTone} />
          <stop offset="100%" stopColor={skinDark} />
        </radialGradient>
        <linearGradient id={`hair-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hairLight} />
          <stop offset="100%" stopColor={hairDark} />
        </linearGradient>
        <linearGradient id={`outfit-g-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(oc.main, 22)} />
          <stop offset="100%" stopColor={shade(oc.main, -18)} />
        </linearGradient>
        <linearGradient id={`pants-g-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(oc.main, -25)} />
          <stop offset="100%" stopColor={shade(oc.main, -40)} />
        </linearGradient>
        <linearGradient id={`skirt-g-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(oc.main, -10)} />
          <stop offset="100%" stopColor={shade(oc.main, -30)} />
        </linearGradient>
        <radialGradient id={`eye-${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={shade(eyeColor, 60)} />
          <stop offset="60%" stopColor={eyeColor} />
          <stop offset="100%" stopColor={shade(eyeColor, -50)} />
        </radialGradient>
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Brazil jersey texture */}
        <pattern id="jersey_texture_fix" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="6" height="6" fill="#ffff00" />
          <circle cx="3" cy="3" r="1.5" fill="#eac714" opacity="0.4"/>
        </pattern>

        {/* Portugal shoe gradient */}
        <linearGradient id="shoe_accent_g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#006233"/>
          <stop offset="100%" stopColor="#E20613" stopOpacity="0.4"/>
        </linearGradient>
      </defs>

      {/* ═══════ AURA ═══════ */}
      {showAura && (
        <g className="animate-breathe" style={{ transformOrigin: "150px 210px" }}>
          <ellipse cx={cx} cy={210} rx={155} ry={215} fill={`url(#aura-${uid})`} />
        </g>
      )}

      {/* ═══════ BACK HAIR (long only) ═══════ */}
      {hairStyle === "long" && (
        <path
          d={`M ${cx - face.rx - 6} ${headCy - 6}
              C ${cx - face.rx - 22} ${headCy + 35}, ${cx - face.rx - 26} ${headCy + 85}, ${cx - 34} ${headCy + 135}
              Q ${cx - 32} ${headCy + 150}, ${cx - 24} ${headCy + 155}
              C ${cx - 16} ${headCy + 158}, ${cx + 16} ${headCy + 158}, ${cx + 24} ${headCy + 155}
              Q ${cx + 32} ${headCy + 150}, ${cx + 34} ${headCy + 135}
              C ${cx + face.rx + 26} ${headCy + 85}, ${cx + face.rx + 22} ${headCy + 35}, ${cx + face.rx + 6} ${headCy - 6} Z`}
          fill={`url(#hair-${uid})`}
        />
      )}

      {/* ═══════ BODY SKIN ═══════ */}
      <path d={leftLegPath} fill={`url(#skin-${uid})`} />
      <path d={rightLegPath} fill={`url(#skin-${uid})`} />
      <path d={leftArmPath} fill={`url(#skin-${uid})`} />
      <path d={rightArmPath} fill={`url(#skin-${uid})`} />
      <path d={torsoPath} fill={`url(#skin-${uid})`} />

      {/* muscle hints */}
      {bodyType === "muscular" && (
        <g opacity="0.2" stroke={skinDark} strokeWidth="2" fill="none">
          <path d={`M ${cx - 20} ${shoulderY} Q ${cx - 10} ${shoulderY + 16}, ${cx - 4} ${shoulderY + 22}`} />
          <path d={`M ${cx + 20} ${shoulderY} Q ${cx + 10} ${shoulderY + 16}, ${cx + 4} ${shoulderY + 22}`} />
          <line x1={cx} y1={shoulderY + 38} x2={cx} y2={waistY - 16} />
          <line x1={cx - 11} y1={shoulderY + 58} x2={cx + 11} y2={shoulderY + 58} />
          <line x1={cx - 13} y1={shoulderY + 84} x2={cx + 13} y2={shoulderY + 84} />
        </g>
      )}

      {/* neck */}
      <rect
        x={cx - neckW / 2}
        y={headCy + face.chin - 8}
        width={neckW}
        height={shoulderY - headCy - face.chin + 12}
        rx={8}
        fill={skinTone}
      />
      <rect x={cx - neckW / 2} y={headCy + face.chin - 8} width={neckW} height={10} fill={skinDark} opacity="0.25" />

      {/* hands */}
      <ellipse cx={cx - useSw - useAw / 2 + 4} cy={armWristY} rx={useAw * 0.8} ry={useAw * 0.6 + 4} fill={`url(#skin-${uid})`} />
      <ellipse cx={cx + useSw + useAw / 2 - 4} cy={armWristY} rx={useAw * 0.8} ry={useAw * 0.6 + 4} fill={`url(#skin-${uid})`} />

      {/* ═══════ CLOTHING — LOWER BODY ═══════ */}

      {isSkirt ? (
        <>
          <path d={skirtPath} fill={`url(#skirt-g-${uid})`} />
          <path d={lowerLeftLeg} fill={`url(#skin-${uid})`} />
          <path d={lowerRightLeg} fill={`url(#skin-${uid})`} />
        </>
      ) : isShorts ? (
        <>
          <path d={fShortL} fill="#009C3B" stroke="#009C3B" strokeWidth="4" />
          <path d={fShortR} fill="#009C3B" stroke="#009C3B" strokeWidth="4" />
        </>
      ) : (
        <>
          <path d={leftPantPath} fill={`url(#pants-g-${uid})`} />
          <path d={rightPantPath} fill={`url(#pants-g-${uid})`} />
        </>
      )}

      {/* ═══════ SHOES ═══════ */}

      {isSkirt ? (
        <>
          <path d={`M ${cx - useHw - 14} ${legBottom - 2} L ${cx - legGap - lw - 2} ${legBottom - 2} Q ${cx - legGap - lw - 2} ${legBottom + 5}, ${cx - legGap - lw + 4} ${legBottom + 5} L ${cx - useHw} ${legBottom + 5} L ${cx - useHw - 8} ${legBottom + 14} L ${cx - useHw - 14} ${legBottom + 14} Z`} fill={oc.shoe} />
          <path d={`M ${cx + legGap + lw + 2} ${legBottom - 2} L ${cx + useHw + 14} ${legBottom - 2} L ${cx + useHw + 8} ${legBottom + 14} L ${cx + useHw + 2} ${legBottom + 14} L ${cx + useHw} ${legBottom + 5} L ${cx + legGap + lw - 4} ${legBottom + 5} Q ${cx + legGap + lw + 2} ${legBottom + 5}, ${cx + legGap + lw + 2} ${legBottom - 2} Z`} fill={oc.shoe} />
        </>
      ) : !isShorts ? (
        <>
          <path d={`M ${cx - useHw - 2} ${legBottom - 4} L ${cx - legGap - lw - 2} ${legBottom - 4} Q ${cx - legGap - lw - 2} ${legBottom + 7}, ${cx - legGap - lw + 4} ${legBottom + 7} L ${cx - useHw + 4} ${legBottom + 7} Q ${cx - useHw + 4} ${legBottom + 3}, ${cx - useHw - 2} ${legBottom - 4} Z`} fill={oc.shoe} />
          <path d={`M ${cx + legGap + lw + 2} ${legBottom - 4} L ${cx + useHw + 2} ${legBottom - 4} Q ${cx + useHw + 2} ${legBottom + 3}, ${cx + useHw - 4} ${legBottom + 7} L ${cx + legGap + lw - 4} ${legBottom + 7} Q ${cx + legGap + lw + 2} ${legBottom + 7}, ${cx + legGap + lw + 2} ${legBottom - 4} Z`} fill={oc.shoe} />
        </>
      ) : null}

      {/* ═══════ CLOTHING — UPPER BODY ═══════ */}

      <path d={isCropTop ? cropTopPath : torsoPath} fill={`url(#outfit-g-${uid})`} />

      {/* sleeves — skip for crop‑top sporty female */}
      {!isCropTop && (
        <>
          <path d={leftSleevePath} fill={`url(#outfit-g-${uid})`} />
          <path d={rightSleevePath} fill={`url(#outfit-g-${uid})`} />
        </>
      )}

      {/* ═══════ OUTFIT DETAILS ═══════ */}

      {/* ── CASUAL ── */}
      {outfit === "casual" && male && (
        <g>
          <path d={`M ${cx - 12} ${shoulderY - 14} Q ${cx} ${shoulderY - 6}, ${cx + 12} ${shoulderY - 14}`} fill="none" stroke={shade(oc.main, -15)} strokeWidth="2" />
          <path d={`M ${cx - 7} ${shoulderY - 10} L ${cx - 9} ${shoulderY + 28}`} stroke={shade(oc.main, -20)} strokeWidth="2" />
          <path d={`M ${cx + 7} ${shoulderY - 10} L ${cx + 9} ${shoulderY + 28}`} stroke={shade(oc.main, -20)} strokeWidth="2" />
          <circle cx={cx - 9} cy={shoulderY + 28} r="2" fill={oc.accent} />
          <circle cx={cx + 9} cy={shoulderY + 28} r="2" fill={oc.accent} />
        </g>
      )}
      {outfit === "casual" && !male && (
        <g>
          <path d={`M ${cx - 18} ${shoulderY - 16} L ${cx} ${shoulderY + 8} L ${cx + 18} ${shoulderY - 16}`} fill={skinTone} stroke={shade(oc.main, -15)} strokeWidth="1.5" />
          <path d={`M ${cx - useTw * 0.5} ${shoulderY + 10} L ${cx - useTw * 0.5} ${waistY - 10}`} stroke={shade(oc.main, -12)} strokeWidth="1" opacity="0.4" />
          <path d={`M ${cx + useTw * 0.5} ${shoulderY + 10} L ${cx + useTw * 0.5} ${waistY - 10}`} stroke={shade(oc.main, -12)} strokeWidth="1" opacity="0.4" />
          <path d={`M ${cx - useHw + 3} ${waistY + 8} Q ${cx - (useHw + legGap) / 2} ${hipY + 40}, ${cx - (useHw + legGap) / 2} ${legBottom - 10}`} fill="none" stroke={oc.accent} strokeWidth="1" opacity="0.25" />
          <path d={`M ${cx + useHw - 3} ${waistY + 8} Q ${cx + (useHw + legGap) / 2} ${hipY + 40}, ${cx + (useHw + legGap) / 2} ${legBottom - 10}`} fill="none" stroke={oc.accent} strokeWidth="1" opacity="0.25" />
        </g>
      )}

                 
                 




      {/* ── SPORTY MALE — PORTUGAL ── */}
      {outfit === "sporty" && male && (
        <g>
          {/* إخفاء البنطلون الأحمر الأساسي وجعل الرجلين لون الجلد (شورت فقط) */}
          <path d={leftPantPath} fill={`url(#skin-${uid})`} />
          <path d={rightPantPath} fill={`url(#skin-${uid})`} />

          {/* Green collar */}
          <path d={`M ${cx - 16} ${shoulderY - 14} Q ${cx} ${shoulderY - 5}, ${cx + 16} ${shoulderY - 14}`} fill="none" stroke="#006233" strokeWidth="4" strokeLinecap="round" />

          {/* Green sleeve cuffs (مربعة مصمتة عشان تبان كجزء فعلي من الكم) */}
          <line x1={cx - useSw + 2} y1={shoulderY + 75} x2={cx - useSw - useAw + 6} y2={shoulderY + 75} stroke="#006233" strokeWidth="12" strokeLinecap="square" />
          <line x1={cx + useSw - 2} y1={shoulderY + 75} x2={cx + useSw + useAw - 6} y2={shoulderY + 75} stroke="#006233" strokeWidth="12" strokeLinecap="square" />

          {/* PORTUGAL text */}
          <text x={cx} y={shoulderY + 16} fontFamily="Arial" fontSize="6.5" fill="#006233" textAnchor="middle" fontWeight="bold" letterSpacing="1.5">PORTUGAL</text>

          {/* FPF Shield Crest */}
          <g transform={`translate(${cx}, ${shoulderY + 40}) scale(0.4)`}>
            <circle cx="0" cy="0" r="16" fill="#fff" stroke="#006233" strokeWidth="1.5"/>
            <path d="M 0 -12 L 10 0 L 0 12 L -10 0 Z" fill="#006233"/>
            <circle cx="0" cy="0" r="5" fill="#fff"/>
            <circle cx="0" cy="0" r="2.5" fill="#006233"/>
            <rect x="-1" y="-9" width="2" height="2" fill="#FFD700" transform="rotate(45, 0, -8)"/>
            <rect x="-1" y="7" width="2" height="2" fill="#FFD700" transform="rotate(45, 0, 8)"/>
            <rect x="-9" y="-1" width="2" height="2" fill="#FFD700" transform="rotate(45, -8, 0)"/>
            <rect x="7" y="-1" width="2" height="2" fill="#FFD700" transform="rotate(45, 8, 0)"/>
          </g>

          {/* ═══ GREEN SHORTS (تم إنزاله لتحت أكثر) ═══ */}
          {/* Left leg */}
          <path d={`M ${cx - useHw - 2} ${waistY} L ${cx - legGap} ${waistY} L ${cx - legGap } ${hipY + 56} Q ${cx - (useHw + legGap) / 2 - 1} ${hipY + 64}, ${cx - useHw - 2} ${hipY + 60} Z`} fill="#006233" />
          {/* Right leg */}
          <path d={`M ${cx + legGap} ${waistY} L ${cx + useHw + 2} ${waistY} L ${cx + useHw +2} ${hipY + 60} Q ${cx + (useHw + legGap) / 2 + 1} ${hipY + 64}, ${cx + legGap } ${hipY + 56} Z`} fill="#006233" />

          {/* Red waistband */}
          <rect x={cx - useHw - 2} y={waistY - 8} width={useHw * 2 + 4} height={30} rx={2} fill="#006233" />

          {/* Number 7 */}
          <text
            x={cx}
            y={waistY - 40}
            fontFamily="Arial"
            fontSize="18"
            fill="#166534"
            textAnchor="middle"
            fontWeight="bold"
          >
            7
          </text>

          {/* ═══ SHOES ═══ */}
          <path d={`M ${cx - useHw - 2} ${legBottom - 4} L ${cx - legGap - lw - 2} ${legBottom - 4} Q ${cx - legGap - lw - 2} ${legBottom + 7}, ${cx - legGap - lw + 4} ${legBottom + 7} L ${cx - useHw + 4} ${legBottom + 7} Q ${cx - useHw + 4} ${legBottom + 3}, ${cx - useHw - 2} ${legBottom - 4} Z`} fill="#111111" />
          <path d={`M ${cx + legGap + lw + 2} ${legBottom - 4} L ${cx + useHw + 2} ${legBottom - 4} Q ${cx + useHw + 2} ${legBottom + 3}, ${cx + useHw - 4} ${legBottom + 7} L ${cx + legGap + lw - 4} ${legBottom + 7} Q ${cx + legGap + lw + 2} ${legBottom + 7}, ${cx + legGap + lw + 2} ${legBottom - 4} Z`} fill="#111111" />
        </g>
      )}




      {/* ── SPORTY FEMALE — BRAZIL ── */}
      {outfit === "sporty" && !male && (
        <g>
          {/* Half Sleeves */}
          <path d={`M ${cx - useSw + 4} ${shoulderY - 5} Q ${cx - useSw - useAw - 4} ${shoulderY + 50}, ${cx - useSw - useAw + 4} ${shoulderY + 50} L ${cx - useSw + useAw * 0.6} ${shoulderY + 44} Q ${cx - useSw + 8} ${shoulderY + 50}, ${cx - useSw + 14} ${shoulderY} Z`} fill="url(#jersey_texture_fix)" stroke="#009C3B" strokeWidth="1" />
          <path d={`M ${cx + useSw - 4} ${shoulderY - 5} Q ${cx + useSw + useAw + 4} ${shoulderY + 50}, ${cx + useSw + useAw - 4} ${shoulderY + 50} L ${cx + useSw - useAw * 0.6} ${shoulderY + 44} Q ${cx + useSw - 8} ${shoulderY + 50}, ${cx + useSw - 14} ${shoulderY} Z`} fill="url(#jersey_texture_fix)" stroke="#009C3B" strokeWidth="1" />

          {/* T-Shirt (Shortened from bottom to show a bit of belly) */}
          <path d={`M ${cx - useSw} ${shoulderY} 
                   C ${cx - useSw - 4} ${shoulderY + 45}, ${cx - useTw - 10} ${waistY - 30}, ${cx - useTw - 8} ${waistY - 10} 
                   L ${cx + useTw + 8} ${waistY - 10} 
                   C ${cx + useTw + 10} ${waistY - 30}, ${cx + useSw + 4} ${shoulderY + 45}, ${cx + useSw} ${shoulderY} 
                   C ${cx + useSw - 12} ${shoulderY - 14}, ${cx + 20} ${shoulderY - 18}, ${cx} ${shoulderY - 18} 
                   C ${cx - 20} ${shoulderY - 18}, ${cx - useSw + 12} ${shoulderY - 14}, ${cx - useSw} ${shoulderY} 
                   Z`} 
               fill="url(#jersey_texture_fix)" stroke="#009C3B" strokeWidth="1" />

          {/* V-Neck */}
          <path d={`M ${cx - 15} ${shoulderY - 14} Q ${cx} ${shoulderY - 6}, ${cx + 15} ${shoulderY - 14} L ${cx} ${shoulderY + 6} Z`} fill="#009C3B" />
          <path d={`M ${cx - 11} ${shoulderY - 13} Q ${cx} ${shoulderY - 6}, ${cx + 11} ${shoulderY - 13} L ${cx} ${shoulderY + 3} Z`} fill="#ffff00" />

          {/* Hem Trim (Moved up to match new t-shirt length) */}
          <line x1={cx - useTw - 8} y1={waistY - 10} x2={cx + useTw + 8} y2={waistY - 10} stroke="#009C3B" strokeWidth="4" strokeLinecap="round" />

          {/* CBF Crest and BRASIL */}
          <g transform={`translate(${cx - 18}, ${shoulderY + 12}) scale(0.65)`}>
            <circle cx="0" cy="0" r="13" fill="#fff" stroke="#009C3B" strokeWidth="1.2"/>
            <text x="0" y="4" fontFamily="Arial" fontSize="7" fill="#0057b7" textAnchor="middle" fontWeight="bold">CBF</text>
            <path d="M 0 -13 L 9 0 L 0 13 L -9 0 Z" fill="#0057b7" />
            <g transform="translate(-10, -18)">
              <text x="10" y="23" fontFamily="Arial" fontSize="8.5" fill="#009C3B" textAnchor="middle" fontWeight="bold">brazil</text>
              <g transform="translate(10, 10)">
                {[0, 1, 2, 3, 4].map(i => (
                  <path key={i} transform={`translate(${(i - 2) * 5.5}, -12) scale(0.25)`} d="M 0,-10 L 3,-2 L 10,-2 L 4,4 L 6,12 L 0,7 L -6,12 L -4,4 L -10,-2 L -3,-2 Z" fill="#009C3B"/>
                ))}
              </g>
            </g>
          </g>

          {/* Number 10 (Adjusted to fit perfectly on the shirt) */}
          <text
            x={cx}
            y={shoulderY + 55}
            fontFamily="Arial"
            fontSize="18"
            fill="#068e2f"
            textAnchor="middle"
            fontWeight="bold"
          >
            10
          </text>

          {/* ═══ SHORTS (Single connected piece) ═══ */}
          {/* Main green shorts body (connected via inner crotch seam) */}
          <path d={`
            M ${cx - useHw} ${hipY - 1} 
            L ${cx + useHw + 2} ${hipY - 15} 
            L ${cx + useHw + 1} ${hipY + 0} 
            Q ${cx + useHw } ${hipY }, ${cx + legGap + lw - 2} ${hipY +0} 
            L ${cx + legGap + 2} ${hipY + 20} 
            L ${cx - legGap - 2} ${hipY + 20} 
            L ${cx - legGap - 2} ${hipY } 
            Q ${cx - legGap - 2} ${hipY }, ${cx - legGap - lw +2} ${hipY + 0} 
            L ${cx - useHw - 1} ${hipY } 
            Z`} 
            fill="#009C3B" />

          {/* Yellow waistband (Over the top of the single shorts piece) */}
          <rect x={cx - useHw } y={hipY - 15.6} width={useHw * 2+ 4} height={10} rx={4} fill="#e2ff00" stroke="#009C3B" strokeWidth="1" />

          {/* ═══ SHOES ═══ */}
          {/* الحذاء اليسار (مربع بسيط) */}
          <rect
            x={cx - legGap - lw - 20}
            y={legBottom - 5}
            width={lw + 16}
            height={10}
            rx={1}
            fill="#0a4a20"
          />
          <rect
            x={cx - legGap - lw - 20}
            y={legBottom + 5}
            width={lw + 16}
            height={3}
            rx={1}
            fill="#022c22"
          />

          {/* الحذاء اليمين (مربع بسيط) */}
          <rect
            x={cx + legGap + 6}
            y={legBottom - 7}
            width={lw + 16}
            height={12}
            rx={1}
            fill="#0a4a20"
          />
          <rect
            x={cx + legGap + 6}
            y={legBottom + 4}
            width={lw + 18}
            height={3}
            rx={2}
            fill="#022c22"
          />
        





        </g>
      )}







      {/* ── FORMAL ── */}
      {outfit === "formal" && male && (
        <g>
          <path d={`M ${cx - 2} ${shoulderY - 8} L ${cx - 28} ${shoulderY + 56} L ${cx - 16} ${shoulderY + 56} L ${cx - 2} ${shoulderY + 28} Z`} fill={shade(oc.main, -15)} />
          <path d={`M ${cx + 2} ${shoulderY - 8} L ${cx + 28} ${shoulderY + 56} L ${cx + 16} ${shoulderY + 56} L ${cx + 2} ${shoulderY + 28} Z`} fill={shade(oc.main, -15)} />
          <rect x={cx - 7} y={shoulderY - 6} width={14} height={waistY - shoulderY + 6} fill={shade(oc.main, 28)} />
          <path d={`M ${cx - 4} ${shoulderY + 8} L ${cx} ${shoulderY + 26} L ${cx + 4} ${shoulderY + 8} L ${cx + 3} ${shoulderY + 64} L ${cx - 3} ${shoulderY + 64} Z`} fill={oc.accent} />
          <circle cx={cx + 18} cy={shoulderY + 46} r={2.5} fill={shade(oc.main, 20)} />
          <line x1={cx - (useHw + legGap) / 2} y1={waistY + 10} x2={cx - (useHw + legGap) / 2} y2={legBottom - 8} stroke={shade(oc.main, -10)} strokeWidth="1" opacity="0.3" />
          <line x1={cx + (useHw + legGap) / 2} y1={waistY + 10} x2={cx + (useHw + legGap) / 2} y2={legBottom - 8} stroke={shade(oc.main, -10)} strokeWidth="1" opacity="0.3" />
        </g>
      )}
      {outfit === "formal" && !male && (
        <g>
          <path d={`M ${cx - 2} ${shoulderY - 10} L ${cx - 22} ${shoulderY + 50} L ${cx - 12} ${shoulderY + 50} L ${cx - 2} ${shoulderY + 24} Z`} fill={shade(oc.main, -12)} />
          <path d={`M ${cx + 2} ${shoulderY - 10} L ${cx + 22} ${shoulderY + 50} L ${cx + 12} ${shoulderY + 50} L ${cx + 2} ${shoulderY + 24} Z`} fill={shade(oc.main, -12)} />
          <path d={`M ${cx - 8} ${shoulderY - 8} L ${cx} ${shoulderY + 4} L ${cx + 8} ${shoulderY - 8}`} fill={shade(oc.main, 30)} stroke={shade(oc.main, 20)} strokeWidth="0.8" />
          <circle cx={cx} cy={shoulderY + 36} r={2.5} fill={oc.accent} />
          <path d={`M ${cx - 8} ${waistY} Q ${cx - 12} ${hipY + 40}, ${cx - 14} ${skirtEndY - 5}`} fill="none" stroke={shade(oc.main, -15)} strokeWidth="1" opacity="0.3" />
          <path d={`M ${cx + 8} ${waistY} Q ${cx + 12} ${hipY + 40}, ${cx + 14} ${skirtEndY - 5}`} fill="none" stroke={shade(oc.main, -15)} strokeWidth="1" opacity="0.3" />
          <path d={`M ${cx} ${waistY} Q ${cx + 2} ${hipY + 40}, ${cx} ${skirtEndY - 3}`} fill="none" stroke={shade(oc.main, -15)} strokeWidth="1" opacity="0.2" />
        </g>
      )}

      {/* ── FUTURISTIC ── */}
      {outfit === "futuristic" && male && (
        <g>
          <circle cx={cx} cy={shoulderY + 48} r={15} fill={shade(oc.main, -28)} stroke={oc.accent} strokeWidth="2" />
          <circle cx={cx} cy={shoulderY + 48} r={9} fill={oc.accent} opacity={0.3 + energy * 0.6} filter={`url(#glow-${uid})`} />
          <circle cx={cx} cy={shoulderY + 48} r={3.5} fill={oc.accent} />
          <path d={`M ${cx - 18} ${shoulderY - 8} L ${cx - useTw + 6} ${waistY}`} stroke={oc.accent} strokeWidth="1.5" opacity="0.6" />
          <path d={`M ${cx + 18} ${shoulderY - 8} L ${cx + useTw - 6} ${waistY}`} stroke={oc.accent} strokeWidth="1.5" opacity="0.6" />
          <line x1={cx - (useHw + legGap) / 2} y1={waistY + 8} x2={cx - (useHw + legGap) / 2} y2={legBottom - 8} stroke={oc.accent} strokeWidth="1" opacity="0.4" />
          <line x1={cx + (useHw + legGap) / 2} y1={waistY + 8} x2={cx + (useHw + legGap) / 2} y2={legBottom - 8} stroke={oc.accent} strokeWidth="1" opacity="0.4" />
        </g>
      )}
      {outfit === "futuristic" && !male && (
        <g>
          <path d={`M ${cx - 20} ${shoulderY - 14} Q ${cx} ${shoulderY - 22}, ${cx + 20} ${shoulderY - 14}`} fill="none" stroke={oc.accent} strokeWidth="2" opacity="0.7" />
          <circle cx={cx - 8} cy={shoulderY + 35} r={10} fill={shade(oc.main, -28)} stroke={oc.accent} strokeWidth="1.5" />
          <circle cx={cx - 8} cy={shoulderY + 35} r={5} fill={oc.accent} opacity={0.3 + energy * 0.6} filter={`url(#glow-${uid})`} />
          <circle cx={cx - 8} cy={shoulderY + 35} r={2} fill={oc.accent} />
          <path d={`M ${cx + 10} ${shoulderY - 4} L ${cx + useTw - 4} ${waistY - 10}`} stroke={oc.accent} strokeWidth="1.5" opacity="0.5" />
          <path d={`M ${cx - useTw + 4} ${shoulderY + 20} L ${cx - useTw + 8} ${waistY}`} stroke={oc.accent} strokeWidth="1" opacity="0.4" />
          <path d={`M ${cx - useHw + 3} ${waistY + 8} Q ${cx - legGap - 2} ${hipY + 30}, ${cx - legGap - 2} ${legBottom - 10}`} fill="none" stroke={oc.accent} strokeWidth="1" opacity="0.4" />
          <path d={`M ${cx + useHw - 3} ${waistY + 8} Q ${cx + legGap + 2} ${hipY + 30}, ${cx + legGap + 2} ${legBottom - 10}`} fill="none" stroke={oc.accent} strokeWidth="1" opacity="0.4" />
        </g>
      )}

      {/* ── MINIMALIST ── */}
      {outfit === "minimalist" && male && (
        <g>
          <rect x={cx - 14} y={shoulderY - 28} width={28} height={26} rx={6} fill={shade(oc.main, 10)} />
        </g>
      )}
      {outfit === "minimalist" && !male && (
        <g>
          <path d={`M ${cx - 22} ${shoulderY - 14} Q ${cx} ${shoulderY - 2}, ${cx + 22} ${shoulderY - 14}`} fill={skinTone} stroke={shade(oc.main, -10)} strokeWidth="1.5" />
          <line x1={cx - useTw} y1={waistY - 4} x2={cx + useTw} y2={waistY - 4} stroke={shade(oc.main, -12)} strokeWidth="1" opacity="0.3" />
          <path d={`M ${cx - useHw + 2} ${waistY + 6} Q ${cx - (useHw + legGap) / 2} ${hipY + 40}, ${cx - (useHw + legGap) / 2} ${legBottom - 10}`} fill="none" stroke={shade(oc.main, -8)} strokeWidth="1" opacity="0.2" />
          <path d={`M ${cx + useHw - 2} ${waistY + 6} Q ${cx + (useHw + legGap) / 2} ${hipY + 40}, ${cx + (useHw + legGap) / 2} ${legBottom - 10}`} fill="none" stroke={shade(oc.main, -8)} strokeWidth="1" opacity="0.2" />
        </g>
      )}

      {/* ═══════ HEAD ═══════ */}

      {/* ears */}
      <ellipse cx={cx - face.rx + 2} cy={eyeY + 6} r={8} fill={`url(#skin-${uid})`} />
      <ellipse cx={cx + face.rx - 2} cy={eyeY + 6} r={8} fill={`url(#skin-${uid})`} />

      {/* face shape — natural curves */}
      {faceShape === "square" ? (
        <path
          d={`M ${cx - face.rx} ${headCy - face.ry + 22}
              Q ${cx - face.rx} ${headCy - face.ry - 2}, ${cx - face.rx * 0.5} ${headCy - face.ry - 6}
              Q ${cx} ${headCy - face.ry - 8}, ${cx + face.rx * 0.5} ${headCy - face.ry - 6}
              Q ${cx + face.rx} ${headCy - face.ry - 2}, ${cx + face.rx} ${headCy - face.ry + 22}
              C ${cx + face.rx} ${headCy + face.chin - 16}, ${cx + face.rx * face.jaw} ${headCy + face.chin - 4}, ${cx + face.rx * face.jaw * 0.5} ${headCy + face.chin + 2}
              Q ${cx} ${headCy + face.chin + 4}, ${cx - face.rx * face.jaw * 0.5} ${headCy + face.chin + 2}
              C ${cx - face.rx * face.jaw} ${headCy + face.chin - 4}, ${cx - face.rx} ${headCy + face.chin - 16}, ${cx - face.rx} ${headCy - face.ry + 22}
              Z`}
          fill={`url(#skin-${uid})`}
        />
      ) : faceShape === "sharp" ? (
        <path
          d={`M ${cx - face.rx} ${headCy - 6}
              C ${cx - face.rx} ${headCy - face.ry - 2}, ${cx - face.rx * 0.6} ${headCy - face.ry - 6}, ${cx} ${headCy - face.ry - 3}
              C ${cx + face.rx * 0.6} ${headCy - face.ry - 6}, ${cx + face.rx} ${headCy - face.ry - 2}, ${cx + face.rx} ${headCy - 6}
              C ${cx + face.rx * 0.9} ${headCy + face.chin - 26}, ${cx + face.rx * face.jaw} ${headCy + face.chin - 6}, ${cx} ${headCy + face.chin + 4}
              C ${cx - face.rx * face.jaw} ${headCy + face.chin - 6}, ${cx - face.rx * 0.9} ${headCy + face.chin - 26}, ${cx - face.rx} ${headCy - 6}
              Z`}
          fill={`url(#skin-${uid})`}
        />
      ) : (
        <path
          d={`M ${cx - face.rx} ${headCy}
              C ${cx - face.rx} ${headCy - face.ry + 10}, ${cx - face.rx * 0.55} ${headCy - face.ry - 4}, ${cx} ${headCy - face.ry}
              C ${cx + face.rx * 0.55} ${headCy - face.ry - 4}, ${cx + face.rx} ${headCy - face.ry + 10}, ${cx + face.rx} ${headCy}
              C ${cx + face.rx * face.jaw} ${headCy + face.chin - 10}, ${cx + face.rx * face.jaw * 0.65} ${headCy + face.chin + 1}, ${cx} ${headCy + face.chin + 3}
              C ${cx - face.rx * face.jaw * 0.65} ${headCy + face.chin + 1}, ${cx - face.rx * face.jaw} ${headCy + face.chin - 10}, ${cx - face.rx} ${headCy}
              Z`}
          fill={`url(#skin-${uid})`}
        />
      )}

      {/* cheek shading */}
      <ellipse cx={cx + 22} cy={eyeY + 18} rx={10} ry={7} fill={skinDark} opacity="0.12" />
      <ellipse cx={cx - 22} cy={eyeY + 18} rx={10} ry={7} fill={skinDark} opacity="0.12" />

      {/* eyebrows */}
      <path d={`M ${cx - eyeDx - 9} ${eyeY - 12 + mt.browY} Q ${cx - eyeDx} ${eyeY - 18 + mt.browY}, ${cx - eyeDx + 9} ${eyeY - 12 + mt.browY}`} fill="none" stroke={hairDark} strokeWidth={browThick} strokeLinecap="round" />
      <path d={`M ${cx + eyeDx - 9} ${eyeY - 12 + mt.browY} Q ${cx + eyeDx} ${eyeY - 18 + mt.browY}, ${cx + eyeDx + 9} ${eyeY - 12 + mt.browY}`} fill="none" stroke={hairDark} strokeWidth={browThick} strokeLinecap="round" />

      {/* eyes */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M ${cx + s * eyeDx - eyeRx - 1} ${eyeY} Q ${cx + s * eyeDx} ${eyeY - eyeRy - 2}, ${cx + s * eyeDx + eyeRx + 1} ${eyeY} Q ${cx + s * eyeDx} ${eyeY + eyeRy + 2}, ${cx + s * eyeDx - eyeRx - 1} ${eyeY} Z`} fill="#f4f8ff" />
          <circle cx={cx + s * eyeDx} cy={eyeY} r={Math.min(eyeRy, 6)} fill={`url(#eye-${uid})`} />
          <circle cx={cx + s * eyeDx} cy={eyeY} r={2.8} fill="#080c18" />
          <circle cx={cx + s * eyeDx - 2} cy={eyeY - 2} r={1.8} fill="#fff" opacity={0.6 + mt.spark * 0.4 * (0.5 + energy / 2)} />
          {!male && (
            <path d={`M ${cx + s * eyeDx - eyeRx - 1} ${eyeY - 1} Q ${cx + s * eyeDx - eyeRx - 3} ${eyeY - 2}, ${cx + s * eyeDx - eyeRx - 4} ${eyeY - 4}`} fill="none" stroke="#080c18" strokeWidth="1.5" strokeLinecap="round" />
          )}
          <path d={`M ${cx + s * eyeDx - eyeRx - 1} ${eyeY - 0.5} Q ${cx + s * eyeDx} ${eyeY - eyeRy - 2}, ${cx + s * eyeDx + eyeRx + 1} ${eyeY - 0.5}`} fill="none" stroke={hairDark} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      ))}

      {/* nose */}
      <path d={`M ${cx - 3} ${eyeY + 6} Q ${cx - 5} ${eyeY + 17}, ${cx - 4} ${eyeY + 20} Q ${cx} ${eyeY + 23}, ${cx + 4} ${eyeY + 20} Q ${cx + 5} ${eyeY + 17}, ${cx + 3} ${eyeY + 6}`} fill="none" stroke={skinDark} strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />

      {/* lips */}
      <path d={mouthPath} fill="none" stroke={lipColor} strokeWidth={lipThick} strokeLinecap="round" />
      {!male && mt.smile > 0.2 && (
        <path d={`M ${cx - 11} ${mouthY + 1} Q ${cx} ${mouthY + mouthCurve + 2}, ${cx + 11} ${mouthY + 1} Q ${cx} ${mouthY + 4}, ${cx - 11} ${mouthY + 1} Z`} fill={lipColor} opacity="0.55" />
      )}

      {/* ═══════ FRONT HAIR ═══════ */}

      {hairStyle === "short" && (
        <path
          d={`M ${cx - face.rx - 3} ${headCy - 4} C ${cx - face.rx - 7} ${headCy - face.ry - 12}, ${cx - 18} ${headCy - face.ry - 20}, ${cx} ${headCy - face.ry - 16} C ${cx + 18} ${headCy - face.ry - 20}, ${cx + face.rx + 7} ${headCy - face.ry - 12}, ${cx + face.rx + 3} ${headCy - 4} C ${cx + face.rx - 6} ${headCy - 14}, ${cx + 8} ${headCy - 24}, ${cx} ${headCy - 20} C ${cx - 8} ${headCy - 24}, ${cx - face.rx + 6} ${headCy - 14}, ${cx - face.rx - 3} ${headCy - 4} Z`}
          fill={`url(#hair-${uid})`}
        />
      )}

      {hairStyle === "long" && (
        <path
          d={`M ${cx - face.rx - 5} ${headCy} C ${cx - face.rx - 9} ${headCy - face.ry - 14}, ${cx - 14} ${headCy - face.ry - 22}, ${cx} ${headCy - face.ry - 18} C ${cx + 14} ${headCy - face.ry - 22}, ${cx + face.rx + 9} ${headCy - face.ry - 14}, ${cx + face.rx + 5} ${headCy} C ${cx + face.rx - 3} ${headCy - 12}, ${cx + 10} ${headCy - 26}, ${cx} ${headCy - 22} C ${cx - 10} ${headCy - 26}, ${cx - face.rx + 3} ${headCy - 12}, ${cx - face.rx - 5} ${headCy} Z`}
          fill={`url(#hair-${uid})`}
        />
      )}

      {hairStyle === "fade" && (
        <path
          d={`M ${cx - face.rx} ${headCy - 2} C ${cx - face.rx - 2} ${headCy - face.ry - 4}, ${cx - 10} ${headCy - face.ry - 8}, ${cx} ${headCy - face.ry - 6} C ${cx + 10} ${headCy - face.ry - 8}, ${cx + face.rx + 2} ${headCy - face.ry - 4}, ${cx + face.rx} ${headCy - 2} C ${cx + face.rx - 2} ${headCy - 8}, ${cx + 6} ${headCy - 12}, ${cx} ${headCy - 10} C ${cx - 6} ${headCy - 12}, ${cx - face.rx + 2} ${headCy - 8}, ${cx - face.rx} ${headCy - 2} Z`}
          fill={`url(#hair-${uid})`}
        />
      )}

      {hairStyle === "bun" && (
        <g>
          <path
            d={`M ${cx - face.rx - 3} ${headCy - 2} C ${cx - face.rx - 6} ${headCy - face.ry - 10}, ${cx - 14} ${headCy - face.ry - 18}, ${cx} ${headCy - face.ry - 14} C ${cx + 14} ${headCy - face.ry - 18}, ${cx + face.rx + 6} ${headCy - face.ry - 10}, ${cx + face.rx + 3} ${headCy - 2} C ${cx + face.rx - 4} ${headCy - 10}, ${cx + 8} ${headCy - 18}, ${cx} ${headCy - 16} C ${cx - 8} ${headCy - 18}, ${cx - face.rx + 4} ${headCy - 10}, ${cx - face.rx - 3} ${headCy - 2} Z`}
            fill={`url(#hair-${uid})`}
          />
          <circle cx={cx} cy={headCy - face.ry - 18} r={14} fill={`url(#hair-${uid})`} />
        </g>
      )}

      {hairStyle === "futuristic" && (
        <g fill={`url(#hair-${uid})`}>
          <path d={`M ${cx - face.rx} ${headCy - 2} L ${cx - face.rx + 2} ${headCy + 10} L ${cx - face.rx - 1} ${headCy + 10} Z`} />
          <path d={`M ${cx + face.rx} ${headCy - 2} L ${cx + face.rx - 2} ${headCy + 10} L ${cx + face.rx + 1} ${headCy + 10} Z`} />
          <path d={`M ${cx - 16} ${headCy - 6} L ${cx - 12} ${headCy - face.ry - 24} L ${cx - 4} ${headCy - face.ry - 34} L ${cx + 4} ${headCy - face.ry - 38} L ${cx + 12} ${headCy - face.ry - 32} L ${cx + 18} ${headCy - face.ry - 20} L ${cx + 20} ${headCy - 6} C ${cx + 14} ${headCy - 14}, ${cx - 12} ${headCy - 14}, ${cx - 16} ${headCy - 6} Z`} />
        </g>
      )}

      {/* ═══════ CURLY HAIR ═══════ */}
      {hairStyle === "curly" && (
        <g fill={`url(#hair-${uid})`}>
          <path
            d={`M ${cx - face.rx - 8} ${headCy - 6}
                C ${cx - face.rx - 16} ${headCy - face.ry + 4}, ${cx - face.rx * 0.65} ${headCy - face.ry - 14}, ${cx} ${headCy - face.ry - 12}
                C ${cx + face.rx * 0.65} ${headCy - face.ry - 14}, ${cx + face.rx + 16} ${headCy - face.ry + 4}, ${cx + face.rx + 8} ${headCy - 6}
                Q ${cx + face.rx + 2} ${headCy - 14}, ${cx + face.rx - 6} ${headCy - 10}
                L ${cx - face.rx + 6} ${headCy - 10}
                Q ${cx - face.rx - 2} ${headCy - 14}, ${cx - face.rx - 8} ${headCy - 6}
                Z`}
          />
          {[
            { dx: -28, dy: -38, r: 16 },
            { dx: -8, dy: -44, r: 18 },
            { dx: 12, dy: -44, r: 18 },
            { dx: 30, dy: -38, r: 16 },
            { dx: -40, dy: -18, r: 14 },
            { dx: 40, dy: -18, r: 14 },
            { dx: 0, dy: -50, r: 15 },
            { dx: -18, dy: -50, r: 14 },
            { dx: 20, dy: -50, r: 14 },
            { dx: -40, dy: -34, r: 12 },
            { dx: 40, dy: -34, r: 12 },
          ].map((c, i) => (
            <circle key={i} cx={cx + c.dx} cy={headCy + c.dy} r={c.r} />
          ))}
        </g>
      )}

      {/* ═══════ ACCESSORIES ═══════ */}

      {accessories.glasses && (
        <g>
          <rect x={cx - eyeDx - 9} y={eyeY - 8} width={18} height={16} rx={5} fill="rgba(20,30,50,0.12)" stroke="#0f172a" strokeWidth="2.5" />
          <rect x={cx + eyeDx - 9} y={eyeY - 8} width={18} height={16} rx={5} fill="rgba(20,30,50,0.12)" stroke="#0f172a" strokeWidth="2.5" />
          <path d={`M ${cx - eyeDx + 9} ${eyeY - 1} Q ${cx} ${eyeY - 5}, ${cx + eyeDx - 9} ${eyeY - 1}`} fill="none" stroke="#0f172a" strokeWidth="2" />
        </g>
      )}

      {accessories.headset && (
        <g>
          <path d={`M ${cx - face.rx - 4} ${eyeY - 6} Q ${cx - face.rx - 14} ${eyeY - 20}, ${cx - face.rx - 8} ${eyeY - 30} Q ${cx} ${eyeY - face.ry - 22}, ${cx + face.rx + 8} ${eyeY - 30} Q ${cx + face.rx + 14} ${eyeY - 20}, ${cx + face.rx + 4} ${eyeY - 6}`} fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
          <rect x={cx - face.rx - 12} y={eyeY - 12} width={14} height={18} rx={5} fill="#1e293b" />
          <rect x={cx + face.rx - 2} y={eyeY - 12} width={14} height={18} rx={5} fill="#1e293b" />
        </g>
      )}

      {accessories.necklace && (
        <path d={`M ${cx - 16} ${headCy + face.chin + 2} Q ${cx} ${headCy + face.chin + 18}, ${cx + 16} ${headCy + face.chin + 2}`} fill="none" stroke={oc.accent} strokeWidth="1.5" />
      )}

      {accessories.wristTech && (
        <g>
          <rect x={cx + useSw + useAw - useAw / 2 - 8} y={armWristY - 12} width={useAw + 16} height={22} rx={5} fill="#0a0e17" stroke="#06d6c7" strokeWidth="1.5" />
          <rect x={cx + useSw + useAw - useAw / 2 - 2} y={armWristY - 6} width={useAw + 4} height={10} rx={2} fill="#06d6c7" opacity={0.6 + energy * 0.4} />
        </g>
      )}
    </svg>
  )
}