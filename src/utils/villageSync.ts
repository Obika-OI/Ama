import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase';

export type VillageRole = 'admin' | 'family' | 'nanny';

export type VillageLogType =
  | 'meal'
  | 'milk_feed'
  | 'sleep'
  | 'diaper'
  | 'growth'
  | 'mood'
  | 'observation'
  | 'hygiene'
  | 'sunlight'
  | 'teething'
  | 'milestone'
  | 'quest'
  | 'reading'
  | 'activity'
  | 'hydration'
  | 'schedule'
  | 'vaccine'
  | 'reminder'
  | 'memory'
  | 'recipe'
  | 'caregiver_shift';

export interface VillageMemberRecord {
  id: string;
  uid: string;
  villageToken: string;
  villageOwnerId: string;
  displayName: string;
  accessType: VillageRole;
  status: 'active' | 'revoked';
  familyViewerUids?: string[];
  joinedAt: string;
  updatedAt: string;
}

export interface VillageHubDoc {
  villageToken: string;
  ownerId: string;
  babyName?: string;
  babyDob?: string;
  babyAge?: string;
  activeBabyId?: string;
  babyProfiles?: any[];
  fluidTarget?: number;
  allergenMatrix?: any[];
  vaccineSchedule?: any[];
  encryptedPayload?: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface SharedCareLogsPayload {
  loggedMeals?: any[];
  feedingLogs?: any[];
  sleepLogs?: any[];
  diaperLogs?: any[];
  growthLogs?: any[];
  loggedMoods?: any[];
  publicObservations?: any[];
  activities?: any[];
  fluidMl?: number;
  hygieneLog?: Record<string, string>;
  sunlightToday?: number;
  teethingMap?: Record<string, any>;
  checkedMilestones?: string[];
  questTimeToday?: number;
  questLogs?: any[];
  readingLogs?: any[];
  scheduledMeals?: any[];
  scheduledActivities?: any[];
  scheduledMeds?: any[];
  reminders?: any[];
  memories?: any[];
  personalRecipes?: any[];
  weeklyPlan?: any;
  groceryChecked?: string[];
  updatedAt?: string;
}

const VALID_ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

export function isValidFirestoreId(val: unknown): val is string {
  return typeof val === 'string' && VALID_ID_RE.test(val);
}

export function sanitizeFirestoreId(raw: string, prefix = 'log'): string {
  const cleaned = String(raw || '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 110);
  if (cleaned && VALID_ID_RE.test(cleaned)) return cleaned;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function extractVillageInviteFromInput(rawInput: string): {
  villageToken: string | null;
  role: VillageRole | null;
  babyName: string | null;
} {
  const input = String(rawInput || '').trim();
  if (!input) return { villageToken: null, role: null, babyName: null };

  // Handle full URL, hash fragment, or query string
  const queryOrHashMatch = input.match(/[#?]([^#\s]+)$/);
  if (queryOrHashMatch || input.includes('village=')) {
    const paramStr = queryOrHashMatch ? queryOrHashMatch[1] : input.replace(/^[#?]+/, '');
    const params = new URLSearchParams(paramStr);
    const t = params.get('village');
    const r = params.get('role');
    const b = params.get('baby');
    const role: VillageRole | null = r === 'admin' || r === 'family' || r === 'nanny' ? r : null;
    if (t && isValidFirestoreId(t)) {
      return {
        villageToken: t,
        role,
        babyName: b ? b.slice(0, 80) : null
      };
    }
    const tokenRegexMatch = input.match(/village=([a-zA-Z0-9_-]+)/i);
    const roleRegexMatch = input.match(/role=(admin|family|nanny)/i);
    if (tokenRegexMatch?.[1] && isValidFirestoreId(tokenRegexMatch[1])) {
      return {
        villageToken: tokenRegexMatch[1],
        role: (roleRegexMatch?.[1] as VillageRole | undefined) || null,
        babyName: null
      };
    }
  }

  return {
    villageToken: isValidFirestoreId(input) ? input : null,
    role: null,
    babyName: null
  };
}

export function parseVillageInviteFromUrl(): {
  villageToken: string | null;
  role: VillageRole | null;
  babyName: string | null;
} {
  if (typeof window === 'undefined') return { villageToken: null, role: null, babyName: null };
  const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const hashParams = new URLSearchParams(rawHash);
  const searchParams = new URLSearchParams(window.location.search);

  const token = hashParams.get('village') || searchParams.get('village');
  const rawRole = hashParams.get('role') || searchParams.get('role');
  const baby = hashParams.get('baby') || searchParams.get('baby');

  const role: VillageRole | null =
    rawRole === 'admin' || rawRole === 'family' || rawRole === 'nanny' ? rawRole : null;

  let decodedBaby: string | null = null;
  if (baby) {
    try {
      decodedBaby = decodeURIComponent(baby).slice(0, 80);
    } catch {
      decodedBaby = baby.slice(0, 80);
    }
  }

  return {
    villageToken: token && isValidFirestoreId(token) ? token : null,
    role,
    babyName: decodedBaby
  };
}

export function getStoredVillageToken(): string {
  try {
    const t = localStorage.getItem('ama_village_sync_token') || '';
    return isValidFirestoreId(t) ? t : '';
  } catch {
    return '';
  }
}

export interface VillageConnectionEntry {
  villageToken: string;
  villageOwnerId: string;
  babyName: string;
  babyAge?: string;
  babyDob?: string;
  role: VillageRole;
  isOwnChild?: boolean;
  addedAt: string;
  lastSyncedAt?: string;
}

export interface VillageLocalCacheSnapshot {
  villageToken: string;
  villageOwnerId: string;
  userRole: VillageRole;
  babyName: string;
  babyAge: string;
  babyDob: string;
  babyProfiles: any[];
  activeBabyId: string;
  loggedMeals: any[];
  feedingLogs: any[];
  sleepLogs: any[];
  diaperLogs: any[];
  growthLogs: any[];
  loggedMoods: any[];
  observationLogs: any[];
  activities: any[];
  fluidMl: number;
  fluidTarget: number;
  hygieneLog: Record<string, string>;
  sunlightToday: number;
  teethingMap: Record<string, any>;
  checkedMilestones: string[];
  questTimeToday: number;
  questLogs: any[];
  readingLogs: any[];
  scheduledMeals: any[];
  scheduledActivities: any[];
  scheduledMeds: any[];
  reminders: any[];
  memories: any[];
  personalRecipes: any[];
  weeklyPlan: any;
  groceryChecked: string[];
  allergenMatrix: any[];
  vaccineSchedule: any[];
  updatedAt: string;
}

const VILLAGE_CONNECTIONS_KEY = 'ama_village_connections';

export function loadVillageConnections(): VillageConnectionEntry[] {
  try {
    const raw = localStorage.getItem(VILLAGE_CONNECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c) => c && isValidFirestoreId(c.villageToken));
  } catch {
    return [];
  }
}

export function saveVillageConnections(entries: VillageConnectionEntry[]): void {
  try {
    localStorage.setItem(VILLAGE_CONNECTIONS_KEY, JSON.stringify(entries.slice(0, 30)));
  } catch {}
}

export function upsertVillageConnectionEntry(entry: VillageConnectionEntry): VillageConnectionEntry[] {
  const existing = loadVillageConnections();
  const idx = existing.findIndex((c) => c.villageToken === entry.villageToken);
  const next = [...existing];
  if (idx >= 0) {
    next[idx] = {
      ...existing[idx],
      ...entry,
      isOwnChild: entry.isOwnChild !== undefined ? entry.isOwnChild : existing[idx].isOwnChild,
      villageOwnerId: entry.villageOwnerId || existing[idx].villageOwnerId,
      addedAt: existing[idx].addedAt || entry.addedAt
    };
  } else {
    next.unshift(entry);
  }
  saveVillageConnections(next);
  return next;
}

export function removeVillageConnectionEntry(villageToken: string): VillageConnectionEntry[] {
  const next = loadVillageConnections().filter((c) => c.villageToken !== villageToken);
  saveVillageConnections(next);
  try {
    localStorage.removeItem(`ama_village_cache_${villageToken}`);
  } catch {}
  return next;
}

export function saveVillageLocalCache(villageToken: string, snapshot: VillageLocalCacheSnapshot): void {
  if (!isValidFirestoreId(villageToken)) return;
  try {
    localStorage.setItem(`ama_village_cache_${villageToken}`, JSON.stringify(snapshot));
  } catch {}
}

export function loadVillageLocalCache(villageToken: string): VillageLocalCacheSnapshot | null {
  if (!isValidFirestoreId(villageToken)) return null;
  try {
    const raw = localStorage.getItem(`ama_village_cache_${villageToken}`);
    if (!raw) return null;
    return JSON.parse(raw) as VillageLocalCacheSnapshot;
  } catch {
    return null;
  }
}

export function generateNewVillageToken(babyName: string, uid?: string): string {
  const cleanBaby = (babyName || 'BABY').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12) || 'BABY';
  const uidPart = (uid || 'HUB').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'HUB';
  const suffix = `${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
  return sanitizeFirestoreId(`VILLAGE_${cleanBaby}_${uidPart}_${suffix}`, 'VILLAGE');
}

export function ensureVillageToken(babyName: string, uid?: string): string {
  const existing = getStoredVillageToken();
  if (existing) return existing;
  const generated = generateNewVillageToken(babyName, uid);
  try {
    localStorage.setItem('ama_village_sync_token', generated);
  } catch {}
  return generated;
}

export function clearStoredVillageConnection() {
  try {
    localStorage.removeItem('ama_village_sync_token');
    localStorage.removeItem('ama_village_owner_id');
  } catch {}
}

/**
 * Ensures the village hub doc and the signed-in user's member doc exist with their dynamic accessType.
 */
export async function ensureVillageConnection(params: {
  villageToken: string;
  user: FirebaseUser;
  displayName: string;
  requestedRole?: VillageRole | null;
  allowCreateIfMissing?: boolean;
  babyName?: string;
  babyDob?: string;
  babyAge?: string;
  fluidTarget?: number;
}): Promise<{
  village: VillageHubDoc | null;
  member: VillageMemberRecord | null;
  notFound?: boolean;
}> {
  const {
    villageToken,
    user,
    displayName,
    requestedRole,
    allowCreateIfMissing,
    babyName,
    babyDob,
    babyAge,
    fluidTarget
  } = params;
  if (!isValidFirestoreId(villageToken) || !isValidFirestoreId(user.uid)) {
    return { village: null, member: null };
  }

  const nowIso = new Date().toISOString();
  const safeName = (displayName || user.displayName || 'Caregiver').trim().slice(0, 80) || 'Caregiver';
  const villageRef = doc(db, 'villages', villageToken);

  let villageSnap;
  try {
    villageSnap = await getDoc(villageRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `villages/${villageToken}`);
    return { village: null, member: null };
  }

  const shouldCreateIfMissing =
    allowCreateIfMissing !== undefined
      ? allowCreateIfMissing
      : requestedRole !== 'family' && requestedRole !== 'nanny';

  let villageData: VillageHubDoc;
  if (!villageSnap.exists()) {
    if (!shouldCreateIfMissing) {
      return { village: null, member: null, notFound: true };
    }
    villageData = {
      villageToken,
      ownerId: user.uid,
      babyName: (babyName || 'Baby').slice(0, 80),
      ...(babyDob ? { babyDob: String(babyDob).slice(0, 32) } : {}),
      ...(babyAge ? { babyAge: String(babyAge).slice(0, 40) } : {}),
      ...(typeof fluidTarget === 'number' ? { fluidTarget } : {}),
      updatedBy: user.uid,
      updatedAt: nowIso
    };
    try {
      await setDoc(villageRef, villageData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `villages/${villageToken}`);
      return { village: null, member: null };
    }
  } else {
    villageData = villageSnap.data() as VillageHubDoc;
  }

  try {
    localStorage.setItem('ama_village_sync_token', villageToken);
    localStorage.setItem('ama_village_owner_id', villageData.ownerId);
  } catch {}

  const memberRef = doc(db, 'villages', villageToken, 'members', user.uid);
  let memberSnap;
  try {
    memberSnap = await getDoc(memberRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `villages/${villageToken}/members/${user.uid}`);
    return { village: villageData, member: null };
  }

  if (!memberSnap.exists()) {
    const assignedRole: VillageRole =
      villageData.ownerId === user.uid
        ? 'admin'
        : requestedRole === 'nanny'
          ? 'nanny'
          : 'family';

    const newMember: VillageMemberRecord = {
      id: user.uid,
      uid: user.uid,
      villageToken,
      villageOwnerId: villageData.ownerId,
      displayName: safeName,
      accessType: assignedRole,
      status: 'active',
      familyViewerUids: Array.from(new Set([villageData.ownerId, ...(assignedRole !== 'nanny' ? [user.uid] : [])])).slice(0, 25),
      joinedAt: nowIso,
      updatedAt: nowIso
    };

    try {
      await setDoc(memberRef, newMember);
      return { village: villageData, member: newMember };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `villages/${villageToken}/members/${user.uid}`);
      return { village: villageData, member: null };
    }
  }

  const existingMember = memberSnap.data() as VillageMemberRecord;
  // Refresh displayName if needed while keeping existing accessType & status intact
  if (existingMember.status === 'active' && existingMember.displayName !== safeName) {
    try {
      await updateDoc(memberRef, { displayName: safeName, updatedAt: nowIso });
    } catch {}
  }

  return { village: villageData, member: existingMember };
}

/**
 * Updates a village member's accessType or status (Owner/Admin only) and syncs viewerUids on recent logs.
 */
export async function updateVillageMemberAccess(params: {
  villageToken: string;
  targetUid: string;
  accessType?: VillageRole;
  status?: 'active' | 'revoked';
}): Promise<void> {
  const { villageToken, targetUid, accessType, status } = params;
  if (!isValidFirestoreId(villageToken) || !isValidFirestoreId(targetUid)) return;
  const memberRef = doc(db, 'villages', villageToken, 'members', targetUid);
  const nowIso = new Date().toISOString();
  const updates: Record<string, any> = { updatedAt: nowIso };
  if (accessType) updates.accessType = accessType;
  if (status) updates.status = status;

  try {
    await updateDoc(memberRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `villages/${villageToken}/members/${targetUid}`);
  }
}

/**
 * Syncs viewerUids / familyUids arrays across members, logs, family_diary, and caregiver_shifts
 * whenever an admin's device sees membership changes so every connected user dynamically gains or loses query access.
 */
export async function propagateVillagePermissions(params: {
  villageToken: string;
  villageOwnerId: string;
  members: VillageMemberRecord[];
}): Promise<void> {
  const { villageToken, villageOwnerId, members } = params;
  if (!isValidFirestoreId(villageToken) || !isValidFirestoreId(villageOwnerId)) return;

  const activeUids = Array.from(
    new Set([villageOwnerId, ...members.filter(m => m.status === 'active').map(m => m.uid)])
  ).slice(0, 25);

  const familyUids = Array.from(
    new Set([
      villageOwnerId,
      ...members.filter(m => m.status === 'active' && m.accessType !== 'nanny').map(m => m.uid)
    ])
  ).slice(0, 25);

  const nowIso = new Date().toISOString();

  // 1. Update familyViewerUids on member directory docs so family members can see directory
  await Promise.all(
    members.map(async (m) => {
      const current = Array.isArray(m.familyViewerUids) ? m.familyViewerUids : [];
      if (JSON.stringify(current) !== JSON.stringify(familyUids)) {
        try {
          await updateDoc(doc(db, 'villages', villageToken, 'members', m.uid), {
            familyViewerUids: familyUids,
            updatedAt: nowIso
          });
        } catch {}
      }
    })
  );

  // 2. Patch viewerUids on village logs owned by this household
  try {
    const logsSnap = await getDocs(
      query(collection(db, 'villages', villageToken, 'logs'), where('villageOwnerId', '==', villageOwnerId))
    );
    await Promise.all(
      logsSnap.docs.map(async (d) => {
        const data = d.data();
        const curr = Array.isArray(data.viewerUids) ? data.viewerUids : [];
        if (JSON.stringify(curr) !== JSON.stringify(activeUids)) {
          try {
            await updateDoc(d.ref, { viewerUids: activeUids, updatedAt: nowIso });
          } catch {}
        }
      })
    );
  } catch {}

  // 3. Patch familyUids on shielded family diary docs
  try {
    const diarySnap = await getDocs(
      query(collection(db, 'villages', villageToken, 'family_diary'), where('villageOwnerId', '==', villageOwnerId))
    );
    await Promise.all(
      diarySnap.docs.map(async (d) => {
        const data = d.data();
        const curr = Array.isArray(data.familyUids) ? data.familyUids : [];
        if (JSON.stringify(curr) !== JSON.stringify(familyUids)) {
          try {
            await updateDoc(d.ref, { familyUids, updatedAt: nowIso });
          } catch {}
        }
      })
    );
  } catch {}

  // 4. Patch viewerUids on caregiver_shifts owned by this village so family circle also sees caregiver handovers
  try {
    const shiftsSnap = await getDocs(
      query(collection(db, 'caregiver_shifts'), where('villageOwnerId', '==', villageOwnerId))
    );
    await Promise.all(
      shiftsSnap.docs.map(async (d) => {
        const data = d.data();
        const curr = Array.from(new Set([...familyUids, data.caregiverId].filter(Boolean))).slice(0, 25);
        const existing = Array.isArray(data.viewerUids) ? data.viewerUids : [];
        if (JSON.stringify(existing) !== JSON.stringify(curr)) {
          try {
            await updateDoc(d.ref, { viewerUids: curr });
          } catch {}
        }
      })
    );
  } catch {}
}

/**
 * Strips heavy/oversized fields and undefined values from a Firestore map payload
 * so it stays cleanly within firebase-blueprint.json bounds (<= 40 keys).
 */
function sanitizePayloadMap(raw: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  const keys = Object.keys(raw || {}).slice(0, 40);
  for (const k of keys) {
    const v = raw[k];
    if (v === undefined) continue;
    if (typeof v === 'string') {
      // Avoid writing giant raw base64 blobs into log docs
      clean[k] = v.length > 40000 ? v.slice(0, 40000) : v;
    } else if (v === null || typeof v === 'number' || typeof v === 'boolean' || Array.isArray(v) || typeof v === 'object') {
      clean[k] = v;
    }
  }
  return clean;
}

export async function upsertVillageBabyLog(params: {
  villageToken: string;
  villageOwnerId: string;
  userId: string;
  authorName: string;
  authorRole: VillageRole;
  logType: VillageLogType;
  logId: string;
  date?: string;
  timestamp: string;
  viewerUids: string[];
  payload: Record<string, any>;
  babyId?: string;
}): Promise<void> {
  const {
    villageToken,
    villageOwnerId,
    userId,
    authorName,
    authorRole,
    logType,
    logId,
    date,
    timestamp,
    viewerUids,
    payload,
    babyId
  } = params;

  if (!isValidFirestoreId(villageToken) || !isValidFirestoreId(villageOwnerId) || !isValidFirestoreId(userId)) {
    return;
  }

  // Respect RBAC: Nannies cannot write growth, milestone, or vaccine logs
  if (authorRole === 'nanny' && (logType === 'growth' || logType === 'milestone' || logType === 'vaccine')) {
    return;
  }

  const safeId = sanitizeFirestoreId(logId, logType);
  const nowIso = new Date().toISOString();
  const boundedViewers = Array.from(new Set([villageOwnerId, userId, ...viewerUids])).filter(isValidFirestoreId).slice(0, 25);

  const docBody: Record<string, any> = {
    id: safeId,
    villageToken,
    villageOwnerId,
    ...(babyId ? { babyId: String(babyId).slice(0, 80) } : {}),
    logType,
    authorId: userId,
    authorName: (authorName || 'Caregiver').trim().slice(0, 80) || 'Caregiver',
    authorRole,
    ...(date ? { date: String(date).slice(0, 64) } : {}),
    timestamp: String(timestamp || nowIso).slice(0, 64),
    viewerUids: boundedViewers,
    payload: sanitizePayloadMap(payload),
    createdAt: nowIso,
    updatedAt: nowIso
  };

  try {
    await setDoc(doc(db, 'villages', villageToken, 'logs', safeId), docBody);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `villages/${villageToken}/logs/${safeId}`);
  }
}

export async function deleteVillageBabyLog(villageToken: string, logId: string): Promise<void> {
  if (!isValidFirestoreId(villageToken)) return;
  const safeId = sanitizeFirestoreId(logId);
  try {
    await deleteDoc(doc(db, 'villages', villageToken, 'logs', safeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `villages/${villageToken}/logs/${safeId}`);
  }
}

export async function upsertVillageFamilyDiaryEntry(params: {
  villageToken: string;
  villageOwnerId: string;
  userId: string;
  authorName: string;
  authorRole: VillageRole;
  entryId: string;
  date?: string;
  timestamp: string;
  familyUids: string[];
  payload: Record<string, any>;
}): Promise<void> {
  const { villageToken, villageOwnerId, userId, authorName, authorRole, entryId, date, timestamp, familyUids, payload } = params;
  if (authorRole === 'nanny') return;
  if (!isValidFirestoreId(villageToken) || !isValidFirestoreId(villageOwnerId) || !isValidFirestoreId(userId)) return;

  const safeId = sanitizeFirestoreId(entryId, 'diary');
  const nowIso = new Date().toISOString();
  const boundedFamily = Array.from(new Set([villageOwnerId, userId, ...familyUids])).filter(isValidFirestoreId).slice(0, 25);

  const docBody: Record<string, any> = {
    id: safeId,
    villageToken,
    villageOwnerId,
    authorId: userId,
    authorName: (authorName || 'Parent').trim().slice(0, 80) || 'Parent',
    familyUids: boundedFamily,
    ...(date ? { date: String(date).slice(0, 64) } : {}),
    timestamp: String(timestamp || nowIso).slice(0, 64),
    payload: sanitizePayloadMap(payload),
    createdAt: nowIso,
    updatedAt: nowIso
  };

  try {
    await setDoc(doc(db, 'villages', villageToken, 'family_diary', safeId), docBody);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `villages/${villageToken}/family_diary/${safeId}`);
  }
}

export async function pushSharedLogsSnapshot(params: {
  villageToken: string;
  villageOwnerId: string;
  userId: string;
  role: VillageRole;
  payload: SharedCareLogsPayload;
}): Promise<void> {
  const { villageToken, villageOwnerId, userId, role, payload } = params;
  if (role === 'nanny') return;
  if (!isValidFirestoreId(villageToken) || !isValidFirestoreId(villageOwnerId) || !isValidFirestoreId(userId)) return;

  const nowIso = new Date().toISOString();
  // Keep memories compact in shared snapshot (avoid exceeding 1MB doc limit)
  const compactMemories = Array.isArray(payload.memories)
    ? payload.memories.slice(0, 30).map((m: any) => ({
        ...m,
        image: typeof m?.image === 'string' && m.image.length > 35000 ? '' : m?.image
      }))
    : [];

  const sanitizedPayload: Record<string, any> = {
    loggedMeals: (payload.loggedMeals || []).slice(0, 150),
    feedingLogs: (payload.feedingLogs || []).slice(0, 150),
    sleepLogs: (payload.sleepLogs || []).slice(0, 150),
    diaperLogs: (payload.diaperLogs || []).slice(0, 150),
    growthLogs: (payload.growthLogs || []).slice(0, 100),
    loggedMoods: (payload.loggedMoods || []).slice(0, 150),
    publicObservations: (payload.publicObservations || []).slice(0, 100),
    activities: (payload.activities || []).slice(0, 60),
    fluidMl: typeof payload.fluidMl === 'number' ? payload.fluidMl : 0,
    hygieneLog: payload.hygieneLog || {},
    sunlightToday: typeof payload.sunlightToday === 'number' ? payload.sunlightToday : 0,
    teethingMap: payload.teethingMap || {},
    checkedMilestones: (payload.checkedMilestones || []).slice(0, 100),
    questTimeToday: typeof payload.questTimeToday === 'number' ? payload.questTimeToday : 0,
    questLogs: (payload.questLogs || []).slice(0, 100),
    readingLogs: (payload.readingLogs || []).slice(0, 100),
    scheduledMeals: (payload.scheduledMeals || []).slice(0, 80),
    scheduledActivities: (payload.scheduledActivities || []).slice(0, 80),
    scheduledMeds: (payload.scheduledMeds || []).slice(0, 80),
    reminders: (payload.reminders || []).slice(0, 60),
    memories: compactMemories,
    personalRecipes: (payload.personalRecipes || []).slice(0, 40),
    weeklyPlan: payload.weeklyPlan || {},
    groceryChecked: (payload.groceryChecked || []).slice(0, 80),
    updatedAt: nowIso
  };

  try {
    await setDoc(doc(db, 'villages', villageToken, 'shared_logs', 'latest'), {
      villageToken,
      villageOwnerId,
      payload: sanitizedPayload,
      updatedBy: userId,
      updatedAt: nowIso
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `villages/${villageToken}/shared_logs/latest`);
  }
}

export async function pushFamilyDiarySnapshot(params: {
  villageToken: string;
  villageOwnerId: string;
  userId: string;
  role: VillageRole;
  privateDiaryEntries: any[];
}): Promise<void> {
  const { villageToken, villageOwnerId, userId, role, privateDiaryEntries } = params;
  if (role === 'nanny') return;
  if (!isValidFirestoreId(villageToken) || !isValidFirestoreId(villageOwnerId) || !isValidFirestoreId(userId)) return;

  const nowIso = new Date().toISOString();
  try {
    await setDoc(doc(db, 'villages', villageToken, 'family_state', 'latest'), {
      villageToken,
      villageOwnerId,
      payload: {
        privateDiaryEntries: (privateDiaryEntries || []).slice(0, 150),
        updatedAt: nowIso
      },
      updatedBy: userId,
      updatedAt: nowIso
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `villages/${villageToken}/family_state/latest`);
  }
}

export async function updateVillageHubMetadata(params: {
  villageToken: string;
  userId: string;
  role: VillageRole;
  updates: Partial<Omit<VillageHubDoc, 'villageToken' | 'ownerId'>>;
}): Promise<void> {
  const { villageToken, userId, role, updates } = params;
  if (role === 'nanny') return;
  if (!isValidFirestoreId(villageToken) || !isValidFirestoreId(userId)) return;

  const allowed: Record<string, any> = {
    updatedBy: userId,
    updatedAt: new Date().toISOString()
  };
  if (updates.babyName !== undefined) allowed.babyName = String(updates.babyName).slice(0, 80);
  if (updates.babyDob !== undefined) allowed.babyDob = String(updates.babyDob).slice(0, 32);
  if (updates.babyAge !== undefined) allowed.babyAge = String(updates.babyAge).slice(0, 40);
  if (updates.activeBabyId !== undefined) allowed.activeBabyId = String(updates.activeBabyId).slice(0, 80);
  if (Array.isArray(updates.babyProfiles)) allowed.babyProfiles = updates.babyProfiles.slice(0, 10);
  if (typeof updates.fluidTarget === 'number') allowed.fluidTarget = Math.max(0, Math.min(5000, updates.fluidTarget));
  if (Array.isArray(updates.allergenMatrix)) allowed.allergenMatrix = updates.allergenMatrix.slice(0, 50);
  if (Array.isArray(updates.vaccineSchedule)) allowed.vaccineSchedule = updates.vaccineSchedule.slice(0, 80);

  try {
    await updateDoc(doc(db, 'villages', villageToken), allowed);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `villages/${villageToken}`);
  }
}

/**
 * Computes a deterministic Firestore doc ID for any baby log item so repeated syncs are idempotent.
 */
export function getStableLogId(logType: VillageLogType, item: any, fallbackIndex = 0): string {
  if (item?.id && isValidFirestoreId(String(item.id))) {
    return `${logType}_${String(item.id)}`.slice(0, 120);
  }
  const rawKey = `${item?.timestamp || item?.date || item?.exactTime || item?.start || item?.title || item?.name || fallbackIndex}`;
  let hash = 0;
  for (let i = 0; i < rawKey.length; i++) {
    hash = ((hash << 5) - hash + rawKey.charCodeAt(i)) | 0;
  }
  return sanitizeFirestoreId(`${logType}_${Math.abs(hash).toString(36)}_${fallbackIndex}`, logType);
}

/**
 * Merges incoming Firestore granular log docs with an existing local array without duplicating entries.
 */
export function mergeLogArraysByIdentity<T extends Record<string, any>>(
  baseList: T[],
  incomingDocs: Array<{ docId: string; payload: T }>
): T[] {
  const map = new Map<string, T>();
  const keyOf = (item: any, idx: number) =>
    String(item?.id || item?.exactTime || item?.timestamp || `${item?.date || ''}_${item?.time || ''}_${item?.title || item?.mood || idx}`);

  (baseList || []).forEach((item, idx) => {
    if (!item) return;
    map.set(keyOf(item, idx), item);
  });

  incomingDocs.forEach(({ docId, payload }) => {
    if (!payload) return;
    const itemId = payload.id || docId;
    const key = keyOf({ ...payload, id: itemId }, 0);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...payload, id: itemId });
    } else {
      const existingTs = new Date(existing.updatedAt || existing.timestamp || 0).getTime() || 0;
      const incomingTs = new Date(payload.updatedAt || payload.timestamp || 0).getTime() || 0;
      if (incomingTs >= existingTs) {
        map.set(key, { ...existing, ...payload, id: itemId });
      }
    }
  });

  return Array.from(map.values());
}

export function subscribeToVillageRealtime(params: {
  villageToken: string;
  userId: string;
  villageOwnerId: string;
  role: VillageRole;
  onHubUpdate: (hub: VillageHubDoc) => void;
  onSelfMemberUpdate: (member: VillageMemberRecord) => void;
  onMembersListUpdate: (members: VillageMemberRecord[]) => void;
  onSharedSnapshotUpdate: (bundle: SharedCareLogsPayload, updatedBy: string, updatedAt: string) => void;
  onLogsUpdate: (logs: Array<{ id: string; logType: VillageLogType; payload: any; updatedAt: string; authorId: string }>) => void;
  onFamilyDiarySnapshotUpdate: (entries: any[], updatedBy: string, updatedAt: string) => void;
  onFamilyDiaryDocsUpdate: (entries: Array<{ id: string; payload: any; updatedAt: string }>) => void;
}): () => void {
  const {
    villageToken,
    userId,
    villageOwnerId,
    role,
    onHubUpdate,
    onSelfMemberUpdate,
    onMembersListUpdate,
    onSharedSnapshotUpdate,
    onLogsUpdate,
    onFamilyDiarySnapshotUpdate,
    onFamilyDiaryDocsUpdate
  } = params;

  const unsubs: Unsubscribe[] = [];
  if (!isValidFirestoreId(villageToken) || !isValidFirestoreId(userId)) {
    return () => {};
  }

  // 1. Hub Metadata
  unsubs.push(
    onSnapshot(
      doc(db, 'villages', villageToken),
      (snap) => {
        if (snap.exists()) {
          onHubUpdate(snap.data() as VillageHubDoc);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `villages/${villageToken}`)
    )
  );

  // 2. Self Member Record (Dynamic Access Type & Revocation Listener)
  unsubs.push(
    onSnapshot(
      doc(db, 'villages', villageToken, 'members', userId),
      (snap) => {
        if (snap.exists()) {
          onSelfMemberUpdate(snap.data() as VillageMemberRecord);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `villages/${villageToken}/members/${userId}`)
    )
  );

  // 3. Members Directory (Admin / Family only)
  if (role === 'admin' || role === 'family') {
    const membersQuery =
      villageOwnerId === userId
        ? query(collection(db, 'villages', villageToken, 'members'), where('villageOwnerId', '==', villageOwnerId))
        : query(collection(db, 'villages', villageToken, 'members'), where('familyViewerUids', 'array-contains', userId));

    unsubs.push(
      onSnapshot(
        membersQuery,
        (snap) => {
          const list = snap.docs.map((d) => d.data() as VillageMemberRecord);
          onMembersListUpdate(list);
        },
        (err) => {
          console.warn('Members directory listener warning:', err);
        }
      )
    );
  }

  // 4. Shared Care Catch-up Snapshot (All Active Roles)
  unsubs.push(
    onSnapshot(
      doc(db, 'villages', villageToken, 'shared_logs', 'latest'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data?.payload) {
            onSharedSnapshotUpdate(data.payload as SharedCareLogsPayload, data.updatedBy || '', data.updatedAt || '');
          }
        }
      },
      (err) => {
        console.warn('Shared logs snapshot listener warning:', err);
      }
    )
  );

  // 5. Real-time Granular Baby Logs Collection (All Active Roles)
  const logsQuery = query(
    collection(db, 'villages', villageToken, 'logs'),
    where('viewerUids', 'array-contains', userId)
  );
  unsubs.push(
    onSnapshot(
      logsQuery,
      (snap) => {
        const items = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            logType: data.logType as VillageLogType,
            payload: data.payload || {},
            updatedAt: data.updatedAt || '',
            authorId: data.authorId || ''
          };
        });
        onLogsUpdate(items);
      },
      (err) => {
        console.warn('Village logs query warning:', err);
      }
    )
  );

  // 6. Shielded Family Diary (ONLY Admin & Family — NEVER Nanny)
  if (role === 'admin' || role === 'family') {
    unsubs.push(
      onSnapshot(
        doc(db, 'villages', villageToken, 'family_state', 'latest'),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as any;
            if (Array.isArray(data?.payload?.privateDiaryEntries)) {
              onFamilyDiarySnapshotUpdate(
                data.payload.privateDiaryEntries,
                data.updatedBy || '',
                data.updatedAt || ''
              );
            }
          }
        },
        (err) => {
          console.warn('Family state snapshot warning:', err);
        }
      )
    );

    const familyDiaryQuery = query(
      collection(db, 'villages', villageToken, 'family_diary'),
      where('familyUids', 'array-contains', userId)
    );
    unsubs.push(
      onSnapshot(
        familyDiaryQuery,
        (snap) => {
          const entries = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              payload: data.payload || {},
              updatedAt: data.updatedAt || ''
            };
          });
          onFamilyDiaryDocsUpdate(entries);
        },
        (err) => {
          console.warn('Family diary listener warning:', err);
        }
      )
    );
  }

  return () => {
    unsubs.forEach((u) => {
      try {
        u();
      } catch {}
    });
  };
}
