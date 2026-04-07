import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

export const useWishesStore = defineStore('wishes', () => {
  const wishes = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchWishes() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (err) throw err
      wishes.value = data || []
    } catch (e) {
      error.value = 'Không thể tải lời chúc'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function submitWish(name, role, message) {
    const { data, error: err } = await supabase
      .from('wishes')
      .insert([{ name: name.trim(), role: role.trim(), message: message.trim() }])
      .select()
      .single()
    if (err) throw err
    wishes.value.unshift(data)
    return data
  }

  fetchWishes()

  return { wishes, loading, error, fetchWishes, submitWish }
})
