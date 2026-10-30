import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  MessageSquare,
  HelpCircle,
  Send,
  Plus,
  Search,
  ThumbsUp,
  Sparkles,
  CheckCircle2,
  MapPin,
  ChevronLeft,
  Award,
  UserPlus,
  MessageCircle,
  ExternalLink,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Filter,
  HeartHandshake,
  Calendar,
  Star,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSEO } from '../utils/seo';
import { INITIAL_VETTED_CAREGIVERS, VettedCaregiver } from '../constants/omugwoData';

export interface CommunityReplyItem {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorLocation?: string;
  content: string;
  isExpertResponse?: boolean;
  upvotes: string[];
  sources?: { title: string; uri: string }[];
  createdAt: string;
}

export interface CommunityPostItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorLocation: string;
  babyAgeContext?: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: string[];
  replies: CommunityReplyItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMemberItem {
  id: string;
  name: string;
  role: string;
  specialty: string;
  location: string;
  bio: string;
  topics: string[];
  joinedAt: string;
  lastActiveAt: string;
}

export interface CommunityChatMessageItem {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderLocation?: string;
  text: string;
  createdAt: string;
}

interface CommunitySupportScreenProps {
  onBack: () => void;
  userId?: string;
  parentName?: string;
  babyName?: string;
  babyAge?: string;
  userLocation?: string;
  onNavigate?: (screen: string) => void;
}

const COMMUNITY_FIELDS = [
  'All Fields',
  'Feeding & Weaning',
  'Lactation & Breastfeeding',
  'Sleep & Wake Windows',
  'Pediatric Health & Fever',
  'Postpartum & Maternal Care',
  'Developmental Milestones',
  'Childcare & Working Parents'
];

const MEMBER_ROLES = [
  'Parent',
  'Family Circle',
  'Lactation Specialist',
  'Pediatric Care Provider',
  'Midwife / Doula',
  'Pediatric Nutritionist',
  'Caregiver / Nanny'
];

const CHAT_ROOMS = [
  { id: 'general-parenting', name: '# General Parenting Village', desc: 'Connect & chat with parents and families worldwide' },
  { id: 'lactation-nursing', name: '# Lactation & Nursing Support', desc: 'Breastfeeding, pumping, bottle feeds & latch guidance' },
  { id: 'weaning-nutrition', name: '# Weaning & Local Recipes', desc: 'First solids, Tom Brown, purees & food allergies' },
  { id: 'sleep-wake-windows', name: '# Night Feeds & Sleep Lounge', desc: '2 AM check-ins, wake windows & gentle soothing' },
  { id: 'pediatric-care', name: '# Care Providers & Health Q&A', desc: 'Discuss immunizations, teething & developmental care' }
];

export const CommunitySupportScreen: React.FC<CommunitySupportScreenProps> = ({
  onBack,
  userId,
  parentName = 'Parent',
  babyName = 'Baby',
  babyAge = '6 Months',
  userLocation = 'Port Harcourt, Nigeria',
  onNavigate
}) => {
  useSEO({
    title: 'Community Support Forum & Parent-Expert Network | Ama Baby Care',
    description: 'Connect, chat, ask questions, and get answers from other parents, families, lactation consultants, and pediatric care providers across all parenting fields.',
    canonicalUrl: 'https://amababycare.com/#community'
  });

  const effectiveUserId = useMemo(() => {
    if (userId) return userId;
    let stored = localStorage.getItem('ama_community_uid');
    if (!stored) {
      stored = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem('ama_community_uid', stored);
    }
    return stored;
  }, [userId]);

  const [activeTab, setActiveTab] = useState<'forum' | 'omugwo' | 'network' | 'chat' | 'specialist'>('forum');
  const [isLoadingState, setIsLoadingState] = useState(false);

  // Omugwo Marketplace state inside Community
  const [caregiverScheduleFilter, setCaregiverScheduleFilter] = useState<'All' | 'Daily' | 'Weekend' | 'Live-In' | 'Consultation'>('All');
  const [selectedCaregiverForBooking, setSelectedCaregiverForBooking] = useState<VettedCaregiver | null>(null);
  const [bookingScheduleType, setBookingScheduleType] = useState<'Daily' | 'Weekend' | 'Live-In' | 'Nurse/Paediatrician Consultation'>('Daily');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingDietNotes, setBookingDietNotes] = useState('Ji Mmiri Oku (Postpartum Pepper Soup) & Tom Brown pap');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');
  const [activeBookings, setActiveBookings] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ama_omugwo_bookings') || '[]');
    } catch {
      return [];
    }
  });

  const handleBookCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaregiverForBooking) return;
    const newBooking = {
      id: `booking-${Date.now()}`,
      caregiverId: selectedCaregiverForBooking.id,
      caregiverName: selectedCaregiverForBooking.name,
      scheduleType: bookingScheduleType,
      startDate: bookingDate,
      notes: bookingDietNotes,
      status: 'Confirmed & Scheduled',
      createdAt: new Date().toISOString()
    };
    const updated = [newBooking, ...activeBookings];
    setActiveBookings(updated);
    try {
      localStorage.setItem('ama_omugwo_bookings', JSON.stringify(updated));
    } catch {}
    setBookingSuccessMsg(`✅ Booking confirmed for ${selectedCaregiverForBooking.name} (${bookingScheduleType})! Caregiver coordinator will contact you.`);
    setTimeout(() => {
      setSelectedCaregiverForBooking(null);
      setBookingSuccessMsg('');
    }, 3000);
  };

  // Community state synced with server
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [members, setMembers] = useState<CommunityMemberItem[]>([]);
  const [connections, setConnections] = useState<{ id: string; fromId: string; toId: string; createdAt: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<CommunityChatMessageItem[]>([]);

  // User's active community identity
  const [myDisplayName, setMyDisplayName] = useState(() => localStorage.getItem('ama_comm_name') || parentName || 'Parent');
  const [myRole, setMyRole] = useState(() => localStorage.getItem('ama_comm_role') || 'Parent');
  const [mySpecialty, setMySpecialty] = useState(() => localStorage.getItem('ama_comm_specialty') || '');
  const [myBio, setMyBio] = useState(() => localStorage.getItem('ama_comm_bio') || '');

  // Forum state
  const [selectedField, setSelectedField] = useState('All Fields');
  const [forumFilter, setForumFilter] = useState<'all' | 'unanswered' | 'expert' | 'popular'>('all');
  const [forumSearch, setForumSearch] = useState('');
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Feeding & Weaning');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [requestExpertOnCreate, setRequestExpertOnCreate] = useState(true);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postError, setPostError] = useState('');

  // Thread reply state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [requestingSpecialistId, setRequestingSpecialistId] = useState<string | null>(null);

  // Network state
  const [networkSearch, setNetworkSearch] = useState('');
  const [networkRoleFilter, setNetworkRoleFilter] = useState('All');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState('');

  // Chat state
  const [activeRoomId, setActiveRoomId] = useState('general-parenting');
  const [customDmRoom, setCustomDmRoom] = useState<{ id: string; name: string } | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Specialist Direct Q&A state
  const [specialistField, setSpecialistField] = useState('Lactation & Breastfeeding');
  const [specialistQuestion, setSpecialistQuestion] = useState('');
  const [publishToForum, setPublishToForum] = useState(true);
  const [isAskingSpecialist, setIsAskingSpecialist] = useState(false);
  const [specialistResult, setSpecialistResult] = useState<{
    answer: string;
    sources: { title: string; uri: string }[];
  } | null>(null);
  const [specialistError, setSpecialistError] = useState('');

  const fetchCommunityState = async () => {
    setIsLoadingState(true);
    try {
      const res = await fetch('/api/community/state');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.posts)) setPosts(data.posts);
        if (Array.isArray(data.members)) setMembers(data.members);
        if (Array.isArray(data.connections)) setConnections(data.connections);
        if (Array.isArray(data.messages)) setChatMessages(data.messages);
      }
    } catch (err) {
      console.warn('Could not fetch community state:', err);
    } finally {
      setIsLoadingState(false);
    }
  };

  useEffect(() => {
    fetchCommunityState();
  }, []);

  // Poll chat messages when on the Live Chat tab
  useEffect(() => {
    if (activeTab !== 'chat') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/community/chat');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages)) {
            setChatMessages(data.messages);
          }
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Filtered Forum Posts
  const filteredPosts = useMemo(() => {
    const q = forumSearch.trim().toLowerCase();
    return posts
      .filter(p => {
        if (selectedField !== 'All Fields' && p.category !== selectedField) return false;
        if (forumFilter === 'unanswered' && p.replies.length > 0) return false;
        if (forumFilter === 'expert' && !p.replies.some(r => r.isExpertResponse)) return false;
        if (q) {
          const inTitle = p.title.toLowerCase().includes(q);
          const inContent = p.content.toLowerCase().includes(q);
          const inAuthor = p.authorName.toLowerCase().includes(q);
          const inReplies = p.replies.some(r => r.content.toLowerCase().includes(q));
          if (!inTitle && !inContent && !inAuthor && !inReplies) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (forumFilter === 'popular') {
          return b.upvotes.length + b.replies.length - (a.upvotes.length + a.replies.length);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [posts, selectedField, forumFilter, forumSearch]);

  // Filtered Network Members
  const filteredMembers = useMemo(() => {
    const q = networkSearch.trim().toLowerCase();
    return members.filter(m => {
      if (networkRoleFilter === 'Providers') {
        if (m.role === 'Parent' || m.role === 'Family Circle') return false;
      } else if (networkRoleFilter === 'Parents') {
        if (m.role !== 'Parent' && m.role !== 'Family Circle') return false;
      }
      if (q) {
        return (
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          (m.specialty || '').toLowerCase().includes(q) ||
          (m.location || '').toLowerCase().includes(q) ||
          (m.bio || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [members, networkSearch, networkRoleFilter]);

  const currentRoomMessages = useMemo(() => {
    return chatMessages.filter(m => m.roomId === activeRoomId);
  }, [chatMessages, activeRoomId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError('');
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setPostError('Please enter both a question title and details.');
      return;
    }

    setIsSubmittingPost(true);
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: effectiveUserId,
          authorName: myDisplayName.trim() || parentName || 'Parent',
          authorRole: myRole,
          authorLocation: userLocation,
          babyAgeContext: babyAge,
          category: newPostCategory,
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          tags: newPostTags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean),
          requestExpertAnswer: requestExpertOnCreate
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setPostError(data.error || 'Could not publish question.');
      } else if (data.post) {
        setPosts(prev => [data.post, ...prev]);
        setExpandedPostId(data.post.id);
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostTags('');
        setIsAskModalOpen(false);
      }
    } catch {
      setPostError('Network error while publishing post.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleAddReply = async (postId: string) => {
    const draft = (replyDrafts[postId] || '').trim();
    if (!draft) return;

    setSubmittingReplyId(postId);
    try {
      const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: effectiveUserId,
          authorName: myDisplayName.trim() || parentName || 'Parent',
          authorRole: myRole,
          authorLocation: userLocation,
          content: draft
        })
      });
      const data = await res.json();
      if (res.ok && data.post) {
        setPosts(prev => prev.map(p => (p.id === postId ? data.post : p)));
        setReplyDrafts(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.warn('Failed to post reply:', err);
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleRequestSpecialistOnPost = async (postId: string) => {
    setRequestingSpecialistId(postId);
    try {
      const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/specialist-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.post) {
        setPosts(prev => prev.map(p => (p.id === postId ? data.post : p)));
        setExpandedPostId(postId);
      }
    } catch (err) {
      console.warn('Specialist synthesis error:', err);
    } finally {
      setRequestingSpecialistId(null);
    }
  };

  const handleToggleUpvote = async (postId: string, replyId?: string) => {
    try {
      const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: effectiveUserId, replyId })
      });
      const data = await res.json();
      if (res.ok && data.post) {
        setPosts(prev => prev.map(p => (p.id === postId ? data.post : p)));
      }
    } catch {}
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch {}
  };

  const handleSaveMemberProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myDisplayName.trim()) return;
    setIsSavingProfile(true);
    setProfileSavedNotice('');

    localStorage.setItem('ama_comm_name', myDisplayName.trim());
    localStorage.setItem('ama_comm_role', myRole);
    localStorage.setItem('ama_comm_specialty', mySpecialty.trim());
    localStorage.setItem('ama_comm_bio', myBio.trim());

    try {
      const res = await fetch('/api/community/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: effectiveUserId,
          name: myDisplayName.trim(),
          role: myRole,
          specialty: mySpecialty.trim() || (myRole === 'Parent' ? `Parent of ${babyName} (${babyAge})` : myRole),
          location: userLocation,
          bio: myBio.trim() || `Active ${myRole} in ${userLocation}.`,
          topics: [selectedField !== 'All Fields' ? selectedField : 'Feeding & Weaning']
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.members)) {
        setMembers(data.members);
        setProfileSavedNotice('Your profile is live in the Parent & Care Provider Network!');
        setTimeout(() => {
          setIsProfileModalOpen(false);
          setProfileSavedNotice('');
        }, 1000);
      }
    } catch {
      setIsProfileModalOpen(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleConnectMember = async (targetMember: CommunityMemberItem) => {
    try {
      const res = await fetch('/api/community/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromId: effectiveUserId,
          toId: targetMember.id
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.connections)) {
        setConnections(data.connections);
      }
    } catch {}
  };

  const handleOpenDirectChat = (targetMember: CommunityMemberItem) => {
    const pair = [effectiveUserId, targetMember.id].sort().join('--');
    const dmRoomId = `dm-${pair}`;
    setCustomDmRoom({ id: dmRoomId, name: `Chat with ${targetMember.name} (${targetMember.role})` });
    setActiveRoomId(dmRoomId);
    setActiveTab('chat');
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setIsSendingChat(true);
    try {
      const res = await fetch('/api/community/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: activeRoomId,
          senderId: effectiveUserId,
          senderName: myDisplayName.trim() || parentName || 'Parent',
          senderRole: myRole,
          senderLocation: userLocation,
          text: chatInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setChatMessages(prev => [...prev, data.message]);
        setChatInput('');
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch {} finally {
      setIsSendingChat(false);
    }
  };

  const handleAskSpecialistDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialistQuestion.trim()) return;
    setIsAskingSpecialist(true);
    setSpecialistError('');
    setSpecialistResult(null);

    try {
      const res = await fetch('/api/community/ask-specialist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: specialistField,
          question: specialistQuestion.trim(),
          babyAge,
          location: userLocation,
          publishToForum,
          authorId: effectiveUserId,
          authorName: myDisplayName.trim() || parentName || 'Parent',
          authorRole: myRole
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setSpecialistError(data.error || 'Could not complete specialist consultation.');
      } else {
        setSpecialistResult({
          answer: data.answer,
          sources: Array.isArray(data.sources) ? data.sources : []
        });
        if (data.publishedPost) {
          setPosts(prev => [data.publishedPost, ...prev]);
        }
      }
    } catch {
      setSpecialistError('Network error while contacting specialist service.');
    } finally {
      setIsAskingSpecialist(false);
    }
  };

  const isConnectedWith = (memberId: string) =>
    connections.some(
      c =>
        (c.fromId === effectiveUserId && c.toId === memberId) ||
        (c.fromId === memberId && c.toId === effectiveUserId)
    );

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-32 max-w-6xl mx-auto space-y-6 bg-background min-h-screen text-left">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-[36px] border border-white shadow-lg shadow-card/20">
        <div className="flex items-start sm:items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-xs border border-gray-100 cursor-pointer shrink-0"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Parent, Family & Care Provider Network
              </span>
              <span className="text-[10px] font-bold text-gray-600 bg-white px-2.5 py-0.5 rounded-full border border-gray-100">
                Acting as: {myDisplayName} ({myRole})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
              Community Support & Expert Forum
            </h1>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Connect, chat, ask questions, and get answers from other parents, families, and care providers across all useful fields.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-primary" />
            <span>My Network Profile</span>
          </button>

          <button
            onClick={() => setIsAskModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20 border-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ask Question / Post</span>
          </button>
        </div>
      </header>

      {/* Community Social Media Platform Policy & Medical Disclaimer */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-black text-amber-950 uppercase tracking-wider text-[11px]">
            Community Social Platform & Independence Policy
          </p>
          <p className="text-amber-900 leading-relaxed">
            Ama Community is a dedicated parenting social platform. Discussions, posts, shared tips, and Omugwo marketplace listings are created independently by community members and families; third-party user content is independent and does not constitute medical advice. Only clinicians and certified consultants displaying the <strong className="text-emerald-800 font-black">✓ Verified Ama Specialist</strong> badge are officially vetted and associated with our care advisory board.
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs - Sleek Social Media Navigation */}
      <div className="bg-white p-1.5 sm:p-2 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'forum', label: 'Feed', count: posts.length, icon: MessageSquare },
          { id: 'omugwo', label: 'Care Marketplace', count: null, icon: HeartHandshake },
          { id: 'network', label: 'Parent Network', count: members.length, icon: Users },
          { id: 'chat', label: 'Live Chat', count: chatMessages.length, icon: MessageCircle },
          { id: 'specialist', label: 'Ask Specialist', count: null, icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-max px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Q&A FORUM */}
      {activeTab === 'forum' && (
        <div className="space-y-5">
          {/* Search & Topic Filters */}
          <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={forumSearch}
                  onChange={e => setForumSearch(e.target.value)}
                  placeholder="Search parent & expert discussions by topic, keyword, or question..."
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-800 outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unanswered', label: 'Needs Answer' },
                  { id: 'expert', label: 'Expert Answered' },
                  { id: 'popular', label: 'Most Helpful' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setForumFilter(f.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer border transition-all ${
                      forumFilter === f.id
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                <button
                  onClick={fetchCommunityState}
                  className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer"
                  title="Refresh discussions"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingState ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Field Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {COMMUNITY_FIELDS.map(field => (
                <button
                  key={field}
                  onClick={() => setSelectedField(field)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer border transition-all ${
                    selectedField === field
                      ? 'bg-primary text-white border-primary shadow-2xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          {/* Forum Threads List */}
          {filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map(post => {
                const isExpanded = expandedPostId === post.id;
                const hasUpvoted = post.upvotes.includes(effectiveUserId);
                const hasExpertReply = post.replies.some(r => r.isExpertResponse);

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-[32px] p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4 transition-all"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                          {post.category}
                        </span>
                        {hasExpertReply && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Specialist Answered</span>
                          </span>
                        )}
                        {post.babyAgeContext && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                            👶 {post.babyAgeContext}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-gray-400 font-semibold">
                        <span>{new Date(post.createdAt).toLocaleString()}</span>
                        {post.authorId === effectiveUserId && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 border-none bg-transparent cursor-pointer"
                            title="Delete my post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                      className="cursor-pointer space-y-2"
                    >
                      <h3 className="text-lg font-serif font-black text-gray-900 hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>

                    {/* Author & Action Footer */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-7 h-7 rounded-full bg-primary/15 text-primary font-black flex items-center justify-center text-xs">
                          {post.authorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-800">{post.authorName}</span>
                        {['Pediatric Care Provider', 'Lactation Specialist', 'Pediatric Nutritionist', 'Midwife / Doula'].includes(post.authorRole) ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>✓ Verified Ama Specialist</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                            {post.authorRole} • Independent Post
                          </span>
                        )}
                        {post.authorLocation && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {post.authorLocation.split(',')[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleToggleUpvote(post.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${
                            hasUpvoted
                              ? 'bg-primary text-white border-primary'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful ({post.upvotes.length})</span>
                        </button>

                        <button
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{post.replies.length} {post.replies.length === 1 ? 'Answer' : 'Answers'}</span>
                        </button>

                        <button
                          onClick={() => handleRequestSpecialistOnPost(post.id)}
                          disabled={requestingSpecialistId === post.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {requestingSpecialistId === post.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>Get Specialist Synthesis</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Replies & Reply Composer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-4 border-t border-gray-100 space-y-3"
                        >
                          {post.replies.length > 0 ? (
                            <div className="space-y-3">
                              {post.replies.map(reply => (
                                <div
                                  key={reply.id}
                                  className={`p-4 rounded-2xl border space-y-2 ${
                                    reply.isExpertResponse
                                      ? 'bg-emerald-50/60 border-emerald-200'
                                      : 'bg-gray-50 border-gray-100'
                                  }`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-black text-gray-900">
                                        {reply.authorName}
                                      </span>
                                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                        reply.isExpertResponse
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-white text-gray-600 border border-gray-200'
                                      }`}>
                                        {reply.isExpertResponse ? (
                                          <>
                                            <ShieldCheck className="w-3 h-3 text-emerald-100" />
                                            <span>✓ Verified Ama Specialist ({reply.authorRole})</span>
                                          </>
                                        ) : (
                                          <span>{reply.authorRole} • Community Member</span>
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-gray-400">
                                        {new Date(reply.createdAt).toLocaleString()}
                                      </span>
                                      <button
                                        onClick={() => handleToggleUpvote(post.id, reply.id)}
                                        className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-bold text-gray-700 flex items-center gap-1 cursor-pointer"
                                      >
                                        <ThumbsUp className="w-3 h-3" />
                                        <span>{reply.upvotes.length}</span>
                                      </button>
                                    </div>
                                  </div>

                                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {reply.content}
                                  </p>

                                  {reply.sources && reply.sources.length > 0 && (
                                    <div className="pt-2 border-t border-emerald-200/60 space-y-1">
                                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                                        Verified Reference Sources:
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {reply.sources.map((src, i) => (
                                          <a
                                            key={i}
                                            href={src.uri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 no-underline"
                                          >
                                            <span>{src.title}</span>
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">
                              No parent or care provider answers yet. Share your experience or tap "Get Specialist Synthesis" above.
                            </p>
                          )}

                          {/* Add Answer Input */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <input
                              type="text"
                              value={replyDrafts[post.id] || ''}
                              onChange={e =>
                                setReplyDrafts(prev => ({ ...prev, [post.id]: e.target.value }))
                              }
                              placeholder={`Write a helpful answer as ${myDisplayName} (${myRole})...`}
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-800 outline-none focus:border-primary"
                            />
                            <button
                              onClick={() => handleAddReply(post.id)}
                              disabled={submittingReplyId === post.id}
                              className="px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border-none cursor-pointer shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{submittingReplyId === post.id ? 'Posting...' : 'Post Answer'}</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] p-8 sm:p-12 text-center border border-gray-100 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
                💬
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-serif font-black text-gray-900">
                  Start the First Discussion in {selectedField}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Ask a real question about feeding, sleep, lactation, or infant health to get answers from other parents and evidence-based specialists.
                </p>
              </div>
              <button
                onClick={() => setIsAskModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-md border-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ask a Question Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB: OMUGWO SOCIAL MARKETPLACE */}
      {activeTab === 'omugwo' && (
        <div className="space-y-6">
          {/* Marketplace Intro Header */}
          <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-[32px] p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="max-w-2xl space-y-2 relative z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-200 border border-amber-300/30 inline-block">
                Cultural Postpartum Care Circle
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-100">
                Omugwo Social Marketplace
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-normal">
                Discover and connect with vetted traditional postpartum caregivers, elder sitters, and doulas. Our caregivers specialize in African postpartum recuperation, traditional belly binding, nourishing herbal soups (Ji Mmiri Oku), and night infant soothing.
              </p>
            </div>
            <div className="absolute right-4 bottom-2 text-7xl opacity-10 select-none pointer-events-none">
              🌿
            </div>
          </div>

          {/* Schedule Filter and Booking Feedback */}
          <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                Schedule:
              </span>
              {(['All', 'Daily', 'Weekend', 'Live-In', 'Consultation'] as const).map(sch => (
                <button
                  key={sch}
                  onClick={() => setCaregiverScheduleFilter(sch)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer border transition-all ${
                    caregiverScheduleFilter === sch
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {sch === 'All' ? 'All Schedules' : sch}
                </button>
              ))}
            </div>

            {bookingSuccessMsg && (
              <div className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-fadeIn">
                {bookingSuccessMsg}
              </div>
            )}
          </div>

          {/* Active Bookings (if any) */}
          {activeBookings.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-[28px] p-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                Your Scheduled Caregiver Bookings ({activeBookings.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {activeBookings.map((b: any) => (
                  <div key={b.id} className="bg-white rounded-2xl p-4 border border-amber-100 shadow-xs space-y-1.5 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-black text-gray-900">{b.caregiverName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">Type: {b.scheduleType}</p>
                    <p className="text-gray-500 text-[11px]">Start Date: {b.startDate}</p>
                    {b.notes && <p className="text-gray-600 italic text-[11px] truncate">Diet: {b.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caregiver Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {INITIAL_VETTED_CAREGIVERS
              .filter(c => {
                if (caregiverScheduleFilter === 'All') return true;
                return c.availability.includes(caregiverScheduleFilter);
              })
              .map(caregiver => (
                <div
                  key={caregiver.id}
                  className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between gap-5 transition-all hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-gray-900">
                            {caregiver.name}
                          </h3>
                          <span className="text-xs text-gray-400 font-semibold">({caregiver.ageGroup})</span>
                        </div>
                        <p className="text-xs font-bold text-amber-700 mt-0.5">
                          {caregiver.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-black text-amber-900">{caregiver.rating}</span>
                        <span className="text-[10px] font-medium text-gray-500">({caregiver.reviewCount})</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">
                      {caregiver.bio}
                    </p>

                    {/* Vetting badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Identity Verified
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-blue-600" /> Background Checked
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-purple-600" /> Health Screened
                      </span>
                    </div>

                    {/* Services and languages */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Core Expertise:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {caregiver.coreServices.map((svc, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-lg bg-gray-50 text-gray-700 text-[11px] font-semibold border border-gray-200">
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {caregiver.location}
                      </span>
                      <span>Languages: {caregiver.languages.join(', ')}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Rate</p>
                      <p className="text-sm font-black text-gray-900">
                        ₦{caregiver.dailyRateNGN.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-gray-500">/ day</span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCaregiverForBooking(caregiver);
                        setBookingScheduleType(caregiver.availability[0] as any || 'Daily');
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer border-none"
                    >
                      <HeartHandshake className="w-4 h-4" />
                      <span>Book Caregiver</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Booking Modal */}
          <AnimatePresence>
            {selectedCaregiverForBooking && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full space-y-5 border border-gray-100 shadow-2xl text-left"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                        Omugwo Care Request
                      </span>
                      <h3 className="text-xl font-serif font-black text-gray-900 mt-0.5">
                        Schedule {selectedCaregiverForBooking.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {selectedCaregiverForBooking.title} • {selectedCaregiverForBooking.location}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCaregiverForBooking(null)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 border-none cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleBookCaregiver} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Select Caregiver Schedule Type
                      </label>
                      <select
                        value={bookingScheduleType}
                        onChange={e => setBookingScheduleType(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-semibold text-gray-800 outline-none focus:border-amber-600"
                      >
                        <option value="Daily">Daily Care (Morning to Evening)</option>
                        <option value="Weekend">Weekend Support</option>
                        <option value="Live-In">Live-In Omugwo (1 to 4 Weeks)</option>
                        <option value="Nurse/Paediatrician Consultation">Caregiver Clinical Consultation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Preferred Start Date
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={e => setBookingDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-semibold text-gray-800 outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Postpartum Dietary & Cultural Preferences
                      </label>
                      <textarea
                        rows={3}
                        value={bookingDietNotes}
                        onChange={e => setBookingDietNotes(e.target.value)}
                        placeholder="E.g., Daily Ji Mmiri Oku (Postpartum Yam Pepper Soup), Tom Brown porridge, gentle hot compress..."
                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 outline-none focus:border-amber-600 resize-none"
                      />
                    </div>

                    <div className="bg-amber-50 p-3.5 rounded-2xl text-[11px] text-amber-900 border border-amber-200 leading-relaxed">
                      💡 <strong>Direct Social Marketplace:</strong> Ama coordinates credential validation and connects families. The caregiver will contact you via WhatsApp / Phone to confirm specific hours, food supply lists, and logistics.
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCaregiverForBooking(null)}
                        className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold border-none cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer shadow-md"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TAB 2: PARENT & CARE PROVIDER NETWORK */}
      {activeTab === 'network' && (
        <div className="space-y-5">
          <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={networkSearch}
                onChange={e => setNetworkSearch(e.target.value)}
                placeholder="Search parents, families, lactation consultants & care providers by name, city, or specialty..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-800 outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {['All', 'Parents', 'Providers'].map(roleOpt => (
                <button
                  key={roleOpt}
                  onClick={() => setNetworkRoleFilter(roleOpt)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                    networkRoleFilter === roleOpt
                      ? 'bg-primary text-white border-primary'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {roleOpt === 'All' ? 'All Members' : roleOpt === 'Parents' ? 'Parents & Families' : 'Care Providers & Experts'}
                </button>
              ))}

              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer"
              >
                + Join / Edit My Profile
              </button>
            </div>
          </div>

          {filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map(member => {
                const connected = isConnectedWith(member.id);
                const isMe = member.id === effectiveUserId;
                return (
                  <div
                    key={member.id}
                    className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary font-serif font-black text-lg flex items-center justify-center shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-gray-900">
                              {member.name} {isMe && <span className="text-primary">(You)</span>}
                            </h3>
                            <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 mt-0.5">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {member.specialty && (
                        <p className="text-xs font-bold text-gray-700">
                          Focus: {member.specialty}
                        </p>
                      )}

                      {member.bio && (
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {member.bio}
                        </p>
                      )}

                      {member.location && (
                        <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{member.location}</span>
                        </p>
                      )}
                    </div>

                    {!isMe && (
                      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                        <button
                          onClick={() => handleConnectMember(member)}
                          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider border cursor-pointer transition-all ${
                            connected
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-primary text-white border-primary'
                          }`}
                        >
                          {connected ? '✓ Connected' : '+ Connect'}
                        </button>
                        <button
                          onClick={() => handleOpenDirectChat(member)}
                          className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1 border-none cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] p-8 sm:p-12 text-center border border-gray-100 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                🤝
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-serif font-black text-gray-900">
                  Register Your Parent or Care Provider Profile
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Add your profile to the Community Network Directory so other parents, families, and care providers can connect and chat with you.
                </p>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-md border-none cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create My Network Profile</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE CHAT ROOMS */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Channels Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-[32px] p-4 border border-gray-100 shadow-xs space-y-2 h-fit">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1">
              Community Topic Rooms
            </p>
            {CHAT_ROOMS.map(room => (
              <button
                key={room.id}
                onClick={() => setActiveRoomId(room.id)}
                className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  activeRoomId === room.id
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-100'
                }`}
              >
                <p className="text-xs font-black">{room.name}</p>
                <p className={`text-[10px] mt-0.5 ${activeRoomId === room.id ? 'text-white/80' : 'text-gray-500'}`}>
                  {room.desc}
                </p>
              </button>
            ))}

            {customDmRoom && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1">
                  Direct Conversation
                </p>
                <button
                  onClick={() => setActiveRoomId(customDmRoom.id)}
                  className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    activeRoomId === customDmRoom.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}
                >
                  <p className="text-xs font-black">{customDmRoom.name}</p>
                </button>
              </div>
            )}
          </div>

          {/* Active Chat Stream */}
          <div className="lg:col-span-8 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-card/40">
              <div>
                <h3 className="text-sm sm:text-base font-serif font-black text-gray-900">
                  {customDmRoom && activeRoomId === customDmRoom.id
                    ? customDmRoom.name
                    : CHAT_ROOMS.find(r => r.id === activeRoomId)?.name || '# Chat Room'}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Real-time persistent room • Chatting as <strong>{myDisplayName}</strong> ({myRole})
                </p>
              </div>
              <button
                onClick={fetchCommunityState}
                className="p-2 rounded-xl bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 cursor-pointer"
                title="Refresh messages"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-gray-50/40">
              {currentRoomMessages.length > 0 ? (
                currentRoomMessages.map(msg => {
                  const isMine = msg.senderId === effectiveUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-black text-gray-700">
                          {msg.senderName}
                        </span>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-200/80 text-gray-700">
                          {msg.senderRole}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-primary text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-2">
                  <MessageCircle className="w-8 h-8 text-gray-300" />
                  <p className="text-xs font-bold text-gray-600">
                    No messages in this room yet.
                  </p>
                  <p className="text-[11px] text-gray-400 max-w-xs">
                    Send the first message below to start chatting with parents and care providers in this channel.
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSendChatMessage}
              className="p-3 sm:p-4 bg-white border-t border-gray-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Write a message to the room..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-gray-800 outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-none cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: ASK A SPECIALIST (MULTI-FIELD EVIDENCE CONSULTATION) */}
      {activeTab === 'specialist' && (
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Evidence-Based Specialist Consultation
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900 pt-1">
              Ask a Specialist Across All Parenting & Care Fields
            </h2>
            <p className="text-xs text-gray-600">
              Select a clinical or parenting field below to receive an evidence-based response grounded in WHO, AAP, and clinical guidelines, and optionally share it with the Community Forum.
            </p>
          </div>

          <form onSubmit={handleAskSpecialistDirect} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                  Select Specialist Field
                </label>
                <select
                  value={specialistField}
                  onChange={e => setSpecialistField(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-gray-800 outline-none focus:border-primary"
                >
                  {COMMUNITY_FIELDS.filter(f => f !== 'All Fields').map(field => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-200 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={publishToForum}
                    onChange={e => setPublishToForum(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-xs font-bold text-gray-700">
                    Also publish question & answer to the Community Forum so other parents can reply
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                Your Question (Baby Age: {babyAge} • Location: {userLocation})
              </label>
              <textarea
                rows={4}
                required
                value={specialistQuestion}
                onChange={e => setSpecialistQuestion(e.target.value)}
                placeholder="Describe your question in detail (e.g. latch discomfort, introducing iron-rich local weaning foods, frequent night waking at 6 months, fever after pentavalent vaccine)..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm font-medium text-gray-800 outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isAskingSpecialist}
              className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md border-none cursor-pointer"
            >
              {isAskingSpecialist ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isAskingSpecialist ? 'Consulting Specialist Grounding...' : 'Get Specialist Answer'}</span>
            </button>
          </form>

          {specialistError && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
              {specialistError}
            </p>
          )}

          {specialistResult && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>{specialistField} Specialist Response</span>
                </span>
                {publishToForum && (
                  <span className="text-[10px] font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                    ✓ Shared to Q&A Forum
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-2xl border border-emerald-100">
                {specialistResult.answer}
              </div>

              {specialistResult.sources.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                    Verified Clinical & Web Grounding Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {specialistResult.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-800 hover:underline bg-white px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 no-underline"
                      >
                        <span>{src.title}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Ask a Question / Create Forum Post */}
      <AnimatePresence>
        {isAskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Community Q&A Forum
                  </span>
                  <h2 className="text-xl font-serif font-black text-gray-900">
                    Ask Parents & Care Providers
                  </h2>
                </div>
                <button
                  onClick={() => setIsAskModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={myDisplayName}
                      onChange={e => setMyDisplayName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                      Your Role
                    </label>
                    <select
                      value={myRole}
                      onChange={e => setMyRole(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-gray-800"
                    >
                      {MEMBER_ROLES.map(r => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                    Field / Topic Category *
                  </label>
                  <select
                    value={newPostCategory}
                    onChange={e => setNewPostCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-gray-800"
                  >
                    {COMMUNITY_FIELDS.filter(f => f !== 'All Fields').map(f => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                    Question Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPostTitle}
                    onChange={e => setNewPostTitle(e.target.value)}
                    placeholder="e.g. Best ways to enrich pap/cereal for a 6-month-old?"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                    Details & Context *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    placeholder="Share details so other parents and care providers can give practical, relevant answers..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-gray-800 outline-none focus:border-primary resize-none"
                  />
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestExpertOnCreate}
                    onChange={e => setRequestExpertOnCreate(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-xs font-bold text-emerald-950">
                    Also attach an immediate Evidence-Based Specialist synthesis (grounded in clinical guidelines)
                  </span>
                </label>

                {postError && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200">
                    {postError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAskModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-xs font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPost}
                    className="px-6 py-2.5 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-wider shadow-md border-none cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmittingPost && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSubmittingPost ? 'Publishing...' : 'Publish Question'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Register / Edit Network Profile */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full border border-gray-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    Community Network Profile
                  </span>
                  <h2 className="text-xl font-serif font-black text-gray-900">
                    Your Parent / Care Provider Profile
                  </h2>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMemberProfile} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={myDisplayName}
                    onChange={e => setMyDisplayName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                    Role in Community *
                  </label>
                  <select
                    value={myRole}
                    onChange={e => setMyRole(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-gray-800"
                  >
                    {MEMBER_ROLES.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                    Specialty / Parenting Focus
                  </label>
                  <input
                    type="text"
                    value={mySpecialty}
                    onChange={e => setMySpecialty(e.target.value)}
                    placeholder="e.g. IBCLC Lactation Consultant, First-time Mom, Pediatric Nurse..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                    Short Bio & How You Connect
                  </label>
                  <textarea
                    rows={3}
                    value={myBio}
                    onChange={e => setMyBio(e.target.value)}
                    placeholder="Introduce yourself to other parents, families, and care providers..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-gray-800 resize-none"
                  />
                </div>

                {profileSavedNotice && (
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                    ✓ {profileSavedNotice}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-xs font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider shadow-md border-none cursor-pointer"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save & Publish Profile'}
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
