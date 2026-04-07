<template>
  <footer class="footer">
    <div class="footer-glow"></div>

    <div class="container">
      <div class="footer-main">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="fl-text">VHEC</span>
            <span class="fl-badge">10 NĂM</span>
          </div>
          <p class="footer-fullname">{{ $t('footer.fullname') }}</p>
          <p class="footer-slogan">{{ $t('footer.slogan') }}</p>
          <div class="footer-social">
            <a href="https://www.facebook.com/vhec.vn/" target="_blank" class="social-btn" aria-label="Facebook">
              <span>f</span>
            </a>
            <a href="https://vhec.vn" target="_blank" class="social-btn" aria-label="Website">
              <span>🌐</span>
            </a>
          </div>
        </div>

        <!-- Links -->
        <div class="footer-nav">
          <h4 class="footer-nav-title">{{ $t('footer.explore') }}</h4>
          <ul>
            <li><a href="#journey">{{ $t('nav.journey') }}</a></li>
            <li><a href="#achievements">{{ $t('nav.achievements') }}</a></li>
            <li><a href="#gallery">{{ $t('nav.gallery') }}</a></li>
            <li><a href="#game">{{ $t('nav.game') }}</a></li>
            <li><a href="#leaderboard">{{ $t('nav.leaderboard') }}</a></li>
          </ul>
        </div>

        <!-- Info -->
        <div class="footer-info">
          <h4 class="footer-nav-title">{{ $t('footer.contact') }}</h4>
          <div class="info-items">
            <div class="info-item">
              <span class="info-icon">📍</span>
              <span>{{ $t('footer.address') }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">📧</span>
              <span>info@vhec.vn</span>
            </div>
            <div class="info-item">
              <span class="info-icon">📞</span>
              <span>(024) 6680 5588</span>
            </div>
            <div class="info-item">
              <span class="info-icon">🌐</span>
              <span>vhec.vn</span>
            </div>
          </div>
        </div>

        <!-- Stats mini -->
        <div class="footer-stats">
          <h4 class="footer-nav-title">{{ $t('footer.proudNumbers') }}</h4>
          <div class="fstat-items">
            <div class="fstat-item">
              <span class="fstat-val">40+</span>
              <span class="fstat-label">{{ $t('footer.engineers') }}</span>
            </div>
            <div class="fstat-item">
              <span class="fstat-val">500+</span>
              <span class="fstat-label">{{ $t('footer.network') }}</span>
            </div>
            <div class="fstat-item">
              <span class="fstat-val">100+</span>
              <span class="fstat-label">{{ $t('footer.projects') }}</span>
            </div>
            <div class="fstat-item">
              <span class="fstat-val">80%</span>
              <span class="fstat-label">{{ $t('footer.university') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="footer-divider"></div>

      <!-- Bottom -->
      <div class="footer-bottom">
        <div class="copyright">
          {{ $t('footer.copyright') }}
        </div>
        <div class="footer-tag">
          {{ $t('footer.builtBy') }}
        </div>
      </div>
    </div>

    <!-- Decorative bottom line -->
    <div class="footer-bottom-line"></div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
useI18n()
</script>

<style scoped>
.footer {
  background: var(--bg-darkest);
  border-top: 1px solid var(--border-gold);
  padding: 80px 0 0;
  position: relative;
  overflow: hidden;
}

.footer-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 200px;
  background: radial-gradient(ellipse, rgba(201, 162, 39, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 48px;
}

/* Brand */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.fl-text {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(135deg, var(--blue-bright), var(--blue-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.fl-badge {
  background: linear-gradient(135deg, var(--blue), var(--blue-bright));
  color: #fff;
  font-family: var(--font-heading);
  font-size: 9px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 100px;
  letter-spacing: 1px;
}

.footer-fullname {
  font-size: 12px;
  color: var(--blue-light);
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.footer-slogan {
  color: var(--text-gray);
  font-size: 13px;
  line-height: 1.8;
  margin-bottom: 20px;
  font-style: italic;
}

.footer-social {
  display: flex;
  gap: 8px;
}

.social-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-gray);
  transition: var(--transition);
  cursor: pointer;
}

.social-btn:hover {
  background: rgba(201, 162, 39, 0.15);
  border-color: var(--border-gold);
  color: var(--gold);
}

/* Nav */
.footer-nav-title {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 20px;
}

.footer-nav ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-nav a {
  font-size: 14px;
  color: var(--text-gray);
  transition: color 0.2s ease;
  cursor: pointer;
}

.footer-nav a:hover {
  color: var(--gold);
}

/* Info */
.info-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-gray);
}

.info-icon {
  font-size: 14px;
  flex-shrink: 0;
}

/* Stats */
.fstat-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.fstat-item {
  background: rgba(201, 162, 39, 0.05);
  border: 1px solid var(--border-gold);
  border-radius: var(--radius-sm);
  padding: 10px;
  text-align: center;
}

.fstat-val {
  display: block;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 800;
  color: var(--gold);
  line-height: 1;
  margin-bottom: 4px;
}

.fstat-label {
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 0.5px;
}

/* Bottom */
.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-gold), transparent);
  margin-bottom: 24px;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 32px;
  flex-wrap: wrap;
}

.copyright {
  font-size: 13px;
  color: var(--text-dim);
}

.footer-tag {
  font-size: 13px;
  color: var(--text-dim);
}

.footer-bottom-line {
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--blue), var(--blue-bright), var(--blue-light), var(--blue), transparent);
}

@media (max-width: 900px) {
  .footer-main {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .footer-brand {
    grid-column: span 2;
  }
}

@media (max-width: 540px) {
  .footer-main {
    grid-template-columns: 1fr;
  }

  .footer-brand {
    grid-column: auto;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
