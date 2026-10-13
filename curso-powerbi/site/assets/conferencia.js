/* Curso Power BI — caixas de conferência das aulas de projeto (15 e 16)
   O aluno digita o resultado; a página compara o SHA-256 de "id:valor" com o data-h da caixa. */
(function () {
  const prefix = document.body.dataset.conf || '';
  const store = {
    get(k) { try { return localStorage.getItem(prefix + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(prefix + k, v); } catch (e) {} }
  };

  /* SHA-256 síncrono (crypto.subtle não funciona abrindo o arquivo direto do disco) */
  function sha256(ascii) {
    const rot = (v, n) => (v >>> n) | (v << (32 - n));
    const max = Math.pow(2, 32), words = [], k = [], comp = {};
    const bits = ascii.length * 8;
    let hash = [], n = 0, i, j, out = '';
    for (let c = 2; n < 64; c++) {
      if (comp[c]) continue;
      for (i = 0; i < 313; i += c) comp[i] = c;
      hash[n] = (Math.pow(c, .5) * max) | 0;
      k[n++] = (Math.pow(c, 1 / 3) * max) | 0;
    }
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (bits / max) | 0;
    words[words.length] = bits | 0;
    for (j = 0; j < words.length;) {
      const w = words.slice(j, j += 16), old = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        const t1 = hash[7] + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i] +
          (w[i] = i < 16 ? w[i] : (w[i - 16] + (rot(w15, 7) ^ rot(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rot(w2, 17) ^ rot(w2, 19) ^ (w2 >>> 10))) | 0);
        const t2 = (rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      out += (b < 16 ? '0' : '') + b.toString(16);
    }
    return out;
  }

  /* aceita 1.234,56 · 1234,56 · 1234.56 · R$ e % */
  function parse(s) {
    s = String(s).replace(/R\$|%|\s/g, '');
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    return parseFloat(s);
  }

  const boxes = [...document.querySelectorAll('.chk')];
  function upd() {
    const t = document.getElementById('cf-txt');
    if (t) t.textContent = document.querySelectorAll('.chk.ok').length + '/' + boxes.length;
  }

  boxes.forEach(box => {
    const id = box.dataset.id, expected = box.dataset.h, fmt = box.dataset.fmt;
    const q = document.createElement('div'); q.className = 'qt'; q.textContent = box.dataset.q;
    const inp = document.createElement('input');
    inp.type = 'text'; inp.inputMode = 'decimal'; inp.placeholder = 'Seu resultado';
    inp.setAttribute('aria-label', 'Seu resultado: ' + box.dataset.q);
    const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = 'Conferir';
    const fb = document.createElement('span'); fb.className = 'fb'; fb.setAttribute('aria-live', 'polite');
    box.append(q, inp, btn, fb);

    const ok = msg => { box.classList.add('ok'); fb.textContent = msg; store.set(id, '1'); upd(); };
    const matches = v => {
      if (fmt === 'int') return sha256(id + ':' + Math.round(v)) === expected;
      /* valores em R$ e %: tolera 1 centavo de arredondamento */
      const cents = Math.round(v * 100);
      return [cents, cents - 1, cents + 1].some(c => sha256(id + ':' + (c / 100).toFixed(2)) === expected);
    };
    btn.addEventListener('click', () => {
      const v = parse(inp.value);
      if (isNaN(v)) { fb.textContent = 'Digite um número.'; return; }
      if (matches(v)) ok('Conferido');
      else fb.textContent = 'Ainda não bateu. Revise a etapa e tente de novo.';
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
    if (store.get(id) === '1') ok('Conferido anteriormente');
  });
  upd();
})();
