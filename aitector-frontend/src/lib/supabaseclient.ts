import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_KEY ?? process.env.SUPABASE_ANON_KEY;

console.log(supabaseUrl);
console.log(supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn(
		"Supabase environment variables are missing. Make sure `.env.local` defines NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL / SUPABASE_KEY as fallback)."
	);
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
	auth: { persistSession: true, detectSessionInUrl: true },
});
