const FW={100:'Thin',200:'ExtraLight',300:'Light',400:'Regular',500:'Medium',600:'SemiBold',700:'Bold',800:'ExtraBold',900:'Black'};
const sty=(f,w)=>f==='Silkscreen'?(w>=700?'Bold':'Regular'):(FW[w]||'Regular');
const pt=h=>{const[c,a]=h.split(':');return{type:'SOLID',color:{r:parseInt(c.slice(1,3),16)/255,g:parseInt(c.slice(3,5),16)/255,b:parseInt(c.slice(5,7),16)/255},opacity:a?+a:1}};
const F=new Set(['Readex Pro|SemiBold']);
for(const[d]of DS)(function w(n){if(n.t==='x')F.add(n.f+'|'+sty(n.f,n.wt));(n.K||[]).forEach(w)})(d);
await Promise.all([...F].map(k=>{const[family,style]=k.split('|');return figma.loadFontAsync({family,style})}));
const q=v=>Math.round(v*100)/100;
const svgOf=(w,h,b)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${b}</svg>`;
function sprite(n){const P={1:'',2:'',3:'',4:''};let d='';const{N,c,s,o,pad,g}=n;for(let i=0;i<N*N;i++){const x=i%N,y=(i/N)|0,t=+g[i],px=pad+x*c,py=pad+y*c;if(!t){if(n.off)d+=`M${q(px+c/2-.8)} ${q(py+c/2-.8)}h1.6v1.6h-1.6z`;continue}P[t]+=`M${q(px+o)} ${q(py+o)}h${s}v${s}h${-s}z`}for(const[t,x,y,z]of n.p)P[t]+=`M${x} ${y}h${z}v${z}h${-z}z`;const W=N*c+pad*2;let b='';if(d)b+=`<path d="${d}" fill="${n.P[0]}" fill-opacity="${n.P[1]}"/>`;for(const t of[1,2,3,4])if(P[t])b+=`<path d="${P[t]}" fill="${n.P[t+1]}"/>`;return svgOf(W,W,b)}
function pat(n){let d='';if(n.k==='grid'){for(let x=n.step;x<n.w;x+=n.step)d+=`M${x} 0V${n.h}`;for(let y=n.step;y<n.h;y+=n.step)d+=`M0 ${y}H${n.w}`;return svgOf(n.w,n.h,`<path d="${d}" stroke="${n.color}" stroke-opacity="${n.alpha}" stroke-width="1" fill="none"/>`)}const z=n.size;for(let y=n.step/2;y<n.h;y+=n.step)for(let x=n.step/2;x<n.w;x+=n.step)d+=`M${q(x-z/2)} ${q(y-z/2)}h${z}v${z}h${-z}z`;return svgOf(n.w,n.h,`<path d="${d}" fill="${n.color}" fill-opacity="${n.alpha}"/>`)}
function ring(r){let d='';for(let i=0;i<r.n;i++){const th=i/r.n*Math.PI*2,x=150+Math.cos(th)*r.r,y=150+Math.sin(th)*r.r;d+=`M${q(x-r.size/2)} ${q(y-r.size/2)}h${r.size}v${r.size}h${-r.size}z`}return`<path d="${d}" fill="${r.color}" fill-opacity="${r.a}"/>`}
const sbSvg=c=>svgOf(72,12,`<path d="M0 9h3v3H0zM5 7h3v5H5zM10 4h3v8h-3zM15 1h3v11h-3z" fill="${c}"/><g transform="translate(24 1)"><path d="M8 11 5.6 8.4a3.4 3.4 0 0 1 4.8 0zM3.3 6.1a6.6 6.6 0 0 1 9.4 0l-1.2 1.2a4.9 4.9 0 0 0-7 0zM1 3.8a9.9 9.9 0 0 1 14 0l-1.2 1.2a8.2 8.2 0 0 0-11.6 0z" fill="${c}"/></g><g transform="translate(46 0)"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="${c}" stroke-opacity=".45"/><rect x="2" y="2" width="16" height="8" rx="1.6" fill="${c}"/><path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4z" fill="${c}" fill-opacity=".45"/></g>`);
function place(node,n,p){p.appendChild(node);node.x=n.x;node.y=n.y;if(typeof n.n==='string')node.name=n.n;return node}
function fromSvg(str,n,p){const f=figma.createNodeFromSvg(str);f.fills=[];f.clipsContent=false;return place(f,n,p)}
function mk(n,p){
if(n.t==='x'){const t=figma.createText();t.fontName={family:n.f,style:sty(n.f,n.wt)};t.characters=n.s;t.fontSize=n.fs;t.fills=[pt(n.c)];if(n.ls)t.letterSpacing={unit:'PIXELS',value:n.ls};if(n.u)t.textDecoration='UNDERLINE';t.textAlignHorizontal={L:'LEFT',R:'RIGHT',C:'CENTER'}[n.a];p.appendChild(t);if(n.wr){t.lineHeight={unit:'PIXELS',value:n.lh};t.textAutoResize='HEIGHT';t.resize(n.w,n.h);t.x=n.x;t.y=n.y}else{t.textAutoResize='WIDTH_AND_HEIGHT';t.x=n.a==='R'?n.x+n.w-t.width:n.a==='C'?n.x+(n.w-t.width)/2:n.x;t.y=n.y+(n.h-t.height)/2}return t}
if(n.t==='p')return fromSvg(sprite(n),n,p);
if(n.t==='g')return fromSvg(pat(n),n,p);
if(n.t==='s'){let v=n.v;(n.rings||[]).forEach((r,i)=>{v=v.replace(`<!--R${i}-->`,ring(r))});if(!v.includes('xmlns='))v=v.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');return fromSvg(v,n,p)}
if(n.t==='sb'){const f=figma.createFrame();f.resize(n.w,n.h);f.fills=[];f.clipsContent=false;place(f,n,p);const t=figma.createText();t.fontName={family:'Readex Pro',style:'SemiBold'};t.characters='9:41';t.fontSize=16;t.fills=[pt(n.c)];f.appendChild(t);t.x=34;t.y=27-t.height/2;const ic=figma.createNodeFromSvg(sbSvg(n.c));ic.fills=[];ic.name='icons';f.appendChild(ic);ic.x=n.w-26-72;ic.y=21;return f}
if(n.t==='seg'){const f=figma.createFrame();f.resize(n.w,n.h);f.fills=[];f.clipsContent=false;place(f,n,p);f.name='segment-bar';const cw=(n.w-(n.n-1)*2)/n.n;for(let i=0;i<n.n;i++){const r=figma.createRectangle();r.resize(cw,n.h);f.appendChild(r);r.x=i*(cw+2);r.y=0;const on=i<n.on;r.fills=on?[pt(n.c)]:[];r.strokes=[pt(on?n.c:n.off)];r.strokeWeight=1;r.strokeAlign='INSIDE';r.name=on?'cell/on':'cell/off'}return f}
if(n.t==='cl'){const src=figma.currentPage.children.find(c=>c.name===n.ref);const c=src.clone();place(c,n,p);c.cornerRadius=n.r;c.clipsContent=true;return c}
const f=figma.createFrame();f.resize(Math.max(n.w,.01),Math.max(n.h,.01));f.fills=n.bg?[pt(n.bg)]:[];f.clipsContent=!!n.clip;
if(n.st){const[c,t,r,b,l]=n.st;f.strokes=[pt(c)];f.strokeAlign='INSIDE';if(t===r&&r===b&&b===l)f.strokeWeight=t;else{f.strokeTopWeight=t;f.strokeRightWeight=r;f.strokeBottomWeight=b;f.strokeLeftWeight=l}}
if(n.r)f.cornerRadius=n.r;if(n.o!=null)f.opacity=n.o;
if(n.sh)f.effects=[{type:'DROP_SHADOW',color:{r:0,g:0,b:0,a:.25},offset:{x:0,y:30},radius:60,spread:0,visible:true,blendMode:'NORMAL'}];
place(f,n,p);
if(n.rot){const a=n.rot*Math.PI/180,cx=n.x+n.w/2,cy=n.y+n.h/2;f.rotation=n.rot;f.x=cx-(n.w/2*Math.cos(a)+n.h/2*Math.sin(a));f.y=cy-(-n.w/2*Math.sin(a)+n.h/2*Math.cos(a))}
(n.K||[]).forEach(k=>mk(k,f));return f}
figma.currentPage.name='SUBJECT ZERO';
const out=[];
for(const[d,at]of DS){const old=figma.currentPage.children.find(c=>c.name===d.n);if(old)old.remove();const root=mk(d,figma.currentPage);root.x=at[0];root.y=at[1];let count=0;root.findAll(()=>{count++;return false});out.push({id:root.id,name:root.name,nodes:count})}
return out;
