import * as functions from 'firebase-functions';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://lmnbsauvjqursjxocsgf.supabase.co';
// WARNING: Since this runs in a backend environment, it's safe to use the Service Role Key here
// Or at least the Anon key if RLS allows deletion (which it might).
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_kUszCv6Cdq8rZgD-v7gY6w_DEkQ9pZA';
const supabase = createClient(supabaseUrl, supabaseKey);

export const syncUserDeletion = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  console.log(`User ${uid} deleted in Firebase, deleting from Supabase...`);

  try {
    const { error } = await supabase
      .from('authed_users')
      .delete()
      .eq('uid', uid);

    if (error) {
      console.error('Error deleting user from Supabase:', error);
    } else {
      console.log(`Successfully deleted user ${uid} from Supabase.`);
    }
  } catch (err) {
    console.error('Unexpected error during deletion:', err);
  }
});
