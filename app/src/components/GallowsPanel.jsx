import { Visuals } from '../visuals/index.jsx';
import { VISUAL_OPTIONS } from '../lib/palettes.js';
import { MAX_WRONG } from '../lib/storage.js';
import { Eyebrow } from './Eyebrow.jsx';

export function GallowsPanel({ visual, wrong }) {
  const V = Visuals[visual] || Visuals.gallows;
  const pips = Array.from({ length: MAX_WRONG }, (_, i) => i < wrong);
  return (
    <aside className="gallows-panel">
      <Eyebrow>{VISUAL_OPTIONS.find((o) => o.value === visual)?.label || 'Gallows'}</Eyebrow>
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
