import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchArchivePuzzle, fetchDailyPuzzle, formatEditorialDate } from './data/puzzles.js';
import { PALETTES, PALETTE_OPTIONS, VISUAL_OPTIONS } from './lib/palettes.js';
import {
  MAX_WRONG, emptyStats, loadSettings, saveSettings,
} from './lib/storage.js';
import { answerLetters, isLetter } from './lib/util.js';
import { useMidnightCountdown } from './hooks/useMidnightCountdown.js';
import { getAnonId, rotateAnonId } from './lib/anonId.js';
import {
  deleteMyPlay, deleteMyPlays, fetchTodayCount, fetchUserState, recordPlay,
} from './lib/playApi.js';

import { Masthead } from './components/Masthead.jsx';
import { Landing } from './components/Landing.jsx';
import { AlreadyPlayed } from './components/AlreadyPlayed.jsx';
import { GallowsPanel } from './components/GallowsPanel.jsx';
import { WordDisplay } from './components/WordDisplay.jsx';
import { Keyboard } from './components/Keyboard.jsx';
import { ResultPane } from './components/ResultPane.jsx';
import { HowToPlay } from './components/HowToPlay.jsx';
import { StatsModal } from './components/StatsModal.jsx';
import { ArchiveModal } from './components/ArchiveModal.jsx';
import { SettingsPanel } from './components/SettingsPanel.jsx';
import { Eyebrow } from './components/Eyebrow.jsx';
import { Modal } from './components/Modal.jsx';

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

  const [anonId] = useState(() => getAnonId());

  const [dailyPuzzle, setDailyPuzzle] = useState(null);
  const [puzzleError, setPuzzleError] = useState(null);

  const [phase, setPhase] = useState('landing'); // landing | playing | won | lost | already
  const [guessed, setGuessed] = useState(() => new Set());
  const [stats, setStats] = useState(emptyStats);
  const [todayRecord, setTodayRecord] = useState(null);
  const [archiveMap, setArchiveMap] = useState({});
  const [todayCount, setTodayCount] = useState(null);

  const [mode, setMode] = useState('daily');
  const [archivePuzzle, setArchivePuzzle] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveError, setArchiveError] = useState(null);

  // ── Initial fetches: today's puzzle, today's community count, this device's state ─
  useEffect(() => {
    let cancelled = false;
    fetchDailyPuzzle()
      .then((p) => { if (!cancelled) setDailyPuzzle(p); })
      .catch((e) => { if (!cancelled) setPuzzleError(e); });
    return () => { cancelled = true; };
  }, []);

  const refreshUserState = useCallback(async () => {
    const s = await fetchUserState(anonId);
    if (s?.stats) setStats(s.stats);
    setTodayRecord(s?.today || null);
    setArchiveMap(s?.archive || {});
    return s;
  }, [anonId]);

  const refreshTodayCount = useCallback(async () => {
    try { setTodayCount(await fetchTodayCount()); } catch {}
  }, []);

  useEffect(() => {
    refreshUserState().catch(() => {});
    refreshTodayCount();
  }, [refreshUserState, refreshTodayCount]);

  // If the device has already finished today, jump to the already-played view.
  useEffect(() => {
    if (mode === 'daily' && todayRecord && phase === 'landing') setPhase('already');
  }, [todayRecord, mode, phase]);

  const activePuzzle = mode === 'archive' ? archivePuzzle : dailyPuzzle;

  const answerSet = useMemo(
    () => new Set(activePuzzle ? answerLetters(activePuzzle.answer) : []),
    [activePuzzle]
  );
  const wrong = useMemo(() => {
    let n = 0;
    for (const ch of guessed) if (!answerSet.has(ch)) n++;
    return n;
  }, [guessed, answerSet]);
  const solved = useMemo(
    () => answerSet.size > 0 && [...answerSet].every((ch) => guessed.has(ch)),
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
    async (won) => {
      setPhase(won ? 'won' : 'lost');
      const puzzleForRecord = mode === 'archive' ? archivePuzzle : dailyPuzzle;
      if (!puzzleForRecord) return;
      try {
        await recordPlay(anonId, puzzleForRecord.issue, mode, won, wrong);
        await refreshUserState();
        if (mode === 'daily') refreshTodayCount();
      } catch {
        /* swallow — UI stays in won/lost; stats will resync next load */
      }
    },
    [anonId, mode, dailyPuzzle, archivePuzzle, wrong, refreshUserState, refreshTodayCount]
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
  const [showArchive, setShowArchive] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (phase === 'won' || phase === 'lost') setShowResult(true);
    else setShowResult(false);
  }, [phase]);

  const countdown = useMidnightCountdown();

  const replayDemo = () => {
    setGuessed(new Set());
    setPhase('playing');
  };

  const playArchiveItem = useCallback((item) => {
    setShowArchive(false);
    setArchiveError(null);
    setArchiveLoading(true);
    setMode('archive');
    setGuessed(new Set());
    setPhase('playing');
    fetchArchivePuzzle(item.issue)
      .then((p) => {
        setArchivePuzzle(p);
        const rec = archiveMap[String(p.issue)];
        if (rec) setPhase(rec.won ? 'won' : 'lost');
      })
      .catch((e) => setArchiveError(e))
      .finally(() => setArchiveLoading(false));
  }, [archiveMap]);

  const exitArchive = () => {
    setMode('daily');
    setArchivePuzzle(null);
    setArchiveError(null);
    setGuessed(new Set());
    setPhase(todayRecord ? 'already' : 'landing');
  };

  const resetToday = async () => {
    if (!dailyPuzzle) return;
    try { await deleteMyPlay(anonId, dailyPuzzle.issue); } catch {}
    await refreshUserState();
    refreshTodayCount();
    setMode('daily');
    setArchivePuzzle(null);
    setGuessed(new Set());
    setPhase('landing');
  };

  const clearAllStats = async () => {
    try { await deleteMyPlays(anonId); } catch {}
    rotateAnonId();
    setStats(emptyStats());
    setTodayRecord(null);
    setArchiveMap({});
    refreshTodayCount();
    setMode('daily');
    setArchivePuzzle(null);
    setGuessed(new Set());
    setPhase('landing');
    // Reload to pick up the new anon id everywhere.
    setTimeout(() => window.location.reload(), 50);
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

  if (!dailyPuzzle) {
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

  const mastheadPuzzle = mode === 'archive' && archivePuzzle ? archivePuzzle : dailyPuzzle;
  const inArchive = mode === 'archive';

  return (
    <div className="app" style={paletteStyle}>
      <div className="paper">
        <Masthead puzzle={mastheadPuzzle}
                  onHow={() => setShowHow(true)}
                  onStats={() => setShowStats(true)}
                  onArchive={() => setShowArchive(true)} />

        {inArchive && (
          <div className="archive-banner">
            <Eyebrow>Back issue</Eyebrow>
            {archivePuzzle && (
              <span className="archive-banner-meta">
                №{String(archivePuzzle.index + 1).padStart(3, '0')}
                {' · '}{formatEditorialDate(archivePuzzle.date)}
              </span>
            )}
            <button className="btn ghost small" onClick={exitArchive}>
              Back to today
            </button>
          </div>
        )}

        {!inArchive && phase === 'landing' && (
          <Landing puzzle={dailyPuzzle}
                   onStart={() => setPhase('playing')}
                   onHow={() => setShowHow(true)} />
        )}

        {!inArchive && phase === 'already' && todayRecord && (
          <AlreadyPlayed record={todayRecord} puzzle={dailyPuzzle} countdown={countdown}
                         onStats={() => setShowStats(true)}
                         onPeek={replayDemo} />
        )}

        {inArchive && archiveLoading && !archivePuzzle && (
          <section className="landing">
            <Eyebrow>Back issue</Eyebrow>
            <div className="landing-category">Pulling from the archive…</div>
          </section>
        )}

        {inArchive && archiveError && (
          <section className="landing">
            <Eyebrow>Service interrupted</Eyebrow>
            <div className="landing-category">Couldn’t load that issue.</div>
            <p className="landing-deck">{String(archiveError.message || archiveError)}</p>
            <div className="landing-actions">
              <button className="btn" onClick={exitArchive}>Back to today</button>
            </div>
          </section>
        )}

        {(phase === 'playing' || phase === 'won' || phase === 'lost') && activePuzzle && (
          <main className="play">
            <GallowsPanel visual={settings.visual} wrong={wrong} />
            <div className="play-right">
              <div className="play-header">
                <Eyebrow>The Category</Eyebrow>
                <h2 className="category">{activePuzzle.category}</h2>
                <div className="clue">&ldquo;{activePuzzle.clue}&rdquo;</div>
                {activePuzzle.hint2 && wrong >= 3 && (
                  <div className="hint2" role="note">
                    <Eyebrow>Second hint</Eyebrow>
                    <div className="hint2-text">&ldquo;{activePuzzle.hint2}&rdquo;</div>
                  </div>
                )}
              </div>

              <div className="rule-single" aria-hidden />

              <WordDisplay answer={activePuzzle.answer} guessed={guessed}
                           reveal={phase === 'lost'} />

              <Keyboard answer={activePuzzle.answer} guessed={guessed}
                        disabled={disabled} onGuess={guess} />
            </div>
          </main>
        )}

        <footer className="colophon">
          <span>Printed daily at midnight, local time</span>
          <span className="dot">·</span>
          <span>All guesses final</span>
        </footer>
      </div>

      <HowToPlay open={showHow} onClose={() => setShowHow(false)} />
      <StatsModal open={showStats} onClose={() => setShowStats(false)}
                  stats={stats} countdown={countdown} />
      <ArchiveModal open={showArchive} onClose={() => setShowArchive(false)}
                    onPlay={playArchiveItem} archive={archiveMap} />

      <Modal open={showResult && (phase === 'won' || phase === 'lost') && !!activePuzzle}
             onClose={() => setShowResult(false)}
             labelledBy="result-headline">
        {activePuzzle && (
          <>
            <ResultPane won={phase === 'won'} puzzle={activePuzzle} wrong={wrong}
                        countdown={countdown}
                        onStats={() => { setShowResult(false); setShowStats(true); }}
                        onHow={() => { setShowResult(false); setShowHow(true); }} />
            {mode === 'daily' && todayCount && todayCount.total > 0 && (
              <div className="community-count">
                <Eyebrow>Today’s edition</Eyebrow>
                <div className="community-count-row">
                  <span>
                    <strong>{todayCount.won.toLocaleString()}</strong> solved
                    {' · '}
                    <strong>{todayCount.total.toLocaleString()}</strong> played
                  </span>
                  <span className="community-pct">{todayCount.win_pct}%</span>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>

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
