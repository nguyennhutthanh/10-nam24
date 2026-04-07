<template>
  <div class="app" @click.once="initMusic" @keydown.once="initMusic">
    <Preloader @done="preloaderDone" />

    <div id="scroll-progress" :style="{ width: scrollProgress + '%' }"></div>

    <audio ref="audioRef" src="/music.mp3" loop preload="auto"></audio>

    <Transition name="fade">
      <button v-if="musicReady" class="music-btn" @click.stop="toggleMusic" :title="isPlaying ? 'Tắt nhạc' : 'Bật nhạc'">
        <span class="music-icon" :class="{ playing: isPlaying }">{{ isPlaying ? '🎵' : '🔇' }}</span>
        <span class="music-label">{{ isPlaying ? 'Nhạc' : 'Tắt' }}</span>
      </button>
    </Transition>

    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="container">
        <div class="nav-inner">
          <div class="nav-logo" @click="navLogo">
            <span class="logo-text">VHEC</span>
            <span class="logo-badge">10 NĂM</span>
          </div>
          <div class="nav-links" :class="{ open: menuOpen }">
            <a @click="navTo('journey')">{{ $t('nav.journey') }}</a>
            <a @click="navTo('achievements')">{{ $t('nav.achievements') }}</a>
            <a @click="navTo('gallery')">{{ $t('nav.gallery') }}</a>
            <a @click="goToGame" class="nav-game">{{ $t('nav.game') }}</a>
            <a @click="navTo('leaderboard')">{{ $t('nav.leaderboard') }}</a>
            <a @click="navTo('messages')">{{ $t('nav.messages') }}</a>
          </div>
          <button class="lang-toggle" @click="toggleLang" :title="locale === 'vi' ? '日本語に切替' : 'Chuyển tiếng Việt'">
            <span class="lang-flag">{{ locale === 'vi' ? '🇻🇳' : '🇯🇵' }}</span>
            <span class="lang-code">{{ locale === 'vi' ? 'VI' : 'JP' }}</span>
          </button>
          <button class="menu-toggle" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>

    <router-view />

    <Transition name="fade">
      <button v-if="isScrolled" class="scroll-top" @click="scrollToTop" aria-label="Scroll to top">↑</button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import Preloader from './components/Preloader.vue'

const isScrolled = ref(false)
const menuOpen = ref(false)
const scrollProgress = ref(0)

const { locale } = useI18n()
const router = useRouter()
const route = useRoute()

function toggleLang() {
  locale.value = locale.value === 'vi' ? 'ja' : 'vi'
  localStorage.setItem('vhec_lang', locale.value)
}

function preloaderDone() {}

function navLogo() {
  menuOpen.value = false
  if (route.path !== '/') {
    router.push('/')
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function navTo(id) {
  menuOpen.value = false
  if (route.path !== '/') {
    router.push('/').then(() => nextTick(() => {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }))
  } else {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}

function goToGame() {
  menuOpen.value = false
  router.push('/game')
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ===== Music =====
const audioRef = ref(null)
const isPlaying = ref(false)
const musicReady = ref(false)

function initMusic() {
  if (!audioRef.value || musicReady.value) return
  musicReady.value = true
  audioRef.value.volume = 0.18
  audioRef.value.play().then(() => { isPlaying.value = true }).catch(() => { isPlaying.value = false })
}

function toggleMusic() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play()
    isPlaying.value = true
  }
}

function handleScroll() {
  isScrolled.value = window.scrollY > 80
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
}

function handleMusicInitRequest() {
  initMusic()
}

function handleMusicVolumeRequest(event) {
  if (!audioRef.value) return
  const nextVolume = Number(event?.detail?.volume)
  if (!Number.isFinite(nextVolume)) return
  audioRef.value.volume = Math.min(1, Math.max(0, nextVolume))
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('vhec:init-music', handleMusicInitRequest)
  window.addEventListener('vhec:set-music-volume', handleMusicVolumeRequest)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('vhec:init-music', handleMusicInitRequest)
  window.removeEventListener('vhec:set-music-volume', handleMusicVolumeRequest)
})
</script>

<style scoped>
.app { min-height: 100vh; background: var(--bg-dark); }

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.lang-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  background: rgba(26,127,222,0.08);
  border: 1px solid var(--border-blue);
  border-radius: var(--radius-sm);
  padding: 5px 8px;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}
.lang-toggle:hover {
  border-color: var(--blue-bright);
  background: rgba(26,127,222,0.18);
  transform: translateY(-1px);
}
.lang-flag { font-size: 16px; line-height: 1; }
.lang-code {
  font-family: var(--font-heading);
  font-size: 8px;
  font-weight: 700;
  color: var(--blue-light);
  letter-spacing: 1px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo-text {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 900;
  background: linear-gradient(135deg, var(--blue-bright), var(--blue-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.logo-badge {
  background: linear-gradient(135deg, var(--blue), var(--blue-bright));
  color: #fff;
  font-family: var(--font-heading);
  font-size: 9px;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 100px;
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-links a {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--text-light);
  padding: 8px 14px;
  border-radius: 100px;
  cursor: pointer;
  transition: var(--transition);
  text-transform: uppercase;
}

.nav-links a:hover { color: var(--gold); background: rgba(201,162,39,0.1); }

.nav-links .nav-game {
  color: var(--blue-light);
  border: 1px solid var(--border-blue);
}
.nav-links .nav-game:hover {
  color: var(--blue-bright);
  background: rgba(26,127,222,0.12);
  border-color: var(--blue-bright);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}
.menu-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text-light);
  border-radius: 2px;
  transition: var(--transition);
}

.music-btn {
  position: fixed;
  bottom: 90px;
  right: 32px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 56px;
  padding: 8px 4px;
  border-radius: var(--radius-sm);
  background: rgba(8,24,48,0.9);
  border: 1px solid var(--border-blue);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.music-btn:hover { border-color: var(--blue-bright); box-shadow: var(--shadow-blue); transform: translateY(-2px); }
.music-icon { font-size: 22px; display: block; }
.music-icon.playing { animation: float 1.5s ease-in-out infinite; }
.music-label { font-family: var(--font-heading); font-size: 9px; font-weight: 700; color: var(--text-dim); letter-spacing: 0.5px; }

.scroll-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 100;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--blue), var(--blue-bright));
  color: #fff;
  border: none;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px var(--blue-glow);
  transition: var(--transition);
}
.scroll-top:hover { transform: translateY(-3px); box-shadow: 0 8px 30px var(--blue-glow); }

@media (max-width: 900px) {
  .menu-toggle { display: flex; }
  .nav-links {
    display: none;
    position: fixed;
    top: 64px;
    left: 0; right: 0;
    background: rgba(5,13,26,0.98);
    backdrop-filter: blur(20px);
    flex-direction: column;
    padding: 24px;
    border-bottom: 1px solid var(--border-gold);
    gap: 4px;
  }
  .nav-links.open { display: flex; }
  .nav-links a { width: 100%; text-align: center; padding: 12px; }
  .scroll-top { bottom: 20px; right: 20px; width: 42px; height: 42px; font-size: 16px; }
}
</style>
