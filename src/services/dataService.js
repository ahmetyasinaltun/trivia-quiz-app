import { getSupabaseClient } from '../lib/supabase';

export async function fetchQuestionsByCategory(categoryKey) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase yapılandırması eksik. EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_ANON_KEY ayarlı mı?');
  }

  const { data, error } = await supabase
    .from('questions')
    .select('id,text,options,correct_index,category_key')
    .eq('category_key', categoryKey)
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Supabase select hatası: ${error.message}`);
  }

  return (data || []).map((row) => ({ q: row.text, a: row.options, c: row.correct_index }));
}


