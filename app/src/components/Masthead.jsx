import { formatEditorialDate } from '../data/puzzles.js';

export function Masthead({ puzzle, onHow, onStats, onArchive }) {
  return (
    <header className="masthead">
      <div className="masthead-row">
        <button className="mh-btn" onClick={onHow} aria-label="How to play">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.1" />
            <path d="M6 6.2c0-1.1.9-2 2-2s2 .9 2 1.9c0 1.1-2 1.4-2 2.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" />
            <circle cx="8" cy="11.5" r=".7" fill="currentColor" />
          </svg>
          <span>How to play</span>
        </button>
        <div className="mh-meta">
          <span>Vol. I &middot; No. {puzzle.issue}</span>
          {onArchive && (
            <>
              <span className="mh-meta-sep" aria-hidden>·</span>
              <button className="mh-btn inline" onClick={onArchive} aria-label="Open archive">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="3" stroke="currentColor" strokeWidth="1.1" />
                  <rect x="3" y="6.5" width="10" height="7" stroke="currentColor" strokeWidth="1.1" />
                  <line x1="6.5" y1="9" x2="9.5" y2="9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
                <span>Archive</span>
              </button>
            </>
          )}
        </div>
        <button className="mh-btn" onClick={onStats} aria-label="Stats">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2"   y="9" width="2.4" height="5" fill="currentColor" />
            <rect x="6.8" y="5" width="2.4" height="9" fill="currentColor" />
            <rect x="11.6" y="2" width="2.4" height="12" fill="currentColor" />
          </svg>
          <span>Stats</span>
        </button>
      </div>
      <div className="masthead-title">The Daily Hangman</div>
      <div className="masthead-row sub">
        <span>{formatEditorialDate(puzzle.date)}</span>
        <span className="mh-price">One guess at a time</span>
        <span>Puzzle №{String(puzzle.index + 1).padStart(3, '0')}</span>
      </div>
      <div className="rule-double" aria-hidden />
    </header>
  );
}
