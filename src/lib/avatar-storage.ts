
// src/lib/avatar-storage.ts
'use client';

const AVATAR_STORAGE_PREFIX = 'avatar_';

// Note: This is a simple client-side storage solution. 
// For a production app, you would upload these to a cloud storage service.

export function saveAvatar(employeeId: string, avatarDataUrl: string): void {
  try {
    localStorage.setItem(`${AVATAR_STORAGE_PREFIX}${employeeId}`, avatarDataUrl);
  } catch (error) {
    console.error(`Failed to save avatar for employee ${employeeId}:`, error);
    // Here you could implement a more robust strategy, like clearing old avatars
    // For now, we'll throw the error so the user gets feedback via toast.
    throw error;
  }
}

export function getAvatar(employeeId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${AVATAR_STORAGE_PREFIX}${employeeId}`);
}

export function removeAvatar(employeeId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${AVATAR_STORAGE_PREFIX}${employeeId}`);
}
