document.addEventListener('click', (e) => {
  const t = e.target.closest('.nav-toggle');
  if (!t) return;
  const menu = document.getElementById('primary-menu');
  if (menu) {
    menu.classList.toggle('open');
    t.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
  }
});
