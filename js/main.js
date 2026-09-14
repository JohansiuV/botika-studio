/* ==========================================================================
   BOTIKA STUDIO — main.js
   --------------------------------------------------------------------------
   Índice de funciones:
     initReducedMotion()     → detecta prefers-reduced-motion (se usa en todo el archivo)
     initHeroParallax()      → parallax del mouse en el hero (celular + íconos flotantes)
     initScrollReveal()      → fade-up genérico con IntersectionObserver (.reveal)
     initProductShowcase()   → escena "sticky" Farma One → Plus → Shop → Pro
     init3DTilt()            → inclinación 3D del dashboard activo al mover el mouse
     initShowcaseParallax()  → parallax de las formas de fondo del showcase
     initYapeCopy()          → copiar número de Yape (si el botón existe)
     initVideoModal()        → modal del video de demo
     initDownloadModal()     → descarga protegida por contraseña
   ========================================================================== */

const PREFERS_REDUCED_MOTION = initReducedMotion();

initHeroParallax();
initScrollReveal();
initProductShowcase();
initYapeCopy();
initVideoModal();
initDownloadModal();

/* -------------------------------------------------------------------------- */
function initReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* -------------------------------------------------------------------------- */
/* Parallax 3D en el hero: el celular y los íconos reaccionan al mouse        */
function initHeroParallax() {
  const scene = document.getElementById('scene');
  const phone = document.getElementById('phoneMock');
  if (!scene || !phone || PREFERS_REDUCED_MOTION) return;

  scene.addEventListener('mousemove', (e) => {
    const rect = scene.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    phone.style.transform = `translate(-50%,-50%) rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;

    scene.querySelectorAll('.float-icon').forEach((icon, i) => {
      const depth = 16 + i * 6;
      icon.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });

  scene.addEventListener('mouseleave', () => {
    phone.style.transform = 'translate(-50%,-50%)';
    scene.querySelectorAll('.float-icon').forEach((icon) => (icon.style.transform = ''));
  });
}

/* -------------------------------------------------------------------------- */
/* Revelado genérico al hacer scroll (fade-up con IntersectionObserver).      */
/* Se aplica automáticamente a: .device, .benefit-card, .plan, .process-step  */
/* y a cualquier elemento futuro que tenga la clase ".reveal".                */
function initScrollReveal() {
  const autoSelectors = '.device, .benefit-card, .plan, .process-step, .reveal';
  const items = document.querySelectorAll(autoSelectors);
  if (!items.length) return;

  items.forEach((el) => el.classList.add('reveal-item'));

  if (PREFERS_REDUCED_MOTION) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), i * 90);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  items.forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------------------------- */
/* Showcase de productos: escena tipo "sticky" que recrea el efecto del video */
/* (Farma One → Farma Plus → Farma Shop → Farma Pro), controlada por scroll.  */
function initProductShowcase() {
  const track = document.getElementById('showcaseTrack');
  const stage = document.getElementById('dashboardStage');
  const info = document.getElementById('productInfo');
  const scene = document.getElementById('backgroundScene');
  const progress = document.getElementById('showcaseProgress');
  if (!track || !stage || !info || !scene) return;

  const dashboards = Array.from(stage.querySelectorAll('.dashboard-card'));
  const infoItems = Array.from(info.querySelectorAll('.product-info-item'));
  const bgLayers = Array.from(scene.querySelectorAll('.bg-layer'));
  const dots = progress ? Array.from(progress.querySelectorAll('.sp-dot')) : [];
  const total = dashboards.length;

  let activeIndex = -1;
  let trackTop = 0;
  let trackHeight = 0;
  let ticking = false;

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;

    infoItems.forEach((el, i) => el.classList.toggle('active', i === index));
    bgLayers.forEach((el, i) => el.classList.toggle('active', i === index));
    dots.forEach((el, i) => el.classList.toggle('active', i === index));

    // El texto entra primero; el dashboard llega un instante después (ver punto 11 del brief)
    dashboards.forEach((el, i) => {
      if (i === index) {
        setTimeout(() => el.classList.add('active'), PREFERS_REDUCED_MOTION ? 0 : 180);
      } else {
        el.classList.remove('active');
      }
    });
  }

  function measure() {
    const rect = track.getBoundingClientRect();
    trackTop = rect.top + window.scrollY;
    trackHeight = track.offsetHeight;
  }

  function update() {
    ticking = false;
    const viewportH = window.innerHeight;
    const scrollable = Math.max(trackHeight - viewportH, 1);

    if (window.scrollY + viewportH < trackTop || window.scrollY > trackTop + trackHeight) {
      return; // la sección no está en pantalla, no recalcular
    }

    const raw = (window.scrollY - trackTop) / scrollable;
    const progressRatio = Math.min(Math.max(raw, 0), 0.999);
    const index = Math.floor(progressRatio * total);
    setActive(Math.min(Math.max(index, 0), total - 1));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  measure();
  setActive(0);
  window.addEventListener('resize', () => {
    measure();
    update();
  });
  window.addEventListener('scroll', onScroll, { passive: true });

  // Puntos de progreso: clic para saltar directo a esa escena
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const viewportH = window.innerHeight;
      const scrollable = Math.max(trackHeight - viewportH, 1);
      const targetY = trackTop + (i / total) * scrollable + 2;
      window.scrollTo({ top: targetY, behavior: PREFERS_REDUCED_MOTION ? 'auto' : 'smooth' });
    });
  });

  init3DTilt(stage, dashboards);
  initShowcaseParallax(track);
}

/* -------------------------------------------------------------------------- */
/* Inclinación 3D sutil del dashboard activo al mover el mouse encima.        */
function init3DTilt(stage, dashboards) {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover || PREFERS_REDUCED_MOTION) return;

  stage.addEventListener('mousemove', (e) => {
    const activeCard = dashboards.find((d) => d.classList.contains('active'));
    if (!activeCard) return;
    const tilt = activeCard.querySelector('.dc-tilt');
    if (!tilt) return;

    const rect = activeCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    tilt.style.transform = `rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg)`;
  });

  stage.addEventListener('mouseleave', () => {
    dashboards.forEach((d) => {
      const tilt = d.querySelector('.dc-tilt');
      if (tilt) tilt.style.transform = '';
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Parallax discreto de las formas decorativas de fondo del showcase.         */
function initShowcaseParallax(track) {
  if (PREFERS_REDUCED_MOTION) return;
  const shapes = track.querySelectorAll('.scene-shape');
  if (!shapes.length) return;

  track.addEventListener('mousemove', (e) => {
    const rect = track.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    shapes.forEach((shape) => {
      const depth = parseFloat(shape.dataset.depth || '1');
      shape.style.transform = `translate(${x * 40 * depth}px, ${y * 40 * depth}px)`;
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Copiar número de Yape en la sección "Pagar / Donar" (si el botón existe)   */
function initYapeCopy() {
  const copyBtn = document.getElementById('copyYapeBtn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const number = '999999999'; // debe coincidir con el número mostrado junto al QR
    const originalText = copyBtn.textContent;
    navigator.clipboard
      ?.writeText(number)
      .then(() => {
        copyBtn.textContent = 'Copiado ✓';
        setTimeout(() => (copyBtn.textContent = originalText), 1600);
      })
      .catch(() => {
        copyBtn.textContent = number;
      });
  });
}

/* -------------------------------------------------------------------------- */
/* Modal del video de demo                                                    */
function initVideoModal() {
  const openVideoBtn = document.getElementById('openVideoBtn');
  const videoModal = document.getElementById('videoModal');
  const closeVideoBtn = document.getElementById('closeVideoBtn');
  const videoFrame = document.getElementById('videoFrame');
  const videoUrl = 'Video/untitled.mp4';
  if (!openVideoBtn || !videoModal || !closeVideoBtn || !videoFrame) return;

  openVideoBtn.addEventListener('click', () => {
    videoFrame.src = videoUrl;
    videoFrame.load();
    videoModal.showModal();
  });

  const closeVideo = () => {
    videoModal.close();
    videoFrame.pause();
    videoFrame.src = '';
  };

  closeVideoBtn.addEventListener('click', closeVideo);
  videoModal.addEventListener('click', (event) => {
    if (event.target === videoModal) closeVideo();
  });
}

/* -------------------------------------------------------------------------- */
/* Descarga protegida por contraseña: página ejemplo (FarmaciaONG) + guía PDF. */
function initDownloadModal() {
  const DOWNLOAD_PASSWORD = 'milokita1318'; // cámbiala aquí si quieres actualizarla

  const openDownloadBtn = document.getElementById('openDownloadBtn');
  const downloadModal = document.getElementById('downloadModal');
  const closeDownloadBtn = document.getElementById('closeDownloadBtn');
  const downloadForm = document.getElementById('downloadForm');
  const downloadPasswordInput = document.getElementById('downloadPassword');
  const downloadError = document.getElementById('downloadError');
  if (!openDownloadBtn || !downloadModal || !closeDownloadBtn || !downloadForm || !downloadPasswordInput || !downloadError) return;

  const resetDownloadModal = () => {
    downloadForm.reset();
    downloadForm.hidden = false;
    downloadError.hidden = true;
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const closeDownloadModal = () => {
    downloadModal.close();
    resetDownloadModal();
  };

  openDownloadBtn.addEventListener('click', () => {
    resetDownloadModal();
    downloadModal.showModal();
    downloadPasswordInput.focus();
  });

  closeDownloadBtn.addEventListener('click', closeDownloadModal);
  downloadModal.addEventListener('click', (event) => {
    if (event.target === downloadModal) closeDownloadModal();
  });

  downloadForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // trim() evita fallos por espacios accidentales al escribir o pegar la contraseña
    if (downloadPasswordInput.value.trim() === DOWNLOAD_PASSWORD) {
      downloadError.hidden = true;
      downloadFile('descargas/farmaciaong.zip', 'farmaciaong.zip');
      window.setTimeout(() => {
        downloadFile('descargas/guia-instalacion-xampp.pdf', 'guia-instalacion-xampp.pdf');
      }, 300);
      closeDownloadModal();
    } else {
      downloadError.hidden = false;
      downloadPasswordInput.select();
    }
  });
}
