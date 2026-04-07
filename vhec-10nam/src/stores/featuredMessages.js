import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

export const useFeaturedMessagesStore = defineStore('featuredMessages', () => {
  const messages = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchMessages() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('featured_messages')
        .select('*')
        .order('sort_order', { ascending: true })
      if (err) throw err
      messages.value = data || []
    } catch (e) {
      error.value = 'Không thể tải lời chúc nổi bật'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  fetchMessages()

  return { messages, loading, error, fetchMessages }
})
