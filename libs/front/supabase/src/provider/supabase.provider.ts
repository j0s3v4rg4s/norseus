import { SupabaseConfig } from '../interfaces/supabase-config.interfaces';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { makeEnvironmentProviders, InjectionToken } from '@angular/core';

export const SUPABASE = new InjectionToken<SupabaseClient>('SUPABASE_CLIENT');

export const supabaseProvider = (config: SupabaseConfig) => {
  const supabase = createClient(config.url, config.key);
  return makeEnvironmentProviders([
    {
      provide: SUPABASE,
      useFactory: () => {
        return supabase;
      },
    },
  ]);
};
