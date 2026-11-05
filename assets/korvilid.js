/* Корвилид — общий скрипт для страниц услуг */
(() => {
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);
window.KV = { RM, $, nf: v => Math.round(v).toLocaleString('ru-RU') };
const y = $('#y'); if (y) y.textContent = new Date().getFullYear();

/* фон: сеть частиц */
const cv = $('#bgcanvas');
if (cv){
  const cx = cv.getContext('2d'); let W, H, pts = [], mouse = {x:-999, y:-999};
  const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight;
    const n = Math.min(70, Math.floor(W*H/24000));
    pts = Array.from({length:n}, () => ({x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35})); };
  size(); addEventListener('resize', size);
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY;
    const g = $('#glow'); if (g){ g.style.left = e.clientX+'px'; g.style.top = e.clientY+'px'; } });
  (function bg(){
    cx.clearRect(0,0,W,H);
    for (const p of pts){ p.x += p.vx; p.y += p.vy; if (p.x<0||p.x>W) p.vx*=-1; if (p.y<0||p.y>H) p.vy*=-1;
      const dm = Math.hypot(p.x-mouse.x, p.y-mouse.y); if (dm < 140){ p.x += (p.x-mouse.x)/dm*.6; p.y += (p.y-mouse.y)/dm*.6; } }
    for (let i=0;i<pts.length;i++){ const a = pts[i];
      for (let j=i+1;j<pts.length;j++){ const b = pts[j], d = Math.hypot(a.x-b.x, a.y-b.y);
        if (d<150){ cx.strokeStyle = `rgba(110,155,255,${(1-d/150)*.25})`; cx.beginPath(); cx.moveTo(a.x,a.y); cx.lineTo(b.x,b.y); cx.stroke(); } }
      cx.fillStyle = 'rgba(201,206,214,.6)'; cx.beginPath(); cx.arc(a.x,a.y,1.6,0,6.3); cx.fill(); }
    if (!RM) requestAnimationFrame(bg);
  })();
}

/* появление блоков */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.15});
document.querySelectorAll('.reveal,.app').forEach(el => io.observe(el));

/* FAQ */
document.querySelectorAll('.faq-q').forEach(q => q.addEventListener('click', () => q.parentElement.classList.toggle('open')));

/* форма */
const f = $('#leadForm'), m = $('#fmsg');
if (f){
  f.addEventListener('submit', async e => {
    e.preventDefault(); m.className = 'fmsg'; m.textContent = '';
    if (!f.name.value.trim() || f.phone.value.replace(/\D/g,'').length < 10){ m.className = 'fmsg err'; m.textContent = 'Укажите имя и телефон.'; return; }
    if (!f.consent.checked){ m.className = 'fmsg err'; m.textContent = 'Нужно согласие на обработку персональных данных.'; return; }
    const btn = f.querySelector('button'), label = btn.textContent; btn.disabled = true; btn.textContent = 'Отправляем…';
    try { const r = await fetch('send.php', {method:'POST', body:new FormData(f)}); const j = await r.json();
      if (j.ok){ f.reset(); m.className = 'fmsg ok'; m.textContent = 'Спасибо! Заявка принята — свяжемся с вами в ближайшее рабочее время.'; }
      else throw new Error(j.error || 'error');
    } catch(err){ m.className = 'fmsg err'; m.textContent = 'Не получилось отправить. Позвоните или напишите нам на почту.'; }
    btn.disabled = false; btn.textContent = label;
  });
}

/* калькулятор окупаемости (данные вводит пользователь) */
const roi = $('#roi');
if (roi){
  const ids = ['rb','rc','rv','rk'];
  const upd = () => {
    const b = +$('#rb').value, cpl = +$('#rc').value, conv = +$('#rv').value/100, check = +$('#rk').value;
    ids.forEach(id => { const el = $('#'+id); el.style.setProperty('--p', ((el.value-el.min)/(el.max-el.min)*100)+'%'); });
    $('#rbv').textContent = KV.nf(b)+' ₽'; $('#rcv').textContent = KV.nf(cpl)+' ₽'; $('#rvv').textContent = (conv*100).toFixed(0)+'%'; $('#rkv').textContent = KV.nf(check)+' ₽';
    const leads = b / cpl, deals = leads * conv, rev = deals * check;
    $('#o1').textContent = KV.nf(leads); $('#o2').textContent = deals.toFixed(1).replace('.',','); $('#o3').textContent = KV.nf(rev)+' ₽';
    $('#o4').textContent = deals > 0 ? KV.nf(b / deals)+' ₽' : '—';
  };
  ids.forEach(id => $('#'+id).addEventListener('input', upd)); upd();
}
})();
