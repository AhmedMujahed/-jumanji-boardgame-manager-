import { supabase } from './lib/supabase';

export const channel = supabase.channel('shop-realtime');

export type BroadcastEvent = 'session:update' | 'analytics:update';

export function initRealtime(onEvent: (evt: { type: BroadcastEvent; payload: any }) => void) {
  channel
    .on('broadcast', { event: 'session:update' }, ({ payload }) =>
      onEvent({ type: 'session:update', payload })
    )
    .on('broadcast', { event: 'analytics:update' }, ({ payload }) =>
      onEvent({ type: 'analytics:update', payload })
    )
    .subscribe();
}

export async function notifyAll(event: BroadcastEvent, payload: any) {
  await channel.send({ type: 'broadcast', event, payload });
}

// Presence (optional)
export function startPresence(userId: string, role: 'owner' | 'gm') {
  channel.on('presence', { event: 'sync' }, () => {
    // const state = channel.presenceState();
    // console.log('presence', state);
  });
  channel.track({ userId, role });
}


