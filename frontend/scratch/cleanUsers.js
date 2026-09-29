import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmnbsauvjqursjxocsgf.supabase.co';
const supabaseAnonKey = 'sb_publishable_kUszCv6Cdq8rZgD-v7gY6w_DEkQ9pZA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clean() {
  const { data, error } = await supabase.from('authed_users').delete().neq('email', 'amirthavarsshan0908@gmail.com');
  console.log('Deleted extra users:', error || 'Success');
}

clean();
