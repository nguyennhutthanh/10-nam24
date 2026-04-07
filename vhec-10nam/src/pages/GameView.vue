<template>
  <div class="game-page">
    <router-link to="/" class="back-btn">← Trang chủ</router-link>

    <DevDefender />

    <LeaderboardSection id="leaderboard" />
    <FooterSection />
  </div>
</template>

<script setup>
import { useReveal } from '../composables/useReveal.js'
import DevDefender from '../components/DevDefender.vue'
import LeaderboardSection from '../components/LeaderboardSection.vue'
import FooterSection from '../components/FooterSection.vue'

useReveal('[data-reveal]')
</script>

<style scoped>
.game-page {
  min-height: 100vh;
}

.back-btn {
  position: fixed;
  top: 72px;
  left: 20px;
  z-index: 220;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-dim);
  background: rgba(8, 24, 48, 0.85);
  border: 1px solid var(--border-blue);
  border-radius: 100px;
  padding: 8px 16px;
  text-decoration: none;
  backdrop-filter: blur(10px);
  transition: var(--transition);
}

.back-btn:hover {
  color: var(--blue-bright);
  border-color: var(--blue-bright);
  transform: translateX(-2px);
}
</style>
