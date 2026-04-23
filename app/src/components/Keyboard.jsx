import { useMemo } from 'react';
import { answerLetters } from '../lib/util.js';

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

export function Keyboard({ answer, guessed, disabled, onGuess }) {
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
