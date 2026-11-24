import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Square,
  History,
  Trash2
} from 'lucide-react';
import {
  db,
  auth,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  limit,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { encryptString, decryptString } from '../utils/helpers';

export interface CaregiverShiftRecord {
  id: string;
  caregiverId: string;
  caregiverName: string;
  startTime: string;
  endTime: string;
  handedOverTo: string;
  notes?: string;
  villageToken?: string;
  villageOwnerId?: string;
  createdAt: string;
}

interface CaregiverShiftLoggerProps {
  userRole: 'admin' | 'family' | 'nanny';
  caregiverName?: string;
  currentUser?: any;
  babyName?: string;
}

export const CaregiverShiftLogger: React.FC<CaregiverShiftLoggerProps> = (props) => {
  // Strictly restrict shift logging & handovers exclusively to nannies / caregivers
  if (props.userRole !== 'nanny') {
    return null;
  }
  return <NannyShiftLoggerInner {...props} />;
};

const NannyShiftLoggerInner: React.FC<CaregiverShiftLoggerProps> = ({
  caregiverName = 'Caregiver',
  currentUser,
  babyName = 'Baby'
}) => {
  const [activeShiftStart, setActiveShiftStart] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ama_caregiver_active_shift_start') || null;
    } catch {
      return null;
    }
  });

  const [shifts, setShifts] = useState<CaregiverShiftRecord[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');
  const [handedOverTo, setHandedOverTo] = useState('Mom / Primary Parent');
  const [shiftNotes, setShiftNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [authReadyUid, setAuthReadyUid] = useState<string | null>(() => auth.currentUser?.uid || null);

  // Real-time Firestore listener scoped exclusively to this signed-in caregiver's shifts
  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }
      setAuthReadyUid(user?.uid || null);

      if (!user) {
        setShifts([]);
        return;
      }

      const shiftsQuery = query(
        collection(db, 'caregiver_shifts'),
        where('caregiverId', '==', user.uid),
        limit(50)
      );

      unsubSnapshot = onSnapshot(
        shiftsQuery,
        (snapshot) => {
          const records: CaregiverShiftRecord[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            records.push({
              id: d.id,
              caregiverId: data.caregiverId || '',
              caregiverName: data.caregiverName || 'Caregiver',
              startTime: data.startTime || '',
              endTime: data.endTime || '',
              handedOverTo: data.handedOverTo || '',
              notes: data.notes || '',
              createdAt: data.createdAt || ''
            });
          });

          records.sort(
            (a, b) =>
              new Date(b.createdAt || b.endTime).getTime() -
              new Date(a.createdAt || a.endTime).getTime()
          );
          setShifts(records);
        },
        (err) => {
          try {
            handleFirestoreError(err, OperationType.LIST, 'caregiver_shifts');
          } catch {}
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  const handleStartShift = () => {
    const nowIso = new Date().toISOString();
    setActiveShiftStart(nowIso);
    setErrorMsg('');
    try {
      localStorage.setItem('ama_caregiver_active_shift_start', nowIso);
    } catch {}
  };

  const handleOpenEndShiftModal = () => {
    const now = new Date();
    const start = activeShiftStart ? new Date(activeShiftStart) : new Date(now.getTime() - 4 * 3600 * 1000);

    const formatLocal = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setStartTimeInput(formatLocal(start));
    setEndTimeInput(formatLocal(now));
    setShiftNotes(`Logged care for ${babyName}. Feeds, naps, and diapers completed.`);
    setErrorMsg('');
    setSuccessMsg('');
    setIsLogModalOpen(true);
  };

  const handleSaveShiftRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!startTimeInput || !endTimeInput || !handedOverTo.trim()) {
      setErrorMsg('Please specify shift start time, end time, and who you handed baby care over to.');
      return;
    }

    const startDt = new Date(startTimeInput);
    const endDt = new Date(endTimeInput);
    if (Number.isNaN(startDt.getTime()) || Number.isNaN(endDt.getTime())) {
      setErrorMsg('Please enter valid start and end dates/times.');
      return;
    }
    if (endDt.getTime() < startDt.getTime()) {
      setErrorMsg('Shift end time cannot be earlier than start time.');
      return;
    }

    const activeUser = auth.currentUser;
    if (!activeUser?.uid) {
      setErrorMsg('Please sign in first so your shift record can be saved to Firestore.');
      return;
    }

    setIsSaving(true);
    const shiftId = `shift-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const resolvedName = (
      activeUser.displayName ||
      currentUser?.displayName ||
      caregiverName ||
      'Nanny / Caregiver'
    )
      .trim()
      .slice(0, 80);

    const villageTokenRaw = (() => {
      try {
        return localStorage.getItem('ama_village_sync_token') || '';
      } catch {
        return '';
      }
    })();
    const validVillageToken = /^[a-zA-Z0-9_-]{1,128}$/.test(villageTokenRaw) ? villageTokenRaw : '';

    let villageOwnerRaw = (() => {
      try {
        return localStorage.getItem('ama_village_owner_id') || '';
      } catch {
        return '';
      }
    })();

    if (validVillageToken && !villageOwnerRaw) {
      try {
        const villageSnap = await getDoc(doc(db, 'villages', validVillageToken));
        if (villageSnap.exists()) {
          const vData = villageSnap.data();
          if (typeof vData.ownerId === 'string' && vData.ownerId) {
            villageOwnerRaw = vData.ownerId;
            try {
              localStorage.setItem('ama_village_owner_id', villageOwnerRaw);
            } catch {}
          }
        }
      } catch {}
    }

    const validVillageOwnerId = /^[a-zA-Z0-9_-]{1,128}$/.test(villageOwnerRaw) ? villageOwnerRaw : '';

    const record: CaregiverShiftRecord = {
      id: shiftId,
      caregiverId: activeUser.uid,
      caregiverName: resolvedName || 'Nanny / Caregiver',
      startTime: startDt.toISOString(),
      endTime: endDt.toISOString(),
      handedOverTo: handedOverTo.trim().slice(0, 120),
      ...(shiftNotes.trim() ? { notes: shiftNotes.trim().slice(0, 1000) } : {}),
      ...(validVillageToken ? { villageToken: validVillageToken } : {}),
      ...(validVillageOwnerId ? { villageOwnerId: validVillageOwnerId } : {}),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'caregiver_shifts', shiftId), record);

      // Mirror shift record into encrypted Village snapshot so multi-device Family & Parent devices receive updates
      if (validVillageToken) {
        try {
          const vRef = doc(db, 'villages', validVillageToken);
          const vSnap = await getDoc(vRef);
          if (vSnap.exists()) {
            const vData = vSnap.data();
            let parsedPayload: any = {};
            if (typeof vData.encryptedPayload === 'string' && vData.encryptedPayload) {
              try {
                parsedPayload = JSON.parse(decryptString(vData.encryptedPayload));
              } catch {
                parsedPayload = {};
              }
            }
            const existingShifts: CaregiverShiftRecord[] = Array.isArray(parsedPayload.caregiverShifts)
              ? parsedPayload.caregiverShifts
              : [];
            const nextShifts = [record, ...existingShifts.filter((s) => s.id !== record.id)].slice(0, 50);
            parsedPayload.caregiverShifts = nextShifts;
            await updateDoc(vRef, {
              encryptedPayload: encryptString(JSON.stringify(parsedPayload)),
              updatedBy: activeUser.uid,
              updatedAt: new Date().toISOString()
            });
          }
        } catch {}
      }

      try {
        localStorage.removeItem('ama_caregiver_active_shift_start');
      } catch {}
      setActiveShiftStart(null);
      setSuccessMsg(`Shift saved to Firestore! Baby care handed over to ${record.handedOverTo}.`);
      setTimeout(() => {
        setIsLogModalOpen(false);
        setSuccessMsg('');
      }, 1200);
    } catch (fsErr: any) {
      try {
        handleFirestoreError(fsErr, OperationType.CREATE, `caregiver_shifts/${shiftId}`);
      } catch {}
      setErrorMsg('Could not save shift to Firestore. Please ensure you are signed in and connected.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!auth.currentUser?.uid) return;
    try {
      await deleteDoc(doc(db, 'caregiver_shifts', shiftId));
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `caregiver_shifts/${shiftId}`);
      } catch {}
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-5 sm:p-7 border border-primary/15 shadow-xl shadow-card/10 space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Nanny & Caregiver Shifts
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Caregiver Only • Saved to Firestore
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-black text-gray-900 mt-1">
            Nanny & Caregiver Shift Logger
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Log your shift start and end times, baby care notes, and who you handed {babyName}&apos;s care over to.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeShiftStart ? (
            <button
              onClick={handleOpenEndShiftModal}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none shadow-md"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>End Shift & Handover</span>
            </button>
          ) : (
            <button
              onClick={handleStartShift}
              className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none shadow-md"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Shift</span>
            </button>
          )}
          <button
            onClick={handleOpenEndShiftModal}
            className="px-3.5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none"
            title="Log completed shift"
          >
            <Plus className="w-4 h-4" />
            <span>Log Past Shift</span>
          </button>
        </div>
      </div>

      {!authReadyUid && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900 font-semibold">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Sign in to your account to save and sync caregiver shift records to Firestore.</span>
        </div>
      )}

      {activeShiftStart && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-950 font-bold">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              Active Shift in Progress • Started at{' '}
              {new Date(activeShiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button
            onClick={handleOpenEndShiftModal}
            className="text-emerald-800 hover:text-emerald-950 font-black underline cursor-pointer border-none bg-transparent text-xs"
          >
            End Shift & Log Handover →
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-gray-600">
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-gray-400" />
            <span>My Saved Shift Logs ({shifts.length})</span>
          </span>
          <span className="text-[10px] text-gray-400 font-medium">Firestore Cloud Sync</span>
        </div>

        {shifts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center text-xs text-gray-400 space-y-1">
            <Clock className="w-6 h-6 mx-auto text-gray-300" />
            <p className="font-bold text-gray-500">No caregiver shifts recorded yet</p>
            <p className="text-[11px]">
              Tap &quot;Start Shift&quot; when beginning baby care, or &quot;Log Past Shift&quot; to record start/end times and handover recipient.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {shifts.map((s) => {
              const startFormatted = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endFormatted = new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateFormatted = new Date(s.endTime).toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-gray-50/80 hover:bg-gray-50 border border-gray-100 space-y-2 transition-all text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900">{s.caregiverName}</span>
                      <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {dateFormatted} • {startFormatted} - {endFormatted}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-primary/20">
                        <UserCheck className="w-3 h-3" />
                        <span>Handed Care To: {s.handedOverTo}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteShift(s.id)}
                        title="Delete shift record"
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 bg-transparent border-none cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {s.notes && (
                    <p className="text-gray-700 leading-relaxed font-medium bg-white p-2.5 rounded-xl border border-gray-100 text-[11px]">
                      {s.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full space-y-4 border border-gray-100 shadow-2xl text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Nanny / Caregiver Shift Record
                  </span>
                  <h3 className="text-xl font-serif font-black text-gray-900 mt-0.5">
                    Log Shift Times & Care Handover
                  </h3>
                </div>
                <button
                  onClick={() => setIsLogModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 border-none cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveShiftRecord} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Shift Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startTimeInput}
                      onChange={(e) => setStartTimeInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Shift End Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endTimeInput}
                      onChange={(e) => setEndTimeInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Who Did You Hand Baby Care Over To? *
                  </label>
                  <input
                    type="text"
                    required
                    value={handedOverTo}
                    onChange={(e) => setHandedOverTo(e.target.value)}
                    placeholder="e.g. Mom (Primary Parent), Dad, Grandma Grace, Relief Nanny"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-semibold text-gray-800 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Care Notes & Observations
                  </label>
                  <textarea
                    rows={3}
                    value={shiftNotes}
                    onChange={(e) => setShiftNotes(e.target.value)}
                    placeholder="Summarize feeds, diapers, naps, or baby mood during your shift..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(false)}
                    className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSaving ? 'Saving to Firestore...' : 'Save Shift to Firestore'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface CaregiverShiftHistoryViewProps {
  userRole: 'admin' | 'family' | 'nanny';
  currentUser?: any;
  babyName?: string;
}

export const CaregiverShiftHistoryView: React.FC<CaregiverShiftHistoryViewProps> = (props) => {
  // Strictly read-only overview for Parents (admin) and Family (family);
  // Nannies use the interactive CaregiverShiftLogger on their Dashboard.
  if (props.userRole === 'nanny') {
    return null;
  }
  return <CaregiverShiftHistoryInner {...props} />;
};

const CaregiverShiftHistoryInner: React.FC<CaregiverShiftHistoryViewProps> = ({
  babyName = 'Baby'
}) => {
  const [shifts, setShifts] = useState<CaregiverShiftRecord[]>([]);
  const [authReadyUid, setAuthReadyUid] = useState<string | null>(() => auth.currentUser?.uid || null);

  useEffect(() => {
    let unsubOwn: (() => void) | null = null;
    let unsubVillageOwner: (() => void) | null = null;
    let unsubVillageDoc: (() => void) | null = null;

    let ownMap = new Map<string, CaregiverShiftRecord>();
    let villageOwnerMap = new Map<string, CaregiverShiftRecord>();
    let villageDocMap = new Map<string, CaregiverShiftRecord>();

    const mergeAndPublish = () => {
      const merged = new Map<string, CaregiverShiftRecord>();
      for (const [k, v] of villageDocMap.entries()) merged.set(k, v);
      for (const [k, v] of villageOwnerMap.entries()) merged.set(k, v);
      for (const [k, v] of ownMap.entries()) merged.set(k, v);

      const list = Array.from(merged.values()).sort(
        (a, b) =>
          new Date(b.createdAt || b.endTime).getTime() -
          new Date(a.createdAt || a.endTime).getTime()
      );
      setShifts(list);
    };

    const cleanupListeners = () => {
      if (unsubOwn) { unsubOwn(); unsubOwn = null; }
      if (unsubVillageOwner) { unsubVillageOwner(); unsubVillageOwner = null; }
      if (unsubVillageDoc) { unsubVillageDoc(); unsubVillageDoc = null; }
    };

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      cleanupListeners();
      ownMap = new Map();
      villageOwnerMap = new Map();
      villageDocMap = new Map();
      setAuthReadyUid(user?.uid || null);

      if (!user) {
        setShifts([]);
        return;
      }

      const mapSnap = (snap: any, target: Map<string, CaregiverShiftRecord>) => {
        target.clear();
        snap.forEach((d: any) => {
          const data = d.data();
          target.set(d.id, {
            id: d.id,
            caregiverId: data.caregiverId || '',
            caregiverName: data.caregiverName || 'Caregiver',
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            handedOverTo: data.handedOverTo || '',
            notes: data.notes || '',
            villageToken: data.villageToken,
            villageOwnerId: data.villageOwnerId,
            createdAt: data.createdAt || ''
          });
        });
        mergeAndPublish();
      };

      unsubOwn = onSnapshot(
        query(collection(db, 'caregiver_shifts'), where('caregiverId', '==', user.uid), limit(50)),
        (snap) => mapSnap(snap, ownMap),
        (err) => {
          try {
            handleFirestoreError(err, OperationType.LIST, 'caregiver_shifts');
          } catch {}
        }
      );

      unsubVillageOwner = onSnapshot(
        query(collection(db, 'caregiver_shifts'), where('villageOwnerId', '==', user.uid), limit(50)),
        (snap) => mapSnap(snap, villageOwnerMap),
        (err) => {
          try {
            handleFirestoreError(err, OperationType.LIST, 'caregiver_shifts');
          } catch {}
        }
      );

      let token = '';
      try {
        token = localStorage.getItem('ama_village_sync_token') || '';
      } catch {}
      if (/^[a-zA-Z0-9_-]{1,128}$/.test(token)) {
        unsubVillageDoc = onSnapshot(
          doc(db, 'villages', token),
          (vSnap) => {
            villageDocMap.clear();
            if (vSnap.exists()) {
              const vData = vSnap.data();
              if (typeof vData.encryptedPayload === 'string' && vData.encryptedPayload) {
                try {
                  const parsed = JSON.parse(decryptString(vData.encryptedPayload));
                  if (Array.isArray(parsed?.caregiverShifts)) {
                    parsed.caregiverShifts.forEach((s: CaregiverShiftRecord) => {
                      if (s?.id) villageDocMap.set(s.id, s);
                    });
                  }
                } catch {}
              }
            }
            mergeAndPublish();
          },
          () => {}
        );
      }
    });

    return () => {
      unsubAuth();
      cleanupListeners();
    };
  }, []);

  return (
    <div className="bg-card rounded-[36px] p-5 sm:p-6 border border-white shadow-sm space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Parent & Family Read-Only Log
          </p>
          <h3 className="text-base sm:text-lg font-serif font-black text-gray-900 mt-0.5 flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <span>Caregiver Shift &amp; Handover Records ({shifts.length})</span>
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Review when nannies or caregivers started/ended their shift and who received {babyName}&apos;s care handover.
          </p>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-center shrink-0">
          Synced from Firestore
        </span>
      </div>

      {!authReadyUid ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Sign in or connect your Village Sync token in Settings to view synced caregiver shift handovers.</span>
        </div>
      ) : shifts.length === 0 ? (
        <div className="p-5 rounded-2xl bg-white/80 border border-gray-100 text-center text-xs text-gray-500 space-y-1">
          <Clock className="w-6 h-6 mx-auto text-gray-300" />
          <p className="font-bold text-gray-700">No caregiver shift handovers recorded yet</p>
          <p className="text-[11px] text-gray-500">
            Shifts logged by a Caregiver / Nanny on their Dashboard appear here automatically for Parents and Family members.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {shifts.map((s) => {
            const startFormatted = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endFormatted = new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateFormatted = new Date(s.endTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-white border border-gray-100 space-y-2 text-xs shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-gray-900">{s.caregiverName}</span>
                    <span className="text-[11px] font-bold text-gray-500">
                      {dateFormatted} · {startFormatted} – {endFormatted}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold text-[10px] border border-primary/20">
                    <UserCheck className="w-3 h-3 shrink-0" />
                    <span>Handed Care To: {s.handedOverTo}</span>
                  </div>
                </div>

                {s.notes && (
                  <p className="text-gray-700 leading-relaxed font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px]">
                    {s.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
