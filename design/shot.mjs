import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1700, height: 1000 }, deviceScaleFactor: 1 });
await pg.goto('file://' + process.cwd() + '/board.html'); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
const els = await pg.$$('.strip > .screen');
for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: `s${i + 1}.png` });
const boards = await pg.$$('body > .board');
for (let i = 0; i < boards.length; i++) await boards[i].screenshot({ path: `b${i}.png` });
// overflow check: any screen body whose content exceeds height
const over = await pg.$$eval('.strip > .screen', ss => ss.map(s => { const b = s.querySelector('.body'); return [s.dataset.name, b.scrollHeight, b.clientHeight]; }));
console.log(JSON.stringify(over));
await b.close();
