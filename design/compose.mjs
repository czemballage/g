import fs from 'node:fs';
const B = fs.readFileSync('builder.js', 'utf8');
const sp = f => JSON.parse(fs.readFileSync('specs/' + f, 'utf8'));
const files = fs.readdirSync('specs').sort();
const cover = sp(files.find(f => f.includes('cover'))), sys = sp(files.find(f => f.includes('system')));
const rowY = Math.max(cover.h, sys.h) + 240;
const scr = files.filter(f => /^0[1-7]/.test(f));
const at = {}; scr.forEach((f, i) => at[f] = [i * 470, rowY]);
at[files.find(f => f.includes('cover'))] = [0, 0];
at[files.find(f => f.includes('system'))] = [1720, 0];
const groups = [[scr[0], scr[1]], [scr[2], scr[3]], [scr[4], scr[5]], [files.find(f => f.includes('system'))], [scr[6], files.find(f => f.includes('cover'))]];
groups.forEach((g, i) => {
  const code = `const DS=${JSON.stringify(g.map(f => [sp(f), at[f]]))};\n${B}`;
  fs.writeFileSync(`call${i + 1}.js`, code);
  fs.writeFileSync(`check${i + 1}.mjs`, `const figma={};async function run(){${code}}`);
  console.log(`call${i + 1}.js`, code.length, g.join(' + '));
});
console.log('rowY', rowY, 'cover', cover.w, cover.h, 'sys', sys.w, sys.h);
