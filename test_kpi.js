// test_kpi.js
const { supabase } = require('./src/lib/supabase');
const { getMonthKey } = require('./src/data/mockData');
(async () => {
  try {
    // Insert a test KPI update
    const testKPIId = 'test-kpi-id';
    const additionalData = {
      company: 'TEST_COMPANY',
      period: getMonthKey(new Date().toISOString()),
      brand: 'GLOBAL',
    };
    const value = 123.45;
    const { error: insertError } = await supabase.from('kpi_updates').insert({
      kpi_id: testKPIId,
      additional_data: additionalData,
      value,
      cargo: 'Tester',
      company_id: additionalData.company,
      period: additionalData.period,
    });
    if (insertError) throw insertError;
    console.log('Insert successful');
    // Fetch back the latest record for this KPI
    const { data, error: fetchError } = await supabase
      .from('kpi_updates')
      .select('*')
      .eq('kpi_id', testKPIId)
      .order('updated_at', { ascending: false })
      .limit(1);
    if (fetchError) throw fetchError;
    console.log('Fetched record:', JSON.stringify(data[0] || null));
  } catch (e) {
    console.error('Error during test:', e);
    process.exit(1);
  }
})();
