<template>
  <Transition name="preloader-out">
    <div v-if="visible" class="preloader">
      <!-- Scanline -->
      <div class="pre-scanline"></div>

      <!-- Grid -->
      <div class="pre-grid"></div>

      <!-- Corner brackets -->
      <div class="pre-corner tl"></div>
      <div class="pre-corner tr"></div>
      <div class="pre-corner bl"></div>
      <div class="pre-corner br"></div>

      <!-- Center content -->
      <div class="pre-center">
        <!-- Logo -->
        <div class="pre-logo-wrap">
          <div class="pre-ring ring-1"></div>
          <div class="pre-ring ring-2"></div>
          <div class="pre-logo-text">VHEC</div>
        </div>

        <!-- Company name -->
        <div class="pre-company font-mono">VIETNAM HI-TECH ENGINEERING CO., LTD</div>

        <!-- Boot messages -->
        <div class="pre-messages">
          <div
            v-for="(msg, i) in visibleMessages"
            :key="i"
            class="pre-msg font-mono"
          >
            <span class="msg-prefix">[OK]</span> {{ msg }}
          </div>
        </div>

        <!-- Progress bar -->
        <div class="pre-progress-wrap">
          <div class="pre-progress-bar">
            <div class="pre-progress-fill" :style="{ width: progress + '%' }"></div>
            <div class="pre-progress-glow" :style="{ left: progress + '%' }"></div>
          </div>
          <div class="pre-progress-label font-mono">
            <span>{{ $t('preloader.booting') }}</span>
            <span>{{ Math.round(progress) }}%</span>
          </div>
        </div>

        <!-- Year badge -->
        <div class="pre-year font-mono">2016 ——— 2026</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['done'])
const { tm } = useI18n()
const visible = ref(true)
const progress = ref(0)
const visibleMessages = ref([])

onMounted(() => {
  const bootMessages = tm('preloader.messages')

  // Nếu đã xem rồi thì skip preloader
  if (sessionStorage.getItem('vhec_loaded')) {
    visible.value = false
    emit('done')
    return
  }

  let msgIndex = 0
  const totalDuration = 2800
  const start = performance.now()

  // Show messages one by one
  const msgInterval = setInterval(() => {
    if (msgIndex < bootMessages.length) {
      visibleMessages.value.push(bootMessages[msgIndex++])
    } else {
      clearInterval(msgInterval)
    }
  }, totalDuration / bootMessages.length)

  // Progress bar
  const tick = (now) => {
    const elapsed = now - start
    progress.value = Math.min((elapsed / totalDuration) * 100, 100)
    if (elapsed < totalDuration) {
      requestAnimationFrame(tick)
    } else {
      progress.value = 100
      setTimeout(() => {
        visible.value = false
        sessionStorage.setItem('vhec_loaded', '1')
        emit('done')
      }, 400)
    }
  }
  requestAnimationFrame(tick)
})
</script>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #010810;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Scanline */
.pre-scanline {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px,
    rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px
  );
}

/* Grid */
.pre-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(26,127,222,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26,127,222,0.06) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%);
}

/* Corners */
.pre-corner {
  position: absolute; width: 40px; height: 40px;
  animation: hudPulse 2s ease-in-out infinite;
}
.pre-corner.tl { top: 24px; left: 24px; border-top: 2px solid #1A7FDE; border-left: 2px solid #1A7FDE; }
.pre-corner.tr { top: 24px; right: 24px; border-top: 2px solid #1A7FDE; border-right: 2px solid #1A7FDE; animation-delay: 0.5s; }
.pre-corner.bl { bottom: 24px; left: 24px; border-bottom: 2px solid #1A7FDE; border-left: 2px solid #1A7FDE; animation-delay: 1s; }
.pre-corner.br { bottom: 24px; right: 24px; border-bottom: 2px solid #1A7FDE; border-right: 2px solid #1A7FDE; animation-delay: 1.5s; }

/* Center */
.pre-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 500px;
  width: 100%;
  padding: 0 24px;
}

/* Logo */
.pre-logo-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pre-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(26,127,222,0.3);
}
.ring-1 {
  width: 120px; height: 120px;
  border-top-color: #1A7FDE;
  animation: rotateDash 2s linear infinite;
}
.ring-2 {
  width: 90px; height: 90px;
  border-bottom-color: #4AAEFF;
  animation: rotateDash 1.5s linear infinite reverse;
}

.pre-logo-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 6px;
  background: linear-gradient(135deg, #1A7FDE, #4AAEFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(26,127,222,0.8));
  animation: pulse 2s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

/* Company name */
.pre-company {
  font-size: 10px;
  letter-spacing: 3px;
  color: rgba(74,174,255,0.4);
  text-align: center;
  text-transform: uppercase;
}

/* Boot messages */
.pre-messages {
  width: 100%;
  min-height: 120px;
  background: rgba(26,127,222,0.04);
  border: 1px solid rgba(26,127,222,0.15);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pre-msg {
  font-size: 11px;
  color: rgba(74,174,255,0.7);
  letter-spacing: 0.5px;
  animation: fadeInUp 0.3s ease both;
}

.msg-prefix {
  color: #00ff88;
  margin-right: 8px;
}

/* Progress */
.pre-progress-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pre-progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(26,127,222,0.15);
  border-radius: 2px;
  position: relative;
  overflow: visible;
}

.pre-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0057B8, #1A7FDE, #4AAEFF);
  border-radius: 2px;
  transition: width 0.05s linear;
  box-shadow: 0 0 8px rgba(26,127,222,0.6);
}

.pre-progress-glow {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4AAEFF;
  box-shadow: 0 0 12px #4AAEFF, 0 0 24px rgba(74,174,255,0.5);
  transition: left 0.05s linear;
}

.pre-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: rgba(74,174,255,0.4);
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* Year */
.pre-year {
  font-size: 12px;
  letter-spacing: 8px;
  color: rgba(201,162,39,0.4);
}

/* Transition out */
.preloader-out-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.preloader-out-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

@keyframes hudPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
@keyframes rotateDash {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
