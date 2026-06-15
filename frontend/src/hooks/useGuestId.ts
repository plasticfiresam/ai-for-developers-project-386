import { useMemo } from 'react';
import { getOrCreateGuestId } from '@/lib/guest-id';

export function useGuestId(): string {
  return useMemo(() => getOrCreateGuestId(), []);
}
