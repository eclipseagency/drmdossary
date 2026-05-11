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
})();
