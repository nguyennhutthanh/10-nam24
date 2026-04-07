<template>
  <section id="messages" class="section messages-section">
    <div class="container">
      <div class="section-header reveal" data-reveal>
        <div class="section-badge">{{ $t('messages.badge') }}</div>
        <div class="gold-line"></div>
        <h2 class="section-title">
          <i18n-t keypath="messages.title" tag="span">
            <template #highlight><span class="highlight">{{ $t('messages.highlight') }}</span></template>
          </i18n-t>
        </h2>
        <p class="section-subtitle">{{ $t('messages.subtitle') }}</p>
      </div>

      <!-- ===== CAROUSEL NỔI BẬT ===== -->
      <div v-if="fmStore.loading" class="carousel-loading">
        <div class="spinner"></div>
      </div>

      <template v-else-if="fmStore.messages.length > 0">
        <div class="carousel-wrap">
          <button class="carousel-nav prev" @click="prev">&#8249;</button>
          <div class="carousel-track-wrap" ref="trackWrap">
            <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * slideWidth}px)` }">
              <div v-for="msg in fmStore.messages" :key="msg.id" class="msg-card">
                <div class="msg-quote">"</div>
                <p class="msg-text">{{ msg.message }}</p>
                <div class="msg-author">
                  <img :src="msg.avatar_url || `https://i.pravatar.cc/150?u=${msg.id}`" :alt="msg.name" class="msg-avatar" loading="lazy" />
                  <div class="msg-info">
                    <div class="msg-name">{{ msg.name }}</div>
                    <div class="msg-role">{{ msg.role }}</div>
                  </div>
                  <div class="msg-tag">{{ msg.tag }}</div>
                </div>
              </div>
            </div>
          </div>
          <button class="carousel-nav next" @click="next">&#8250;</button>
        </div>

        <div class="carousel-dots">
          <button v-for="(_, i) in fmStore.messages" :key="i" class="dot" :class="{ active: i === currentIndex }" @click="goTo(i)"></button>
        </div>
      </template>

      <!-- ===== FORM GỬI LỜI CHÚC ===== -->
      <div class="wish-section">
        <div class="wish-divider">
          <span>{{ $t('messages.divider') }}</span>
        </div>

        <div class="wish-form-wrap">
          <Transition name="fade">
            <div v-if="submitSuccess" class="wish-success">
              🎉 {{ $t('messages.successMsg', { name: lastSubmitName }) }}
            </div>
          </Transition>

          <form v-if="!submitSuccess" class="wish-form" @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group">
                <label>{{ $t('messages.formName') }} <span class="req">*</span></label>
                <input v-model.trim="wForm.name" type="text" :placeholder="$t('messages.formNamePlaceholder')" maxlength="60" />
                <span v-if="errors.name" class="err">{{ errors.name }}</span>
              </div>
              <div class="form-group">
                <label>{{ $t('messages.formRole') }}</label>
                <input v-model.trim="wForm.role" type="text" :placeholder="$t('messages.formRolePlaceholder')" maxlength="80" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ $t('messages.formMessage') }} <span class="req">*</span></label>
              <textarea
                v-model.trim="wForm.message"
                :placeholder="$t('messages.formMessagePlaceholder')"
                rows="4"
                maxlength="500"
              ></textarea>
              <div class="char-count">{{ wForm.message.length }}/500</div>
              <span v-if="errors.message" class="err">{{ errors.message }}</span>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-gold" :disabled="submitting">
                <span v-if="submitting">⏳ {{ $t('messages.sending') }}</span>
                <span v-else>💌 {{ $t('messages.btnSend') }}</span>
              </button>
              <span v-if="submitError" class="err">{{ submitError }}</span>
            </div>
          </form>

          <button v-else class="btn btn-outline" @click="resetForm">
            {{ $t('messages.btnMore') }}
          </button>
        </div>

        <!-- ===== FEED LỜI CHÚC THẬT ===== -->
        <div class="wishes-feed">
          <div class="feed-header">
            <h3 class="feed-title">{{ $t('messages.feedTitle') }}</h3>
            <button class="btn-refresh" @click="store.fetchWishes()" :disabled="store.loading">
              🔄 {{ store.loading ? $t('messages.loading') : $t('messages.refresh') }}
            </button>
          </div>

          <!-- Loading -->
          <div v-if="store.loading && store.wishes.length === 0" class="feed-loading">
            <div class="spinner"></div>
          </div>

          <!-- Empty -->
          <div v-else-if="!store.loading && store.wishes.length === 0" class="feed-empty">
            <span>{{ $t('messages.empty') }}</span>
          </div>

          <!-- Wishes grid -->
          <div v-else class="wishes-grid">
            <TransitionGroup name="slide-up" tag="div" class="wishes-inner">
              <div v-for="w in store.wishes" :key="w.id" class="wish-card">
                <div class="wc-quote">"</div>
                <p class="wc-message">{{ w.message }}</p>
                <div class="wc-footer">
                  <div class="wc-avatar">{{ w.name.charAt(0).toUpperCase() }}</div>
                  <div class="wc-info">
                    <div class="wc-name">{{ w.name }}</div>
                    <div class="wc-role">{{ w.role || $t('messages.memberDefault') }}</div>
                  </div>
                  <div class="wc-time">{{ formatTime(w.created_at) }}</div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWishesStore } from '../stores/wishes.js'
import { useFeaturedMessagesStore } from '../stores/featuredMessages.js'

const store = useWishesStore()
const fmStore = useFeaturedMessagesStore()
const { t } = useI18n()

// ----- Carousel -----
const currentIndex = ref(0)
const trackWrap = ref(null)
const slideWidth = ref(0)
let autoplayTimer = null

function updateSlideWidth() {
  if (trackWrap.value) slideWidth.value = trackWrap.value.offsetWidth
}
function prev() {
  const len = fmStore.messages.length || 1
  currentIndex.value = (currentIndex.value - 1 + len) % len
  resetAutoplay()
}
function next() {
  const len = fmStore.messages.length || 1
  currentIndex.value = (currentIndex.value + 1) % len
  resetAutoplay()
}
function goTo(i) { currentIndex.value = i; resetAutoplay() }

// Khi data load xong mới tính slideWidth và bắt đầu autoplay
watch(() => fmStore.messages.length, async (newLen) => {
  currentIndex.value = 0
  if (newLen > 0) {
    await nextTick()
    updateSlideWidth()
    resetAutoplay()
  }
})
function resetAutoplay() { clearInterval(autoplayTimer); autoplayTimer = setInterval(next, 5000) }

// ----- Wish Form -----
const wForm = ref({ name: '', role: '', message: '' })
const errors = ref({})
const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)
const lastSubmitName = ref('')

function validate() {
  errors.value = {}
  if (!wForm.value.name || wForm.value.name.length < 2) errors.value.name = t('messages.errName')
  if (!wForm.value.message || wForm.value.message.length < 10) errors.value.message = t('messages.errMessage')
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  submitError.value = ''
  try {
    await store.submitWish(wForm.value.name, wForm.value.role, wForm.value.message)
    lastSubmitName.value = wForm.value.name
    submitSuccess.value = true
  } catch (e) {
    submitError.value = e?.message || t('messages.errSend')
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  wForm.value = { name: '', role: '', message: '' }
  errors.value = {}
  submitSuccess.value = false
  submitError.value = ''
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

onMounted(() => {
  updateSlideWidth()
  window.addEventListener('resize', updateSlideWidth)
  resetAutoplay()
})
onUnmounted(() => {
  clearInterval(autoplayTimer)
  window.removeEventListener('resize', updateSlideWidth)
})
</script>

<style scoped>
.messages-section { background: var(--bg-dark); }

.carousel-loading { display: flex; justify-content: center; padding: 60px; }

/* ===== CAROUSEL ===== */
.carousel-wrap { position: relative; max-width: 800px; margin: 0 auto 24px; }
.carousel-track-wrap { overflow: hidden; border-radius: var(--radius-md); }
.carousel-track { display: flex; transition: transform 0.5s cubic-bezier(0.4,0,0.2,1); }
.msg-card { flex: 0 0 100%; background: linear-gradient(135deg, var(--bg-card), rgba(8,24,48,0.7)); border: 1px solid var(--border-blue); border-radius: var(--radius-md); padding: 36px 72px; position: relative; overflow: hidden; }
.msg-card::before { content: ''; position: absolute; top:0; left:0; right:0; height:2px; background: linear-gradient(90deg, transparent, var(--blue-bright), transparent); }
.msg-quote { font-family: Georgia,serif; font-size: 80px; color: rgba(26,127,222,0.12); line-height: 0.7; position: absolute; top:20px; left:20px; pointer-events:none; }
.msg-text { font-size: 16px; line-height: 1.8; color: var(--text-light); margin-bottom: 24px; position: relative; z-index:1; font-style:italic; }
.msg-author { display:flex; align-items:center; gap:14px; }
.msg-avatar { width:48px; height:48px; border-radius:50%; border:2px solid var(--border-blue); object-fit:cover; flex-shrink:0; }
.msg-info { flex:1; }
.msg-name { font-family: var(--font-heading); font-size:15px; font-weight:700; color:var(--text-white); }
.msg-role { font-size:12px; color:var(--text-dim); margin-top:2px; }
.msg-tag { background: rgba(26,127,222,0.15); border:1px solid var(--border-blue); color:var(--blue-light); font-family:var(--font-heading); font-size:10px; font-weight:700; padding:4px 10px; border-radius:100px; letter-spacing:1px; flex-shrink:0; }
.carousel-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(8,24,48,0.85); border: 1px solid var(--border-blue);
  color: var(--blue-light); font-size: 26px; cursor: pointer;
  transition: var(--transition); display: flex; align-items: center; justify-content: center;
  z-index: 10; backdrop-filter: blur(6px);
}
.carousel-nav.prev { left: 10px; }
.carousel-nav.next { right: 10px; }
.carousel-nav:hover { background: rgba(26,127,222,0.25); border-color: var(--blue-bright); transform: translateY(-50%) scale(1.08); }
.carousel-dots { display:flex; justify-content:center; gap:8px; max-width:800px; margin:0 auto 0; }
.dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.15); border:none; cursor:pointer; transition:var(--transition); }
.dot.active { background:var(--blue-bright); width:24px; border-radius:4px; box-shadow:0 0 8px var(--blue-glow); }

/* ===== WISH SECTION ===== */
.wish-section { margin-top: 60px; }

.wish-divider {
  display: flex; align-items: center; gap: 16px; margin-bottom: 40px;
}
.wish-divider::before, .wish-divider::after {
  content: ''; flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-blue), transparent);
}
.wish-divider span {
  font-family: var(--font-heading); font-size: 15px; font-weight: 700;
  color: var(--blue-light); letter-spacing: 1px; white-space: nowrap;
}

/* FORM */
.wish-form-wrap {
  max-width: 700px; margin: 0 auto 48px;
  background: linear-gradient(135deg, var(--bg-card), rgba(8,24,48,0.8));
  border: 1px solid var(--border-blue); border-radius: var(--radius-md); padding: 36px;
  position: relative; overflow: hidden;
}
.wish-form-wrap::before { content:''; position:absolute; top:0;left:0;right:0;height:2px; background:linear-gradient(90deg,var(--blue),var(--blue-bright),var(--blue-light),var(--blue-bright),var(--blue)); }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 0; }
.form-group label { font-family: var(--font-heading); font-size: 12px; font-weight: 700; color: var(--text-gray); letter-spacing: 0.5px; text-transform: uppercase; }
.req { color: #ff6b6b; }
.form-group input,
.form-group textarea {
  background: rgba(255,255,255,0.05); border: 1px solid var(--border-blue);
  border-radius: var(--radius-sm); color: var(--text-white); font-family: var(--font-body);
  font-size: 15px; padding: 12px 16px; outline: none; transition: var(--transition); resize: none;
}
.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--blue-bright); background: rgba(26,127,222,0.08);
  box-shadow: 0 0 0 3px rgba(26,127,222,0.12);
}
.form-group input::placeholder,
.form-group textarea::placeholder { color: var(--text-dim); }
.char-count { font-size: 11px; color: var(--text-dim); text-align: right; margin-top: 4px; }
.err { color: #ff6b6b; font-size: 12px; }
.form-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

.wish-success {
  background: rgba(26,127,222,0.1); border: 1px solid var(--border-blue);
  border-radius: var(--radius-sm); padding: 20px 24px; color: var(--text-white);
  font-size: 15px; line-height: 1.7; text-align: center; margin-bottom: 20px;
}
.wish-success strong { color: var(--blue-light); }

/* FEED */
.feed-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.feed-title { font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: var(--text-white); }
.btn-refresh { background: transparent; border: 1px solid var(--border-blue); color: var(--text-dim); font-size: 12px; padding: 6px 14px; border-radius: 100px; cursor: pointer; transition: var(--transition); }
.btn-refresh:hover { color: var(--blue-light); border-color: var(--blue-bright); }
.btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

.feed-loading { display: flex; justify-content: center; padding: 40px; }
.spinner { width: 36px; height: 36px; border: 3px solid rgba(26,127,222,0.2); border-top-color: var(--blue-bright); border-radius: 50%; animation: spin 0.8s linear infinite; }
.feed-empty { text-align: center; padding: 48px; color: var(--text-dim); font-size: 15px; }

.wishes-grid { }
.wishes-inner { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

.wish-card {
  background: linear-gradient(135deg, rgba(8,24,48,0.9), rgba(7,22,40,0.7));
  border: 1px solid var(--border-blue); border-radius: var(--radius-md);
  padding: 20px; position: relative; overflow: hidden; transition: var(--transition);
}
.wish-card:hover { border-color: var(--blue-bright); transform: translateY(-3px); box-shadow: var(--shadow-blue); }
.wish-card::before { content:''; position:absolute; top:0;left:0;right:0; height:2px; background:linear-gradient(90deg,transparent,var(--blue-bright),transparent); opacity:0; transition:opacity 0.3s; }
.wish-card:hover::before { opacity:1; }

.wc-quote { font-family:Georgia,serif; font-size:40px; color:rgba(26,127,222,0.12); line-height:0.8; position:absolute; top:12px; left:12px; pointer-events:none; }
.wc-message { font-size: 13px; line-height: 1.7; color: var(--text-light); margin-bottom: 16px; position: relative; z-index:1; font-style: italic; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.wc-footer { display: flex; align-items: center; gap: 10px; }
.wc-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--blue), var(--blue-bright)); color: #fff; font-family: var(--font-heading); font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.wc-info { flex: 1; min-width: 0; }
.wc-name { font-family: var(--font-heading); font-size: 12px; font-weight: 700; color: var(--text-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wc-role { font-size: 10px; color: var(--text-dim); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wc-time { font-size: 10px; color: var(--text-dim); flex-shrink: 0; }

@media (max-width: 768px) {
  .carousel-nav { display: none; }
  .wishes-inner { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .wish-form-wrap { padding: 24px 16px; }
  .msg-card { padding: 24px 20px; }
}
@media (min-width: 769px) and (max-width: 1024px) {
  .wishes-inner { grid-template-columns: repeat(2, 1fr); }
}
</style>
