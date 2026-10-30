import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  MessageSquare,
  HelpCircle,
  Send,
  Plus,
  Search,
  ThumbsUp,
  Stethoscope,
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
  Check,
  Briefcase,
  DollarSign,
  FileText,
  UserCheck,
  PhoneCall,
  Mail,
  ShieldAlert,
  Building,
  Heart
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

export interface IndependentSpecialist {
  id: string;
  name: string;
  title: string;
  field: string;
  credentials: string;
  location: string;
  feeInfo: string;
  bio: string;
  contactInfo: string;
  registeredAt: string;
}

export interface MarketplaceProvider {
  id: string;
  name: string;
  title: string;
  category: string;
  experienceYears: number;
  rateInfo: string;
  location: string;
  bio: string;
  availability: string;
  services?: string[];
  registeredAt: string;
}

export interface FamilyCareRequest {
  id: string;
  familyName: string;
  category: string;
  title: string;
  description: string;
  schedule: string;
  location: string;
  budget: string;
  contactInfo?: string;
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
  'Caregivers & Sitters',
  'Elder Sitters & Senior Care',
  'Doulas & Night Care',
  'Family Financial & Trust Planning',
  'Career Coaching & Work-Life Balance',
  'Mental Health & Emotional Wellness',
  'Family Law & Estate Legal',
  'Home Organization & Meal Support',
  'Feeding & Weaning',
  'Lactation & Breastfeeding',
  'Sleep & Wake Windows',
  'Wellness & Routine',
  'Developmental Milestones'
];

const MEMBER_ROLES = [
  'Parent',
  'Family Circle / Grandparent',
  'Caregiver / Nanny',
  'Elder Sitter / Companion',
  'Doula / Birth Worker',
  'Financial & Trust Advisor',
  'Career & Family Coach',
  'Mental Health Counselor',
  'Family Law / Legal Advisor',
  'Home Organizer',
  'Lactation Specialist',
  'Wellness Provider'
];

const CHAT_ROOMS = [
  { id: 'general-parenting', name: '# General Parenting Village', desc: 'Connect & chat with parents and families worldwide' },
  { id: 'lactation-nursing', name: '# Lactation & Nursing Support', desc: 'Breastfeeding, pumping, bottle feeds & latch guidance' },
  { id: 'weaning-nutrition', name: '# Weaning & Local Recipes', desc: 'First solids, Tom Brown, purees & food allergies' },
  { id: 'sleep-wake-windows', name: '# Night Feeds & Sleep Lounge', desc: '2 AM check-ins, wake windows & gentle soothing' },
  { id: 'pediatric-care', name: '# Care Providers & Health Q&A', desc: 'Teething, routines, immunizations & developmental care' }
];

const MARKETPLACE_CATEGORIES = [
  'All Services',
  'Caregivers & Sitters',
  'Elder Sitters & Senior Care',
  'Doulas & Night Care',
  'Financial & Trust Advisors',
  'Career & Work-Life Coaches',
  'Mental Health & Therapy',
  'Household & Meal Support'
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
    title: 'Community Support Forum & Peer Network | Ama Baby Care',
    description: 'Connect with fellow parents, peer networks, independent specialists, caregivers, and family service providers across all childcare phases.',
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

  // Main navigation tab order strictly enforced
  const [activeTab, setActiveTab] = useState<'forum' | 'network' | 'chat' | 'omugwo' | 'specialist'>('forum');
  const [isLoadingState, setIsLoadingState] = useState(false);

  // Profile onboarding status
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean>(() => {
    return localStorage.getItem('ama_comm_profile_created') === 'true';
  });

  // User's active community identity
  const [myDisplayName, setMyDisplayName] = useState(() => localStorage.getItem('ama_comm_name') || parentName || 'Parent');
  const [myRole, setMyRole] = useState(() => localStorage.getItem('ama_comm_role') || 'Parent');
  const [mySpecialty, setMySpecialty] = useState(() => localStorage.getItem('ama_comm_specialty') || '');
  const [myBio, setMyBio] = useState(() => localStorage.getItem('ama_comm_bio') || '');

  // Community state synced with server
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [members, setMembers] = useState<CommunityMemberItem[]>([]);
  const [connections, setConnections] = useState<{ id: string; fromId: string; toId: string; createdAt: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<CommunityChatMessageItem[]>([]);
  const [specialists, setSpecialists] = useState<IndependentSpecialist[]>([]);
  const [marketplaceProviders, setMarketplaceProviders] = useState<MarketplaceProvider[]>([]);
  const [marketplaceRequests, setMarketplaceRequests] = useState<FamilyCareRequest[]>([]);

  // Care Marketplace State
  const [marketplaceCategoryFilter, setMarketplaceCategoryFilter] = useState('All Services');
  const [selectedCaregiverForBooking, setSelectedCaregiverForBooking] = useState<any | null>(null);
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

  // Modal open states for new registrations & requests
  const [isSpecialistRegisterModalOpen, setIsSpecialistRegisterModalOpen] = useState(false);
  const [isProviderRegisterModalOpen, setIsProviderRegisterModalOpen] = useState(false);
  const [isCareRequestModalOpen, setIsCareRequestModalOpen] = useState(false);

  // Registration Form States
  const [specName, setSpecName] = useState('');
  const [specTitle, setSpecTitle] = useState('');
  const [specField, setSpecField] = useState('Lactation & Breastfeeding');
  const [specCredentials, setSpecCredentials] = useState('');
  const [specLocation, setSpecLocation] = useState(userLocation);
  const [specFeeInfo, setSpecFeeInfo] = useState('Independent Consultation / Fee Varies');
  const [specBio, setSpecBio] = useState('');
  const [specContactInfo, setSpecContactInfo] = useState('');
  const [isSubmittingSpecialist, setIsSubmittingSpecialist] = useState(false);

  const [provName, setProvName] = useState('');
  const [provTitle, setProvTitle] = useState('');
  const [provCategory, setProvCategory] = useState('Caregivers & Sitters');
  const [provExpYears, setProvExpYears] = useState('3');
  const [provRateInfo, setProvRateInfo] = useState('$25/hr or Negotiable');
  const [provLocation, setProvLocation] = useState(userLocation);
  const [provBio, setProvBio] = useState('');
  const [provAvailability, setProvAvailability] = useState('Daily & Night Support');
  const [isSubmittingProvider, setIsSubmittingProvider] = useState(false);

  const [reqFamilyName, setReqFamilyName] = useState(myDisplayName || parentName || 'Family');
  const [reqCategory, setReqCategory] = useState('Caregivers & Sitters');
  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqSchedule, setReqSchedule] = useState('Immediate / Flexible');
  const [reqLocation, setReqLocation] = useState(userLocation);
  const [reqBudget, setReqBudget] = useState('Market Rate / Negotiable');
  const [reqContactInfo, setReqContactInfo] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

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
        if (Array.isArray(data.specialists)) setSpecialists(data.specialists);
        if (Array.isArray(data.marketplaceProviders)) setMarketplaceProviders(data.marketplaceProviders);
        if (Array.isArray(data.marketplaceRequests)) setMarketplaceRequests(data.marketplaceRequests);
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

  // Poll chat messages when on Live Rooms tab
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
    }, 4000);
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

  // Active Connections List for the user
  const myConnectionsList = useMemo(() => {
    const connectedMemberIds = new Set(
      connections
        .filter(c => c.fromId === effectiveUserId || c.toId === effectiveUserId)
        .map(c => (c.fromId === effectiveUserId ? c.toId : c.fromId))
    );
    return members.filter(m => connectedMemberIds.has(m.id));
  }, [connections, members, effectiveUserId]);

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
    localStorage.setItem('ama_comm_profile_created', 'true');
    setHasCompletedProfile(true);

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
        setProfileSavedNotice('Your Peer Network Profile is active!');
        setTimeout(() => {
          setIsProfileModalOpen(false);
          setProfileSavedNotice('');
        }, 800);
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

  const handleOpenDirectChat = (targetMember: { id: string; name: string; role?: string }) => {
    const pair = [effectiveUserId, targetMember.id].sort().join('--');
    const dmRoomId = `dm-${pair}`;
    setCustomDmRoom({ id: dmRoomId, name: `Direct Chat with ${targetMember.name}` });
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

  const handleRegisterSpecialist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specName.trim() || !specTitle.trim()) return;
    setIsSubmittingSpecialist(true);
    try {
      const res = await fetch('/api/community/specialists/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: specName.trim(),
          title: specTitle.trim(),
          field: specField,
          credentials: specCredentials.trim(),
          location: specLocation.trim(),
          feeInfo: specFeeInfo.trim(),
          bio: specBio.trim(),
          contactInfo: specContactInfo.trim()
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.specialists)) {
        setSpecialists(data.specialists);
        setIsSpecialistRegisterModalOpen(false);
        setSpecName('');
        setSpecTitle('');
        setSpecCredentials('');
        setSpecBio('');
        setSpecContactInfo('');
      }
    } catch (err) {
      console.warn('Specialist registration failed:', err);
    } finally {
      setIsSubmittingSpecialist(false);
    }
  };

  const handleRegisterProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName.trim() || !provTitle.trim()) return;
    setIsSubmittingProvider(true);
    try {
      const res = await fetch('/api/community/marketplace/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: provName.trim(),
          title: provTitle.trim(),
          category: provCategory,
          experienceYears: Number(provExpYears) || 1,
          rateInfo: provRateInfo.trim(),
          location: provLocation.trim(),
          bio: provBio.trim(),
          availability: provAvailability.trim()
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.providers)) {
        setMarketplaceProviders(data.providers);
        setIsProviderRegisterModalOpen(false);
        setProvName('');
        setProvTitle('');
        setProvBio('');
      }
    } catch (err) {
      console.warn('Provider registration failed:', err);
    } finally {
      setIsSubmittingProvider(false);
    }
  };

  const handlePostCareRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqDescription.trim()) return;
    setIsSubmittingRequest(true);
    try {
      const res = await fetch('/api/community/marketplace/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyName: reqFamilyName.trim() || myDisplayName || 'Family',
          category: reqCategory,
          title: reqTitle.trim(),
          description: reqDescription.trim(),
          schedule: reqSchedule.trim(),
          location: reqLocation.trim(),
          budget: reqBudget.trim(),
          contactInfo: reqContactInfo.trim()
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.requests)) {
        setMarketplaceRequests(data.requests);
        setIsCareRequestModalOpen(false);
        setReqTitle('');
        setReqDescription('');
      }
    } catch (err) {
      console.warn('Care request submission failed:', err);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleBookCaregiver = (caregiverItem: any) => {
    const newBooking = {
      id: `booking-${Date.now()}`,
      caregiverId: caregiverItem.id,
      caregiverName: caregiverItem.name,
      scheduleType: bookingScheduleType,
      startDate: bookingDate,
      notes: bookingDietNotes,
      status: 'Scheduled & Confirmed',
      createdAt: new Date().toISOString()
    };
    const updated = [newBooking, ...activeBookings];
    setActiveBookings(updated);
    try {
      localStorage.setItem('ama_omugwo_bookings', JSON.stringify(updated));
    } catch {}
    setBookingSuccessMsg(`✅ Care request confirmed for ${caregiverItem.name}! Connection coordinates sent.`);
    setTimeout(() => {
      setSelectedCaregiverForBooking(null);
      setBookingSuccessMsg('');
    }, 3000);
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
                Parent, Peer & Care Community
              </span>
              <span className="text-[10px] font-bold text-gray-600 bg-white px-2.5 py-0.5 rounded-full border border-gray-100">
                Active: {myDisplayName} ({myRole})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
              Community Village & Care Ecosystem
            </h1>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Connect with parents, explore care providers, join live rooms, and consult independent specialists.
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

      {/* Community Social Platform Policy & Third-Party Notice */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-black text-amber-950 uppercase tracking-wider text-[11px]">
            Community Platform Policy & Independence Notice
          </p>
          <p className="text-amber-900 leading-relaxed">
            Ama Community is an open peer-to-peer parent, family, and caregiver support network. <strong>Please note that we currently have no medical, legal, or health experts directly associated or affiliated with the app yet.</strong> All specialists, advice providers, caregivers, and marketplace listings are independent third-party community members or practitioners. Content shared here is generated independently for peer support, education, and connection, and does not constitute formal medical or professional advice from the app company. Always consult your personal primary physician or emergency services for urgent health matters.
          </p>
        </div>
      </div>

      {/* Profile Onboarding Gate: Must be completed BEFORE starting to use community network */}
      {!hasCompletedProfile ? (
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-[32px] p-6 sm:p-10 shadow-xl space-y-6 max-w-2xl mx-auto my-4 text-left">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 inline-block">
              One-Time Onboarding Required
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-emerald-100">
              Create Your Network Profile & Join the Village
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
              Before browsing community discussions, connecting with peers, chatting in live rooms, or exploring the care marketplace, please set up your profile so fellow parents and caregivers know who you are.
            </p>
          </div>

          <form onSubmit={handleSaveMemberProfile} className="bg-white text-gray-900 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Your Display Name *</label>
                <input
                  type="text"
                  required
                  value={myDisplayName}
                  onChange={e => setMyDisplayName(e.target.value)}
                  placeholder="e.g. Sarah O., Chinedu K."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Your Role *</label>
                <select
                  value={myRole}
                  onChange={e => setMyRole(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                >
                  {MEMBER_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Location / City</label>
                <input
                  type="text"
                  value={userLocation}
                  disabled
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Specialty / Family Context</label>
                <input
                  type="text"
                  value={mySpecialty}
                  onChange={e => setMySpecialty(e.target.value)}
                  placeholder="e.g. Parent of 6mo, Doula, Caregiver..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Short Bio & Introduction</label>
              <textarea
                rows={3}
                value={myBio}
                onChange={e => setMyBio(e.target.value)}
                placeholder="Share a brief note about yourself, your childcare journey, or what you offer..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-800 outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer shadow-md transition-all disabled:opacity-60"
            >
              {isSavingProfile ? 'Creating Profile...' : 'Complete Profile & Unlock Community Network'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Main Navigation Tabs: Feed -> Peer Network -> Live Rooms -> Care Marketplace -> Ask Specialist */}
          <div className="bg-white p-1.5 sm:p-2 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'forum', label: 'Feed', count: posts.length, icon: MessageSquare },
              { id: 'network', label: 'Peer Network', count: members.length, icon: Users },
              { id: 'chat', label: 'Live Rooms', count: chatMessages.length, icon: MessageCircle },
              { id: 'omugwo', label: 'Care Marketplace', count: null, icon: HeartHandshake },
              { id: 'specialist', label: 'Ask Specialist', count: null, icon: Stethoscope }
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

      {/* TAB 1: FEED (Q&A FORUM) */}
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
                  placeholder="Search parent & specialist discussions by topic, keyword, or question..."
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-800 outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unanswered', label: 'Needs Answer' },
                  { id: 'expert', label: 'Specialist Answered' },
                  { id: 'popular', label: 'Most Helpful' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setForumFilter(f.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer border transition-all ${
                      forumFilter === f.id
                        ? 'bg-primary text-white border-primary shadow-2xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {COMMUNITY_FIELDS.map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedField(f)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 cursor-pointer transition-all border ${
                    selectedField === f
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Forum Posts List */}
          {filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map(post => {
                const isExpanded = expandedPostId === post.id;
                const hasExpertReply = post.replies.some(r => r.isExpertResponse);
                const isMyPost = post.authorId === effectiveUserId;

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-[32px] p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4 transition-all hover:border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {post.category}
                          </span>
                          {hasExpertReply && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-700" />
                              <span>Clinical Reference Attached</span>
                            </span>
                          )}
                          {post.babyAgeContext && (
                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              Baby: {post.babyAgeContext}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-serif font-black text-gray-900 leading-snug">
                          {post.title}
                        </h3>

                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <span className="font-bold text-gray-800">{post.authorName}</span>
                          <span>•</span>
                          <span>{post.authorRole}</span>
                          {post.authorLocation && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {post.authorLocation}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {isMyPost && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 border-none cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {post.content}
                    </p>

                    {/* Post Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleUpvote(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all border ${
                            post.upvotes.includes(effectiveUserId)
                              ? 'bg-primary text-white border-primary shadow-2xs'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{post.upvotes.length} Helped</span>
                        </button>

                        <button
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                          <span>{post.replies.length} Replies</span>
                        </button>
                      </div>

                      {!hasExpertReply && (
                        <button
                          onClick={() => handleRequestSpecialistOnPost(post.id)}
                          disabled={requestingSpecialistId === post.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold cursor-pointer text-[11px]"
                        >
                          {requestingSpecialistId === post.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          )}
                          <span>Attach Evidence Synthesis</span>
                        </button>
                      )}
                    </div>

                    {/* Thread Replies Section */}
                    {isExpanded && (
                      <div className="pt-3 space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                        {post.replies.length > 0 ? (
                          <div className="space-y-3">
                            {post.replies.map(reply => (
                              <div
                                key={reply.id}
                                className={`p-3.5 rounded-2xl space-y-2 border text-xs ${
                                  reply.isExpertResponse
                                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                    : 'bg-white border-gray-200 text-gray-800'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black">{reply.authorName}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200/80 text-gray-700">
                                      {reply.authorRole}
                                    </span>
                                    {reply.isExpertResponse && (
                                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-700 text-white flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Grounded Synthesis
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                  </span>
                                </div>

                                <p className="leading-relaxed font-medium whitespace-pre-wrap">
                                  {reply.content}
                                </p>

                                {reply.sources && reply.sources.length > 0 && (
                                  <div className="pt-2 border-t border-emerald-200/60 space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                                      Evidence Grounding Sources:
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {reply.sources.map((src, idx) => (
                                        <a
                                          key={idx}
                                          href={src.uri}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[10px] font-bold text-emerald-800 hover:underline bg-white px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1"
                                        >
                                          <span>{src.title}</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No answers or comments yet. Be the first to answer!</p>
                        )}

                        {/* Reply Box */}
                        <div className="pt-2 flex gap-2">
                          <input
                            type="text"
                            value={replyDrafts[post.id] || ''}
                            onChange={e =>
                              setReplyDrafts(prev => ({ ...prev, [post.id]: e.target.value }))
                            }
                            placeholder="Write an answer or share your experience..."
                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                          />
                          <button
                            onClick={() => handleAddReply(post.id)}
                            disabled={submittingReplyId === post.id || !(replyDrafts[post.id] || '').trim()}
                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 border-none cursor-pointer flex items-center gap-1"
                          >
                            {submittingReplyId === post.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    )}
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
                  Ask a question about feeding, sleep, lactation, or infant health to get answers from other parents and evidence-based specialists.
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

      {/* TAB 2: PEER NETWORK */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          {/* Connected Peers Section: How to message them & active connections */}
          <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-serif font-black text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>My Village Connections ({myConnectionsList.length})</span>
                </h2>
                <p className="text-xs text-gray-600 font-medium">
                  Connect with parents, nannies, and family advisors. Tap <strong>Message Connection</strong> on any connection to open an instant 1-on-1 private room in Live Rooms.
                </p>
              </div>
            </div>

            {myConnectionsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {myConnectionsList.map(peer => (
                  <div key={peer.id} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-3 text-xs flex flex-col justify-between shadow-2xs">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-black text-gray-900 text-sm">{peer.name}</h4>
                          <span className="text-[10px] text-gray-500 font-semibold">{peer.location || userLocation}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 shrink-0">
                          {peer.role}
                        </span>
                      </div>
                      {peer.specialty && (
                        <p className="text-emerald-950 font-bold text-[11px] bg-white/70 px-2.5 py-1 rounded-lg border border-emerald-100">
                          {peer.specialty}
                        </p>
                      )}
                      {peer.bio && (
                        <p className="text-gray-700 leading-relaxed font-normal text-[11px] line-clamp-2">
                          {peer.bio}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleOpenDirectChat(peer)}
                      className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1.5 border-none cursor-pointer shadow-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Message Connection</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-xs text-gray-500 text-center space-y-2">
                <Users className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="font-bold text-gray-700">No active connections yet</p>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Browse the village directory below and tap <strong>+ Connect</strong> to build your care support network. Once connected, you can directly message them anytime.
                </p>
              </div>
            )}
          </div>

          {/* Directory Search & Members Grid */}
          <div className="space-y-4">
            <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={networkSearch}
                  onChange={e => setNetworkSearch(e.target.value)}
                  placeholder="Search peers, parents, doulas, advisors by name, city, or focus..."
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
                    {roleOpt === 'All' ? 'All Directory' : roleOpt === 'Parents' ? 'Parents' : 'Care & Service Providers'}
                  </button>
                ))}

                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>
            </div>

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
                          <span>Message</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE ROOMS */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Channels Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-[32px] p-4 border border-gray-100 shadow-xs space-y-2 h-fit">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1">
              Community Live Rooms
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
                  Direct Peer Conversation
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
                    : CHAT_ROOMS.find(r => r.id === activeRoomId)?.name || '# Live Room'}
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
                    No messages in this live room yet.
                  </p>
                  <p className="text-[11px] text-gray-400 max-w-xs">
                    Send the first message below to start chatting with peers and care providers in this channel.
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

      {/* TAB 4: CARE MARKETPLACE (OMUGWO CARE & FAMILY SERVICE ECOSYSTEM) */}
      {activeTab === 'omugwo' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-[32px] p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="max-w-2xl space-y-2 relative z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-200 border border-amber-300/30 inline-block">
                Comprehensive Childcare & Family Support Network
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-100">
                Care & Family Service Marketplace
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-normal">
                An open peer-to-peer and professional network connecting families with help across all childcare phases — from daily caregivers, night sitters, and doulas to financial planners, trust & estate advisors, career coaches, and postpartum mental health specialists. Anybody can register as a provider or post a care request!
              </p>
            </div>
            <div className="absolute right-4 bottom-2 text-7xl opacity-10 select-none pointer-events-none">
              🤝
            </div>
          </div>

          {/* Category Filter & Action Bar */}
          <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider shrink-0 flex items-center gap-1 pr-1">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                Category:
              </span>
              {MARKETPLACE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setMarketplaceCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer border transition-all ${
                    marketplaceCategoryFilter === cat
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsProviderRegisterModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Offer Services / Register</span>
              </button>

              <button
                onClick={() => setIsCareRequestModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                <span>Post Care Need</span>
              </button>
            </div>
          </div>

          {bookingSuccessMsg && (
            <div className="px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-fadeIn">
              {bookingSuccessMsg}
            </div>
          )}

          {/* Active Family Care Requests */}
          {marketplaceRequests.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-[28px] p-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                Active Family Care Needs & Open Requests ({marketplaceRequests.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {marketplaceRequests.map(req => (
                  <div key={req.id} className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs space-y-2 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-black text-gray-900">{req.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-900 shrink-0">
                        {req.category}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-snug">{req.description}</p>
                    <div className="text-[10px] text-gray-500 font-bold space-y-0.5 pt-1 border-t border-gray-100">
                      <p>Family: {req.familyName} • Location: {req.location || 'Local'}</p>
                      <p>Budget: {req.budget} • Schedule: {req.schedule}</p>
                    </div>
                    <button
                      onClick={() => handleOpenDirectChat({ id: `req-${req.id}`, name: `${req.familyName} (Care Request)` })}
                      className="w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] border-none cursor-pointer"
                    >
                      Offer Help / Contact Family
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Providers & Vetted Caregivers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* User-registered Marketplace Providers */}
            {marketplaceProviders
              .filter(p => marketplaceCategoryFilter === 'All Services' || p.category === marketplaceCategoryFilter)
              .map(prov => (
                <div
                  key={prov.id}
                  className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between gap-5 transition-all hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-gray-900">
                          {prov.name}
                        </h3>
                        <p className="text-xs font-bold text-amber-800">
                          {prov.title} • {prov.category}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {prov.rateInfo}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      {prov.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 font-bold">
                      <span>Experience: {prov.experienceYears} Years</span>
                      <span>•</span>
                      <span>Location: {prov.location}</span>
                      <span>•</span>
                      <span>Availability: {prov.availability}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCaregiverForBooking(prov)}
                      className="flex-1 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer"
                    >
                      Book / Request Service
                    </button>
                    <button
                      onClick={() => handleOpenDirectChat(prov)}
                      className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold border-none cursor-pointer"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              ))}

            {/* Initial Vetted Caregivers */}
            {INITIAL_VETTED_CAREGIVERS
              .filter(c => {
                if (marketplaceCategoryFilter === 'All Services') return true;
                if (marketplaceCategoryFilter === 'Caregivers & Sitters' || marketplaceCategoryFilter === 'Doulas & Night Care') return true;
                return false;
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

                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      {caregiver.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-blue-600" /> Background Checked
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCaregiverForBooking(caregiver)}
                      className="flex-1 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer"
                    >
                      Schedule Caregiver
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: ASK SPECIALIST */}
      {activeTab === 'specialist' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Independent Third-Party Specialist Directory
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900 pt-1">
                  Ask or Connect with Independent Specialists
                </h2>
                <p className="text-xs text-gray-600">
                  Select any family, caregiving, doula, financial, career, or mental health field to ask questions, or connect with independent third-party specialists. Please note we currently have no specialist associated with the app yet.
                </p>
              </div>

              <button
                onClick={() => setIsSpecialistRegisterModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Register as Third-Party Specialist</span>
              </button>
            </div>

            {/* Third-Party Independent Specialists Directory Grid */}
            {specialists.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
                  Registered Third-Party Independent Specialists ({specialists.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {specialists.map(spec => (
                    <div key={spec.id} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-gray-900 text-sm">{spec.name}</h4>
                          <p className="text-emerald-800 font-bold text-[11px]">{spec.title}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-white text-emerald-900 border border-emerald-200">
                          {spec.field}
                        </span>
                      </div>
                      <p className="text-gray-600 font-semibold text-[11px]">Credentials: {spec.credentials}</p>
                      <p className="text-gray-700 leading-relaxed font-medium">{spec.bio}</p>
                      <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-[10px] text-gray-500 font-bold">
                        <span>Fee: {spec.feeInfo}</span>
                        <span>Location: {spec.location}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSpecialistField(spec.field);
                          setSpecialistQuestion(`Question for ${spec.name} (${spec.title}): `);
                        }}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-none cursor-pointer mt-1"
                      >
                        Consult {spec.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialist Q&A Form */}
            <form onSubmit={handleAskSpecialistDirect} className="space-y-4 pt-2">
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
                      Also publish question & answer to Feed so other parents can reply
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
                  <Stethoscope className="w-4 h-4" />
                )}
                <span>{isAskingSpecialist ? 'Consulting Specialist Engine...' : 'Get Evidence-Based Specialist Answer'}</span>
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
                    <span>{specialistField} Specialist Answer</span>
                  </span>
                  {publishToForum && (
                    <span className="text-[10px] font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ Shared to Feed
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-2xl border border-emerald-100 font-medium">
                  {specialistResult.answer}
                </div>

                {specialistResult.sources.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                      Evidence Grounding Sources
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
        </div>
      )}
      </>
      )}

      {/* MODAL: Register as Third-Party Specialist */}
      <AnimatePresence>
        {isSpecialistRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    Third-Party Registration
                  </span>
                  <h2 className="text-xl font-serif font-black text-gray-900">
                    Register as an Independent Specialist
                  </h2>
                </div>
                <button
                  onClick={() => setIsSpecialistRegisterModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterSpecialist} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Full Name & Title *</label>
                  <input
                    type="text"
                    required
                    value={specName}
                    onChange={e => setSpecName(e.target.value)}
                    placeholder="e.g. Dr. Ngozi Eze / Sarah Jenkins, IBCLC"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Professional Designation / Role *</label>
                  <input
                    type="text"
                    required
                    value={specTitle}
                    onChange={e => setSpecTitle(e.target.value)}
                    placeholder="e.g. Independent Lactation Consultant / Pediatric Specialist"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Specialty Field *</label>
                  <select
                    value={specField}
                    onChange={e => setSpecField(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  >
                    {COMMUNITY_FIELDS.filter(f => f !== 'All Fields').map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Professional License / Credentials</label>
                  <input
                    type="text"
                    value={specCredentials}
                    onChange={e => setSpecCredentials(e.target.value)}
                    placeholder="e.g. IBCLC #123456, Medical License #MD-882"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Consultation Fee & Availability</label>
                  <input
                    type="text"
                    value={specFeeInfo}
                    onChange={e => setSpecFeeInfo(e.target.value)}
                    placeholder="e.g. Free Q&A Forum / $50 Session"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Bio & Practice Background</label>
                  <textarea
                    rows={3}
                    value={specBio}
                    onChange={e => setSpecBio(e.target.value)}
                    placeholder="Describe your background and how you support parents..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSpecialistRegisterModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSpecialist}
                    className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-black uppercase border-none cursor-pointer shadow-md"
                  >
                    {isSubmittingSpecialist ? 'Registering...' : 'Complete Specialist Listing'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Offer Services / Register as Marketplace Provider */}
      <AnimatePresence>
        {isProviderRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                    Care Marketplace Provider
                  </span>
                  <h2 className="text-xl font-serif font-black text-gray-900">
                    Register as a Service Provider
                  </h2>
                </div>
                <button
                  onClick={() => setIsProviderRegisterModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterProvider} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Your Name / Organization *</label>
                  <input
                    type="text"
                    required
                    value={provName}
                    onChange={e => setProvName(e.target.value)}
                    placeholder="e.g. Mary Okon / Bloom Financial Advisors"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={provTitle}
                    onChange={e => setProvTitle(e.target.value)}
                    placeholder="e.g. Postpartum Doula & Night Caregiver / Estate & Family Trust Planner"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category *</label>
                  <select
                    value={provCategory}
                    onChange={e => setProvCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  >
                    {MARKETPLACE_CATEGORIES.filter(c => c !== 'All Services').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={provExpYears}
                      onChange={e => setProvExpYears(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Rate / Fee Structure</label>
                    <input
                      type="text"
                      value={provRateInfo}
                      onChange={e => setProvRateInfo(e.target.value)}
                      placeholder="e.g. $25/hr or NGN rates"
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Services & Bio Description</label>
                  <textarea
                    rows={3}
                    value={provBio}
                    onChange={e => setProvBio(e.target.value)}
                    placeholder="Describe what services you offer to families..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProviderRegisterModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingProvider}
                    className="px-5 py-2 rounded-xl bg-amber-700 text-white font-black uppercase border-none cursor-pointer shadow-md"
                  >
                    {isSubmittingProvider ? 'Publishing...' : 'List Provider Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Post a Care Request / Need Help */}
      <AnimatePresence>
        {isCareRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                    Family Care Request
                  </span>
                  <h2 className="text-xl font-serif font-black text-gray-900">
                    Post a Family Need or Care Request
                  </h2>
                </div>
                <button
                  onClick={() => setIsCareRequestModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePostCareRequest} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Family Name *</label>
                  <input
                    type="text"
                    required
                    value={reqFamilyName}
                    onChange={e => setReqFamilyName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category Needed *</label>
                  <select
                    value={reqCategory}
                    onChange={e => setReqCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  >
                    {MARKETPLACE_CATEGORIES.filter(c => c !== 'All Services').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Request Title *</label>
                  <input
                    type="text"
                    required
                    value={reqTitle}
                    onChange={e => setReqTitle(e.target.value)}
                    placeholder="e.g. Seeking Night Nanny for 2 weeks / Need Family Trust Attorney"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Description & Requirements *</label>
                  <textarea
                    rows={3}
                    required
                    value={reqDescription}
                    onChange={e => setReqDescription(e.target.value)}
                    placeholder="Describe what help you need and when..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Schedule / Timeline</label>
                    <input
                      type="text"
                      value={reqSchedule}
                      onChange={e => setReqSchedule(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Budget / Offered Rate</label>
                    <input
                      type="text"
                      value={reqBudget}
                      onChange={e => setReqBudget(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCareRequestModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRequest}
                    className="px-5 py-2 rounded-xl bg-gray-900 text-white font-black uppercase border-none cursor-pointer shadow-md"
                  >
                    {isSubmittingRequest ? 'Posting...' : 'Publish Care Need'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Book / Request Caregiver Modal */}
      <AnimatePresence>
        {selectedCaregiverForBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full space-y-5 border border-gray-100 shadow-2xl text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                    Care Request Form
                  </span>
                  <h3 className="text-xl font-serif font-black text-gray-900 mt-0.5">
                    Schedule {selectedCaregiverForBooking.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {selectedCaregiverForBooking.title} • {selectedCaregiverForBooking.location || userLocation}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCaregiverForBooking(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={e => { e.preventDefault(); handleBookCaregiver(selectedCaregiverForBooking); }} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Select Schedule Type
                  </label>
                  <select
                    value={bookingScheduleType}
                    onChange={e => setBookingScheduleType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-semibold text-gray-800 outline-none focus:border-amber-600"
                  >
                    <option value="Daily">Daily Support</option>
                    <option value="Weekend">Weekend Support</option>
                    <option value="Live-In">Live-In Support (1 to 4 Weeks)</option>
                    <option value="Nurse/Paediatrician Consultation">Consultation & Planning</option>
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
                    Care Notes & Special Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={bookingDietNotes}
                    onChange={e => setBookingDietNotes(e.target.value)}
                    placeholder="Specific instructions or requirements for your family..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 outline-none focus:border-amber-600 resize-none"
                  />
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
                    Confirm Request
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
                    Peer Network Profile
                  </span>
                  <h2 className="text-xl font-serif font-black text-gray-900">
                    Your Parent & Provider Profile
                  </h2>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMemberProfile} className="space-y-4 text-xs">
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
                    placeholder="Introduce yourself to fellow parents, families, and care providers..."
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
