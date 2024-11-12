import { createClient } from "@supabase/supabase-js";
import { env } from "../env.js";
import { Database } from "./supabase.types.js";

export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
