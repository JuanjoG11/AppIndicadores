// test_permisos.js - Verifica si el anon key puede hacer UPDATE y DELETE
import { createClient } from '@supabase/supabase-js';
const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

// Intentar UPDATE en uno de los registros problemáticos (sin cambiar nada realmente)
const testId = 'b54ba317-98e7-4704-8a75-d14cd4736c0a'; // mantenimiento-equipos TYM

const { data, error } = await sb
    .from('kpi_updates')
    .update({ cargo: 'GESTIÓN HUMANA' }) // mismo valor, no cambia nada
    .eq('id', testId)
    .select('id');

if (error) {
    console.log('❌ UPDATE falló:', error.message, '| code:', error.code);
} else if (!data || data.length === 0) {
    console.log('⚠️  UPDATE sin error pero sin filas afectadas (RLS bloqueó silenciosamente)');
} else {
    console.log('✅ UPDATE funcionó. Filas afectadas:', data.length);
}

// Intentar DELETE
const { error: delErr, count } = await sb
    .from('kpi_updates')
    .delete({ count: 'exact' })
    .eq('id', 'ID-QUE-NO-EXISTE-TEST');

if (delErr) {
    console.log('❌ DELETE falló:', delErr.message, '| code:', delErr.code);
} else {
    console.log('✅ DELETE permitido (0 filas borradas como esperado en test con ID falso)');
}
