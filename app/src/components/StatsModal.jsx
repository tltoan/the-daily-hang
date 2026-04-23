import { Modal } from './Modal.jsx';
import { Eyebrow } from './Eyebrow.jsx';

export function StatsModal({ open, onClose, stats, countdown }) {
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
