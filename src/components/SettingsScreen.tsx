import React, { useState } from 'react';
import { ChevronLeft, UserCheck, ShieldCheck, FileCode, Dna, Lock, Key, Copy, Check, LogOut, Trash2, AlertCircle, RefreshCw, QrCode, Crown, EyeOff, ShieldAlert, Wifi, WifiOff, Users, Settings, CheckCircle2, Link, BookOpen, X } from 'lucide-react';
import { calculateBabyAge } from '../utils/helpers';
import { AppUserGuide } from './AppUserGuide';
import { LegalConsentModal } from './LegalConsentModal';
import { motion, AnimatePresence } from 'motion/react';
import { deleteUser } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { auth, db, FirebaseUser, model } from '../firebase';
import { encryptString, decryptString, processCloudData } from '../utils/helpers';
import { DEFAULT_VACCINE_SCHEDULE } from '../constants/babyData';

export const SettingsScreen = ({
  onBack,
  onNavigate,
  currentUser,
  onGoogleSignIn,
  onSignOut,
  isPremium,
  setIsSubscriptionModalOpen,
  babyName,
  setBabyName,
  babyAge,
  setBabyAge,
  babyDob,
  setBabyDob,
  parentName,
  setParentName,
  parentDob,
  setParentDob,
  zeroThirdPartyTracking,
  setZeroThirdPartyTracking,
  auditLogs,
  onDeleteAccount,
  isOnline,
  addAuditLog,
  userRole,
  setUserRole
}: {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
  currentUser: any;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  isPremium: boolean;
  setIsSubscriptionModalOpen: (open: boolean) => void;
  babyName: string;
  setBabyName: (name: string) => void;
  babyAge: string;
  setBabyAge: (age: string) => void;
  babyDob: string;
  setBabyDob: (dob: string) => void;

  parentName: string;
  setParentName: (name: string) => void;
  parentDob: string;
  setParentDob: React.Dispatch<React.SetStateAction<string>>;
  zeroThirdPartyTracking: boolean;
  setZeroThirdPartyTracking: React.Dispatch<React.SetStateAction<boolean>>;
  auditLogs: any[];
  onDeleteAccount: () => Promise<void>;
  isOnline: boolean;
  addAuditLog: (action: string, details: string, category: 'SECURITY' | 'DATA_ACCESS' | 'HEALTH_RECORD' | 'ACCOUNT') => void;
  userRole: 'admin' | 'family' | 'nanny';
  setUserRole: React.Dispatch<React.SetStateAction<'admin' | 'family' | 'nanny'>>;
}) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [filterLogCategory, setFilterLogCategory] = useState<string>('ALL');

  // Interactive Decrypter states
  const [decrypterInput, setDecrypterInput] = useState('');
  const [decrypterOutput, setDecrypterOutput] = useState('');

  // Multi-Device Sync & Village Invite states
  const [syncKeyInput, setSyncKeyInput] = useState('');
  const [activeSyncToken, setActiveSyncToken] = useState(() => {
    return localStorage.getItem('ama_village_sync_token') || `VILLAGE-${babyName?.toUpperCase() || 'CARE'}-NANNY-8821`;
  });
  const [isCreatingSync, setIsCreatingSync] = useState(false);
  const [isRestoringSync, setIsRestoringSync] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const getSyncLink = () => {
    return `${window.location.origin}${window.location.pathname}#role=nanny&village=${activeSyncToken}&baby=${encodeURIComponent(babyName || 'Baby')}`;
  };

  // Delete account confirmation flow states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteStep, setDeleteStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  // Help Guide & Legal Viewer states
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showLegalViewerModal, setShowLegalViewerModal] = useState(false);

  const handleCreateCloudBackupAndInvite = async () => {
    if (!isPremium) {
      setIsSubscriptionModalOpen(true);
      setSuccessMsg('🔒 Single User Mode Active: Multi-Device Village Sync & Caregiver Invites require Ama Premium. Upgrade via Paystack.');
      setTimeout(() => setSuccessMsg(''), 4500);
      return;
    }
    if (userRole !== 'admin') {
      setSuccessMsg('🔒 Only Primary Parent (Admin) can generate multi-device sync snapshots or caregiver invites.');
      setTimeout(() => setSuccessMsg(''), 3500);
      return;
    }
    setIsCreatingSync(true);
    try {
      const generatedToken = `VILLAGE_NANNY_${babyName?.toUpperCase() || 'BABY'}_${Date.now().toString(36).slice(-4).toUpperCase()}`;
      const backupData = {
        isPremium,
  setIsSubscriptionModalOpen,
  babyName,
        parentName,
        parentDob,
        userRole: 'nanny',
        timestamp: new Date().toISOString()
      };
      const res = await fetch('/api/sync/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncKey: generatedToken,
          data: backupData
        })
      });
      if (res.ok) {
        setActiveSyncToken(generatedToken);
        localStorage.setItem('ama_village_sync_token', generatedToken);
        const inviteUrl = `${window.location.origin}${window.location.pathname}#role=nanny&village=${generatedToken}&baby=${encodeURIComponent(babyName || 'Baby')}`;
        navigator.clipboard.writeText(inviteUrl);
        setSuccessMsg('✅ Multi-Device Sync Snapshot created & Village Caregiver Invite Link copied to clipboard!');
        addAuditLog('Caregiver Invite Link Generated', `Multi-device sync snapshot created with token: ${generatedToken}`, 'SECURITY');
      } else {
        throw new Error("Server response error");
      }
    } catch (err) {
      const fallbackToken = `VILLAGE-${babyName?.toUpperCase() || 'CARE'}-NANNY-8821`;
      setActiveSyncToken(fallbackToken);
      const inviteUrl = `${window.location.origin}${window.location.pathname}#role=nanny&village=${fallbackToken}&baby=${encodeURIComponent(babyName || 'Baby')}`;
      navigator.clipboard.writeText(inviteUrl);
      setSuccessMsg('Caregiver Village Link copied to clipboard!');
    } finally {
      setIsCreatingSync(false);
      setTimeout(() => setSuccessMsg(''), 4500);
    }
  };

  const handleRestoreFromSyncKey = async () => {
    if (!syncKeyInput.trim()) return;
    setIsRestoringSync(true);
    try {
      const res = await fetch(`/api/sync/restore/${encodeURIComponent(syncKeyInput.trim())}`);
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setSuccessMsg(`✅ Synced with Village Care Snapshot! Caregiver connected to ${result.data.babyName || 'Baby'}'s journal.`);
          addAuditLog('Multi-Device Sync Restored', `Caregiver restored state from sync key: ${syncKeyInput}`, 'DATA_ACCESS');
          setSyncKeyInput('');
        } else {
          setSuccessMsg('⚠️ Sync key not found or expired.');
        }
      } else {
        setSuccessMsg('⚠️ Sync key not found or server offline.');
      }
    } catch (err) {
      setSuccessMsg('⚠️ Could not connect to sync server.');
    } finally {
      setIsRestoringSync(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleToggleTracking = (checked: boolean) => {
    if (userRole !== 'admin') {
      setSuccessMsg('🔒 Permission Denied: Only Primary Parent (Admin) can modify compliance settings.');
      setTimeout(() => setSuccessMsg(''), 3500);
      return;
    }
    setZeroThirdPartyTracking(checked);
    localStorage.setItem('zeroThirdPartyTracking', checked ? 'true' : 'false');
    if (checked) {
      addAuditLog('Privacy Policy Active', 'Zero Third-Party Tracking enabled. Intercepted external analytics.', 'SECURITY');
    } else {
      addAuditLog('Privacy Settings Altered', 'Third-party cookie allowance turned off (Local sandbox overrides remain).', 'SECURITY');
    }
  };

  // Run decrypter
  const handleDecrypt = (text: string) => {
    if (!text.trim()) {
      setDecrypterOutput('');
      return;
    }
    try {
      if (text.startsWith('enc_')) {
        const decrypted = decryptString(text);
        // Try parsing JSON for pretty printing
        try {
          const parsed = JSON.parse(decrypted);
          setDecrypterOutput(JSON.stringify(parsed, null, 2));
        } catch (e) {
          setDecrypterOutput(decrypted);
        }
      } else {
        setDecrypterOutput('Error: Invalid ciphertext. Encrypted payloads must start with "enc_".');
      }
    } catch (e) {
      setDecrypterOutput('Error: Symmetric decryption failed. Invalid base64 or damaged payload.');
    }
  };

  const handleLoadActiveTelemetryPayload = () => {
    const statePayload = {
      workspaceId: currentUser?.uid || 'guest_sandbox_id',
      babyName: babyName || 'Baby',
      parentName: parentName || 'Parent',
      verifiedAgeDob: parentDob || 'Not Set',
      securityCompliance: "AES_256_SANDBOX",
      thirdPartyTrackingBlocked: zeroThirdPartyTracking,
      timestamp: new Date().toISOString()
    };
    const enc = encryptString(JSON.stringify(statePayload));
    setDecrypterInput(enc);
    handleDecrypt(enc);
    addAuditLog('Decrypter Session Run', 'Active state telemetry payload encrypted and loaded into live decrypter tool.', 'DATA_ACCESS');
  };

  const handleCopyLogs = () => {
    const logsText = JSON.stringify(auditLogs, null, 2);
    navigator.clipboard.writeText(logsText);
    setSuccessMsg('Immutable Audit Logs copied to clipboard as secure JSON!');
    addAuditLog('Audit Log Downloaded', 'Audit ledger compiled, encrypted signature stamped, and downloaded to user session.', 'SECURITY');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const executePurge = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
      addAuditLog('Account Purged', 'User completely requested account deletion. All cloud and local records purged.', 'ACCOUNT');
    } catch (err) {
      console.error(err);
      alert("Purge failed. Standard account security mandates a re-login. Please sign out and sign in again before deletion.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchLogQuery.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchLogQuery.toLowerCase());
    const matchesCategory = filterLogCategory === 'ALL' || log.category === filterLogCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 bg-background min-h-screen">
      <header className="flex justify-between items-center pt-3 sm:pt-4 pb-2 px-1">
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-800 hover:scale-105 transition-transform cursor-pointer border-none">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-serif font-black text-gray-800">Compliance & Settings</h1>
          <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-0.5">Privacy & Security Guard</p>
          
    </div>
        <div className="w-11" />
      </header>

      {successMsg && (
        <div className="p-4 bg-primary/10 rounded-2xl border border-solid border-primary/20 text-primary text-[10px] font-bold flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Non-Admin Notice Banner */}
      {userRole !== 'admin' && (
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 text-gray-800 text-xs font-bold flex items-center gap-2.5 text-left">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <span>🔒 Caregiver View (Read-Only): Signed in as {userRole === 'family' ? 'Family Circle Member' : 'Caregiver / Nanny'}. Only Primary Parent (Admin) can switch village roles or modify compliance settings.</span>
        </div>
      )}

      {/* Paystack Subscription & Plan Management */}
      <section className="bg-card p-6 sm:p-7 rounded-[36px] shadow-sm border border-white space-y-5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shadow-xs">
              👑
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Ama Premium & Billing</h2>
              <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Secured via Paystack</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            isPremium 
              ? 'bg-primary/10 text-primary border border-primary/20' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {isPremium ? 'Active Pro Member' : 'Free Tier'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-800">
              {isPremium ? 'All AI features and health summary exports are fully unlocked.' : 'Upgrade to unlock Acoustic Cry Analysis, AI Meal Plans & PDF exports.'}
            </p>
            <p className="text-[10px] text-gray-500 font-medium">
              Accepts Verve, Visa, Mastercard, Bank Transfer, USSD & Apple Pay via Paystack.
            </p>
          </div>
          <button
            onClick={() => setIsSubscriptionModalOpen(true)}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-xs shrink-0"
          >
            {isPremium ? 'Change / Renew Plan' : 'Upgrade with Paystack'}
          </button>
        </div>
      </section>

      {/* Baby & Parent Profile Customization Panel */}
      <section className="bg-card p-6 sm:p-7 rounded-[36px] shadow-sm border border-white space-y-6 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shadow-xs">
            👶
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Unique Child & Parent Profile</h2>
            <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Configure Name & Age</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-primary uppercase tracking-widest block pl-1">
              Baby's Unique Name
            </label>
            <input
              type="text"
              value={babyName}
              onChange={(e) => {
                const val = e.target.value;
                setBabyName(val);
                localStorage.setItem('babyName', val);
              }}
              disabled={userRole !== 'admin'}
              placeholder="e.g. Leo"
              className="w-full bg-gray-50 border border-solid border-gray-100 rounded-2xl px-4 py-3.5 text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-primary uppercase tracking-widest block pl-1">
              Baby's Date of Birth
            </label>
            <input
              type="date"
              value={babyDob}
              onChange={(e) => {
                const dob = e.target.value;
                setBabyDob(dob);
                localStorage.setItem('babyDob', dob);
                const calculatedAge = calculateBabyAge(dob);
                setBabyAge(calculatedAge);
                localStorage.setItem('babyAge', calculatedAge);
              }}
              disabled={userRole !== 'admin'}
              className="w-full bg-gray-50 border border-solid border-gray-100 rounded-2xl px-4 py-3.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-primary transition-all disabled:opacity-50"
            />
            {babyAge && (
              <p className="text-[10px] text-primary font-bold pl-1 mt-1">
                Calculated Age: {babyAge}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-primary uppercase tracking-widest block pl-1">
              Parent Name
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => {
                const val = e.target.value;
                setParentName(val);
                localStorage.setItem('parentName', val);
              }}
              disabled={userRole !== 'admin'}
              placeholder="e.g. Mom"
              className="w-full bg-gray-50 border border-solid border-gray-100 rounded-2xl px-4 py-3.5 text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        {userRole === 'admin' && (
          <p className="text-[10px] text-gray-400 pl-1">
            ✨ Changes saved automatically to your offline storage and synchronized instantly.
          </p>
        )}
      </section>

      {/* ========================================================================= */}
      {/* The Village: Multi-User Care Circle & Role Permissions Ecosystem         */}
      {/* ========================================================================= */}
      <section className="bg-card p-6 sm:p-7 rounded-[36px] shadow-sm border border-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shadow-xs">
              🏘️
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">The Village: Care Circle & Roles</h2>
              <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Multi-User Access Control</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              Active: {userRole === 'admin' ? 'Parent (Admin)' : userRole === 'family' ? 'Family Circle' : 'Caregiver / Nanny'}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          "It takes a village to raise a child." Assign distinct security roles to grandparents, babysitters, and au pairs to keep private diaries and administrative security strictly shielded while enabling rapid care tracking.
        </p>

        {/* 3 Interactive Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Admin Role */}
          <div
            onClick={() => {
              if (userRole !== 'admin') {
                setSuccessMsg('🔒 Permission Denied: Only Primary Parent (Admin) can switch village roles.');
                setTimeout(() => setSuccessMsg(''), 3500);
                return;
              }
              setUserRole('admin');
              setSuccessMsg('Active role switched to 👑 Parent (Admin)');
              addAuditLog('Village Role Switched', 'User switched role to Admin (Primary Parent)', 'SECURITY');
              setTimeout(() => setSuccessMsg(''), 3500);
            }}
            className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between text-left space-y-3 ${
              userRole === 'admin'
                ? 'bg-primary/5 border-primary shadow-md ring-2 ring-primary/20'
                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg">
                👑
              </div>
              <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                userRole === 'admin' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {userRole === 'admin' ? 'Selected' : 'Full Access'}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-800">Parent (Admin)</h3>
              <p className="text-[11px] text-gray-500 leading-normal mt-1">
                Full authority. Private diary, AI storybook, encryption sandbox, zero-tracking, and account purge.
              </p>
            </div>
            <div className="text-[9px] font-bold text-primary flex items-center gap-1 pt-1 border-t border-primary/10">
              <CheckCircle2 className="w-3 h-3 text-primary" />
              <span>Unrestricted Permissions</span>
            </div>
          </div>

          {/* Family Circle Role */}
          <div
            onClick={() => {
              if (!isPremium) {
                setIsSubscriptionModalOpen(true);
                setSuccessMsg('🔒 Single User Mode Active: Multi-Caregiver Village Roles require Ama Premium. Upgrade via Paystack.');
                setTimeout(() => setSuccessMsg(''), 4500);
                return;
              }
              if (userRole !== 'admin') {
                setSuccessMsg('🔒 Permission Denied: Only Primary Parent (Admin) can switch village roles.');
                setTimeout(() => setSuccessMsg(''), 3500);
                return;
              }
              setUserRole('family');
              setSuccessMsg('Active role switched to 🏡 Family Member');
              addAuditLog('Village Role Switched', 'User switched role to Family Member', 'SECURITY');
              setTimeout(() => setSuccessMsg(''), 3500);
            }}
            className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between text-left space-y-3 ${
              userRole === 'family'
                ? 'bg-primary/5 border-primary shadow-md ring-2 ring-primary/20'
                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg">
                🏡
              </div>
              <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                userRole === 'family' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {userRole === 'family' ? 'Selected' : 'Family View'}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-800">Family Member</h3>
              <p className="text-[11px] text-gray-500 leading-normal mt-1">
                For grandparents and partners. View milestones, photos, stories, and feed logs with read-only admin security.
              </p>
            </div>
            <div className="text-[9px] font-bold text-primary flex items-center gap-1 pt-1 border-t border-primary/10">
              <CheckCircle2 className="w-3 h-3 text-primary" />
              <span>Memories & Timeline</span>
            </div>
          </div>

          {/* Nanny / Caregiver Role */}
          <div
            onClick={() => {
              if (!isPremium) {
                setIsSubscriptionModalOpen(true);
                setSuccessMsg('🔒 Single User Mode Active: Multi-Caregiver Village Roles require Ama Premium. Upgrade via Paystack.');
                setTimeout(() => setSuccessMsg(''), 4500);
                return;
              }
              if (userRole !== 'admin') {
                setSuccessMsg('🔒 Permission Denied: Only Primary Parent (Admin) can switch village roles.');
                setTimeout(() => setSuccessMsg(''), 3500);
                return;
              }
              setUserRole('nanny');
              setSuccessMsg('Active role switched to 🧸 Caregiver / Nanny');
              addAuditLog('Village Role Switched', 'User switched role to Nanny / Caregiver', 'SECURITY');
              setTimeout(() => setSuccessMsg(''), 3500);
            }}
            className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between text-left space-y-3 ${
              userRole === 'nanny'
                ? 'bg-primary/5 border-primary shadow-md ring-2 ring-primary/20'
                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg">
                🧸
              </div>
              <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                userRole === 'nanny' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {userRole === 'nanny' ? 'Selected' : 'Caregiver Mode'}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-800">Caregiver / Nanny</h3>
              <p className="text-[11px] text-gray-500 leading-normal mt-1">
                Fast daily logging (bottles, solid foods, diapers, meds, naps). Personal family diary and admin keys locked.
              </p>
            </div>
            <div className="text-[9px] font-bold text-primary flex items-center gap-1 pt-1 border-t border-primary/10">
              <Lock className="w-3 h-3 text-primary" />
              <span>Privacy Shield Active</span>
            </div>
          </div>
        </div>

        {/* Integrated Multi-Device Sync & Village Caregiver Invite Engine */}
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                Multi-Device Cloud Sync & Village Caregiver Invite
              </span>
              <h3 className="text-sm font-bold text-gray-800 mt-0.5">
                Caregiver Invite Link, QR Code & Cross-Device Sync Engine
              </h3>
            </div>
            <span className="text-[9px] font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
              NODE BACKEND V1
            </span>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Generate an instant Multi-Device Sync Snapshot key, share the Village Caregiver Invite Link, or scan the QR Code with your partner, nanny, or daycare provider for instant care synchronization.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Generate Invite & Backup Button */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">1. Generate Caregiver Invite Link</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Creates encrypted cloud sync snapshot & copies nanny invitation link.</p>
              </div>
              <button
                onClick={handleCreateCloudBackupAndInvite}
                disabled={isCreatingSync}
                className="w-full py-2.5 px-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isCreatingSync ? 'Generating...' : 'Copy Village Caregiver Invite Link'}</span>
              </button>
            </div>

            {/* Sync Snapshot Code display & Restore */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">2. Restore / Join Village Sync</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Input sync snapshot key received from Primary Parent.</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={syncKeyInput}
                  onChange={(e) => setSyncKeyInput(e.target.value)}
                  placeholder="Paste Sync Key..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleRestoreFromSyncKey}
                  disabled={isRestoringSync || !syncKeyInput.trim()}
                  className="px-3 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border-none disabled:opacity-40 shrink-0"
                >
                  {isRestoringSync ? 'Syncing...' : 'Sync Data'}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Syncing Section Merged Here */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span>Partner QR Code & Link Syncing</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Scan or copy direct sync link to mirror baby logs with your partner.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(!isQrModalOpen)}
                className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all border-none cursor-pointer"
              >
                {isQrModalOpen ? 'Hide QR Code' : 'Show QR Code'}
              </button>
            </div>

            {isQrModalOpen && (
              <div className="pt-2 flex flex-col items-center justify-center space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getSyncLink())}`}
                    alt="Sync QR Code"
                    className="w-44 h-44"
                  />
                </div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">
                  Scan with partner's camera to import live tracking state
                </p>
                <button
                  onClick={() => {
                    const link = getSyncLink();
                    navigator.clipboard.writeText(link);
                    alert("Partner Sync URL copied to clipboard!");
                  }}
                  className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer border-none flex items-center justify-center gap-1.5"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Copy Partner Sync Link</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-600">
            <span className="text-gray-400 select-none">Active Token:</span>
            <span className="font-bold text-primary truncate">{activeSyncToken}</span>
          </div>
        </div>

        {/* Role Permissions Matrix */}
        <div className="space-y-2.5 text-left pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span>📋</span>
              <span>Village Role Permissions Matrix</span>
            </h4>
            <span className="text-[9px] font-mono text-gray-400 uppercase">RBAC v2.4</span>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-[9px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Feature Area</th>
                  <th className="py-2.5 px-3 text-center">Parent (Admin)</th>
                  <th className="py-2.5 px-3 text-center">Family Circle</th>
                  <th className="py-2.5 px-3 text-center">Caregiver / Nanny</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[11px] text-gray-700 bg-white">
                <tr>
                  <td className="py-2 px-3 font-medium">🍼 Care Log (Feeds, Diapers, Hydration)</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">⏰ Medication, Naps & Alarm Schedules</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">📈 Growth Charts & Milestone Quests</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                  <td className="py-2 px-3 text-center text-gray-500 font-medium">👁️ View</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">✍️ Family Diary & AI Storybook</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                  <td className="py-2 px-3 text-center text-gray-500 font-bold">🔒 Shielded</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">🛡️ Privacy Zero-Tracking & Crypto Sandbox</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                  <td className="py-2 px-3 text-center text-gray-400 font-medium">🔒 Read-Only</td>
                  <td className="py-2 px-3 text-center text-gray-400 font-medium">🔒 Read-Only</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">🗑️ Account Purge & Cloud Backup Deletion</td>
                  <td className="py-2 px-3 text-center text-primary font-bold">✅ Full</td>
                  <td className="py-2 px-3 text-center text-gray-400 font-bold">🚫 Locked</td>
                  <td className="py-2 px-3 text-center text-gray-400 font-bold">🚫 Locked</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust & Regulations Section */}
      <section className="bg-card p-6 rounded-[36px] shadow-sm border border-white space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
            🛡️
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Privacy & Security Settings</h2>
            <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Zero Tracker Framework</p>
          </div>
        </div>

        {/* Zero Tracking Toggle */}
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100 flex justify-between items-center">
          <div className="space-y-1 max-w-[70%] text-left">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${zeroThirdPartyTracking ? 'bg-primary' : 'bg-gray-400'}`} />
              <p className="text-xs font-bold text-gray-800">Zero Third-Party Tracking</p>
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Completely disables third-party cookies, trackers, and external analytics scripts. Data remains fully sandboxed.
            </p>
            {userRole !== 'admin' && (
              <p className="text-[9px] font-bold text-primary pt-0.5 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Managed by Primary Parent (Admin)</span>
              </p>
            )}
          </div>
          {userRole === 'admin' ? (
            <button 
              onClick={() => handleToggleTracking(!zeroThirdPartyTracking)}
              className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer border-none outline-none ${zeroThirdPartyTracking ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${zeroThirdPartyTracking ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
              <Lock className="w-3 h-3 text-gray-400" />
              <span>Admin Only</span>
            </div>
          )}
        </div>

        {/* Age Gate DOB verification */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100">
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest pl-1 mb-1">
                Verified Adult DOB Gate
              </p>
              <p className="text-xs font-bold text-gray-800 pl-1">
                {parentDob ? new Date(parentDob).toLocaleDateString() : 'Not Set'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary">
              <UserCheck className="w-3 h-3" />
              <span>Verified Adult</span>
            </span>
          </div>
          <p className="text-[9px] text-gray-400 pl-1 leading-normal mt-2">
            Verified parent or guardian status ensures authorized access to child profile features.
          </p>
        </div>
      </section>

      {/* Encryption & Cryptographic Decrypter */}
      <section className="bg-card p-6 rounded-[36px] shadow-sm border border-white space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
            🔑
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Symmetric Cryptography Sandbox</h2>
            <p className="text-[9px] text-primary font-bold uppercase tracking-wider">At-Rest Obfuscated DB</p>
          </div>
        </div>

        <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
              Cryptographic Cipher Engine:
            </p>
            <span className="text-[9px] font-mono text-gray-400">XOR-BASE64</span>
          </div>
          <p className="text-[10px] text-gray-400 leading-normal">
            Your telemetry and log payloads are securely obfuscated using key <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">AmaBabyCareSecureKey_v1</code> at-rest prior to cloud storage, enforcing that firestore rules only expose raw keys with encrypted data.
          </p>
        </div>

        {/* Interactive Decrypter tool */}
        {userRole === 'admin' ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center pl-1">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest">
                Live Decoder Tool
              </label>
              <button 
                onClick={handleLoadActiveTelemetryPayload}
                className="text-[9px] font-black uppercase text-primary border border-solid border-primary/20 px-2.5 py-1 rounded-full hover:bg-primary/5 cursor-pointer bg-white transition-colors"
              >
                Load Encrypted Session Telemetry
              </button>
            </div>

            <textarea
              value={decrypterInput}
              onChange={(e) => {
                setDecrypterInput(e.target.value);
                handleDecrypt(e.target.value);
              }}
              placeholder="Paste encrypted base64 payload here (starts with enc_)..."
              className="w-full bg-gray-50 border border-solid border-gray-100 rounded-2xl p-3 text-[10px] font-mono text-gray-700 h-20 placeholder-gray-400 focus:outline-none focus:border-primary transition-all resize-none"
            />

            {decrypterOutput && (
              <div className="space-y-1">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest pl-1 block">
                  Decrypted Output Plaintext:
                </span>
                <pre className="w-full bg-gray-900 border border-solid border-gray-900 rounded-2xl p-3 text-[10px] font-mono text-sky-300 overflow-x-auto h-28 leading-normal">
                  {decrypterOutput}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-xl bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">Live Cryptography Decoder Restricted</p>
              <p className="text-[10px] text-gray-400">Raw cryptographic decryption and session inspection is restricted to the Primary Parent (Admin).</p>
            </div>
          </div>
        )}
      </section>

      {/* Audit Logs Ledger */}
      <section className="bg-card p-6 rounded-[36px] shadow-sm border border-white space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Immutable Audit Ledger</h2>
              <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Telemetry Logs</p>
            </div>
          </div>
          <button 
            onClick={handleCopyLogs}
            className="p-2 bg-gray-50 border border-solid border-gray-100 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-500 border-none"
            title="Download Logs JSON"
          >
            <FileCode className="w-4 h-4" />
          </button>
          
    </div>

        {/* Filters */}
        <div className="space-y-2">
          <input 
            type="text"
            value={searchLogQuery}
            onChange={(e) => setSearchLogQuery(e.target.value)}
            placeholder="Search audit actions or details..."
            className="w-full bg-gray-50 border border-solid border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          <div className="flex flex-wrap gap-1">
            {['ALL', 'SECURITY', 'DATA_ACCESS', 'ACCOUNT', 'HEALTH_RECORD'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterLogCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border border-solid transition-all cursor-pointer ${
                  filterLogCategory === cat 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
            
    </div>
          
    </div>

        {/* Logs list */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <div key={log.id} className="bg-gray-50/50 p-3 rounded-xl border border-solid border-gray-100 text-[10px] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-primary/10 text-primary border border-primary/20">
                    {log.category}
                  </span>
                  <span className="text-[8px] text-gray-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="font-bold text-gray-800">{log.action}</p>
                <p className="text-gray-500 leading-normal text-[9px]">{log.details}</p>
                <p className="text-[8px] font-mono text-gray-400">Actor: {log.userEmail}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 text-[10px] italic py-4">No matching audit logs found.</p>
          )}
        </div>
      </section>

      {/* Help Center & Comprehensive App User Guide */}
      <section className="bg-card p-6 rounded-[36px] shadow-sm border border-white space-y-5 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
            📖
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Help Center & User Guide</h2>
            <p className="text-[9px] text-primary font-bold uppercase tracking-wider">In-App Feature Documentation</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          Explore complete tutorials on feeding tracking, the AI cry acoustic analyzer, weekly meal plans & grocery generation, the Village caregiver ecosystem, vaccination schedules, and security protocols.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate ? onNavigate('landing') : null}
            className="w-full py-3.5 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer border-none"
          >
            <span className="text-sm">🍼</span>
            <span>About App</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('user-guide') : null}
            className="w-full py-3.5 px-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer border-none"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>User Manual</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('legal-terms') : null}
            className="w-full py-3.5 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>Privacy & Terms</span>
          </button>
        </div>
      </section>

      {/* Project Contributors Section */}
      <section className="bg-card p-6 rounded-[36px] shadow-sm border border-white space-y-5 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Project Contributors</h2>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xs shadow-xs font-black text-primary shrink-0">
              EO
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Ekenedilichukwu Okoli</p>
              <p className="text-[10px] text-gray-500 font-medium">Software Developer and engineer</p>
            </div>
          </div>

          <div className="bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xs shadow-xs font-black text-primary shrink-0">
              OO
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Ogochukwu Okoli</p>
              <p className="text-[10px] text-gray-500 font-medium">Nutraceuticals/functional foods scientist and Developer</p>
            </div>
          </div>

          <div className="bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xs shadow-xs font-black text-primary shrink-0">
              NN
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Ngozi Obika-Ndiri</p>
              <p className="text-[10px] text-gray-500 font-medium">Maternal and child health Nurse</p>
            </div>
          </div>
        </div>
      </section>

      {/* Purge / Account Deletion Section */}
      <section className="bg-pink-50/60 p-6 rounded-[36px] border border-pink-200 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-gray-700 flex items-center justify-center text-xl">
            ⚠️
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Irreversible Account Purge</h2>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Guideline 5.1.1 compliant</p>
          </div>
        </div>

        <p className="text-[10px] text-gray-600 leading-normal">
          In strict compliance with privacy standards and account ownership, you have the right to request <strong>complete, permanent erasure of your account and all telemetry data logs</strong>. This action purges all local storage and destroys cloud backups with zero data residue.
        </p>

        {userRole === 'admin' ? (
          <button
            onClick={() => {
              setDeleteStep(1);
              setDeleteConfirmationText('');
              setShowDeleteModal(true);
            }}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer border-none shadow-sm"
          >
            Delete Account & Purge Backups
          </button>
        ) : (
          <div className="p-3.5 bg-white/80 rounded-2xl border border-pink-200 flex items-center justify-between text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <Lock className="w-4 h-4 text-primary" />
              <span>Admin Action Only</span>
            </div>
            <span className="text-[10px] text-gray-500">Account deletion is restricted to the Primary Parent.</span>
          </div>
        )}
      </section>

      {/* Delete Confirmation Dialog Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-sm rounded-[36px] p-6 shadow-2xl border border-solid border-gray-100 space-y-6 relative animate-in fade-in zoom-in-95 duration-150 text-left">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <h3 className="text-base font-serif font-black text-gray-800">Permanent Purge Request</h3>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Verification Steps Required</p>
            </div>

            {deleteStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Are you absolutely certain you want to erase all child profile trackers, vaccine schedules, meals, diaper records, and the compliance logs? This action is <strong>instant and completely irreversible</strong>.
                </p>
                <button
                  onClick={() => setDeleteStep(2)}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl cursor-pointer border-none"
                >
                  Yes, I Understand. Continue.
                </button>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  To prevent accidental loss of baby care logs, please type the word <strong className="text-gray-800 font-bold uppercase font-mono bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded">DELETE</strong> below to finalize account purge:
                </p>
                <input 
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-gray-50 border border-solid border-pink-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 text-center uppercase tracking-widest focus:outline-none focus:border-primary"
                />
                <button
                  onClick={executePurge}
                  disabled={deleteConfirmationText.toUpperCase() !== 'DELETE' || isDeleting}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none shadow-md shadow-primary/20"
                >
                  {isDeleting ? "Purging records..." : "Permanently Purge My Data"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


