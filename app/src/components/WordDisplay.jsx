export function WordDisplay({ answer, guessed, reveal }) {
  const words = answer.split(' ');
  return (
    <div className="word-display">
      {words.map((w, wi) => (
        <div key={wi} className="word-group">
          {w.split('').map((ch, i) => {
            const known = guessed.has(ch) || reveal;
            const missed = reveal && !guessed.has(ch);
            return (
              <span key={i} className={`letter ${known ? 'known' : ''} ${missed ? 'missed' : ''}`}>
                <span className="letter-char">{known ? ch : ' '}</span>
                <span className="letter-rule" />
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
