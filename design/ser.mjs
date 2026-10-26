// Serialise each rendered board/screen into a compact layer spec for the Figma builder.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1700, height: 1000 } });
await pg.goto('file://' + process.cwd() + '/board.html');
await pg.evaluate(() => document.fonts.ready);

const specs = await pg.evaluate(() => {
  const R = v => Math.round(v * 10) / 10;
  const hex = s => {
    const m = s && s.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (a === 0) return null;
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('') + (a < 1 ? ':' + Math.round(a * 100) / 100 : '');
  };
  const rot = {};
  // measure everything unrotated; remember the angle
  document.querySelectorAll('*').forEach((el, i) => {
    const tf = getComputedStyle(el).transform;
    if (tf && tf !== 'none') { const m = tf.match(/matrix\(([^)]+)\)/); if (m) { const [a, b2] = m[1].split(',').map(Number); el.dataset.rot = R(-Math.atan2(b2, a) * 180 / Math.PI); el.style.transform = 'none'; } }
  });
  const nameOf = el => el.dataset.name || (typeof el.className === 'string' && el.className.split(' ')[0]) || el.tagName.toLowerCase();
  const block = el => { while (el && getComputedStyle(el).display.startsWith('inline')) el = el.parentElement; return el; };
  const anchor = el => {
    const cs = getComputedStyle(el), a = cs.textAlign, rtl = cs.direction === 'rtl';
    if (a === 'center') return 'C'; if (a === 'right') return 'R'; if (a === 'left') return 'L';
    if (a === 'end') return rtl ? 'L' : 'R'; return rtl ? 'R' : 'L';
  };

  function text(node, ox, oy) {
    const el = node.parentElement, cs = getComputedStyle(el);
    let s = node.data; if (cs.whiteSpace.startsWith('pre')) {} else s = s.replace(/\s+/g, ' ');
    if (!s.trim()) return null;
    const range = document.createRange(); range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter(r => r.width > 0);
    if (!rects.length) return null;
    const box = range.getBoundingClientRect();
    if (cs.textTransform === 'uppercase') s = s.toUpperCase();
    const tops = new Set(rects.map(r => Math.round(r.top)));
    const out = { t: 'x', s: s.trim(), f: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), wt: +cs.fontWeight, fs: R(parseFloat(cs.fontSize)), c: hex(cs.color) };
    const ls = parseFloat(cs.letterSpacing); if (ls) out.ls = R(ls);
    if (cs.textDecorationLine.includes('underline')) out.u = 1;
    if (tops.size > 1) {
      const bl = block(el), br = bl.getBoundingClientRect(), bcs = getComputedStyle(bl);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      const x0 = br.left + parseFloat(bcs.paddingLeft), w = br.width - parseFloat(bcs.paddingLeft) - parseFloat(bcs.paddingRight);
      Object.assign(out, { wr: 1, lh: R(lh), x: R(x0 - ox), y: R(rects[0].top - (lh - rects[0].height) / 2 - oy), w: R(w), h: R(tops.size * lh), a: anchor(bl) });
    } else {
      Object.assign(out, { x: R(box.left - ox), y: R(box.top - oy), w: R(box.width), h: R(box.height), a: anchor(block(el)) });
    }
    return out;
  }

  function ser(el, ox, oy, root) {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden') return [];
    const x = R(r.left - ox), y = R(r.top - oy), w = R(r.width), h = R(r.height);
    const tag = el.tagName.toLowerCase();
    if (tag === 'svg') {
      if (el.dataset.sp) { const sp = JSON.parse(el.dataset.sp); return [{ t: 'p', n: 'entity/' + sp.def, x, y, N: sp.n, c: sp.c, s: sp.s, o: sp.o, pad: sp.pad || 0, g: sp.g, p: sp.p, off: sp.off, P: sp.P }]; }
      if (el.dataset.pat) return [{ t: 'g', n: 'bg/' + JSON.parse(el.dataset.pat).k, x, y, ...JSON.parse(el.dataset.pat) }];
      const clone = el.cloneNode(true); const rings = [];
      clone.querySelectorAll('[data-ring]').forEach(p => { rings.push(JSON.parse(p.dataset.ring)); p.replaceWith(document.createComment('R' + (rings.length - 1))); });
      clone.removeAttribute('class'); clone.removeAttribute('style');
      const out = { t: 's', n: 'svg', x, y, w, h, v: clone.outerHTML.replace(/\s+/g, ' ').replace(/> </g, '><') };
      if (rings.length) out.rings = rings;
      return [out];
    }
    if (el.dataset.sb) return [{ t: 'sb', n: 'status-bar', x, y, w, h, c: el.dataset.sb }];
    if (el.dataset.seg) return [{ t: 'seg', n: 'segment-bar', x, y, w, h, ...JSON.parse(el.dataset.seg) }];
    if (el.classList.contains('screen') && el.parentElement.classList.contains('phone')) return [{ t: 'cl', ref: el.dataset.name, x, y, w, h, r: parseFloat(cs.borderTopLeftRadius) || 0 }];

    const bg = hex(cs.backgroundColor);
    const bw = ['Top', 'Right', 'Bottom', 'Left'].map(s => parseFloat(cs['border' + s + 'Width']) || 0);
    const bc = ['Top', 'Right', 'Bottom', 'Left'].map(s => hex(cs['border' + s + 'Color']));
    const st = bw.some(v => v) ? [bc[bw.findIndex(v => v)], ...bw] : null;
    const op = parseFloat(cs.opacity);
    const clip = cs.overflow === 'hidden';
    const rad = parseFloat(cs.borderTopLeftRadius) || 0;
    const sh = cs.boxShadow !== 'none';
    const visual = root || bg || st || op < 1 || clip || el.dataset.rot || sh;
    const kids = [];
    const nox = visual ? r.left : ox, noy = visual ? r.top : oy;
    const childNodes = [...el.childNodes].map((c, i) => [c, c.nodeType === 1 ? (parseInt(getComputedStyle(c).zIndex) || 0) : 0, i]).sort((a, b2) => a[1] - b2[1] || a[2] - b2[2]);
    for (const [c] of childNodes) {
      if (c.nodeType === 3) { const t = text(c, nox, noy); if (t) kids.push(t); }
      else if (c.nodeType === 1 && c.tagName !== 'BR' && c.tagName !== 'STYLE') kids.push(...ser(c, nox, noy, false));
    }
    if (!visual) {
      if (kids.length >= 2 && typeof el.className === 'string' && el.className && !el.classList.contains('abs')) {
        // keep a transparent group frame so the layer tree stays readable
        const gx = r.left, gy = r.top;
        const shift = k => ({ ...k, x: R(k.x - (gx - ox)), y: R(k.y - (gy - oy)) });
        return [{ t: 'f', n: nameOf(el), x, y, w, h, K: kids.map(shift) }];
      }
      return kids;
    }
    const out = { t: 'f', n: nameOf(el), x, y, w, h };
    if (bg) out.bg = bg; if (st) out.st = st; if (op < 1) out.o = op; if (clip) out.clip = 1; if (rad) out.r = R(rad); if (sh) out.sh = 1;
    if (el.dataset.rot) out.rot = +el.dataset.rot;
    if (kids.length) out.K = kids;
    return [out];
  }

  const roots = [...document.querySelectorAll('body > .board, .strip > .screen')];
  return roots.map(el => { const r = el.getBoundingClientRect(); const s = ser(el, r.left, r.top, true)[0]; s.n = el.dataset.name; s.x = 0; s.y = 0; return s; });
});
await b.close();

fs.mkdirSync('specs', { recursive: true });
for (const s of specs) {
  const file = 'specs/' + s.n.slice(0, 2) + '-' + s.n.replace(/[^a-z]+/gi, '-').toLowerCase().replace(/^-|-$/g, '') + '.json';
  fs.writeFileSync(file, JSON.stringify(s));
  const count = (function c(n) { return 1 + (n.K || []).reduce((a, k) => a + c(k), 0); })(s);
  console.log(file, JSON.stringify(s).length, 'chars', count, 'nodes');
}
