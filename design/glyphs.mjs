import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch(); const pg = await b.newPage();
await pg.goto('file://' + process.cwd() + '/board.html'); await pg.evaluate(() => document.fonts.ready);
const res = await pg.evaluate(() => {
  const cv = document.createElement('canvas').getContext('2d');
  const miss = {};
  const w = (font, ch) => { cv.font = font; return cv.measureText(ch).width; };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n; while ((n = walker.nextNode())) {
    const el = n.parentElement, cs = getComputedStyle(el); if (!n.data.trim()) continue;
    const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), wt = cs.fontWeight;
    for (const ch of new Set(n.data)) {
      if (ch === ' ' || ch === '\n') continue;
      const a = w(`${wt} 40px "${fam}", monospace`, ch), bb = w(`${wt} 40px "${fam}", serif`, ch);
      if (Math.abs(a - bb) > 0.01) (miss[fam] ||= new Set()).add(ch);
    }
  }
  return Object.fromEntries(Object.entries(miss).map(([k, v]) => [k, [...v].join('')]));
});
console.log(JSON.stringify(res, null, 1)); await b.close();
