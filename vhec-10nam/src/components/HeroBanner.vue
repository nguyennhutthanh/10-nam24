<template>
  <section id="hero" class="hero">
    <!-- Particle Canvas -->
    <canvas ref="canvasRef" class="hero-canvas"></canvas>

    <!-- Background gradient layers -->
    <div class="hero-bg"></div>
    <div class="hero-radial"></div>

    <!-- Cyber grid -->
    <div class="hero-grid"></div>

    <!-- Scanline overlay -->
    <div class="hero-scanline"></div>

    <!-- Aurora layers -->
    <div class="hero-aurora-1"></div>
    <div class="hero-aurora-2"></div>
    <div class="hero-aurora-3"></div>

    <!-- HUD corner decorations -->
    <div class="hud-corner hud-tl"></div>
    <div class="hud-corner hud-tr"></div>
    <div class="hud-corner hud-bl"></div>
    <div class="hud-corner hud-br"></div>

    <!-- Status bar -->
    <div class="hero-status">
      <span class="status-dot"></span>
      <span class="font-mono">SYS: ONLINE</span>
      <span class="status-sep">|</span>
      <span class="font-mono">VHEC v10.0.0</span>
      <span class="status-sep">|</span>
      <span class="font-mono">{{ currentTime }}</span>
    </div>

    <!-- Content -->
    <div class="hero-content">
      <div class="hero-inner" ref="parallaxRef">
        <!-- Badge -->
        <div class="hero-badge">
          <span class="badge-dot"></span>
          {{ $t('hero.badge') }}
        </div>

        <!-- 10 Year Number -->
        <div class="year-display">
          <span class="year-num">10</span>
          <div class="year-label-wrap">
            <span class="year-label">{{ $t('hero.year') }}</span>
            <span class="year-sublabel">{{ $t('hero.yearSub') }}</span>
          </div>
        </div>

        <!-- Title -->
        <h1 class="hero-title">
          <span class="title-line font-mono">&lt; {{ $t('hero.titleLine') }} /&gt;</span>
          <span class="title-main glow-gold glitch-text" data-text="VHEC">VHEC</span>
        </h1>

        <!-- Subtitle -->
        <p class="hero-subtitle">
          <em class="hero-slogan">{{ $t('hero.slogan') }}</em><br>
          {{ $t('hero.subtitle') }}
        </p>

        <!-- CTA Buttons -->
        <div class="hero-actions">
          <button class="btn btn-gold" @click="emit('scroll-to', 'journey')">
            <span>🗺️</span> {{ $t('hero.btnJourney') }}
          </button>
          <button class="btn btn-outline" @click="goToGame">
            <span>🎮</span> {{ $t('hero.btnGame') }}
          </button>
        </div>

        <!-- Scroll hint -->
        <div class="scroll-hint">
          <div class="scroll-line"></div>
          <span>{{ $t('hero.scrollHint') }}</span>
        </div>
      </div>
    </div>

    <!-- Decorative stars -->
    <div class="star-field">
      <div v-for="i in 20" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['scroll-to'])
const canvasRef = ref(null)
const parallaxRef = ref(null)
const router = useRouter()

// Live clock for status bar
const currentTime = ref('')
let clockTimer = null
function updateClock() {
  currentTime.value = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

let animFrame = null
let particles = []

function handleMouseMove(e) {
  if (!parallaxRef.value) return
  const x = (e.clientX / window.innerWidth - 0.5) * 20
  const y = (e.clientY / window.innerHeight - 0.5) * 10
  parallaxRef.value.style.transform = `translate(${x}px, ${y}px)`
}

function getStarStyle(i) {
  const seed = i * 37
  return {
    left: ((seed * 11 + 7) % 100) + '%',
    top: ((seed * 13 + 3) % 100) + '%',
    width: (1 + (i % 3)) + 'px',
    height: (1 + (i % 3)) + 'px',
    animationDelay: (i * 0.3) + 's',
    animationDuration: (2 + (i % 3)) + 's'
  }
}

function goToGame() {
  router.push('/game')
}

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // Create particles — màu xanh dương VHEC là chủ đạo
  particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.6 + 0.1,
    // 70% xanh dương, 30% vàng gold
    color: Math.random() > 0.3 ? '26, 127, 222' : '201, 162, 39'
  }))

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy

      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`
      ctx.fill()
    })

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(26, 127, 222, ${0.1 * (1 - dist / 100)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    animFrame = requestAnimationFrame(draw)
  }

  draw()
}

onMounted(() => {
  initCanvas()
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
  clearInterval(clockTimer)
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-darkest);
}

.hero-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(13, 31, 60, 0.9) 0%, rgba(2, 8, 16, 0.95) 100%);
  z-index: 1;
}

.hero-radial {
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(0, 87, 184, 0.12) 0%, transparent 70%);
  z-index: 2;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 120px 24px 80px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(26, 127, 222, 0.1);
  border: 1px solid var(--border-blue);
  padding: 8px 20px;
  border-radius: 100px;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  color: var(--blue-light);
  letter-spacing: 1px;
  animation: fadeInUp 0.8s ease 0.2s both;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--blue-bright);
  box-shadow: 0 0 8px var(--blue-bright);
  animation: pulse 2s infinite;
}

.year-display {
  display: flex;
  align-items: center;
  gap: 16px;
  animation: fadeInUp 0.8s ease 0.4s both;
}

.year-num {
  font-family: var(--font-heading);
  font-size: clamp(120px, 20vw, 200px);
  font-weight: 900;
  line-height: 0.85;
  background: linear-gradient(135deg, var(--blue) 0%, var(--blue-bright) 40%, var(--blue-light) 60%, var(--blue-bright) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
  filter: drop-shadow(0 0 40px rgba(0, 87, 184, 0.6));
}

.year-label-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.year-label {
  font-family: var(--font-heading);
  font-size: clamp(28px, 5vw, 52px);
  font-weight: 900;
  color: var(--text-white);
  letter-spacing: 8px;
  line-height: 1;
}

.year-sublabel {
  font-family: var(--font-heading);
  font-size: clamp(10px, 1.5vw, 14px);
  font-weight: 700;
  color: var(--text-gray);
  letter-spacing: 6px;
  margin-top: 4px;
}

.hero-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  animation: fadeInUp 0.8s ease 0.6s both;
}

.title-line {
  font-family: var(--font-heading);
  font-size: clamp(14px, 2vw, 18px);
  font-weight: 600;
  color: var(--text-gray);
  letter-spacing: 8px;
  text-transform: uppercase;
}

.title-main {
  font-family: var(--font-heading);
  font-size: clamp(48px, 10vw, 96px);
  font-weight: 900;
  letter-spacing: 20px;
  background: linear-gradient(135deg, var(--blue-bright), var(--blue-light), var(--gold-light), var(--blue-light));
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
}

.hero-subtitle {
  color: var(--text-gray);
  font-size: clamp(14px, 2vw, 17px);
  line-height: 1.8;
  max-width: 660px;
  animation: fadeInUp 0.8s ease 0.8s both;
}

.hero-slogan {
  color: var(--blue-light);
  font-style: italic;
  font-size: clamp(13px, 1.6vw, 15px);
  font-weight: 500;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  animation: fadeInUp 0.8s ease 1s both;
  margin-top: 8px;
}

.hero-actions .btn {
  padding: 16px 32px;
  font-size: 14px;
}

.scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: fadeInUp 0.8s ease 1.2s both;
  margin-top: 16px;
}

.scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, var(--blue-bright), transparent);
  animation: pulse 1.5s ease-in-out infinite;
}

.scroll-hint span {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 3px;
  color: var(--text-dim);
  text-transform: uppercase;
}

/* Stars */
.star-field {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.star {
  position: absolute;
  border-radius: 50%;
  background: white;
  animation: float infinite ease-in-out;
  opacity: 0.6;
}

@media (max-width: 600px) {
  .hero-content {
    padding: 100px 16px 60px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .year-display {
    gap: 10px;
  }

  .year-label {
    letter-spacing: 4px;
  }
}

.hero-aurora-1 {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: radial-gradient(ellipse 120% 80% at 20% 30%, rgba(0,87,184,0.15) 0%, transparent 60%);
  animation: aurora 8s ease infinite;
  background-size: 200% 200%;
}
.hero-aurora-2 {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: radial-gradient(ellipse 80% 60% at 80% 70%, rgba(26,127,222,0.1) 0%, transparent 60%);
  animation: aurora 12s ease infinite reverse;
  background-size: 200% 200%;
}
.hero-aurora-3 {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: radial-gradient(ellipse 60% 80% at 50% 100%, rgba(201,162,39,0.06) 0%, transparent 50%);
  animation: aurora 10s ease infinite 3s;
  background-size: 200% 200%;
}
.hero-inner {
  transition: transform 0.1s ease-out;
}

/* ===== CYBER GRID ===== */
.hero-grid {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background-image:
    linear-gradient(rgba(26,127,222,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26,127,222,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 80%);
}

/* ===== SCANLINE ===== */
.hero-scanline {
  position: absolute; inset: 0; z-index: 9; pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px,
    rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px
  );
}

/* ===== HUD CORNERS ===== */
.hud-corner {
  position: absolute; z-index: 8; pointer-events: none;
  width: 32px; height: 32px;
  animation: hudPulse 3s ease-in-out infinite;
}
.hud-tl { top: 20px; left: 20px; border-top: 2px solid var(--blue-bright); border-left: 2px solid var(--blue-bright); }
.hud-tr { top: 20px; right: 20px; border-top: 2px solid var(--blue-bright); border-right: 2px solid var(--blue-bright); animation-delay: 0.5s; }
.hud-bl { bottom: 20px; left: 20px; border-bottom: 2px solid var(--blue-bright); border-left: 2px solid var(--blue-bright); animation-delay: 1s; }
.hud-br { bottom: 20px; right: 20px; border-bottom: 2px solid var(--blue-bright); border-right: 2px solid var(--blue-bright); animation-delay: 1.5s; }

/* ===== STATUS BAR ===== */
.hero-status {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
  z-index: 11; display: flex; align-items: center; gap: 10px;
  font-family: 'Share Tech Mono', 'Courier New', monospace;
  font-size: 11px; color: rgba(74,174,255,0.5);
  letter-spacing: 1px; white-space: nowrap;
  pointer-events: none;
}
.status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #00ff88;
  box-shadow: 0 0 6px #00ff88;
  animation: pulse 2s infinite;
  flex-shrink: 0;
}
.status-sep { opacity: 0.3; }

/* ===== GLITCH TEXT ===== */
.glitch-text {
  position: relative;
  animation: glitch 8s ease-in-out infinite, glitchShake 8s ease-in-out infinite;
}
.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  font-family: inherit; font-size: inherit; font-weight: inherit;
  letter-spacing: inherit;
  background: inherit;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.glitch-text::before {
  left: -2px;
  background: linear-gradient(135deg, #ff006620, var(--blue-light));
  -webkit-background-clip: text;
  background-clip: text;
  animation: glitch 8s ease-in-out infinite 0.05s;
  clip-path: inset(0 0 0 0);
}
.glitch-text::after {
  left: 2px;
  background: linear-gradient(135deg, var(--blue-bright), #00ffff20);
  -webkit-background-clip: text;
  background-clip: text;
  animation: glitch 8s ease-in-out infinite 0.1s;
}

/* ===== TITLE MONO ===== */
.title-line.font-mono {
  font-size: clamp(10px, 1.2vw, 13px);
  letter-spacing: 2px;
  color: rgba(74,174,255,0.5);
  font-family: 'Share Tech Mono', monospace;
  font-weight: 400;
}

@media (max-width: 600px) {
  .hud-corner { width: 20px; height: 20px; }
  .hero-status { font-size: 9px; gap: 6px; bottom: 16px; }
}
</style>
