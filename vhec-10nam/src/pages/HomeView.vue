<template>
  <div>
    <HeroBanner @scroll-to="scrollTo" />
    <JourneySection id="journey" />
    <AchievementsSection id="achievements" />
    <GallerySection id="gallery" />
    <LeaderboardSection id="leaderboard" />
    <MessagesSection id="messages" />
    <FooterSection />
  </div>
</template>

<script setup>
import { useReveal } from '../composables/useReveal.js'
import HeroBanner from '../components/HeroBanner.vue'

useReveal('[data-reveal]')
import JourneySection from '../components/JourneySection.vue'
import AchievementsSection from '../components/AchievementsSection.vue'
import GallerySection from '../components/GallerySection.vue'
import LeaderboardSection from '../components/LeaderboardSection.vue'
import MessagesSection from '../components/MessagesSection.vue'
import FooterSection from '../components/FooterSection.vue'

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  else if (id === 'hero') window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
