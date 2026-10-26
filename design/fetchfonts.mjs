import fs from 'node:fs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const url = 'https://fonts.googleapis.com/css2?family=Doto:wght@400;700;900&family=Silkscreen:wght@400;700&family=Handjet:wght@300;400;500;600;700;800&family=Readex+Pro:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=block';
let css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
// keep only latin + arabic subsets
const blocks = css.split('/*').filter(Boolean).map(b => '/*' + b);
const keep = blocks.filter(b => /\/\* (latin|arabic) \*\//.test(b));
let out = '';
for (const b of keep) {
  const m = b.match(/url\((https:[^)]+)\)/);
  const buf = Buffer.from(await (await fetch(m[1])).arrayBuffer());
  out += b.replace(m[1], 'data:font/woff2;base64,' + buf.toString('base64')) + '\n';
}
fs.mkdirSync('fonts', { recursive: true });
fs.writeFileSync('fonts/fonts.css', out);
console.log(keep.length, 'faces', (out.length / 1e6).toFixed(2), 'MB');
