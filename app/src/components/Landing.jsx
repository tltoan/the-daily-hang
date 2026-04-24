import { Eyebrow } from './Eyebrow.jsx';
import { answerLetters } from '../lib/util.js';

export function Landing({ puzzle, onStart, onHow }) {
  return (
    <section className="landing">
      <Eyebrow>Today&rsquo;s Puzzle</Eyebrow>
      <div className="landing-category">{puzzle.category}</div>
      <div className="landing-hint">
        <span className="letter-count">{answerLetters(puzzle.answer).length}</span>
        <span className="letter-count-lbl">letters</span>
        {puzzle.answer.includes(' ') && (
          <>
            <span className="landing-dot" />
            <span className="letter-count-lbl">{puzzle.answer.split(' ').length} words</span>
          </>
        )}
      </div>
      <div className="rule-single narrow" aria-hidden />
      <p className="landing-deck">
        One puzzle. Six wrong guesses. A new edition at midnight.
      </p>
      <div className="landing-actions">
        <button className="btn big" onClick={onStart}>Begin today&rsquo;s puzzle</button>
        <button className="btn ghost" onClick={onHow}>How to play</button>
      </div>
    </section>
  );
}
