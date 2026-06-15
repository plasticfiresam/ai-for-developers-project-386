const GUEST_ID_KEY = 'guestId';

function generateUuidV4(): string {
  return crypto.randomUUID();
}

export function getOrCreateGuestId(): string {
  const existing = localStorage.getItem(GUEST_ID_KEY);
  if (existing) {
    return existing;
  }

  const guestId = generateUuidV4();
  localStorage.setItem(GUEST_ID_KEY, guestId);
  return guestId;
}

export function getGuestId(): string | null {
  return localStorage.getItem(GUEST_ID_KEY);
}
