/* ============================================
   BUZZCAMPUS — SCRIPT.JS v1.0
   APIs: Quotable (quotes) + Ticketmaster/Eventbrite fallback (events)
         + Wellness AI chatbot simulation
   ============================================ */

/* ===== MOBILE NAV ===== */
function toggleNav() {
  document.getElementById('nav-links')?.classList.toggle('open');
}

/* ===== ACTIVE NAV ===== */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
}

/* ===== TOAST ===== */
function showToast(msg, dur = 3500) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

/* ===== COPY PROMO CODE ===== */
function copyCode() {
  const el = document.getElementById('promo-code');
  if (!el) return;
  navigator.clipboard.writeText('BUZZ25').then(() => {
    el.textContent = '✓ COPIED!';
    el.classList.add('copied');
    showToast('✓ Code BUZZ25 copied! Use at checkout for 25% off.');
    setTimeout(() => { el.textContent = 'BUZZ25'; el.classList.remove('copied'); }, 3200);
  });
}

/* ===== COUNTDOWN ===== */
function startCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;
  let end = sessionStorage.getItem('bc_end');
  if (!end) { end = Date.now() + 48 * 3600000; sessionStorage.setItem('bc_end', end); }
  function tick() {
    const d = parseInt(end) - Date.now();
    if (d <= 0) { el.textContent = 'Offer expired'; return; }
    const h = Math.floor(d / 3600000), m = Math.floor((d % 3600000) / 60000), s = Math.floor((d % 60000) / 1000);
    el.innerHTML = `Offer ends in: <strong>${h}h ${m}m ${s}s</strong>`;
  }
  tick(); setInterval(tick, 1000);
}

/* ===== API 1: QUOTABLE — MOTIVATIONAL QUOTES ===== */
async function loadQuote() {
  const textEl   = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  if (!textEl) return;
  textEl.style.opacity = '0';
  try {
    const res  = await fetch('https://api.quotable.io/random?tags=motivational,education,success&maxLength=180');
    const data = await res.json();
    if (data.content) {
      setTimeout(() => {
        textEl.textContent   = data.content;
        authorEl.textContent = '— ' + (data.author || 'Unknown');
        textEl.style.opacity = '1';
        textEl.style.transition = 'opacity 0.6s ease';
      }, 300);
    } else throw new Error('no quote');
  } catch {
    const fallbacks = [
      { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
      { q: "Education is the most powerful weapon which you can use to change the world.", a: "Nelson Mandela" },
      { q: "Success is not final; failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
      { q: "Your campus is your launchpad. Make every day count.", a: "BuzzCampus" }
    ];
    const f = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    setTimeout(() => {
      textEl.textContent   = f.q;
      authorEl.textContent = '— ' + f.a;
      textEl.style.opacity = '1';
    }, 300);
  }
}

/* ===== API 2: TICKETMASTER EVENTS (SA) ===== */
async function loadEvents() {
  const el = document.getElementById('events-container');
  if (!el) return;
  el.innerHTML = '<div style="color:var(--muted);font-size:13px;font-style:italic;">⏳ Loading upcoming campus events...</div>';
  try {
    /* Ticketmaster Discovery API — free key from developer.ticketmaster.com
       REPLACE YOUR_TM_API_KEY below with your actual API key */
    const res  = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_TM_API_KEY&countryCode=ZA&size=4&keyword=campus`
    );
    const data = await res.json();
    const events = data._embedded?.events;

    if (events?.length) {
      el.innerHTML = '<div class="events-grid">' + events.map(ev => `
        <div class="event-card">
          <h4>${ev.name}</h4>
          <div class="ev-meta">📅 ${ev.dates?.start?.localDate || 'TBC'} &nbsp;|&nbsp; 📍 ${ev._embedded?.venues?.[0]?.city?.name || 'South Africa'}</div>
          <div class="ev-price">${ev.priceRanges ? 'R' + Math.round(ev.priceRanges[0].min) + ' – R' + Math.round(ev.priceRanges[0].max) : 'Free / RSVP'}</div>
          ${ev.url ? `<a href="${ev.url}" target="_blank" style="font-size:12px;color:var(--blue);margin-top:6px;display:inline-block;">Get Tickets →</a>` : ''}
        </div>`).join('') + '</div>';
    } else throw new Error('no events');
  } catch {
    // Fallback demo events
    const demos = [
      { name: '🎓 Grad Bash 2025',     date: '2025-09-12', venue: 'UP Main Campus',    price: 'R120' },
      { name: '🎤 Campus Cypher Vol.3', date: '2025-09-20', venue: 'Wits Great Hall',   price: 'R80' },
      { name: '💻 Tech & Innovation Fair', date: '2025-10-01', venue: 'UJ APK Campus', price: 'Free' },
      { name: '🏃 StudentRun 5K',       date: '2025-10-15', venue: 'UCT Upper Campus',  price: 'R50' }
    ];
    el.innerHTML = '<div class="events-grid">' + demos.map(e => `
      <div class="event-card">
        <h4>${e.name}</h4>
        <div class="ev-meta">📅 ${e.date} &nbsp;|&nbsp; 📍 ${e.venue}</div>
        <div class="ev-price">${e.price}</div>
      </div>`).join('') + '</div>';
  }
}

/* ===== WELLNESS CHATBOT ===== */
const wellnessReplies = {
  stressed:   '💙 I hear you. Stress during exams is completely normal. Try the 4-7-8 technique: breathe in 4s, hold 7s, exhale 8s. Repeat 4 times. You\'ve got this.',
  anxious:    '🌿 Anxiety can feel overwhelming. Start with one small task right now — just one. Also, try grounding: name 5 things you can see around you.',
  burnout:    '🔋 Burnout is real. Give yourself permission to rest — it\'s not laziness, it\'s recovery. Take a 10-min walk, hydrate, and come back fresh.',
  lonely:     '🤝 Feeling lonely on campus is more common than you think. BuzzCampus events are a great way to meet people! Check the Events tab for nearby activities.',
  depressed:  '💜 Thank you for sharing that. Please reach out to SADAG (South African Depression & Anxiety Group) at 0800 456 789 — free, 24/7, confidential.',
  sleep:      '😴 Sleep is foundational to mental health. Try setting a consistent bedtime, avoiding screens 1 hour before bed, and keeping your room cool and dark.',
  motivation: '🚀 Feeling low on motivation? Break your goal into tiny pieces. Even 15 minutes of progress counts. What\'s the smallest step you can take right now?',
  help:       '🆘 If you\'re in crisis, please call SADAG at 0800 456 789 or the Lifeline at 0861 322 322. You are not alone.',
  hello:      '👋 Hey there! I\'m the BuzzCampus Wellness Bot. I\'m here to listen and support you. How are you feeling today?',
  hi:         '👋 Hi! How are you feeling today? I\'m here to support your mental wellbeing.',
  thanks:     '💚 Anytime! Remember — your wellbeing matters. Don\'t hesitate to reach out whenever you need support.',
  default:    '💬 I\'m here to help with mental wellness, stress, anxiety, and campus life. Try asking about stress, burnout, motivation, or sleep. For urgent support, call SADAG: 0800 456 789.'
};

function chatResponse(input) {
  const text = input.toLowerCase();
  for (const [key, reply] of Object.entries(wellnessReplies)) {
    if (text.includes(key)) return reply;
  }
  return wellnessReplies.default;
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const msgs  = document.getElementById('chat-messages');
  if (!input || !msgs) return;
  const val = input.value.trim();
  if (!val) return;

  // User message
  const userDiv = document.createElement('div');
  userDiv.className = 'chat-msg user';
  userDiv.textContent = val;
  msgs.appendChild(userDiv);

  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;

  // Bot response with delay
  setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-msg bot';
    botDiv.textContent = chatResponse(val);
    msgs.appendChild(botDiv);
    msgs.scrollTop = msgs.scrollHeight;
  }, 600);
}

function chatKeyPress(e) { if (e.key === 'Enter') sendChat(); }

/* ===== SERVICES TABS ===== */
function switchSvc(id) {
  document.querySelectorAll('.svc-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.svc-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelector(`.svc-tab[data-svc="${id}"]`)?.classList.add('active');
  if (id === 'events') loadEvents();
}

/* ===== GALLERY FILTER ===== */
function filterGallery(cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.filter-btn[data-filter="${cat}"]`)?.classList.add('active');
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.style.display = (cat === 'all' || item.dataset.category === cat) ? '' : 'none';
  });
}

/* ===== LIGHTBOX ===== */
function openLightbox(src, caption) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lb-img');
  const cap = document.getElementById('lb-caption');
  if (!lb) return;
  if (img) img.src = src;
  if (cap) cap.textContent = caption || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ===== CONTACT FORM ===== */
async function submitForm(e) {
  e.preventDefault();
  const form  = document.getElementById('contact-form');
  const succ  = document.getElementById('success-message');
  const btn   = document.getElementById('submit-btn');
  const name  = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const msg   = document.getElementById('message')?.value.trim();
  if (!name || !email || !msg) { showToast('⚠️ Please fill in all required fields.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('⚠️ Enter a valid email address.'); return; }
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
  try {
    /* REPLACE YOUR_FORMSPREE_ID:
       1. Go to formspree.io → create free account → New Form
       2. Copy your form ID and paste below */
    await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name, email, message: msg })
    });
  } catch {}
  finally {
    if (form) form.style.display = 'none';
    if (succ) succ.classList.add('show');
    showToast('✓ Message sent! We\'ll get back to you soon.');
    if (btn) { btn.textContent = 'Send Message'; btn.disabled = false; }
  }
}

/* ===== SCROLL REVEAL ===== */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger').forEach(el => obs.observe(el));
}

/* ===== PARTICLE CANVAS ===== */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const dots = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.4,
    dx: (Math.random() - 0.5) * 0.35,
    dy: (Math.random() - 0.5) * 0.35,
    color: Math.random() > 0.5 ? '0,180,255' : '155,92,246',
    alpha: Math.random() * 0.45 + 0.1
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw connections
    dots.forEach((d, i) => {
      dots.slice(i + 1).forEach(d2 => {
        const dist = Math.hypot(d.x - d2.x, d.y - d2.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y); ctx.lineTo(d2.x, d2.y);
          ctx.strokeStyle = `rgba(155,92,246,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    dots.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${d.color},${d.alpha})`;
      ctx.fill();
      d.x += d.dx; d.y += d.dy;
      if (d.x < 0 || d.x > canvas.width)  d.dx *= -1;
      if (d.y < 0 || d.y > canvas.height) d.dy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ===== STAT COUNTER ===== */
function animateCounters() {
  document.querySelectorAll('.stat-num[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    let cur = 0;
    const step = Math.max(1, Math.floor(target / 50));
    const iv = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur + suffix;
      if (cur >= target) clearInterval(iv);
    }, 35);
  });
}

/* ===== TYPING EFFECT ===== */
function typeText(el, text, speed = 55) {
  if (!el) return;
  el.textContent = '';
  let i = 0;
  const iv = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) clearInterval(iv);
  }, speed);
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  startCountdown();
  initScrollReveal();
  initParticles();

  // Quote on home page
  if (document.getElementById('quote-text')) loadQuote();

  // Events on services page
  if (document.getElementById('events-container')) loadEvents();

  // Wire contact form
  document.getElementById('contact-form')?.addEventListener('submit', submitForm);

  // Stat counter observer
  const statsEl = document.querySelector('.about-stats, .stats-strip');
  if (statsEl) {
    const so = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { animateCounters(); so.disconnect(); } });
    }, { threshold: 0.3 });
    so.observe(statsEl);
  }

  // Live clock on home
  function tick() {
    const cl = document.getElementById('live-clock');
    const cd = document.getElementById('live-date');
    if (cl) cl.textContent = new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (cd) cd.textContent = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  if (document.getElementById('live-clock')) { tick(); setInterval(tick, 1000); }

  // Initial wellness bot message
  const msgs = document.getElementById('chat-messages');
  if (msgs) {
    const intro = document.createElement('div');
    intro.className = 'chat-msg bot';
    intro.textContent = '👋 Hi! I\'m your BuzzCampus Wellness Bot. How are you feeling today? Try: "stressed", "anxious", "burnout", "help" or just chat!';
    msgs.appendChild(intro);
  }
});
