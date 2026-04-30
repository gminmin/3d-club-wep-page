/* ============================================
   진부중학교 3D 동아리 홈페이지 - 공통 스크립트
   ============================================ */

// ---------- 점검 모드 체크 ----------
(function() {
    const isMaintenancePage = window.location.pathname.includes('maintenance.html');
    const isAdminPage = window.location.pathname.includes('admin.html') || window.location.pathname.includes('admin_Login.html');
    
    if (!isAdminPage) {
        const waitDS = setInterval(async () => {
            if (window.dataService) {
                clearInterval(waitDS);
                try {
                    const settings = await window.dataService.getMaintenanceSettings();
                    if (settings && settings.isActive && !isMaintenancePage) {
                        window.location.href = 'maintenance.html';
                    }
                } catch (e) {
                    console.error('Maintenance check failed:', e);
                }
            }
        }, 100);
    }
})();

// ---------- 내비게이션 ----------
(function () {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');

  // 스크롤 시 그림자 (모바일에서는 비활성화)
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const updateNavbarScrollState = () => {
    if (mobileQuery.matches) {
      navbar?.classList.remove('scrolled');
      return;
    }
    navbar?.classList.toggle('scrolled', window.scrollY > 30);
  };

  window.addEventListener('scroll', updateNavbarScrollState);
  mobileQuery.addEventListener('change', updateNavbarScrollState);
  updateNavbarScrollState();

  // 햄버거 메뉴
  toggle?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.toggle('open');
    navbar?.classList.toggle('menu-active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    
    const spans = toggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => (s.style.transform = '', s.style.opacity = ''));
    }
  });

  // 현재 페이지 활성 링크
  const links = document.querySelectorAll('.nav-links a, .nav-mobile a');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ---------- 스크롤 reveal 애니메이션 ----------
window.initScrollReveal = function () {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => {
    // 이미 관찰 중이지 않은 요소만 관찰
    observer.observe(el);
  });
};
window.initScrollReveal();

// ---------- 라이트박스 ----------
(function () {
  const overlay = document.querySelector('.lightbox-overlay');
  if (!overlay) return;
  const img = overlay.querySelector('img');

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      img.src = el.dataset.lightbox;
      img.alt = el.dataset.caption || '';
      overlay.classList.add('open');
    });
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  overlay.querySelector('.lightbox-close')?.addEventListener('click', () => {
    overlay.classList.remove('open');
  });
})();

// ---------- Canvas 파티클 (히어로용) ----------
function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#04ADC0', '#5D68A6', '#03D9D9', '#9C7BA6', '#56BF7C'];

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * 1400,
      y: Math.random() * 800,
      r: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // 연결선
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#04ADC0';
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ---------- 3D 정육면체 애니메이션 ----------
function init3DCube(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const settings = {
    scale: options.scale || 150,
    speedX: options.speedX || 0.005,
    speedY: options.speedY || 0.008,
    vertexSpeed: options.vertexSpeed || 0.05,
    edgeSpeed: options.edgeSpeed || 0.08,
    color1: options.color1 || '#04ADC0',
    color2: options.color2 || '#5D68A6',
    dotColor: options.dotColor || '#04ADC0',
    interactive: options.interactive || false,
    ...options
  };

  let W, H;
  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const vertices = [
    { x: -1, y: -1, z: -1 }, { x:  1, y: -1, z: -1 }, 
    { x:  1, y:  1, z: -1 }, { x: -1, y:  1, z: -1 }, 
    { x: -1, y: -1, z:  1 }, { x:  1, y: -1, z:  1 }, 
    { x:  1, y:  1, z:  1 }, { x: -1, y:  1, z:  1 }
  ];

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // 뒤
    [4, 5], [5, 6], [6, 7], [7, 4], // 앞
    [0, 4], [1, 5], [2, 6], [3, 7]  // 연결
  ];

  let rotationX = 0.5, rotationY = 0.5;
  let vertexProgress = 0, edgeProgress = 0;
  let isDragging = false;
  let lastX, lastY;

  // 상호작용 설정
  if (settings.interactive) {
    canvas.style.cursor = 'grab';
    canvas.addEventListener('mousedown', e => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      rotationY += dx * 0.01;
      rotationX += dy * 0.01;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    });
    // 터치 지원 (모바일)
    canvas.addEventListener('touchstart', e => {
      isDragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - lastX;
      const dy = e.touches[0].clientY - lastY;
      rotationY += dx * 0.01;
      rotationX += dy * 0.01;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }, { passive: false });
    window.addEventListener('touchend', () => isDragging = false);
  }

  function rotate(p, rx, ry) {
    let x = p.x * Math.cos(ry) - p.z * Math.sin(ry);
    let z = p.x * Math.sin(ry) + p.z * Math.cos(ry);
    let y = p.y;
    let newY = y * Math.cos(rx) - z * Math.sin(rx);
    let newZ = y * Math.sin(rx) + z * Math.cos(rx);
    return { x, y: newY, z: newZ };
  }

  function project(p) {
    const perspective = 400;
    const zOff = 4.0;
    const factor = settings.scale * (perspective / (perspective + (p.z + zOff) * 100));
    return { x: W / 2 + p.x * factor, y: H / 2 + p.y * factor };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    
    if (!isDragging) {
      rotationX += settings.speedX;
      rotationY += settings.speedY;
    }

    if (vertexProgress < vertices.length) vertexProgress += settings.vertexSpeed;
    else if (edgeProgress < edges.length) edgeProgress += settings.edgeSpeed;

    const projected = vertices.map(v => project(rotate(v, rotationX, rotationY)));

    // 선 그리기
    ctx.lineWidth = 2.5;
    const currentEdgeIdx = Math.floor(edgeProgress);
    for (let i = 0; i < currentEdgeIdx; i++) {
        const [sIdx, eIdx] = edges[i];
        const s = projected[sIdx], e = projected[eIdx];
        const grad = ctx.createLinearGradient(s.x, s.y, e.x, e.y);
        grad.addColorStop(0, settings.color1); 
        grad.addColorStop(1, settings.color2);
        ctx.strokeStyle = grad;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(e.x, e.y); ctx.stroke();
    }
    // 중간 선
    if (edgeProgress > 0 && edgeProgress < edges.length) {
        const i = currentEdgeIdx;
        const [sIdx, eIdx] = edges[i];
        const s = projected[sIdx], e = projected[eIdx];
        const prog = edgeProgress - i;
        ctx.strokeStyle = settings.color1;
        ctx.beginPath(); ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + (e.x - s.x) * prog, s.y + (e.y - s.y) * prog);
        ctx.stroke();
    }

    // 점 그리기
    const currentVertexIdx = Math.floor(vertexProgress);
    for (let i = 0; i < currentVertexIdx; i++) {
        const v = projected[i];
        ctx.fillStyle = settings.dotColor;
        ctx.beginPath(); ctx.arc(v.x, v.y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#FFF'; ctx.lineWidth = 1.5; ctx.stroke();
    }

    requestAnimationFrame(draw);
  }
  draw();
}
