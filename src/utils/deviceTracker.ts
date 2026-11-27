/**
 * Device Session Helper for Ama Baby Marketplace
 * Generates and persists a local browser session identifier for marketplace listings and order records.
 */

const DEVICE_STORAGE_KEY = 'ama_device_hardware_id';
const DEVICE_FP_KEY = 'ama_device_fingerprint_hash';

export async function getOrGenerateDeviceId(): Promise<string> {
  if (typeof window === 'undefined') return 'server-env';

  // 1. Check existing stored hardware ID
  let stored = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (stored && /^[a-zA-Z0-9_\-]{8,128}$/.test(stored)) {
    return stored;
  }

  // 2. Compute lightweight client hardware characteristics
  try {
    const nav = window.navigator as any;
    const scr = window.screen;
    const parts = [
      nav.userAgent || '',
      nav.language || '',
      nav.hardwareConcurrency || 4,
      nav.deviceMemory || 4,
      scr.width || 0,
      scr.height || 0,
      scr.colorDepth || 24,
      Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    ].join('###');

    const encoder = new TextEncoder();
    const data = encoder.encode(parts);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fpHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const generatedId = `dev-hw-${fpHash}-${randomSuffix}`;

    localStorage.setItem(DEVICE_STORAGE_KEY, generatedId);
    localStorage.setItem(DEVICE_FP_KEY, fpHash);
    return generatedId;
  } catch {
    const fallbackId = `dev-hw-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`;
    localStorage.setItem(DEVICE_STORAGE_KEY, fallbackId);
    return fallbackId;
  }
}

export async function fetchClientIpAddress(): Promise<string> {
  try {
    const res = await fetch('/api/client-ip');
    if (res.ok) {
      const data = await res.json();
      if (data.ip) return String(data.ip).slice(0, 64);
    }
  } catch {}
  return '127.0.0.1';
}

export function isDeviceLocallyBanned(): boolean {
  try {
    return localStorage.getItem('ama_marketplace_banned') === 'true';
  } catch {
    return false;
  }
}

export function markDeviceAsBanned(reason: string) {
  try {
    localStorage.setItem('ama_marketplace_banned', 'true');
    localStorage.setItem('ama_marketplace_ban_reason', reason);
  } catch {}
}
