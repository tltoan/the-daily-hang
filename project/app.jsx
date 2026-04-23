// Daily Hangman — main app
// States: landing → playing → won | lost | already-played
// Modals: how-to, stats
//
// Persistence: localStorage keeps today's game state, streak, and distribution.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Palettes ────────────────────────────────────────────────────────────────
const PALETTES = {
  broadsheet: {
    name: 'Broadsheet',
    '--paper':  'oklch(0.97 0.008 85)',
    '--paper-2':'oklch(0.94 0.012 85)',
    '--ink':    'oklch(0.18 0.012 60)',
    '--ink-2':  'oklch(0.35 0.012 60)',
    '--rule':   'oklch(0.72 0.012 60)',
    '--accent': 'oklch(0.48 0.15 25)',
    '--good':   'oklch(0.42 0.08 150)',
  },
  financial: {
    name: 'Financial',
    '--paper':  'oklch(0.93 0.022 45)',
    '--paper-2':'oklch(0.90 0.028 45)',
    '--ink':    'oklch(0.22 0.015 40)',
    '--ink-2':  'oklch(0.40 0.015 40)',
    '--rule':   'oklch(0.72 0.02 40)',
    '--accent': 'oklch(0.42 0.12 30)',
    '--good':   'oklch(0.40 0.08 145)',
  },
  midnight: {
    name: 'Midnight',
    '--paper':  'oklch(0.18 0.012 250)',
    '--paper-2':'oklch(0.22 0.015 250)',
    '--ink':    'oklch(0.93 0.008 90)',
    '--ink-2':  'oklch(0.75 0.01 90)',
    '--rule':   'oklch(0.40 0.015 250)',
    '--accent': 'oklch(0.78 0.14 75)',
    '--good':   'oklch(0.80 0.12 150)',
  },
  mint: {
    name: 'Mint',
    '--paper':  'oklch(0.96 0.018 165)',
    '--paper-2':'oklch(0.93 0.022 165)',
    '--ink':    'oklch(0.22 0.02 180)',
    '--ink-2':  'oklch(0.38 0.02 180)',
    '--rule':   'oklch(0.72 0.02 165)',
    '--accent': 'oklch(0.48 0.13 25)',
    '--good':   'oklch(0.44 0.10 160)',
  },
};

const VISUAL_OPTIONS = [
  { value: 'gallows',    label: 'Gallows' },
  { value: 'sandcastle', label: 'Sandcastle' },
  { value: 'candle',     label: 'Candle' },
  { value: 'inkblot',    label: 'Ink blot' },
];

const MAX_WRONG = 6;
const STORAGE_KEY = 'hangman-daily-v1';

// ── Storage helpers ─────────────────────────────────────────────────────────
function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveStore(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}
function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function isLetter(ch) { return /^[A-Z]$/.test(ch); }
function answerLetters(ans) { return ans.replace(/[^A-Z]/g, '').split(''); }

// Editorial small-caps label
function Eyebrow({ children, style }) {
  return <div className="eyebrow" style={style}>{children}</div>;
}

// ── Masthead ────────────────────────────────────────────────────────────────
function Masthead({ puzzle, onHow, onStats }) {
  return (
    <header className="masthead">
      <div className="masthead-row">
        <button className="mh-btn" onClick={onHow} aria-label="How to play">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.1"/>
            <path d="M6 6.2c0-1.1.9-2 2-2s2 .9 2 1.9c0 1.1-2 1.4-2 2.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
            <circle cx="8" cy="11.5" r=".7" fill="currentColor"/>
          </svg>
          <span>How to play</span>
        </button>
        <div className="mh-meta">Vol. I &middot; No. {puzzle.issue}</div>
        <button className="mh-btn" onClick={onStats} aria-label="Stats">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2"  y="9"  width="2.4" height="5" fill="currentColor"/>
            <rect x="6.8" y="5" width="2.4" height="9" fill="currentColor"/>
            <rect x="11.6" y="2" width="2.4" height="12" fill="currentColor"/>
          </svg>
          <span>Stats</span>
        </button>
      </div>
      <div className="masthead-title">The Daily Hangman</div>
      <div className="masthead-row sub">
        <span>{window.formatEditorialDate(puzzle.date)}</span>
        <span className="mh-price">One guess at a time</span>
        <span>Puzzle №{String(puzzle.index + 1).padStart(3, '0')}</span>
      </div>
      <div className="rule-double" aria-hidden />
    </header>
  );
}

// ── Word display ────────────────────────────────────────────────────────────
function WordDisplay({ answer, guessed, reveal }) {
  const words = answer.split(' ');
  return (
    <div className="word-display">
      {words.map((w, wi) => (
        <div key={wi} className="word-group">
          {w.split('').map((ch, i) => {
            const known = guessed.has(ch) || reveal;
            const missed = reveal && !guessed.has(ch);
            return (
              <span key={i} className={`letter ${known ? 'known' : ''} ${missed ? 'missed' : ''}`}>
                <span className="letter-char">{known ? ch : '\u00A0'}</span>
                <span className="letter-rule" />
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Keyboard ────────────────────────────────────────────────────────────────
const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

function Keyboard({ answer, guessed, disabled, onGuess }) {
  const letters = useMemo(() => new Set(answerLetters(answer)), [answer]);
  return (
    <div className="keyboard" role="group" aria-label="On-screen keyboard">
      {ROWS.map((row, ri) => (
        <div key={ri} className="kb-row">
          {ri === 1 && <span className="kb-spacer" />}
          {row.split('').map((ch) => {
            const isGuessed = guessed.has(ch);
            const isRight = isGuessed && letters.has(ch);
            const isWrong = isGuessed && !letters.has(ch);
            return (
              <button
                key={ch}
                className={`key ${isRight ? 'right' : ''} ${isWrong ? 'wrong' : ''}`}
                disabled={disabled || isGuessed}
                onClick={() => onGuess(ch)}
                aria-label={`Guess letter ${ch}`}
              >
                {ch}
              </button>
            );
          })}
          {ri === 1 && <span className="kb-spacer" />}
        </div>
      ))}
    </div>
  );
}

// ── Gallows panel (left side during play) ───────────────────────────────────
function GallowsPanel({ visual, wrong }) {
  const V = window.Visuals[visual] || window.Visuals.gallows;
  const pips = Array.from({ length: MAX_WRONG }, (_, i) => i < wrong);
  return (
    <aside className="gallows-panel">
      <Eyebrow>{VISUAL_OPTIONS.find(o => o.value === visual)?.label || 'Gallows'}</Eyebrow>
      <div className="gallows-art">
        <V wrong={wrong} />
      </div>
      <div className="lives-row">
        <span className="lives-label">Guesses remaining</span>
        <span className="lives-pips" aria-label={`${MAX_WRONG - wrong} of ${MAX_WRONG} guesses remain`}>
          {pips.map((filled, i) => (
            <span key={i} className={`pip ${filled ? 'used' : ''}`} />
          ))}
        </span>
        <span className="lives-count">{MAX_WRONG - wrong}/{MAX_WRONG}</span>
      </div>
    </aside>
  );
}

// ── Modal shell ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, labelledBy }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby={labelledBy}
         onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </button>
        {children}
      </div>
    </div>
  );
}

// ── How-to-play ────────────────────────────────────────────────────────────
function HowToPlay({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="how-to-title">
      <Eyebrow>A Brief Guide</Eyebrow>
      <h2 id="how-to-title" className="modal-title">How to Play</h2>
      <div className="rule-single" aria-hidden />
      <ol className="how-to-list">
        <li>
          <span className="how-num">1</span>
          <div>
            <strong>Guess the hidden word, one letter at a time.</strong>
            Each puzzle belongs to a category printed above the dashes.
          </div>
        </li>
        <li>
          <span className="how-num">2</span>
          <div>
            <strong>Correct letters</strong> fill every dash they appear on.
            <strong> Wrong letters</strong> cost you a guess.
          </div>
        </li>
        <li>
          <span className="how-num">3</span>
          <div>
            You have <strong>six wrong guesses</strong>. On the sixth, the figure is
            complete — and the puzzle is lost.
          </div>
        </li>
        <li>
          <span className="how-num">4</span>
          <div>
            A <strong>new puzzle arrives at midnight</strong>, local time.
            One per day. No do-overs.
          </div>
        </li>
      </ol>
      <div className="how-demo">
        <div className="how-demo-word">
          <span className="letter known"><span className="letter-char">C</span><span className="letter-rule"/></span>
          <span className="letter"><span className="letter-char">&nbsp;</span><span className="letter-rule"/></span>
          <span className="letter known"><span className="letter-char">F</span><span className="letter-rule"/></span>
          <span className="letter known"><span className="letter-char">F</span><span className="letter-rule"/></span>
          <span className="letter"><span className="letter-char">&nbsp;</span><span className="letter-rule"/></span>
          <span className="letter"><span className="letter-char">&nbsp;</span><span className="letter-rule"/></span>
        </div>
        <div className="how-demo-caption">Example: guessing <em>F</em> fills both dashes.</div>
      </div>
    </Modal>
  );
}

// ── Stats ───────────────────────────────────────────────────────────────────
function StatsModal({ open, onClose, stats, countdown }) {
  const max = Math.max(1, ...stats.distribution);
  const total = stats.played || 0;
  const winPct = total ? Math.round((stats.won / total) * 100) : 0;
  return (
    <Modal open={open} onClose={onClose} labelledBy="stats-title">
      <Eyebrow>The Record</Eyebrow>
      <h2 id="stats-title" className="modal-title">Statistics</h2>
      <div className="rule-single" aria-hidden />
      <div className="stats-grid">
        <div className="stat"><div className="stat-num">{total}</div><div className="stat-lbl">Played</div></div>
        <div className="stat"><div className="stat-num">{winPct}</div><div className="stat-lbl">Win&nbsp;%</div></div>
        <div className="stat"><div className="stat-num">{stats.streak}</div><div className="stat-lbl">Streak</div></div>
        <div className="stat"><div className="stat-num">{stats.maxStreak}</div><div className="stat-lbl">Best</div></div>
      </div>

      <Eyebrow style={{ marginTop: 18 }}>Wrong-guesses on wins</Eyebrow>
      <div className="dist">
        {stats.distribution.map((count, i) => (
          <div key={i} className="dist-row">
            <div className="dist-i">{i}</div>
            <div className="dist-bar-wrap">
              <div className="dist-bar" style={{ width: `${(count / max) * 100}%` }}>
                <span className="dist-count">{count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="next-puzzle">
        <Eyebrow>Next Puzzle</Eyebrow>
        <div className="countdown">{countdown}</div>
      </div>
    </Modal>
  );
}

// ── Won / lost result pane ──────────────────────────────────────────────────
function ResultPane({ won, puzzle, wrong, countdown, onStats, onHow }) {
  const headline = won ? 'Solved.' : 'Tomorrow, then.';
  const deck = won
    ? `You cracked it with ${MAX_WRONG - wrong} to spare.`
    : 'The figure is complete. Better luck at midnight.';
  return (
    <section className={`result ${won ? 'won' : 'lost'}`}>
      <Eyebrow>{won ? 'Evening Edition' : 'Late Edition'}</Eyebrow>
      <h2 className="result-headline">{headline}</h2>
      <p className="result-deck">{deck}</p>

      <div className="result-answer">
        <Eyebrow>{puzzle.category}</Eyebrow>
        <div className="answer-word">{puzzle.answer}</div>
        {puzzle.clue && <div className="answer-clue">&ldquo;{puzzle.clue}&rdquo;</div>}
      </div>

      <div className="result-meta">
        <div>
          <div className="rm-k">Wrong guesses</div>
          <div className="rm-v">{wrong} / {MAX_WRONG}</div>
        </div>
        <div>
          <div className="rm-k">Next puzzle in</div>
          <div className="rm-v countdown-inline">{countdown}</div>
        </div>
      </div>

      <div className="result-actions">
        <button className="btn" onClick={onStats}>View statistics</button>
        <button className="btn ghost" onClick={onHow}>How to play</button>
      </div>
    </section>
  );
}

// ── Landing (intro) ─────────────────────────────────────────────────────────
function Landing({ puzzle, onStart, onHow }) {
  return (
    <section className="landing">
      <Eyebrow>Today&rsquo;s Puzzle</Eyebrow>
      <div className="landing-category">{puzzle.category}</div>
      <div className="landing-hint">
        <span className="letter-count">{answerLetters(puzzle.answer).length}</span>
        <span className="letter-count-lbl">letters</span>
        {puzzle.answer.includes(' ') && <>
          <span className="landing-dot" />
          <span className="letter-count-lbl">{puzzle.answer.split(' ').length} words</span>
        </>}
      </div>
      <div className="rule-single narrow" aria-hidden />
      <p className="landing-deck">
        One word. Six wrong guesses. A new puzzle at midnight.
      </p>
      <div className="landing-actions">
        <button className="btn big" onClick={onStart}>Begin today&rsquo;s puzzle</button>
        <button className="btn ghost" onClick={onHow}>How to play</button>
      </div>
    </section>
  );
}

// ── Already-played state ────────────────────────────────────────────────────
function AlreadyPlayed({ record, puzzle, countdown, onStats, onPeek }) {
  return (
    <section className="already">
      <Eyebrow>You&rsquo;ve read today&rsquo;s edition</Eyebrow>
      <h2 className="result-headline">
        {record.won ? 'You solved it.' : 'Better luck tomorrow.'}
      </h2>
      <p className="result-deck">
        Come back at midnight for Puzzle №{String(((puzzle.index + 1) % window.PUZZLES.length) + 1).padStart(3,'0')}.
      </p>

      <div className="already-card">
        <Eyebrow>Today&rsquo;s answer</Eyebrow>
        <div className="answer-word">{puzzle.answer}</div>
        <div className="answer-clue">&ldquo;{puzzle.clue}&rdquo;</div>
      </div>

      <div className="result-meta">
        <div>
          <div className="rm-k">Result</div>
          <div className="rm-v">{record.won ? 'Solved' : 'Not solved'}</div>
        </div>
        <div>
          <div className="rm-k">Wrong guesses</div>
          <div className="rm-v">{record.wrong} / {MAX_WRONG}</div>
        </div>
        <div>
          <div className="rm-k">Next puzzle</div>
          <div className="rm-v countdown-inline">{countdown}</div>
        </div>
      </div>

      <div className="result-actions">
        <button className="btn" onClick={onStats}>View statistics</button>
        <button className="btn ghost" onClick={onPeek}>Replay today (demo)</button>
      </div>
    </section>
  );
}

// ── Countdown to midnight ───────────────────────────────────────────────────
function useMidnightCountdown() {
  const [s, setS] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setS(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return s;
}

// ── App ─────────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "broadsheet",
  "visual": "gallows"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const palette = PALETTES[t.palette] || PALETTES.broadsheet;

  const puzzle = useMemo(() => window.getDailyPuzzle(new Date()), []);
  const key = todayKey();

  // Game state
  const [phase, setPhase] = useState('landing'); // landing | playing | won | lost | already
  const [guessed, setGuessed] = useState(new Set());
  const [stats, setStats] = useState({ played: 0, won: 0, streak: 0, maxStreak: 0, distribution: Array(7).fill(0) });

  // On mount: load prior stats + check if today was already played.
  useEffect(() => {
    const s = loadStore();
    if (s.stats) setStats({
      played: s.stats.played || 0,
      won: s.stats.won || 0,
      streak: s.stats.streak || 0,
      maxStreak: s.stats.maxStreak || 0,
      distribution: Array.isArray(s.stats.distribution) && s.stats.distribution.length === 7
        ? s.stats.distribution : Array(7).fill(0),
    });
    if (s.today && s.today.key === key && s.today.finished) {
      setPhase('already');
    }
  }, [key]);

  // Derived
  const answerSet = useMemo(() => new Set(answerLetters(puzzle.answer)), [puzzle]);
  const wrong = useMemo(() => {
    let n = 0;
    for (const ch of guessed) if (!answerSet.has(ch)) n++;
    return n;
  }, [guessed, answerSet]);
  const solved = useMemo(() => {
    return [...answerSet].every((ch) => guessed.has(ch));
  }, [guessed, answerSet]);

  const disabled = phase !== 'playing';

  // Guess handler
  const guess = useCallback((ch) => {
    if (phase !== 'playing') return;
    if (guessed.has(ch)) return;
    setGuessed(prev => {
      const next = new Set(prev);
      next.add(ch);
      return next;
    });
  }, [guessed, phase]);

  // Win/lose transitions
  useEffect(() => {
    if (phase !== 'playing') return;
    if (solved) finishGame(true);
    else if (wrong >= MAX_WRONG) finishGame(false);
    // eslint-disable-next-line
  }, [solved, wrong, phase]);

  function finishGame(won) {
    setPhase(won ? 'won' : 'lost');
    // Update stats (only first play on a given day counts)
    const s = loadStore();
    if (s.today && s.today.key === key && s.today.finished) return;
    const next = { ...stats };
    next.played += 1;
    if (won) {
      next.won += 1;
      next.streak += 1;
      next.maxStreak = Math.max(next.maxStreak, next.streak);
      next.distribution = next.distribution.slice();
      next.distribution[wrong] = (next.distribution[wrong] || 0) + 1;
    } else {
      next.streak = 0;
    }
    setStats(next);
    saveStore({
      ...s,
      stats: next,
      today: { key, finished: true, won, wrong, answer: puzzle.answer },
    });
  }

  // Physical keyboard input
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const ch = e.key.toUpperCase();
      if (isLetter(ch)) { e.preventDefault(); guess(ch); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [guess]);

  const [showHow, setShowHow] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const countdown = useMidnightCountdown();
  const store = loadStore();
  const todayRecord = store.today && store.today.key === key ? store.today : null;

  const replayDemo = () => {
    // For demo purposes only — reset local state so the viewer can try again.
    setGuessed(new Set());
    setPhase('playing');
  };

  // Apply palette vars to root
  const paletteStyle = Object.fromEntries(
    Object.entries(palette).filter(([k]) => k.startsWith('--'))
  );

  return (
    <div className="app" style={paletteStyle}>
      <div className="paper">
        <Masthead puzzle={puzzle} onHow={() => setShowHow(true)} onStats={() => setShowStats(true)} />

        {phase === 'landing' && (
          <Landing puzzle={puzzle}
                   onStart={() => setPhase('playing')}
                   onHow={() => setShowHow(true)} />
        )}

        {phase === 'already' && (
          <AlreadyPlayed record={todayRecord} puzzle={puzzle} countdown={countdown}
                         onStats={() => setShowStats(true)}
                         onPeek={replayDemo} />
        )}

        {(phase === 'playing' || phase === 'won' || phase === 'lost') && (
          <main className="play">
            <GallowsPanel visual={t.visual} wrong={wrong} />
            <div className="play-right">
              <div className="play-header">
                <Eyebrow>The Category</Eyebrow>
                <h2 className="category">{puzzle.category}</h2>
                <div className="clue">&ldquo;{puzzle.clue}&rdquo;</div>
              </div>

              <div className="rule-single" aria-hidden />

              <WordDisplay answer={puzzle.answer} guessed={guessed}
                           reveal={phase === 'lost'} />

              <Keyboard answer={puzzle.answer} guessed={guessed}
                        disabled={disabled} onGuess={guess} />

              {(phase === 'won' || phase === 'lost') && (
                <ResultPane won={phase === 'won'} puzzle={puzzle} wrong={wrong}
                            countdown={countdown}
                            onStats={() => setShowStats(true)}
                            onHow={() => setShowHow(true)} />
              )}
            </div>
          </main>
        )}

        <footer className="colophon">
          <span>Established MMXXVI</span>
          <span className="dot">·</span>
          <span>Printed daily at midnight, local time</span>
          <span className="dot">·</span>
          <span>All guesses final</span>
        </footer>
      </div>

      <HowToPlay open={showHow} onClose={() => setShowHow(false)} />
      <StatsModal open={showStats} onClose={() => setShowStats(false)}
                  stats={stats} countdown={countdown} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette" />
        <TweakRadio label="Theme" value={t.palette}
                    options={[
                      { value: 'broadsheet', label: 'Paper' },
                      { value: 'financial', label: 'Salmon' },
                      { value: 'midnight',  label: 'Night' },
                      { value: 'mint',      label: 'Mint' },
                    ]}
                    onChange={(v) => setTweak('palette', v)} />
        <TweakSection label="Hangman visual" />
        <TweakRadio label="Metaphor" value={t.visual}
                    options={VISUAL_OPTIONS}
                    onChange={(v) => setTweak('visual', v)} />
        <TweakSection label="Demo controls" />
        <TweakButton label="New day (reset today)" onClick={() => {
          const s = loadStore();
          delete s.today;
          saveStore(s);
          setGuessed(new Set());
          setPhase('landing');
        }} />
        <TweakButton secondary label="Clear all stats" onClick={() => {
          localStorage.removeItem(STORAGE_KEY);
          setStats({ played: 0, won: 0, streak: 0, maxStreak: 0, distribution: Array(7).fill(0) });
          setGuessed(new Set());
          setPhase('landing');
        }} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
