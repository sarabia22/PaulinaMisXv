/* ═══════════════════════════════════════════════════════════════
   XV AÑOS PAULINA PADILLA GARCÍA — script.js
   Vanilla JS: Preloader · Linternas · Countdown · Lightbox
               Parallax · Scroll Reveal · Música · FABs
═══════════════════════════════════════════════════════════════ */

/* ─── VARIABLES CONFIGURABLES ──────────────────────────────── */
const CONFIG = {
  // ID del video de YouTube de la canción (la parte después de "v=" en la URL).
  // El video se reproduce embebido en esta misma página, sin redirigir a YouTube.
  YOUTUBE_VIDEO_ID: 'h9SAUq5-V7o',

  // URL de Google Maps para la ceremonia
  CEREMONIA_MAPS_URL: 'https://maps.google.com/?q=Parroquia+San+Francisco+Javier+Colonia+Juarez+Tijuana+Baja+California',

  // URL de WhatsApp (número 664 805 3160)
  WHATSAPP_URL: 'https://wa.me/526648053160?text=Hola%20Paulina%2C%20confirmo%20mi%20asistencia%20a%20tus%20XV%20A%C3%B1os%20%F0%9F%8C%9F',

  // URL del Google Form para subir fotos/videos
  GOOGLE_FORM_RECUERDOS_URL: 'https://forms.google.com/',

  // URL del Google Form para dejar mensajes
  GOOGLE_FORM_MENSAJES_URL: 'https://forms.google.com/',

  // Fecha del evento (para el countdown)
  EVENT_DATE: new Date('2026-08-07T16:00:00'),
};

/* ─── Inyectar URLs configurables en el DOM ─────────────────── */
function applyConfig() {
  // Música: al pulsar play, se inserta el iframe de YouTube en la misma
  // tarjeta (no se abre pestaña ni se redirige a otra página).
  document.getElementById('play-btn').addEventListener('click', playInlineVideo);

  // Ceremonia Maps
  const ceremonyBtn = document.getElementById('ceremony-map-btn');
  if (ceremonyBtn) ceremonyBtn.href = CONFIG.CEREMONIA_MAPS_URL;
  const qlCeremony = document.getElementById('ql-ceremony');
  if (qlCeremony) qlCeremony.href = CONFIG.CEREMONIA_MAPS_URL;

  // WhatsApp
  const waLinks = [
    document.getElementById('fab-wa'),
    document.getElementById('whatsapp-confirm-btn'),
    document.getElementById('ql-confirm'),
  ];
  waLinks.forEach(el => { if (el) el.href = CONFIG.WHATSAPP_URL; });

  // Formularios
  const recuerdosLinks = [document.getElementById('recuerdos-btn'), document.getElementById('ql-photos')];
  recuerdosLinks.forEach(el => { if (el) el.href = CONFIG.GOOGLE_FORM_RECUERDOS_URL; });

  const mensajesLinks = [document.getElementById('mensajes-btn'), document.getElementById('ql-message')];
  mensajesLinks.forEach(el => { if (el) el.href = CONFIG.GOOGLE_FORM_MENSAJES_URL; });
}

/* ═══════════════════════════════════════════════════════════
   SISTEMA DE LINTERNAS — Canvas 2D
═══════════════════════════════════════════════════════════ */
const LanternSystem = (() => {
  let canvas, ctx, lanterns = [], sparkles = [], raf;
  const MAX = 22;
  const SPARKLE_COUNT = 55;

  function Lantern(x, y, scale) {
    this.x = x ?? Math.random() * window.innerWidth;
    this.y = y ?? window.innerHeight + 60 + Math.random() * 200;
    this.scale = scale ?? 0.45 + Math.random() * 0.55;
    this.opacity = 0;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = -(0.28 + Math.random() * 0.38);
    this.swing = Math.random() * Math.PI * 2;
    this.swingSpeed = 0.008 + Math.random() * 0.012;
    this.glowPhase = Math.random() * Math.PI * 2;
    this.born = performance.now();
  }

  // Partícula de polvo dorado: se distribuye en TODA la altura de la página
  // (no solo el viewport), para que aparezcan al hacer scroll por cualquier sección.
  function Sparkle() {
    this.resetPosition();
    this.r = 0.6 + Math.random() * 1.6;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.008 + Math.random() * 0.018;
    this.driftX = (Math.random() - 0.5) * 0.15;
    this.driftY = -(0.04 + Math.random() * 0.08);
  }
  Sparkle.prototype.resetPosition = function () {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * document.documentElement.scrollHeight;
  };

  function drawLantern(ltr) {
    const { x, y, scale, opacity } = ltr;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;

    const glow = 0.55 + 0.45 * Math.sin(ltr.glowPhase);

    // Glow exterior suave
    const grad = ctx.createRadialGradient(0, 15, 0, 0, 15, 38 * scale);
    grad.addColorStop(0, `rgba(255,230,100,${0.18 * glow * opacity})`);
    grad.addColorStop(1, 'rgba(255,200,50,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 15, 38, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo de la linterna
    ctx.beginPath();
    ctx.roundRect(-14, 6, 28, 36, 3);
    ctx.fillStyle = `rgba(245,230,170,${0.88 + 0.12 * glow})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(212,175,55,${0.7 * opacity})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Brillo interior
    const inner = ctx.createRadialGradient(0, 20, 0, 0, 22, 12);
    inner.addColorStop(0, `rgba(255,248,180,${0.6 * glow})`);
    inner.addColorStop(1, 'rgba(255,230,100,0)');
    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.roundRect(-12, 8, 24, 32, 2);
    ctx.fill();

    // Líneas horizontales
    ctx.strokeStyle = `rgba(212,175,55,${0.35 * opacity})`;
    ctx.lineWidth = 0.7;
    [-1, 12].forEach(lineY => {
      ctx.beginPath();
      ctx.moveTo(-14, 6 + lineY);
      ctx.lineTo(14, 6 + lineY);
      ctx.stroke();
    });

    // Hilo superior
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 6);
    ctx.strokeStyle = `rgba(212,175,55,${0.65 * opacity})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Base inferior
    ctx.beginPath();
    ctx.roundRect(-10, 42, 20, 4, 2);
    ctx.fillStyle = `rgba(212,175,55,${0.55 * opacity})`;
    ctx.fill();

    ctx.restore();
  }

  function drawSparkle(s, scrollY) {
    const screenY = s.y - scrollY;
    // Solo dibujar si está dentro (o cerca) del viewport visible, por rendimiento
    if (screenY < -20 || screenY > window.innerHeight + 20) return;

    const twinkle = 0.25 + 0.75 * Math.abs(Math.sin(s.phase));
    ctx.beginPath();
    ctx.arc(s.x, screenY, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212,175,55,${0.55 * twinkle})`;
    ctx.shadowColor = 'rgba(212,175,55,0.5)';
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function update(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Polvo dorado: visible en toda la web, en todas las secciones
    sparkles.forEach(s => {
      s.phase += s.speed;
      s.x += s.driftX;
      s.y += s.driftY;

      if (s.x < -10) s.x = window.innerWidth + 10;
      if (s.x > window.innerWidth + 10) s.x = -10;

      // Si la partícula sale por arriba de la página entera, reaparece abajo
      if (s.y < -20) s.y = document.documentElement.scrollHeight + 10;

      drawSparkle(s, scrollY);
    });

    // Spawn
    if (lanterns.length < MAX && Math.random() < 0.025) {
      lanterns.push(new Lantern());
    }

    lanterns = lanterns.filter(ltr => {
      const age = (now - ltr.born) / 1000;

      // Fade in primeros 2 segundos
      ltr.opacity = Math.min(1, age / 2) * 0.85;

      ltr.swing += ltr.swingSpeed;
      ltr.glowPhase += 0.02;
      ltr.vx = Math.sin(ltr.swing) * 0.3;

      ltr.x += ltr.vx;
      ltr.y += ltr.vy;

      drawLantern(ltr);

      // Eliminar si salen por arriba
      return ltr.y > -120;
    });

    raf = requestAnimationFrame(update);
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function init() {
    canvas = document.getElementById('lanterns-canvas');
    ctx    = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    // Sembrar algunas linternas iniciales distribuidas
    for (let i = 0; i < 8; i++) {
      const ltr = new Lantern(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight
      );
      ltr.born = performance.now() - 3000 - Math.random() * 5000;
      lanterns.push(ltr);
    }

    // Sembrar el polvo dorado distribuido en toda la altura de la página
    sparkles = [];
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      sparkles.push(new Sparkle());
    }

    raf = requestAnimationFrame(update);
    canvas.classList.add('visible');
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   PRELOADER
═══════════════════════════════════════════════════════════ */
function initPreloader() {
  // Canvas de partículas del preloader
  const preCanvas = document.getElementById('preloader-canvas');
  const pCtx = preCanvas.getContext('2d');
  const stars = [];

  function resizePre() {
    preCanvas.width  = window.innerWidth;
    preCanvas.height = window.innerHeight;
  }
  resizePre();
  window.addEventListener('resize', resizePre);

  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5,
      a: Math.random(),
      speed: 0.003 + Math.random() * 0.007,
      phase: Math.random() * Math.PI * 2,
    });
  }

  let preRaf;
  function drawStars(now) {
    pCtx.clearRect(0, 0, preCanvas.width, preCanvas.height);
    stars.forEach(s => {
      s.phase += s.speed;
      const opacity = 0.2 + 0.5 * Math.sin(s.phase);
      pCtx.beginPath();
      pCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      pCtx.fillStyle = `rgba(212,175,55,${opacity})`;
      pCtx.fill();
    });
    preRaf = requestAnimationFrame(drawStars);
  }
  preRaf = requestAnimationFrame(drawStars);

  // Ocultar preloader después de ~2.6s
  setTimeout(() => {
    cancelAnimationFrame(preRaf);
    const preloader = document.getElementById('preloader');
    preloader.classList.add('hidden');
    // Mostrar welcome screen
    document.getElementById('welcome-screen').style.opacity = '1';
    // Iniciar linternas
    LanternSystem.init();
  }, 2700);
}

/* ═══════════════════════════════════════════════════════════
   WELCOME SCREEN → ABRIR INVITACIÓN
═══════════════════════════════════════════════════════════ */
function initWelcome() {
  const btn = document.getElementById('open-invitation-btn');
  const welcome = document.getElementById('welcome-screen');
  const invitation = document.getElementById('invitation');
  const magic = document.getElementById('magic-transition');

  btn.addEventListener('click', () => {
    // Disparar la animación de luz mágica (rayos + destello dorado)
    magic.classList.add('playing');

    welcome.classList.add('hidden');

    setTimeout(() => {
      invitation.classList.add('visible');

      // Activar animaciones cinematográficas de la portada
      setTimeout(() => {
        document.querySelectorAll('.cinema-reveal').forEach(el => {
          el.classList.add('active');
        });
      }, 250);

      // Iniciar countdown
      startCountdown();
    }, 200);
  });
}

/* ═══════════════════════════════════════════════════════════
   CUENTA REGRESIVA
═══════════════════════════════════════════════════════════ */
function startCountdown() {
  const daysEl    = document.getElementById('cd-days');
  const hoursEl   = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const diff = CONFIG.EVENT_DATE - now;

    if (diff <= 0) {
      daysEl.textContent = minutesEl.textContent = hoursEl.textContent = secondsEl.textContent = '00';
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);
    const seconds = Math.floor((diff % 60000)    / 1000);

    daysEl.textContent    = pad(days);
    hoursEl.textContent   = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   PARALLAX LIGERO
═══════════════════════════════════════════════════════════ */
function initParallax() {
  const sections = document.querySelectorAll('.parallax-section');

  // Solo en desktop / si no se prefiere movimiento reducido
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  function onScroll() {
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      if (!visible) return;

      const bg = section.querySelector('.section-bg');
      if (!bg) return;

      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const offset = (progress - 0.5) * 120;
      bg.style.transform = `translateY(${offset}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ═══════════════════════════════════════════════════════════
   LIGHTBOX (Galería)
═══════════════════════════════════════════════════════════ */
function initLightbox() {
  const gallery  = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbClose  = document.getElementById('lb-close');
  const lbPrev   = document.getElementById('lb-prev');
  const lbNext   = document.getElementById('lb-next');
  const items    = Array.from(gallery.querySelectorAll('.gallery-item'));

  let current = 0;

  function openAt(index) {
    current = (index + items.length) % items.length;
    const img = items[current].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => openAt(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openAt(i);
    });
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => openAt(current - 1));
  lbNext.addEventListener('click', () => openAt(current + 1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')    close();
    if (e.key === 'ArrowLeft') openAt(current - 1);
    if (e.key === 'ArrowRight')openAt(current + 1);
  });

  // Swipe en móvil
  let startX = 0;
  lightbox.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? openAt(current + 1) : openAt(current - 1);
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════
   MÚSICA — Reproducción embebida de YouTube en la misma página
═══════════════════════════════════════════════════════════ */
function playInlineVideo() {
  const media = document.getElementById('music-media');
  if (!media || media.querySelector('iframe')) return; // ya está reproduciéndose

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${CONFIG.YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  iframe.title = 'Reproductor de la canción especial';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';

  media.innerHTML = '';
  media.appendChild(iframe);
}

/* ═══════════════════════════════════════════════════════════
   BOTÓN VOLVER ARRIBA
═══════════════════════════════════════════════════════════ */
function initFabTop() {
  const btn = document.getElementById('fab-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.hidden = false;
    } else {
      btn.hidden = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════════════════════════
   NAVEGACIÓN SUAVE (scroll to section)
═══════════════════════════════════════════════════════════ */
function initSmoothNav() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   DESTELLOS DORADOS EN PORTADA (canvas de partículas)
═══════════════════════════════════════════════════════════ */
function initPortadaSparkles() {
  const portada = document.getElementById('portada');
  if (!portada) return;

  const canvas = portada.querySelector('.section-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = portada.offsetWidth;
    canvas.height = portada.offsetHeight;
  }
  resize();

  const sparkles = [];
  for (let i = 0; i < 45; i++) {
    sparkles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.5 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.02,
      drift: (Math.random() - 0.5) * 0.3,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparkles.forEach(s => {
      s.phase += s.speed;
      s.x += s.drift;
      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;

      const a = 0.1 + 0.5 * Math.abs(Math.sin(s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  draw();
  window.addEventListener('resize', resize);
}

/* ═══════════════════════════════════════════════════════════
   CARTA INTERACTIVA — Confirmación de asistencia
═══════════════════════════════════════════════════════════ */
function initLetterAnimation() {
  const scene = document.getElementById('letter-scene');
  if (!scene) return;

  function toggle() {
    scene.classList.toggle('opened');
  }

  scene.addEventListener('click', toggle);
  scene.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  initPreloader();
  initWelcome();
  initScrollReveal();
  initParallax();
  initLightbox();
  initFabTop();
  initSmoothNav();
  initLetterAnimation();
});
