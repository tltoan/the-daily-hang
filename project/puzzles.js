// Daily puzzles — themed words/phrases.
// Each puzzle has a category, answer, and optional clue.
// The "day" is chosen deterministically from the date so everyone gets the same one.

window.PUZZLES = [
  { category: 'Films',          answer: 'CASABLANCA',         clue: 'Here\u2019s looking at you, kid.' },
  { category: 'Foods',          answer: 'SOURDOUGH',          clue: 'A loaf with a starter.' },
  { category: 'Cities',         answer: 'REYKJAVIK',          clue: 'Capital at 64\u00B0N.' },
  { category: 'Books',          answer: 'MOBY DICK',          clue: 'Call me Ishmael.' },
  { category: 'Animals',        answer: 'PANGOLIN',           clue: 'Scaled and nocturnal.' },
  { category: 'Phrases',        answer: 'OVER THE MOON',      clue: 'Thoroughly delighted.' },
  { category: 'Films',          answer: 'METROPOLIS',         clue: 'Fritz Lang, 1927.' },
  { category: 'Foods',          answer: 'TIRAMISU',           clue: 'Pick-me-up from Italy.' },
  { category: 'Cities',         answer: 'MARRAKECH',          clue: 'Red walls, Atlas views.' },
  { category: 'Books',          answer: 'BELOVED',            clue: 'Toni Morrison, 1987.' },
  { category: 'Animals',        answer: 'AXOLOTL',            clue: 'Never quite grows up.' },
  { category: 'Phrases',        answer: 'BITE THE BULLET',    clue: 'Endure something painful.' },
  { category: 'Films',          answer: 'CHINATOWN',          clue: 'Forget it, Jake.' },
  { category: 'Foods',          answer: 'GAZPACHO',           clue: 'Served cold, Andalusian.' },
  { category: 'Cities',         answer: 'VALPARAISO',         clue: 'Pacific port of hills.' },
  { category: 'Books',          answer: 'DUNE',               clue: 'Fear is the mind-killer.' },
  { category: 'Animals',        answer: 'NARWHAL',            clue: 'Unicorn of the sea.' },
  { category: 'Phrases',        answer: 'PIECE OF CAKE',      clue: 'Trivially easy.' },
  { category: 'Films',          answer: 'AMELIE',             clue: 'Montmartre, 2001.' },
  { category: 'Foods',          answer: 'BAKLAVA',            clue: 'Phyllo, pistachio, syrup.' },
  { category: 'Cities',         answer: 'KATHMANDU',          clue: 'In the shadow of the Himalayas.' },
  { category: 'Books',          answer: 'MIDDLEMARCH',        clue: 'George Eliot\u2019s masterwork.' },
  { category: 'Animals',        answer: 'CAPYBARA',           clue: 'The world\u2019s largest rodent.' },
  { category: 'Phrases',        answer: 'BREAK A LEG',        clue: 'Good luck, actor.' },
  { category: 'Films',          answer: 'RASHOMON',           clue: 'Four tellings, one crime.' },
  { category: 'Foods',          answer: 'CEVICHE',            clue: 'Cured in citrus.' },
  { category: 'Cities',         answer: 'LJUBLJANA',          clue: 'Dragon bridge, green capital.' },
  { category: 'Books',          answer: 'THE ODYSSEY',        clue: 'A very long way home.' },
  { category: 'Animals',        answer: 'OKAPI',              clue: 'Striped legs, giraffe cousin.' },
  { category: 'Phrases',        answer: 'BURNING THE MIDNIGHT OIL', clue: 'Working deep into the night.' },
  { category: 'Films',          answer: 'NOSFERATU',          clue: 'The shadow on the stairs.' },
];

// Deterministic daily index: days since an epoch, mod count.
window.getDailyIndex = function (date = new Date()) {
  const epoch = Date.UTC(2026, 0, 1); // Jan 1 2026
  const d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const day = Math.floor((d - epoch) / 86400000);
  return ((day % window.PUZZLES.length) + window.PUZZLES.length) % window.PUZZLES.length;
};

window.getDailyPuzzle = function (date = new Date()) {
  const idx = window.getDailyIndex(date);
  const p = window.PUZZLES[idx];
  // Derive an "issue number" from days-since-a-fixed-launch for editorial flavor.
  const launch = Date.UTC(2025, 0, 1);
  const d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const issue = Math.floor((d - launch) / 86400000) + 1;
  return { ...p, index: idx, issue, date };
};

window.formatEditorialDate = function (date = new Date()) {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};
