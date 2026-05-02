/* ============================================================
   DEAD MAN'S PARLOR — Core Engine
   Card/Dice utilities, navigation, lobby
   ============================================================ */

'use strict';

// ---- Background canvas particle effect ----
(function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.2 - 0.05,
      opacity: Math.random() * 0.4 + 0.05,
      life: Math.random()
    });
  }

  function animBg() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 0.003;
      if (p.y < 0 || p.x < 0 || p.x > canvas.width) {
        p.x = Math.random() * canvas.width;
        p.y = canvas.height + 10;
        p.life = 0;
      }
      const fade = Math.sin(p.life * Math.PI);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,40,40,${p.opacity * fade})`;
      ctx.fill();
    });
    requestAnimationFrame(animBg);
  }
  animBg();
})();

// ---- Toast Notifications ----
function toast(msg, type = 'default', duration = 2800) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 320);
  }, duration);
}

// ---- Modal ----
function showModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ---- Screen Navigation ----
const SCREENS = ['lobby','blackjack','texasholdem','war','solitaire','pig','craps','yahtzee'];
let currentScreen = 'lobby';

function showScreen(id) {
  SCREENS.forEach(s => {
    const el = document.getElementById(`screen-${s}`);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById(`screen-${id}`);
  if (target) target.classList.add('active');
  currentScreen = id;
  window.scrollTo(0, 0);
}

function goHome() {
  showScreen('lobby');
}

// ---- Card Suits / Ranks ----
const SUITS = ['spades','hearts','diamonds','clubs'];
