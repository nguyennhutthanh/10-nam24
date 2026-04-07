<template>
  <section class="dev-section">
    <div class="game-bg-glow"></div>

    <div class="game-outer">
      <div class="canvas-wrap">
        <!-- Canvas always in DOM -->
        <canvas ref="cvs" :width="CW" :height="CH" @touchmove.prevent="onTouchMove" @touchend="onTouchEnd"></canvas>

        <!-- IDLE OVERLAY -->
        <div v-if="gs === 'idle'" class="overlay idle-overlay">
          <div class="idle-card">
            <h2 class="idle-title">DEV DEFENDER</h2>
            <p class="idle-desc">{{ $t('game.idleDesc') }}</p>

            <!-- Character select -->
            <div class="char-select-label">🧑‍💻 Chọn nhân vật</div>
            <div class="char-grid">
              <div v-for="c in CHARACTERS" :key="c.id"
                   class="char-card" :class="{ active: selectedChar.id === c.id }"
                   :style="{ '--cc': c.color }"
                   @click="selectedChar = c">
                <div class="cc-icon">{{ c.icon }}</div>
                <div class="cc-name">{{ c.name }}</div>
                <div class="cc-stats">
                  <span title="HP">❤️ {{ c.hp }}</span>
                  <span title="Speed">⚡ {{ c.speed >= 7.5 ? '+++' : c.speed >= 6.5 ? '++' : c.speed >= 5.5 ? '+' : '~' }}</span>
                </div>
                <div class="cc-passive">{{ c.passiveDesc }}</div>
              </div>
            </div>

            <div class="rules-grid">
              <div>⬆️⬇️ / W·S — Di chuyển</div>
              <div>🖱️ Auto-aim & bắn</div>
              <div>Space — Deploy Cannon</div>
              <div>1–5 — Đổi vũ khí</div>
            </div>
            <div class="name-row">
              <label>{{ $t('game.nameLabel') }}</label>
              <input v-model.trim="playerName" :placeholder="$t('game.namePlaceholder')"
                     maxlength="20" @keyup.enter="startGame" />
              <span v-if="nameErr" class="name-err">{{ nameErr }}</span>
            </div>
            <button class="btn btn-gold btn-lg" @click="startGame">{{ $t('game.btnStart') }}</button>
          </div>
        </div>

        <!-- HUD (shown while playing or boss) -->
        <div v-if="gs === 'playing' || gs === 'paused'" class="hud-overlay">
          <div class="hud-top">
            <div class="hud-hp-block">
              <span class="hud-lbl">HP</span>
              <div class="hp-track">
                <div class="hp-fill" :style="{ width: (hp/maxHp*100)+'%', background: hpColor }"></div>
              </div>
              <span class="hp-num">{{ hp }}/{{ maxHp }}</span>
            </div>
            <div class="hud-center-block">
              <div class="wave-chip">WAVE {{ wave }}/{{ TOTAL_WAVES }}</div>
              <div class="passive-chip">{{ passiveChipLabel }}</div>
              <div v-if="coffeeTimer > 0" class="coffee-chip">☕ BOOST {{ Math.ceil(coffeeTimer/1000) }}s</div>
              <div v-if="shield > 0" class="shield-chip">🛡️ ×{{ shield }}</div>
              <div v-if="comboDisplay >= 3" class="combo-chip">🔥 COMBO ×{{ comboDisplay }}</div>
            </div>
            <div class="hud-score-block">
              <div class="score-num">{{ score.toLocaleString() }}</div>
              <div class="bugs-num">🐛 {{ bugsKilled }}</div>
            </div>
            <button class="pause-btn" @click="togglePause">
              {{ gs === 'paused' ? 'Tiếp tục' : 'Tạm dừng' }}
            </button>
          </div>
          <div class="weapon-bar">
            <div v-for="(w, i) in availableWeapons" :key="w.id"
                 class="w-slot" :class="{ active: currentWeapon === w.id }"
                 @click="currentWeapon = w.id">
              <kbd>{{ i+1 }}</kbd>{{ w.icon }}
              <span class="w-lv">Lv {{ getWeaponLevel(w.id) + 1 }}</span>
              <span v-if="w.id === currentWeapon && cannonCooldown > 0" class="cd">{{ Math.ceil(cannonCooldown/1000) }}s</span>
            </div>
          </div>
        </div>

        <!-- WAVE ANNOUNCE -->
        <Transition name="wave-pop">
          <div v-if="waveAnn" class="wave-announce">
            <div class="wa-wave">WAVE {{ wave }}</div>
            <div class="wa-title">{{ waveTitle }}</div>
          </div>
        </Transition>

        <div v-if="gs === 'paused'" class="overlay pause-overlay">
          <div class="pause-card">
            <h2 class="pause-title">TẠM DỪNG</h2>
            <p class="pause-sub">Game đang giữ nguyên trạng thái. Nhấn tiếp tục để quay lại trận đấu.</p>
            <button class="btn btn-gold" @click="togglePause">Tiếp tục</button>
          </div>
        </div>

        <!-- UPGRADE SCREEN -->
        <div v-if="gs === 'upgrade'" class="overlay upgrade-overlay">
          <div class="upgrade-card">
            <h2 class="upgrade-title">⬆️ UPGRADE!</h2>
            <p class="upgrade-sub">Wave {{ wave - 1 }} hoàn thành! Chọn 1 nâng cấp:</p>
            <div class="upgrade-row">
              <button v-for="(u, idx) in upgradeChoices" :key="u.id" class="u-choice" :class="{ active: selectedUpgradeIndex === idx }" @click="pickUpgrade(u)">
                <div class="u-icon">{{ u.icon }}</div>
                <div class="u-name">{{ u.name }}</div>
                <div class="u-desc">{{ u.desc }}</div>
              </button>
            </div>
            <div class="upgrade-hint">← → / A D để đổi lựa chọn, Enter để chọn</div>
          </div>
        </div>

        <!-- GAME OVER -->
        <div v-if="gs === 'gameover'" class="overlay gameover-overlay">
          <div class="go-card">
            <div class="go-icon">{{ victory ? '🎉' : '💀' }}</div>
            <h2 class="go-title">{{ victory ? 'CHIẾN THẮNG!' : 'GAME OVER' }}</h2>
            <p v-if="victory" class="go-victory-msg">{{ victoryMessage }}</p>
            <div class="go-stats">
              <div>Wave đạt được: <b>{{ wave }}/{{ TOTAL_WAVES }}</b></div>
              <div>Bug đã tiêu diệt: <b>{{ bugsKilled }}</b></div>
              <div>Điểm số: <b>{{ score.toLocaleString() }}</b></div>
            </div>
            <div class="go-name">{{ playerName }}</div>
            <p v-if="submitting" class="submit-msg">{{ $t('game.submitting') }}</p>
            <p v-else-if="submitMsg" class="submit-msg">{{ submitMsg }}</p>
            <div v-else class="go-rank">🏆 {{ $t('game.submitRank', { rank: playerRank }) }}</div>
            <button class="btn btn-outline mt-16" @click="resetToIdle">{{ $t('game.btnPlayAgain') }}</button>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLeaderboardStore } from '../stores/leaderboard.js'

const { t } = useI18n()
const lbStore = useLeaderboardStore()
const PLAYER_ID_KEY = 'vhec_dev_defender_player_id'

function getPlayerId() {
  if (typeof window === 'undefined') return 'server-player'

  let playerId = window.localStorage.getItem(PLAYER_ID_KEY)
  if (!playerId) {
    playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    window.localStorage.setItem(PLAYER_ID_KEY, playerId)
  }
  return playerId
}

// ─── CONSTANTS ──────────────────────────────────────────────
const CW = 1000, CH = 580
const TOTAL_WAVES = 100

const CHARACTERS = [
  { id:'frontend',  name:'Frontend Dev',  icon:'🎨', color:'#1565c0', hp:100, speed:6,   passive:'score',    passiveDesc:'+15% điểm số',            startWeapons:['keyboard'] },
  { id:'backend',   name:'Backend Dev',   icon:'⚙️', color:'#2e7d32', hp:150, speed:4.5, passive:'armor',    passiveDesc:'Nhận -25% sát thương',     startWeapons:['machinegun'] },
  { id:'devops',    name:'DevOps',        icon:'🚀', color:'#e65100', hp:80,  speed:8,   passive:'cannon',   passiveDesc:'Bắt đầu với Deploy Cannon',startWeapons:['keyboard','cannon'] },
  { id:'fullstack', name:'Full Stack Dev',icon:'💻', color:'#6a1b9a', hp:110, speed:6.5, passive:'firerate', passiveDesc:'Tốc độ bắn +25%',           startWeapons:['keyboard','laser','shotgun'] },
  { id:'aidev',     name:'AI Engineer',   icon:'🤖', color:'#00695c', hp:90,  speed:6,   passive:'homing',   passiveDesc:'Đạn có khả năng truy đuổi',startWeapons:['keyboard','sniper'] },
]

const WEAPON_INFO = {
  keyboard:   { id:'keyboard',   icon:'⌨️', name:'Keyboard' },
  laser:      { id:'laser',      icon:'🔵', name:'Laser' },
  shotgun:    { id:'shotgun',    icon:'🔫', name:'Shotgun' },
  machinegun: { id:'machinegun', icon:'🟡', name:'M.Gun' },
  sniper:     { id:'sniper',     icon:'🟣', name:'Sniper' },
  cannon:     { id:'cannon',     icon:'🚀', name:'Cannon' },
}

const ENEMY_CFG = {
  SmallBug:       { hp:1,  speed:3.5, w:28,  h:20, dmg:10, score:10,  color:'#4caf50', killTexts:['Fixed!','Bug squashed!','Resolved!','Easy!'] },
  MemoryLeak:     { hp:5,  speed:1.5, w:36,  h:36, dmg:15, score:30,  color:'#00bcd4', killTexts:['Memory freed!','GC collected!','Leak patched!'] },
  ProductionBug:  { hp:15, speed:1.2, w:48,  h:48, dmg:25, score:60,  color:'#f44336', killTexts:['Deploy thành công!','Không lỗi trên máy em!','Works on my machine!'] },
  FlyingBug:      { hp:3,  speed:4,   w:32,  h:24, dmg:15, score:35,  color:'#ab47bc', killTexts:["Can't reproduce... fixed!","Issue closed: Can't repro","LGTM 👍"] },
  DeadlineMonster:{ hp:140, speed:1,   w:90,  h:90, dmg:30, score:500, color:'#ff5722', isBoss:true, killTexts:['DEADLINE BEATEN! 🎉','PRODUCTION SAVED!','Ship it! 🚀','Dev wins! 🏆'] },
}

const WAVE_CFG = [
  { title:'🐛 Bug nhỏ tấn công!',          theme:0, spawns:[{type:'SmallBug',count:5,interval:1200}] },
  { title:'💧 Memory Leak xuất hiện!',     theme:0, spawns:[{type:'SmallBug',count:7,interval:900},{type:'MemoryLeak',count:2,interval:3000}] },
  { title:'🦟 Bug biết bay!',              theme:0, spawns:[{type:'SmallBug',count:8,interval:800},{type:'FlyingBug',count:3,interval:2000},{type:'MemoryLeak',count:2,interval:2500}] },
  { title:'🔴 Production Bug tấn công!',   theme:1, spawns:[{type:'ProductionBug',count:3,interval:3500},{type:'FlyingBug',count:5,interval:1200},{type:'SmallBug',count:10,interval:600}] },
  { title:'💀 DEADLINE MONSTER!',          theme:1, isBoss:true, spawns:[{type:'SmallBug',count:10,interval:700},{type:'DeadlineMonster',count:1,interval:5000}] },
  { title:'⚠️ Họ quay trở lại!',           theme:2, spawns:[{type:'SmallBug',count:12,interval:600},{type:'MemoryLeak',count:4,interval:2000},{type:'FlyingBug',count:4,interval:1500}] },
  { title:'🔥 Production sập rồi!',        theme:2, spawns:[{type:'ProductionBug',count:5,interval:2500},{type:'FlyingBug',count:6,interval:1000},{type:'SmallBug',count:15,interval:500}] },
  { title:'💣 Tổng tấn công!',             theme:2, spawns:[{type:'SmallBug',count:10,interval:500},{type:'MemoryLeak',count:4,interval:1800},{type:'ProductionBug',count:3,interval:3000},{type:'FlyingBug',count:5,interval:1000}] },
  { title:'🌊 MEGA WAVE!',                 theme:1, spawns:[{type:'SmallBug',count:20,interval:400},{type:'MemoryLeak',count:6,interval:1500},{type:'ProductionBug',count:5,interval:2000},{type:'FlyingBug',count:8,interval:800}] },
  { title:'💀 BOSS CUỐI CÙNG!',            theme:2, isBoss:true, spawns:[{type:'SmallBug',count:15,interval:500},{type:'ProductionBug',count:5,interval:2000},{type:'DeadlineMonster',count:2,interval:8000}] },
]

const UPGRADE_POOL = [
  { id:'dmg',        name:'Sát thương +1',       icon:'💥', desc:'Mỗi đạn +1 sát thương' },
  { id:'speed',      name:'Tốc độ bắn +',        icon:'⚡', desc:'Reload nhanh hơn 15%' },
  { id:'hp',         name:'Hồi máu +30 HP',      icon:'❤️', desc:'Hồi phục và tăng HP tối đa' },
  { id:'coffee',     name:'Coffee Boost',         icon:'☕', desc:'Tăng tốc di chuyển 10 giây' },
  { id:'shield',     name:'Stack Overflow Shield',icon:'🛡️', desc:'+1 khiên hấp thụ đòn tấn công' },
  { id:'laser',      name:'Mở khóa Laser',        icon:'🔵', desc:'Bắn laser bám mục tiêu' },
  { id:'shotgun',    name:'Mở khóa Shotgun',      icon:'🔫', desc:'5 đạn tản, hiệu quả gần' },
  { id:'machinegun', name:'Mở khóa Machine Gun',  icon:'🟡', desc:'Bắn liên thanh cực nhanh' },
  { id:'sniper',     name:'Mở khóa Sniper',       icon:'🟣', desc:'Sát thương cao, xuyên địch' },
  { id:'cannon',     name:'Deploy Cannon (Space)', icon:'🚀', desc:'Ultimate: sát thương cực cao' },
]

const WEAPON_UPGRADES = {
  keyboardBoost: { id:'keyboardBoost', name:'Nâng cấp Keyboard', icon:'⌨️', desc:'Tăng sát thương và tốc độ bắn cơ bản' },
  laserBoost: { id:'laserBoost', name:'Nâng cấp Laser', icon:'🔵', desc:'Laser mạnh hơn và khóa mục tiêu nhanh hơn' },
  shotgunBoost: { id:'shotgunBoost', name:'Nâng cấp Shotgun', icon:'🔫', desc:'Thêm đạn và tăng tầm bắn' },
  machinegunBoost: { id:'machinegunBoost', name:'Nâng cấp Machine Gun', icon:'🟡', desc:'Tăng sát thương và giảm độ giật' },
  sniperBoost: { id:'sniperBoost', name:'Nâng cấp Sniper', icon:'🟣', desc:'Sniper gây thêm sát thương và xuyên mạnh hơn' },
  cannonBoost: { id:'cannonBoost', name:'Nâng cấp Cannon', icon:'🚀', desc:'Cannon mạnh hơn và hồi chiêu nhanh hơn' },
}

// ─── VUE STATE ──────────────────────────────────────────────
const cvs = ref(null)
const gs = ref('idle')   // idle | playing | paused | upgrade | gameover
const playerName = ref('')
const nameErr = ref('')
const score = ref(0)
const wave = ref(1)
const hp = ref(100)
const maxHp = ref(100)
const bugsKilled = ref(0)
const shield = ref(0)
const coffeeTimer = ref(0)
const cannonCooldown = ref(0)
const currentWeapon = ref('keyboard')
const availableWeapons = ref([{ id:'keyboard', icon:'⌨️', name:'Keyboard' }])
const waveAnn = ref(false)
const waveTitle = ref('')
const upgradeChoices = ref([])
const selectedUpgradeIndex = ref(0)
const victory = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const submitMsg = ref('')
const playerRank = ref(0)
const comboDisplay = ref(0)
const selectedChar = ref(CHARACTERS[0])
const passiveChipLabel = computed(() => `${selectedChar.value.icon} ${selectedChar.value.passiveDesc}`)
const victoryMessage = computed(() =>
  `Chúc mừng ${playerName.value || 'ban'}! Bạn đã bảo vệ thành công hệ thống VHEC và đẩy lùi toàn bộ bug tấn công.`
)

let audioCtx = null
let audioMaster = null
let sharedNoiseBuffer = null
const sfxCooldowns = {
  machinegun: 0,
  laser: 0,
  shotgun: 0,
  sniper: 0,
  keyboard: 0,
  hit: 0,
  enemyDown: 0,
  enemyDownBoss: 0,
  damage: 0,
  gameover: 0,
}

const hpColor = computed(() => {
  const r = hp.value / maxHp.value
  return r > 0.5 ? '#4caf50' : r > 0.25 ? '#ff9800' : '#f44336'
})

function ensureAudioEngine() {
  if (typeof window === 'undefined') return false
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return false
  if (!audioCtx) {
    audioCtx = new AudioCtx()
    audioMaster = audioCtx.createGain()
    audioMaster.gain.value = 0.58
    audioMaster.connect(audioCtx.destination)
  }
  return true
}

async function unlockAudio() {
  if (!ensureAudioEngine()) return
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume()
  }
  window.dispatchEvent(new Event('vhec:init-music'))
}

function getWeaponLevel(weaponId) {
  return weaponLevels[weaponId] || 0
}

function createNoiseBuffer(duration = 0.08) {
  const length = Math.max(1, Math.floor(audioCtx.sampleRate * duration))
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function canPlaySfx(key, minGap) {
  const now = performance.now()
  if (now - (sfxCooldowns[key] || 0) < minGap) return false
  sfxCooldowns[key] = now
  return true
}

function playTone({ freq = 440, freqEnd = freq, duration = 0.08, volume = 0.04, type = 'square' }) {
  if (!audioCtx || !audioMaster) return
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(gain)
  gain.connect(audioMaster)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

function playNoise({ duration = 0.07, volume = 0.03, cutoff = 1200 }) {
  if (!audioCtx || !audioMaster) return
  const now = audioCtx.currentTime
  const source = audioCtx.createBufferSource()
  const filter = audioCtx.createBiquadFilter()
  const gain = audioCtx.createGain()
  if (!sharedNoiseBuffer || sharedNoiseBuffer.duration < duration) {
    sharedNoiseBuffer = createNoiseBuffer(Math.max(duration, 0.2))
  }
  source.buffer = sharedNoiseBuffer
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(cutoff, now)
  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(audioMaster)
  source.start(now)
}

function playShootSfx(weaponType) {
  if (!audioCtx) return
  const minGap = weaponType === 'machinegun' ? 85 : weaponType === 'laser' ? 120 : weaponType === 'keyboard' ? 135 : 150
  if (!canPlaySfx(weaponType, minGap)) return

  if (weaponType === 'laser') {
    playTone({ freq: 860, freqEnd: 460, duration: 0.055, volume: 0.05, type: 'sawtooth' })
  } else if (weaponType === 'shotgun') {
    playNoise({ duration: 0.07, volume: 0.05, cutoff: 950 })
    playTone({ freq: 180, freqEnd: 100, duration: 0.06, volume: 0.045, type: 'square' })
  } else if (weaponType === 'machinegun') {
    playNoise({ duration: 0.03, volume: 0.028, cutoff: 1500 })
    playTone({ freq: 260, freqEnd: 180, duration: 0.03, volume: 0.022, type: 'square' })
  } else if (weaponType === 'sniper') {
    playTone({ freq: 320, freqEnd: 140, duration: 0.09, volume: 0.06, type: 'triangle' })
  } else if (weaponType === 'cannon') {
    playNoise({ duration: 0.14, volume: 0.07, cutoff: 760 })
    playTone({ freq: 140, freqEnd: 55, duration: 0.15, volume: 0.065, type: 'sawtooth' })
  } else {
    playTone({ freq: 440, freqEnd: 220, duration: 0.045, volume: 0.032, type: 'square' })
  }
}

function playHitSfx(isBoss = false) {
  if (!canPlaySfx('hit', isBoss ? 75 : 95)) return
  playTone({ freq: isBoss ? 170 : 240, freqEnd: 100, duration: 0.04, volume: isBoss ? 0.045 : 0.025, type: 'triangle' })
}

function playEnemyDownSfx(isBoss = false) {
  const key = isBoss ? 'enemyDownBoss' : 'enemyDown'
  if (!canPlaySfx(key, isBoss ? 180 : 110)) return
  playNoise({ duration: isBoss ? 0.16 : 0.05, volume: isBoss ? 0.07 : 0.028, cutoff: isBoss ? 900 : 1500 })
  playTone({ freq: isBoss ? 220 : 520, freqEnd: isBoss ? 60 : 180, duration: isBoss ? 0.18 : 0.06, volume: isBoss ? 0.055 : 0.03, type: isBoss ? 'sawtooth' : 'triangle' })
}

function playDamageSfx() {
  if (!canPlaySfx('damage', 160)) return
  playNoise({ duration: 0.08, volume: 0.06, cutoff: 900 })
  playTone({ freq: 180, freqEnd: 80, duration: 0.1, volume: 0.07, type: 'sawtooth' })
}

function playGameOverSfx(isVictory = false) {
  if (!canPlaySfx('gameover', 500)) return
  if (isVictory) {
    playTone({ freq: 440, freqEnd: 660, duration: 0.12, volume: 0.055, type: 'triangle' })
    setTimeout(() => playTone({ freq: 660, freqEnd: 880, duration: 0.16, volume: 0.055, type: 'triangle' }), 110)
  } else {
    playTone({ freq: 220, freqEnd: 70, duration: 0.24, volume: 0.065, type: 'sawtooth' })
  }
}

// ─── GAME STATE (non-reactive for perf) ─────────────────────
let ctx = null
let animId = null
let lastTime = 0
let frameN = 0
let bgOffset = 0
let mapTheme = 0
let nextId = 0

let playerData = null
let bullets = []
let enemies = []
let particles = []
let killTexts = []
let spawnQueue = []
let spawnElapsed = 0
let waveAnnTimer = 0

let dmgBonus = 0
let speedBonus = 0
let weaponLevels = {
  keyboard: 0,
  laser: 0,
  shotgun: 0,
  machinegun: 0,
  sniper: 0,
  cannon: 0,
}
const keys = { up: false, down: false }
let touchY = null
let enemyBullets = []
let hpOrbs = []
let comboCount = 0
let comboTimer = 0
let shakeTime = 0

// ─── HELPERS ────────────────────────────────────────────────
function rr(c, x, y, w, h, r) {
  c.beginPath()
  c.moveTo(x+r, y)
  c.lineTo(x+w-r, y)
  c.quadraticCurveTo(x+w, y, x+w, y+r)
  c.lineTo(x+w, y+h-r)
  c.quadraticCurveTo(x+w, y+h, x+w-r, y+h)
  c.lineTo(x+r, y+h)
  c.quadraticCurveTo(x, y+h, x, y+h-r)
  c.lineTo(x, y+r)
  c.quadraticCurveTo(x, y, x+r, y)
  c.closePath()
}

function spawnParticles(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const spd = 1.5 + Math.random() * 2.5
    particles.push({ x, y, vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd - 1,
      color, size: 3 + Math.random()*4, origSize: 7, life: 40+Math.random()*30, maxLife: 70 })
  }
}

function spawnKillText(x, y, texts, color) {
  const txt = texts[Math.floor(Math.random() * texts.length)]
  killTexts.push({ x, y: y-10, text: txt, vy: 1.2, life: 90, maxLife: 90, color })
}

// ─── DRAW BACKGROUND ─────────────────────────────────────────
function drawBg() {
  const off = bgOffset
  const f = frameN

  if (mapTheme === 0) {
    // Office night
    ctx.fillStyle = '#0a1628'
    ctx.fillRect(0, 0, CW, CH)
    ctx.fillStyle = '#0d1e36'
    ctx.fillRect(0, CH-50, CW, 50)
    ctx.strokeStyle = '#1565c0'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, CH-50); ctx.lineTo(CW, CH-50); ctx.stroke()

    // Grid
    ctx.strokeStyle = 'rgba(26,127,222,0.07)'
    ctx.lineWidth = 0.5
    const go = (off*0.15)%80
    for (let gx = -go; gx < CW; gx+=80) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,CH-50); ctx.stroke() }
    for (let gy = 0; gy < CH-50; gy+=80) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(CW,gy); ctx.stroke() }

    // Desks
    const do2 = (off*0.4)%280
    for (let dx = -do2; dx < CW+280; dx+=280) {
      ctx.fillStyle = '#1a2a3a'; ctx.fillRect(dx, CH-90, 120, 8)
      ctx.fillRect(dx+10, CH-90, 8, 40); ctx.fillRect(dx+100, CH-90, 8, 40)
      ctx.fillStyle = '#0d1e36'; ctx.fillRect(dx+35, CH-135, 60, 42)
      ctx.strokeStyle = '#1565c0'; ctx.lineWidth = 1.5; ctx.strokeRect(dx+35, CH-135, 60, 42)
      const ga = 0.3 + Math.sin(f*0.03+dx*0.01)*0.1
      ctx.fillStyle = `rgba(0,168,255,${ga})`; ctx.fillRect(dx+38, CH-132, 54, 35)
      ctx.fillStyle = `rgba(0,255,136,${ga*0.8})`
      for (let li=0; li<4; li++) ctx.fillRect(dx+41, CH-128+li*8, 20+(dx*7+li*13)%20, 2)
      ctx.fillStyle = '#1a2a3a'; ctx.fillRect(dx+59, CH-95, 10, 5)
    }

  } else if (mapTheme === 1) {
    // Server room
    ctx.fillStyle = '#050e1a'
    ctx.fillRect(0, 0, CW, CH)
    ctx.fillStyle = '#070f1f'; ctx.fillRect(0, CH-50, CW, 50)
    const ro = (off*0.35)%160
    for (let rx = -ro; rx < CW+160; rx+=160) {
      ctx.fillStyle = '#0d1a2e'; ctx.fillRect(rx, 20, 80, CH-70)
      ctx.strokeStyle = '#1a3a5c'; ctx.lineWidth = 1.5; ctx.strokeRect(rx, 20, 80, CH-70)
      for (let ru=0; ru<12; ru++) {
        ctx.strokeStyle = '#1a3a5c'; ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.moveTo(rx, 20+ru*32); ctx.lineTo(rx+80, 20+ru*32); ctx.stroke()
        const blink = Math.sin(f*0.08+ru*0.5+rx*0.01)
        const isErr = (f+rx+ru*50)%200<5
        ctx.fillStyle = ru%3===0 ? (blink>0.3?'#4caf50':'#2e7d32') : ru%3===1 ? (Math.sin(f*0.2+ru*2)>0.5?'#ff9800':'#e65100') : (isErr?'#f44336':'#1a0000')
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = isErr ? 8 : 5
        ctx.beginPath(); ctx.arc(rx+68, 20+ru*32+16, 4, 0, Math.PI*2); ctx.fill()
        ctx.shadowBlur = 0
      }
    }

  } else {
    // Production crash
    const gr = ctx.createLinearGradient(0,0,0,CH)
    gr.addColorStop(0,'#1a0505'); gr.addColorStop(1,'#0d0000')
    ctx.fillStyle = gr; ctx.fillRect(0,0,CW,CH)
    const alerts = [
      {dx:50, dy:40, w:160, msg:'⚠️ PRODUCTION DOWN'},
      {dx:280, dy:120, w:190, msg:'❌ 500 INTERNAL ERROR'},
      {dx:510, dy:60, w:160, msg:'🔥 DB OVERLOADED'},
      {dx:170, dy:220, w:170, msg:'💀 NULL POINTER'},
      {dx:430, dy:195, w:180, msg:'😱 MEMORY OVERFLOW'},
    ]
    for (const a of alerts) {
      const ax = ((a.dx - (off*0.6)%400 + CW+400) % (CW+400)) - 200
      const ay = a.dy + Math.sin(f*0.02+a.dx*0.01)*8
      const al = 0.2+Math.sin(f*0.04+a.dx*0.02)*0.08
      ctx.globalAlpha = al
      ctx.fillStyle = '#200000'; ctx.fillRect(ax, ay, a.w, 50)
      ctx.strokeStyle = '#f44336'; ctx.lineWidth = 1.5; ctx.strokeRect(ax, ay, a.w, 50)
      ctx.fillStyle = '#f44336'; ctx.font = '11px monospace'; ctx.textAlign = 'left'
      ctx.fillText(a.msg, ax+8, ay+30); ctx.globalAlpha = 1
    }
    ctx.fillStyle = '#150000'; ctx.fillRect(0, CH-50, CW, 50)
    const so = (off*1)%40
    for (let sx=-so; sx<CW; sx+=40) {
      ctx.fillStyle = 'rgba(244,67,54,0.12)'
      ctx.beginPath(); ctx.moveTo(sx,CH-50); ctx.lineTo(sx+20,CH-50); ctx.lineTo(sx+40,CH); ctx.lineTo(sx+20,CH); ctx.closePath(); ctx.fill()
    }
    if ((f+off*0.1)%80<2) { ctx.globalAlpha=0.25; ctx.fillStyle='#f44336'; ctx.fillRect(0,Math.random()*CH,CW,2); ctx.globalAlpha=1 }
  }
}

// ─── DRAW PLAYER ────────────────────────────────────────────
function drawPlayer() {
  const p = playerData
  if (p.invTimer > 0 && Math.floor(p.invTimer/80)%2===1) return
  const x = Math.round(p.x), y = Math.round(p.y)
  const px = x-20, py = y-26

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(x, y+26, 16, 5, 0, 0, Math.PI*2); ctx.fill()

  // Pants
  ctx.fillStyle = '#1a237e'
  ctx.fillRect(px+8, py+36, 9, 14); ctx.fillRect(px+22, py+36, 9, 14)
  ctx.fillStyle = '#263238'; ctx.fillRect(px+6, py+48, 12, 5); ctx.fillRect(px+21, py+48, 12, 5)

  // Hoodie body — color from selected character
  const hc = playerData.color || '#1565c0'
  ctx.fillStyle = hc
  rr(ctx, px+4, py+17, 32, 20, 4); ctx.fill()
  ctx.fillStyle = hc + 'cc'; ctx.fillRect(px+12, py+23, 16, 12)

  // Hood bg
  ctx.fillStyle = hc; ctx.beginPath(); ctx.arc(x, py+11, 14, 0, Math.PI*2); ctx.fill()
  // Head
  ctx.fillStyle = '#FFCC80'; ctx.beginPath(); ctx.arc(x, py+11, 12, 0, Math.PI*2); ctx.fill()
  // Hair
  ctx.fillStyle = '#4e342e'; ctx.beginPath(); ctx.arc(x, py+5, 10, Math.PI+0.15, -0.15); ctx.fill()

  // Glasses
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5
  ctx.strokeRect(px+10, py+7, 8, 6)
  ctx.strokeRect(px+22, py+7, 8, 6)
  ctx.beginPath(); ctx.moveTo(px+18, py+10); ctx.lineTo(px+22, py+10); ctx.stroke()
  // Eyes
  ctx.fillStyle = hc; ctx.fillRect(px+12, py+9, 4, 3); ctx.fillRect(px+24, py+9, 4, 3)

  // Keyboard weapon
  ctx.fillStyle = '#263238'; rr(ctx, px+36, py+20, 22, 14, 3); ctx.fill()
  ctx.fillStyle = '#1976d2'; ctx.fillRect(px+38, py+21, 18, 2)
  ctx.fillStyle = '#37474f'
  for (let ki=0; ki<3; ki++) for (let kj=0; kj<3; kj++) ctx.fillRect(px+39+ki*6, py+25+kj*3, 4, 2)
  ctx.fillStyle = '#00d4ff'; ctx.fillRect(px+51, py+25, 6, 8) // ENTER key
}

// ─── DRAW ENEMY ─────────────────────────────────────────────
function drawEnemy(e) {
  const { x, y, type, hp: ehp, maxHp: emhp, flash } = e
  const fl = flash > 0

  if (type === 'SmallBug') {
    ctx.fillStyle = fl ? '#fff' : '#4caf50'
    ctx.beginPath(); ctx.ellipse(x, y, 14, 10, 0, 0, Math.PI*2); ctx.fill()
    ctx.strokeStyle = fl ? '#fff' : '#388e3c'; ctx.lineWidth = 1.5
    for (let i=-1; i<=1; i++) {
      ctx.beginPath(); ctx.moveTo(x+i*5, y-3); ctx.lineTo(x+i*5-8, y-12); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x+i*5, y+3); ctx.lineTo(x+i*5-8, y+10); ctx.stroke()
    }
    ctx.fillStyle = '#f44336'
    ctx.beginPath(); ctx.arc(x-5, y-3, 2.5, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(x+5, y-3, 2.5, 0, Math.PI*2); ctx.fill()

  } else if (type === 'MemoryLeak') {
    const wb = Math.sin(frameN*0.05+e.id)*3
    ctx.fillStyle = fl ? '#fff' : '#00bcd4'
    ctx.beginPath()
    ctx.moveTo(x-18+wb, y)
    ctx.bezierCurveTo(x-18+wb, y-18, x+18-wb, y-18, x+18-wb, y)
    ctx.bezierCurveTo(x+18-wb, y+16, x-18+wb, y+16, x-18+wb, y)
    ctx.fill()
    ctx.fillStyle = fl ? '#fff' : 'rgba(0,188,212,0.5)'
    for (let i=-1; i<=1; i++) {
      ctx.beginPath(); ctx.arc(x+i*7, y+16+Math.sin(frameN*0.06+i)*4, 3, 0, Math.PI*2); ctx.fill()
    }
    ctx.fillStyle = '#004d40'
    ctx.beginPath(); ctx.arc(x-6, y-4, 4, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(x+6, y-4, 4, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#00e5ff'
    ctx.beginPath(); ctx.arc(x-6, y-4, 2, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(x+6, y-4, 2, 0, Math.PI*2); ctx.fill()
    drawHpBar(x, y-20, e.w, ehp, emhp)

  } else if (type === 'ProductionBug') {
    const r = 24
    ctx.fillStyle = fl ? '#fff' : '#c62828'
    ctx.beginPath()
    for (let i=0; i<6; i++) {
      const a = (i/6)*Math.PI*2-Math.PI/6
      i===0 ? ctx.moveTo(x+r*Math.cos(a), y+r*Math.sin(a)) : ctx.lineTo(x+r*Math.cos(a), y+r*Math.sin(a))
    }
    ctx.closePath(); ctx.fill()
    const r2 = 17
    ctx.fillStyle = fl ? '#fff' : '#f44336'
    ctx.beginPath()
    for (let i=0; i<6; i++) {
      const a = (i/6)*Math.PI*2-Math.PI/6
      i===0 ? ctx.moveTo(x+r2*Math.cos(a), y+r2*Math.sin(a)) : ctx.lineTo(x+r2*Math.cos(a), y+r2*Math.sin(a))
    }
    ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.fillRect(x-10, y-7, 8, 5); ctx.fillRect(x+2, y-7, 8, 5)
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(x-11, y-13); ctx.lineTo(x-2, y-9); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x+2, y-9); ctx.lineTo(x+11, y-13); ctx.stroke()
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'
    ctx.fillText('!', x, y-32)
    drawHpBar(x, y-28, e.w, ehp, emhp)

  } else if (type === 'FlyingBug') {
    const wf = Math.sin(frameN*0.3+e.id)*0.4
    ctx.fillStyle = fl ? 'rgba(255,255,255,0.3)' : 'rgba(171,71,188,0.3)'
    ctx.strokeStyle = fl ? '#fff' : '#ce93d8'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.ellipse(x-16, y-4-wf*8, 13, 8, -0.3+wf, 0, Math.PI*2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(x+16, y-4-wf*8, 13, 8, 0.3-wf, 0, Math.PI*2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = fl ? '#fff' : '#ab47bc'
    ctx.beginPath(); ctx.ellipse(x, y, 12, 8, 0, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = fl ? '#fff' : '#ba68c8'
    ctx.beginPath(); ctx.arc(x-9, y-1, 7, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(x-12, y-3, 2.5, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(x-6, y-3, 2.5, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#4a148c'
    ctx.beginPath(); ctx.arc(x-12, y-3, 1.2, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(x-6, y-3, 1.2, 0, Math.PI*2); ctx.fill()

  } else if (type === 'DeadlineMonster') {
    const pulse = Math.sin(frameN*0.05)*0.08+1
    const r = 40*pulse
    ctx.shadowColor = '#ff5722'; ctx.shadowBlur = 25
    ctx.fillStyle = fl ? '#fff' : '#1a0000'
    ctx.beginPath()
    for (let i=0; i<8; i++) {
      const a = (i/8)*Math.PI*2
      const rr2 = i%2===0 ? r : r*0.72
      i===0 ? ctx.moveTo(x+rr2*Math.cos(a), y+rr2*Math.sin(a)) : ctx.lineTo(x+rr2*Math.cos(a), y+rr2*Math.sin(a))
    }
    ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0
    ctx.shadowColor = '#f44336'; ctx.shadowBlur = 18
    ctx.fillStyle = '#f44336'
    ctx.beginPath(); ctx.arc(x-14, y-10, 9, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(x+14, y-10, 9, 0, Math.PI*2); ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffd700'
    ctx.beginPath(); ctx.arc(x-14, y-10, 4, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(x+14, y-10, 4, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#ff8a65'
    for (let i=-2; i<=2; i++) {
      ctx.beginPath(); ctx.moveTo(x+i*10-4, y+r*0.65); ctx.lineTo(x+i*10, y+r*0.85); ctx.lineTo(x+i*10+4, y+r*0.65); ctx.closePath(); ctx.fill()
    }
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'
    ctx.fillText('DEADLINE', x, y+4)
    // Boss HP bar at top
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(100, 8, CW-200, 18)
    const bhr = ehp/emhp
    const bgd = ctx.createLinearGradient(100, 0, 100+(CW-200)*bhr, 0)
    bgd.addColorStop(0,'#f44336'); bgd.addColorStop(0.5,'#ff9800'); bgd.addColorStop(1,'#ffd700')
    ctx.fillStyle = bgd; ctx.fillRect(100, 8, (CW-200)*bhr, 18)
    ctx.strokeStyle = '#ff5722'; ctx.lineWidth = 2; ctx.strokeRect(100, 8, CW-200, 18)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
    ctx.fillText(`💀 DEADLINE MONSTER  ${ehp}/${emhp}`, CW/2, 21)
    const aliveBossCount = enemies.filter((enemy) => enemy.type === 'DeadlineMonster' && !enemy.dead).length
    const phaseText = bhr > 0.66 ? 'PHASE 1' : bhr > 0.33 ? 'PHASE 2' : 'ENRAGED'
    ctx.font = 'bold 9px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`BOSS ${aliveBossCount > 1 ? `x${aliveBossCount}` : ''}`, 102, 30)
    ctx.textAlign = 'right'
    ctx.fillText(phaseText, CW-102, 30)
    ctx.textAlign = 'center'
    drawHpBar(x, y-50, 90, ehp, emhp)
  }
}

function drawHpBar(x, y, w, hp2, maxHp2) {
  if (maxHp2 <= 1) return
  const bw = w+8, bx = x-bw/2
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(bx, y, bw, 5)
  const r = hp2/maxHp2
  ctx.fillStyle = r>0.5 ? '#4caf50' : r>0.25 ? '#ff9800' : '#f44336'
  ctx.fillRect(bx, y, bw*r, 5)
}

function drawBullet(b) {
  if (b.type === 'keyboard') {
    ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 10
    ctx.fillStyle = '#00d4ff'; ctx.fillRect(b.x-b.size/2, b.y-b.size/2, b.size, b.size)
    ctx.shadowBlur = 0
  } else if (b.type === 'laser') {
    ctx.strokeStyle = '#ff4081'; ctx.lineWidth = 3
    ctx.shadowColor = '#ff4081'; ctx.shadowBlur = 12
    ctx.beginPath(); ctx.moveTo(b.x-b.vx*4, b.y-b.vy*4); ctx.lineTo(b.x+b.vx*2, b.y+b.vy*2); ctx.stroke()
    ctx.shadowBlur = 0
  } else if (b.type === 'shotgun') {
    ctx.shadowColor = '#ff9800'; ctx.shadowBlur = 8
    ctx.fillStyle = '#ff9800'
    ctx.beginPath(); ctx.arc(b.x, b.y, b.size/2, 0, Math.PI*2); ctx.fill()
    ctx.shadowBlur = 0

  } else if (b.type === 'machinegun') {
    ctx.shadowColor = '#ffeb3b'; ctx.shadowBlur = 5
    ctx.fillStyle = '#ffeb3b'
    ctx.fillRect(b.x - b.size*1.8, b.y - 2, b.size*3, 4)
    ctx.shadowBlur = 0

  } else if (b.type === 'sniper') {
    ctx.strokeStyle = '#e040fb'; ctx.lineWidth = b.size * 0.7
    ctx.shadowColor = '#e040fb'; ctx.shadowBlur = 22
    ctx.beginPath()
    ctx.moveTo(b.x - b.vx*6, b.y - b.vy*6)
    ctx.lineTo(b.x + b.vx*2, b.y + b.vy*2)
    ctx.stroke()
    ctx.shadowBlur = 0

  } else if (b.type === 'cannon') {
    const pulse = Math.sin(frameN*0.3)*4
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 22+pulse
    ctx.fillStyle = '#ffd700'
    ctx.beginPath(); ctx.arc(b.x, b.y, b.size/2, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, b.size/4, 0, Math.PI*2); ctx.fill()
    ctx.shadowBlur = 0
  }
}

// ─── DRAW ALL ────────────────────────────────────────────────
function drawAll() {
  if (!ctx) return
  ctx.clearRect(0, 0, CW, CH)
  drawBg()

  // Particles behind
  for (const p of particles) {
    const al = p.life / p.maxLife
    ctx.globalAlpha = al; ctx.fillStyle = p.color
    ctx.shadowColor = p.color; ctx.shadowBlur = 5
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.size*al), 0, Math.PI*2); ctx.fill()
    ctx.shadowBlur = 0; ctx.globalAlpha = 1
  }

  // Enemies
  ctx.textAlign = 'center'
  for (const e of enemies) drawEnemy(e)

  // Player
  if (playerData && (gs.value === 'playing' || gs.value === 'upgrade' || gs.value === 'gameover')) {
    drawPlayer()
  }

  // Bullets
  for (const b of bullets) drawBullet(b)

  // Enemy bullets
  for (const eb of enemyBullets) {
    ctx.shadowColor = eb.boss ? '#ff1744' : '#ff5252'
    ctx.shadowBlur = eb.boss ? 14 : 8
    ctx.fillStyle = eb.boss ? '#ff1744' : '#ff5252'
    ctx.beginPath(); ctx.arc(eb.x, eb.y, eb.boss ? 7 : 5, 0, Math.PI*2); ctx.fill()
    // Inner bright core
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(eb.x, eb.y, eb.boss ? 3 : 2, 0, Math.PI*2); ctx.fill()
    ctx.shadowBlur = 0
  }

  // HP orbs
  ctx.textAlign = 'center'
  for (const o of hpOrbs) {
    const al = Math.min(1, o.life / 80)
    ctx.globalAlpha = al
    ctx.shadowColor = '#4caf50'; ctx.shadowBlur = 16
    ctx.fillStyle = '#4caf50'
    ctx.beginPath(); ctx.arc(o.x, o.y, 9, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'
    ctx.fillText('+HP', o.x, o.y+3)
    ctx.shadowBlur = 0; ctx.globalAlpha = 1
  }

  // Kill texts
  ctx.textAlign = 'center'
  for (const kt of killTexts) {
    const al = kt.life / kt.maxLife
    ctx.globalAlpha = al; ctx.fillStyle = kt.color
    ctx.shadowColor = kt.color; ctx.shadowBlur = 8
    ctx.font = `bold 14px monospace`; ctx.fillText(kt.text, kt.x, kt.y)
    ctx.shadowBlur = 0; ctx.globalAlpha = 1
  }

  // Idle background overlay
  if (gs.value === 'idle') {
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, CW, CH)
  }
}

// ─── UPDATE ─────────────────────────────────────────────────
function update(dt) {
  bgOffset += 2*dt
  frameN++

  // Player movement
  const spd = (playerData.speed || 6) * dt * (coffeeTimer.value > 0 ? 1.8 : 1)
  if (touchY !== null) {
    const dy = touchY - playerData.y
    playerData.y += Math.sign(dy) * Math.min(Math.abs(dy)*0.15, spd*1.2)
  } else {
    if (keys.up) playerData.y = Math.max(30, playerData.y - spd)
    if (keys.down) playerData.y = Math.min(CH-30, playerData.y + spd)
  }
  if (playerData.invTimer > 0) playerData.invTimer -= dt*16.67

  // Coffee / cannon cooldown
  if (coffeeTimer.value > 0) coffeeTimer.value -= dt*16.67
  if (cannonCooldown.value > 0) cannonCooldown.value = Math.max(0, cannonCooldown.value - dt*16.67)

  // Auto fire
  playerData.fireTimer -= dt*16.67
  if (playerData.fireTimer <= 0 && enemies.length > 0) {
    autoFire()
    const baseDelay = currentWeapon.value === 'laser' ? 150 : 300
    playerData.fireTimer = Math.max(60, baseDelay - speedBonus*35)
  }

  // Update bullets
  for (const b of bullets) {
    // Homing laser tracks target
    if (b.target && !b.target.dead && b.target.hp > 0) {
      const tdx = b.target.x - b.x, tdy = b.target.y - b.y
      const tlen = Math.hypot(tdx, tdy)||1
      b.vx += (tdx/tlen)*1.2*dt; b.vy += (tdy/tlen)*1.2*dt
      const bspd = Math.hypot(b.vx,b.vy)
      if (bspd > 18) { b.vx = b.vx/bspd*18; b.vy = b.vy/bspd*18 }
    }
    b.x += b.vx*dt; b.y += b.vy*dt
    if (b.maxRange && Math.abs(b.x - b.startX) > b.maxRange) b.dead = true
    if (b.x > CW+60 || b.x < -60 || b.y < -60 || b.y > CH+60) b.dead = true
  }

  // Update enemies
  for (const e of enemies) {
    if (e.flash > 0) e.flash -= dt*16.67
    if (e.type === 'SmallBug') {
      e.x -= e.speed*dt
    } else if (e.type === 'MemoryLeak') {
      e.x -= e.speed*dt
      e.y += Math.sin(frameN*0.04+e.id*0.5)*1.2*dt
      e.y = Math.max(30, Math.min(CH-80, e.y))
    } else if (e.type === 'ProductionBug') {
      const charge = (frameN+e.id*30)%200<25
      e.x -= e.speed*(charge?3.5:1)*dt
      // Shoot at player
      if (!e.shootTimer) e.shootTimer = 2500+Math.random()*1000
      e.shootTimer -= dt*16.67
      if (e.shootTimer <= 0) { shootEnemyBullet(e); e.shootTimer = 2500+Math.random()*800 }
    } else if (e.type === 'FlyingBug') {
      e.x -= e.speed*dt
      e.y += Math.sin(frameN*0.08+e.id)*2.5*dt
      e.y = Math.max(30, Math.min(CH-70, e.y))
    } else if (e.type === 'DeadlineMonster') {
      if (e.x > CW*0.52) {
        e.x -= e.speed*dt
      } else {
        const ddy = playerData.y - e.y
        if (Math.abs(ddy) > 5) e.y += Math.sign(ddy)*Math.min(Math.abs(ddy)*0.04, e.speed*1.5)*dt
        if ((frameN+e.id*60)%260<22) e.x -= e.speed*4*dt
      }
      // Boss shoots 3-way spread
      if (!e.shootTimer) e.shootTimer = 1500+Math.random()*500
      e.shootTimer -= dt*16.67
      if (e.shootTimer <= 0) { shootEnemyBullet(e); e.shootTimer = 1500+Math.random()*500 }
    }
    // Off-screen: damage player
    if (e.x < -100) {
      if (playerData.invTimer <= 0) {
        damagePlayer(Math.floor(e.config.dmg*0.4))
      }
      e.dead = true
    }
  }

  // Update particles
  for (const p of particles) {
    p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 0.15*dt
    p.life -= dt*16.67
  }

  // Update kill texts
  for (const kt of killTexts) { kt.y -= kt.vy*dt; kt.life -= dt*16.67 }

  // Update enemy bullets
  for (const eb of enemyBullets) {
    eb.x += eb.vx*dt; eb.y += eb.vy*dt
    if (eb.x < -60 || eb.x > CW+60 || eb.y < -60 || eb.y > CH+60) eb.dead = true
  }

  // Update HP orbs (float up then attract to player)
  for (const o of hpOrbs) {
    o.life -= dt*16.67
    o.y -= o.vy*dt; o.vy = Math.max(0, o.vy - 0.03*dt)
    const odx = playerData.x - o.x, ody = playerData.y - o.y
    const od = Math.hypot(odx, ody)||1
    if (od < 100) { o.x += (odx/od)*4*dt; o.y += (ody/od)*4*dt }
    if (od < 22) { playerData.hp = Math.min(playerData.hp+20, maxHp.value); hp.value = playerData.hp; spawnParticles(o.x, o.y, '#4caf50', 6); o.life = 0 }
  }

  // Combo decay
  if (comboTimer > 0) { comboTimer -= dt*16.67 } else { comboCount = 0; comboDisplay.value = 0 }

  // Screen shake decay
  if (shakeTime > 0) shakeTime -= dt*16.67

  // Collisions
  checkCollisions()

  // Spawn queue
  spawnElapsed += dt*16.67
  while (spawnQueue.length > 0 && spawnQueue[0].at <= spawnElapsed) {
    const s = spawnQueue.shift()
    spawnEnemy(s.type)
  }

  // Wave complete?
  if (spawnQueue.length === 0 && enemies.length === 0 && gs.value === 'playing') {
    waveComplete()
  }

  // Cleanup
  bullets = bullets.filter(b => !b.dead)
  enemies = enemies.filter(e => !e.dead)
  particles = particles.filter(p => p.life > 0)
  killTexts = killTexts.filter(kt => kt.life > 0)
  enemyBullets = enemyBullets.filter(eb => !eb.dead)
  hpOrbs = hpOrbs.filter(o => o.life > 0)
}

function autoFire() {
  let nearest = null, minD = Infinity
  for (const e of enemies) {
    const d = Math.hypot(e.x - playerData.x, e.y - playerData.y)
    if (d < minD) { minD = d; nearest = e }
  }
  if (!nearest) return

  const dx = nearest.x - playerData.x
  const dy = nearest.y - playerData.y
  const len = Math.hypot(dx, dy) || 1
  const frMult = selectedChar.value.passive === 'firerate' ? 0.75 : 1
  const px2 = playerData.x + 22, py2 = playerData.y
  const wep = currentWeapon.value
  const weaponLv = weaponLevels[wep] || 0

  if (wep === 'laser') {
    const homing = selectedChar.value.passive === 'homing'
    bullets.push({ id:nextId++, x:px2, y:py2, vx:(dx/len)*16, vy:(dy/len)*16,
      dmg:2+dmgBonus+weaponLv, type:'laser', size:4, dead:false, target: homing ? nearest : null })
    playerData.fireTimer = Math.max(45, (150-speedBonus*25-weaponLv*10)*frMult)
    playShootSfx('laser')

  } else if (wep === 'shotgun') {
    const baseA = Math.atan2(dy, dx)
    const pelletCount = 5 + weaponLv * 2
    const halfSpread = Math.floor(pelletCount / 2)
    for (let i=-halfSpread; i<=halfSpread; i++) {
      const a = baseA + i * Math.max(0.12, 0.24 - weaponLv * 0.02)
      bullets.push({ id:nextId++, x:px2, y:py2, vx:Math.cos(a)*11, vy:Math.sin(a)*11,
        dmg:1+dmgBonus+Math.floor(weaponLv/2), type:'shotgun', size:5, dead:false, startX:px2, maxRange:340 + weaponLv * 60 })
    }
    playerData.fireTimer = Math.max(150, (560-speedBonus*40-weaponLv*35)*frMult)
    playShootSfx('shotgun')

  } else if (wep === 'machinegun') {
    bullets.push({ id:nextId++, x:px2, y:py2, vx:15, vy:(Math.random()-0.5)*1.8,
      dmg:1+Math.floor(dmgBonus*0.5)+Math.floor((weaponLv+1)/2), type:'machinegun', size:3, dead:false })
    playerData.fireTimer = Math.max(28, (90-speedBonus*8-weaponLv*8)*frMult)
    playShootSfx('machinegun')

  } else if (wep === 'sniper') {
    bullets.push({ id:nextId++, x:px2, y:py2, vx:(dx/len)*24, vy:(dy/len)*24,
      dmg:14+dmgBonus*2+weaponLv*4, type:'sniper', size:8, dead:false, piercing:true })
    playerData.fireTimer = Math.max(280, (1200-speedBonus*80-weaponLv*90)*frMult)
    playShootSfx('sniper')

  } else {
    // keyboard — straight horizontal
    bullets.push({ id:nextId++, x:px2, y:py2, vx:12+weaponLv*0.8, vy:0, dmg:1+dmgBonus+weaponLv, type:'keyboard', size:6, dead:false })
    playerData.fireTimer = Math.max(45, (300-speedBonus*35-weaponLv*20)*frMult)
    playShootSfx('keyboard')
  }
}

function shootEnemyBullet(e) {
  const dx = playerData.x - e.x, dy = playerData.y - e.y
  const len = Math.hypot(dx, dy)||1
  const spd = e.type === 'DeadlineMonster' ? 7 : 4.5
  if (e.type === 'DeadlineMonster') {
    for (const angle of [-0.35, 0, 0.35]) {
      const cos = Math.cos(angle), sin = Math.sin(angle)
      const nx = (dx/len)*cos - (dy/len)*sin
      const ny = (dx/len)*sin + (dy/len)*cos
      enemyBullets.push({ x:e.x-e.w/2, y:e.y, vx:nx*spd, vy:ny*spd, dmg:15, dead:false, boss:true })
    }
  } else {
    enemyBullets.push({ x:e.x-e.w/2, y:e.y, vx:(dx/len)*spd, vy:(dy/len)*spd, dmg:10, dead:false, boss:false })
  }
}

function checkCollisions() {
  // Player bullets vs enemies
  for (const b of bullets) {
    if (b.dead) continue
    for (const e of enemies) {
      if (e.dead) continue
      const hitR = Math.max(e.w, e.h)/2 + b.size/2
      if (Math.hypot(b.x-e.x, b.y-e.y) < hitR) {
        e.hp -= b.dmg
        e.flash = 120
        playHitSfx(!!e.config.isBoss)
        spawnParticles(b.x, b.y, e.config.color, 5)
        if (b.type !== 'cannon' && !b.piercing) b.dead = true
        if (e.hp <= 0) killEnemy(e)
        if (b.type !== 'cannon' && !b.piercing) break
      }
    }
  }
  // Enemies vs player (contact)
  if (playerData && playerData.invTimer <= 0) {
    for (const e of enemies) {
      if (e.dead) continue
      if (Math.hypot(e.x-playerData.x, e.y-playerData.y) < Math.max(e.w,e.h)/2+16) {
        if (shield.value > 0) { shield.value--; spawnParticles(playerData.x, playerData.y, '#00d4ff', 10) }
        else { damagePlayer(e.config.dmg) }
        e.dead = true
      }
    }
    // Enemy bullets vs player
    for (const eb of enemyBullets) {
      if (eb.dead) continue
      if (Math.hypot(eb.x-playerData.x, eb.y-playerData.y) < 22) {
        if (shield.value > 0) { shield.value--; spawnParticles(playerData.x, playerData.y, '#00d4ff', 8) }
        else { damagePlayer(eb.dmg) }
        eb.dead = true
      }
    }
  }
}

function killEnemy(e) {
  e.dead = true
  playEnemyDownSfx(!!e.config.isBoss)
  // Combo system
  if (comboTimer > 0) { comboCount++ } else { comboCount = 1 }
  comboTimer = 2200
  comboDisplay.value = comboCount
  // Score with combo bonus
  const mult = comboCount >= 10 ? 5 : comboCount >= 6 ? 3 : comboCount >= 3 ? 2 : 1
  const scoreMult = selectedChar.value.passive === 'score' ? 1.15 : 1
  score.value += Math.floor((e.config.score + wave.value*2) * mult * scoreMult)
  bugsKilled.value++
  // Visual
  spawnParticles(e.x, e.y, e.config.color, e.config.isBoss ? 25 : 12)
  spawnKillText(e.x, e.y-e.h/2, e.config.killTexts, e.config.color)
  if (comboCount >= 3) spawnKillText(e.x, e.y-e.h/2-28, [`COMBO ×${comboCount}!`], '#ffd700')
  // HP orb drop (chance scales with enemy tier)
  const dropChance = e.config.isBoss ? 0.8 : e.config.hp > 5 ? 0.3 : 0.12
  if (Math.random() < dropChance) {
    hpOrbs.push({ x:e.x, y:e.y, vy:1.5, life:400, maxLife:400 })
  }
}

function damagePlayer(dmg) {
  const actualDmg = selectedChar.value.passive === 'armor' ? Math.floor(dmg * 0.75) : dmg
  dmg = actualDmg
  playDamageSfx()
  playerData.hp = Math.max(0, playerData.hp - dmg)
  hp.value = playerData.hp
  playerData.invTimer = 1200
  shakeTime = 380
  spawnParticles(playerData.x, playerData.y, '#f44336', 8)
  if (hp.value <= 0) triggerGameOver()
}

function spawnEnemy(type) {
  const cfg = ENEMY_CFG[type]
  const hpExtra = cfg.isBoss
    ? Math.floor(wave.value * 4 + Math.floor((wave.value - 1) / 5) * 18)
    : Math.floor(wave.value * 0.6)
  enemies.push({
    id: nextId++, type, config: cfg,
    x: CW + cfg.w/2,
    y: 50 + Math.random()*(CH-120),
    speed: cfg.speed + Math.random()*0.4 + wave.value*0.12,
    hp: cfg.hp + hpExtra, maxHp: cfg.hp + hpExtra,
    w: cfg.w, h: cfg.h, flash: 0, dead: false,
  })
}

// ─── WAVE GENERATOR (for waves 11-100) ──────────────────────
const EXTRA_TITLES = [
  '⚡ Bug siêu tốc!', '😱 Đêm dài không ngủ...', '🔥 Production đang cháy!',
  '🌊 Sóng thần Bug!', '💣 Bom hẹn giờ kích hoạt!', '🤖 Bug tự nhân bản!',
  '🎯 Bug bắn tỉa!', '💥 Tổng tấn công hệ thống!', '🚨 Cảnh báo đỏ!',
  '😈 Bug tiến hóa!', '⚠️ Hệ thống sắp sập!', '🌀 Lỗi vô hạn!',
  '🔴 Server room bốc khói!', '💀 Không thể vá được!', '🧨 Database bị xóa!',
]

function getWaveConfig(waveNum) {
  if (waveNum <= WAVE_CFG.length) return WAVE_CFG[waveNum-1]
  const diff = Math.floor((waveNum - 1) / 5)      // 0-19 difficulty tier
  const isBoss = waveNum % 5 === 0
  const theme = Math.floor((waveNum - 1) / 4) % 3
  const spd = Math.max(200, 600 - diff * 35)
  const bossCount = Math.min(3, 1 + Math.floor(diff / 4))
  const spawns = [
    { type:'SmallBug',      count: 10 + diff*4,                 interval: Math.max(200, spd) },
    { type:'MemoryLeak',    count: 3  + Math.floor(diff*0.9),   interval: Math.max(500, spd*2.2) },
    { type:'FlyingBug',     count: 3  + Math.floor(diff*0.7),   interval: Math.max(400, spd*2) },
    { type:'ProductionBug', count: 2  + Math.floor(diff*0.6),   interval: Math.max(700, spd*3) },
  ]
  if (isBoss) spawns.push({ type:'DeadlineMonster', count: bossCount, interval: Math.max(3000, 7000-diff*150) })
  return {
    title: isBoss ? `💀 BOSS WAVE ${waveNum} — ${bossCount} DEADLINE MONSTER!` : EXTRA_TITLES[(waveNum-11) % EXTRA_TITLES.length],
    theme, isBoss, spawns,
  }
}

// ─── WAVE SYSTEM ────────────────────────────────────────────
function startWave(waveNum) {
  const wc = getWaveConfig(waveNum)
  if (!wc) return
  mapTheme = wc.theme ?? 0
  spawnElapsed = 0
  spawnQueue = []
  let t = 500
  for (const s of wc.spawns) {
    for (let i=0; i<s.count; i++) {
      spawnQueue.push({ type: s.type, at: t })
      t += s.interval
    }
  }
  spawnQueue.sort((a,b)=>a.at-b.at)
  waveTitle.value = wc.title
  waveAnn.value = true
  waveAnnTimer = setTimeout(() => { waveAnn.value = false }, 2500)
}

function waveComplete() {
  if (wave.value >= TOTAL_WAVES) {
    victory.value = true
    triggerGameOver()
    return
  }
  gs.value = 'upgrade'
  const taken = availableWeapons.value.map(w=>w.id)
  const unlockable = ['laser','shotgun','machinegun','sniper','cannon']
  const weaponUpgradePool = taken
    .filter(id => ['keyboard','laser','shotgun','machinegun','sniper','cannon'].includes(id))
    .map(id => WEAPON_UPGRADES[`${id}Boost`])
    .filter(Boolean)
  const available = [...UPGRADE_POOL, ...weaponUpgradePool].filter(u =>
    !(unlockable.includes(u.id) && taken.includes(u.id))
  )
  upgradeChoices.value = [...available].sort(()=>Math.random()-0.5).slice(0,3)
  selectedUpgradeIndex.value = 0
}

function pickUpgrade(u) {
  if (u.id === 'dmg') dmgBonus++
  else if (u.id === 'speed') speedBonus++
  else if (u.id === 'hp') { maxHp.value += 25; playerData.hp = Math.min(playerData.hp+25, maxHp.value); hp.value = playerData.hp }
  else if (u.id === 'coffee') coffeeTimer.value = 10000
  else if (u.id === 'shield') shield.value++
  else if (u.id === 'keyboardBoost') weaponLevels.keyboard++
  else if (u.id === 'laserBoost') weaponLevels.laser++
  else if (u.id === 'shotgunBoost') weaponLevels.shotgun++
  else if (u.id === 'machinegunBoost') weaponLevels.machinegun++
  else if (u.id === 'sniperBoost') weaponLevels.sniper++
  else if (u.id === 'cannonBoost') weaponLevels.cannon++
  else if (['laser','shotgun','machinegun','sniper','cannon'].includes(u.id))
    availableWeapons.value.push(WEAPON_INFO[u.id])

  wave.value++
  gs.value = 'playing'
  selectedUpgradeIndex.value = 0
  startWave(wave.value)
}

function triggerGameOver() {
  if (animId) { cancelAnimationFrame(animId); animId = null }
  clearTimeout(waveAnnTimer)
  playGameOverSfx(victory.value)
  gs.value = 'gameover'
  if (!submitted.value && !submitting.value) submitScore()
}

// ─── CANNON ULTIMATE ─────────────────────────────────────────
function togglePause() {
  if (gs.value === 'playing') {
    gs.value = 'paused'
    keys.up = false
    keys.down = false
    touchY = null
    return
  }
  if (gs.value === 'paused') {
    gs.value = 'playing'
    lastTime = performance.now()
  }
}

function fireWeaponUltimate() {
  if (cannonCooldown.value > 0) return

  const weaponId = currentWeapon.value
  const weaponLv = weaponLevels[weaponId] || 0
  const px = playerData.x + 22
  const py = playerData.y

  if (weaponId === 'laser') {
    for (const offset of [-26, 0, 26]) {
      bullets.push({
        id: nextId++, x: px, y: py + offset, vx: 20, vy: 0,
        dmg: 8 + dmgBonus + weaponLv * 2, type: 'laser', size: 8, dead: false, piercing: true,
      })
    }
    playShootSfx('laser')
    playShootSfx('laser')
    cannonCooldown.value = 10000
  } else if (weaponId === 'shotgun') {
    for (let i = -6; i <= 6; i++) {
      const a = i * 0.11
      bullets.push({
        id: nextId++, x: px, y: py, vx: Math.cos(a) * 14, vy: Math.sin(a) * 14,
        dmg: 4 + dmgBonus + weaponLv, type: 'shotgun', size: 7, dead: false, startX: px, maxRange: 460 + weaponLv * 80,
      })
    }
    playShootSfx('shotgun')
    cannonCooldown.value = 10000
  } else if (weaponId === 'machinegun') {
    for (let i = 0; i < 14 + weaponLv * 2; i++) {
      bullets.push({
        id: nextId++, x: px, y: py + (Math.random() - 0.5) * 18,
        vx: 16 + Math.random() * 2, vy: (Math.random() - 0.5) * 2.6,
        dmg: 2 + Math.floor(dmgBonus * 0.7) + weaponLv, type: 'machinegun', size: 4, dead: false,
      })
    }
    playShootSfx('machinegun')
    cannonCooldown.value = 10000
  } else if (weaponId === 'sniper') {
    bullets.push({
      id: nextId++, x: px, y: py, vx: 32, vy: 0,
      dmg: 55 + dmgBonus * 3 + weaponLv * 8, type: 'sniper', size: 12, dead: false, piercing: true,
    })
    playShootSfx('sniper')
    cannonCooldown.value = 10000
  } else if (weaponId === 'cannon') {
    bullets.push({
      id: nextId++, x: px, y: py, vx: 13 + weaponLv, vy: 0,
      dmg: 20 + dmgBonus * 2 + weaponLv * 6, type: 'cannon', size: 24, dead: false,
    })
    playShootSfx('cannon')
    cannonCooldown.value = 10000
  } else {
    for (let i = -4; i <= 4; i++) {
      bullets.push({
        id: nextId++, x: px, y: py + i * 10, vx: 14 + weaponLv, vy: 0,
        dmg: 3 + dmgBonus + weaponLv, type: 'keyboard', size: 7, dead: false, piercing: weaponLv >= 2,
      })
    }
    playShootSfx('keyboard')
    cannonCooldown.value = 10000
  }

  spawnParticles(px, py, '#ffd700', 15)
}

// ─── INPUT ──────────────────────────────────────────────────
function handleKeyDown(e) {
  const scrollKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyS','Space','PageUp','PageDown']
  if (gs.value !== 'idle' && scrollKeys.includes(e.code)) e.preventDefault()

  if (gs.value === 'upgrade') {
    if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && upgradeChoices.value.length) {
      selectedUpgradeIndex.value =
        (selectedUpgradeIndex.value - 1 + upgradeChoices.value.length) % upgradeChoices.value.length
      return
    }
    if ((e.code === 'ArrowRight' || e.code === 'KeyD') && upgradeChoices.value.length) {
      selectedUpgradeIndex.value = (selectedUpgradeIndex.value + 1) % upgradeChoices.value.length
      return
    }
    if ((e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') && upgradeChoices.value.length) {
      pickUpgrade(upgradeChoices.value[selectedUpgradeIndex.value])
      return
    }
  }

  if ((e.code==='KeyP' || e.code==='Escape') && (gs.value === 'playing' || gs.value === 'paused')) {
    togglePause()
    return
  }
  if (e.code==='KeyW'||e.code==='ArrowUp') keys.up = true
  if (e.code==='KeyS'||e.code==='ArrowDown') keys.down = true
  for (let i=1; i<=6; i++) {
    if (e.code===`Digit${i}` && availableWeapons.value[i-1]) currentWeapon.value = availableWeapons.value[i-1].id
  }
  if (e.code==='Space' && gs.value==='playing') fireWeaponUltimate()
}
function handleKeyUp(e) {
  if (e.code==='KeyW'||e.code==='ArrowUp') keys.up = false
  if (e.code==='KeyS'||e.code==='ArrowDown') keys.down = false
}
function onTouchMove(e) {
  if (gs.value !== 'playing') return
  const rect = cvs.value.getBoundingClientRect()
  const scaleY = CH / rect.height
  touchY = (e.touches[0].clientY - rect.top) * scaleY
}
function onTouchEnd() { touchY = null }

// ─── GAME LIFECYCLE ─────────────────────────────────────────
async function startGame() {
  await unlockAudio()
  const normalizedName = lbStore.normalizeName(playerName.value || '')
  const playerId = getPlayerId()
  if (!normalizedName) {
    nameErr.value = t('game.nameError')
    return
  }

  try {
    const taken = await lbStore.isNameTaken(normalizedName, playerId)
    if (taken) {
      nameErr.value = 'Tên này đã tồn tại trên bảng xếp hạng, vui lòng chọn tên khác!'
      return
    }
  } catch {
    nameErr.value = 'Không kiểm tra được tên lúc này, vui lòng thử lại!'
    return
  }

  playerName.value = normalizedName
  nameErr.value = ''
  ctx = cvs.value.getContext('2d')

  // Reset all state
  const char = selectedChar.value
  score.value = 0; wave.value = 1
  hp.value = char.hp; maxHp.value = char.hp
  bugsKilled.value = 0; shield.value = 0; coffeeTimer.value = 0; cannonCooldown.value = 0
  currentWeapon.value = char.startWeapons[0]
  availableWeapons.value = char.startWeapons.map(id => WEAPON_INFO[id])
  victory.value = false; submitted.value = false; submitMsg.value = ''; playerRank.value = 0
  dmgBonus = 0; speedBonus = 0; nextId = 0; bgOffset = 0; frameN = 0
  weaponLevels = { keyboard: 0, laser: 0, shotgun: 0, machinegun: 0, sniper: 0, cannon: 0 }
  bullets = []; enemies = []; particles = []; killTexts = []
  enemyBullets = []; hpOrbs = []; comboCount = 0; comboTimer = 0; shakeTime = 0
  comboDisplay.value = 0
  selectedUpgradeIndex.value = 0

  playerData = { x:80, y:CH/2, hp:char.hp, invTimer:0, fireTimer:0, speed:char.speed, color:char.color }
  gs.value = 'playing'
  startWave(1)

  if (animId) cancelAnimationFrame(animId)
  lastTime = performance.now()
  animId = requestAnimationFrame(loop)
}

function loop(ts) {
  const raw = ts - lastTime; lastTime = ts
  const dt = Math.min(raw, 50) / 16.67
  if (gs.value === 'playing') update(dt)

  // Screen shake
  const shaking = shakeTime > 0
  if (shaking) {
    const intensity = (shakeTime / 380) * 7
    ctx.save()
    ctx.translate((Math.random()*2-1)*intensity, (Math.random()*2-1)*intensity)
  }

  drawAll()

  if (shaking) ctx.restore()

  animId = requestAnimationFrame(loop)
}

async function submitScore() {
  const normalizedName = lbStore.normalizeName(playerName.value || '')
  const playerId = getPlayerId()
  if (!normalizedName) return
  if (submitting.value || submitted.value) return
  submitting.value = true
  submitMsg.value = ''
  try {
    const taken = await lbStore.isNameTaken(normalizedName, playerId)
    if (taken) {
      submitMsg.value = 'Tên này đã có trên bảng xếp hạng, vui lòng đổi tên khác trước khi nộp điểm!'
      return
    }

    playerName.value = normalizedName
    const { rank } = await lbStore.addEntry(normalizedName, score.value, {
      playerId,
      deviceLabel: 'browser',
      userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
    })
    playerRank.value = rank
    submitted.value = true
  } catch {
    submitMsg.value = t('game.btnSubmitScore') + ' — thử lại!'
  } finally {
    submitting.value = false
  }
}

function resetToIdle() {
  if (animId) { cancelAnimationFrame(animId); animId = null }
  keys.up = false
  keys.down = false
  touchY = null
  bullets = []; enemies = []; particles = []; killTexts = []
  enemyBullets = []; hpOrbs = []; comboCount = 0; comboTimer = 0; shakeTime = 0
  comboDisplay.value = 0
  clearTimeout(waveAnnTimer)
  waveAnn.value = false
  gs.value = 'idle'
  if (ctx) {
    ctx.clearRect(0,0,CW,CH)
    ctx.fillStyle = '#0a1628'; ctx.fillRect(0,0,CW,CH)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  // Draw initial background
  if (cvs.value) {
    ctx = cvs.value.getContext('2d')
    ctx.fillStyle = '#0a1628'; ctx.fillRect(0,0,CW,CH)
  }
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (animId) cancelAnimationFrame(animId)
  clearTimeout(waveAnnTimer)
})
</script>

<style scoped>
.dev-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0 60px;
  overflow: hidden;
}
.game-bg-glow {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at 50% 50%, rgba(26,127,222,0.07) 0%, transparent 65%);
}

.game-outer {
  position: relative;
  width: 100%;
  max-width: 1040px;
  padding: 0 12px;
}

.canvas-wrap {
  position: relative;
  border: 1px solid var(--border-blue);
  border-radius: 10px;
  overflow: hidden;
  background: #050e1a;
  box-shadow: 0 0 60px rgba(0,180,255,0.1), 0 0 0 1px rgba(26,127,222,0.12), inset 0 1px 0 rgba(255,255,255,0.04);
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  cursor: crosshair;
}

/* ── OVERLAYS ── */
.overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}

.idle-overlay { background: rgba(5,14,26,0.88); backdrop-filter: blur(4px); }
.idle-card {
  text-align: center; padding: 40px 52px;
  background: rgba(10,22,40,0.96);
  border: 1px solid var(--border-blue);
  border-radius: 16px;
  max-width: 620px; width: 92%;
}
.idle-avatar { font-size: 64px; margin-bottom: 10px; }
.idle-title { font-family: var(--font-heading); font-size: 34px; color: var(--blue-bright); letter-spacing: 4px; margin: 0 0 10px; }
.idle-desc { color: var(--text-dim); font-size: 15px; margin-bottom: 24px; }
.rules-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  background: rgba(26,127,222,0.06); border: 1px solid var(--border-blue);
  border-radius: 8px; padding: 16px; margin-bottom: 24px;
  font-family: var(--font-heading); font-size: 12px; color: var(--text-dim); text-align: left;
}
.name-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.name-row label { font-family: var(--font-heading); font-size: 12px; color: var(--text-dim); }
.name-row input {
  background: rgba(26,127,222,0.08); border: 1px solid var(--border-blue);
  border-radius: 8px; padding: 12px 16px; color: var(--text-light);
  font-family: var(--font-heading); font-size: 16px; outline: none;
}
.name-row input:focus { border-color: var(--blue-bright); box-shadow: 0 0 12px rgba(0,180,255,0.15); }
.name-err { color: #f44336; font-size: 12px; font-family: var(--font-heading); }

/* ── CHARACTER SELECT ── */
.char-select-label {
  font-family: var(--font-heading); font-size: 12px; color: var(--text-dim);
  text-align: left; margin-bottom: 10px; letter-spacing: 1px;
}
.char-grid {
  display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: nowrap; overflow-x: auto;
}
.char-card {
  flex: 1; min-width: 96px; padding: 12px 8px; text-align: center; cursor: pointer;
  background: rgba(26,127,222,0.05);
  border: 1px solid var(--border-blue);
  border-radius: 10px; transition: var(--transition);
}
.char-card:hover {
  border-color: var(--cc, var(--blue-bright));
  background: color-mix(in srgb, var(--cc, #1565c0) 12%, transparent);
  transform: translateY(-2px);
}
.char-card.active {
  border-color: var(--cc, var(--blue-bright));
  background: color-mix(in srgb, var(--cc, #1565c0) 18%, transparent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--cc, #1565c0) 40%, transparent);
}
.cc-icon { font-size: 28px; margin-bottom: 6px; }
.cc-name { font-family: var(--font-heading); font-size: 11px; font-weight: 700; color: var(--text-light); margin-bottom: 5px; line-height: 1.2; }
.cc-stats { display: flex; justify-content: center; gap: 8px; font-size: 10px; font-family: var(--font-heading); color: var(--text-dim); margin-bottom: 5px; }
.cc-passive { font-size: 10px; color: var(--text-dim); line-height: 1.3; }

/* ── HUD ── */
.hud-overlay {
  position: absolute; top: 0; left: 0; right: 0;
  pointer-events: none;
}
.hud-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; gap: 10px;
  background: rgba(5,14,26,0.82); backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(26,127,222,0.2);
}
.hud-hp-block { display: flex; align-items: center; gap: 8px; flex: 1; }
.hud-lbl { font-family: var(--font-heading); font-size: 10px; color: var(--text-dim); }
.hp-track { flex: 1; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; max-width: 140px; }
.hp-fill { height: 100%; border-radius: 4px; transition: width 0.2s, background 0.3s; }
.hp-num { font-family: var(--font-heading); font-size: 11px; color: var(--text-light); min-width: 52px; }
.hud-center-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 3px;
  min-height: 52px;
  min-width: 360px;
  position: relative;
}
.wave-chip { font-family: var(--font-heading); font-size: 11px; font-weight: 700; color: var(--blue-bright); letter-spacing: 1px; }
.passive-chip {
  font-family: var(--font-heading);
  font-size: 10px;
  color: var(--gold-light);
  background: rgba(255,215,0,0.08);
  border: 1px solid rgba(255,215,0,0.18);
  border-radius: 999px;
  padding: 2px 8px;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.coffee-chip { font-family: var(--font-heading); font-size: 10px; color: #ffd700; animation: hudPulse 0.8s ease-in-out infinite; }
.shield-chip { font-family: var(--font-heading); font-size: 10px; color: #00d4ff; }
.combo-chip {
  font-family: var(--font-heading); font-size: 12px; font-weight: 900;
  color: #ffd700; letter-spacing: 1px;
  text-shadow: 0 0 12px rgba(255,215,0,0.8);
  animation: hudPulse 0.4s ease-in-out infinite;
  line-height: 1;
  min-height: 16px;
  position: absolute;
  top: 23px;
  left: calc(50% + 88px);
  white-space: nowrap;
  background: rgba(255, 215, 0, 0.08);
  border: 1px solid rgba(255, 215, 0, 0.18);
  border-radius: 999px;
  padding: 4px 10px;
}
.hud-score-block { text-align: right; flex: 1; }
.score-num { font-family: var(--font-heading); font-size: 22px; font-weight: 700; color: var(--gold); line-height: 1; }
.bugs-num { font-family: var(--font-heading); font-size: 12px; color: var(--text-dim); }
.pause-btn {
  pointer-events: auto;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-light);
  background: rgba(26,127,222,0.12);
  border: 1px solid var(--border-blue);
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
  transition: var(--transition);
}
.pause-btn:hover {
  border-color: var(--blue-bright);
  color: var(--blue-bright);
  background: rgba(26,127,222,0.2);
}
.weapon-bar {
  display: flex; gap: 6px; padding: 6px 14px;
  background: rgba(5,14,26,0.7); pointer-events: auto;
}
.w-slot {
  display: flex; align-items: center; gap: 4px;
  font-family: var(--font-heading); font-size: 11px; color: var(--text-dim);
  background: rgba(26,127,222,0.06); border: 1px solid var(--border-blue);
  border-radius: 6px; padding: 4px 8px; cursor: pointer; transition: var(--transition);
}
.w-slot:hover, .w-slot.active { border-color: var(--blue-bright); color: var(--blue-bright); background: rgba(26,127,222,0.14); }
.w-slot kbd { font-size: 9px; background: rgba(255,255,255,0.08); border-radius: 3px; padding: 1px 4px; }
.w-slot .w-lv { font-size: 9px; color: var(--gold-light); }
.w-slot .cd { color: #f44336; font-size: 10px; }

/* ── WAVE ANNOUNCE ── */
.wave-announce {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  pointer-events: none;
}
.wa-wave { font-family: var(--font-heading); font-size: 60px; font-weight: 900; color: var(--blue-bright); letter-spacing: 8px; text-shadow: 0 0 40px rgba(0,180,255,0.8); line-height: 1; }
.wa-title { font-family: var(--font-heading); font-size: 22px; color: var(--gold); letter-spacing: 2px; margin-top: 10px; }
.wave-pop-enter-active { transition: all 0.4s ease; }
.wave-pop-leave-active { transition: all 0.5s ease; }
.wave-pop-enter-from { opacity: 0; transform: scale(0.5); }
.wave-pop-leave-to { opacity: 0; transform: scale(1.3); }

/* ── PAUSE OVERLAY ── */
.pause-overlay { background: rgba(5,14,26,0.72); backdrop-filter: blur(6px); }
.pause-card { text-align: center; padding: 28px 30px; max-width: 420px; width: 92%; }
.pause-title { font-family: var(--font-heading); font-size: 28px; color: var(--blue-bright); margin: 0 0 8px; letter-spacing: 2px; }
.pause-sub { color: var(--text-dim); font-size: 14px; margin-bottom: 20px; }

/* ── UPGRADE OVERLAY ── */
.upgrade-overlay { background: rgba(5,14,26,0.92); backdrop-filter: blur(6px); }
.upgrade-card { text-align: center; padding: 32px 28px; max-width: 600px; width: 96%; }
.upgrade-title { font-family: var(--font-heading); font-size: 26px; color: var(--blue-bright); margin: 0 0 6px; }
.upgrade-sub { color: var(--text-dim); font-size: 14px; margin-bottom: 24px; }
.upgrade-row { display: flex; gap: 12px; justify-content: center; }
.u-choice {
  flex: 1; max-width: 160px; padding: 20px 14px; text-align: center;
  background: rgba(26,127,222,0.06); border: 1px solid var(--border-blue);
  border-radius: 12px; cursor: pointer; transition: var(--transition);
}
.u-choice:hover { border-color: var(--blue-bright); background: rgba(26,127,222,0.15); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,180,255,0.15); }
.u-choice.active { border-color: var(--blue-bright); background: rgba(26,127,222,0.18); transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,180,255,0.22); }
.u-icon { font-size: 32px; margin-bottom: 8px; }
.u-name { font-family: var(--font-heading); font-size: 13px; font-weight: 700; color: var(--text-light); margin-bottom: 6px; }
.u-desc { font-size: 11px; color: var(--text-dim); line-height: 1.4; }
.upgrade-hint { margin-top: 14px; font-family: var(--font-heading); font-size: 11px; color: var(--text-dim); letter-spacing: 0.5px; }

/* ── GAME OVER ── */
.gameover-overlay { background: rgba(5,14,26,0.92); backdrop-filter: blur(6px); }
.go-card { text-align: center; padding: 36px 40px; max-width: 440px; width: 92%; }
.go-icon { font-size: 56px; margin-bottom: 8px; }
.go-title { font-family: var(--font-heading); font-size: 28px; font-weight: 900; color: var(--gold); margin: 0 0 20px; letter-spacing: 2px; }
.go-victory-msg {
  margin: -6px auto 18px;
  max-width: 360px;
  color: var(--text-light);
  font-size: 14px;
  line-height: 1.6;
}
.go-stats { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; color: var(--text-dim); font-size: 14px; font-family: var(--font-heading); }
.go-stats b { color: var(--text-light); }
.go-name { font-family: var(--font-heading); font-size: 16px; color: var(--blue-bright); margin-bottom: 20px; letter-spacing: 1px; }
.go-rank { font-family: var(--font-heading); font-size: 18px; color: var(--gold); margin: 16px 0; }
.submit-msg { color: #f44336; font-size: 12px; font-family: var(--font-heading); margin-bottom: 8px; }
.mt-16 { margin-top: 12px; }


@media (max-width: 600px) {
  .upgrade-row { flex-direction: column; align-items: center; }
  .u-choice { max-width: 100%; width: 100%; }
  .rules-grid { grid-template-columns: 1fr; }
  .hud-top { flex-wrap: wrap; }
}
</style>
