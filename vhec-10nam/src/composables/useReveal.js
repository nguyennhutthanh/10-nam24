import { ref, onMounted, onUnmounted } from 'vue'

/**
 * useReveal — dùng IntersectionObserver để reveal các phần tử khi scroll đến
 * @param {string} selector — CSS selector của các phần tử cần reveal
 * @param {object} options
 */
export function useReveal(selector = '[data-reveal]', options = {}) {
  const { threshold = 0.15, once = true } = options
  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          if (once) observer.unobserve(entry.target)
        } else if (!once) {
          entry.target.classList.remove('revealed')
        }
      })
    }, { threshold })

    document.querySelectorAll(selector).forEach(el => observer.observe(el))
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })
}
