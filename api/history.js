import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data, error } = await supabase
    .from('obd2_diagnoses')
    .select('id, created_at, year, make, model, code, result')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Supabase fetch error:', error.message);
    return res.status(500).json({ error: 'Failed to load history' });
  }

  return res.status(200).json(data);
}
