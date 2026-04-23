import { Eyebrow } from './Eyebrow.jsx';
import { MAX_WRONG } from '../lib/storage.js';
import { PUZZLES } from '../data/puzzles.js';

export function AlreadyPlayed({ record, puzzle, countdown, onStats, onPeek }) {
  const nextNumber = String(((puzzle.index + 1) % PUZZLES.length) + 1).padStart(3, '0');
  return (
    <section className="already">
      <Eyebrow>You&rsquo;ve read today&rsquo;s edition</Eyebrow>
      <h2 className="result-headline">
        {record.won ? 'You solved it.' : 'Better luck tomorrow.'}
      </h2>
      <p className="result-deck">
        Come back at midnight for Puzzle №{nextNumber}.
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
