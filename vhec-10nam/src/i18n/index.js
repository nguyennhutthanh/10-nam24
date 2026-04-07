import { createI18n } from 'vue-i18n'
import vi from './vi.js'
import ja from './ja.js'

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('vhec_lang') || 'vi',
  fallbackLocale: 'vi',
  messages: { vi, ja },
})
