import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://lmnbsauvjqursjxocsgf.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'sb_publishable_kUszCv6Cdq8rZgD-v7gY6w_DEkQ9pZA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CollegeRecord {
  id: string;
  name: string;
  code: string;
  domain?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  adminEmail?: string | null;
  adminName?: string | null;
  adminUid?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthedUserRecord {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  lastLogin: string;
  role?: string;
  college_id?: string | null;
  department_id?: string | null;
  class_id?: string | null;
  register_number?: string | null;
  requested_role?: string | null;
  approval_status?: string | null;
}
