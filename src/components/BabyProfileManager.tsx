import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BabyProfile } from '../types';
import { Plus, Check, Edit2, Trash2, X, ChevronDown, User } from 'lucide-react';
import { calculateBabyAge } from '../utils/helpers';

interface BabyProfileManagerProps {
  babyProfiles: BabyProfile[];
  activeBabyId: string;
  onSelectBaby: (babyId: string) => void;
  onAddBaby: (newBaby: BabyProfile) => void;
  onUpdateBaby: (updatedBaby: BabyProfile) => void;
  onDeleteBaby?: (babyId: string) => void;
  userRole?: 'admin' | 'family' | 'nanny';
  className?: string;
  compact?: boolean;
}

const EMOJI_AVATARS = ['👶', '🧒', '👧', '🍼', '🐣', '⭐', '🧸', '🐰', '🦁', '🐻', '👑', '🌈'];

export const BabyProfileManager: React.FC<BabyProfileManagerProps> = ({
  babyProfiles,
  activeBabyId,
  onSelectBaby,
  onAddBaby,
  onUpdateBaby,
  onDeleteBaby,
  userRole = 'admin',
  className = '',
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'switch' | 'add' | 'edit'>('switch');
  const [editingBaby, setEditingBaby] = useState<BabyProfile | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('6 Months Old');
  const [gender, setGender] = useState<'boy' | 'girl' | 'unspecified'>('unspecified');
  const [avatarEmoji, setAvatarEmoji] = useState('👶');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const activeBaby = babyProfiles.find(b => b.id === activeBabyId) || babyProfiles[0] || {
    id: 'default',
    name: 'Baby',
    dob: '',
    age: '6 Months Old',
    avatarEmoji: '👶'
  };

  const handleOpenAdd = () => {
    setName('');
    setDob('');
    setAge('6 Months Old');
    setGender('unspecified');
    setAvatarEmoji('👶');
    setNotes('');
    setFormError('');
    setModalMode('add');
    setIsOpen(true);
  };

  const handleOpenEdit = (baby: BabyProfile) => {
    setEditingBaby(baby);
    setName(baby.name);
    setDob(baby.dob || '');
    setAge(baby.age);
    setGender(baby.gender || 'unspecified');
    setAvatarEmoji(baby.avatarEmoji || '👶');
    setNotes(baby.notes || '');
    setFormError('');
    setModalMode('edit');
    setIsOpen(true);
  };

  const handleDobChange = (val: string) => {
    setDob(val);
    if (val) {
      const calculated = calculateBabyAge(val);
      if (calculated) {
        setAge(calculated);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a baby name.');
      return;
    }

    if (modalMode === 'add') {
      const newProfile: BabyProfile = {
        id: `baby-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: name.trim(),
        dob,
        age: age.trim() || '6 Months Old',
        gender,
        avatarEmoji: avatarEmoji || '👶',
        notes: notes.trim()
      };
      onAddBaby(newProfile);
      setIsOpen(false);
    } else if (modalMode === 'edit' && editingBaby) {
      const updated: BabyProfile = {
        ...editingBaby,
        name: name.trim(),
        dob,
        age: age.trim() || editingBaby.age,
        gender,
        avatarEmoji: avatarEmoji || '👶',
        notes: notes.trim()
      };
      onUpdateBaby(updated);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setModalMode('switch');
          setIsOpen(true);
        }}
        className={`flex items-center gap-2 bg-white/90 hover:bg-white border border-gray-200/80 shadow-xs hover:shadow-sm rounded-full transition-all cursor-pointer text-left ${
          compact ? 'px-3 py-1.5' : 'px-4 py-2'
        }`}
        title="Switch Baby Profile"
      >
        <span className="text-base sm:text-lg flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shrink-0">
          {activeBaby.avatarEmoji || '👶'}
        </span>
        <div className="min-w-0 pr-1">
          <p className="text-xs font-serif font-black text-gray-800 truncate leading-tight">
            {activeBaby.name}
          </p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">
            {activeBaby.age}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-0.5" />
      </button>

      {/* Profile Switcher / Manager Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-5 text-left relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
                    👶
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-gray-800 text-lg leading-tight">
                      {modalMode === 'switch' && 'Family Children Profiles'}
                      {modalMode === 'add' && 'Add Another Baby'}
                      {modalMode === 'edit' && `Edit ${editingBaby?.name}'s Profile`}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {modalMode === 'switch' && 'Switch between children or add a sibling'}
                      {modalMode === 'add' && 'Enter profile details & birth date'}
                      {modalMode === 'edit' && 'Update birth date, age or notes'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalMode === 'switch' && (
                <div className="space-y-4">
                  <div className="space-y-2.5">
                    {babyProfiles.map(baby => {
                      const isSelected = baby.id === activeBabyId;
                      return (
                        <div
                          key={baby.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-primary/5 border-primary shadow-xs'
                              : 'bg-gray-50/70 border-gray-200/80 hover:bg-gray-100/70'
                          }`}
                        >
                          <button
                            onClick={() => {
                              onSelectBaby(baby.id);
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-3 min-w-0 flex-1 text-left bg-transparent border-none cursor-pointer"
                          >
                            <span className="w-10 h-10 rounded-2xl bg-white text-xl flex items-center justify-center shadow-2xs border border-gray-100 shrink-0">
                              {baby.avatarEmoji || '👶'}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-gray-800 truncate">{baby.name}</h4>
                                {isSelected && (
                                  <span className="text-[8px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 font-medium">
                                {baby.age} {baby.dob ? `• Born ${baby.dob}` : ''}
                              </p>
                            </div>
                          </button>

                          {userRole === 'admin' && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenEdit(baby)}
                                className="w-8 h-8 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer shadow-2xs"
                                title="Edit profile"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {babyProfiles.length > 1 && onDeleteBaby && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to remove ${baby.name}'s profile?`)) {
                                      onDeleteBaby(baby.id);
                                    }
                                  }}
                                  className="w-8 h-8 rounded-xl bg-white hover:bg-pink-50 border border-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer shadow-2xs"
                                  title="Delete profile"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {userRole === 'admin' && (
                    <button
                      onClick={handleOpenAdd}
                      className="w-full py-3.5 rounded-2xl bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer border-none transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Sibling / Another Baby</span>
                    </button>
                  )}
                </div>
              )}

              {(modalMode === 'add' || modalMode === 'edit') && (
                <form onSubmit={handleSave} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-pink-50 rounded-xl text-gray-800 text-xs font-bold border border-pink-200">
                      {formError}
                    </div>
                  )}

                  {/* Avatar Picker */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                      Choose Avatar
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {EMOJI_AVATARS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setAvatarEmoji(emoji)}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                            avatarEmoji === emoji
                              ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Baby Name */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                      Baby's Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Leo, Maya, Oliver"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-primary text-gray-800"
                    />
                  </div>

                  {/* DOB and Age */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={e => handleDobChange(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                        Display Age
                      </label>
                      <input
                        type="text"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        placeholder="e.g. 6 Months Old"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                      Gender (Optional)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'boy', label: 'Boy 👦' },
                        { val: 'girl', label: 'Girl 👧' },
                        { val: 'unspecified', label: 'Rather not say' }
                      ].map(g => (
                        <button
                          key={g.val}
                          type="button"
                          onClick={() => setGender(g.val as any)}
                          className={`py-2 px-3 rounded-xl text-[10px] font-bold border cursor-pointer transition-all ${
                            gender === g.val
                              ? 'bg-primary text-white border-primary'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                      Special Notes / Allergies (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Peanut sensitivity, likes sweet potato purees..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs font-medium outline-none focus:border-primary text-gray-800 h-16"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalMode('switch')}
                      className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-primary/90 cursor-pointer border-none"
                    >
                      {modalMode === 'add' ? 'Save New Baby' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
