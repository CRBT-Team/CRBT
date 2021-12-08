import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseKey = process.env['SUPABASE_KEY'];

export const db = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null;
