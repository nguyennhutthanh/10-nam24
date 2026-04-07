<template>
  <section id="leaderboard" class="section lb-section">
    <div class="lb-bg-glow"></div>
    <div class="container">
      <div class="section-header reveal" data-reveal>
        <div class="section-badge">{{ $t('leaderboard.badge') }}</div>
        <div class="gold-line"></div>
        <h2 class="section-title">
          <i18n-t keypath="leaderboard.title" tag="span">
            <template #highlight><span class="highlight">{{ $t('leaderboard.highlight') }}</span></template>
          </i18n-t>
        </h2>
        <p class="section-subtitle">{{ $t('leaderboard.subtitle') }}</p>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="lb-loading">
        <div class="spinner"></div>
        <span>{{ $t('leaderboard.loading') }}</span>
      </div>

      <!-- Error -->
      <div v-else-if="store.error" class="lb-error">
        <span>⚠️ {{ store.error }}</span>
        <button class="btn btn-outline btn-sm" @click="store.fetchLeaderboard()">{{ $t('leaderboard.retry') }}</button>
      </div>

      <!-- Podium Top 3 -->
      <div v-else-if="top3.length > 0" class="podium-wrap">
        <!-- 2nd place -->
        <div v-if="top3[1]" class="podium-item podium-2">
          <div class="podium-avatar">🥈</div>
          <div class="podium-name">{{ top3[1].name }}</div>
          <div class="podium-score">{{ top3[1].score.toLocaleString() }}</div>
          <div class="podium-block p-block-2">
            <span class="podium-rank">2</span>
          </div>
        </div>

        <!-- 1st place -->
        <div v-if="top3[0]" class="podium-item podium-1">
          <div class="podium-crown">👑</div>
          <div class="podium-avatar avatar-gold">🥇</div>
          <div class="podium-name name-gold">{{ top3[0].name }}</div>
          <div class="podium-score score-gold">{{ top3[0].score.toLocaleString() }}</div>
          <div class="podium-block p-block-1">
            <span class="podium-rank">1</span>
          </div>
        </div>

        <!-- 3rd place -->
        <div v-if="top3[2]" class="podium-item podium-3">
          <div class="podium-avatar">🥉</div>
          <div class="podium-name">{{ top3[2].name }}</div>
          <div class="podium-score">{{ top3[2].score.toLocaleString() }}</div>
          <div class="podium-block p-block-3">
            <span class="podium-rank">3</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!store.loading" class="lb-empty">
        <div class="empty-icon">🏆</div>
        <p>{{ $t('leaderboard.empty') }}</p>
      </div>

      <!-- Full list -->
      <div v-if="!store.loading && !store.error" class="lb-list">
        <div class="lb-list-header">
          <div class="lh-rank">{{ $t('leaderboard.rank') }}</div>
          <div class="lh-name">{{ $t('leaderboard.player') }}</div>
          <div class="lh-score">{{ $t('leaderboard.score') }}</div>
          <div class="lh-time">{{ $t('leaderboard.time') }}</div>
        </div>

        <TransitionGroup name="slide-up" tag="div" class="lb-entries">
          <div
            v-for="(entry, i) in top20"
            :key="entry.id"
            class="lb-entry"
            :class="getRankClass(i)"
          >
            <div class="le-rank">
              <span v-if="i < 3" class="rank-medal">{{ medals[i] }}</span>
              <span v-else class="rank-num">#{{ i + 1 }}</span>
            </div>
            <div class="le-name">
              <span class="le-name-text">{{ entry.name }}</span>
              <span v-if="i === 0" class="le-badge">{{ $t('leaderboard.champion') }}</span>
            </div>
            <div class="le-score">
              <span class="score-num">{{ entry.score.toLocaleString() }}</span>
              <span class="score-unit">pts</span>
            </div>
            <div class="le-time">{{ formatTime(entry.created_at) }}</div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Actions -->
      <div class="lb-actions">
        <button class="btn btn-outline" @click="playGame">{{ $t('leaderboard.btnPlay') }}</button>
        <button class="btn btn-dim" @click="store.fetchLeaderboard()" :disabled="store.loading">{{ $t('leaderboard.btnRefresh') }}</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useLeaderboardStore } from '../stores/leaderboard.js'

useI18n()

const router = useRouter()
const store = useLeaderboardStore()
const top3 = computed(() => store.top3)
const top20 = computed(() => store.top20)

const medals = ['🥇', '🥈', '🥉']

function getRankClass(index) {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return ''
}

function formatTime(isoString) {
  try {
    const d = new Date(isoString)
    return d.toLocaleString('vi-VN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '--'
  }
}

function playGame() {
  router.push('/game')
}
</script>

<style scoped>
.lb-section {
  background: linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-darkest) 100%);
  position: relative;
  overflow: hidden;
}

.lb-bg-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 300px;
  background: radial-gradient(ellipse, rgba(201, 162, 39, 0.07) 0%, transparent 70%);
  pointer-events: none;
}

/* Loading */
.lb-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px;
  color: var(--text-gray);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(26, 127, 222, 0.2);
  border-top-color: var(--blue-bright);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.lb-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  color: #ff6b6b;
  font-size: 14px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 12px;
}

/* Podium */
.podium-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  margin-bottom: 64px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 200px;
}

.podium-crown {
  font-size: 28px;
  animation: float 2s ease-in-out infinite;
}

.podium-avatar {
  font-size: 36px;
}

.avatar-gold {
  font-size: 44px;
  filter: drop-shadow(0 0 12px rgba(201, 162, 39, 0.8));
  animation: float 2s ease-in-out infinite;
}

.podium-name {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  color: var(--text-white);
  text-align: center;
  word-break: break-word;
}

.name-gold {
  color: var(--gold);
  font-size: 16px;
}

.podium-score {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 800;
  color: var(--text-gray);
}

.score-gold {
  color: var(--gold-light);
  font-size: 22px;
}

.podium-block {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.p-block-1 {
  height: 120px;
  background: linear-gradient(180deg, rgba(201, 162, 39, 0.3), rgba(201, 162, 39, 0.1));
  border: 1px solid rgba(201, 162, 39, 0.5);
  border-bottom: none;
  box-shadow: 0 -8px 30px rgba(201, 162, 39, 0.2);
}

.p-block-2 {
  height: 80px;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.05));
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-bottom: none;
}

.p-block-3 {
  height: 60px;
  background: linear-gradient(180deg, rgba(180, 137, 93, 0.2), rgba(180, 137, 93, 0.05));
  border: 1px solid rgba(180, 137, 93, 0.3);
  border-bottom: none;
}

.podium-rank {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.2);
}

/* Empty */
.lb-empty {
  text-align: center;
  padding: 48px;
  color: var(--text-dim);
  margin-bottom: 40px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* List */
.lb-list {
  background: linear-gradient(135deg, var(--bg-card), rgba(15, 32, 64, 0.6));
  border: 1px solid var(--border-gold);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 32px;
}

.lb-list-header {
  display: grid;
  grid-template-columns: 80px 1fr 120px 140px;
  padding: 16px 24px;
  background: rgba(201, 162, 39, 0.06);
  border-bottom: 1px solid var(--border-gold);
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-dim);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.lb-entries {
  position: relative;
}

.lb-entry {
  display: grid;
  grid-template-columns: 80px 1fr 120px 140px;
  padding: 14px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  align-items: center;
  transition: background 0.2s ease;
}

.lb-entry:last-child {
  border-bottom: none;
}

.lb-entry:hover {
  background: rgba(255, 255, 255, 0.03);
}

.lb-entry.rank-1 {
  background: rgba(201, 162, 39, 0.08);
}

.lb-entry.rank-2 {
  background: rgba(148, 163, 184, 0.04);
}

.lb-entry.rank-3 {
  background: rgba(180, 137, 93, 0.04);
}

.le-rank {
  display: flex;
  align-items: center;
}

.rank-medal {
  font-size: 22px;
}

.rank-num {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  color: var(--text-dim);
}

.le-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.le-name-text {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-white);
}

.le-badge {
  background: linear-gradient(135deg, var(--gold), var(--gold-light));
  color: var(--bg-darkest);
  font-family: var(--font-heading);
  font-size: 8px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 100px;
  letter-spacing: 1px;
}

.le-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.score-num {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 800;
  color: var(--gold);
}

.score-unit {
  font-size: 11px;
  color: var(--text-dim);
}

.le-time {
  font-size: 12px;
  color: var(--text-dim);
}

/* Actions */
.lb-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-dim {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-dim);
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 100px;
  transition: var(--transition);
}

.btn-dim:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-gray);
}

@media (max-width: 640px) {
  .lb-list-header,
  .lb-entry {
    grid-template-columns: 60px 1fr 90px;
  }

  .lh-time,
  .le-time {
    display: none;
  }

  .podium-wrap {
    gap: 4px;
  }

  .podium-name {
    font-size: 11px;
  }
}
</style>
