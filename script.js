// ════════════════════════════════════════
//  LOADER
// ════════════════════════════════════════
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    initAnimations();
  }, 2000);
});

// ════════════════════════════════════════
//  CUSTOM CURSOR
// ════════════════════════════════════════
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

(function animateCursor() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll('a, button, .project-card, .service-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2)';
    follower.style.transform = 'translate(-50%,-50%) scale(1.5)';
    follower.style.borderColor = '#F5FF00';
    follower.style.boxShadow = '0 0 12px rgba(245,255,0,0.5)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    follower.style.transform = 'translate(-50%,-50%) scale(1)';
    follower.style.borderColor = 'var(--coral)';
    follower.style.boxShadow = '0 0 8px rgba(255,45,120,0.3)';
  });
});

// ════════════════════════════════════════
//  THEME TOGGLE
// ════════════════════════════════════════
const themeToggle = document.getElementById('theme-toggle');
let isDark = false;

themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
});

// ════════════════════════════════════════
//  HERO 3D CANVAS (Three.js-like with vanilla WebGL via raw canvas)
// ════════════════════════════════════════
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  let mouseX = W / 2, mouseY = H / 2;
  let time = 0;

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  // Particles
  const particles = Array.from({length: 80}, () => ({
    x: Math.random() * W, y: Math.random() * H,
    z: Math.random() * 200 + 50,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    color: ['#FF2D78','#F5FF00','#FFE500','#FF3EA5','#7B00FF','#FF0A95'][Math.floor(Math.random()*6)],
    size: Math.random() * 3 + 1
  }));

  // 3D Cube vertices
  const cubeVertices = [
    [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
    [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
  ];
  const cubeEdges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7]
  ];

  function project3D(x, y, z, rotX, rotY, cx, cy, scale) {
    // Rotate Y
    let x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
    let z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
    // Rotate X
    let y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
    let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
    const f = scale / (z2 + 4);
    return { px: cx + x1 * f, py: cy + y1 * f, s: f };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    time += 0.008;

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgAlpha = isDarkMode ? 0.03 : 0.05;

    // Background gradient
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.7);
    grad.addColorStop(0, isDarkMode ? 'rgba(10,0,20,0.5)' : 'rgba(245,255,0,0.05)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Mouse influence
    const mx = (mouseX - W/2) / W;
    const my = (mouseY - H/2) / H;

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx + mx * 0.5;
      p.y += p.vy + my * 0.5;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      const alpha = (p.z / 250);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha * 0.8;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw connections
    ctx.strokeStyle = 'rgba(255,45,120,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.globalAlpha = (1 - dist/100) * 0.3;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // Draw 3D cubes
    const cubeConfigs = [
      { cx: W/2, cy: H/2, scale: 180, rotX: time, rotY: time * 0.7, color: '#FF2D78', glow: true },
      { cx: W * 0.2, cy: H * 0.25, scale: 60, rotX: -time * 1.2, rotY: time * 0.5, color: '#F5FF00', glow: false },
      { cx: W * 0.8, cy: H * 0.75, scale: 50, rotX: time * 0.8, rotY: -time, color: '#FFE500', glow: false },
    ];

    cubeConfigs.forEach(cfg => {
      const rotX = cfg.rotX + my * 0.5;
      const rotY = cfg.rotY + mx * 0.5;
      const projected = cubeVertices.map(v => project3D(v[0], v[1], v[2], rotX, rotY, cfg.cx, cfg.cy, cfg.scale));

      if (cfg.glow) {
        ctx.shadowColor = cfg.color;
        ctx.shadowBlur = 30;
      }

      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = cfg.glow ? 2 : 1;
      ctx.globalAlpha = cfg.glow ? 0.9 : 0.5;

      cubeEdges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(projected[a].px, projected[a].py);
        ctx.lineTo(projected[b].px, projected[b].py);
        ctx.stroke();
      });

      // Vertices
      projected.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.px, p.py, cfg.glow ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = cfg.color;
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    // Orbiting ring
    ctx.strokeStyle = 'rgba(245,255,0,0.25)';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      const rx = Math.cos(a) * 120 * Math.cos(time * 0.5);
      const ry = Math.sin(a) * 120;
      const rz = Math.cos(a) * 120 * Math.sin(time * 0.5);
      const p = project3D(rx/120, ry/120, rz/120, my * 0.5, mx * 0.5, W/2, H/2, 220);
      if (a === 0) ctx.moveTo(p.px, p.py);
      else ctx.lineTo(p.px, p.py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }
  draw();
}

// ════════════════════════════════════════
//  GSAP ANIMATIONS
// ════════════════════════════════════════
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Hero animations
  gsap.fromTo('.gsap-fade', {
    opacity: 0, y: 50
  }, {
    opacity: 1, y: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power3.out',
    delay: 0.3
  });

  // Section reveals
  document.querySelectorAll('.section-reveal').forEach(el => {
    gsap.fromTo(el, {
      opacity: 0, y: 60
    }, {
      opacity: 1, y: 0,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Project cards stagger
  gsap.fromTo('.project-card', {
    opacity: 0, y: 50, scale: 0.95
  }, {
    opacity: 1, y: 0, scale: 1,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.projects-grid',
      start: 'top 80%'
    }
  });

  // Service cards
  gsap.fromTo('.service-card', {
    opacity: 0, y: 40
  }, {
    opacity: 1, y: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.services-grid',
      start: 'top 80%'
    }
  });

  // Stat counter animation
  gsap.fromTo('.stat-num', {
    opacity: 0, scale: 0.5
  }, {
    opacity: 1, scale: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(2)',
    delay: 1.2
  });

  // Nav scroll effect — use Lenis for smooth detection
  const nav = document.getElementById('main-nav');
  lenis.on('scroll', ({ scroll }) => {
    nav.style.boxShadow = scroll > 80 ? '0 8px 32px rgba(255,45,120,0.12)' : 'none';
    // Active nav link
    let current = '';
    document.querySelectorAll('section[id]').forEach(s => {
      if (scroll >= s.offsetTop - 140) current = s.id;
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--coral)' : '';
    });
  });

  // Feature chips hover
  document.querySelectorAll('.feature-chip').forEach((chip, i) => {
    gsap.fromTo(chip, { opacity: 0, x: -20 }, {
      opacity: 1, x: 0, duration: 0.5,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: chip, start: 'top 90%' }
    });
  });

  // Contact methods
  document.querySelectorAll('.contact-method').forEach((m, i) => {
    gsap.fromTo(m, { opacity: 0, x: -30 }, {
      opacity: 1, x: 0, duration: 0.5,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: m, start: 'top 90%' }
    });
  });

  // Parallax on hero blobs via Lenis — desktop only
  const isMobile = window.innerWidth <= 768;
  const blob1 = document.querySelector('.blob-1');
  const blob2 = document.querySelector('.blob-2');
  const heroText = document.querySelector('.home-text');
  const heroVisual = document.querySelector('.home-visual');

  if (!isMobile) {
    lenis.on('scroll', ({ scroll }) => {
      const p = scroll * 0.15;
      if (blob1) blob1.style.transform = `translate(${p * 0.4}px, ${-p * 0.6}px)`;
      if (blob2) blob2.style.transform = `translate(${-p * 0.3}px, ${p * 0.5}px)`;
      if (heroText) heroText.style.transform = `translateY(${scroll * 0.12}px)`;
      if (heroVisual) heroVisual.style.transform = `translateY(${scroll * 0.06}px)`;
    });
  }

  initHeroCanvas();

  // Resize canvas on window resize
  window.addEventListener('resize', () => {
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    }
  });
}

// ════════════════════════════════════════
//  PROJECT MODAL
// ════════════════════════════════════════
function openModal(card) {
  const overlay = document.getElementById('project-modal-overlay');
  document.getElementById('modal-title').textContent = card.dataset.title;
  document.getElementById('modal-desc').textContent = card.dataset.desc;
  document.getElementById('modal-git').href = card.dataset.git;
  document.getElementById('modal-live').href = card.dataset.live;

  const tech = document.getElementById('modal-tech');
  tech.innerHTML = card.dataset.tech.split(',').map(t =>
    `<span class="tech-tag">${t.trim()}</span>`
  ).join('');

  const images = document.getElementById('modal-images');
  images.innerHTML = `
    <div class="modal-img-slot" style="background:${card.dataset.img1Bg || card.dataset['img1-bg'] || 'linear-gradient(135deg,#FF2D78,#FFE500)'};">
      <span style="font-size:4rem;">${card.dataset.img1}</span>
    </div>
    <div class="modal-img-slot" style="background:${card.dataset.img2Bg || card.dataset['img2-bg'] || 'linear-gradient(135deg,#F5FF00,#7B00FF)'};">
      <span style="font-size:4rem;">${card.dataset.img2}</span>
    </div>
  `;

  overlay.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeModal() {
  document.getElementById('project-modal-overlay').classList.remove('active');
  document.body.classList.remove('modal-open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('project-modal-overlay')) closeModal();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// Read data attributes with dashes
document.querySelectorAll('.project-card').forEach(card => {
  const btn = card.querySelector('.proj-btn-expand');
  if (btn) btn.onclick = () => openModal(card);
});

// ════════════════════════════════════════
//  LENIS SMOOTH SCROLL
// ════════════════════════════════════════
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.9,
  touchMultiplier: 1.8,
  infinite: false,
});

// Wire Lenis into GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// Smooth anchor navigation via Lenis
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target) lenis.scrollTo(target, { offset: -80, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  });
});

// ════════════════════════════════════════
//  CONTACT FORM
// ════════════════════════════════════════
function handleSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  gsap.to(form, { opacity: 0, y: -20, duration: 0.4, onComplete: () => {
    form.style.display = 'none';
    success.style.display = 'block';
    gsap.fromTo(success, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
  }});
}

// ════════════════════════════════════════
//  MOBILE NAV
// ════════════════════════════════════════
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');
let navOpen = false;

navToggle.addEventListener('click', () => {
  navOpen = !navOpen;
  navLinks.classList.toggle('open', navOpen);
  // Animate hamburger to X
  const spans = navToggle.querySelectorAll('span');
  if (navOpen) {
    spans[0].style.cssText = 'transform: rotate(45deg) translate(5px, 5px)';
    spans[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
    spans[2].style.cssText = 'transform: rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => s.style.cssText = '');
  }
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navOpen = false;
    navLinks.classList.remove('open');
    navToggle.querySelectorAll('span').forEach(s => s.style.cssText = '');
  });
});

// Close nav on outside click
document.addEventListener('click', e => {
  if (navOpen && !navToggle.contains(e.target) && !navLinks.contains(e.target)) {
    navOpen = false;
    navLinks.classList.remove('open');
    navToggle.querySelectorAll('span').forEach(s => s.style.cssText = '');
  }
});

// Active nav handled by Lenis scroll listener above

