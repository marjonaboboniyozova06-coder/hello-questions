import { supabase } from "@/integrations/supabase/client";

const TOKEN_KEY = "linguo-admin-token";

export const adminToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export async function adminCall<T = any>(action: string, payload?: any): Promise<T> {
  const headers: Record<string, string> = {};
  const tok = adminToken.get();
  if (tok) headers["x-admin-token"] = tok;
  const { data, error } = await supabase.functions.invoke("admin", {
    body: { action, payload },
    headers,
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}
