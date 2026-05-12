(() => {
  const toggle = () => {
    const btn = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.primary-nav');
    if (!btn || !nav) return;
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest('.nav-toggle')) {
      toggle();
    } else if (!e.target.closest('.primary-nav')) {
      const nav = document.querySelector('.primary-nav.open');
      const btn = document.querySelector('.nav-toggle');
      if (nav) { nav.classList.remove('open'); if (btn) btn.setAttribute('aria-expanded', 'false'); }
    }
  });
  // Close on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const nav = document.querySelector('.primary-nav.open');
      const btn = document.querySelector('.nav-toggle');
      if (nav) { nav.classList.remove('open'); if (btn) btn.setAttribute('aria-expanded', 'false'); }
    }
  });
  // Set the dynamic year in the footer
  const y = new Date().getFullYear();
  document.querySelectorAll('.year').forEach(n => n.textContent = String(y));

  // ---- Reveal-on-scroll ---------------------------------------------------
  // Elements with the `.reveal` class fade + slide in when they intersect the
  // viewport. Optional `data-reveal-delay` ms stagger.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealables = document.querySelectorAll('.reveal, .reveal-pop');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(el => el.classList.add('is-in'));
  } else {
    revealables.forEach(el => {
      const d = parseInt(el.dataset.revealDelay || '0', 10);
      if (d) el.style.setProperty('--reveal-delay', d + 'ms');
    });
    const io = new IntersectionObserver((entries) => {
      for (const ent of entries) {
        if (ent.isIntersecting) {
          ent.target.classList.add('is-in');
          io.unobserve(ent.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => io.observe(el));
  }

  // ---- Cursor-follow spotlight (hero only, desktop only) ------------------
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced) {
    const spots = document.querySelectorAll('[data-spotlight]');
    for (const sp of spots) {
      let raf = 0;
      sp.addEventListener('pointermove', (ev) => {
        const rect = sp.getBoundingClientRect();
        const x = ((ev.clientX - rect.left) / rect.width) * 100;
        const y = ((ev.clientY - rect.top) / rect.height) * 100;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          sp.style.setProperty('--spot-x', x.toFixed(1) + '%');
          sp.style.setProperty('--spot-y', y.toFixed(1) + '%');
        });
      }, { passive: true });
    }
  }

  // ---- 3D tilt on hover ---------------------------------------------------
  // Elements with [data-tilt] get pointer-driven X/Y rotation + a glare
  // gradient positioned at the cursor. Disabled on coarse pointers and when
  // prefers-reduced-motion is set.
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduced) {
    const MAX_TILT = 8; // degrees, per the brief
    const isRTL = document.documentElement.dir === 'rtl';
    const tiltables = document.querySelectorAll('[data-tilt]');
    for (const el of tiltables) {
      let raf = 0;
      const handleMove = (ev) => {
        const rect = el.getBoundingClientRect();
        const px = (ev.clientX - rect.left) / rect.width;   // 0..1
        const py = (ev.clientY - rect.top) / rect.height;
        // RotateX: top → tilt back, bottom → tilt forward.
        // RotateY: in LTR, mouse right → tilt right side toward viewer; flip in RTL.
        const rx = (0.5 - py) * 2 * MAX_TILT;
        const ryDir = isRTL ? -1 : 1;
        const ry = (px - 0.5) * 2 * MAX_TILT * ryDir;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.setProperty('--tilt-x', rx.toFixed(2) + 'deg');
          el.style.setProperty('--tilt-y', ry.toFixed(2) + 'deg');
          el.style.setProperty('--glare-x', (px * 100).toFixed(1) + '%');
          el.style.setProperty('--glare-y', (py * 100).toFixed(1) + '%');
        });
      };
      const handleEnter = () => el.classList.add('is-tilting');
      const handleLeave = () => {
        el.classList.remove('is-tilting');
        if (raf) cancelAnimationFrame(raf);
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
      };
      el.addEventListener('pointermove', handleMove, { passive: true });
      el.addEventListener('pointerenter', handleEnter, { passive: true });
      el.addEventListener('pointerleave', handleLeave, { passive: true });
    }
  }
})();
