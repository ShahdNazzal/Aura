"use client"

import { useId } from "react"
import type { AvatarConfig, BodyType, FaceShape, Mood } from "@/lib/types"

interface AvatarSVGProps {
  config: AvatarConfig
  progress?: number
  className?: string
  showAura?: boolean
}

/* ----------------------------- helpers ----------------------------- */

function shade(hex: string, amount: number) {
  const c = hex.replace("#", "")
  const num = parseInt(c.length === 3 ? c.split("").map((x) => x + x).join("") : c, 16)
  let r = (num >> 16) + amount
  let g = ((num >> 8) & 0xff) + amount
  let b = (num & 0xff) + amount
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

interface BodyMetrics {
  shoulder: number
  torso: number
  arm: number
  hip: number
  leg: number
}

const BODY: Record<BodyType, BodyMetrics> = {
  slim: { shoulder: 56, torso: 42, arm: 11, hip: 40, leg: 16 },
  athletic: { shoulder: 68, torso: 50, arm: 14, hip: 44, leg: 19 },
  muscular: { shoulder: 84, torso: 60, arm: 20, hip: 50, leg: 23 },
  heavy: { shoulder: 78, torso: 70, arm: 18, hip: 62, leg: 26 },
}

function faceRadii(shape: FaceShape) {
  switch (shape) {
    case "round": return { rx: 46, ry: 48, jaw: 0.92, chin: 38 }
    case "oval": return { rx: 42, ry: 52, jaw: 0.8, chin: 44 }
    case "square": return { rx: 46, ry: 48, jaw: 1.0, chin: 30 }
    case "sharp": return { rx: 44, ry: 52, jaw: 0.62, chin: 50 }
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

function auraPalette(progress: number) {
  if (progress < 30) return { inner: "#4f8fff", outer: "#1b2c54", rings: "#4f8fff", intensity: 0.45 }
  if (progress < 70) return { inner: "#7aa7ff", outer: "#3b2d6b", rings: "#a78bfa", intensity: 0.7 }
  return { inner: "#f5c842", outer: "#a78bfa", rings: "#f5c842", intensity: 1 }
}

/* ----------------------------- component ----------------------------- */

export function AvatarSVG({ config, progress = 0, className, showAura = false }: AvatarSVGProps) {
  const uid = useId().replace(/:/g, "")
  const { faceShape, skinTone, eyeShape, eyeColor, hairStyle, hairColor, bodyType, outfit, accessories, mood, energyLevel } = config

  const m = BODY[bodyType]
  const face = faceRadii(faceShape)
  const mt = moodTraits(mood)
  const aura = auraPalette(progress)
  const energy = energyLevel / 100

  const cx = 150
  const headCy = 112

  const skinDark = shade(skinTone, -34)
  const skinLight = shade(skinTone, 22)
  const hairDark = shade(hairColor, -28)
  const hairLight = shade(hairColor, 26)
  const hairMid = shade(hairColor, -10)
  const lipColor = shade(skinTone, -45)

  // Advanced Outfit Palettes & Details
  const outfitStyles: Record<string, { main: string; accent: string; secondary: string; shoe: string }> = {
    casual: { main: "#2c3e50", accent: "#ecf0f1", secondary: "#34495e", shoe: "#f39c12" },
    sporty: { main: "#1a1a2e", accent: "#06d6c7", secondary: "#16213e", shoe: "#e94560" },
    formal: { main: "#0f0f1a", accent: "#d4af37", secondary: "#1a1a2e", shoe: "#1a1a1a" },
    futuristic: { main: "#0b0c15", accent: "#4f8fff", secondary: "#141d33", shoe: "#4f8fff" },
    minimalist: { main: "#1e272e", accent: "#d2dae2", secondary: "#2d3436", shoe: "#485460" },
  }
  const oc = outfitStyles[outfit]

  const shoulderY = 188
  const waistY = 320
  const hipY = 338
  const legBottom = 470
  const armWristY = 322
  const shoeH = 16

  const shoulderX = m.shoulder
  const waistHalf = m.torso
  const hipHalf = m.hip

  // Enhanced Torso Path (Broader, modern drop-shoulder feel)
  const torsoPath = `
    M ${cx - shoulderX} ${shoulderY}
    C ${cx - shoulderX - 6} ${shoulderY + 40}, ${cx - waistHalf - 8} ${waistY - 50}, ${cx - waistHalf} ${waistY}
    L ${cx + waistHalf} ${waistY}
    C ${cx + waistHalf + 8} ${waistY - 50}, ${cx + shoulderX + 6} ${shoulderY + 40}, ${cx + shoulderX} ${shoulderY}
    C ${cx + shoulderX - 12} ${shoulderY - 16}, ${cx + 24} ${shoulderY - 20}, ${cx} ${shoulderY - 20}
    C ${cx - 24} ${shoulderY - 20}, ${cx - shoulderX + 12} ${shoulderY - 16}, ${cx - shoulderX} ${shoulderY} Z`

  const legGap = 5
  const legTopHalf = m.leg
  const leftLeg = `
    M ${cx - hipHalf} ${hipY}
    L ${cx - legGap} ${hipY}
    L ${cx - legGap} ${legBottom}
    Q ${cx - legGap} ${legBottom + 6}, ${cx - legGap - legTopHalf} ${legBottom + 6}
    L ${cx - hipHalf} ${legBottom}
    Z`
  const rightLeg = `
    M ${cx + hipHalf} ${hipY}
    L ${cx + legGap} ${hipY}
    L ${cx + legGap} ${legBottom}
    Q ${cx + legGap} ${legBottom + 6}, ${cx + legGap + legTopHalf} ${legBottom + 6}
    L ${cx + hipHalf} ${legBottom}
    Z`

  // Modern Sleek Arms
  const armTopY = shoulderY - 8
  const leftArm = `
    M ${cx - shoulderX + 4} ${armTopY}
    Q ${cx - shoulderX - m.arm - 4} ${armTopY + 50}, ${cx - shoulderX - m.arm + 4} ${armWristY - 20}
    Q ${cx - shoulderX - m.arm + 4} ${armWristY + 4}, ${cx - shoulderX + m.arm} ${armWristY}
    Q ${cx - shoulderX + 8} ${armTopY + 60}, ${cx - shoulderX + 16} ${armTopY + 6} Z`
  const rightArm = `
    M ${cx + shoulderX - 4} ${armTopY}
    Q ${cx + shoulderX + m.arm + 4} ${armTopY + 50}, ${cx + shoulderX + m.arm - 4} ${armWristY - 20}
    Q ${cx + shoulderX + m.arm - 4} ${armWristY + 4}, ${cx + shoulderX - m.arm} ${armWristY}
    Q ${cx + shoulderX - 8} ${armTopY + 60}, ${cx + shoulderX - 16} ${armTopY + 6} Z`

  const eyeY = headCy + 4
  const eyeDx = 17
  const eyeRy = eyeShape === "round" ? 7 : eyeShape === "sharp" ? 5 : 8
  const eyeRx = eyeShape === "round" ? 7 : eyeShape === "sharp" ? 9 : 9
  const mouthY = headCy + face.chin - 16
  const mouthCurve = mt.smile * 9
  const mouthPath = `M ${cx - 13} ${mouthY} Q ${cx} ${mouthY + mouthCurve}, ${cx + 13} ${mouthY}`

  // Shoe Generators based on outfit
  const renderShoes = () => {
    const ly = legBottom + 6
    const lx = cx - legGap - legTopHalf / 2
    const rx = cx + legGap + legTopHalf / 2
    
    if (outfit === "sporty" || outfit === "casual") {
      // Chunky Sneakers
      return (
        <g>
          {[lx, rx].map((x, i) => (
            <g key={i}>
              <path d={`M ${x - legTopHalf/2 - 2} ${ly - 2} L ${x - legTopHalf/2 - 4} ${ly + 4} L ${x + legTopHalf/2 + 6} ${ly + 4} L ${x + legTopHalf/2 + 6} ${ly - 4} Q ${x + legTopHalf/2} ${ly - 8}, ${x} ${ly - 6} Q ${x - legTopHalf/2} ${ly - 6}, ${x - legTopHalf/2 - 2} ${ly - 2} Z`} fill={oc.shoe} />
              <rect x={x - legTopHalf/2 - 4} y={ly + 4} width={legTopHalf + 10} height={6} rx={3} fill={shade(oc.shoe, -40)} />
              <path d={`M ${x - legTopHalf/2} ${ly - 2} L ${x + legTopHalf/2 + 2} ${ly - 2}`} stroke={shade(oc.shoe, 40)} strokeWidth="1.5" opacity="0.6" />
            </g>
          ))}
        </g>
      )
    } else if (outfit === "formal") {
      // Polished Leather Shoes
      return (
        <g>
          {[lx, rx].map((x, i) => (
            <g key={i}>
              <path d={`M ${x - legTopHalf/2} ${ly - 4} L ${x - legTopHalf/2 - 2} ${ly + 2} Q ${x - legTopHalf/2 - 2} ${ly + 6}, ${x + legTopHalf/2 + 2} ${ly + 6} Q ${x + legTopHalf/2 + 4} ${ly + 6}, ${x + legTopHalf/2 + 4} ${ly} L ${x + legTopHalf/2 + 2} ${ly - 6} Z`} fill={oc.shoe} />
              <path d={`M ${x} ${ly - 6} L ${x + legTopHalf/2 + 2} ${ly - 6}`} stroke="#333" strokeWidth="1" />
            </g>
          ))}
        </g>
      )
    } else if (outfit === "futuristic") {
      // Cyber Boots
      return (
        <g>
          {[lx, rx].map((x, i) => (
            <g key={i}>
              <path d={`M ${x - legTopHalf/2 - 2} ${ly - 12} L ${x - legTopHalf/2 - 4} ${ly + 2} L ${x + legTopHalf/2 + 4} ${ly + 2} L ${x + legTopHalf/2 + 4} ${ly - 12} Z`} fill={shade(oc.secondary, -20)} stroke={oc.accent} strokeWidth="1" opacity="0.8" />
              <rect x={x - legTopHalf/2 - 4} y={ly + 2} width={legTopHalf + 8} height={8} rx={2} fill={oc.secondary} stroke={oc.accent} strokeWidth="1" />
              <line x1={x} y1={ly - 10} x2={x} y2={ly + 8} stroke={oc.accent} strokeWidth="1.5" opacity="0.8" />
            </g>
          ))}
        </g>
      )
    }
    // Minimalist Slip-ons
    return (
      <g>
        {[lx, rx].map((x, i) => (
          <path key={i} d={`M ${x - legTopHalf/2 - 2} ${ly - 2} L ${x - legTopHalf/2 - 2} ${ly + 6} Q ${x - legTopHalf/2 - 2} ${ly + 8}, ${x + legTopHalf/2 + 2} ${ly + 8} Q ${x + legTopHalf/2 + 4} ${ly + 8}, ${x + legTopHalf/2 + 4} ${ly - 2} Z`} fill={oc.shoe} />
        ))}
      </g>
    )
  }

  return (
    <svg viewBox="0 0 300 500" className={className} role="img" aria-label="Next-Gen AURA Avatar">
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
        <linearGradient id={`hair-h-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={hairLight} />
          <stop offset="50%" stopColor={hairColor} />
          <stop offset="100%" stopColor={hairDark} />
        </linearGradient>
        <linearGradient id={`outfit-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(oc.main, 22)} />
          <stop offset="100%" stopColor={shade(oc.main, -18)} />
        </linearGradient>
        <linearGradient id={`pants-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(oc.main, -30)} />
          <stop offset="100%" stopColor={shade(oc.main, -45)} />
        </linearGradient>
        <radialGradient id={`eye-${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={shade(eyeColor, 60)} />
          <stop offset="60%" stopColor={eyeColor} />
          <stop offset="100%" stopColor={shade(eyeColor, -50)} />
        </radialGradient>
        <filter id={`soft-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ==================== AURA GLOW ==================== */}
      <g className={showAura ? "animate-breathe" : ""} style={{ transformOrigin: "150px 210px" }}>
        <ellipse cx={cx} cy={210} rx={155} ry={215} fill={`url(#aura-${uid})`} />
      </g>
      {showAura && progress >= 70 && (
        <g opacity={aura.intensity} style={{ transformOrigin: "150px 210px" }}>
          <ellipse cx={cx} cy={210} rx={135} ry={190} fill="none" stroke={aura.rings} strokeWidth="1.5" strokeDasharray="6 12" opacity="0.6" />
          <ellipse cx={cx} cy={210} rx={120} ry={170} fill="none" stroke={aura.inner} strokeWidth="1" strokeDasharray="3 16" opacity="0.4" />
          {/* Floating Particles */}
          {[
            { x: 80, y: 120, r: 2 }, { x: 230, y: 160, r: 1.5 }, { x: 60, y: 300, r: 2.5 }, { x: 240, y: 320, r: 1.8 }
          ].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={aura.inner} opacity={0.4 + energy * 0.4} />
          ))}
        </g>
      )}

      {/* ==================== BACK HAIR ==================== */}
      {hairStyle === "long" && (
        <path d={`M ${cx - face.rx - 8} ${headCy - 8} C ${cx - face.rx - 26} ${headCy + 30}, ${cx - face.rx - 30} ${headCy + 80}, ${cx - 38} ${headCy + 130} Q ${cx - 36} ${headCy + 155}, ${cx - 28} ${headCy + 165} C ${cx - 22} ${headCy + 170}, ${cx - 10} ${headCy + 160}, ${cx - 6} ${headCy + 145} L ${cx + 6} ${headCy + 145} C ${cx + 10} ${headCy + 160}, ${cx + 22} ${headCy + 170}, ${cx + 28} ${headCy + 165} Q ${cx + 36} ${headCy + 155}, ${cx + 38} ${headCy + 130} C ${cx + face.rx + 30} ${headCy + 80}, ${cx + face.rx + 26} ${headCy + 30}, ${cx + face.rx + 8} ${headCy - 8} Z`} fill={`url(#hair-${uid})`} />
      )}
      {hairStyle === "curly" && (
        <g fill={`url(#hair-${uid})`}>
          {[{ dx: -48, dy: -30, r: 24 }, { dx: -30, dy: -40, r: 22 }, { dx: -8, dy: -42, r: 23 }, { dx: 14, dy: -40, r: 22 }, { dx: 36, dy: -30, r: 24 }, { dx: -50, dy: -6, r: 22 }, { dx: -44, dy: 18, r: 20 }, { dx: -38, dy: 40, r: 18 }, { dx: 50, dy: -6, r: 22 }, { dx: 44, dy: 18, r: 20 }, { dx: 38, dy: 40, r: 18 }, { dx: -20, dy: 56, r: 16 }, { dx: 0, dy: 60, r: 17 }, { dx: 20, dy: 56, r: 16 }].map((c, i) => (
            <circle key={i} cx={cx + c.dx} cy={headCy + c.dy} r={c.r} />
          ))}
        </g>
      )}
      {hairStyle === "futuristic" && (
        <g fill={`url(#hair-${uid})`}>
          <path d={`M ${cx - face.rx - 2} ${headCy} L ${cx - face.rx - 14} ${headCy - 30} L ${cx - face.rx + 8} ${headCy - 20} L ${cx - 20} ${headCy - 44} L ${cx - 4} ${headCy - 32} L ${cx + 4} ${headCy - 50} L ${cx + 20} ${headCy - 44} L ${cx + face.rx - 8} ${headCy - 20} L ${cx + face.rx + 14} ${headCy - 30} L ${cx + face.rx + 2} ${headCy} Z`} />
        </g>
      )}

      {/* ==================== BODY (skin) ==================== */}
      <path d={leftLeg} fill={`url(#skin-${uid})`} />
      <path d={rightLeg} fill={`url(#skin-${uid})`} />
      <path d={leftArm} fill={`url(#skin-${uid})`} />
      <path d={rightArm} fill={`url(#skin-${uid})`} />
      <path d={torsoPath} fill={`url(#skin-${uid})`} />
      
      {/* Anatomical Details (Collarbones & Muscles) */}
      {(bodyType === "athletic" || bodyType === "muscular") && (
        <g opacity="0.15" stroke={skinDark} strokeWidth="2" fill="none">
          <path d={`M ${cx - 24} ${shoulderY - 4} Q ${cx - 14} ${shoulderY + 14}, ${cx - 6} ${shoulderY + 20}`} />
          <path d={`M ${cx + 24} ${shoulderY - 4} Q ${cx + 14} ${shoulderY + 14}, ${cx + 6} ${shoulderY + 20}`} />
        </g>
      )}
      <path d={`M ${cx - 20} ${shoulderY - 8} Q ${cx} ${shoulderY + 4}, ${cx + 20} ${shoulderY - 8}`} fill="none" stroke={skinDark} strokeWidth="1.5" opacity="0.2" />
      
      {/* Neck */}
      <rect x={cx - 14} y={headCy + face.chin - 10} width={28} height={36} rx={10} fill={skinTone} />
      <rect x={cx - 14} y={headCy + face.chin - 10} width={28} height={12} fill={skinDark} opacity="0.3" />
      
      {/* Hands */}
      <ellipse cx={cx - shoulderX - m.arm / 2 + 4} cy={armWristY} rx={m.arm * 0.8} ry={m.arm * 0.6 + 4} fill={`url(#skin-${uid})`} />
      <ellipse cx={cx + shoulderX + m.arm / 2 - 4} cy={armWristY} rx={m.arm * 0.8} ry={m.arm * 0.6 + 4} fill={`url(#skin-${uid})`} />

      {/* ==================== PANTS & SHOES ==================== */}
      <path d={leftLeg} fill={`url(#pants-${uid})`} />
      <path d={rightLeg} fill={`url(#pants-${uid})`} />
      
      {/* Pants Details based on Outfit */}
      {outfit === "casual" && (
        <>
          <rect x={cx - hipHalf} y={hipY - 2} width={hipHalf * 2} height={14} rx={4} fill={shade(oc.main, -35)} />
          <line x1={cx} y1={hipY + 12} x2={cx} y2={legBottom} stroke={shade(oc.main, -40)} strokeWidth="1.5" opacity="0.4" />
          {/* Stacked Cuff */}
          <rect x={cx - legGap - legTopHalf - 2} y={legBottom - 16} width={legTopHalf + 6} height={18} rx={2} fill={shade(oc.main, -25)} />
          <rect x={cx + legGap - 4} y={legBottom - 16} width={legTopHalf + 6} height={18} rx={2} fill={shade(oc.main, -25)} />
        </>
      )}
      {outfit === "sporty" && (
        <>
          <path d={`M ${cx - hipHalf} ${hipY - 2} L ${cx + hipHalf} ${hipY - 2} L ${cx + hipHalf - 10} ${hipY + 16} L ${cx - hipHalf + 10} ${hipY + 16} Z`} fill={oc.accent} opacity="0.8" />
          <line x1={cx - legGap - legTopHalf/2} y1={hipY + 20} x2={cx - legGap - legTopHalf/2} y2={legBottom - 10} stroke={shade(oc.main, -50)} strokeWidth="3" opacity="0.6" />
          <line x1={cx + legGap + legTopHalf/2} y1={hipY + 20} x2={cx + legGap + legTopHalf/2} y2={legBottom - 10} stroke={shade(oc.main, -50)} strokeWidth="3" opacity="0.6" />
        </>
      )}
      {outfit === "formal" && (
        <>
          <rect x={cx - hipHalf} y={hipY - 2} width={hipHalf * 2} height={18} rx={2} fill={shade(oc.main, -30)} />
          {/* Creases */}
          <path d={`M ${cx - legGap - legTopHalf/2} ${hipY + 20} L ${cx - legGap - legTopHalf/2 + 4} ${legBottom - 20}`} stroke={shade(oc.main, 20)} strokeWidth="1" opacity="0.3" />
          <path d={`M ${cx + legGap + legTopHalf/2} ${hipY + 20} L ${cx + legGap + legTopHalf/2 - 4} ${legBottom - 20}`} stroke={shade(oc.main, 20)} strokeWidth="1" opacity="0.3" />
          {/* Belt */}
          <rect x={cx - waistHalf - 2} y={waistY - 6} width={waistHalf * 2 + 4} height={10} rx={2} fill="#111" stroke={oc.accent} strokeWidth="1" />
          <rect x={cx - 5} y={waistY - 5} width={10} height={8} rx={1} fill={oc.accent} />
        </>
      )}
      {(outfit === "minimalist" || outfit === "futuristic") && (
        <>
          <rect x={cx - hipHalf} y={hipY - 2} width={hipHalf * 2} height={12} rx={3} fill={shade(oc.main, -20)} />
          {outfit === "futuristic" && <line x1={cx - hipHalf + 4} y1={hipY + 4} x2={cx + hipHalf - 4} y2={hipY + 4} stroke={oc.accent} strokeWidth="1" opacity="0.8" />}
        </>
      )}

      {renderShoes()}

      {/* ==================== OUTFIT (Torso & Sleeves) ==================== */}
      <path d={torsoPath} fill={`url(#outfit-${uid})`} />
      
      {/* Modern Drop-Shoulder Sleeves */}
      <path d={`M ${cx - shoulderX + 4} ${armTopY} Q ${cx - shoulderX - m.arm - 4} ${armTopY + 50}, ${cx - shoulderX - m.arm + 4} ${armTopY + 80} L ${cx - shoulderX + m.arm} ${armTopY + 74} Q ${cx - shoulderX + 8} ${armTopY + 50}, ${cx - shoulderX + 16} ${armTopY + 6} Z`} fill={`url(#outfit-${uid})`} />
      <path d={`M ${cx + shoulderX - 4} ${armTopY} Q ${cx + shoulderX + m.arm + 4} ${armTopY + 50}, ${cx + shoulderX + m.arm - 4} ${armTopY + 80} L ${cx + shoulderX - m.arm} ${armTopY + 74} Q ${cx + shoulderX - 8} ${armTopY + 50}, ${cx + shoulderX - 16} ${armTopY + 6} Z`} fill={`url(#outfit-${uid})`} />

      {/* --- OUTFIT SPECIFIC STYLING --- */}
      
      {/* CASUAL: Oversized Tee, Pocket, Drop Seam */}
      {outfit === "casual" && (
        <g>
          <path d={`M ${cx - 22} ${shoulderY - 12} L ${cx - 16} ${shoulderY + 8} L ${cx + 16} ${shoulderY + 8} L ${cx + 22} ${shoulderY - 12}`} fill="none" stroke={shade(oc.main, -20)} strokeWidth="2" opacity="0.5" />
          {/* Chest Pocket */}
          <rect x={cx + 12} y={shoulderY + 24} width={18} height={16} rx={2} fill="none" stroke={shade(oc.main, -15)} strokeWidth="1.5" opacity="0.6" />
          <line x1={cx + 21} y1={shoulderY + 24} x2={cx + 21} y2={shoulderY + 34} stroke={shade(oc.main, -15)} strokeWidth="1" opacity="0.4" />
          {/* Seam lines */}
          <path d={`M ${cx - 8} ${shoulderY - 14} L ${cx - 14} ${waistY}`} stroke={shade(oc.main, 15)} strokeWidth="1" opacity="0.2" />
          <path d={`M ${cx + 8} ${shoulderY - 14} L ${cx + 14} ${waistY}`} stroke={shade(oc.main, 15)} strokeWidth="1" opacity="0.2" />
        </g>
      )}

      {/* SPORTY: Zip, Mesh lines, Tech Patches */}
      {outfit === "sporty" && (
        <g>
          {/* High Collar */}
          <path d={`M ${cx - 18} ${shoulderY - 16} Q ${cx} ${shoulderY - 28}, ${cx + 18} ${shoulderY - 16}`} fill={oc.secondary} stroke={oc.accent} strokeWidth="1" />
          {/* Zipper */}
          <line x1={cx} y1={shoulderY - 20} x2={cx} y2={waistY - 10} stroke={oc.accent} strokeWidth="2" opacity="0.8" />
          <circle cx={cx} cy={shoulderY + 20} r={3} fill={oc.accent} />
          {/* Side Mesh Cutouts */}
          <path d={`M ${cx - shoulderX + 10} ${shoulderY + 30} L ${cx - waistHalf + 6} ${waistY - 20} L ${cx - waistHalf + 14} ${waistY - 20} L ${cx - shoulderX + 18} ${shoulderY + 30} Z`} fill={oc.main} stroke={oc.accent} strokeWidth="1" opacity="0.7" />
          <path d={`M ${cx + shoulderX - 10} ${shoulderY + 30} L ${cx + waistHalf - 6} ${waistY - 20} L ${cx + waistHalf - 14} ${waistY - 20} L ${cx + shoulderX - 18} ${shoulderY + 30} Z`} fill={oc.main} stroke={oc.accent} strokeWidth="1" opacity="0.7" />
          {/* Tech Logo placeholder */}
          <path d={`M ${cx - 12} ${shoulderY + 50} L ${cx} ${shoulderY + 44} L ${cx + 12} ${shoulderY + 50} L ${cx} ${shoulderY + 56} Z`} fill="none" stroke={oc.accent} strokeWidth="1.5" />
        </g>
      )}

      {/* FORMAL: Tailored Suit, Lapels, Pocket Square, Buttons */}
      {outfit === "formal" && (
        <g>
          {/* Suit Lapels */}
          <path d={`M ${cx - 2} ${shoulderY - 10} L ${cx - 30} ${shoulderY + 60} L ${cx - 18} ${shoulderY + 60} L ${cx - 2} ${shoulderY + 30} Z`} fill={shade(oc.main, -15)} />
          <path d={`M ${cx + 2} ${shoulderY - 10} L ${cx + 30} ${shoulderY + 60} L ${cx + 18} ${shoulderY + 60} L ${cx + 2} ${shoulderY + 30} Z`} fill={shade(oc.main, -15)} />
          {/* Under Shirt & Tie */}
          <rect x={cx - 8} y={shoulderY - 8} width={16} height={waistY - shoulderY + 8} fill={shade(oc.main, 30)} />
          <path d={`M ${cx - 4} ${shoulderY + 10} L ${cx} ${shoulderY + 30} L ${cx + 4} ${shoulderY + 10} L ${cx + 3} ${shoulderY + 70} L ${cx - 3} ${shoulderY + 70} Z`} fill={oc.accent} />
          {/* Buttons */}
          {[0, 1, 2].map(i => (
            <circle key={i} cx={cx + 20} cy={shoulderY + 50 + i * 28} r={2.5} fill={shade(oc.main, 20)} stroke={oc.accent} strokeWidth="0.8" />
          ))}
          {/* Pocket Square */}
          <path d={`M ${cx - 28} ${shoulderY + 20} L ${cx - 16} ${shoulderY + 18} L ${cx - 22} ${shoulderY + 30} L ${cx - 32} ${shoulderY + 28} Z`} fill={oc.accent} opacity="0.9" />
          {/* Split Tails */}
          <path d={`M ${cx - 4} ${waistY - 10} L ${cx - 12} ${waistY + 20} L ${cx - 2} ${waistY + 16} Z`} fill={shade(oc.main, -10)} />
          <path d={`M ${cx + 4} ${waistY - 10} L ${cx + 12} ${waistY + 20} L ${cx + 2} ${waistY + 16} Z`} fill={shade(oc.main, -10)} />
        </g>
      )}

      {/* FUTURISTIC: Armor Panels, Reactor Core, Glowing Seams */}
      {outfit === "futuristic" && (
        <g>
          {/* High Tech Collar */}
          <path d={`M ${cx - 26} ${shoulderY - 18} Q ${cx} ${shoulderY - 36}, ${cx + 26} ${shoulderY - 18}`} fill={oc.secondary} stroke={oc.accent} strokeWidth="1.5" />
          {/* Shoulder Armor */}
          <path d={`M ${cx - shoulderX + 2} ${armTopY} L ${cx - shoulderX - 10} ${armTopY + 30} L ${cx - shoulderX + 20} ${armTopY + 40} L ${cx - shoulderX + 14} ${armTopY} Z`} fill={shade(oc.main, -10)} stroke={oc.accent} strokeWidth="1.2" />
          <path d={`M ${cx + shoulderX - 2} ${armTopY} L ${cx + shoulderX + 10} ${armTopY + 30} L ${cx + shoulderX - 20} ${armTopY + 40} L ${cx + shoulderX - 14} ${armTopY} Z`} fill={shade(oc.main, -10)} stroke={oc.accent} strokeWidth="1.2" />
          {/* Chest Reactor */}
          <circle cx={cx} cy={shoulderY + 50} r={16} fill={shade(oc.main, -30)} stroke={oc.accent} strokeWidth="2" />
          <circle cx={cx} cy={shoulderY + 50} r={10} fill={oc.accent} opacity={0.3 + energy * 0.6} filter={`url(#glow-${uid})`} />
          <circle cx={cx} cy={shoulderY + 50} r={4} fill={oc.accent} />
          {/* Glowing Seams */}
          <path d={`M ${cx - 20} ${shoulderY - 10} L ${cx - waistHalf + 8} ${waistY}`} stroke={oc.accent} strokeWidth="1.2" opacity="0.6" />
          <path d={`M ${cx + 20} ${shoulderY - 10} L ${cx + waistHalf - 8} ${waistY}`} stroke={oc.accent} strokeWidth="1.2" opacity="0.6" />
          <line x1={cx} y1={shoulderY + 68} x2={cx} y2={waistY - 10} stroke={oc.accent} strokeWidth="1" opacity="0.4" />
          {/* Hex Decals */}
          <path d={`M ${cx - 22} ${shoulderY + 100} L ${cx - 18} ${shoulderY + 96} L ${cx - 14} ${shoulderY + 100} L ${cx - 14} ${shoulderY + 106} L ${cx - 18} ${shoulderY + 110} L ${cx - 22} ${shoulderY + 106} Z`} fill="none" stroke={oc.accent} strokeWidth="1" opacity="0.5" />
        </g>
      )}

      {/* MINIMALIST: Turtleneck, Clean Seams */}
      {outfit === "minimalist" && (
        <g>
          {/* Turtleneck */}
          <rect x={cx - 16} y={shoulderY - 30} width={32} height={28} rx={8} fill={shade(oc.main, 10)} />
          <line x1={cx - 16} y1={shoulderY - 14} x2={cx + 16} y2={shoulderY - 14} stroke={shade(oc.main, -10)} strokeWidth="1.5" opacity="0.5" />
          {/* Subtle Yoke */}
          <path d={`M ${cx - shoulderX + 16} ${armTopY + 4} Q ${cx} ${shoulderY + 20}, ${cx + shoulderX - 16} ${armTopY + 4}`} fill="none" stroke={shade(oc.main, -15)} strokeWidth="1.5" opacity="0.4" />
          {/* Bottom Hem Slit */}
          <line x1={cx} y1={waistY - 20} x2={cx} y2={waistY} stroke={shade(oc.main, -20)} strokeWidth="2" opacity="0.6" />
          {/* Single Accent Stripe */}
          <line x1={cx - waistHalf + 4} y1={waistY - 4} x2={cx + waistHalf - 4} y2={waistY - 4} stroke={oc.accent} strokeWidth="2" opacity="0.4" />
        </g>
      )}

      {/* ==================== ACCESSORIES (Body) ==================== */}
      {accessories.wristTech && (
        <g>
          <rect x={cx + shoulderX + m.arm - m.arm/2 - 8} y={armWristY - 14} width={m.arm + 16} height={24} rx={6} fill="#0a0e17" stroke="#06d6c7" strokeWidth="1.5" />
          <rect x={cx + shoulderX + m.arm - m.arm/2 - 4} y={armWristY - 10} width={m.arm + 8} height={16} rx={3} fill="#0f1923" />
          <rect x={cx + shoulderX + m.arm - m.arm/2 - 2} y={armWristY - 8} width={m.arm + 4} height={12} rx={2} fill="#06d6c7" opacity={0.6 + energy * 0.4} />
          {/* Band holes */}
          {[0, 1, 2].map(i => (
            <circle key={i} cx={cx + shoulderX + m.arm - m.arm/2 - 5} cy={armWristY + 12 + i * 5} r={1} fill="#06d6c7" opacity="0.5" />
          ))}
        </g>
      )}

      {/* ==================== HEAD ==================== */}
      <circle cx={cx - face.rx + 4} cy={eyeY + 6} r={9} fill={`url(#skin-${uid})`} />
      <circle cx={cx - face.rx + 4} cy={eyeY + 6} r={5} fill={skinDark} opacity="0.2" />
      <circle cx={cx + face.rx - 4} cy={eyeY + 6} r={9} fill={`url(#skin-${uid})`} />
      <circle cx={cx + face.rx - 4} cy={eyeY + 6} r={5} fill={skinDark} opacity="0.2" />

      {faceShape === "square" ? (
        <rect x={cx - face.rx} y={headCy - face.ry} width={face.rx * 2} height={face.ry + face.chin} rx={20} fill={`url(#skin-${uid})`} />
      ) : faceShape === "sharp" ? (
        <path d={`M ${cx - face.rx} ${headCy - 14} Q ${cx - face.rx} ${headCy - face.ry}, ${cx} ${headCy - face.ry} Q ${cx + face.rx} ${headCy - face.ry}, ${cx + face.rx} ${headCy - 14} L ${cx + face.rx * 0.7} ${headCy + face.chin - 18} Q ${cx} ${headCy + face.chin + 6}, ${cx - face.rx * 0.7} ${headCy + face.chin - 18} Z`} fill={`url(#skin-${uid})`} />
      ) : (
        <path d={`M ${cx - face.rx} ${headCy} Q ${cx - face.rx} ${headCy - face.ry}, ${cx} ${headCy - face.ry} Q ${cx + face.rx} ${headCy - face.ry}, ${cx + face.rx} ${headCy} Q ${cx + face.rx * face.jaw} ${headCy + face.chin}, ${cx} ${headCy + face.chin + 4} Q ${cx - face.rx * face.jaw} ${headCy + face.chin}, ${cx - face.rx} ${headCy} Z`} fill={`url(#skin-${uid})`} />
      )}

      {/* Advanced Facial Shading */}
      <ellipse cx={cx + 24} cy={eyeY + 20} rx={11} ry={8} fill={skinDark} opacity="0.15" />
      <ellipse cx={cx - 24} cy={eyeY + 20} rx={11} ry={8} fill={skinDark} opacity="0.15" />
      <path d={`M ${cx - 10} ${eyeY + 22} L ${cx} ${eyeY + 24} L ${cx + 10} ${eyeY + 22}`} fill="none" stroke={skinDark} strokeWidth="1" opacity="0.15" />
      
      {/* Eyebrows */}
      <path d={`M ${cx - eyeDx - 10} ${eyeY - 13 + mt.browY} Q ${cx - eyeDx} ${eyeY - 19 + mt.browY}, ${cx - eyeDx + 10} ${eyeY - 13 + mt.browY}`} fill="none" stroke={hairDark} strokeWidth="3.5" strokeLinecap="round" />
      <path d={`M ${cx + eyeDx - 10} ${eyeY - 13 + mt.browY} Q ${cx + eyeDx} ${eyeY - 19 + mt.browY}, ${cx + eyeDx + 10} ${eyeY - 13 + mt.browY}`} fill="none" stroke={hairDark} strokeWidth="3.5" strokeLinecap="round" />

      {/* Eyes */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M ${cx + s * eyeDx - eyeRx - 1} ${eyeY} Q ${cx + s * eyeDx} ${eyeY - eyeRy - 2}, ${cx + s * eyeDx + eyeRx + 1} ${eyeY} Q ${cx + s * eyeDx} ${eyeY + eyeRy + 2}, ${cx + s * eyeDx - eyeRx - 1} ${eyeY} Z`} fill="#f4f8ff" />
          <circle cx={cx + s * eyeDx} cy={eyeY} r={Math.min(eyeRy, 6)} fill={`url(#eye-${uid})`} />
          <circle cx={cx + s * eyeDx} cy={eyeY} r={2.8} fill="#080c18" />
          <circle cx={cx + s * eyeDx - 2} cy={eyeY - 2} r={1.8} fill="#ffffff" opacity={0.6 + mt.spark * 0.4 * (0.5 + energy / 2)} />
          <circle cx={cx + s * eyeDx + 1.5} cy={eyeY + 1.5} r={0.8} fill="#ffffff" opacity="0.3" />
          {/* Upper Eyelid Line */}
          <path d={`M ${cx + s * eyeDx - eyeRx - 1} ${eyeY - 0.5} Q ${cx + s * eyeDx} ${eyeY - eyeRy - 2}, ${cx + s * eyeDx + eyeRx + 1} ${eyeY - 0.5}`} fill="none" stroke={hairDark} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      ))}

      {/* Nose */}
      <path d={`M ${cx - 3} ${eyeY + 6} Q ${cx - 5} ${eyeY + 18}, ${cx - 4} ${eyeY + 21} Q ${cx} ${eyeY + 24}, ${cx + 4} ${eyeY + 21} Q ${cx + 5} ${eyeY + 18}, ${cx + 3} ${eyeY + 6}`} fill="none" stroke={skinDark} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      <circle cx={cx - 3} cy={eyeY + 20} r={1.5} fill={skinDark} opacity="0.15" />
      <circle cx={cx + 3} cy={eyeY + 20} r={1.5} fill={skinDark} opacity="0.15" />

      {/* Mouth & Lips */}
      <path d={mouthPath} fill="none" stroke={lipColor} strokeWidth="3" strokeLinecap="round" />
      {mt.smile > 0.3 && (
        <path d={`M ${cx - 12} ${mouthY + 1} Q ${cx} ${mouthY + mouthCurve}, ${cx + 12} ${mouthY + 1} Q ${cx} ${mouthY + 3}, ${cx - 12} ${mouthY + 1} Z`} fill={lipColor} opacity="0.4" />
      )}

      {/* ==================== FRONT HAIR ==================== */}
      {hairStyle === "short" && (
        <g>
          <path d={`M ${cx - face.rx - 4} ${headCy - 4} C ${cx - face.rx - 8} ${headCy - face.ry - 14}, ${cx - 20} ${headCy - face.ry - 22}, ${cx} ${headCy - face.ry - 18} C ${cx + 20} ${headCy - face.ry - 22}, ${cx + face.rx + 8} ${headCy - face.ry - 14}, ${cx + face.rx + 4} ${headCy - 4} C ${cx + face.rx - 8} ${headCy - 16}, ${cx + 10} ${headCy - 26}, ${cx} ${headCy - 22} C ${cx - 10} ${headCy - 26}, ${cx - face.rx + 8} ${headCy - 16}, ${cx - face.rx - 4} ${headCy - 4} Z`} fill={`url(#hair-${uid})`} />
          <path d={`M ${cx - 16} ${headCy - face.ry - 4} C ${cx - 24} ${headCy - face.ry - 26}, ${cx + 8} ${headCy - face.ry - 32}, ${cx + 22} ${headCy - face.ry - 22} C ${cx + 28} ${headCy - face.ry - 16}, ${cx + 18} ${headCy - face.ry - 6}, ${cx + 4} ${headCy - face.ry - 8} C ${cx - 6} ${headCy - face.ry - 10}, ${cx - 12} ${headCy - face.ry - 8}, ${cx - 16} ${headCy - face.ry - 4} Z`} fill={`url(#hair-h-${uid})`} />
          <path d={`M ${cx - 8} ${headCy - face.ry - 6} Q ${cx - 2} ${headCy - face.ry - 18}, ${cx + 6} ${headCy - face.ry - 14}`} fill="none" stroke={hairDark} strokeWidth="1.2" opacity="0.25" />
          <path d={`M ${cx - face.rx - 1} ${headCy - 4} Q ${cx - face.rx - 3} ${headCy + 4}, ${cx - face.rx + 2} ${headCy + 14}`} fill="none" stroke={hairDark} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d={`M ${cx + face.rx + 1} ${headCy - 4} Q ${cx + face.rx + 3} ${headCy + 4}, ${cx + face.rx - 2} ${headCy + 14}`} fill="none" stroke={hairDark} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        </g>
      )}
      {hairStyle === "long" && (
        <g>
          <path d={`M ${cx - face.rx - 6} ${headCy + 2} C ${cx - face.rx - 10} ${headCy - face.ry - 16}, ${cx - 16} ${headCy - face.ry - 24}, ${cx} ${headCy - face.ry - 20} C ${cx + 16} ${headCy - face.ry - 24}, ${cx + face.rx + 10} ${headCy - face.ry - 16}, ${cx + face.rx + 6} ${headCy + 2} C ${cx + face.rx - 4} ${headCy - 14}, ${cx + 12} ${headCy - 28}, ${cx} ${headCy - 24} C ${cx - 12} ${headCy - 28}, ${cx - face.rx + 4} ${headCy - 14}, ${cx - face.rx - 6} ${headCy + 2} Z`} fill={`url(#hair-${uid})`} />
          <path d={`M ${cx - face.rx - 2} ${headCy - 6} C ${cx - face.rx - 6} ${headCy + 10}, ${cx - face.rx - 10} ${headCy + 40}, ${cx - face.rx - 4} ${headCy + 70} Q ${cx - face.rx} ${headCy + 80}, ${cx - face.rx + 8} ${headCy + 75} Q ${cx - face.rx + 4} ${headCy + 50}, ${cx - face.rx + 6} ${headCy + 20} C ${cx - face.rx + 4} ${headCy + 8}, ${cx - face.rx + 2} ${headCy}, ${cx - face.rx + 4} ${headCy - 4} Z`} fill={`url(#hair-h-${uid})`} />
          <path d={`M ${cx + face.rx + 2} ${headCy - 6} C ${cx + face.rx + 6} ${headCy + 10}, ${cx + face.rx + 10} ${headCy + 40}, ${cx + face.rx + 4} ${headCy + 70} Q ${cx + face.rx} ${headCy + 80}, ${cx + face.rx - 8} ${headCy + 75} Q ${cx + face.rx - 4} ${headCy + 50}, ${cx + face.rx - 6} ${headCy + 20} C ${cx + face.rx - 4} ${headCy + 8}, ${cx + face.rx - 2} ${headCy}, ${cx + face.rx - 4} ${headCy - 4} Z`} fill={`url(#hair-h-${uid})`} />
        </g>
      )}
      {hairStyle === "curly" && (
        <g fill={`url(#hair-${uid})`}>
          {[{ dx: -34, dy: -38, r: 18 }, { dx: -14, dy: -44, r: 20 }, { dx: 8, dy: -44, r: 20 }, { dx: 28, dy: -38, r: 18 }, { dx: -42, dy: -14, r: 16 }, { dx: -24, dy: -20, r: 17 }, { dx: -4, dy: -22, r: 17 }, { dx: 16, dy: -20, r: 17 }, { dx: 36, dy: -14, r: 16 }].map((c, i) => (
            <circle key={i} cx={cx + c.dx} cy={headCy + c.dy} r={c.r} />
          ))}
        </g>
      )}
      {hairStyle === "fade" && (
        <g>
          <path d={`M ${cx - face.rx + 2} ${headCy - 4} C ${cx - face.rx - 4} ${headCy - face.ry - 10}, ${cx - 14} ${headCy - face.ry - 20}, ${cx} ${headCy - face.ry - 18} C ${cx + 14} ${headCy - face.ry - 20}, ${cx + face.rx + 4} ${headCy - face.ry - 10}, ${cx + face.rx - 2} ${headCy - 4} C ${cx + face.rx - 10} ${headCy - 18}, ${cx + 8} ${headCy - 24}, ${cx} ${headCy - 22} C ${cx - 8} ${headCy - 24}, ${cx - face.rx + 10} ${headCy - 18}, ${cx - face.rx + 2} ${headCy - 4} Z`} fill={`url(#hair-${uid})`} />
          <path d={`M ${cx - face.rx - 2} ${headCy - 2} C ${cx - face.rx} ${headCy - 12}, ${cx - face.rx + 6} ${headCy - 16}, ${cx - face.rx + 8} ${headCy - 8} L ${cx - face.rx + 4} ${headCy + 16} L ${cx - face.rx - 1} ${headCy + 16} Z`} fill={hairDark} opacity="0.45" />
          <path d={`M ${cx + face.rx + 2} ${headCy - 2} C ${cx + face.rx} ${headCy - 12}, ${cx + face.rx - 6} ${headCy - 16}, ${cx + face.rx - 8} ${headCy - 8} L ${cx + face.rx - 4} ${headCy + 16} L ${cx + face.rx + 1} ${headCy + 16} Z`} fill={hairDark} opacity="0.45" />
        </g>
      )}
      {hairStyle === "bun" && (
        <g>
          <path d={`M ${cx - face.rx - 2} ${headCy - 2} C ${cx - face.rx - 6} ${headCy - face.ry - 10}, ${cx - 12} ${headCy - face.ry - 18}, ${cx} ${headCy - face.ry - 16} C ${cx + 12} ${headCy - face.ry - 18}, ${cx + face.rx + 6} ${headCy - face.ry - 10}, ${cx + face.rx + 2} ${headCy - 2} C ${cx + face.rx - 6} ${headCy - 14}, ${cx + 6} ${headCy - 22}, ${cx} ${headCy - 20} C ${cx - 6} ${headCy - 22}, ${cx - face.rx + 6} ${headCy - 14}, ${cx - face.rx - 2} ${headCy - 2} Z`} fill={`url(#hair-${uid})`} />
          <ellipse cx={cx} cy={headCy - face.ry - 10} rx={20} ry={10} fill={hairMid} />
          <circle cx={cx} cy={headCy - face.ry - 26} r={18} fill={`url(#hair-h-${uid})`} />
          <line x1={cx - 14} y1={headCy - face.ry - 30} x2={cx + 16} y2={headCy - face.ry - 22} stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          <circle cx={cx + 16} cy={headCy - face.ry - 22} r={2.5} fill={hairLight} opacity="0.6" />
        </g>
      )}
      {hairStyle === "futuristic" && (
        <g fill={`url(#hair-${uid})`}>
          <path d={`M ${cx - face.rx - 2} ${headCy - 2} C ${cx - face.rx - 4} ${headCy - face.ry - 8}, ${cx - face.rx + 8} ${headCy - face.ry - 12}, ${cx - face.rx + 10} ${headCy - 6} L ${cx - face.rx + 6} ${headCy + 12} L ${cx - face.rx - 1} ${headCy + 12} Z`} />
          <path d={`M ${cx + face.rx + 2} ${headCy - 2} C ${cx + face.rx + 4} ${headCy - face.ry - 8}, ${cx + face.rx - 8} ${headCy - face.ry - 12}, ${cx + face.rx - 10} ${headCy - 6} L ${cx + face.rx - 6} ${headCy + 12} L ${cx + face.rx + 1} ${headCy + 12} Z`} />
          <path d={`M ${cx - 18} ${headCy - 8} L ${cx - 14} ${headCy - face.ry - 28} L ${cx - 6} ${headCy - face.ry - 38} L ${cx + 2} ${headCy - face.ry - 42} L ${cx + 10} ${headCy - face.ry - 36} L ${cx + 16} ${headCy - face.ry - 24} L ${cx + 20} ${headCy - 8} C ${cx + 14} ${headCy - 16}, ${cx - 12} ${headCy - 16}, ${cx - 18} ${headCy - 8} Z`} fill={`url(#hair-h-${uid})`} />
          <circle cx={cx + 2} cy={headCy - face.ry - 42} r={3} fill={hairLight} opacity={0.5 + energy * 0.5} filter={`url(#soft-${uid})`} />
        </g>
      )}

      {/* ==================== ACCESSORIES (Front) ==================== */}
      {accessories.glasses && (
        <g>
          {/* Thick Modern Frames */}
          <rect x={cx - eyeDx - 10} y={eyeY - 9} width={20} height={18} rx={6} fill="rgba(20,30,50,0.15)" stroke="#0f172a" strokeWidth="3" />
          <rect x={cx + eyeDx - 10} y={eyeY - 9} width={20} height={18} rx={6} fill="rgba(20,30,50,0.15)" stroke="#0f172a" strokeWidth="3" />
          {/* Bridge */}
          <path d={`M ${cx - eyeDx + 10} ${eyeY - 2} Q ${cx} ${eyeY - 6}, ${cx + eyeDx - 10} ${eyeY - 2}`} fill="none" stroke="#0f172a" strokeWidth="2.5" />
          {/* Temples */}
          <line x1={cx - eyeDx - 10} y1={eyeY - 4} x2={cx - face.rx + 4} y2={eyeY - 6} stroke="#0f172a" strokeWidth="2.5" />
          <line x1={cx + eyeDx + 10} y1={eyeY - 4} x2={cx + face.rx - 4} y2={eyeY - 6} stroke="#0f172a" strokeWidth="2.5" />
          {/* Lens Glare */}
          <path d={`M ${cx - eyeDx - 6} ${eyeY - 6} L ${cx - eyeDx - 2} ${eyeY - 8} L ${cx - eyeDx + 2} ${eyeY - 4} Z`} fill="white" opacity="0.2" />
          <path d={`M ${cx + eyeDx - 6} ${eyeY - 6} L ${cx + eyeDx - 2} ${eyeY - 8} L ${cx + eyeDx + 2} ${eyeY - 4} Z`} fill="white" opacity="0.2" />
        </g>
      )}
      {accessories.headset && (
        <g>
          <path d={`M ${cx - face.rx - 6} ${eyeY} Q ${cx} ${headCy - face.ry - 34}, ${cx + face.rx + 6} ${eyeY}`} fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
          {/* Premium Ear Cups */}
          <rect x={cx - face.rx - 14} y={eyeY - 10} width={16} height={28} rx={7} fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <rect x={cx - face.rx - 11} y={eyeY - 6} width={10} height={20} rx={4} fill="#06d6c7" opacity="0.8" />
          <rect x={cx + face.rx - 2} y={eyeY - 10} width={16} height={28} rx={7} fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <rect x={cx + face.rx + 1} y={eyeY - 6} width={10} height={20} rx={4} fill="#06d6c7" opacity="0.8" />
          {/* Boom Mic */}
          <path d={`M ${cx + face.rx + 6} ${eyeY + 16} Q ${cx + 28} ${eyeY + 34}, ${cx + 16} ${mouthY - 4}`} fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <rect x={cx + 10} y={mouthY - 10} width={14} height={10} rx={4} fill="#1e293b" stroke="#06d6c7" strokeWidth="1" />
        </g>
      )}
      {accessories.necklace && (
        <g>
          {/* Chain Texture */}
          <path d={`M ${cx - 20} ${headCy + face.chin + 14} Q ${cx - 10} ${headCy + face.chin + 36}, ${cx} ${headCy + face.chin + 38} Q ${cx + 10} ${headCy + face.chin + 36}, ${cx + 20} ${headCy + face.chin + 14}`} fill="none" stroke={shade("#f5c842", -20)} strokeWidth="3" />
          <path d={`M ${cx - 20} ${headCy + face.chin + 14} Q ${cx - 10} ${headCy + face.chin + 36}, ${cx} ${headCy + face.chin + 38} Q ${cx + 10} ${headCy + face.chin + 36}, ${cx + 20} ${headCy + face.chin + 14}`} fill="none" stroke="#f5c842" strokeWidth="1.5" />
          {/* Modern Pendant */}
          <rect x={cx - 6} y={headCy + face.chin + 32} width={12} height={12} rx={2} fill="#f5c842" stroke="#020509" strokeWidth="1" transform={`rotate(45 ${cx} ${headCy + face.chin + 38})`} />
        </g>
      )}
    </svg>
  )
}