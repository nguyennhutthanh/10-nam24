import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const entries = ref([])
  const loading = ref(false)
  const error = ref(null)

  function normalizeName(name) {
    return name.trim().replace(/\s+/g, ' ')
  }

  async function fetchLeaderboard() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(20)

      if (err) throw err
      entries.value = data || []
    } catch (e) {
      error.value = 'Khong the tai bang xep hang'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function findByName(name) {
    const normalizedName = normalizeName(name)
    if (!normalizedName) return null

    const { data, error: err } = await supabase
      .from('leaderboard')
      .select('id, name, score, player_id')
      .ilike('name', normalizedName)
      .limit(1)
      .maybeSingle()

    if (err) throw err
    return data
  }

  async function findByPlayerId(playerId) {
    if (!playerId) return null

    const { data, error: err } = await supabase
      .from('leaderboard')
      .select('id, name, score, player_id')
      .eq('player_id', playerId)
      .limit(1)
      .maybeSingle()

    if (err) throw err
    return data
  }

  async function isNameTaken(name, playerId) {
    const normalizedName = normalizeName(name)
    if (!normalizedName) return false

    const existing = await findByName(normalizedName)
    if (!existing) return false
    return existing.player_id !== playerId
  }

  async function addEntry(name, score, meta = {}) {
    try {
      const normalizedName = normalizeName(name)
      const playerId = meta.playerId
      const deviceLabel = meta.deviceLabel ?? null
      const userAgent = meta.userAgent ?? null

      if (!normalizedName) {
        throw new Error('missing_name')
      }
      if (!playerId) {
        throw new Error('missing_player_id')
      }

      const existingByPlayer = await findByPlayerId(playerId)
      const existingByName = await findByName(normalizedName)

      if (existingByName?.player_id && existingByName.player_id !== playerId) {
        const err = new Error('name_taken')
        err.code = 'name_taken'
        throw err
      }

      const target = existingByPlayer || existingByName
      let data
      let err

      if (target?.id) {
        const nextScore = Math.max(target.score ?? 0, score)
        const result = await supabase
          .from('leaderboard')
          .update({
            name: normalizedName,
            score: nextScore,
            player_id: playerId,
            device_label: deviceLabel,
            user_agent: userAgent,
            last_played_at: new Date().toISOString(),
          })
          .eq('id', target.id)
          .select()
          .single()
        data = result.data
        err = result.error
      } else {
        const result = await supabase
          .from('leaderboard')
          .insert([{
            name: normalizedName,
            score,
            player_id: playerId,
            device_label: deviceLabel,
            user_agent: userAgent,
            last_played_at: new Date().toISOString(),
          }])
          .select()
          .single()
        data = result.data
        err = result.error
      }

      if (err) throw err

      await fetchLeaderboard()

      const rank = entries.value.findIndex((entry) => entry.id === data.id) + 1
      return { entry: data, rank: rank > 0 ? rank : entries.value.length }
    } catch (e) {
      console.error('Loi nop diem:', e)
      throw e
    }
  }

  const top3 = computed(() => entries.value.slice(0, 3))
  const top20 = computed(() => entries.value.slice(0, 20))

  fetchLeaderboard()

  return {
    entries,
    top3,
    top20,
    loading,
    error,
    fetchLeaderboard,
    addEntry,
    isNameTaken,
    normalizeName,
  }
})
