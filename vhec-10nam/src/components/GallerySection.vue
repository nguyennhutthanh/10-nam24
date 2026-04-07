<template>
  <section id="gallery" class="section gallery-section">
    <div class="container">
      <div class="section-header reveal" data-reveal>
        <div class="section-badge">{{ $t('gallery.badge') }}</div>
        <div class="gold-line"></div>
        <h2 class="section-title">
          <i18n-t keypath="gallery.title" tag="span">
            <template #highlight><span class="highlight">{{ $t('gallery.highlight') }}</span></template>
          </i18n-t>
        </h2>
        <p class="section-subtitle">{{ $t('gallery.subtitle') }}</p>
      </div>

      <div class="gallery-grid" ref="gridRef">
        <div
          v-for="(photo, i) in galleryData"
          :key="photo.id"
          class="gallery-item reveal-scale"
          :class="[getItemClass(i), { revealed: revealedItems.has(i) }]"
          :style="{ transitionDelay: (i % 4) * 0.1 + 's' }"
          @click="openLightbox(photo)"
        >
          <div class="gallery-thumb">
            <img
              v-if="!isImageFailed(`thumb-${photo.id}`)"
              :src="photo.thumb"
              :alt="photo.title"
              loading="lazy"
              @error="markImageFailed(`thumb-${photo.id}`)"
            />
            <div v-else class="gallery-fallback">
              <span class="gallery-fallback-icon">📷</span>
              <span class="gallery-fallback-title">{{ photo.title }}</span>
            </div>
            <div class="gallery-overlay">
              <div class="overlay-content">
                <span class="overlay-icon">🔍</span>
                <h3 class="overlay-title">{{ photo.title }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="activePh" class="lightbox" @click.self="closeLightbox">
        <button class="lb-close" @click="closeLightbox">✕</button>

        <button class="lb-nav lb-prev" @click.stop="prevPhoto" aria-label="Ảnh trước">&#8249;</button>
        <button class="lb-nav lb-next" @click.stop="nextPhoto" aria-label="Ảnh sau">&#8250;</button>

        <div class="lb-content" @click.stop>
          <div class="lb-img-wrap">
            <img
              v-if="activePh && !isImageFailed(`full-${activePh.id}`)"
              :src="activePh.full"
              :alt="activePh.title"
              class="lb-img"
              @error="markImageFailed(`full-${activePh.id}`)"
            />
            <div v-else class="lb-fallback">
              <div class="lb-fallback-icon">📷</div>
              <div class="lb-fallback-title">{{ activePh?.title }}</div>
            </div>
          </div>
          <div class="lb-info">
            <h3 class="lb-title">{{ activePh.title }}</h3>
            <p class="lb-desc">{{ activePh.description }}</p>
            <a
              v-if="activePh.source"
              class="lb-source"
              :href="activePh.source"
              target="_blank"
              rel="noopener noreferrer"
            >
              Xem bài gốc
            </a>
            <div class="lb-counter">{{ activeIndex + 1 }} / {{ galleryData.length }}</div>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { galleryData } from '../data/sampleData.js'

const activePh = ref(null)
const activeIndex = ref(0)
const gridRef = ref(null)
const revealedItems = ref(new Set())
const failedImages = ref(new Set())
let galleryObserver = null

onMounted(() => {
  const items = gridRef.value?.querySelectorAll('.gallery-item')
  if (!items) return

  galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.idx)
        setTimeout(() => {
          revealedItems.value = new Set([...revealedItems.value, idx])
        }, (idx % 4) * 100)
        galleryObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  items.forEach((el, i) => {
    el.dataset.idx = i
    galleryObserver.observe(el)
  })
})

onUnmounted(() => {
  if (galleryObserver) galleryObserver.disconnect()
})

function getItemClass(i) {
  const patterns = ['', 'wide', '', '', '', 'tall', '', '']
  return patterns[i % patterns.length] ? `item-${patterns[i % patterns.length]}` : ''
}

function markImageFailed(key) {
  failedImages.value = new Set([...failedImages.value, key])
}

function isImageFailed(key) {
  return failedImages.value.has(key)
}

function openLightbox(photo) {
  activePh.value = photo
  activeIndex.value = galleryData.findIndex((p) => p.id === photo.id)
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  activePh.value = null
  document.body.style.overflow = ''
}

function prevPhoto() {
  activeIndex.value = (activeIndex.value - 1 + galleryData.length) % galleryData.length
  activePh.value = galleryData[activeIndex.value]
}

function nextPhoto() {
  activeIndex.value = (activeIndex.value + 1) % galleryData.length
  activePh.value = galleryData[activeIndex.value]
}
</script>

<style scoped>
.gallery-section {
  background: linear-gradient(180deg, var(--bg-dark) 0%, var(--bg-medium) 100%);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 220px;
  gap: 12px;
}

.gallery-item {
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.gallery-item.item-wide {
  grid-column: span 2;
}

.gallery-item.item-tall {
  grid-row: span 2;
}

.gallery-thumb {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.gallery-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-fallback,
.lb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  text-align: center;
  color: var(--text-light);
  background:
    radial-gradient(circle at top, rgba(26, 127, 222, 0.18), transparent 45%),
    linear-gradient(135deg, rgba(8, 23, 45, 0.96), rgba(18, 37, 66, 0.96));
}

.gallery-fallback-icon,
.lb-fallback-icon {
  font-size: 28px;
}

.gallery-fallback-title,
.lb-fallback-title {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(5, 13, 26, 0.7), rgba(201, 162, 39, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.overlay-content {
  text-align: center;
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.overlay-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
}

.overlay-title {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  color: var(--text-white);
  padding: 0 16px;
  line-height: 1.3;
}

.gallery-item:hover .gallery-thumb img {
  transform: scale(1.08);
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-item:hover .overlay-content {
  transform: translateY(0);
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(2, 8, 16, 0.96);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.lb-close {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-white);
  font-size: 18px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2001;
}

.lb-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lb-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(201, 162, 39, 0.15);
  border: 1px solid var(--border-gold);
  color: var(--gold);
  font-size: 32px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2001;
}

.lb-nav:hover {
  background: rgba(201, 162, 39, 0.25);
}

.lb-prev {
  left: 24px;
}

.lb-next {
  right: 24px;
}

.lb-content {
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lb-img-wrap {
  border-radius: var(--radius-md);
  overflow: hidden;
  max-height: 60vh;
}

.lb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 60vh;
}

.lb-fallback {
  min-height: 320px;
  border-radius: var(--radius-md);
}

.lb-info {
  text-align: center;
}

.lb-title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--gold);
  margin-bottom: 8px;
}

.lb-desc {
  color: var(--text-gray);
  font-size: 14px;
}

.lb-counter {
  margin-top: 8px;
  font-family: var(--font-heading);
  font-size: 12px;
  color: var(--text-dim);
  letter-spacing: 2px;
}

.lb-source {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid rgba(201, 162, 39, 0.45);
  background: rgba(201, 162, 39, 0.12);
  color: var(--gold);
  font-weight: 700;
  text-decoration: none;
  transition: var(--transition);
}

.lb-source:hover {
  background: rgba(201, 162, 39, 0.2);
  border-color: rgba(201, 162, 39, 0.7);
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 160px;
  }

  .gallery-item.item-wide,
  .gallery-item.item-tall {
    grid-column: auto;
    grid-row: auto;
  }

  .lb-nav {
    display: none;
  }

  .lightbox {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: 140px;
  }
}

.gallery-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.08) 50%, transparent 60%);
  transform: translateX(-100%) skewX(-15deg);
  pointer-events: none;
  z-index: 5;
  border-radius: inherit;
}

.gallery-item:hover::after {
  animation: shimmerSweep 0.6s ease forwards;
}
</style>
