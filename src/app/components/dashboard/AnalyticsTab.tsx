import { useState } from 'react';
import { Trophy, TrendingUp, Target, Search, ChevronDown, X } from 'lucide-react';

export const AnalyticsTab = () => {
  const [board, setBoard] = useState<'scouts' | 'players'>('players');
  const [removedScouts, setRemovedScouts] = useState<string[]>([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [country, setCountry] = useState('All countries');
  const [hoverPt, setHoverPt] = useState<{ s:number; i:number } | null>(null);
  const COUNTRIES = ['All countries','Ghana','Nigeria','Senegal','Kenya'];

  // ── Talent map (scatter) — reversed age axis: younger → right so top-right = priority ──
  const TALENT = [
    { n:'Sory Traore',    age:17, r:8.6, v:5 },
    { n:'Kofi Mensah',    age:18, r:8.4, v:4 },
    { n:'Yaw Boateng',    age:18, r:8.3, v:3 },
    { n:'Musa Kamara',    age:17, r:8.2, v:4 },
    { n:'Amadou Sarr',    age:19, r:8.1, v:2 },
    { n:'Ibrahim Diallo', age:18, r:8.0, v:2 },
    { n:'Emmanuel Adjei', age:20, r:7.9, v:3 },
    { n:'Lamine Cissé',   age:17, r:7.6, v:1 },
    { n:'Daniel Osei',    age:21, r:7.7, v:3 },
    { n:'Prince Owusu',   age:19, r:7.4, v:2 },
    { n:'Cheick Konaté',  age:16, r:7.2, v:1 },
    { n:'Ousmane Bah',    age:22, r:7.0, v:2 },
    { n:'Joseph Njoroge', age:20, r:6.8, v:1 },
    { n:'Wekesa Omondi',  age:23, r:6.5, v:2 },
  ];
  const AGE_MIN=16, AGE_MAX=23, R_MIN=6, R_MAX=9;
  const W=560, H=300, mL=40, mR=18, mT=16, mB=34;
  const pL=mL, pR=W-mR, pT=mT, pB=H-mB, pW=pR-pL, pH=pB-pT;
  const sx=(age:number)=> pL + ((AGE_MAX-age)/(AGE_MAX-AGE_MIN))*pW; // reversed: younger to the right
  const sy=(rt:number)=> pB - ((rt-R_MIN)/(R_MAX-R_MIN))*pH;
  const rad=(vd:number)=> 4 + vd*1.1;
  const isPriority=(age:number,rt:number)=> age<=19 && rt>=7.8;
  const zoneX=sx(19), zoneY=pT, zoneW=pR-zoneX, zoneH=sy(7.8)-pT;

  // ── Conversion trend — 3 line series, Feb–Jul, driven by country ──
  const convMonths = ['Feb 26','Mar 26','Apr 26','May 26','Jun 26','Jul 26'];
  const CONV_DATA: Record<string, { long:number[]; short:number[]; moved:number[]; stats:{ longAdded:number; shortAdded:number; moved:number; signed:number; longToShort:string; shortToTarget:string } }> = {
    'All countries': { long:[20,45,31,23,29,19], short:[8,12,47,20,15,11], moved:[4,6,5,7,6,8], stats:{ longAdded:187, shortAdded:241, moved:34, signed:1, longToShort:'128.9%', shortToTarget:'14.1%' } },
    Ghana:           { long:[12,28,19,14,17,11], short:[5,7,26,12,9,7],   moved:[2,3,3,4,3,5], stats:{ longAdded:101, shortAdded:66,  moved:20, signed:1, longToShort:'96.4%',  shortToTarget:'18.2%' } },
    Nigeria:         { long:[8,15,11,9,12,7],    short:[3,5,14,8,6,4],     moved:[1,2,2,2,2,3], stats:{ longAdded:62,  shortAdded:40,  moved:12, signed:0, longToShort:'82.5%',  shortToTarget:'15.0%' } },
    Senegal:         { long:[6,11,9,7,8,6],      short:[2,4,10,6,5,3],     moved:[1,1,2,2,1,2], stats:{ longAdded:47,  shortAdded:30,  moved:9,  signed:0, longToShort:'78.7%',  shortToTarget:'13.3%' } },
    Kenya:           { long:[4,8,6,5,6,4],       short:[1,3,7,4,3,2],      moved:[0,1,1,1,1,1], stats:{ longAdded:33,  shortAdded:20,  moved:5,  signed:0, longToShort:'71.4%',  shortToTarget:'10.0%' } },
  };
  const cd = CONV_DATA[country] ?? CONV_DATA['All countries'];
  const convStats: [string,string][] = [
    ['LONG ADDED', String(cd.stats.longAdded)],
    ['SHORT ADDED', String(cd.stats.shortAdded)],
    ['MOVED TO TARGET', String(cd.stats.moved)],
    ['SIGNED', String(cd.stats.signed)],
    ['LONG TO SHORT', cd.stats.longToShort],
    ['SHORT TO TARGET', cd.stats.shortToTarget],
  ];
  const CV_W=600, CV_H=240, cvML=34, cvMR=16, cvMT=16, cvMB=34;
  const cvpL=cvML, cvpR=CV_W-cvMR, cvpT=cvMT, cvpB=CV_H-cvMB;
  const cvPlotW=cvpR-cvpL, cvPlotH=cvpB-cvpT;
  const cvPeak = Math.max(10, ...cd.long, ...cd.short, ...cd.moved);
  const cvMax = Math.ceil(cvPeak/10)*10;
  const cvStep = cvMax/5;
  const cvGrid = [0,1,2,3,4,5].map(i => i*cvStep);
  const cvX=(i:number)=> cvpL + (i/(convMonths.length-1))*cvPlotW;
  const cvY=(v:number)=> cvpB - (v/cvMax)*cvPlotH;
  const cvPath=(arr:number[])=> arr.map((v,i)=>`${i===0?'M':'L'} ${cvX(i).toFixed(1)} ${cvY(v).toFixed(1)}`).join(' ');
  const cvSeries=[
    { label:'Long added',     data:cd.long,  color:'#2563eb' },
    { label:'Short added',    data:cd.short, color:'#E8A838' },
    { label:'Moved to Target',data:cd.moved, color:'#8b5cf6' },
  ];

  // ── Archived by stage — stacked vertical bars, Jan–Jul (mock, Jul dominant) ──
  const archMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  const archived = [
    { long:3,  short:8,   target:1  },
    { long:2,  short:6,   target:0  },
    { long:4,  short:11,  target:1  },
    { long:3,  short:7,   target:0  },
    { long:5,  short:13,  target:2  },
    { long:6,  short:16,  target:1  },
    { long:75, short:341, target:11 },
  ];
  const AR_W=480, AR_H=240, arML=30, arMR=14, arMT=16, arMB=34;
  const arpL=arML, arpR=AR_W-arMR, arpT=arMT, arpB=AR_H-arMB;
  const arPlotW=arpR-arpL, arPlotH=arpB-arpT;
  const arMax=Math.max(...archived.map(a=>a.long+a.short+a.target));
  const arSlot=arPlotW/archived.length;
  const arBarW=arSlot*0.46;
  const arSeg=(v:number)=> (v/arMax)*arPlotH;
  const arGrid=[0,0.25,0.5,0.75,1];

  // ── Leaderboards ──
  const TOP_PLAYERS = [
    { n:'Bisenty Mendy',      c:14 },
    { n:'Daniel Japhet',      c:14 },
    { n:'Luis Narh',          c:12 },
    { n:'FRANCIS SIOLOLO',    c:11 },
    { n:'Jean Michel Briton', c:11 },
    { n:'Kwaku Boahen',       c:10 },
    { n:'Ismael Coulibaly',   c:9  },
    { n:'Peter Etim',         c:9  },
    { n:'Youssouf Sané',      c:8  },
    { n:'Collins Otieno',     c:7  },
  ];
  // Highest shortlist submissions — senior + country + head scouts.
  // Only Senior Scouts can be removed by the lead scout.
  const SCOUT_BOARD = [
    { n:'Kwame Asante',   role:'Country Scout', c:38 },
    { n:'Chidi Obinna',   role:'Country Scout', c:31 },
    { n:'David Mbugua',   role:'Senior Scout',  c:27 },
    { n:'Wekesa Omondi',  role:'Head Scout',    c:24 },
    { n:'Emeka Okafor',   role:'Country Scout', c:22 },
    { n:'Nene',           role:'Senior Scout',  c:19 },
    { n:'Joseph Njoroge', role:'Head Scout',    c:17 },
    { n:'Brice',          role:'Senior Scout',  c:15 },
    { n:'Amara Diallo',   role:'Country Scout', c:13 },
    { n:'Tunde Bakare',   role:'Head Scout',    c:11 },
    { n:'Samuel Kipruto', role:'Country Scout', c:9  },
    { n:'Fatou Ndiaye',   role:'Country Scout', c:8  },
  ].map(s => ({ ...s, removable: s.role === 'Senior Scout' }));
  const scoutLeaders  = SCOUT_BOARD.filter(s => !removedScouts.includes(s.n)).slice(0, 10);
  const playerLeaders = TOP_PLAYERS.slice(0, 10);
  const leaders = board === 'players' ? playerLeaders : scoutLeaders;

  const CARD = 'bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] overflow-hidden';

  return (
    <div className="flex flex-col gap-6">

      {/* ── Row 1: Leaderboards + Talent map ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6 lg:items-stretch">

        {/* Card 3 — Leaderboards */}
        <div className={`lg:col-span-1 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Trophy size={16} className="text-[#E8A838]" /></div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Leaderboards</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">{board === 'scouts' ? 'Ranked by highest shortlist submissions' : "This cycle's standouts"}</p>
            </div>
          </div>
          <div className="px-5 py-4 flex-1 flex flex-col">
            {/* segmented toggle */}
            <div className="flex items-center bg-card border border-border rounded-full p-1 gap-1 mb-3">
              {([['scouts','Scouts'],['players','Top players']] as const).map(([key,label]) => (
                <button key={key} type="button" onClick={() => setBoard(key)}
                  className={`flex-1 px-3 py-1.5 rounded-full font-body font-bold text-[12px] ${board === key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
            {/* ranked list */}
            <div className="flex flex-col">
              {leaders.map((p,i) => (
                <div key={p.n} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-heading font-black text-[12px] shrink-0 ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground'}`}>{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-body font-bold text-[14px] text-foreground truncate">{p.n}</div>
                    {board === 'scouts' && <div className="font-body text-[11px] text-muted-foreground truncate">{(p as any).role}</div>}
                  </div>
                  <span className="font-heading font-black text-[14px] text-foreground tabular-nums">{p.c}</span>
                  {board === 'scouts' && (p as any).removable && (
                    <button type="button" onClick={() => setRemovedScouts(prev => [...prev, p.n])}
                      title="Remove senior scout from list" aria-label={`Remove ${p.n}`}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 4 — Talent map (scatter) — kept as-is */}
        <div className={`lg:col-span-2 ${CARD}`}>
          <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Target size={16} className="text-foreground" /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-[16px] text-foreground">Talent map</h3>
                <span className="font-heading font-bold text-micro bg-accent text-muted-foreground rounded-full px-2">Derivable</span>
              </div>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Eyeball rating vs age — bubble = video coverage</p>
            </div>
          </div>
          <div className="px-3 sm:px-5 py-4">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-h-[200px]" preserveAspectRatio="xMidYMid meet">
              {/* priority quadrant tint */}
              <rect x={zoneX} y={zoneY} width={zoneW} height={zoneH} fill="#061b2e" opacity="0.06" rx="8" />
              <rect x={zoneX} y={zoneY} width={zoneW} height={zoneH} fill="none" stroke="#061b2e" strokeOpacity="0.18" strokeDasharray="4 4" rx="8" />
              <text x={pR-6} y={zoneY+16} textAnchor="end" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="800">PRIORITY</text>
              {/* horizontal gridlines + Y labels (rating) */}
              {[6,7,8,9].map(g => (
                <g key={g}>
                  <line x1={pL} y1={sy(g)} x2={pR} y2={sy(g)} stroke="#d2e7fa" strokeWidth="1" />
                  <text x={pL-8} y={sy(g)+3} textAnchor="end" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{g.toFixed(1)}</text>
                </g>
              ))}
              {/* X axis ticks (age) — reversed, younger to the right */}
              {[22,20,18,16].map(a => (
                <text key={a} x={sx(a)} y={pB+16} textAnchor="middle" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{a}</text>
              ))}
              <text x={(pL+pR)/2} y={H-3} textAnchor="middle" fontSize="9" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="800">AGE — younger →</text>
              {/* dots */}
              {TALENT.map(d => {
                const prio = isPriority(d.age, d.r);
                return (
                  <circle key={d.n} cx={sx(d.age)} cy={sy(d.r)} r={rad(d.v)}
                    fill={prio ? '#061b2e' : '#b8d4ef'} fillOpacity={prio ? 0.9 : 0.85}
                    stroke={prio ? '#061b2e' : '#7baac7'} strokeWidth="1.5">
                    <title>{`${d.n} · age ${d.age} · eyeball ${d.r.toFixed(1)} · ${d.v} videos`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* ── Row 2: Conversion trend + Archived by stage ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6 lg:items-stretch">

        {/* Card 1 — Conversion trend */}
        <div className={`lg:col-span-2 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><TrendingUp size={16} className="text-foreground" /></div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Conversion trend</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Active pipeline, monthly</p>
            </div>
            {/* Country pill dropdown — drives the chart + stat data */}
            <div className="relative shrink-0">
              <button type="button" onClick={() => setCountryOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border font-body font-bold text-[12px] text-foreground hover:border-primary">
                <Search size={14} />
                <span className="whitespace-nowrap">{country}</span>
                <ChevronDown size={12} />
              </button>
              {countryOpen && (
                <div className="absolute right-0 mt-2 z-20 min-w-[160px] bg-card border border-border rounded-[12px] shadow-[var(--shadow-lg)] overflow-hidden py-1">
                  {COUNTRIES.map(c => (
                    <button key={c} type="button" onClick={() => { setCountry(c); setCountryOpen(false); }}
                      className={`w-full text-left px-3 py-2 font-body font-bold text-[12px] hover:bg-accent ${c === country ? 'text-primary' : 'text-foreground'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stat row */}
          <div className="px-5 py-4 border-b border-border flex flex-wrap gap-x-8 gap-y-3">
            {convStats.map(([label,val]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
                <span className="font-heading font-black text-[16px] text-foreground">{val}</span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="px-5 py-4 flex-1 flex flex-col">
            <svg viewBox={`0 0 ${CV_W} ${CV_H}`} className="w-full" style={{ height:220 }} preserveAspectRatio="xMidYMid meet">
              {/* gridlines */}
              {cvGrid.map(g => (
                <g key={g}>
                  <line x1={cvpL} y1={cvY(g)} x2={cvpR} y2={cvY(g)} stroke="#d2e7fa" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={cvpL-6} y={cvY(g)+3} textAnchor="end" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{g}</text>
                </g>
              ))}
              {/* month labels */}
              {convMonths.map((m,i) => (
                <text key={m} x={cvX(i)} y={cvpB+20} textAnchor="middle" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{m}</text>
              ))}
              {/* series */}
              {cvSeries.map((s,si) => (
                <g key={s.label}>
                  <path d={cvPath(s.data)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {s.data.map((v,i) => {
                    const isH = hoverPt?.s===si && hoverPt?.i===i;
                    return (
                      <g key={i}>
                        <circle cx={cvX(i)} cy={cvY(v)} r={isH?6:3} fill={s.color} className="transition-all" />
                        {isH && (
                          <text x={cvX(i)} y={cvY(v)-10} textAnchor="middle" fontSize="11" fontWeight="800" fill={s.color} fontFamily="Figtree, sans-serif">{v}</text>
                        )}
                        <circle cx={cvX(i)} cy={cvY(v)} r={11} fill="transparent" className="cursor-pointer"
                          onMouseEnter={()=>setHoverPt({s:si,i})} onMouseLeave={()=>setHoverPt(null)}>
                          <title>{`${convMonths[i]} · ${s.label}: ${v}`}</title>
                        </circle>
                      </g>
                    );
                  })}
                </g>
              ))}
            </svg>
            {/* legend */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
              {cvSeries.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background:s.color }} />
                  <span className="font-heading font-bold text-[12px] text-foreground">{s.label}</span>
                </div>
              ))}
            </div>
            <p className="font-body text-[11px] text-muted-foreground mt-2">Signed dates tracked from deployment onward.</p>
          </div>
        </div>

        {/* Card 2 — Archived by stage */}
        <div className={`lg:col-span-1 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Target size={16} className="text-foreground" /></div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Archived by stage</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Archived from the pipeline, monthly</p>
            </div>
          </div>

          {/* Stat row */}
          <div className="px-5 py-4 border-b border-border flex flex-wrap gap-x-8 gap-y-3">
            {[['LONG','98'],['SHORT','402'],['TARGET','17']].map(([label,val]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
                <span className="font-heading font-black text-[16px] text-foreground">{val}</span>
              </div>
            ))}
          </div>

          {/* Chart — stacked bars */}
          <div className="px-5 py-4 flex-1 flex flex-col">
            <svg viewBox={`0 0 ${AR_W} ${AR_H}`} className="w-full" style={{ height:220 }} preserveAspectRatio="xMidYMid meet">
              {/* gridlines */}
              {arGrid.map(f => {
                const y = arpB - f*arPlotH;
                return <line key={f} x1={arpL} y1={y} x2={arpR} y2={y} stroke="#d2e7fa" strokeWidth="1" strokeDasharray="4 4" />;
              })}
              {/* bars */}
              {archived.map((a,i) => {
                const cx = arpL + (i+0.5)*arSlot;
                const x = cx - arBarW/2;
                const lh = arSeg(a.long), sh = arSeg(a.short), th = arSeg(a.target);
                const yLong = arpB - lh, yShort = yLong - sh, yTarget = yShort - th;
                return (
                  <g key={i}>
                    <rect x={x} y={yLong}   width={arBarW} height={lh} fill="#2563eb" className="cursor-pointer transition-opacity hover:opacity-70">
                      <title>{`${archMonths[i]} · Long: ${a.long}`}</title>
                    </rect>
                    <rect x={x} y={yShort}  width={arBarW} height={sh} fill="#E8A838" className="cursor-pointer transition-opacity hover:opacity-70">
                      <title>{`${archMonths[i]} · Short: ${a.short}`}</title>
                    </rect>
                    <rect x={x} y={yTarget} width={arBarW} height={th} fill="#8b5cf6" className="cursor-pointer transition-opacity hover:opacity-70">
                      <title>{`${archMonths[i]} · Target: ${a.target}`}</title>
                    </rect>
                    <text x={cx} y={arpB+20} textAnchor="middle" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{archMonths[i]}</text>
                  </g>
                );
              })}
            </svg>
            {/* legend */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
              {[['Long','#2563eb'],['Short','#E8A838'],['Target','#8b5cf6']].map(([label,color]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background:color }} />
                  <span className="font-heading font-bold text-[12px] text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
