// One persistent UUID per device, used to attribute plays to a user
// without requiring an account. Stored in localStorage; clearing it
// effectively starts a new identity.
const KEY = 'hangman-anon-id-v1';

export function getAnonId() {
  let id = null;
  try { id = localStorage.getItem(KEY); } catch {}
  if (!id) {
    id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : fallbackUuid();
    try { localStorage.setItem(KEY, id); } catch {}
  }
  return id;
}

export function rotateAnonId() {
  try { localStorage.removeItem(KEY); } catch {}
  return getAnonId();
}

function fallbackUuid() {
  // RFC 4122 v4-shaped fallback for environments without crypto.randomUUID.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
