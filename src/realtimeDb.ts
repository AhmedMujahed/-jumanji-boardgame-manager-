import { supabase } from '@/lib/supabase-browser';

export function watchSessions(onChange: (payload: any) => void) {
  return supabase
    .channel('db:sessions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
      onChange(payload);
    })
    .subscribe();
}


