import { useEffect, useState } from 'react';
import { Modal } from './Modal.jsx';
import { Eyebrow } from './Eyebrow.jsx';
import { fetchArchiveList } from '../data/puzzles.js';
import { MAX_WRONG } from '../lib/storage.js';

function formatArchiveDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00Z');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function ArchiveModal({ open, onClose, onPlay, archive = {} }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setItems(null);
    setError(null);
    fetchArchiveList()
      .then((rows) => { if (!cancelled) setItems(rows); })
      .catch((e) => { if (!cancelled) setError(e); });
    return () => { cancelled = true; };
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} labelledBy="archive-title">
      <Eyebrow>Back Issues</Eyebrow>
      <h2 id="archive-title" className="modal-title">Archive</h2>
      <div className="rule-single" aria-hidden />

      {error && (
        <p className="archive-empty">Couldn’t load the archive. Try again in a moment.</p>
      )}

      {!error && items === null && (
        <p className="archive-empty">Pulling back issues…</p>
      )}

      {!error && items && items.length === 0 && (
        <p className="archive-empty">
          No back issues yet. The archive opens with tomorrow’s edition.
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="archive-list">
          {items.map((it) => {
            const rec = archive[String(it.issue)];
            const status = rec
              ? (rec.won ? 'solved' : 'unsolved')
              : 'unread';
            const statusLabel = rec
              ? (rec.won ? `Solved · ${rec.wrong}/${MAX_WRONG}` : `Unsolved · ${rec.wrong}/${MAX_WRONG}`)
              : 'Unread';
            return (
              <li key={it.issue}>
                <button className="archive-row" onClick={() => onPlay(it)}>
                  <span className="archive-issue">№{String(it.index + 1).padStart(3, '0')}</span>
                  <span className="archive-meta">
                    <span className="archive-cat">{it.category}</span>
                    <span className="archive-date">{formatArchiveDate(it.date)}</span>
                  </span>
                  <span className={`archive-status ${status}`}>{statusLabel}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
