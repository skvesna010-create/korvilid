/* Мобильное меню: клонирует ссылки из мега-меню */
(() => {
  const nav = document.querySelector('header nav'), bar = document.querySelector('header .nav') || document.querySelector('header > div');
  if (!nav || !bar) return;
  const btn = document.createElement('button'); btn.className = 'burger'; btn.setAttribute('aria-label', 'Меню'); btn.innerHTML = '<i></i><i></i><i></i>';
  const ov = document.createElement('div'); ov.className = 'mob';
  const links = [...nav.querySelectorAll('.mpanel a:not(.all)')].map(a => a.outerHTML).join('');
  const extra = [...nav.children].filter(x => x.tagName === 'A').map(a => `<a class="mx" href="${a.getAttribute('href')}">${a.textContent}</a>`).join('');
  ov.innerHTML = `<div class="mobin"><a class="mall" href="services.html">Все услуги и подбор по задаче →</a><div class="mgrid">${links}</div><div class="mlinks">${extra}</div></div>`;
  bar.appendChild(btn); document.body.appendChild(ov);
  const toggle = on => { document.body.classList.toggle('mobon', on); };
  btn.addEventListener('click', () => toggle(!document.body.classList.contains('mobon')));
  ov.addEventListener('click', e => { if (e.target.closest('a')) toggle(false); });
})();
