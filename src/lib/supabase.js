import { createClient } from '@supabase/supabase-js';

// Estos valores deberían venir de variables de entorno (.env)
// Pero los dejo con placeholders para que el usuario los complete
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
