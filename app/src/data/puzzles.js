import { supabase } from '../lib/supabase.js';

// Daily puzzle is fetched from Supabase via the get_daily_puzzle RPC, which
// returns ONLY today's row. The full puzzle list never reaches the client.
export async function fetchDailyPuzzle() {
  const { data, error } = await supabase.rpc('get_daily_puzzle');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No puzzle available');
  const row = data[0];
  return {
    index: row.index_in_set,
    total: row.total,
    issue: row.issue,
    category: row.category,
    answer: row.answer,
    clue: row.clue,
    date: new Date(),
  };
}

// Archive list: past issues only, no answer/clue.
export async function fetchArchiveList() {
  const { data, error } = await supabase.rpc('list_archive');
  if (error) throw error;
  return (data || []).map((row) => ({
    issue: row.issue,
    index: row.index_in_set,
    total: row.total,
    date: row.puzzle_date,
    category: row.category,
  }));
}

// Single past puzzle by issue number.
export async function fetchArchivePuzzle(issue) {
  const { data, error } = await supabase.rpc('get_archive_puzzle', { p_issue: issue });
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Archive puzzle unavailable');
  const row = data[0];
  return {
    index: row.index_in_set,
    total: row.total,
    issue: row.issue,
    category: row.category,
    answer: row.answer,
    clue: row.clue,
    date: new Date(row.puzzle_date),
  };
}

export function formatEditorialDate(date = new Date()) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
