import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'frontend/.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function check() {
  const { data, error } = await supabase.from('authed_users').select('*');
  console.log('Authed Users:', JSON.stringify(data, null, 2));
  if (error) console.error(error);
}

check();
