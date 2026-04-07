<template>
  <section id="achievements" class="section achievements-section">
    <!-- Background decoration -->
    <div class="achv-bg-glow"></div>

    <div class="container">
      <div class="section-header reveal" data-reveal>
        <div class="section-badge">{{ $t('achievements.badge') }}</div>
        <div class="gold-line"></div>
        <h2 class="section-title">
          <i18n-t keypath="achievements.title" tag="span">
            <template #highlight><span class="highlight">{{ $t('achievements.highlight') }}</span></template>
          </i18n-t>
        </h2>
        <p class="section-subtitle">{{ $t('achievements.subtitle') }}</p>
      </div>

      <div class="stats-grid" ref="statsGridRef">
        <div
          v-for="(item, i) in achievementsData"
          :key="i"
          class="stat-card hud"
          :class="{ visible: isVisible }"
          :style="{ animationDelay: i * 0.1 + 's' }"
        >
          <div class="stat-icon">{{ item.icon }}</div>
          <div class="stat-number">
            <span class="num-value">{{ displayValues[i] }}</span>
            <span class="num-suffix">{{ item.suffix }}</span>
          </div>
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-desc">{{ item.desc }}</div>
          <div class="stat-bar">
            <div
              class="stat-bar-fill"
              :style="{ width: isVisible ? '100%' : '0%', transitionDelay: i * 0.15 + 's' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { tm } = useI18n()
const achievementsData = computed(() => tm('achievements.items'))

const isVisible = ref(false)
const statsGridRef = ref(null)
const displayValues = ref(Array(6).fill(0))

let observer = null
let animationIds = []

function animateCounter(index, target, duration = 1800) {
  const start = performance.now()
  const id = requestAnimationFrame(function tick(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayValues.value[index] = Math.round(eased * target)

    if (progress < 1) {
      animationIds[index] = requestAnimationFrame(tick)
    }
  })
  animationIds[index] = id
}

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !isVisible.value) {
        isVisible.value = true
        achievementsData.value.forEach((item, i) => {
          setTimeout(() => {
            animateCounter(i, item.value, 2000)
          }, i * 150)
        })
      }
    },
    { threshold: 0.3 }
  )

  if (statsGridRef.value) {
    observer.observe(statsGridRef.value)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  animationIds.forEach(id => cancelAnimationFrame(id))
})
</script>

<style scoped>
.achievements-section {
  background: var(--bg-darkest);
  position: relative;
  overflow: hidden;
}

.achv-bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 162, 39, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.stat-card {
  background: linear-gradient(135deg, var(--bg-card), rgba(15, 32, 64, 0.7));
  border: 1px solid var(--border-gold);
  border-radius: var(--radius-md);
  padding: 32px 24px;
  text-align: center;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
}

.stat-card.visible {
  animation: fadeInUp 0.6s ease both;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--blue-bright), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  border-color: var(--blue-bright);
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 87, 184, 0.2);
}

.stat-icon {
  font-size: 36px;
  margin-bottom: 12px;
  display: block;
  animation: float 3s ease-in-out infinite;
}

.stat-number {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  margin-bottom: 8px;
  line-height: 1;
}

.num-value {
  font-family: var(--font-heading);
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 900;
  background: linear-gradient(135deg, var(--blue-bright), var(--blue-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.num-suffix {
  font-family: var(--font-heading);
  font-size: clamp(14px, 2vw, 20px);
  font-weight: 700;
  color: var(--blue-light);
  margin-bottom: 4px;
}

.stat-label {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 6px;
}

.stat-desc {
  font-size: 12px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.stat-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 1px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--blue-dim), var(--blue-bright));
  border-radius: 1px;
  transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  width: 0%;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 540px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
