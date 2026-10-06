/* Curso Power BI — comportamento comum das páginas */
(function () {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* tema claro/escuro */
  const saved = store.get('pbi-tema');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  document.querySelectorAll('.theme-tg').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const nx = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nx);
      store.set('pbi-tema', nx);
    });
  });

  /* progresso por aula */
  const aula = document.body.dataset.aula;
  const boxes = [...document.querySelectorAll('.step-h input[type=checkbox]')];
  function upd() {
    const n = boxes.filter(b => b.checked).length;
    const t = document.getElementById('pg-txt'), bar = document.getElementById('pg-bar');
    if (t) t.textContent = n + '/' + boxes.length;
    if (bar) bar.style.width = (boxes.length ? n / boxes.length * 100 : 0) + '%';
    if (aula) store.set('pbi-prog-' + aula, n + '/' + boxes.length);
  }
  boxes.forEach(b => {
    const key = 'pbi-' + aula + '-' + b.id;
    if (store.get(key) === '1') b.checked = true;
    b.addEventListener('change', () => { store.set(key, b.checked ? '1' : '0'); upd(); });
  });
  if (boxes.length) upd();

  /* progresso no índice */
  document.querySelectorAll('.card[data-aula]').forEach(c => {
    const v = store.get('pbi-prog-' + c.dataset.aula);
    if (!v) return;
    const [a, b] = v.split('/').map(Number);
    const i = c.querySelector('.mini i');
    if (i && b) i.style.width = (a / b * 100) + '%';
    const s = c.querySelector('.st');
    if (s) s.textContent = a + '/' + b + ' passos';
  });

  /* realce de sintaxe simples para DAX, M e JSON */
  const KW = /\b(VAR|RETURN|let|in|each|if|then|else|true|false|null|type|text|number|date|ASC|DESC|Dense|Skip|and|or|not|TRUE|FALSE|IN)\b/g;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function hl(src) {
    const out = []; let i = 0;
    const re = /(\/\/[^\n]*|--[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.|"")*")|('(?:[^'])*')|(\b\d+(?:[.,]\d+)?\b)|([A-Za-zÀ-ú_][\w.À-ú]*)(?=\s*\()/g;
    let m;
    while ((m = re.exec(src))) {
      out.push(esc(src.slice(i, m.index)).replace(KW, '<span class="kw">$1</span>'));
      const [full, cm, s1, s2, num, fn] = m;
      if (cm) out.push('<span class="cm">' + esc(cm) + '</span>');
      else if (s1) out.push('<span class="str">' + esc(s1) + '</span>');
      else if (s2) out.push(esc(s2));
      else if (num) out.push('<span class="num">' + num + '</span>');
      else if (fn) out.push('<span class="fn">' + esc(fn) + '</span>');
      i = m.index + full.length;
    }
    out.push(esc(src.slice(i)).replace(KW, '<span class="kw">$1</span>'));
    return out.join('');
  }
  document.querySelectorAll('.code pre[data-hl]').forEach(pre => { pre.innerHTML = hl(pre.textContent); });

  /* copiar */
  document.querySelectorAll('.copy').forEach(btn => btn.addEventListener('click', () => {
    const pre = btn.closest('.code').querySelector('pre');
    const text = pre.innerText;
    const done = ok => {
      const t = btn.textContent;
      btn.textContent = ok ? 'Copiado' : 'Selecione e copie';
      btn.classList.toggle('done', ok);
      setTimeout(() => { btn.textContent = t; btn.classList.remove('done'); }, 1600);
    };
    const fallback = () => {
      const r = document.createRange(); r.selectNodeContents(pre);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r); done(false);
    };
    try { navigator.clipboard.writeText(text).then(() => done(true), fallback); } catch (e) { fallback(); }
  }));

  /* ampliar prints */
  document.querySelectorAll('.frame img').forEach(img => {
    img.tabIndex = 0;
    const open = () => {
      const lb = document.createElement('div'); lb.className = 'lb';
      const big = document.createElement('img'); big.src = img.src; big.alt = img.alt; lb.appendChild(big);
      const close = () => { lb.remove(); document.removeEventListener('keydown', key); };
      const key = e => { if (e.key === 'Escape') close(); };
      lb.addEventListener('click', close); document.addEventListener('keydown', key);
      document.body.appendChild(lb);
    };
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
  });

  /* item ativo no índice lateral */
  const links = [...document.querySelectorAll('nav.toc a[href^="#"]')];
  if (links.length && 'IntersectionObserver' in window) {
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { links.forEach(l => l.classList.remove('on')); map.get(e.target.id)?.classList.add('on'); } });
    }, { rootMargin: '-30% 0px -60% 0px' });
    map.forEach((a, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }
})();
