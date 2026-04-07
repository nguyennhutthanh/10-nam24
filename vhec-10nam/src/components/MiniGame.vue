<template>
  <section id="game" class="section game-section">
    <div class="game-bg-glow"></div>
    <div class="container">
      <div class="section-header reveal" data-reveal>
        <div class="section-badge">{{ $t('game.badge') }}</div>
        <div class="gold-line"></div>
        <h2 class="section-title">
          <i18n-t keypath="game.title" tag="span">
            <template #highlight><span class="highlight">{{ $t('game.highlight') }}</span></template>
          </i18n-t>
        </h2>
        <p class="section-subtitle">{{ $t('game.subtitle') }}</p>
      </div>

      <div class="game-wrap">

        <!-- ===== IDLE SCREEN ===== -->
        <div v-if="gameState === 'idle'" class="game-screen screen-idle">
          <div class="idle-dino">🦕</div>
          <h3 class="idle-title">{{ $t('game.idleTitle') }}</h3>
          <p class="idle-desc">{{ $t('game.idleDesc') }}</p>

          <div class="rules">
            <div class="rule-item">⬆️ {{ $t('game.rule1') }}</div>
            <div class="rule-item">⬇️ {{ $t('game.rule2') }}</div>
            <div class="rule-item">🌵 {{ $t('game.rule3') }}</div>
            <div class="rule-item">🚀 {{ $t('game.rule4') }}</div>
          </div>

          <div class="name-form">
            <label class="name-label">{{ $t('game.nameLabel') }}</label>
            <input
              v-model.trim="playerName"
              class="name-input"
              :placeholder="$t('game.namePlaceholder')"
              maxlength="30"
              @keyup.enter="startGame"
            />
            <span v-if="nameError" class="name-error">{{ nameError }}</span>
          </div>

          <button class="btn btn-gold btn-lg" @click="startGame">{{ $t('game.btnStart') }}</button>
        </div>

        <!-- ===== PLAYING / DEAD SCREEN ===== -->
        <div v-else-if="gameState === 'playing' || gameState === 'dead'" class="game-screen screen-playing">
          <!-- HUD -->
          <div class="game-hud">
            <div class="hud-item">
              <span class="hud-label">{{ $t('game.hudPlayer') }}</span>
              <span class="hud-value hud-name">{{ playerName }}</span>
            </div>
            <div class="hud-item">
              <span class="hud-label">{{ $t('game.hudScore') }}</span>
              <span class="hud-value score-val">{{ score }}</span>
            </div>
            <div class="hud-item">
              <span class="hud-label">{{ $t('game.hudHi') }}</span>
              <span class="hud-value hi-val">{{ hiScore }}</span>
            </div>
            <div class="hud-item" :class="{ 'hud-danger': speedLevel >= 18 }">
              <span class="hud-label">{{ $t('game.hudSpeed') }}</span>
              <span class="hud-value spd-val">
                {{ speedLevel >= 20 ? '🔥' : speedLevel >= 14 ? '⚡' : '' }} {{ speedLevel }}
              </span>
            </div>
          </div>

          <!-- Canvas -->
          <div class="canvas-wrap" ref="canvasWrapRef">
            <canvas
              ref="canvasRef"
              class="game-canvas"
              @click="handleClick"
              @touchstart.prevent="handleClick"
            ></canvas>

            <!-- Game Over Overlay -->
            <Transition name="fade">
              <div v-if="gameState === 'dead'" class="gameover-overlay">
                <div class="go-icon">💥</div>
                <div class="go-title">GAME OVER</div>
                <div class="go-score">{{ $t('game.goScore', { score }) }}</div>
                <div class="go-actions">
                  <button class="btn btn-gold" @click.stop="restartGame">{{ $t('game.btnRestart') }}</button>
                  <button class="btn btn-outline" @click.stop="goToResult">{{ $t('game.btnSubmit') }}</button>
                </div>
              </div>
            </Transition>
          </div>

          <div class="game-controls-hint">
            <span>{{ $t('game.controlsHint') }}</span>
          </div>
        </div>

        <!-- ===== RESULT SCREEN ===== -->
        <div v-else-if="gameState === 'result'" class="game-screen screen-result">
          <div class="confetti-wrap">
            <div v-for="i in 30" :key="i" class="confetti-piece" :style="getConfettiStyle(i)"></div>
          </div>

          <div class="result-icon">{{ score >= 1000 ? '🏆' : score >= 500 ? '🥈' : '🦕' }}</div>
          <h3 class="result-title">
            {{ score >= 1000 ? $t('game.resultExcellent') : score >= 500 ? $t('game.resultGood') : $t('game.resultTryHarder') }}
          </h3>

          <div class="result-score">
            <div class="rs-label">{{ $t('game.rsLabel') }}</div>
            <div class="rs-value">{{ score }}</div>
            <div class="rs-sub">{{ playerName }}</div>
          </div>

          <div class="result-stats">
            <div class="rs-stat">
              <span class="rs-stat-val">{{ score }}</span>
              <span class="rs-stat-label">{{ $t('game.rsScore') }}</span>
            </div>
            <div class="rs-stat">
              <span class="rs-stat-val">x{{ speedLevel }}</span>
              <span class="rs-stat-label">{{ $t('game.rsSpeed') }}</span>
            </div>
          </div>

          <div v-if="!submitted" class="result-actions">
            <button class="btn btn-gold btn-lg" @click="submitScore" :disabled="submitting">
              <span v-if="submitting">{{ $t('game.submitting') }}</span>
              <span v-else>{{ $t('game.btnSubmitScore') }}</span>
            </button>
            <button class="btn btn-outline" @click="resetGame" :disabled="submitting">
              {{ $t('game.btnPlayAgain') }}
            </button>
            <div v-if="submitError" class="submit-error">{{ submitError }}</div>
          </div>

          <div v-else class="submit-feedback">
            <div class="submit-rank">
              {{ $t('game.submitRank', { rank: submittedRank }) }}
            </div>
            <div class="submit-btns">
              <button class="btn btn-outline" @click="resetGame">{{ $t('game.btnPlayAgain') }}</button>
              <button class="btn btn-blue" @click="scrollToLeaderboard">{{ $t('game.btnViewLB') }}</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLeaderboardStore } from '../stores/leaderboard.js'

const { t } = useI18n()
const leaderboardStore = useLeaderboardStore()

// ===== UI State =====
const gameState = ref('idle')
const canvasRef = ref(null)
const canvasWrapRef = ref(null)
const playerName = ref('')
const nameError = ref('')
const score = ref(0)
const hiScore = ref(0)
const speedLevel = ref(1)
const submitted = ref(false)
const submittedRank = ref(0)
const submitting = ref(false)
const submitError = ref('')

// ===== Game Constants =====
const GW = 900       // logical width
const GH = 260       // logical height
const GROUND = 210   // ground Y line
const DINO_X = 80    // fixed dino X
const GRAVITY = 0.82
const JUMP_V = -15.5

// ===== Game Variables =====
let dino = {}
let obstacles = []
let clouds = []
let groundOffset = 0
let speed = 3          // bắt đầu rất chậm
let frameN = 0
let obsTimer = 0
let nextObs = 110
let animId = null
let scaleX = 1
let scaleY = 1

// ===== Reset =====
function resetGameVars() {
  dino = { y: GROUND - 52, vy: 0, onGround: true, ducking: false, legFrame: 0, legTick: 0, deadTick: 0 }
  obstacles = []
  clouds = [
    { x: 250, y: 28, w: 90 },
    { x: 580, y: 45, w: 65 },
  ]
  groundOffset = 0
  speed = 3            // bắt đầu rất chậm
  frameN = 0
  obsTimer = 0
  nextObs = 110
  score.value = 0
  speedLevel.value = 1
}

// ===== Controls =====
function handleClick() {
  if (gameState.value === 'playing') jump()
}

function jump() {
  if (dino.ducking) { dino.ducking = false; return }
  if (dino.onGround) {
    dino.vy = JUMP_V
    dino.onGround = false
  }
}

function onKeyDown(e) {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault()
    if (gameState.value === 'dead') { restartGame(); return }
    if (gameState.value === 'playing') jump()
  }
  if (e.code === 'ArrowDown' && gameState.value === 'playing') {
    dino.ducking = true
  }
}

function onKeyUp(e) {
  if (e.code === 'ArrowDown') dino.ducking = false
}

// ===== Spawn obstacle =====
function spawnObstacle() {
  // Loại chướng ngại mở khóa dần theo tốc độ
  const types = ['sm']
  if (speed > 5)  types.push('lg')
  if (speed > 7)  types.push('dbl')
  if (speed > 10) types.push('bird-lo')
  if (speed > 13) types.push('tri', 'bird-hi')
  if (speed > 17) types.push('dbl', 'tri')  // tần suất cao hơn ở tốc độ khủng

  const type = types[Math.floor(Math.random() * types.length)]
  const cfg = {
    sm:        { w: 22, h: 40, y: GROUND - 40 },
    lg:        { w: 26, h: 54, y: GROUND - 54 },
    dbl:       { w: 46, h: 44, y: GROUND - 44 },
    tri:       { w: 62, h: 44, y: GROUND - 44 },
    'bird-lo': { w: 46, h: 26, y: GROUND - 76 },
    'bird-hi': { w: 46, h: 26, y: GROUND - 110 },
  }
  const c = cfg[type]
  obstacles.push({ x: GW + 30, type, ...c })
}

// ===== Collision =====
function checkCollision() {
  const dw = dino.ducking ? 58 : 44
  const dh = dino.ducking ? 32 : 52
  const m = 7  // forgiveness margin
  const dx1 = DINO_X + m, dy1 = dino.y + m
  const dx2 = DINO_X + dw - m, dy2 = dino.y + dh - m

  for (const o of obstacles) {
    const ox1 = o.x + 4, oy1 = o.y + 4
    const ox2 = o.x + o.w - 4, oy2 = o.y + o.h - 4
    if (dx2 > ox1 && dx1 < ox2 && dy2 > oy1 && dy1 < oy2) return true
  }
  return false
}

// ===== Game Loop =====
function gameLoop() {
  frameN++

  // Tốc độ tăng dần theo công thức lũy thừa: chậm → nhanh → cực nhanh
  // frameN=0 → ~3 | frameN=1000 → ~6 | frameN=3000 → ~11 | frameN=6000 → ~18 | frameN=10000 → ~26
  speed = Math.min(3 + Math.pow(frameN / 400, 1.5), 28)
  speedLevel.value = Math.max(1, Math.floor(speed))

  // Obstacle interval ngắn dần theo tốc độ
  // Score
  score.value = Math.floor(frameN / 3.5)

  // Dino physics
  if (!dino.onGround) {
    dino.vy += GRAVITY
    dino.y += dino.vy
    const limit = GROUND - (dino.ducking ? 32 : 52)
    if (dino.y >= limit) {
      dino.y = limit
      dino.vy = 0
      dino.onGround = true
    }
  } else if (dino.ducking) {
    dino.y = GROUND - 32
  } else {
    dino.y = GROUND - 52
  }

  // Leg animation (faster at higher speed)
  if (dino.onGround) {
    dino.legTick++
    const legSpeed = Math.max(3, 9 - Math.floor(speed / 2))
    if (dino.legTick >= legSpeed) {
      dino.legFrame = 1 - dino.legFrame
      dino.legTick = 0
    }
  }

  // Ground scroll
  groundOffset = (groundOffset + speed) % GW

  // Obstacles — khoảng cách spawn giảm dần theo tốc độ
  obsTimer++
  const minGap = Math.max(28, 75 - speed * 3)  // càng nhanh càng dày
  if (obsTimer >= nextObs) {
    spawnObstacle()
    obsTimer = 0
    nextObs = minGap + Math.random() * (minGap * 0.8)
  }
  obstacles.forEach(o => { o.x -= speed })
  obstacles = obstacles.filter(o => o.x > -100)

  // Clouds
  clouds.forEach(c => { c.x -= 1.2 })
  clouds = clouds.filter(c => c.x > -200)
  if (frameN % 200 === 0) clouds.push({ x: GW + 60, y: 15 + Math.random() * 60, w: 55 + Math.random() * 70 })

  // Collision check
  if (checkCollision()) {
    endGame(); return
  }

  render()
  animId = requestAnimationFrame(gameLoop)
}

// ===== Render =====
function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.scale(canvas.width / GW, canvas.height / GH)

  drawBg(ctx)
  drawClouds(ctx)
  drawGround(ctx)
  drawObstacles(ctx)
  drawDino(ctx)

  ctx.restore()
}

// ----- Background -----
function drawBg(ctx) {
  // Background đỏ dần khi tốc độ cao
  const intensity = Math.min((speed - 3) / 25, 1)
  const g = ctx.createLinearGradient(0, 0, 0, GH)
  g.addColorStop(0, `rgb(${Math.floor(1 + intensity*20)}, ${Math.floor(8 + intensity*2)}, ${Math.floor(16 + intensity*4)})`)
  g.addColorStop(1, `rgb(${Math.floor(7 + intensity*18)}, ${Math.floor(22 + intensity*4)}, ${Math.floor(40 + intensity*6)})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, GW, GH)

  // Speed lines — xuất hiện khi speed > 12
  if (speed > 12) {
    const lineAlpha = Math.min((speed - 12) / 16, 0.35)
    ctx.strokeStyle = `rgba(74, 174, 255, ${lineAlpha})`
    ctx.lineWidth = 1
    for (let i = 0; i < 12; i++) {
      const lx = ((i * 78) - (groundOffset * 2.5) % GW + GW * 2) % GW
      const ly = 20 + (i * 17) % (GROUND - 40)
      const len = 20 + (speed - 12) * 4
      ctx.beginPath()
      ctx.moveTo(lx, ly)
      ctx.lineTo(lx - len, ly)
      ctx.stroke()
    }
  }

  // Stars (cuộn nhanh hơn ở tốc độ cao)
  const starSpeed = 1 + speed * 0.05
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  const stars = [[50,18],[120,8],[200,25],[350,12],[480,20],[600,7],[700,22],[760,15],[820,30],[860,10]]
  stars.forEach(([bx, by]) => {
    const sx = ((bx - groundOffset * starSpeed * 0.15) % GW + GW) % GW
    const pulse = 0.3 + 0.2 * Math.sin(frameN * 0.04 + bx)
    ctx.globalAlpha = pulse
    ctx.fillRect(sx, by, 2, 2)
  })
  ctx.globalAlpha = 1
}

// ----- Clouds -----
function drawClouds(ctx) {
  ctx.fillStyle = 'rgba(255,255,255,0.035)'
  clouds.forEach(c => {
    roundRect(ctx, c.x - c.w/2, c.y - 14, c.w, 28, 14)
    ctx.fill()
    roundRect(ctx, c.x - c.w/3, c.y - 22, c.w * 0.65, 22, 11)
    ctx.fill()
  })
}

// ----- Ground -----
function drawGround(ctx) {
  // Main line
  ctx.strokeStyle = 'rgba(26,127,222,0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, GROUND); ctx.lineTo(GW, GROUND)
  ctx.stroke()

  // Scrolling ground dashes
  ctx.fillStyle = 'rgba(26,127,222,0.18)'
  for (let i = 0; i < 40; i++) {
    const x = ((i * 22) - groundOffset % 22 + GW) % GW
    ctx.fillRect(x, GROUND + 4, 12, 3)
    if (i % 3 === 0) ctx.fillRect(x + 5, GROUND + 10, 5, 2)
  }
}

// ----- Obstacles -----
function drawObstacles(ctx) {
  obstacles.forEach(o => {
    if (o.type === 'bird-lo' || o.type === 'bird-hi') drawBird(ctx, o.x, o.y)
    else drawCactus(ctx, o.x, o.y, o.type)
  })
}

function drawCactus(ctx, x, y, type) {
  const G = '#2DD4BF'   // teal/green for cactus
  const DG = '#0F9080'
  const SP = '#A7F3D0'  // spine highlight

  const fill = (color, rx, ry, rw, rh) => {
    ctx.fillStyle = color
    ctx.fillRect(rx, ry, rw, rh)
  }

  if (type === 'sm') {
    fill(G,  x+8, y,    10, 40);  fill(DG, x+8, y,    10, 5)
    fill(G,  x+0, y+12, 10, 8);  fill(DG, x+0, y+10, 8,  12)
    fill(G,  x+18,y+16, 10, 8);  fill(DG, x+18,y+14, 8,  12)
    fill(SP, x+9, y,    2,  6);  fill(SP, x+14,y,    2,  6)

  } else if (type === 'lg') {
    fill(G,  x+10,y,    12, 54); fill(DG, x+10,y,    12, 6)
    fill(G,  x+0, y+16, 12, 10);fill(DG, x+0, y+10, 10, 18)
    fill(G,  x+22,y+20, 12, 10);fill(DG, x+22,y+14, 10, 18)
    fill(SP, x+11,y,    2,  7); fill(SP, x+17,y,    2,  7)

  } else if (type === 'dbl') {
    fill(G,  x+4, y+8,  9,  36); fill(DG, x+4, y+8, 9, 4)
    fill(G,  x+0, y+18, 6,  6);  fill(DG, x+0, y+15,5, 10)
    fill(G,  x+22,y+0,  11, 44); fill(DG, x+22,y+0, 11, 5)
    fill(G,  x+33,y+12, 8,  6);  fill(DG, x+33,y+9, 7, 10)
    fill(SP, x+5, y+8,  2,  5);  fill(SP, x+23,y,   2,  5)

  } else if (type === 'tri') {
    fill(G,  x+4, y+8,  9,  36); fill(DG, x+0, y+18,6,  6)
    fill(G,  x+22,y+0,  11, 44); fill(DG, x+33,y+12,8,  6)
    fill(G,  x+40,y+12, 9,  32); fill(DG, x+50,y+20,7,  6)
    fill(SP, x+23,y,    2,  5)
  }
}

function drawBird(ctx, x, y) {
  const wing = Math.floor(frameN / 8) % 2 === 0
  const B = '#F59E0B', DB = '#D97706', LB = '#FDE68A'

  const fill = (c, rx, ry, rw, rh) => { ctx.fillStyle = c; ctx.fillRect(rx, ry, rw, rh) }

  fill(B,  x+14, y+8,  22, 12)     // body
  fill(B,  x+30, y+3,  16, 14)     // head
  fill(DB, x+44, y+7,  8,  4)      // beak
  fill(LB, x+34, y+5,  5,  5)      // eye white
  fill('#000', x+35, y+6, 3, 3)    // eye

  if (wing) {
    fill(B, x+2,  y-2, 18, 10)     // wing up
    fill(DB,x+18, y,   10, 8)
  } else {
    fill(B, x+4,  y+16,18, 10)     // wing down
    fill(DB,x+18, y+14,10, 8)
  }
  fill(DB, x+8, y+10, 8, 6)        // tail
}

// ----- Dino -----
function drawDino(ctx) {
  const x = DINO_X
  const y = dino.y
  const lf = dino.legFrame
  const dead = gameState.value === 'dead'

  const B  = dead ? '#666' : '#1A7FDE'   // body
  const DB = dead ? '#444' : '#0057B8'   // dark
  const LB = dead ? '#888' : '#4AAEFF'   // light
  const EW = dead ? '#aaa' : '#FFFFFF'   // eye white
  const EP = dead ? '#888' : '#000'      // eye pupil
  const ES = dead ? '#aaa' : '#fff'      // eye shine

  const fill = (c, rx, ry, rw, rh) => { ctx.fillStyle = c; ctx.fillRect(rx, ry, rw, rh) }

  if (dino.ducking) {
    fill(DB, x-2,  y+14, 10, 8)          // tail
    fill(B,  x+4,  y+10, 42, 22)         // body
    fill(B,  x+36, y+0,  24, 16)         // head
    fill(LB, x+52, y+4,  10, 8)          // snout
    fill(EW, x+44, y+2,  6,  6)          // eye
    fill(EP, x+45, y+3,  4,  4)
    fill(ES, x+46, y+3,  2,  2)
    fill(dead ? '#888':'#FF4444', x+58, y+9, 2, 2) // nostril
    // legs
    fill(lf===0?B:DB, x+8,  y+28, 9, 14)
    fill(lf===0?DB:B, x+24, y+28, 9, 14)

  } else {
    fill(DB, x+0,  y+20, 10, 8)          // tail
    fill(DB, x+2,  y+26, 6,  8)
    fill(B,  x+6,  y+12, 28, 26)         // body
    fill(B,  x+24, y+8,  12, 12)         // neck
    fill(B,  x+20, y+0,  28, 22)         // head
    fill(LB, x+38, y+6,  12, 10)         // snout
    fill(EW, x+32, y+3,  7,  7)          // eye
    fill(EP, x+33, y+4,  5,  5)
    fill(ES, x+34, y+4,  2,  2)

    if (dead) {
      // X eyes when dead
      fill('#fff', x+32, y+3, 7, 7)
      ctx.strokeStyle = '#FF4444'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(x+33,y+4); ctx.lineTo(x+38,y+9); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x+38,y+4); ctx.lineTo(x+33,y+9); ctx.stroke()
    }

    fill(DB, x+34, y+13, 2, 2)           // nostril
    fill(DB, x+26, y+22, 8,  5)          // arm

    // VHEC text on body
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = 'bold 8px monospace'
    ctx.fillText('VHEC', x+8, y+27)

    // Legs
    if (lf === 0) {
      fill(B,  x+10, y+36, 9, 20); fill(DB, x+8,  y+54, 13, 5)
      fill(DB, x+24, y+36, 9, 10)
    } else {
      fill(DB, x+10, y+36, 9, 10)
      fill(B,  x+24, y+36, 9, 20); fill(DB, x+22, y+54, 13, 5)
    }
  }
}

// ===== Helpers =====
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function resizeCanvas() {
  const canvas = canvasRef.value
  const wrap = canvasWrapRef.value
  if (!canvas || !wrap) return
  const w = Math.min(wrap.clientWidth, 900)
  const h = Math.round(w * GH / GW)
  canvas.width = w
  canvas.height = h
}

// ===== Game management =====
function validateName() {
  if (!playerName.value || playerName.value.length < 2) {
    nameError.value = t('game.nameError'); return false
  }
  nameError.value = ''; return true
}

function startGame() {
  if (!validateName()) return
  resetGameVars()
  gameState.value = 'playing'
  submitted.value = false
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  nextTick(() => {
    resizeCanvas()
    animId = requestAnimationFrame(gameLoop)
  })
}

function endGame() {
  if (animId) cancelAnimationFrame(animId)
  if (score.value > hiScore.value) hiScore.value = score.value
  gameState.value = 'dead'
  render()  // draw final frame with dead dino
}

function restartGame() {
  resetGameVars()
  gameState.value = 'playing'
  submitted.value = false
  submitError.value = ''
  nextTick(() => {
    resizeCanvas()
    animId = requestAnimationFrame(gameLoop)
  })
}

function goToResult() {
  gameState.value = 'result'
}

function resetGame() {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  gameState.value = 'idle'
  submitted.value = false
  submitError.value = ''
}

async function submitScore() {
  submitting.value = true
  submitError.value = ''
  try {
    const { rank } = await leaderboardStore.addEntry(playerName.value, score.value)
    submittedRank.value = rank
    submitted.value = true
  } catch (e) {
    submitError.value = e?.message || 'Nộp điểm thất bại, vui lòng thử lại!'
  } finally {
    submitting.value = false
  }
}

function scrollToLeaderboard() {
  document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })
}

function getConfettiStyle(i) {
  const colors = ['#1A7FDE', '#4AAEFF', '#C9A227', '#E8C74A', '#fff', '#2DD4BF']
  return {
    left: (i * 3.5) % 100 + '%',
    background: colors[i % colors.length],
    animationDelay: (i * 0.1) + 's',
    animationDuration: (1.5 + (i % 3) * 0.5) + 's',
    width: (4 + (i % 5)) + 'px',
    height: (4 + (i % 5)) + 'px',
    borderRadius: i % 2 === 0 ? '50%' : '2px'
  }
}

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})
</script>

<style scoped>
.game-section {
  background: var(--bg-darkest);
  position: relative;
  overflow: hidden;
}

.game-bg-glow {
  position: absolute;
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(26, 127, 222, 0.07) 0%, transparent 70%);
  pointer-events: none;
}

.game-wrap {
  max-width: 920px;
  margin: 0 auto;
}

.game-screen {
  background: linear-gradient(135deg, var(--bg-card), rgba(8, 24, 48, 0.9));
  border: 1px solid var(--border-blue);
  border-radius: var(--radius-lg);
  padding: 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.game-screen::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--blue), var(--blue-bright), var(--blue-light), var(--blue-bright), var(--blue));
}

/* ===== Idle ===== */
.idle-dino { font-size: 56px; margin-bottom: 12px; display: block; animation: float 2s ease-in-out infinite; }
.idle-title { font-family: var(--font-heading); font-size: 26px; font-weight: 800; color: var(--text-white); margin-bottom: 8px; }
.idle-desc  { color: var(--text-gray); margin-bottom: 24px; }

.rules {
  background: rgba(26, 127, 222, 0.06);
  border: 1px solid var(--border-blue);
  border-radius: var(--radius-sm);
  padding: 20px;
  text-align: left;
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rule-item { font-size: 14px; color: var(--text-light); }
.rule-item strong { color: var(--blue-light); }

.name-form { margin-bottom: 24px; text-align: left; }
.name-label { display: block; font-family: var(--font-heading); font-size: 13px; font-weight: 600; color: var(--text-gray); margin-bottom: 8px; letter-spacing: 0.5px; }
.name-input { width: 100%; padding: 14px 20px; background: rgba(255,255,255,0.06); border: 1px solid var(--border-blue); border-radius: var(--radius-sm); color: var(--text-white); font-family: var(--font-body); font-size: 16px; outline: none; transition: var(--transition); }
.name-input:focus { border-color: var(--blue-bright); background: rgba(26,127,222,0.08); box-shadow: 0 0 0 3px rgba(26,127,222,0.12); }
.name-input::placeholder { color: var(--text-dim); }
.name-error { display: block; color: #ff6b6b; font-size: 12px; margin-top: 6px; }
.btn-lg { padding: 18px 40px; font-size: 16px; }

/* ===== Playing ===== */
.screen-playing { padding: 24px; }

.game-hud {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.hud-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-sm); padding: 8px; }
.hud-label { display: block; font-size: 10px; font-weight: 600; color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px; }
.hud-value { display: block; font-family: var(--font-heading); font-size: 18px; font-weight: 800; color: var(--text-white); }
.hud-name  { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.score-val { color: var(--blue-light); }
.hi-val    { color: var(--gold); }
.spd-val   { color: #2DD4BF; transition: color 0.5s; }
.hud-danger .hud-value { color: #ff6b6b !important; animation: pulse 0.5s infinite; }

.canvas-wrap {
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid rgba(26,127,222,0.3);
  cursor: pointer;
  user-select: none;
}

.game-canvas {
  display: block;
  width: 100%;
  height: auto;
  image-rendering: pixelated;
}

.gameover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(1, 8, 16, 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  backdrop-filter: blur(4px);
}

.go-icon  { font-size: 36px; animation: scaleIn 0.4s ease; }
.go-title { font-family: var(--font-heading); font-size: 28px; font-weight: 900; color: #ff6b6b; letter-spacing: 4px; animation: fadeInUp 0.4s ease; }
.go-score { font-family: var(--font-heading); font-size: 22px; font-weight: 700; color: var(--blue-light); margin-bottom: 8px; }
.go-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; animation: fadeInUp 0.5s ease 0.1s both; }
.go-actions .btn { padding: 12px 24px; font-size: 14px; }

.game-controls-hint { margin-top: 12px; font-size: 12px; color: var(--text-dim); letter-spacing: 0.5px; }

/* ===== Result ===== */
.confetti-wrap { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.confetti-piece { position: absolute; top: -10px; animation: confettiFall linear infinite; }

@keyframes confettiFall {
  0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(500px) rotate(360deg); opacity: 0; }
}

.result-icon  { font-size: 64px; margin-bottom: 12px; animation: scaleIn 0.5s ease; }
.result-title { font-family: var(--font-heading); font-size: 28px; font-weight: 900; color: var(--blue-light); margin-bottom: 24px; }

.result-score { background: rgba(26,127,222,0.08); border: 1px solid var(--border-blue); border-radius: var(--radius-md); padding: 24px; margin-bottom: 20px; }
.rs-label { font-size: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
.rs-value { font-family: var(--font-heading); font-size: 56px; font-weight: 900; background: linear-gradient(135deg, var(--blue-bright), var(--blue-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
.rs-sub   { color: var(--text-gray); font-size: 14px; margin-top: 8px; }

.result-stats { display: flex; gap: 16px; justify-content: center; margin-bottom: 28px; }
.rs-stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-sm); padding: 16px 24px; flex: 1; }
.rs-stat-val   { display: block; font-family: var(--font-heading); font-size: 28px; font-weight: 800; color: var(--text-white); }
.rs-stat-label { font-size: 12px; color: var(--text-dim); }

.result-actions { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.submit-error { color: #ff6b6b; font-size: 13px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

.submit-feedback { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.submit-rank { background: rgba(26,127,222,0.1); border: 1px solid var(--border-blue); border-radius: var(--radius-sm); padding: 14px 24px; font-family: var(--font-heading); font-size: 16px; color: var(--text-white); width: 100%; }
.submit-rank strong { color: var(--blue-light); font-size: 20px; }
.submit-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.submit-btns .btn { min-width: 160px; }

@media (max-width: 600px) {
  .game-screen { padding: 20px 14px; }
  .game-hud { grid-template-columns: repeat(2, 1fr); }
  .result-stats { flex-direction: column; }
  .go-actions { flex-direction: column; align-items: center; }
}
</style>
