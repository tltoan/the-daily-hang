import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchDailyPuzzle } from './data/puzzles.js';
import { PALETTES, PALETTE_OPTIONS, VISUAL_OPTIONS } from './lib/palettes.js';
import {
  MAX_WRONG, STORAGE_KEY,
  emptyStats, loadSettings, loadStore, saveSettings, saveStore, todayKey,
} from './lib/storage.js';
import { answerLetters, isLetter } from './lib/util.js';
import { useMidnightCountdown } from './hooks/useMidnightCountdown.js';

import { Masthead } from './components/Masthead.jsx';
import { Landing } from './components/Landing.jsx';
import { AlreadyPlayed } from './components/AlreadyPlayed.jsx';
import { GallowsPanel } from './components/GallowsPanel.jsx';
import { WordDisplay } from './components/WordDisplay.jsx';
import { Keyboard } from './components/Keyboard.jsx';
import { ResultPane } from './components/ResultPane.jsx';
import { HowToPlay } from './components/HowToPlay.jsx';
import { StatsModal } from './components/StatsModal.jsx';
import { SettingsPanel } from './components/SettingsPanel.jsx';
import { Eyebrow } from './components/Eyebrow.jsx';

const SETTINGS_DEFAULTS = { palette: 'broadsheet', visual: 'gallows' };

export default function App() {
  const [settings, setSettings] = useState(() => ({ ...SETTINGS_DEFAULTS, ...loadSettings() }));
  const setSetting = (key, val) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: val };
      saveSettings(next);
      return next;
    });
  };
  const palette = PALETTES[settings.palette] || PALETTES.broadsheet;

  const [puzzle, setPuzzle] = useState(null);
  const [puzzleError, setPuzzleError] = useState(null);
  const key = todayKey();

  const [phase, setPhase] = useState('landing'); // landing | playing | won | lost | already
  const [guessed, setGuessed] = useState(() => new Set());
  const [stats, setStats] = useState(emptyStats);

  useEffect(() => {
    let cancelled = false;
    fetchDailyPuzzle()
      .then((p) => { if (!cancelled) setPuzzle(p); })
      .catch((e) => { if (!cancelled) setPuzzleError(e); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const s = loadStore();
    if (s.stats) {
      setStats({
        played: s.stats.played || 0,
        won: s.stats.won || 0,
        streak: s.stats.streak || 0,
        maxStreak: s.stats.maxStreak || 0,
        distribution:
          Array.isArray(s.stats.distribution) && s.stats.distribution.length === 7
            ? s.stats.distribution
            : Array(7).fill(0),
      });
    }
    if (s.today && s.today.key === key && s.today.finished) {
      setPhase('already');
    }
  }, [key]);

  const answerSet = useMemo(
    () => new Set(puzzle ? answerLetters(puzzle.answer) : []),
    [puzzle]
  );
  const wrong = useMemo(() => {
    let n = 0;
    for (const ch of guessed) if (!answerSet.has(ch)) n++;
    return n;
  }, [guessed, answerSet]);
  const solved = useMemo(
    () => [...answerSet].every((ch) => guessed.has(ch)),
    [guessed, answerSet]
  );

  const disabled = phase !== 'playing';

  const guess = useCallback(
    (ch) => {
      if (phase !== 'playing') return;
      setGuessed((prev) => {
        if (prev.has(ch)) return prev;
        const next = new Set(prev);
        next.add(ch);
        return next;
      });
    },
    [phase]
  );

  const finishGame = useCallback(
    (won) => {
      setPhase(won ? 'won' : 'lost');
      const s = loadStore();
      if (s.today && s.today.key === key && s.today.finished) return;
      setStats((prev) => {
        const next = { ...prev };
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
        saveStore({
          ...s,
          stats: next,
          today: { key, finished: true, won, wrong, answer: puzzle?.answer ?? '' },
        });
        return next;
      });
    },
    [key, puzzle, wrong]
  );

  useEffect(() => {
    if (phase !== 'playing') return;
    if (solved) finishGame(true);
    else if (wrong >= MAX_WRONG) finishGame(false);
  }, [solved, wrong, phase, finishGame]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const ch = e.key.toUpperCase();
      if (isLetter(ch)) {
        e.preventDefault();
        guess(ch);
      }
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
    setGuessed(new Set());
    setPhase('playing');
  };

  const resetToday = () => {
    const s = loadStore();
    delete s.today;
    saveStore(s);
    setGuessed(new Set());
    setPhase('landing');
  };

  const clearAllStats = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStats(emptyStats());
    setGuessed(new Set());
    setPhase('landing');
  };

  const paletteStyle = Object.fromEntries(
    Object.entries(palette).filter(([k]) => k.startsWith('--'))
  );

  if (puzzleError) {
    return (
      <div className="app" style={paletteStyle}>
        <div className="paper">
          <section className="landing">
            <Eyebrow>Service interrupted</Eyebrow>
            <div className="landing-category">No puzzle today.</div>
            <p className="landing-deck">
              We couldn’t reach the press room. Please try again in a moment.
            </p>
          </section>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="app" style={paletteStyle}>
        <div className="paper">
          <section className="landing">
            <Eyebrow>Today’s Edition</Eyebrow>
            <div className="landing-category">Going to press…</div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="app" style={paletteStyle}>
      <div className="paper">
        <Masthead puzzle={puzzle}
                  onHow={() => setShowHow(true)}
                  onStats={() => setShowStats(true)} />

        {phase === 'landing' && (
          <Landing puzzle={puzzle}
                   onStart={() => setPhase('playing')}
                   onHow={() => setShowHow(true)} />
        )}

        {phase === 'already' && todayRecord && (
          <AlreadyPlayed record={todayRecord} puzzle={puzzle} countdown={countdown}
                         onStats={() => setShowStats(true)}
                         onPeek={replayDemo} />
        )}

        {(phase === 'playing' || phase === 'won' || phase === 'lost') && (
          <main className="play">
            <GallowsPanel visual={settings.visual} wrong={wrong} />
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

      <SettingsPanel
        paletteValue={settings.palette}
        paletteOptions={PALETTE_OPTIONS}
        onPaletteChange={(v) => setSetting('palette', v)}
        visualValue={settings.visual}
        visualOptions={VISUAL_OPTIONS}
        onVisualChange={(v) => setSetting('visual', v)}
        onResetToday={resetToday}
        onClearStats={clearAllStats}
      />
    </div>
  );
}
