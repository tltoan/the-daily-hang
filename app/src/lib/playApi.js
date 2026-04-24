import { supabase } from './supabase.js';

export async function fetchUserState(anonId) {
  const { data, error } = await supabase.rpc('get_user_state', { p_anon_id: anonId });
  if (error) throw error;
  return data; // { stats, today, archive }
}

export async function recordPlay(anonId, issue, mode, won, wrong) {
  const { error } = await supabase.rpc('record_play', {
    p_anon_id: anonId,
    p_issue:   issue,
    p_mode:    mode,
    p_won:     won,
    p_wrong:   wrong,
  });
  if (error) throw error;
}

export async function fetchTodayCount() {
  const { data, error } = await supabase.rpc('get_today_count');
  if (error) throw error;
  return data; // { total, won, win_pct }
}

export async function deleteMyPlay(anonId, issue) {
  const { error } = await supabase.rpc('delete_my_play', { p_anon_id: anonId, p_issue: issue });
  if (error) throw error;
}

export async function deleteMyPlays(anonId) {
  const { error } = await supabase.rpc('delete_my_plays', { p_anon_id: anonId });
  if (error) throw error;
}
