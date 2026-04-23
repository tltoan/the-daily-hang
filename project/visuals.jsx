// Four "hangman" metaphor visuals. Each takes { wrong } 0..6 and renders an SVG.
// All use ink-line drawing style; the rendering of each step is progressive.

const INK = 'var(--ink)';
const MUTED = 'var(--rule)';
const ACCENT = 'var(--accent)';

// ── Classic gallows ─────────────────────────────────────────────────────────
function VisualGallows({ wrong }) {
  const sw = 2.2;
  const show = (n) => wrong >= n;
  return (
    <svg viewBox="0 0 220 260" width="100%" height="100%"
         style={{ maxWidth: 260, display: 'block' }} aria-hidden>
      {/* ground */}
      <line x1="10" y1="248" x2="210" y2="248" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
      {/* base */}
      <line x1="30" y1="248" x2="110" y2="248" stroke={INK} strokeWidth={sw + 1} strokeLinecap="round" />
      {/* post */}
      <line x1="70" y1="248" x2="70" y2="28"  stroke={INK} strokeWidth={sw} strokeLinecap="round" />
      {/* beam */}
      <line x1="68" y1="28"  x2="170" y2="28" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
      {/* rope */}
      <line x1="170" y1="28" x2="170" y2="62" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
      {/* 1 head */}
      {show(1) && <circle cx="170" cy="78" r="16" fill="none" stroke={INK} strokeWidth={sw} />}
      {/* 2 body */}
      {show(2) && <line x1="170" y1="94" x2="170" y2="160" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
      {/* 3 left arm */}
      {show(3) && <line x1="170" y1="108" x2="148" y2="134" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
      {/* 4 right arm */}
      {show(4) && <line x1="170" y1="108" x2="192" y2="134" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
      {/* 5 left leg */}
      {show(5) && <line x1="170" y1="160" x2="150" y2="196" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
      {/* 6 right leg + face */}
      {show(6) && <>
        <line x1="170" y1="160" x2="190" y2="196" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        <line x1="164" y1="74"  x2="168" y2="78"  stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        <line x1="168" y1="74"  x2="164" y2="78"  stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        <line x1="172" y1="74"  x2="176" y2="78"  stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        <line x1="176" y1="74"  x2="172" y2="78"  stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        <path d="M163 86 Q170 82 177 86" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
      </>}
    </svg>
  );
}

// ── Sandcastle eroding ──────────────────────────────────────────────────────
// Starts full, loses pieces each wrong guess. 6 wrong = only a mound remains.
function VisualSandcastle({ wrong }) {
  const sw = 2;
  // Each level present if wrong < threshold.
  const has = (n) => wrong < n; // present while wrong < n
  return (
    <svg viewBox="0 0 220 260" width="100%" height="100%"
         style={{ maxWidth: 260, display: 'block' }} aria-hidden>
      {/* waterline */}
      <path d="M0 238 Q55 232 110 238 T220 238" fill="none" stroke={MUTED} strokeWidth={1.2} />
      <path d="M0 244 Q55 238 110 244 T220 244" fill="none" stroke={MUTED} strokeWidth={1.2} />
      {/* ground */}
      <line x1="10" y1="250" x2="210" y2="250" stroke={INK} strokeWidth={sw} strokeLinecap="round" />

      {/* base mound (always present, shrinks at 6) */}
      {wrong < 6 ? (
        <path d="M30 250 Q110 210 190 250 Z" fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      ) : (
        <path d="M60 250 Q110 236 160 250 Z" fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      )}

      {/* main keep (lost at 5) */}
      {has(5) && <>
        <rect x="78" y="150" width="64" height="72" fill="none" stroke={INK} strokeWidth={sw} />
        <path d="M78 150 l0 -10 l8 0 l0 6 l8 0 l0 -6 l8 0 l0 6 l8 0 l0 -6 l8 0 l0 6 l8 0 l0 -6 l8 0 l0 6 l8 0 l0 -6 l8 0 l0 10"
              fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="miter" />
        <rect x="104" y="186" width="12" height="36" fill="none" stroke={INK} strokeWidth={sw} />
      </>}

      {/* left tower (lost at 3) */}
      {has(3) && <>
        <rect x="44" y="172" width="26" height="50" fill="none" stroke={INK} strokeWidth={sw} />
        <path d="M44 172 l0 -6 l4 0 l0 4 l4 0 l0 -4 l4 0 l0 4 l4 0 l0 -4 l4 0 l0 4 l4 0 l0 -4 l2 0 l0 6" fill="none" stroke={INK} strokeWidth={sw} />
      </>}
      {/* right tower (lost at 4) */}
      {has(4) && <>
        <rect x="150" y="172" width="26" height="50" fill="none" stroke={INK} strokeWidth={sw} />
        <path d="M150 172 l0 -6 l4 0 l0 4 l4 0 l0 -4 l4 0 l0 4 l4 0 l0 -4 l4 0 l0 4 l4 0 l0 -4 l2 0 l0 6" fill="none" stroke={INK} strokeWidth={sw} />
      </>}

      {/* flag (lost at 1) */}
      {has(1) && <>
        <line x1="110" y1="150" x2="110" y2="118" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        <path d="M110 120 l18 5 l-18 8 Z" fill={ACCENT} stroke={ACCENT} strokeWidth={1} strokeLinejoin="round" />
      </>}
      {/* shell detail (lost at 2) */}
      {has(2) && <>
        <path d="M94 222 q6 -8 12 0" fill="none" stroke={INK} strokeWidth={sw} />
        <path d="M114 222 q6 -8 12 0" fill="none" stroke={INK} strokeWidth={sw} />
      </>}

      {/* splash on last */}
      {wrong >= 6 && <>
        <path d="M30 240 q4 -6 8 0" fill="none" stroke={MUTED} strokeWidth={1.2} />
        <path d="M180 240 q4 -6 8 0" fill="none" stroke={MUTED} strokeWidth={1.2} />
      </>}
    </svg>
  );
}

// ── Candle burning down ─────────────────────────────────────────────────────
// 0 wrong: full candle. 6 wrong: just a puddle.
function VisualCandle({ wrong }) {
  const sw = 2.2;
  const fullH = 160;
  const h = Math.max(8, fullH - wrong * (fullH / 6));
  const topY = 60 + (fullH - h);
  const bottomY = 220;
  const flame = wrong < 6;
  return (
    <svg viewBox="0 0 220 260" width="100%" height="100%"
         style={{ maxWidth: 260, display: 'block' }} aria-hidden>
      {/* holder base */}
      <line x1="30" y1="248" x2="190" y2="248" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
      <path d="M70 248 L60 230 L160 230 L150 248 Z" fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <line x1="70" y1="230" x2="150" y2="230" stroke={INK} strokeWidth={sw} />
      {/* cup rim */}
      <rect x="78" y="220" width="64" height="10" fill="none" stroke={INK} strokeWidth={sw} />

      {/* candle body */}
      <rect x="90" y={topY} width="40" height={bottomY - topY} fill="none" stroke={INK} strokeWidth={sw} />
      {/* wick */}
      {flame && <line x1="110" y1={topY} x2="110" y2={topY - 10} stroke={INK} strokeWidth={1.6} strokeLinecap="round" />}
      {/* flame */}
      {flame && <>
        <path d={`M110 ${topY - 10} q -10 -10 0 -22 q 10 12 0 22 Z`} fill="none" stroke={ACCENT} strokeWidth={sw} strokeLinejoin="round" />
        <path d={`M110 ${topY - 13} q -4 -4 0 -10 q 4 6 0 10 Z`} fill={ACCENT} stroke={ACCENT} strokeWidth={1} />
      </>}

      {/* drip */}
      {wrong >= 2 && <path d={`M90 ${topY + 10} q -4 8 0 16`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
      {wrong >= 4 && <path d={`M130 ${topY + 20} q 4 10 0 20`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}

      {/* smoke on final */}
      {wrong >= 6 && <>
        <path d="M110 56 q -6 -8 0 -16 q 6 8 0 16" fill="none" stroke={MUTED} strokeWidth={1.2} />
        <path d="M110 38 q -6 -8 0 -16" fill="none" stroke={MUTED} strokeWidth={1.2} />
      </>}
    </svg>
  );
}

// ── Ink blot spreading ──────────────────────────────────────────────────────
// A nib above a page; each wrong guess grows/adds a blot.
function VisualInkblot({ wrong }) {
  const sw = 2.2;
  // 6 blots (one per wrong). Positions roughly forming a blooming cluster.
  const blots = [
    { cx: 110, cy: 170, r: 14 },
    { cx: 132, cy: 158, r: 10 },
    { cx: 92,  cy: 182, r: 11 },
    { cx: 150, cy: 184, r: 9 },
    { cx: 88,  cy: 160, r: 8 },
    { cx: 128, cy: 200, r: 12 },
  ];
  return (
    <svg viewBox="0 0 220 260" width="100%" height="100%"
         style={{ maxWidth: 260, display: 'block' }} aria-hidden>
      {/* desk line */}
      <line x1="10" y1="248" x2="210" y2="248" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
      {/* paper */}
      <rect x="40" y="110" width="140" height="130" fill="none" stroke={INK} strokeWidth={sw} />
      <line x1="40" y1="122" x2="180" y2="122" stroke={MUTED} strokeWidth={1} />
      <line x1="52" y1="110" x2="52" y2="240" stroke={MUTED} strokeWidth={1} />

      {/* nib (hovers above) */}
      <path d="M110 40 L104 70 L110 86 L116 70 Z" fill={INK} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <line x1="110" y1="58" x2="110" y2="82" stroke="#fff" strokeWidth={1.2} />
      <circle cx="110" cy="70" r="2.5" fill="#fff" />

      {/* blots, one per wrong */}
      {blots.slice(0, wrong).map((b, i) => (
        <g key={i}>
          <circle cx={b.cx} cy={b.cy} r={b.r} fill={ACCENT} opacity="0.88" />
          {/* spatter */}
          <circle cx={b.cx + b.r + 3} cy={b.cy - 2} r={1.6} fill={ACCENT} opacity="0.6" />
          <circle cx={b.cx - b.r - 2} cy={b.cy + 3} r={1.2} fill={ACCENT} opacity="0.5" />
        </g>
      ))}

      {/* drip from nib when things are going badly */}
      {wrong >= 3 && <circle cx="110" cy={92 + wrong * 4} r={wrong >= 5 ? 3 : 2} fill={ACCENT} />}
    </svg>
  );
}

window.Visuals = {
  gallows: VisualGallows,
  sandcastle: VisualSandcastle,
  candle: VisualCandle,
  inkblot: VisualInkblot,
};
