import fs from 'node:fs';
import { svg, gridSvg, dotsSvg } from './sprites.mjs';

const T = {
  bone:  { bg: '#d6d0c2', panel: '#cdc6b6', line: '#a9a190', ink: '#1b1916', ink2: '#4c473f', ink3: '#847d6f', acc: '#d23a1e', accInk: '#f4ede3', grid: ['#1b1916', 0.07] },
  blood: { bg: '#1c0c0b', panel: '#271211', line: '#4b2520', ink: '#f4e4db', ink2: '#c7a69c', ink3: '#86625b', acc: '#ff4a32', accInk: '#1c0c0b', grid: ['#ffb4a8', 0.10] },
  ice:   { bg: '#05080b', panel: '#09121a', line: '#1d3443', ink: '#dff2ff', ink2: '#a9dcff', ink3: '#5d7f93', acc: '#ff4b3a', accInk: '#05080b', grid: ['#a9dcff', 0.10] },
};

const W = 390, H = 844;
const pal = { bone: 'bone', blood: 'blood', ice: 'ice' };

// ---------- shared bits ----------
const statusBar = t => `<div class="sb" data-sb="${T[t].ink}" style="color:${T[t].ink}">
  <span class="sb-time">9:41</span>
  <span class="sb-icons">
    <svg width="18" height="11" viewBox="0 0 18 11"><path d="M0 8h3v3H0zM5 6h3v5H5zM10 3h3v8h-3zM15 0h3v11h-3z" fill="${T[t].ink}"/></svg>
    <svg width="16" height="11" viewBox="0 0 16 11"><path d="M8 11 5.6 8.4a3.4 3.4 0 0 1 4.8 0zM3.3 6.1a6.6 6.6 0 0 1 9.4 0l-1.2 1.2a4.9 4.9 0 0 0-7 0zM1 3.8a9.9 9.9 0 0 1 14 0l-1.2 1.2a8.2 8.2 0 0 0-11.6 0z" fill="${T[t].ink}"/></svg>
    <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="${T[t].ink}" stroke-opacity=".45"/><rect x="2" y="2" width="16" height="8" rx="1.6" fill="${T[t].ink}"/><path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4z" fill="${T[t].ink}" fill-opacity=".45"/></svg>
  </span></div>`;
const homeBar = t => `<div class="home" style="background:${T[t].ink}"></div>`;
const bgGrid = t => t === 'bone' ? `<div class="bgfx">${gridSvg(W, H, 13, T.bone.grid[0], T.bone.grid[1])}</div>` : `<div class="bgfx">${dotsSvg(W, H, 10, T[t].grid[0], T[t].grid[1], 1.1)}</div>`;
const corners = (w, h, c, l = 12) => `<svg class="abs" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="left:0;top:0"><path d="M0 ${l}V0h${l}M${w - l} 0h${l}v${l}M${w} ${h - l}v${l}h${-l}M${l} ${h}H0v${-l}" stroke="${c}" stroke-width="2" fill="none"/></svg>`;
const segBar = (n, on, c, off, h = 8, w = null) => `<div class="seg" data-seg='${JSON.stringify({ n, on, c, off })}' style="height:${h}px">${Array.from({ length: n }, (_, i) => `<i style="background:${i < on ? c : 'transparent'};border:1px solid ${i < on ? c : off}"></i>`).join('')}</div>`;
const tri = c => `<svg width="18" height="16" viewBox="0 0 9 8"><path d="M4 0h1v1h1v2h1v2h1v2h1v1H0V7h1V5h1V3h1V1h1z" fill="${c}"/><path d="M4 3h1v2H4zM4 6h1v1H4z" fill="${c === '#f4ede3' ? '#d23a1e' : '#000'}" fill-opacity=".9"/></svg>`;

function screen(t, name, inner) {
  return `<section class="screen t-${t}" data-name="${name}" style="background:${T[t].bg};color:${T[t].ink}">${bgGrid(t)}${statusBar(t)}<div class="body">${inner}</div>${homeBar(t)}</section>`;
}

// ---------- 01 INTAKE ----------
const intake = () => screen('bone', '01 — Intake', `
  <div class="hud row"><span>SZ / INTAKE</span><span>SUBJECT: UNASSIGNED</span></div>
  <div class="row ltr" style="align-items:flex-end;margin-top:10px">
    <div class="doto" style="font-size:60px;line-height:.86;letter-spacing:-.02em">SUBJECT<br>ZERO</div>
    <div class="hud" style="text-align:right;line-height:1.7;color:${T.bone.ink3}">PROTOCOL 1.0<br>9 ENTITIES<br>365 DAYS</div>
  </div>
  <div class="hair" style="background:${T.bone.ink};margin-top:14px"></div>
  <div class="center" style="position:relative;margin-top:12px;height:300px">
    <div class="abs" style="left:25px;top:0;width:300px;height:300px">${corners(300, 300, T.bone.ink)}</div>
    <div class="abs" style="left:31px;top:6px">${svg('origin', { n: 36, cell: 8, pal: 'bone', seed: 9 })}</div>
  </div>
  <div class="row mono ltr" style="color:${T.bone.ink3};margin-top:8px"><span>IDX 60 · HUMAN</span><span>IT IS WATCHING</span><span>CELLS 09</span></div>
  <p class="ar" style="margin-top:16px">تسعة كيانات تتغذّى على انتباهك. لا تحتاج قوّة، تحتاج وقتاً: كل ساعة تصمد فيها تأكل منها، حتى تموت.</p>
  <div class="ar-d" style="font-size:26px;margin-top:14px">متى كانت آخر مرة؟</div>
  <div class="chips" style="margin-top:10px">
    ${['اليوم', 'أمس', 'قبل 3 أيام', 'قبل أسبوع'].map((c, i) => `<span class="chip" style="${i === 1 ? `background:${T.bone.ink};color:${T.bone.bg};border-color:${T.bone.ink}` : `border-color:${T.bone.line}`}">${c}</span>`).join('')}
  </div>
  <div class="spacer"></div>
  <div class="btn" style="background:${T.bone.ink};color:${T.bone.bg}">
    <span class="ar-b">ابدأ الاحتواء</span><span class="hud" style="color:${T.bone.bg};opacity:.6">BEGIN -></span>
  </div>
  <div class="row center" style="gap:6px;margin-top:10px;color:${T.bone.ink3}"><span class="ar" style="font-size:11px">كل شيء على جهازك</span><span class="mono" style="font-size:9.5px">NO ACCOUNT · NO SERVER</span></div>
`);

// ---------- 02 CONTAINMENT (home) ----------
const roster = (t, cur, cellPal) => {
  const list = ['whisperer', 'siren', 'hollow', 'wyrm', 'glass', 'legion', 'reboot', 'sovereign', 'origin'];
  return `<div class="roster">${list.map((d, i) => {
    const st = i < cur ? 'dead' : i === cur ? 'cur' : 'lock';
    const p = st === 'dead' ? cellPal.dim : cellPal.on;
    return `<div class="cell" style="border-color:${st === 'cur' ? T[t].acc : T[t].line};${st === 'cur' ? `background:${T[t].panel}` : ''}">
      ${svg(d, { n: 16, cell: 2, pal: p, offDots: false, locked: st === 'lock', seed: 30 + i, hp: st === 'cur' ? 0.38 : 1 })}
      ${st === 'dead' ? `<svg class="abs" width="34" height="34" viewBox="0 0 34 34" style="left:0;top:0"><path d="M4 30 30 4" stroke="${T[t].acc}" stroke-width="1.5"/></svg>` : ''}
      ${st === 'lock' ? `<span class="abs q" style="color:${T[t].ink3}">?</span>` : ''}
    </div>`;
  }).join('')}</div>`;
};

const home = () => { const t = 'bone', c = T[t]; return screen(t, '02 — Containment (Home)', `
  <div class="hud row"><span>SZ-0 / CONTAINMENT</span><span class="row" style="gap:6px"><i class="live" style="background:${c.acc}"></i>LIVE · CELL 03</span></div>
  <div class="row ltr" style="align-items:flex-end;margin-top:6px">
    <div class="doto" style="font-size:128px;line-height:.8;letter-spacing:-.04em">12</div>
    <div class="rtl" style="text-align:right;padding-bottom:4px">
      <div class="ar-d" style="font-size:30px;line-height:1">يوم نظيف</div>
      <div class="mono" style="font-size:15px;color:${c.ink2};margin-top:6px;direction:ltr">07:42:19</div>
      <div class="hud" style="color:${c.ink3};margin-top:4px;direction:ltr">BEST 21D · RUN #4</div>
    </div>
  </div>
  <div class="panel" style="margin-top:14px;border-color:${c.ink};background:${c.panel}">
    <div class="phead" style="background:${c.ink};color:${c.bg}"><span>E-04 / DOPA-WYRM</span><span>CLASS III · FEEDING</span></div>
    <div style="position:relative;height:214px">
      <div class="abs" style="left:73px;top:7px">${svg('wyrm', { n: 30, cell: 6.7, pal: 'bone', hp: 0.45, seed: 4 })}</div>
      <div class="abs mono" style="left:10px;top:10px;color:${c.ink3};line-height:1.6">SIG −42dB<br>x0.38</div>
      <div class="abs mono" style="right:10px;bottom:8px;color:${c.ink3};text-align:right;line-height:1.6">LAST FED<br>12D AGO</div>
    </div>
    <div class="ppad">
      <div class="ar-d" style="font-size:32px;line-height:1">دودة الدوبامين</div>
      <div class="ar" style="font-size:13px;color:${c.ink2};margin-top:4px">تحفر في آخر الليل، خلف باب مغلق وشاشة مضاءة.</div>
      <div class="row" style="margin-top:12px"><span class="ar" style="font-size:12px;color:${c.ink2}">سلامة الكيان</span><span class="mono" style="font-size:12px">38%</span></div>
      <div style="margin-top:6px">${segBar(25, 10, c.ink, c.line, 9)}</div>
      <div class="row" style="margin-top:10px;align-items:baseline"><span class="ar" style="font-size:13px">يموت بعد</span><span class="doto" style="font-size:24px">53<span class="colon">:</span>17<span class="colon">:</span>41</span></div>
    </div>
  </div>
  <div class="row" style="margin-top:14px"><span class="ar" style="font-size:12px;color:${c.ink2}">الكيانات <b class="mono" style="color:${c.ink}">3/9</b></span><span class="hud">ARCHIVE -></span></div>
  <div style="margin-top:6px">${roster(t, 3, { on: 'bone', dim: 'boneDim' })}</div>
  <div class="spacer"></div>
  <div class="btn tall" style="background:${c.acc};color:${c.accInk}">
    <span class="rtl" style="display:flex;flex-direction:column;align-items:flex-start"><span class="ar-b" style="font-size:19px">أشعر بالرغبة</span><span class="ar" style="font-size:12px;opacity:.75;margin-top:-2px">دقيقة واحدة، وتقتلها</span></span>
    <span class="row ltr" style="gap:8px">${tri(c.accInk)}<span class="hud" style="color:${c.accInk}">URGE / 60s</span></span>
  </div>
  <div class="ar center" style="font-size:13px;color:${c.ink3};margin-top:10px;text-decoration:underline;text-underline-offset:4px">سجّل انتكاسة</div>
`); };

// ---------- 03 BREACH (urge fight) ----------
const ringDots = (r, n, color, a, size) => { let d = ''; for (let i = 0; i < n; i++) { const th = i / n * Math.PI * 2; const x = 150 + Math.cos(th) * r, y = 150 + Math.sin(th) * r; d += `M${(x - size / 2).toFixed(1)} ${(y - size / 2).toFixed(1)}h${size}v${size}h${-size}z`; } return `<path data-ring='${JSON.stringify({ r, n, color, a, size })}' d="${d}" fill="${color}" fill-opacity="${a}"/>`; };
const breach = () => { const t = 'blood', c = T[t]; return screen(t, '03 — Breach (Urge Fight)', `
  <div class="titlebar" style="color:${c.ink}"><i style="background:${c.line}"></i><span>SYN / BREACH</span><i style="background:${c.line}"></i></div>
  <div class="log mono" style="color:${c.ink3}">URGE DETECTED // 23:14:07 // CELL 03 // SUBJ SZ-0<br>SOURCE: LATE NIGHT + BED + PHONE // CONF 0.87<br>PROTOCOL: BOX-4 // CYCLES 4 // EST 01:04<br>STATUS: ENTITY FEEDING // DO NOT LOOK AWAY<br>NOTE: IT PEAKS. THEN IT BREAKS. [##########......] 62%</div>
  <div style="position:relative;height:300px;margin:8px auto 0;width:300px">
    <svg class="abs" width="300" height="300" viewBox="0 0 300 300" style="left:0;top:0">
      ${ringDots(146, 96, c.ink3, 0.9, 2.4)}
      ${ringDots(124, 72, c.ink3, 0.45, 1.6)}
      <circle cx="150" cy="150" r="132" fill="none" stroke="${c.acc}" stroke-width="2"/>
      <circle cx="150" cy="150" r="132" fill="none" stroke="${c.acc}" stroke-opacity=".18" stroke-width="10"/>
    </svg>
    <div class="abs" style="left:59px;top:59px">${svg('urge', { n: 26, cell: 7, pal: 'blood', hp: 0.62, seed: 11 })}</div>
    <span class="abs hud rl" style="left:122px;top:-3px;width:56px;color:${c.acc};background:${c.bg}">IN · 4</span>
    <span class="abs hud rl" style="right:-18px;top:144px;width:44px;color:${c.ink3};background:${c.bg}">HOLD</span>
    <span class="abs hud rl" style="left:122px;bottom:-4px;width:56px;color:${c.ink3};background:${c.bg}">OUT · 4</span>
    <span class="abs hud rl" style="left:-18px;top:144px;width:44px;color:${c.ink3};background:${c.bg}">HOLD</span>
  </div>
  <div class="row" style="margin-top:14px;align-items:center;justify-content:center;gap:22px">
    <span class="ar-d" style="font-size:66px;line-height:1">شهيق</span>
    <span class="doto" style="font-size:66px;line-height:1;color:${c.acc}">03</span>
  </div>
  <div class="row" style="margin-top:6px;align-items:center"><span class="ar" style="font-size:12px;color:${c.ink2}">دورة 2 من 4</span><span style="width:220px">${segBar(4, 2, c.acc, c.line, 5)}</span></div>
  <div class="bars" style="margin-top:16px">
    <div class="brow"><span class="hud" style="color:${c.ink}">URGE:</span>${segBar(20, 13, c.ink2, c.line, 10)}<span class="mono">64 %</span></div>
    <div class="brow"><span class="hud" style="color:${c.ink}">CONTROL:</span>${segBar(20, 8, c.acc, c.line, 10)}<span class="mono">41 %</span></div>
  </div>
  <p class="ar center" style="font-size:13px;color:${c.ink2};margin-top:14px">تنفّس مع الدائرة. كل نفَس يأكل منه.<br>لا تنظر إلى أي شاشة أخرى.</p>
  <div class="spacer"></div>
  <div class="btn ghost" style="border-color:${c.line};color:${c.ink3}"><span class="ar" style="margin:auto">انسحاب</span></div>
`); };

// ---------- 04 NEUTRALIZED ----------
const spark = (vals, c) => `<div class="spark">${vals.map((v, i) => `<div class="sc"><div class="sbar">${Array.from({ length: v }, () => `<i style="background:${i === vals.length - 1 ? c.acc : c.ink3}"></i>`).join('')}</div><span class="mono" style="color:${c.ink3}">${'SMTWTFS'[i]}</span></div>`).join('')}</div>`;
const neutral = () => { const t = 'blood', c = T[t]; return screen(t, '04 — Threat Neutralized', `
  <div class="hud row"><span style="color:${c.ink}">THREAT NEUTRALIZED</span><span style="color:${c.acc}">#18</span></div>
  <div class="hair" style="background:${c.line};margin-top:8px"></div>
  <div class="center" style="margin-top:8px;height:262px;position:relative">
    <div class="abs" style="left:65px;top:0">${svg('urge', { n: 26, cell: 9.2, pal: 'blood', scatter: 0.8, hp: 0.3, seed: 18 })}</div>
  </div>
  <div class="ar-d center" style="font-size:50px;line-height:1;margin-top:6px">الموجة انكسرت.</div>
  <p class="ar center" style="color:${c.ink2};margin-top:8px">رغبة رقم 18. كل موجة تقتلها تعود أضعف.</p>
  <div class="stats" style="margin-top:16px">
    ${[['01<span class="colon">:</span>04', 'مدة المعركة'], ['18', 'رغبات مقتولة'], ['−32%', 'شدّة الرغبة']].map(([v, l], i) => `<div class="stat" style="border-color:${c.line}"><span class="doto" style="font-size:28px;line-height:1;direction:ltr;${i === 2 ? `color:${c.acc}` : ''}">${v}</span><span class="ar" style="font-size:11px;color:${c.ink3}">${l}</span></div>`).join('')}
  </div>
  <div class="panel" style="margin-top:12px;border-color:${c.line};background:${c.panel}">
    <div class="ppad">
      <div class="row"><span class="ar" style="font-size:12px;color:${c.ink2}">شدّة الرغبة · آخر 7 أيام</span><span class="hud" style="color:${c.acc}">DECAYING</span></div>
      ${spark([11, 12, 9, 10, 7, 6, 4], c)}
    </div>
  </div>
  <div class="spacer"></div>
  <div class="btn" style="background:${c.ink};color:${c.bg}"><span class="ar-b">رجوع إلى الاحتواء</span><span class="hud" style="color:${c.bg};opacity:.6">RETURN -></span></div>
`); };

// ---------- 05 TERMINATED dossier ----------
const wave = (w, h, c) => { let d = `M0 ${h / 2}`; for (let x = 0; x <= w; x += 3) { const k = Math.max(0, 1 - x / (w * 0.78)); const y = h / 2 + Math.sin(x / 5.5) * k * (h / 2 - 2) * (0.6 + 0.4 * Math.sin(x / 23)); d += `L${x} ${y.toFixed(1)}`; } return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${d}" fill="none" stroke="${c}" stroke-width="1.5"/></svg>`; };
const stars = (n, of, c, off) => Array.from({ length: of }, (_, i) => `<svg width="12" height="12" viewBox="0 0 6 6"><path d="M2 0h2v2h2v2H4v2H2V4H0V2h2z" fill="${i < n ? c : off}"/></svg>`).join('');
const dossier = () => { const t = 'ice', c = T[t]; return screen(t, '05 — Entity Terminated', `
  <div class="doss" style="border-color:${c.line}">
    <div class="row dh" style="border-color:${c.line}"><span class="silk" style="font-size:13px;color:${c.ink2}">ENTITY E-03</span><span class="mono" style="color:${c.ink3}">FILE 03/09</span></div>
    <div class="row ltr" style="align-items:stretch;gap:0;border-bottom:1px solid ${c.line}">
      <div style="position:relative;width:206px;height:206px;border-right:1px solid ${c.line}">
        <div class="abs" style="left:12px;top:9px">${svg('hollow', { n: 26, cell: 7, pal: 'ice', scatter: 0.4, hp: 0.5, seed: 3 })}</div>
        <div class="abs stamp" style="left:56px;top:156px;color:${c.acc};border-color:${c.acc}">TERMINATED</div>
      </div>
      <div style="flex:1;padding:12px 12px;display:flex;flex-direction:column;direction:ltr">
        <span class="hud" style="color:${c.ink3}">GUARDED DAY</span>
        <span class="doto" style="font-size:72px;line-height:.9;color:${c.ink2}">07</span>
        <div class="row" style="gap:3px;margin-top:10px;justify-content:flex-start;direction:ltr">${Array.from({ length: 7 }, () => `<i style="width:12px;height:12px;background:${c.ink2};display:block"></i>`).join('')}</div>
        <span class="hud" style="color:${c.ink3};margin-top:8px">7/7 CLEAN</span>
      </div>
    </div>
    ${[['NAME', 'HOLLOW · الجوف'], ['FEEDS ON', 'الفراغ والملل'], ['TIME TO KILL', '07D 00H 00M'], ['URGES SURVIVED', '11'], ['THREAT', stars(2, 3, c.ink2, c.line)]].map(([k, v]) => `<div class="row trow" style="border-color:${c.line}"><span class="silk" style="color:${c.ink2}">${k}</span><span class="tv" style="color:${c.ink}">${v}</span></div>`).join('')}
    <div style="padding:8px 12px 10px"><div class="row hud" style="color:${c.ink3}"><span>VITALS</span><span>SIGNAL LOST</span></div>${wave(334, 34, c.ink2)}</div>
  </div>
  <div class="ar-d" style="font-size:50px;line-height:1;margin-top:16px;color:${c.ink}">الجوف مات.</div>
  <p class="ar" style="color:${c.ink3};margin-top:4px">7 أيام ولم تُطعمه مرة واحدة.</p>
  <div class="row next" style="border-color:${c.line};margin-top:12px">
    <div class="rtl"><div class="ar" style="font-size:13px;color:${c.ink2}">شيء آخر استيقظ</div><div class="hud" style="color:${c.ink3};direction:ltr;text-align:right">E-04 · DOPA-WYRM · DAY 14</div></div>
    <div style="width:44px;height:44px;border:1px solid ${c.acc};display:flex;align-items:center;justify-content:center">${svg('wyrm', { n: 18, cell: 2.2, pal: 'ice', offDots: false })}</div>
  </div>
  <div class="spacer"></div>
  <div class="btn" style="background:${c.ink2};color:${c.bg}"><span class="ar-b">واجه دودة الدوبامين</span><span class="hud" style="color:${c.bg};opacity:.6">ENGAGE -></span></div>
`); };

// ---------- 06 ARCHIVE ----------
const ENT = [
  ['E-01', 'whisperer', 'الهامس', 'THE WHISPERER', 1], ['E-02', 'siren', 'النداهة', 'SIREN', 3], ['E-03', 'hollow', 'الجوف', 'HOLLOW', 7],
  ['E-04', 'wyrm', 'دودة الدوبامين', 'DOPA-WYRM', 14], ['E-05', 'glass', 'المرآة', 'THE GLASS', 30], ['E-06', 'legion', 'الفيلق', 'ECHO-LEGION', 60],
  ['E-07', 'reboot', 'المُعيد', 'REBOOT', 90], ['E-08', 'sovereign', 'الملك القديم', 'SOVEREIGN', 180], ['E-09', 'origin', 'الأصل', 'THE ORIGIN', 365],
];
const archive = () => { const t = 'ice', c = T[t]; return screen(t, '06 — Archive (Bestiary)', `
  <div class="hud row"><span style="color:${c.ink2}">ARCHIVE</span><span>03/09 TERMINATED</span></div>
  <div class="row" style="margin-top:10px;align-items:flex-end">
    <div class="rtl"><div class="ar-d" style="font-size:44px;line-height:1">الأرشيف</div><div class="ar" style="font-size:13px;color:${c.ink3};margin-top:2px">تسعة كيانات. كل واحد يحرس يوماً.</div></div>
    <div class="doto" style="font-size:44px;line-height:.9;color:${c.ink2};direction:ltr">3<span style="color:${c.line}">/9</span></div>
  </div>
  <div class="tl" style="margin-top:16px;position:relative;height:34px;direction:ltr">
    <svg class="abs" width="350" height="20" viewBox="0 0 350 20" style="left:0;top:0">
      <path d="M8 10H342" stroke="${c.line}" stroke-width="2"/><path d="M8 10H${8 + 3 * 41.75 + 0.7 * 41.75}" stroke="${c.ink2}" stroke-width="2"/>
      ${ENT.map((e, i) => { const x = 8 + i * 41.75; const st = i < 3 ? 'd' : i === 3 ? 'c' : 'l'; return st === 'd' ? `<rect x="${x - 4}" y="6" width="8" height="8" fill="${c.ink2}"/>` : st === 'c' ? `<rect x="${x - 6}" y="4" width="12" height="12" fill="${c.bg}" stroke="${c.acc}" stroke-width="2"/>` : `<rect x="${x - 4}" y="6" width="8" height="8" fill="${c.bg}" stroke="${c.line}" stroke-width="1.5"/>`; }).join('')}
    </svg>
    ${ENT.map((e, i) => `<span class="abs mono" style="left:${8 + i * 41.75 - 15}px;width:30px;text-align:center;top:22px;font-size:9px;color:${i > 3 ? c.ink3 : c.ink2}">${e[4]}</span>`).join('')}
  </div>
  <div class="agrid" style="margin-top:12px">
    ${ENT.map(([id, d, ar, en, day], i) => { const st = i < 3 ? 'dead' : i === 3 ? 'cur' : 'lock'; return `<div class="tile" style="border-color:${st === 'cur' ? c.acc : c.line};background:${st === 'cur' ? c.panel : 'transparent'}">
      <div class="row hud" style="color:${st === 'lock' ? c.ink3 : c.ink2}"><span>${id}</span><span>D${String(day).padStart(2, '0')}</span></div>
      <div class="tspr">${svg(d, { n: 18, cell: 4.4, pal: st === 'dead' ? 'iceDim' : 'ice', locked: st === 'lock', seed: 50 + i, hp: st === 'cur' ? 0.38 : 1 })}${st === 'dead' ? `<div class="abs tstamp" style="color:${c.acc};border-color:${c.acc}">TERMINATED</div>` : ''}</div>
      <div class="ar-d tname" style="color:${st === 'lock' ? c.ink3 : c.ink}">${st === 'lock' ? 'مجهول' : ar}</div>
      <div class="hud" style="color:${st === 'cur' ? c.acc : c.ink3}">${st === 'dead' ? 'KILLED' : st === 'cur' ? 'ACTIVE · 38%' : 'CLASSIFIED'}</div>
    </div>`; }).join('')}
  </div>
  <div class="spacer"></div>
  <div class="stats">
    ${[['18', 'رغبة مقتولة'], ['21', 'أفضل سلسلة'], ['04', 'جولات']].map(([v, l]) => `<div class="stat" style="border-color:${c.line}"><span class="doto" style="font-size:26px;line-height:1;color:${c.ink2};direction:ltr">${v}</span><span class="ar" style="font-size:11px;color:${c.ink3}">${l}</span></div>`).join('')}
  </div>
`); };

// ---------- 07 REBOOT (relapse) ----------
const reboot = () => { const t = 'blood', c = T[t]; return screen(t, '07 — System Reboot (Relapse)', `
  <div class="hud row"><span style="color:${c.ink}">SYSTEM REBOOT</span><span>BREACH LOGGED 02:13</span></div>
  <div class="hair" style="background:${c.line};margin-top:8px"></div>
  <div class="row ltr" style="align-items:flex-end;margin-top:10px">
    <div style="position:relative;width:190px;height:118px">
      <span class="abs doto" style="left:-3px;top:0;font-size:150px;line-height:.8;color:${c.acc};opacity:.75">00</span>
      <span class="abs doto" style="left:3px;top:0;font-size:150px;line-height:.8;color:#7fd3ff;opacity:.35">00</span>
      <span class="abs doto" style="left:0;top:0;font-size:150px;line-height:.8;color:${c.ink}">00</span>
    </div>
    <div class="rtl" style="text-align:right;padding-bottom:6px"><div class="ar-d" style="font-size:28px;line-height:1">يوم</div><div class="hud" style="color:${c.ink3};direction:ltr;margin-top:4px">RUN #5 STARTS NOW</div></div>
  </div>
  <div class="ar-d" style="font-size:38px;line-height:1.05;margin-top:16px">جولة خسرتها.<br>الحرب لم تنتهِ.</div>
  <p class="ar" style="color:${c.ink2};margin-top:8px">العدّاد رجع للصفر، لكن ما بنيته لا يُمحى.</p>
  <div class="panel" style="margin-top:14px;border-color:${c.line};background:${c.panel}">
    <div class="phead" style="background:transparent;color:${c.ink2};border-bottom:1px solid ${c.line}"><span>RETAINED</span><span class="ar" style="font-size:12px;letter-spacing:0">ما يبقى معك</span></div>
    <div class="ppad" style="padding-top:4px;padding-bottom:4px">
      <div class="row krow" style="border-color:${c.line}"><span class="ar">كيانات مقتولة</span><span class="row ltr" style="gap:6px">${['whisperer', 'siren', 'hollow'].map(d => `<span style="display:block;width:26px;height:26px;border:1px solid ${c.line}">${svg(d, { n: 13, cell: 2, offDots: false, pal: 'blood' })}</span>`).join('')}<b class="mono" style="font-size:13px;margin-left:4px">3/9</b></span></div>
      <div class="row krow" style="border-color:${c.line}"><span class="ar">أفضل رقم</span><span class="mono" style="font-size:13px">21 DAYS</span></div>
      <div class="row krow" style="border:0"><span class="ar">رغبات قتلتها</span><span class="mono" style="font-size:13px">18</span></div>
    </div>
  </div>
  <div class="ar" style="font-weight:600;margin-top:16px">ما الذي سبقها؟ <span style="font-weight:400;color:${c.ink3};font-size:12px">اختياري</span></div>
  <div class="chips" style="margin-top:8px">
    ${['سهر', 'ملل', 'وحدة', 'توتر', 'الهاتف في السرير'].map((x, i) => `<span class="chip sm" style="border-color:${[0, 4].includes(i) ? c.acc : c.line};color:${[0, 4].includes(i) ? c.ink : c.ink2}">${x}</span>`).join('')}
  </div>
  <div class="insight" style="border-color:${c.acc};background:${c.panel};margin-top:12px">
    <span class="hud" style="color:${c.acc}">PATTERN</span>
    <span class="ar" style="font-size:13px">3 من آخر 4 انتكاسات بعد منتصف الليل. الهاتف خارج الغرفة الليلة.</span>
  </div>
  <div class="spacer"></div>
  <div class="btn" style="background:${c.acc};color:${c.accInk}"><span class="ar-b">ابدأ من جديد</span><span class="hud" style="color:${c.accInk};opacity:.7">REBOOT -></span></div>
`); };

// ---------- COVER ----------
const phone = inner => `<div class="phone"><div class="island"></div>${inner}</div>`;
const cover = (h, b, d) => `<section class="board cover" data-name="00 — Cover">
  <div class="cv-head">
    <div><div class="doto" style="font-size:96px;line-height:.85;color:#1b1916">SUBJECT ZERO</div>
    <div class="ar-d" style="font-size:34px;color:#1b1916;margin-top:14px;direction:rtl;text-align:left">بروتوكول احتواء. تسعة كيانات. سنة واحدة.</div></div>
    <div class="silk" style="font-size:12px;line-height:1.9;color:#4c473f;text-align:right">QUIT PROTOCOL — MOBILE<br>STANDBY / BREACH / ARCHIVE<br>v1.0 · 2026</div>
  </div>
  <div class="cv-phones">${phone(h)}${phone(b)}${phone(d)}</div>
  <div class="cv-foot silk"><span>01 STANDBY — YOU ARE STARVING IT</span><span>02 BREACH — IT IS FEEDING ON YOU</span><span>03 ARCHIVE — IT IS DEAD</span></div>
</section>`;

// ---------- SYSTEM SHEET ----------
const sw = (hex, name) => `<div class="swatch"><div style="height:64px;background:${hex};border:1px solid rgba(0,0,0,.12)"></div><span class="mono" style="color:#1b1916">${hex.toUpperCase()}</span><span class="mono" style="color:#847d6f">${name}</span></div>`;
const system = () => `<section class="board sys" data-name="00 — System">
  <div class="sys-head"><div class="doto" style="font-size:56px;line-height:.9">SYSTEM</div><div class="silk" style="font-size:12px;color:#4c473f;text-align:right">ONE NUMBER · ONE MONSTER · ONE BUTTON</div></div>
  <div class="sys-grid">
    <div class="sys-col">
      <div class="sys-t silk">01 — MODES</div>
      ${[['bone', 'STANDBY', 'الوضع العادي: أنت تُجوّعه', 'Intake · Home'], ['blood', 'BREACH', 'إنذار: هو يتغذّى عليك', 'Urge · Win · Relapse'], ['ice', 'ARCHIVE', 'ملفات الكيانات الميتة', 'Kill · Bestiary']].map(([k, n, ar, use]) => `<div class="mode">
        <div class="row" style="align-items:baseline"><span class="silk" style="font-size:14px">${n}</span><span class="mono" style="color:#847d6f">${use}</span></div>
        <div class="ar" style="font-size:13px;color:#4c473f;text-align:right">${ar}</div>
        <div class="sws">${sw(T[k].bg, 'bg')}${sw(T[k].panel, 'panel')}${sw(T[k].line, 'line')}${sw(T[k].ink, 'ink')}${sw(T[k].ink3, 'muted')}${sw(T[k].acc, 'signal')}</div>
      </div>`).join('')}
    </div>
    <div class="sys-col">
      <div class="sys-t silk">02 — TYPE</div>
      <div class="type"><span class="doto" style="font-size:72px;line-height:.85">12 · 53<span class="colon">:</span>17</span><span class="mono">DOTO 900 — counters, timers, codes. Numbers only feel like readouts.</span></div>
      <div class="type"><span class="ar-d" style="font-size:44px;line-height:1;direction:rtl;text-align:left">الموجة انكسرت.</span><span class="mono">HANDJET 700–800 — Arabic display. Pixel Arabic, same grid as the monsters.</span></div>
      <div class="type"><span class="ar" style="font-size:16px;direction:rtl;text-align:left">كل ساعة تصمد فيها تأكل منها، حتى تموت.</span><span class="mono">READEX PRO 400/600 — Arabic body. Calm, legible, never shouting.</span></div>
      <div class="type"><span class="silk" style="font-size:16px">SYN / BREACH · E-04</span><span class="mono">SILKSCREEN — HUD labels. English, uppercase, always small.</span></div>
      <div class="type"><span class="mono" style="font-size:14px;color:#1b1916">LAXA.IAP.942 · 07:42:19</span><span class="mono">GEIST MONO — telemetry and data rows.</span></div>
      <div class="sys-t silk" style="margin-top:22px">04 — COMPONENTS</div>
      <div class="comp">
        <div class="btn" style="background:#d23a1e;color:#f4ede3;width:250px"><span class="ar-b" style="font-size:16px">أشعر بالرغبة</span><span class="hud" style="color:#f4ede3">URGE / 60s</span></div>
        <div class="btn" style="background:#1b1916;color:#d6d0c2;width:250px"><span class="ar-b" style="font-size:16px">ابدأ الاحتواء</span><span class="hud" style="color:#d6d0c2;opacity:.6">BEGIN -></span></div>
        <div style="width:250px">${segBar(25, 10, '#1b1916', '#a9a190', 9)}<div class="mono" style="color:#847d6f;margin-top:4px">INTEGRITY BAR — 25 cells, one cell ~ 1 hour</div></div>
        <div class="row" style="gap:6px;justify-content:flex-start;direction:ltr">${roster('bone', 3, { on: 'bone', dim: 'boneDim' }).replace('class="roster"', 'class="roster" style="width:340px"')}</div>
        <div class="mono" style="color:#847d6f">ROSTER CELL — killed (struck) · active (signal) · locked (static)</div>
      </div>
    </div>
    <div class="sys-col">
      <div class="sys-t silk">03 — ENTITIES</div>
      <div class="ents">${ENT.map(([id, d, ar, en, day]) => `<div class="ent"><div style="background:#cdc6b6;padding:6px;display:flex;justify-content:center">${svg(d, { n: 26, cell: 5, pal: 'bone' })}</div><div class="row hud" style="margin-top:6px"><span>${id}</span><span>DAY ${day}</span></div><div class="silk" style="font-size:10px">${en}</div><div class="ar-d" style="font-size:22px;line-height:1;text-align:right">${ar}</div></div>`).join('')}</div>
      <div class="sys-t silk" style="margin-top:22px">05 — RULES</div>
      <ol class="rules ar">
        <li>رقم واحد، وحش واحد، زر واحد. كل شاشة تجيب على سؤال واحد.</li>
        <li>لا صور، لا أجساد، لا محفّزات. الوحوش نقاط فقط.</li>
        <li>الانتكاسة ليست عاراً: العدّاد يرجع، الإنجاز يبقى.</li>
        <li>اللون الأحمر لا يظهر إلا حين يكون هناك خطر أو فعل.</li>
        <li>الإنجليزية للنظام (HUD)، العربية للإنسان.</li>
      </ol>
    </div>
  </div>
</section>`;

// ---------- page ----------
const css = `
${fs.readFileSync(new URL('./fonts/fonts.css', import.meta.url), 'utf8')}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#3a3734;padding:60px;display:flex;flex-direction:column;gap:80px;width:max-content;font-family:'Readex Pro',sans-serif;-webkit-font-smoothing:antialiased}
.strip{display:flex;gap:60px;align-items:flex-start}
.screen{width:${W}px;height:${H}px;position:relative;overflow:hidden;display:flex;flex-direction:column;flex:none}
.bgfx{position:absolute;left:0;top:0;width:${W}px;height:${H}px}
.bgfx svg{display:block}
.abs{position:absolute}
.sb{position:relative;height:50px;display:flex;justify-content:space-between;align-items:center;padding:4px 26px 0 34px;direction:ltr;flex:none}
.sb-time{font-family:'Readex Pro';font-weight:600;font-size:16px}
.sb-icons{display:flex;gap:6px;align-items:center}
.sb-icons svg{display:block}
.home{position:absolute;left:128px;bottom:8px;width:134px;height:5px;border-radius:3px}
.body{position:relative;flex:1;display:flex;flex-direction:column;padding:4px 20px 34px;direction:rtl}
.row{display:flex;justify-content:space-between;align-items:center}
.ltr{direction:ltr}.rtl{direction:rtl}
.center{text-align:center;justify-content:center}
.spacer{flex:1}
.hud{font-family:'Silkscreen';font-size:10px;letter-spacing:.04em;text-transform:uppercase;direction:ltr;white-space:nowrap}
.silk{font-family:'Silkscreen';letter-spacing:.04em;font-size:11px;white-space:nowrap}
.mono{font-family:'Geist Mono';font-size:10px;letter-spacing:.02em;white-space:nowrap;direction:ltr;unicode-bidi:isolate}
.doto{font-family:'Doto';font-weight:900;direction:ltr;unicode-bidi:isolate;white-space:nowrap}
.colon{font-family:'Silkscreen';font-weight:400;font-size:.62em;vertical-align:.18em;margin:0 .04em}
.ar{font-family:'Readex Pro';font-size:15px;line-height:1.65;font-weight:400}
.ar-d{font-family:'Handjet';font-weight:700;letter-spacing:0}
.ar-b{font-family:'Readex Pro';font-weight:600;font-size:17px}
.hair{height:1px;width:100%}
.panel{border:1px solid;display:flex;flex-direction:column}
.phead{display:flex;justify-content:space-between;align-items:center;height:26px;padding:0 10px;font-family:'Silkscreen';font-size:10px;letter-spacing:.04em;direction:ltr}
.ppad{padding:10px 12px 12px}
.seg{display:flex;gap:2px;direction:ltr;width:100%}
.seg i{flex:1;display:block}
.btn{height:58px;display:flex;justify-content:space-between;align-items:center;padding:0 18px;flex:none}
.btn.tall{height:66px}
.btn.ghost{border:1px solid;height:50px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{border:1px solid;padding:7px 14px;font-family:'Readex Pro';font-size:14px;line-height:1.3}
.chip.sm{padding:5px 12px;font-size:13px}
.roster{display:flex;gap:4px;direction:ltr;justify-content:space-between}
.roster .cell{width:34px;height:34px;border:1px solid;position:relative;display:flex;align-items:center;justify-content:center;flex:none}
.roster .cell svg{display:block}
.q{font-family:'Silkscreen';font-size:12px;left:0;right:0;top:9px;text-align:center}
.titlebar{display:flex;align-items:center;gap:12px;font-family:'Silkscreen';font-size:15px;letter-spacing:.05em;margin-top:4px;direction:ltr}
.titlebar i{flex:1;height:1px;display:block}
.log{font-size:8.6px;line-height:1.55;margin-top:10px;direction:ltr;white-space:nowrap}
.bars{display:flex;flex-direction:column;gap:8px;direction:ltr}
.brow{display:grid;grid-template-columns:70px 1fr 40px;gap:10px;align-items:center}
.brow .mono{font-size:11px;text-align:right}
.stats{display:flex;gap:8px}
.stat{flex:1;border:1px solid;padding:10px 10px 8px;display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.spark{display:flex;gap:10px;align-items:flex-end;height:112px;margin-top:12px;direction:ltr}
.sc{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;justify-content:flex-end;height:100%}
.sbar{width:100%;display:flex;flex-direction:column;gap:2px}
.sbar i{display:block;height:6px}
.doss{border:1px solid;margin-top:4px}
.dh{height:34px;padding:0 12px;border-bottom:1px solid;direction:ltr}
.trow{height:30px;padding:0 12px;border-bottom:1px solid;direction:ltr}
.trow .silk{font-size:10px}
.tv{font-family:'Readex Pro';font-size:13px;display:flex;gap:3px;align-items:center}
.stamp{font-family:'Silkscreen';font-size:14px;border:2px solid;padding:3px 8px;transform:rotate(-8deg);background:rgba(5,8,11,.85);letter-spacing:.06em}
.next{border:1px solid;padding:10px 12px;direction:rtl}
.agrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;direction:ltr}
.tile{border:1px solid;padding:7px 8px 8px;display:flex;flex-direction:column;gap:3px;height:156px}
.tspr{position:relative;display:flex;justify-content:center;margin:2px 0}
.tspr svg{display:block}
.tstamp{font-family:'Silkscreen';font-size:9px;border:1.5px solid;padding:1px 4px;transform:rotate(-12deg);top:30px;left:6px;background:rgba(5,8,11,.85)}
.tname{font-size:19px;line-height:1;direction:rtl;text-align:right;margin-top:2px;white-space:nowrap}
.tile .hud{font-size:8.5px}
.krow{height:40px;border-bottom:1px solid}
.krow .ar{font-size:13px}
.rl{text-align:center;display:block}
.live{display:block;width:6px;height:6px}
.insight{border-right:3px solid;padding:10px 12px;display:flex;flex-direction:column;gap:2px}
/* boards */
.board{background:#e7e3da;color:#1b1916;flex:none}
.cover{width:1560px;padding:80px 90px 70px;display:flex;flex-direction:column;gap:56px;background:#e9e6df}
.cv-head{display:flex;justify-content:space-between;align-items:flex-end}
.cv-phones{display:flex;justify-content:space-between}
.phone{width:418px;height:872px;border-radius:62px;background:#141312;padding:14px;position:relative;box-shadow:0 30px 60px rgba(0,0,0,.25), inset 0 0 0 2px #2c2a27}
.phone>.screen{border-radius:48px}
.island{position:absolute;left:150px;top:26px;width:118px;height:34px;border-radius:20px;background:#000;z-index:5}
.cv-foot{display:flex;justify-content:space-between;font-size:12px;color:#4c473f;letter-spacing:.06em}
.sys{width:1560px;padding:70px 80px 80px}
.sys-head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #1b1916;padding-bottom:16px}
.sys-grid{display:grid;grid-template-columns:440px 1fr 470px;gap:50px;margin-top:30px}
.sys-col{display:flex;flex-direction:column;gap:14px}
.sys-t{font-size:12px;color:#847d6f;border-bottom:1px solid #a9a190;padding-bottom:6px}
.mode{display:flex;flex-direction:column;gap:6px;padding-bottom:12px}
.sws{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:4px}
.swatch{display:flex;flex-direction:column;gap:3px}
.swatch .mono{font-size:9px}
.type{display:flex;flex-direction:column;gap:6px;border-bottom:1px solid #cdc6b6;padding-bottom:12px}
.type .mono{color:#847d6f;white-space:normal}
.comp{display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.ents{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.ent{display:flex;flex-direction:column;gap:3px}
.ent svg{display:block}
.rules{padding-right:20px;font-size:14px;line-height:1.7;direction:rtl;display:flex;flex-direction:column;gap:6px}
`;

const screens = [intake(), home(), breach(), neutral(), dossier(), archive(), reboot()];
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Subject Zero — Screens</title><style>${css}</style></head><body>
${cover(home(), breach(), dossier())}
${system()}
<div class="strip">${screens.join('\n')}</div>
</body></html>`;
fs.writeFileSync(new URL('./board.html', import.meta.url), html);
console.log('board.html', (html.length / 1e6).toFixed(2), 'MB');
