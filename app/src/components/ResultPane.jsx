import { Eyebrow } from './Eyebrow.jsx';
import { MAX_WRONG } from '../lib/storage.js';

export function ResultPane({ won, puzzle, wrong, countdown, onStats, onHow }) {
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
