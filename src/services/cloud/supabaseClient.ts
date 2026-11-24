import { createClient } from '@supabase/supabase-js';

/**
 * Cliente único do Supabase (backup em nuvem — ver README.md desta pasta).
 *
 * As credenciais vêm do .env.local (nunca versionado). O Expo injeta no app
 * só as variáveis com prefixo EXPO_PUBLIC_; no Node (scripts/) elas chegam
 * por `--env-file=.env.local`. Aqui só entra a chave anon, que é pública e
 * fica limitada pelas políticas de RLS. A service_role nunca entra no app.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no .env.local (modelo em .env.example).',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Sem login na nuvem por enquanto: não há sessão para guardar no aparelho.
  auth: { persistSession: false, autoRefreshToken: false },
});
