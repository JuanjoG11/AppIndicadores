import { supabase } from './src/lib/supabase.js';

async function run() {
  const now = new Date();
  const period = now.toISOString().slice(0, 7); // YYYY-MM
  const kpiId = `test-${now.getTime()}`;
  const insertRes = await supabase.from('kpi_updates').insert({
    kpi_id: kpiId,
    additional_data: { period, company: 'TYM' },
    value: Math.round(Math.random() * 100),
    cargo: 'Sistema',
    company_id: 'TYM',
    period: period,
  });
  console.log('Insert result:', insertRes);

  const { data, error } = await supabase
    .from('kpi_updates')
    .select('*')
    .eq('kpi_id', kpiId)
    .order('updated_at', { ascending: false })
    .limit(1);
  if (error) {
    console.error('Fetch error:', error);
  } else {
    console.log('Fetched record:', data);
  }
}

run().catch((e) => console.error('Runtime error:', e));
