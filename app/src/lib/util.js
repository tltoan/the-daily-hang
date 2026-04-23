export function isLetter(ch) {
  return /^[A-Z]$/.test(ch);
}

export function answerLetters(ans) {
  return ans.replace(/[^A-Z]/g, '').split('');
}
