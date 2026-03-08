/* ═══════════════════════════════════════════════════════
   FEMINICÍDIO — ELAS EXISTIRAM
   javascript.js  |  Modal · QR · Swipe · Scroll reveal
═══════════════════════════════════════════════════════ */

/* ── SELETORES ─────────────────────────────────────── */
const overlay  = document.getElementById('overlay');
const modal    = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalCat = document.getElementById('modal-cat');
const modalName= document.getElementById('modal-name');
const modalDesc= document.getElementById('modal-desc');

/* ── FIX: guarda o ID do timeout de limpeza ─────────── */
let closeTimeoutId = null;

/* ── QR: lê o src original do card ─────────────────── */
function getQrSrc(card) {
  const qrEl = card.querySelector('.card-qr img');
  return qrEl ? qrEl.getAttribute('src') : null;
}

/* ── ABRIR MODAL ────────────────────────────────────── */
function openModal(card) {
  if (card.classList.contains('card-empty')) return;

  /* ── FIX: cancela limpeza pendente do fechamento anterior ── */
  if (closeTimeoutId) {
    clearTimeout(closeTimeoutId);
    closeTimeoutId = null;
  }

  const name     = card.dataset.name     || '';
  const category = card.dataset.category || '';
  const imgSrc   = card.dataset.img      || '';
  const desc     = card.dataset.desc     || '';
  const qrSrc    = getQrSrc(card);

  /* — imagem grande — */
  const imgWrap = document.querySelector('.modal-img-wrap');
  imgWrap.classList.toggle('no-img', !imgSrc);
  if (imgSrc) {
    modalImg.src = imgSrc;
    modalImg.alt = name;
    modalImg.style.display = '';
  } else {
    modalImg.src = '';
    modalImg.style.display = 'none';
  }

  /* — textos — */
  modalCat.textContent  = category;
  modalName.textContent = name;
  modalDesc.textContent = desc;

  /* — QR code no modal — */
  renderQr(qrSrc);

  /* — abrir overlay — */
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  /* foco acessível */
  setTimeout(() => modal.querySelector('.modal-close')?.focus(), 100);
}

/* ── RENDERIZAR QR ─────────────────────────────────── */
function renderQr(src) {
  /* remove seção anterior, se existir */
  const old = modal.querySelector('.modal-qr-section');
  if (old) old.remove();
}

/* ── FECHAR MODAL ───────────────────────────────────── */
function closeModal(e) {
  /* só fecha se clicar no overlay ou no botão ✕ */
  if (e && e.target !== overlay && !e.target.closest('.modal-close')) return;

  overlay.classList.remove('open');
  document.body.style.overflow = '';

  /* ── FIX: guarda ID para poder cancelar se reabrir antes dos 450ms ── */
  closeTimeoutId = setTimeout(() => {
    modalImg.src = '';
    modalCat.textContent  = '';
    modalName.textContent = '';
    modalDesc.textContent = '';
    const qr = modal.querySelector('.modal-qr-section');
    if (qr) qr.remove();
    closeTimeoutId = null;
  }, 450);
}

/* ── FECHAR COM ESC ─────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal({ target: overlay });
});

/* ══════════════════════════════════════════════════════
   SWIPE PARA BAIXO (mobile) fecha o modal
══════════════════════════════════════════════════════ */
(function setupSwipe() {
  let startY    = 0;
  let currentY  = 0;
  let isDragging= false;
  const wrapper = document.querySelector('.modal-wrapper');

  function onTouchStart(e) {
    const isHandle = e.target.classList.contains('modal-handle');
    const atTop    = modal.scrollTop === 0;
    if (!isHandle && !atTop) return;
    startY    = e.touches[0].clientY;
    isDragging= true;
    wrapper.style.transition = 'none';
  }

  function onTouchMove(e) {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const delta = Math.max(0, currentY - startY);
    wrapper.style.transform = `translateY(${delta}px)`;
    if (delta > 10) e.preventDefault();
  }

  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    wrapper.style.transition = '';
    const delta = currentY - startY;
    if (delta > 90) {
      closeModal({ target: overlay });
    } else {
      wrapper.style.transform = '';
    }
  }

  modal.addEventListener('touchstart', onTouchStart, { passive: true });
  modal.addEventListener('touchmove',  onTouchMove,  { passive: false });
  modal.addEventListener('touchend',   onTouchEnd,   { passive: true });
})();

/* ══════════════════════════════════════════════════════
   SCROLL REVEAL — Intersection Observer para cards
══════════════════════════════════════════════════════ */
(function setupScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const cards = document.querySelectorAll('.card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  cards.forEach(card => {
    card.style.animationPlayState = 'paused';
    observer.observe(card);
  });
})();

/* ══════════════════════════════════════════════════════
   HERO PARALLAX SUAVE (desktop apenas)
══════════════════════════════════════════════════════ */
(function setupParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg || window.matchMedia('(hover: none)').matches) return;

  let rafId = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    targetX = (e.clientX - cx) / cx * 8;
    targetY = (e.clientY - cy) / cy * 5;

    if (!rafId) rafId = requestAnimationFrame(animate);
  });

  function animate() {
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;
    heroBg.style.transform = `translate(${currentX}px, ${currentY}px) scale(1.04)`;
    rafId = requestAnimationFrame(animate);
  }
})();

/* ══════════════════════════════════════════════════════
   CONTAGEM ANIMADA — hero stats (opcional / futuro)
══════════════════════════════════════════════════════ */
function animateCount(el, target, duration = 1800) {
  if (!el) return;
  const start    = performance.now();
  const startVal = 0;
  function step(ts) {
    const progress = Math.min((ts - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(startVal + (target - startVal) * eased).toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ══════════════════════════════════════════════════════
   CARD RIPPLE — feedback visual no toque
══════════════════════════════════════════════════════ */
(function setupRipple() {
  const cards = document.querySelectorAll('.card:not(.card-empty)');

  cards.forEach(card => {
    card.addEventListener('pointerdown', e => {
      const ripple = document.createElement('span');
      const rect   = card.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 1.8;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      Object.assign(ripple.style, {
        position:  'absolute',
        width:     size + 'px',
        height:    size + 'px',
        left:      x + 'px',
        top:       y + 'px',
        background:'rgba(155,0,0,.28)',
        borderRadius: '50%',
        transform: 'scale(0)',
        pointerEvents: 'none',
        zIndex:    '5',
        animation: 'rippleAnim .55s var(--ease-out) forwards'
      });

      card.style.overflow = 'hidden';
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  if (!document.querySelector('#ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = `@keyframes rippleAnim {
      from { transform: scale(0); opacity: 1; }
      to   { transform: scale(1); opacity: 0; }
    }`;
    document.head.appendChild(s);
  }
})();

/* ══════════════════════════════════════════════════════
   ACESSIBILIDADE — cards clicáveis por teclado
══════════════════════════════════════════════════════ */
document.querySelectorAll('.card:not(.card-empty)').forEach(card => {
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Ver história de ${card.dataset.name}`);

  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(card);
    }
  });
});

/* ══════════════════════════════════════════════════════
   BOTÃO FECHAR via overlay (click fora do modal)
══════════════════════════════════════════════════════ */
overlay.addEventListener('click', closeModal);


/* ══════════════════════════════════════════════════════
 MUSICAAAAAAAAAAA 
══════════════════════════════════════════════════════ */

function toggleAudio() {
    const audio = document.getElementById('audioPoesia');
    const btn   = document.getElementById('audioBtn');
    if (audio.paused) {
        audio.play();
        btn.textContent = '⏸';
    } else {
        audio.pause();
        btn.textContent = '▶';
    }
}