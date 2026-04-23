import { Modal } from './Modal.jsx';
import { Eyebrow } from './Eyebrow.jsx';

export function HowToPlay({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="how-to-title">
      <Eyebrow>A Brief Guide</Eyebrow>
      <h2 id="how-to-title" className="modal-title">How to Play</h2>
      <div className="rule-single" aria-hidden />
      <ol className="how-to-list">
        <li>
          <span className="how-num">1</span>
          <div>
            <strong>Guess the hidden word, one letter at a time.</strong>{' '}
            Each puzzle belongs to a category printed above the dashes.
          </div>
        </li>
        <li>
          <span className="how-num">2</span>
          <div>
            <strong>Correct letters</strong> fill every dash they appear on.{' '}
            <strong>Wrong letters</strong> cost you a guess.
          </div>
        </li>
        <li>
          <span className="how-num">3</span>
          <div>
            You have <strong>six wrong guesses</strong>. On the sixth, the figure is
            complete — and the puzzle is lost.
          </div>
        </li>
        <li>
          <span className="how-num">4</span>
          <div>
            A <strong>new puzzle arrives at midnight</strong>, local time.
            One per day. No do-overs.
          </div>
        </li>
      </ol>
      <div className="how-demo">
        <div className="how-demo-word">
          <span className="letter known"><span className="letter-char">C</span><span className="letter-rule" /></span>
          <span className="letter"><span className="letter-char">&nbsp;</span><span className="letter-rule" /></span>
          <span className="letter known"><span className="letter-char">F</span><span className="letter-rule" /></span>
          <span className="letter known"><span className="letter-char">F</span><span className="letter-rule" /></span>
          <span className="letter"><span className="letter-char">&nbsp;</span><span className="letter-rule" /></span>
          <span className="letter"><span className="letter-char">&nbsp;</span><span className="letter-rule" /></span>
        </div>
        <div className="how-demo-caption">Example: guessing <em>F</em> fills both dashes.</div>
      </div>
    </Modal>
  );
}
