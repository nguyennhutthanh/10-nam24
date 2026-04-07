<template>
  <section id="journey" class="section journey-section">
    <div class="container">
      <div class="section-header reveal" data-reveal>
        <div class="section-badge">{{ $t('journey.badge') }}</div>
        <div class="gold-line"></div>
        <h2 class="section-title">
          <i18n-t keypath="journey.title" tag="span">
            <template #highlight><span class="highlight">{{ $t('journey.highlight') }}</span></template>
          </i18n-t>
        </h2>
        <p class="section-subtitle">{{ $t('journey.subtitle') }}</p>
      </div>

      <!-- Timeline -->
      <div class="timeline">
        <div class="timeline-spine"></div>

        <div
          v-for="(item, index) in journeyItems"
          :key="index"
          class="timeline-item"
          :class="[`side-${sides[index]}`, { visible: visibleItems.has(index) }]"
          :ref="el => setItemRef(el, index)"
        >
          <!-- Card -->
          <div class="tl-card hud">
            <div class="tl-icon">{{ item.icon }}</div>
            <div class="tl-year">{{ item.year }}</div>
            <h3 class="tl-title">{{ item.title }}</h3>
            <p class="tl-desc">{{ item.description }}</p>
          </div>

          <!-- Connector dot -->
          <div class="tl-dot">
            <div class="dot-inner"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { tm } = useI18n()
const sides = ['left', 'right', 'left', 'right', 'left', 'right']
const journeyItems = computed(() => tm('journey.items'))

const visibleItems = ref(new Set())
const itemRefs = ref([])

function setItemRef(el, index) {
  if (el) itemRefs.value[index] = el
}

let observer = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index)
          setTimeout(() => {
            visibleItems.value.add(index)
            visibleItems.value = new Set(visibleItems.value)
          }, index * 150)
        }
      })
    },
    { threshold: 0.2 }
  )

  itemRefs.value.forEach((el, index) => {
    if (el) {
      el.dataset.index = index
      observer.observe(el)
    }
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.journey-section {
  background: linear-gradient(180deg, var(--bg-dark) 0%, var(--bg-medium) 50%, var(--bg-dark) 100%);
}

.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-spine {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, transparent, var(--blue-dim) 10%, var(--blue-bright) 50%, var(--blue-dim) 90%, transparent);
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  align-items: center;
  margin-bottom: 48px;
  opacity: 0;
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.timeline-item.side-left {
  transform: translateX(-30px);
}

.timeline-item.side-right {
  transform: translateX(30px);
}

.timeline-item.visible {
  opacity: 1;
  transform: translateX(0);
}

.side-left .tl-card {
  grid-column: 1;
  grid-row: 1;
  margin-right: 30px;
  text-align: right;
}

.side-right .tl-card {
  grid-column: 3;
  grid-row: 1;
  margin-left: 30px;
  text-align: left;
}

.tl-dot {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.dot-inner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg-darkest);
  border: 3px solid var(--blue-bright);
  box-shadow: 0 0 12px var(--blue-glow), 0 0 24px var(--blue-glow-soft);
  transition: all 0.3s ease;
}

.timeline-item.visible .dot-inner {
  box-shadow: 0 0 20px var(--blue-glow), 0 0 40px var(--blue-glow-soft);
  background: var(--blue-dim);
}

.tl-card {
  background: linear-gradient(135deg, var(--bg-card), rgba(15, 32, 64, 0.6));
  border: 1px solid var(--border-gold);
  border-radius: var(--radius-md);
  padding: 24px;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.tl-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.04), transparent);
  pointer-events: none;
}

.tl-card:hover {
  border-color: var(--gold);
  box-shadow: var(--shadow-gold);
  transform: translateY(-3px);
}

.tl-icon {
  font-size: 28px;
  margin-bottom: 8px;
  display: block;
}

.tl-year {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 900;
  background: linear-gradient(135deg, var(--blue-bright), var(--blue-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 8px;
}

.tl-title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 10px;
  line-height: 1.3;
}

.tl-desc {
  color: var(--text-gray);
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .timeline-spine {
    left: 24px;
  }

  .timeline-item {
    grid-template-columns: 48px 1fr;
    grid-template-rows: auto;
  }

  .side-left .tl-card,
  .side-right .tl-card {
    grid-column: 2;
    grid-row: 1;
    margin-left: 16px;
    margin-right: 0;
    text-align: left;
  }

  .tl-dot {
    grid-column: 1;
    grid-row: 1;
  }

  .timeline-item.side-left {
    transform: translateX(-20px);
  }

  .timeline-item.side-right {
    transform: translateX(20px);
  }
}
</style>
