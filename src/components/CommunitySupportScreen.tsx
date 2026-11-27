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
  Heart,
  Gift,
  Package,
  Lock,
  Copy,
  FileDown,
  Clock,
  CreditCard,
  AlertTriangle,
  Ban,
  Truck,
  Hash,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSEO } from '../utils/seo';
import { INITIAL_VETTED_CAREGIVERS } from '../constants/omugwoData';
import { getOrGenerateDeviceId, fetchClientIpAddress, isDeviceLocallyBanned, markDeviceAsBanned } from '../utils/deviceTracker';
import { generateDisputeEvidencePdf, DisputePdfData } from '../utils/disputePdf';
import {
  auth,
  db,
  collection,
  doc,
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

export interface SellerPaymentMethod {
  id: string;
  type: 'local_bank' | 'global_app';
  isVerified?: boolean;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  appName?: string;
  handleOrEmail?: string;
  payUrl?: string;
  legalName?: string;
  country?: string;
  createdAt: string;
}

export interface CommunityMemberItem {
  id: string;
  name: string;
  role: string;
  specialty: string;
  location: string;
  bio: string;
  topics: string[];
  phoneNumber?: string;
  email?: string;
  deviceId?: string;
  clientIp?: string;
  isKycVerified?: boolean;
  completedInPersonDealsCount?: number;
  providerLevel?: number; // 1 = Local In-Person Only, 2 = Remote Shipping Cleared
  disputeStrikes?: number;
  hasProviderProtectionBadge?: boolean;
  isAccountFrozen?: boolean;
  frozenAt?: string;
  freezeReason?: string;
  kycData?: {
    idType: string;
    idNumberLast4: string;
    verifiedAt: string;
    legalName: string;
  };
  sellerPaymentMethods?: SellerPaymentMethod[];
  joinedAt: string;
  lastActiveAt: string;
}

export interface MarketplaceOrder {
  id: string;
  orderCode: string;
  listingId: string;
  itemTitle: string;
  category: string;
  itemKind: 'service' | 'goods';
  handoverType?: 'in_person' | 'shipping';
  sellerProviderLevel?: number;
  agreedAmount: number;
  currency: string;
  isInternational: boolean;
  status:
    | 'locked'
    | 'proof_submitted'
    | 'confirmed'
    | 'awaiting_dispatch'
    | 'shipped'
    | 'delivery_disputed'
    | 'courier_delivered_pending_consumer_review'
    | 'completed'
    | 'denied'
    | 'disputed'
    | 'cancelled';
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerDeviceId?: string;
  sellerKycVerified: boolean;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  buyerEmail?: string;
  buyerDeviceId?: string;
  buyerKycVerified: boolean;
  lockedPaymentMethod: SellerPaymentMethod;
  paymentProof?: {
    method: string;
    amountPaid: number;
    currency: string;
    paidTimestamp: string;
    transactionId: string;
    receiptProofUrl?: string;
    screenshotUrl?: string;
    notes?: string;
    submittedAt: string;
  };
  reviewDeadline?: string;
  sellerSuspended?: boolean;
  confirmedAt?: string;
  deniedAt?: string;
  denialReason?: string;
  denialStatementUrl?: string;
  disputeNotes?: string;
  shippingProof?: {
    courierName: string;
    waybillNumber: string;
    receiptDocUrl?: string;
    packagePhotoUrl?: string;
    notes?: string;
    shippedAt: string;
  };
  dispatchDeadline?: string;
  shippedAt?: string;
  deliveryEta?: string;
  deliveryDisputedAt?: string;
  deliveryDisputeEvidence?: {
    reason: string;
    evidenceUrl?: string;
    notes?: string;
    filedAt: string;
  };
  providerGraceDeadline?: string;
  providerDeliveryResponse?: {
    responseType: string;
    proofUrl: string;
    notes?: string;
    respondedAt: string;
  };
  courierDeliveredAt?: string;
  autoCompleteDeadline?: string;
  completedAt?: string;
  isProviderFrozen?: boolean;
  isConsumerStrikeApplied?: boolean;
  providerProtectionAwarded?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceBanRecord {
  id: string;
  targetUserId: string;
  targetUserName?: string;
  targetDeviceId: string;
  targetIp?: string;
  reason: string;
  evidenceOrderId?: string;
  bannedAt: string;
  bannedBy: string;
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

export interface CommunityRoomItem {
  id: string;
  name: string;
  topic: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorRole: string;
  inviteCode?: string;
  memberIds: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
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
  ownerId?: string;
  name: string;
  title: string;
  category: string;
  listingKind?: 'service' | 'goods';
  offerMode?: 'paid' | 'gift';
  condition?: string;
  itemStatus?: 'Available' | 'Claimed';
  claimedById?: string;
  claimedByName?: string;
  claimedAt?: string;
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
  ownerId?: string;
  familyName: string;
  category: string;
  needKind?: 'service' | 'goods';
  acceptsGift?: boolean;
  fulfillmentStatus?: 'Open' | 'Gifted' | 'Fulfilled';
  giftedById?: string;
  giftedByName?: string;
  giftNote?: string;
  giftedAt?: string;
  title: string;
  description: string;
  schedule: string;
  location: string;
  budget: string;
  contactInfo?: string;
  createdAt: string;
}

export interface MarketplaceGiftItem {
  id: string;
  giftSourceType: 'need_fulfillment' | 'gift_provision';
  targetListingId: string;
  itemKind: 'service' | 'goods';
  category: string;
  title: string;
  description: string;
  giverId: string;
  giverName: string;
  recipientId: string;
  recipientName: string;
  status: 'Offered' | 'Claimed' | 'Received';
  isPublic: boolean;
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
  'Special Needs & Developmental Therapy (Speech, OT, ABA)',
  'Pediatric Physiotherapy & Motor Rehabilitation',
  'Psychotherapy, Child Psychology & Mental Health',
  'Family Planning & Fertility Counseling',
  'Financial Planning & College Savings',
  'Trusts, Estate Planning & Guardianship Legal',
  'Family Law & Child Custody Advice',
  'Career Coaching & Parental Transition',
  'Life Coaching & Personal Growth',
  'Caregivers, Nannies & Sitters',
  'Elder Sitters & Senior Care',
  'Doulas & Night Care',
  'Lactation & Feeding Support',
  'Sleep & Wake Windows',
  'Home Organization & Meal Support',
  'Developmental Milestones'
];

const MEMBER_ROLES = [
  'Parent',
  'Family Circle / Grandparent',
  'Caregiver / Nanny',
  'Elder Sitter / Companion',
  'Doula / Birth Worker',
  'Special Needs & Developmental Therapist',
  'Pediatric Physiotherapist',
  'Psychotherapist / Child Psychologist',
  'Family Planning Counselor',
  'Financial & Wealth Advisor',
  'Trust & Estate Legal Advisor',
  'Family Lawyer',
  'Career & Family Coach',
  'Life Coach',
  'Home Organizer / Meal Prep Chef',
  'Lactation Specialist',
  'Sleep Consultant'
];

const CHAT_ROOMS = [
  { id: 'general-parenting', name: '# General Parenting Village', desc: 'Connect & chat with parents and families worldwide' },
  { id: 'special-needs-therapy', name: '# Special Needs & Therapy Support', desc: 'Speech, OT, behavioral therapy, and developmental growth' },
  { id: 'finance-legal-trusts', name: '# Financial, Legal & Trust Planning', desc: 'College savings, estate planning, wills, and legal protection' },
  { id: 'career-life-coaching', name: '# Career Transition & Life Coaching', desc: 'Balancing career growth, return-to-work, and personal success' },
  { id: 'mental-health-wellness', name: '# Mental Health & Psychotherapy Lounge', desc: 'Postpartum wellness, child psychology, and emotional support' },
  { id: 'lactation-nursing', name: '# Lactation & Nursing Support', desc: 'Breastfeeding, pumping, bottle feeds & latch guidance' },
  { id: 'weaning-nutrition', name: '# Weaning & Local Recipes', desc: 'First solids, Tom Brown, purees & food allergies' },
  { id: 'sleep-wake-windows', name: '# Night Feeds & Sleep Lounge', desc: '2 AM check-ins, wake windows & gentle soothing' }
];

const ROOM_TOPICS = [
  'General Parenting',
  'Sleep & Night Feeds',
  'Lactation & Feeding',
  'Weaning & Nutrition',
  'Special Needs & Therapy',
  'Local Meetups & Playdates',
  'Mental Health & Postpartum',
  'Career, Finance & Legal'
];

const GOODS_CATEGORIES = [
  'Baby Gear, Strollers & Nursery Goods',
  'Diapers, Feeding & Baby Clothing',
  'Maternal & Postpartum Care Goods',
  'Toys, Books & Learning Goods'
];

const SERVICE_CATEGORIES = [
  'Special Needs & Therapy',
  'Physiotherapy & Rehabilitation',
  'Psychotherapy & Mental Health',
  'Family Planning & Fertility',
  'Financial & Wealth Advisory',
  'Trusts, Estates & Legal Services',
  'Career Coaching & Transition',
  'Life Coaching',
  'Caregivers & Sitters',
  'Elder Sitters & Senior Care',
  'Doulas & Night Care',
  'Household & Meal Support'
];

const MARKETPLACE_CATEGORIES = [
  'All Listings',
  ...GOODS_CATEGORIES,
  ...SERVICE_CATEGORIES
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
    title: 'Community Support Forum & Peer Network | Ama Baby',
    description: 'Connect with fellow parents, peer networks, independent specialists, caregivers, and family service providers across all childcare phases.',
    canonicalUrl: 'https://amababycare.com/#community'
  });

  const effectiveUserId = useMemo(() => {
    if (auth.currentUser?.uid) return auth.currentUser.uid;
    if (userId) return userId;
    let stored = localStorage.getItem('ama_community_uid');
    if (!stored) {
      stored = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem('ama_community_uid', stored);
    }
    return stored;
  }, [userId, auth.currentUser?.uid]);

  // Main navigation tab order strictly enforced
  const [activeTab, setActiveTab] = useState<'forum' | 'network' | 'chat' | 'omugwo'>('forum');
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
  const [communityRooms, setCommunityRooms] = useState<CommunityRoomItem[]>([]);
  const [chatMessages, setChatMessages] = useState<CommunityChatMessageItem[]>([]);
  const [specialists, setSpecialists] = useState<IndependentSpecialist[]>([]);
  const [marketplaceProviders, setMarketplaceProviders] = useState<MarketplaceProvider[]>([]);
  const [marketplaceRequests, setMarketplaceRequests] = useState<FamilyCareRequest[]>([]);
  const [marketplaceGifts, setMarketplaceGifts] = useState<MarketplaceGiftItem[]>([]);

  // Care, Goods & Free Gift Marketplace State
  const [marketplaceCategoryFilter, setMarketplaceCategoryFilter] = useState('All Listings');
  const [marketplaceTypeFilter, setMarketplaceTypeFilter] = useState<'all' | 'services' | 'goods' | 'needs' | 'gifts' | 'orders'>('all');
  const [marketplaceNotice, setMarketplaceNotice] = useState('');

  // Device & KYC Security Tracking
  const [myPhoneNumber, setMyPhoneNumber] = useState(() => localStorage.getItem('ama_comm_phone') || '');
  const [isMyKycVerified, setIsMyKycVerified] = useState(() => localStorage.getItem('ama_comm_kyc_verified') === 'true');
  const [deviceId, setDeviceId] = useState('');
  const [clientIp, setClientIp] = useState('');
  const [isLocallyBanned, setIsLocallyBanned] = useState(false);
  const [marketplaceBans, setMarketplaceBans] = useState<MarketplaceBanRecord[]>([]);

  // KYC Verification Modal State
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycLegalName, setKycLegalName] = useState(() => myDisplayName || parentName || '');
  const [kycIdType, setKycIdType] = useState('National ID (NIN / SSN / National Card)');
  const [kycLast4, setKycLast4] = useState('');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycNotice, setKycNotice] = useState('');

  // Seller External Payment Methods (Up to 5)
  const [myPaymentMethods, setMyPaymentMethods] = useState<SellerPaymentMethod[]>(() => {
    try {
      const stored = localStorage.getItem('ama_comm_payment_methods');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [pmType, setPmType] = useState<'local_bank' | 'global_app'>('local_bank');
  const [pmBankName, setPmBankName] = useState('OPay');
  const [pmAccountNumber, setPmAccountNumber] = useState('');
  const [pmAccountName, setPmAccountName] = useState(() => myDisplayName || parentName || '');
  const [pmAppName, setPmAppName] = useState('PayPal');
  const [pmHandle, setPmHandle] = useState('');
  const [pmPayUrl, setPmPayUrl] = useState('');
  const [pmLegalName, setPmLegalName] = useState('');
  const [pmCountry, setPmCountry] = useState('United Kingdom');
  const [pmError, setPmError] = useState('');

  // Locked Orders & Escrow Tracking
  const [marketplaceOrders, setMarketplaceOrders] = useState<MarketplaceOrder[]>([]);
  const [lockOrderTarget, setLockOrderTarget] = useState<MarketplaceProvider | null>(null);
  const [lockOrderAmount, setLockOrderAmount] = useState('');
  const [lockOrderCurrency, setLockOrderCurrency] = useState('GBP');
  const [lockOrderIsIntl, setLockOrderIsIntl] = useState(false);
  const [lockOrderSelectedPmId, setLockOrderSelectedPmId] = useState('');
  const [lockOrderHandoverType, setLockOrderHandoverType] = useState<'in_person' | 'shipping'>('in_person');
  const [isLockingOrder, setIsLockingOrder] = useState(false);
  const [lockOrderError, setLockOrderError] = useState('');

  // Consumer Proof Submission Modal State
  const [selectedOrderForProof, setSelectedOrderForProof] = useState<MarketplaceOrder | null>(null);
  const [proofMethod, setProofMethod] = useState('Bank Transfer');
  const [proofAmount, setProofAmount] = useState('');
  const [proofTransactionId, setProofTransactionId] = useState('');
  const [proofReceiptDoc, setProofReceiptDoc] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofError, setProofError] = useState('');

  // Provider Denial with Official Statement Modal State
  const [selectedOrderForDenial, setSelectedOrderForDenial] = useState<MarketplaceOrder | null>(null);
  const [denialStatementDoc, setDenialStatementDoc] = useState('');
  const [denialReasonText, setDenialReasonText] = useState('Single-day bank statement uploaded showing no matching incoming credit.');
  const [isSubmittingDenial, setIsSubmittingDenial] = useState(false);
  const [denialError, setDenialError] = useState('');

  // Provider Courier Dispatch Proof Modal State (Mandatory sub-step for shipping deals)
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<MarketplaceOrder | null>(null);
  const [shippingCourierName, setShippingCourierName] = useState('DHL Express');
  const [shippingWaybillNumber, setShippingWaybillNumber] = useState('');
  const [shippingReceiptDoc, setShippingReceiptDoc] = useState('');
  const [shippingPackagePhoto, setShippingPackagePhoto] = useState('');
  const [shippingEtaHours, setShippingEtaHours] = useState('72');
  const [shippingNotes, setShippingNotes] = useState('');
  const [isSubmittingShipping, setIsSubmittingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');

  // Consumer Report Non-Delivery Modal State (Mandatory evidence required)
  const [selectedOrderForNonDelivery, setSelectedOrderForNonDelivery] = useState<MarketplaceOrder | null>(null);
  const [nonDeliveryReason, setNonDeliveryReason] = useState('Courier tracking unfulfilled past ETA deadline');
  const [nonDeliveryEvidenceDoc, setNonDeliveryEvidenceDoc] = useState('');
  const [nonDeliveryNotes, setNonDeliveryNotes] = useState('');
  const [isSubmittingNonDelivery, setIsSubmittingNonDelivery] = useState(false);
  const [nonDeliveryError, setNonDeliveryError] = useState('');

  // Provider 24-Hour Grace Response Modal State
  const [selectedOrderForGraceResponse, setSelectedOrderForGraceResponse] = useState<MarketplaceOrder | null>(null);
  const [graceResponseType, setGraceResponseType] = useState('Official Courier Tracking Confirmation');
  const [graceProofDoc, setGraceProofDoc] = useState('');
  const [graceNotes, setGraceNotes] = useState('');
  const [isSubmittingGraceResponse, setIsSubmittingGraceResponse] = useState(false);
  const [graceError, setGraceError] = useState('');

  // Dispute Arbitration & Strike Resolution Modal State
  const [selectedOrderForResolution, setSelectedOrderForResolution] = useState<MarketplaceOrder | null>(null);
  const [resolutionType, setResolutionType] = useState<'consumer_false_claim' | 'provider_default'>('consumer_false_claim');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);
  const [resolutionError, setResolutionError] = useState('');

  // Safety & Guidance Drawer state ('none' | 'fraud' | 'gifts' | 'tiers')
  const [marketplaceSafetyTab, setMarketplaceSafetyTab] = useState<'none' | 'fraud' | 'gifts' | 'tiers'>('none');

  // Restriction Confirmation Modal State (replaces window.confirm)
  const [pendingRestrictionTarget, setPendingRestrictionTarget] = useState<{
    targetUserId: string;
    targetDeviceId: string;
    reason: string;
    orderId?: string;
  } | null>(null);
  const [isApplyingRestriction, setIsApplyingRestriction] = useState(false);

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Gift Action Modal State (Give a Free Gift onto a Need OR Receive a Free Gift Provision)
  const [giftModalContext, setGiftModalContext] = useState<{
    mode: 'give_to_need' | 'receive_provision';
    targetNeed?: FamilyCareRequest;
    targetProvision?: MarketplaceProvider;
  } | null>(null);
  const [giftActorName, setGiftActorName] = useState(() => localStorage.getItem('ama_comm_name') || parentName || 'Parent');
  const [giftNoteInput, setGiftNoteInput] = useState('');
  const [giftError, setGiftError] = useState('');
  const [isSubmittingGift, setIsSubmittingGift] = useState(false);

  // Forum state
  const [selectedField, setSelectedField] = useState('All Fields');
  const [forumFilter, setForumFilter] = useState<'all' | 'unanswered' | 'expert' | 'popular'>('all');
  const [forumSearch, setForumSearch] = useState('');
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Feeding & Weaning');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postError, setPostError] = useState('');

  // Thread reply state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  // Network state
  const [networkSearch, setNetworkSearch] = useState('');
  const [networkRoleFilter, setNetworkRoleFilter] = useState('All');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState('');

  // Chat & Custom Live Rooms state
  const [roomDirectoryTab, setRoomDirectoryTab] = useState<'official' | 'member'>('official');
  const [activeRoomId, setActiveRoomId] = useState('general-parenting');
  const [customDmRoom, setCustomDmRoom] = useState<{ id: string; name: string } | null>(null);
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('General Parenting');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomActionError, setRoomActionError] = useState('');
  const [roomActionNotice, setRoomActionNotice] = useState('');
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [confirmDeleteRoomId, setConfirmDeleteRoomId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

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
  const [provListingKind, setProvListingKind] = useState<'service' | 'goods'>('service');
  const [provOfferMode, setProvOfferMode] = useState<'paid' | 'gift'>('paid');
  const [provCondition, setProvCondition] = useState('Gently Used');
  const [provCategory, setProvCategory] = useState('Caregivers & Sitters');
  const [provExpYears, setProvExpYears] = useState('3');
  const [provRateInfo, setProvRateInfo] = useState('$25/hr or Negotiable');
  const [provLocation, setProvLocation] = useState(userLocation);
  const [provBio, setProvBio] = useState('');
  const [provAvailability, setProvAvailability] = useState('Daily & Night Support');
  const [isSubmittingProvider, setIsSubmittingProvider] = useState(false);

  const [reqFamilyName, setReqFamilyName] = useState(myDisplayName || parentName || 'Family');
  const [reqNeedKind, setReqNeedKind] = useState<'service' | 'goods'>('service');
  const [reqAcceptsGift, setReqAcceptsGift] = useState(true);
  const [reqCategory, setReqCategory] = useState('Caregivers & Sitters');
  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqSchedule, setReqSchedule] = useState('Immediate / Flexible');
  const [reqLocation, setReqLocation] = useState(userLocation);
  const [reqBudget, setReqBudget] = useState('Market Rate / Negotiable');
  const [reqContactInfo, setReqContactInfo] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Helper: Run server-side rate-limiting & Gemini automated text moderation before publishing
  const runModerationCheck = async (payload: {
    type: 'post' | 'reply' | 'chat' | 'profile' | 'marketplace';
    title?: string;
    text: string;
  }): Promise<{ allowed: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/community/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          userId: effectiveUserId,
          senderId: effectiveUserId,
          authorId: effectiveUserId
        })
      });
      const data = await res.json();
      if (!res.ok || data.allowed === false) {
        return { allowed: false, error: data.error || 'Content blocked by community safety moderation.' };
      }
      return { allowed: true };
    } catch {
      return { allowed: true };
    }
  };

  const fetchCommunityState = async () => {
    setIsLoadingState(true);
    try {
      const res = await fetch('/api/community/state');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.posts)) {
          setPosts(prev => (prev.length > 0 ? prev : data.posts));
        }
        if (Array.isArray(data.members)) {
          setMembers(prev => (prev.length > 0 ? prev : data.members));
          // Hydrate current member's KYC and payment methods
          const myRec = data.members.find((m: CommunityMemberItem) => m.id === effectiveUserId);
          if (myRec) {
            if (myRec.phoneNumber) setMyPhoneNumber(myRec.phoneNumber);
            if (myRec.isKycVerified) {
              setIsMyKycVerified(true);
              localStorage.setItem('ama_comm_kyc_verified', 'true');
            }
            if (Array.isArray(myRec.sellerPaymentMethods) && myRec.sellerPaymentMethods.length > 0) {
              setMyPaymentMethods(myRec.sellerPaymentMethods);
              localStorage.setItem('ama_comm_payment_methods', JSON.stringify(myRec.sellerPaymentMethods));
            }
          }
        }
        if (Array.isArray(data.connections)) setConnections(data.connections);
        if (Array.isArray(data.rooms)) {
          setCommunityRooms(prev => (prev.length > 0 ? prev : data.rooms));
        }
        if (Array.isArray(data.messages)) {
          setChatMessages(prev => (prev.length > 0 ? prev : data.messages));
        }
        if (Array.isArray(data.specialists)) setSpecialists(data.specialists);
        if (Array.isArray(data.marketplaceProviders)) {
          setMarketplaceProviders(prev => (prev.length > 0 ? prev : data.marketplaceProviders));
        }
        if (Array.isArray(data.marketplaceRequests)) {
          setMarketplaceRequests(prev => (prev.length > 0 ? prev : data.marketplaceRequests));
        }
        if (Array.isArray(data.marketplaceGifts)) {
          setMarketplaceGifts(prev => (prev.length > 0 ? prev : data.marketplaceGifts));
        }
        if (Array.isArray(data.marketplaceOrders)) {
          setMarketplaceOrders(data.marketplaceOrders);
        }
        if (Array.isArray(data.marketplaceBans)) {
          setMarketplaceBans(data.marketplaceBans);
        }
      }
    } catch (err) {
      console.warn('Could not fetch community seed state:', err);
    } finally {
      setIsLoadingState(false);
    }
  };

  useEffect(() => {
    fetchCommunityState();
  }, []);

  // Initialize hardware device ID and client IP
  useEffect(() => {
    (async () => {
      try {
        const dId = await getOrGenerateDeviceId();
        setDeviceId(dId);
        const ip = await fetchClientIpAddress();
        setClientIp(ip);
        if (isDeviceLocallyBanned()) {
          setIsLocallyBanned(true);
        }
      } catch (e) {
        console.warn('Device fingerprint error:', e);
      }
    })();
  }, []);

  // Real-time Firestore bindings
  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubPosts = onSnapshot(
      query(collection(db, 'community_posts'), where('isPublic', '==', true), limit(100)),
      (snap) => {
        const fsPosts: CommunityPostItem[] = snap.docs
          .map(d => d.data() as CommunityPostItem)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (fsPosts.length > 0) {
          setPosts(prev => {
            const fsIds = new Set(fsPosts.map(p => p.id));
            const remainingSeed = prev.filter(p => !fsIds.has(p.id) && p.id.startsWith('seed-'));
            return [...fsPosts, ...remainingSeed];
          });
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'community_posts');
        } catch {}
      }
    );

    const unsubRooms = onSnapshot(
      query(collection(db, 'community_rooms'), where('isPublic', '==', true), limit(100)),
      (snap) => {
        const fsRooms: CommunityRoomItem[] = snap.docs
          .map(d => d.data() as CommunityRoomItem)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCommunityRooms(fsRooms);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'community_rooms');
        } catch {}
      }
    );

    const unsubMessages = onSnapshot(
      query(collection(db, 'community_messages'), where('isPublic', '==', true), limit(250)),
      (snap) => {
        const fsMsgs: CommunityChatMessageItem[] = snap.docs
          .map(d => d.data() as CommunityChatMessageItem)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (fsMsgs.length > 0) {
          setChatMessages(fsMsgs);
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'community_messages');
        } catch {}
      }
    );

    const unsubMembers = onSnapshot(
      query(collection(db, 'community_members'), where('isPublic', '==', true), limit(100)),
      (snap) => {
        const fsMembers: CommunityMemberItem[] = snap.docs.map(d => d.data() as CommunityMemberItem);
        if (fsMembers.length > 0) {
          setMembers(prev => {
            const fsIds = new Set(fsMembers.map(m => m.id));
            const remainingSeed = prev.filter(m => !fsIds.has(m.id));
            return [...fsMembers, ...remainingSeed];
          });
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'community_members');
        } catch {}
      }
    );

    const unsubProviders = onSnapshot(
      query(collection(db, 'marketplace_providers'), where('isPublic', '==', true), limit(100)),
      (snap) => {
        const fsProviders: MarketplaceProvider[] = snap.docs
          .map(d => d.data() as MarketplaceProvider)
          .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
        if (fsProviders.length > 0) {
          setMarketplaceProviders(prev => {
            const fsIds = new Set(fsProviders.map(p => p.id));
            const remainingSeed = prev.filter(p => !fsIds.has(p.id));
            return [...fsProviders, ...remainingSeed];
          });
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'marketplace_providers');
        } catch {}
      }
    );

    const unsubRequests = onSnapshot(
      query(collection(db, 'marketplace_requests'), where('isPublic', '==', true), limit(100)),
      (snap) => {
        const fsRequests: FamilyCareRequest[] = snap.docs
          .map(d => d.data() as FamilyCareRequest)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (fsRequests.length > 0) {
          setMarketplaceRequests(prev => {
            const fsIds = new Set(fsRequests.map(r => r.id));
            const remainingSeed = prev.filter(r => !fsIds.has(r.id));
            return [...fsRequests, ...remainingSeed];
          });
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'marketplace_requests');
        } catch {}
      }
    );

    const unsubGifts = onSnapshot(
      query(collection(db, 'marketplace_gifts'), where('isPublic', '==', true), limit(100)),
      (snap) => {
        const fsGifts: MarketplaceGiftItem[] = snap.docs
          .map(d => d.data() as MarketplaceGiftItem)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMarketplaceGifts(fsGifts);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'marketplace_gifts');
        } catch {}
      }
    );

    const unsubOrders = onSnapshot(
      query(collection(db, 'marketplace_orders'), limit(100)),
      (snap) => {
        const fsOrders: MarketplaceOrder[] = snap.docs
          .map(d => d.data() as MarketplaceOrder)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (fsOrders.length > 0) {
          setMarketplaceOrders(prev => {
            const fsIds = new Set(fsOrders.map(o => o.id));
            const remaining = prev.filter(o => !fsIds.has(o.id));
            return [...fsOrders, ...remaining];
          });
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'marketplace_orders');
        } catch {}
      }
    );

    const unsubBans = onSnapshot(
      query(collection(db, 'marketplace_bans'), limit(100)),
      (snap) => {
        const fsBans: MarketplaceBanRecord[] = snap.docs.map(d => d.data() as MarketplaceBanRecord);
        setMarketplaceBans(fsBans);
        // Check if device or user is in this ban list
        const isMeBanned = fsBans.some(
          b => (deviceId && b.targetDeviceId === deviceId) || b.targetUserId === effectiveUserId
        );
        if (isMeBanned) {
          setIsLocallyBanned(true);
          markDeviceAsBanned('Marketplace access restricted after policy review');
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'marketplace_bans');
        } catch {}
      }
    );

    return () => {
      unsubPosts();
      unsubRooms();
      unsubMessages();
      unsubMembers();
      unsubProviders();
      unsubRequests();
      unsubGifts();
      unsubOrders();
      unsubBans();
    };
  }, [auth.currentUser?.uid, deviceId, effectiveUserId]);

  // Open specific room if linked via URL (?screen=community&room=... or #community?room=...)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let linkedRoomId = searchParams.get('room');
      if (!linkedRoomId && window.location.hash.includes('room=')) {
        const hashQuery = window.location.hash.split(/[?&]/).find(part => part.startsWith('room='));
        if (hashQuery) {
          linkedRoomId = decodeURIComponent(hashQuery.replace('room=', ''));
        }
      }
      if (linkedRoomId) {
        setActiveTab('chat');
        setActiveRoomId(linkedRoomId);
        if (!CHAT_ROOMS.some(r => r.id === linkedRoomId)) {
          setRoomDirectoryTab('member');
        }
      }
    } catch {}
  }, []);

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

  const filteredCommunityRooms = useMemo(() => {
    const q = roomSearchQuery.trim().toLowerCase();
    return communityRooms
      .filter(room => {
        if (!q) return true;
        return (
          room.name.toLowerCase().includes(q) ||
          room.topic.toLowerCase().includes(q) ||
          room.description.toLowerCase().includes(q) ||
          room.creatorName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const aJoined = a.memberIds.includes(effectiveUserId) ? 1 : 0;
        const bJoined = b.memberIds.includes(effectiveUserId) ? 1 : 0;
        if (aJoined !== bJoined) return bJoined - aJoined;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [communityRooms, roomSearchQuery, effectiveUserId]);

  const activeCustomRoom = useMemo(() => {
    return communityRooms.find(r => r.id === activeRoomId) || null;
  }, [communityRooms, activeRoomId]);

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
      const mod = await runModerationCheck({
        type: 'post',
        title: newPostTitle.trim(),
        text: newPostContent.trim()
      });
      if (!mod.allowed) {
        setPostError(mod.error || 'Post was blocked by automated safety moderation.');
        return;
      }

      const now = new Date().toISOString();
      const postId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const uid = auth.currentUser?.uid || effectiveUserId;
      const newPost: CommunityPostItem & { isPublic: boolean } = {
        id: postId,
        authorId: uid.slice(0, 128),
        authorName: (myDisplayName.trim() || parentName || 'Parent').slice(0, 80),
        authorRole: myRole.slice(0, 80),
        authorLocation: (userLocation || '').slice(0, 120),
        babyAgeContext: (babyAge || '').slice(0, 60),
        category: newPostCategory.slice(0, 100),
        title: newPostTitle.trim().slice(0, 240),
        content: newPostContent.trim().slice(0, 4000),
        tags: newPostTags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 10),
        upvotes: [],
        replies: [],
        isPublic: true,
        createdAt: now,
        updatedAt: now
      };

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'community_posts', postId), newPost);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `community_posts/${postId}`);
        }
        setPosts(prev => [newPost, ...prev.filter(p => p.id !== postId)]);
        setExpandedPostId(postId);
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostTags('');
        setIsAskModalOpen(false);
      } else {
        const res = await fetch('/api/community/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost)
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
      }
    } catch {
      setPostError('Could not publish post. Please sign in or check your connection.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleAddReply = async (postId: string) => {
    const draft = (replyDrafts[postId] || '').trim();
    if (!draft) return;

    setSubmittingReplyId(postId);
    setPostError('');
    try {
      const mod = await runModerationCheck({ type: 'reply', text: draft });
      if (!mod.allowed) {
        setPostError(mod.error || 'Reply was blocked by community moderation.');
        return;
      }

      const targetPost = posts.find(p => p.id === postId);
      const uid = auth.currentUser?.uid || effectiveUserId;
      const specialistRoles = ['Lactation Specialist', 'Care Provider', 'Midwife / Doula', 'Nutritionist', 'Healthcare Provider'];
      const newReply: CommunityReplyItem = {
        id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        postId,
        authorId: uid.slice(0, 128),
        authorName: (myDisplayName.trim() || parentName || 'Parent').slice(0, 80),
        authorRole: myRole.slice(0, 80),
        authorLocation: (userLocation || '').slice(0, 120),
        content: draft.slice(0, 3000),
        isExpertResponse: specialistRoles.includes(myRole),
        upvotes: [],
        createdAt: new Date().toISOString()
      };

      if (auth.currentUser && targetPost && !postId.startsWith('seed-')) {
        const updatedReplies = [...targetPost.replies, newReply].slice(-100);
        try {
          await updateDoc(doc(db, 'community_posts', postId), {
            replies: updatedReplies,
            updatedAt: newReply.createdAt
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `community_posts/${postId}`);
        }
        setPosts(prev => prev.map(p => (p.id === postId ? { ...p, replies: updatedReplies, updatedAt: newReply.createdAt } : p)));
        setReplyDrafts(prev => ({ ...prev, [postId]: '' }));
      } else {
        const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorId: uid,
            authorName: newReply.authorName,
            authorRole: newReply.authorRole,
            authorLocation: newReply.authorLocation,
            content: draft
          })
        });
        const data = await res.json();
        if (res.ok && data.post) {
          setPosts(prev => prev.map(p => (p.id === postId ? data.post : p)));
          setReplyDrafts(prev => ({ ...prev, [postId]: '' }));
        } else if (data.error) {
          setPostError(data.error);
        }
      }
    } catch (err) {
      console.warn('Failed to post reply:', err);
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleToggleUpvote = async (postId: string, replyId?: string) => {
    const uid = auth.currentUser?.uid || effectiveUserId;
    const targetPost = posts.find(p => p.id === postId);
    try {
      if (auth.currentUser && targetPost && !postId.startsWith('seed-')) {
        let updatedUpvotes = targetPost.upvotes;
        let updatedReplies = targetPost.replies;
        if (replyId) {
          updatedReplies = targetPost.replies.map(r => {
            if (r.id !== replyId) return r;
            const has = r.upvotes.includes(uid);
            return { ...r, upvotes: has ? r.upvotes.filter(id => id !== uid) : [...r.upvotes, uid] };
          });
        } else {
          const has = targetPost.upvotes.includes(uid);
          updatedUpvotes = has ? targetPost.upvotes.filter(id => id !== uid) : [...targetPost.upvotes, uid].slice(0, 500);
        }
        const now = new Date().toISOString();
        try {
          await updateDoc(doc(db, 'community_posts', postId), {
            upvotes: updatedUpvotes,
            replies: updatedReplies,
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `community_posts/${postId}`);
        }
        setPosts(prev => prev.map(p => (p.id === postId ? { ...p, upvotes: updatedUpvotes, replies: updatedReplies, updatedAt: now } : p)));
      } else {
        const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/upvote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid, replyId })
        });
        const data = await res.json();
        if (res.ok && data.post) {
          setPosts(prev => prev.map(p => (p.id === postId ? data.post : p)));
        }
      }
    } catch {}
  };

  const handleDeletePost = async (postId: string) => {
    try {
      if (auth.currentUser && !postId.startsWith('seed-')) {
        try {
          await deleteDoc(doc(db, 'community_posts', postId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `community_posts/${postId}`);
        }
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setPosts(prev => prev.filter(p => p.id !== postId));
        }
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
    localStorage.setItem('ama_comm_phone', myPhoneNumber.trim());
    localStorage.setItem('ama_comm_profile_created', 'true');
    setHasCompletedProfile(true);

    try {
      const uid = auth.currentUser?.uid || effectiveUserId;
      const userEmail = auth.currentUser?.email || localStorage.getItem('ama_comm_email') || '';
      const now = new Date().toISOString();
      const existingMember = members.find(m => m.id === uid);
      const memberRecord: CommunityMemberItem & { isPublic: boolean } = {
        id: uid.slice(0, 128),
        name: myDisplayName.trim().slice(0, 80),
        role: myRole.slice(0, 80),
        specialty: (mySpecialty.trim() || (myRole === 'Parent' ? `Parent of ${babyName} (${babyAge})` : myRole)).slice(0, 120),
        location: (userLocation || '').slice(0, 120),
        bio: (myBio.trim() || `Active ${myRole} in ${userLocation}.`).slice(0, 600),
        topics: [selectedField !== 'All Fields' ? selectedField : 'Feeding & Weaning'],
        phoneNumber: myPhoneNumber.trim().slice(0, 30),
        email: userEmail.slice(0, 100),
        deviceId: deviceId.slice(0, 128),
        clientIp: clientIp.slice(0, 64),
        isKycVerified: isMyKycVerified,
        kycData: existingMember?.kycData,
        sellerPaymentMethods: myPaymentMethods,
        isPublic: true,
        joinedAt: existingMember?.joinedAt || now,
        lastActiveAt: now
      };

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'community_members', uid), memberRecord);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `community_members/${uid}`);
        }
        setMembers(prev => [memberRecord, ...prev.filter(m => m.id !== uid)]);
        setProfileSavedNotice('Your Peer Network Profile is synced to Firestore!');
        setTimeout(() => {
          setIsProfileModalOpen(false);
          setProfileSavedNotice('');
        }, 800);
      } else {
        const res = await fetch('/api/community/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberRecord)
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

  const handleJoinRoom = async (room: CommunityRoomItem) => {
    setRoomActionError('');
    const uid = auth.currentUser?.uid || effectiveUserId;
    setActiveRoomId(room.id);

    if (room.memberIds.includes(uid)) {
      return;
    }
    if (room.memberIds.length >= 200) {
      setRoomActionError('This room has reached the maximum capacity of 200 members.');
      return;
    }

    setJoiningRoomId(room.id);
    try {
      const updatedMembers = [...room.memberIds, uid];
      const now = new Date().toISOString();
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'community_rooms', room.id), {
            memberIds: updatedMembers,
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `community_rooms/${room.id}`);
        }
        setCommunityRooms(prev =>
          prev.map(r => (r.id === room.id ? { ...r, memberIds: updatedMembers, updatedAt: now } : r))
        );
      } else {
        const res = await fetch(`/api/community/rooms/${encodeURIComponent(room.id)}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid })
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.rooms)) {
          setCommunityRooms(data.rooms);
        }
      }
      setRoomActionNotice(`Joined "${room.name}"!`);
      setTimeout(() => setRoomActionNotice(''), 3000);
    } catch {
      setRoomActionError('Could not join room right now. Please sign in or check your connection.');
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleLeaveRoom = async (room: CommunityRoomItem) => {
    const uid = auth.currentUser?.uid || effectiveUserId;
    if (room.creatorId === uid) {
      setRoomActionError('As the creator, you can delete this room instead of leaving.');
      return;
    }
    setRoomActionError('');
    setJoiningRoomId(room.id);
    try {
      const updatedMembers = room.memberIds.filter(id => id !== uid);
      const now = new Date().toISOString();
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'community_rooms', room.id), {
            memberIds: updatedMembers,
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `community_rooms/${room.id}`);
        }
        setCommunityRooms(prev =>
          prev.map(r => (r.id === room.id ? { ...r, memberIds: updatedMembers, updatedAt: now } : r))
        );
      } else {
        const res = await fetch(`/api/community/rooms/${encodeURIComponent(room.id)}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid })
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.rooms)) {
          setCommunityRooms(data.rooms);
        }
      }
      setRoomActionNotice(`Left "${room.name}".`);
      setTimeout(() => setRoomActionNotice(''), 2500);
    } catch {
      setRoomActionError('Could not leave room. Please try again.');
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomActionError('');
    const cleanName = newRoomName.trim();
    const cleanDesc = newRoomDescription.trim();
    if (cleanName.length < 2) {
      setRoomActionError('Please enter a room name (at least 2 characters).');
      return;
    }
    if (!cleanDesc) {
      setRoomActionError('Please enter a short description so others know what the room is about.');
      return;
    }

    setIsCreatingRoom(true);
    try {
      const mod = await runModerationCheck({
        type: 'chat',
        title: cleanName,
        text: cleanDesc
      });
      if (!mod.allowed) {
        setRoomActionError(mod.error || 'Room details were blocked by community safety moderation.');
        return;
      }

      const uid = (auth.currentUser?.uid || effectiveUserId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
      const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();
      const newRoom: CommunityRoomItem = {
        id: roomId,
        name: cleanName.slice(0, 80),
        topic: (newRoomTopic || 'General Parenting').slice(0, 60),
        description: cleanDesc.slice(0, 300),
        creatorId: uid,
        creatorName: (myDisplayName.trim() || parentName || 'Parent').slice(0, 80),
        creatorRole: (myRole || 'Parent').slice(0, 80),
        memberIds: [uid],
        isPublic: true,
        createdAt: now,
        updatedAt: now
      };

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'community_rooms', roomId), newRoom);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `community_rooms/${roomId}`);
        }
        setCommunityRooms(prev => [newRoom, ...prev.filter(r => r.id !== roomId)]);
      } else {
        const res = await fetch('/api/community/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRoom)
        });
        const data = await res.json();
        if (!res.ok) {
          setRoomActionError(data.error || 'Could not create room.');
          return;
        }
        if (Array.isArray(data.rooms)) {
          setCommunityRooms(data.rooms);
        } else if (data.room) {
          setCommunityRooms(prev => [data.room, ...prev]);
        }
      }

      setRoomDirectoryTab('member');
      setActiveRoomId(roomId);
      setNewRoomName('');
      setNewRoomTopic('General Parenting');
      setNewRoomDescription('');
      setIsCreateRoomModalOpen(false);
      setRoomActionNotice(`Room "${newRoom.name}" created and open for members!`);
      setTimeout(() => setRoomActionNotice(''), 5000);
    } catch {
      setRoomActionError('Could not create room. Please sign in or check your connection.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    const uid = auth.currentUser?.uid || effectiveUserId;
    setRoomActionError('');
    try {
      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'community_rooms', roomId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `community_rooms/${roomId}`);
        }
        setCommunityRooms(prev => prev.filter(r => r.id !== roomId));
      } else {
        const res = await fetch(`/api/community/rooms/${encodeURIComponent(roomId)}?userId=${encodeURIComponent(uid)}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.rooms)) {
          setCommunityRooms(data.rooms);
        } else {
          setCommunityRooms(prev => prev.filter(r => r.id !== roomId));
        }
      }
      if (activeRoomId === roomId) {
        setActiveRoomId('general-parenting');
      }
      setConfirmDeleteRoomId(null);
      setRoomActionNotice('Room deleted.');
      setTimeout(() => setRoomActionNotice(''), 2500);
    } catch {
      setRoomActionError('Could not delete room.');
    }
  };

  const handleCopyRoomInvite = (room: CommunityRoomItem) => {
    const shareUrl = `${window.location.origin}/?screen=community&room=${encodeURIComponent(room.id)}`;
    const shareText = `Join "${room.name}" on Ama Baby: ${shareUrl}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    setCopiedKey(`room-${room.id}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatError('');
    setIsSendingChat(true);
    try {
      const mod = await runModerationCheck({ type: 'chat', text: chatInput.trim() });
      if (!mod.allowed) {
        setChatError(mod.error || 'Message blocked by rate limit or community safety moderation.');
        return;
      }

      const uid = auth.currentUser?.uid || effectiveUserId;

      // Auto-join user if sending in a custom room they haven't joined yet
      const targetCustomRoom = communityRooms.find(r => r.id === activeRoomId);
      if (targetCustomRoom && !targetCustomRoom.memberIds.includes(uid) && targetCustomRoom.memberIds.length < 200) {
        const updatedMembers = [...targetCustomRoom.memberIds, uid];
        const nowTs = new Date().toISOString();
        if (auth.currentUser) {
          try {
            await updateDoc(doc(db, 'community_rooms', targetCustomRoom.id), {
              memberIds: updatedMembers,
              updatedAt: nowTs
            });
          } catch {}
        } else {
          fetch(`/api/community/rooms/${encodeURIComponent(targetCustomRoom.id)}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: uid })
          }).catch(() => {});
        }
        setCommunityRooms(prev =>
          prev.map(r => (r.id === targetCustomRoom.id ? { ...r, memberIds: updatedMembers, updatedAt: nowTs } : r))
        );
      }

      const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newMsg: CommunityChatMessageItem & { isPublic: boolean } = {
        id: msgId,
        roomId: activeRoomId.slice(0, 128),
        senderId: uid.slice(0, 128),
        senderName: (myDisplayName.trim() || parentName || 'Parent').slice(0, 80),
        senderRole: myRole.slice(0, 80),
        senderLocation: (userLocation || '').slice(0, 120),
        text: chatInput.trim().slice(0, 2000),
        isPublic: true,
        createdAt: new Date().toISOString()
      };

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'community_messages', msgId), newMsg);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `community_messages/${msgId}`);
        }
        setChatMessages(prev => (prev.some(m => m.id === msgId) ? prev : [...prev, newMsg]));
        setChatInput('');
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const res = await fetch('/api/community/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMsg)
        });
        const data = await res.json();
        if (!res.ok) {
          setChatError(data.error || 'Could not send message.');
        } else if (data.message) {
          setChatMessages(prev => [...prev, data.message]);
          setChatInput('');
          setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    } catch {
      setChatError('Could not send message. Please check your connection or sign in.');
    } finally {
      setIsSendingChat(false);
    }
  };

  // handleAskSpecialistDirect removed.

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

    const currentMember = members.find(m => m.id === effectiveUserId);
    if (currentMember?.isAccountFrozen) {
      setSpecialistError('Your Provider account is currently frozen due to an unresolved non-delivery dispute. Please resolve pending disputes before creating new listings.');
      return;
    }

    setIsSubmittingProvider(true);
    setSpecialistError('');
    try {
      const mod = await runModerationCheck({
        type: 'marketplace',
        title: `${provName.trim()} - ${provTitle.trim()}`,
        text: provBio.trim() || provTitle.trim()
      });
      if (!mod.allowed) {
        setSpecialistError(mod.error || 'Marketplace listing blocked by safety moderation.');
        return;
      }

      const uid = auth.currentUser?.uid || effectiveUserId;
      const providerId = `provider-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const computedRate =
        provOfferMode === 'gift'
          ? 'Free Gift (No Cost)'
          : (provRateInfo.trim() || 'Negotiate directly in chat').slice(0, 100);

      const newProvider: MarketplaceProvider & { ownerId: string; isPublic: boolean } = {
        id: providerId,
        ownerId: uid.slice(0, 128),
        name: provName.trim().slice(0, 80),
        title: provTitle.trim().slice(0, 120),
        category: provCategory.slice(0, 100),
        listingKind: provListingKind,
        offerMode: provOfferMode,
        ...(provListingKind === 'goods' ? { condition: provCondition.slice(0, 40) } : {}),
        ...(provOfferMode === 'gift' ? { itemStatus: 'Available' as const } : {}),
        experienceYears: provListingKind === 'goods' ? 0 : Math.min(80, Math.max(0, Number(provExpYears) || 1)),
        rateInfo: computedRate,
        location: (provLocation.trim() || '').slice(0, 120),
        bio: (provBio.trim() || '').slice(0, 800),
        availability: (provAvailability.trim() || (provListingKind === 'goods' ? 'Ready for Pickup / Delivery' : 'Flexible')).slice(0, 100),
        services: [],
        isPublic: true,
        registeredAt: new Date().toISOString()
      };

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'marketplace_providers', providerId), newProvider);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `marketplace_providers/${providerId}`);
        }
        setMarketplaceProviders(prev => [newProvider, ...prev.filter(p => p.id !== providerId)]);
        setIsProviderRegisterModalOpen(false);
        setProvName('');
        setProvTitle('');
        setProvBio('');
        setMarketplaceNotice(
          provOfferMode === 'gift'
            ? 'Free Gift listing published! Community members can now claim it or chat with you.'
            : `${provListingKind === 'goods' ? 'Goods' : 'Service'} listing published to the Marketplace!`
        );
      } else {
        const res = await fetch('/api/community/marketplace/providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProvider)
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.providers)) {
          setMarketplaceProviders(data.providers);
          setIsProviderRegisterModalOpen(false);
          setProvName('');
          setProvTitle('');
          setProvBio('');
        }
      }
    } catch (err) {
      console.warn('Provider/listing registration failed:', err);
    } finally {
      setIsSubmittingProvider(false);
    }
  };

  const handlePostCareRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqDescription.trim()) return;
    setIsSubmittingRequest(true);
    setSpecialistError('');
    try {
      const mod = await runModerationCheck({
        type: 'marketplace',
        title: reqTitle.trim(),
        text: reqDescription.trim()
      });
      if (!mod.allowed) {
        setSpecialistError(mod.error || 'Need listing blocked by safety moderation.');
        return;
      }

      const uid = auth.currentUser?.uid || effectiveUserId;
      const reqId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newRequest: FamilyCareRequest & { ownerId: string; isPublic: boolean } = {
        id: reqId,
        ownerId: uid.slice(0, 128),
        familyName: (reqFamilyName.trim() || myDisplayName || 'Family').slice(0, 80),
        category: reqCategory.slice(0, 100),
        needKind: reqNeedKind,
        acceptsGift: reqAcceptsGift,
        fulfillmentStatus: 'Open',
        title: reqTitle.trim().slice(0, 150),
        description: reqDescription.trim().slice(0, 1000),
        schedule: (reqSchedule.trim() || 'Flexible').slice(0, 100),
        location: (reqLocation.trim() || '').slice(0, 120),
        budget: (reqBudget.trim() || (reqAcceptsGift ? 'Negotiable or Open to Free Gift' : 'Negotiable')).slice(0, 100),
        isPublic: true,
        createdAt: new Date().toISOString()
      };

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'marketplace_requests', reqId), newRequest);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `marketplace_requests/${reqId}`);
        }
        setMarketplaceRequests(prev => [newRequest, ...prev.filter(r => r.id !== reqId)]);
        setIsCareRequestModalOpen(false);
        setReqTitle('');
        setReqDescription('');
        setMarketplaceNotice('Your need has been posted! Users can negotiate in chat or offer a Free Gift.');
      } else {
        const res = await fetch('/api/community/marketplace/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRequest)
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.requests)) {
          setMarketplaceRequests(data.requests);
          setIsCareRequestModalOpen(false);
          setReqTitle('');
          setReqDescription('');
        }
      }
    } catch (err) {
      console.warn('Care/goods need submission failed:', err);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleOpenGiftModal = (
    mode: 'give_to_need' | 'receive_provision',
    target: { need?: FamilyCareRequest; provision?: MarketplaceProvider }
  ) => {
    setGiftError('');
    setGiftActorName(myDisplayName.trim() || parentName || 'Community Member');
    setGiftNoteInput(
      mode === 'give_to_need'
        ? 'I would love to gift this to your family for free! Let us arrange pickup or schedule in chat.'
        : 'Thank you so much! I would gratefully love to receive this free gift for my family.'
    );
    setGiftModalContext({
      mode,
      targetNeed: target.need,
      targetProvision: target.provision
    });
  };

  const handleSubmitGiftAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftModalContext) return;
    const actorName = giftActorName.trim() || myDisplayName.trim() || parentName || 'Community Member';
    const note = giftNoteInput.trim();
    if (!note) {
      setGiftError('Please enter a brief note about your free gift offer or pickup.');
      return;
    }

    setGiftError('');
    setIsSubmittingGift(true);
    try {
      const mod = await runModerationCheck({
        type: 'marketplace',
        title: giftModalContext.targetNeed?.title || giftModalContext.targetProvision?.title || 'Community Free Gift',
        text: note
      });
      if (!mod.allowed) {
        setGiftError(mod.error || 'Gift note blocked by safety moderation.');
        return;
      }

      const uid = auth.currentUser?.uid || effectiveUserId;
      const now = new Date().toISOString();
      const giftId = `gift-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      let giftRecord: MarketplaceGiftItem;

      if (giftModalContext.mode === 'give_to_need' && giftModalContext.targetNeed) {
        const req = giftModalContext.targetNeed;
        giftRecord = {
          id: giftId,
          giftSourceType: 'need_fulfillment',
          targetListingId: req.id.slice(0, 128),
          itemKind: req.needKind || (GOODS_CATEGORIES.includes(req.category) ? 'goods' : 'service'),
          category: req.category.slice(0, 100),
          title: `Free Gift for Need: ${req.title}`.slice(0, 150),
          description: note.slice(0, 600),
          giverId: uid.slice(0, 128),
          giverName: actorName.slice(0, 80),
          recipientId: (req.ownerId || req.id).slice(0, 128),
          recipientName: (req.familyName || 'Family').slice(0, 80),
          status: 'Offered',
          isPublic: true,
          createdAt: now
        };

        if (auth.currentUser) {
          try {
            await setDoc(doc(db, 'marketplace_gifts', giftId), giftRecord);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `marketplace_gifts/${giftId}`);
          }
          if (req.ownerId) {
            try {
              await updateDoc(doc(db, 'marketplace_requests', req.id), {
                fulfillmentStatus: 'Gifted',
                giftedById: uid.slice(0, 128),
                giftedByName: actorName.slice(0, 80),
                giftNote: note.slice(0, 500),
                giftedAt: now
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `marketplace_requests/${req.id}`);
            }
          }
        } else {
          await fetch('/api/community/marketplace/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(giftRecord)
          });
        }

        setMarketplaceGifts(prev => [giftRecord, ...prev.filter(g => g.id !== giftId)]);
        setMarketplaceRequests(prev =>
          prev.map(r =>
            r.id === req.id
              ? { ...r, fulfillmentStatus: 'Gifted', giftedById: uid, giftedByName: actorName, giftNote: note, giftedAt: now }
              : r
          )
        );
        setMarketplaceNotice(`Free Gift sent to ${req.familyName}! You can coordinate handoff in direct chat.`);
      } else if (giftModalContext.mode === 'receive_provision' && giftModalContext.targetProvision) {
        const prov = giftModalContext.targetProvision;
        giftRecord = {
          id: giftId,
          giftSourceType: 'gift_provision',
          targetListingId: prov.id.slice(0, 128),
          itemKind: prov.listingKind || (GOODS_CATEGORIES.includes(prov.category) ? 'goods' : 'service'),
          category: prov.category.slice(0, 100),
          title: `Claimed Free Gift: ${prov.title}`.slice(0, 150),
          description: note.slice(0, 600),
          giverId: (prov.ownerId || prov.id).slice(0, 128),
          giverName: (prov.name || 'Community Member').slice(0, 80),
          recipientId: uid.slice(0, 128),
          recipientName: actorName.slice(0, 80),
          status: 'Claimed',
          isPublic: true,
          createdAt: now
        };

        if (auth.currentUser) {
          try {
            await setDoc(doc(db, 'marketplace_gifts', giftId), giftRecord);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `marketplace_gifts/${giftId}`);
          }
          if (prov.ownerId) {
            try {
              await updateDoc(doc(db, 'marketplace_providers', prov.id), {
                itemStatus: 'Claimed',
                claimedById: uid.slice(0, 128),
                claimedByName: actorName.slice(0, 80),
                claimedAt: now
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `marketplace_providers/${prov.id}`);
            }
          }
        } else {
          await fetch('/api/community/marketplace/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(giftRecord)
          });
        }

        setMarketplaceGifts(prev => [giftRecord, ...prev.filter(g => g.id !== giftId)]);
        setMarketplaceProviders(prev =>
          prev.map(p =>
            p.id === prov.id
              ? { ...p, itemStatus: 'Claimed', claimedById: uid, claimedByName: actorName, claimedAt: now }
              : p
          )
        );
        setMarketplaceNotice(`Free Gift claimed from ${prov.name}! Chat directly to arrange collection or service time.`);
      }

      setGiftModalContext(null);
      setGiftNoteInput('');
    } catch (err) {
      console.warn('Free gift submission failed:', err);
      setGiftError('Could not complete free gift action. Please make sure you are signed in and try again.');
    } finally {
      setIsSubmittingGift(false);
    }
  };

  const handleDeleteProviderListing = async (providerId: string) => {
    try {
      if (auth.currentUser) {
        await deleteDoc(doc(db, 'marketplace_providers', providerId));
      }
      setMarketplaceProviders(prev => prev.filter(p => p.id !== providerId));
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `marketplace_providers/${providerId}`);
      } catch {}
    }
  };

  const handleDeleteRequestListing = async (requestId: string) => {
    try {
      if (auth.currentUser) {
        await deleteDoc(doc(db, 'marketplace_requests', requestId));
      }
      setMarketplaceRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `marketplace_requests/${requestId}`);
      } catch {}
    }
  };

  // Copy helper with feedback
  const handleCopyText = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  // Countdown timer calculator
  const getTimerRemaining = (
    deadlineStr?: string,
    customExpiredText = 'Window Expired (Action Pending)',
    suffix = 'left'
  ) => {
    if (!deadlineStr) return { text: 'Countdown pending', isExpired: false, hours: 0, minutes: 0 };
    const diffMs = new Date(deadlineStr).getTime() - Date.now();
    if (diffMs <= 0) {
      return { text: customExpiredText, isExpired: true, hours: 0, minutes: 0 };
    }
    const totalSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return {
      text: `${hours}h ${minutes}m ${seconds}s ${suffix}`,
      isExpired: false,
      hours,
      minutes
    };
  };

  // Seller External Payment Methods Handlers (Up to 5)
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setPmError('');

    if (myPaymentMethods.length >= 5) {
      setPmError('You can store up to 5 saved external payment methods.');
      return;
    }

    if (pmType === 'local_bank') {
      if (!pmBankName.trim() || !pmAccountNumber.trim() || !pmAccountName.trim()) {
        setPmError('Bank/App name, account number, and legal account name are required.');
        return;
      }
    } else {
      if (!pmAppName.trim() || (!pmHandle.trim() && !pmPayUrl.trim())) {
        setPmError('App name and your handle / pay link are required.');
        return;
      }
      if (pmAppName.toLowerCase().includes('payoneer') && (!pmLegalName.trim() || !pmCountry.trim())) {
        setPmError('Payoneer requires your full legal name and registered country.');
        return;
      }
    }

    const newPm: SellerPaymentMethod = {
      id: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: pmType,
      isVerified: true,
      bankName: pmType === 'local_bank' ? pmBankName.trim() : undefined,
      accountNumber: pmType === 'local_bank' ? pmAccountNumber.trim() : undefined,
      accountName: pmType === 'local_bank' ? pmAccountName.trim() : undefined,
      appName: pmType === 'global_app' ? pmAppName.trim() : undefined,
      handleOrEmail: pmType === 'global_app' ? pmHandle.trim() : undefined,
      payUrl: pmType === 'global_app' && pmPayUrl.trim() ? pmPayUrl.trim() : undefined,
      legalName: pmType === 'global_app' && pmLegalName.trim() ? pmLegalName.trim() : undefined,
      country: pmType === 'global_app' && pmCountry.trim() ? pmCountry.trim() : undefined,
      createdAt: new Date().toISOString()
    };

    const updated = [...myPaymentMethods, newPm].slice(0, 5);
    setMyPaymentMethods(updated);
    localStorage.setItem('ama_comm_payment_methods', JSON.stringify(updated));

    const uid = auth.currentUser?.uid || effectiveUserId;
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'community_members', uid), {
          sellerPaymentMethods: updated
        });
      } catch {}
    }
    fetch('/api/community/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: uid,
        name: myDisplayName,
        sellerPaymentMethods: updated
      })
    }).catch(() => {});

    setIsPaymentMethodModalOpen(false);
    setPmAccountNumber('');
    setPmHandle('');
    setPmPayUrl('');
    setMarketplaceNotice('External payment method saved to your profile!');
  };

  const handleDeletePaymentMethod = async (pmId: string) => {
    const updated = myPaymentMethods.filter(p => p.id !== pmId);
    setMyPaymentMethods(updated);
    localStorage.setItem('ama_comm_payment_methods', JSON.stringify(updated));

    const uid = auth.currentUser?.uid || effectiveUserId;
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'community_members', uid), {
          sellerPaymentMethods: updated
        });
      } catch {}
    }
    fetch('/api/community/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: uid,
        name: myDisplayName,
        sellerPaymentMethods: updated
      })
    }).catch(() => {});
  };

  // KYC Verification Handler
  const handleCompleteKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycLegalName.trim() || !kycLast4.trim()) return;
    setIsSubmittingKyc(true);
    setKycNotice('');

    try {
      const uid = auth.currentUser?.uid || effectiveUserId;
      const kycData = {
        idType: kycIdType,
        idNumberLast4: kycLast4.trim().slice(0, 8),
        legalName: kycLegalName.trim().slice(0, 80),
        verifiedAt: new Date().toISOString()
      };

      setIsMyKycVerified(true);
      localStorage.setItem('ama_comm_kyc_verified', 'true');

      if (auth.currentUser) {
        await updateDoc(doc(db, 'community_members', uid), {
          isKycVerified: true,
          kycData
        });
      }

      await fetch('/api/community/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uid,
          name: myDisplayName,
          phoneNumber: myPhoneNumber,
          deviceId,
          clientIp,
          isKycVerified: true,
          kycData
        })
      });

      setKycNotice('Profile confirmation saved! Confirmed Badge active and daily order limits updated.');
      setTimeout(() => {
        setIsKycModalOpen(false);
        setKycNotice('');
      }, 1200);
    } catch {
      setIsMyKycVerified(true);
      localStorage.setItem('ama_comm_kyc_verified', 'true');
      setIsKycModalOpen(false);
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  // Lock Order Terms
  const handleCreateLockedOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockOrderTarget) return;
    setLockOrderError('');
    setIsLockingOrder(true);

    try {
      if (isLocallyBanned || marketplaceBans.some(b => (deviceId && b.targetDeviceId === deviceId) || b.targetUserId === effectiveUserId)) {
        setLockOrderError('This browser session has been restricted from marketplace orders due to a policy violation.');
        return;
      }

      const userEmail = auth.currentUser?.email || localStorage.getItem('ama_comm_email') || '';
      if (!userEmail) {
        setLockOrderError('An email address is required to initiate marketplace orders. Please update your profile or sign in.');
        return;
      }

      const amountNum = parseFloat(lockOrderAmount) || 0;
      if (amountNum <= 0) {
        setLockOrderError('Please enter a valid agreed price.');
        return;
      }

      // Check standard tier limits (max 3/day and <= £50 / ~$65 / ~₦95,000 equivalent)
      if (!isMyKycVerified) {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const myTodayOrders = marketplaceOrders.filter(
          o => o.buyerId === effectiveUserId && new Date(o.createdAt).getTime() > oneDayAgo
        );
        if (myTodayOrders.length >= 3) {
          setLockOrderError('Standard Tier Limit: You may initiate up to 3 orders per day. Complete profile confirmation for higher limits.');
          return;
        }

        const isOverLimit =
          (lockOrderCurrency === 'GBP' && amountNum > 50) ||
          (lockOrderCurrency === 'USD' && amountNum > 65) ||
          (lockOrderCurrency === 'EUR' && amountNum > 60) ||
          (lockOrderCurrency === 'NGN' && amountNum > 95000);

        if (isOverLimit) {
          setLockOrderError(`Standard Tier Limit: Single order cannot exceed £50 equivalent (${lockOrderCurrency} ${amountNum}). Complete profile confirmation to proceed.`);
          return;
        }
      }

      const providerMember = members.find(m => m.id === lockOrderTarget.ownerId);
      const isProviderLevel2 = Boolean(
        providerMember?.isKycVerified &&
        ((providerMember?.completedInPersonDealsCount || 0) >= 5 || (providerMember?.providerLevel || 0) >= 2)
      );

      // Block remote shipping for Level 1 providers
      if (lockOrderHandoverType === 'shipping' && !isProviderLevel2) {
        setLockOrderError(
          'Remote Shipping Unavailable: This provider is Level 1 (Local Handover Only). Remote shipping requires profile confirmation and 5+ completed in-person handovers.'
        );
        return;
      }

      let chosenPm: SellerPaymentMethod | undefined = providerMember?.sellerPaymentMethods?.find(p => p.id === lockOrderSelectedPmId);

      if (!chosenPm && providerMember?.sellerPaymentMethods && providerMember.sellerPaymentMethods.length > 0) {
        chosenPm = providerMember.sellerPaymentMethods[0];
      }

      if (!chosenPm) {
        chosenPm = {
          id: `pm-default-${Date.now()}`,
          type: 'local_bank',
          bankName: 'Provider Bank / Fintech on file',
          accountName: lockOrderTarget.name,
          accountNumber: 'Settle via confirmed details in chat',
          createdAt: new Date().toISOString()
        };
      }

      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `ORD-${randomDigits}`;
      const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();

      const orderPayload: MarketplaceOrder = {
        id: orderId,
        orderCode,
        listingId: lockOrderTarget.id,
        itemTitle: lockOrderTarget.title,
        category: lockOrderTarget.category,
        itemKind: lockOrderTarget.listingKind || 'goods',
        handoverType: lockOrderHandoverType,
        sellerProviderLevel: isProviderLevel2 ? 2 : 1,
        agreedAmount: amountNum,
        currency: lockOrderCurrency,
        isInternational: lockOrderIsIntl,
        status: 'locked',

        sellerId: lockOrderTarget.ownerId || 'provider-owner',
        sellerName: lockOrderTarget.name,
        sellerPhone: providerMember?.phoneNumber || '',
        sellerEmail: providerMember?.email || '',
        sellerDeviceId: providerMember?.deviceId || '',
        sellerKycVerified: Boolean(providerMember?.isKycVerified),

        buyerId: effectiveUserId,
        buyerName: myDisplayName || parentName || 'Consumer',
        buyerPhone: myPhoneNumber,
        buyerEmail: userEmail,
        buyerDeviceId: deviceId,
        buyerKycVerified: isMyKycVerified,

        lockedPaymentMethod: chosenPm,
        createdAt: now,
        updatedAt: now
      };

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'marketplace_orders', orderId), orderPayload);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `marketplace_orders/${orderId}`);
        }
      }

      const res = await fetch('/api/community/marketplace/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setMarketplaceOrders(prev => [data.order, ...prev.filter(o => o.id !== data.order.id)]);
        setLockOrderTarget(null);
        setMarketplaceTypeFilter('orders');
        setMarketplaceNotice(`Terms locked! Reference Code: ${orderCode}. Pay provider externally using this reference code, then submit transfer proof.`);
      } else {
        setLockOrderError(data.error || 'Failed to lock order terms.');
      }
    } catch (err: any) {
      setLockOrderError(err.message || 'Error locking order.');
    } finally {
      setIsLockingOrder(false);
    }
  };

  // Submit Structured Payment Proof
  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForProof) return;
    if (!proofTransactionId.trim()) {
      setProofError('Official Transaction / Session ID is required to verify funds.');
      return;
    }

    setIsSubmittingProof(true);
    setProofError('');

    try {
      const now = new Date().toISOString();
      const windowHours = selectedOrderForProof.isInternational ? 48 : 24;
      const reviewDeadline = new Date(Date.now() + windowHours * 60 * 60 * 1000).toISOString();

      const proofData = {
        method: proofMethod,
        amountPaid: parseFloat(proofAmount) || selectedOrderForProof.agreedAmount,
        currency: selectedOrderForProof.currency,
        paidTimestamp: now,
        transactionId: proofTransactionId.trim(),
        receiptProofUrl: proofReceiptDoc.trim() || undefined,
        notes: proofNotes.trim() || undefined,
        submittedAt: now
      };

      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'marketplace_orders', selectedOrderForProof.id), {
            status: 'proof_submitted',
            paymentProof: proofData,
            reviewDeadline,
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `marketplace_orders/${selectedOrderForProof.id}`);
        }
      }

      const res = await fetch(`/api/community/marketplace/orders/${encodeURIComponent(selectedOrderForProof.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_proof',
          paymentProof: proofData
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setMarketplaceOrders(prev => prev.map(o => (o.id === selectedOrderForProof.id ? data.order : o)));
        setSelectedOrderForProof(null);
        setProofTransactionId('');
        setProofReceiptDoc('');
        setProofNotes('');
        setMarketplaceNotice(`Payment proof submitted! Provider has ${windowHours} hours to verify funds in their personal account.`);
      } else {
        setProofError(data.error || 'Failed to submit proof.');
      }
    } catch (err: any) {
      setProofError(err.message || 'Error submitting proof.');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // Provider Confirms Receipt
  const handleConfirmPaymentReceived = async (order: MarketplaceOrder) => {
    try {
      const now = new Date().toISOString();
      const isShipping = order.handoverType === 'shipping';
      const newStatus = isShipping ? 'awaiting_dispatch' : 'completed';
      const dispatchDeadline = isShipping ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() : undefined;

      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'marketplace_orders', order.id), {
            status: newStatus,
            confirmedAt: now,
            ...(dispatchDeadline ? { dispatchDeadline } : {}),
            ...(newStatus === 'completed' ? { completedAt: now } : {}),
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `marketplace_orders/${order.id}`);
        }
      }

      const res = await fetch(`/api/community/marketplace/orders/${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_receipt' })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setMarketplaceOrders(prev => prev.map(o => (o.id === order.id ? data.order : o)));
        if (isShipping) {
          setMarketplaceNotice(`Payment confirmed for ${order.orderCode}! Provider must upload courier waybill & packed item photo within 48 hours.`);
        } else {
          setMarketplaceNotice(`Payment confirmed received for ${order.orderCode}! In-person handover completed successfully.`);
        }
      }
    } catch (err: any) {
      setMarketplaceNotice(`Error confirming receipt: ${err.message || 'Action failed'}`);
    }
  };

  // Provider Uploads Courier Dispatch Proof (Mandatory sub-step for shipping deals)
  const handleUploadShippingProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForShipping) return;
    if (!shippingWaybillNumber.trim()) {
      setShippingError('Trackable courier waybill or tracking number is required.');
      return;
    }

    setIsSubmittingShipping(true);
    setShippingError('');

    try {
      const now = new Date().toISOString();
      const etaHoursNum = parseInt(shippingEtaHours, 10) || 72;
      const deliveryEta = new Date(Date.now() + etaHoursNum * 60 * 60 * 1000).toISOString();

      const proofObj = {
        courierName: shippingCourierName,
        waybillNumber: shippingWaybillNumber.trim(),
        receiptDocUrl: shippingReceiptDoc.trim() || undefined,
        packagePhotoUrl: shippingPackagePhoto.trim() || undefined,
        notes: shippingNotes.trim() || undefined,
        shippedAt: now
      };

      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'marketplace_orders', selectedOrderForShipping.id), {
            status: 'shipped',
            shippingProof: proofObj,
            shippedAt: now,
            deliveryEta,
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `marketplace_orders/${selectedOrderForShipping.id}`);
        }
      }

      const res = await fetch(`/api/community/marketplace/orders/${encodeURIComponent(selectedOrderForShipping.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_shipping_proof',
          shippingProof: proofObj,
          deliveryEta
        })
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setMarketplaceOrders(prev => prev.map(o => (o.id === selectedOrderForShipping.id ? data.order : o)));
        setSelectedOrderForShipping(null);
        setShippingWaybillNumber('');
        setShippingReceiptDoc('');
        setShippingPackagePhoto('');
        setShippingNotes('');
        setMarketplaceNotice(`Courier dispatch proof uploaded! Package in transit with ${shippingCourierName} (Waybill: ${shippingWaybillNumber.trim()}).`);
      } else {
        setShippingError(data.error || 'Failed to upload shipping proof.');
      }
    } catch (err: any) {
      setShippingError(err.message || 'Error uploading shipping proof.');
    } finally {
      setIsSubmittingShipping(false);
    }
  };

  // Consumer Reports Non-Delivery (Mandatory evidence required)
  const handleReportNonDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForNonDelivery) return;
    if (!nonDeliveryReason.trim()) {
      setNonDeliveryError('Please describe the non-delivery reason.');
      return;
    }
    if (!nonDeliveryEvidenceDoc.trim()) {
      setNonDeliveryError('Mandatory Proof Required: Please attach an evidence link (courier tracking screenshot, cancellation slip, or unanswered chat screenshot).');
      return;
    }

    setIsSubmittingNonDelivery(true);
    setNonDeliveryError('');

    try {
      const now = new Date().toISOString();
      const providerGraceDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const disputeEvidence = {
        reason: nonDeliveryReason.trim(),
        evidenceUrl: nonDeliveryEvidenceDoc.trim(),
        notes: nonDeliveryNotes.trim() || undefined,
        filedAt: now
      };

      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'marketplace_orders', selectedOrderForNonDelivery.id), {
            status: 'delivery_disputed',
            deliveryDisputedAt: now,
            deliveryDisputeEvidence: disputeEvidence,
            providerGraceDeadline,
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `marketplace_orders/${selectedOrderForNonDelivery.id}`);
        }
      }

      const res = await fetch(`/api/community/marketplace/orders/${encodeURIComponent(selectedOrderForNonDelivery.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report_non_delivery',
          deliveryDisputeEvidence: disputeEvidence
        })
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setMarketplaceOrders(prev => prev.map(o => (o.id === selectedOrderForNonDelivery.id ? data.order : o)));
        setSelectedOrderForNonDelivery(null);
        setNonDeliveryEvidenceDoc('');
        setNonDeliveryNotes('');
        setMarketplaceNotice('Non-delivery reported with evidence. Provider has 24 hours to upload courier delivery proof before storefront freeze.');
      } else {
        setNonDeliveryError(data.error || 'Failed to submit non-delivery report.');
      }
    } catch (err: any) {
      setNonDeliveryError(err.message || 'Error reporting non-delivery.');
    } finally {
      setIsSubmittingNonDelivery(false);
    }
  };

  // Provider 24-Hour Grace Window Response
  const handleProviderGraceResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForGraceResponse) return;
    if (!graceProofDoc.trim()) {
      setGraceError('Official courier delivery proof / tracking slip document URL is required.');
      return;
    }

    setIsSubmittingGraceResponse(true);
    setGraceError('');

    try {
      const now = new Date().toISOString();
      const autoCompleteDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      const responsePayload = {
        responseType: graceResponseType,
        proofUrl: graceProofDoc.trim(),
        notes: graceNotes.trim() || undefined,
        respondedAt: now
      };

      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'marketplace_orders', selectedOrderForGraceResponse.id), {
            status: 'courier_delivered_pending_consumer_review',
            courierDeliveredAt: now,
            providerDeliveryResponse: responsePayload,
            autoCompleteDeadline,
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `marketplace_orders/${selectedOrderForGraceResponse.id}`);
        }
      }

      const res = await fetch(`/api/community/marketplace/orders/${encodeURIComponent(selectedOrderForGraceResponse.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provider_grace_response',
          providerDeliveryResponse: responsePayload
        })
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setMarketplaceOrders(prev => prev.map(o => (o.id === selectedOrderForGraceResponse.id ? data.order : o)));
        setSelectedOrderForGraceResponse(null);
        setGraceProofDoc('');
        setGraceNotes('');
        setMarketplaceNotice('Delivery proof submitted! Consumer has 48 hours to confirm receipt or raise condition dispute before auto-completion.');
      } else {
        setGraceError(data.error || 'Failed to submit grace response.');
      }
    } catch (err: any) {
      setGraceError(err.message || 'Error submitting grace response.');
    } finally {
      setIsSubmittingGraceResponse(false);
    }
  };

  // Consumer Confirms Delivery Received
  const handleConfirmDeliveryReceived = async (order: MarketplaceOrder) => {
    try {
      const now = new Date().toISOString();
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'marketplace_orders', order.id), {
            status: 'completed',
            completedAt: now,
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `marketplace_orders/${order.id}`);
        }
      }

      const res = await fetch(`/api/community/marketplace/orders/${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_delivery_received' })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setMarketplaceOrders(prev => prev.map(o => (o.id === order.id ? data.order : o)));
        setMarketplaceNotice(`Delivery confirmed received! Order ${order.orderCode} completed successfully.`);
      }
    } catch (err: any) {
      setMarketplaceNotice(`Action failed: ${err.message || 'Could not confirm delivery'}`);
    }
  };

  // Auto-Complete Delivery (48h Expired Override)
  const handleAutoCompleteDelivery = async (order: MarketplaceOrder) => {
    try {
      const now = new Date().toISOString();
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'marketplace_orders', order.id), {
            status: 'completed',
            completedAt: now,
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `marketplace_orders/${order.id}`);
        }
      }

      const res = await fetch(`/api/community/marketplace/orders/${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_complete_delivery' })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setMarketplaceOrders(prev => prev.map(o => (o.id === order.id ? data.order : o)));
        setMarketplaceNotice(`Order ${order.orderCode} auto-completed in Provider's favor after the 48-hour review window expired.`);
      }
    } catch (err: any) {
      setMarketplaceNotice(`Action failed: ${err.message || 'Could not auto-complete'}`);
    }
  };

  // Dispute Arbitration: Consumer Abuse Strikes vs Provider Default Freeze
  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForResolution) return;

    setIsSubmittingResolution(true);
    setResolutionError('');

    try {
      const now = new Date().toISOString();
      const res = await fetch(`/api/community/marketplace/orders/${encodeURIComponent(selectedOrderForResolution.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve_dispute',
          resolution: resolutionType,
          disputeNotes: resolutionNotes.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setMarketplaceOrders(prev => prev.map(o => (o.id === selectedOrderForResolution.id ? data.order : o)));

        // Sync local member states
        if (resolutionType === 'consumer_false_claim') {
          setMembers(prev =>
            prev.map(m => {
              if (m.id === selectedOrderForResolution.sellerId) {
                return {
                  ...m,
                  isAccountFrozen: false,
                  hasProviderProtectionBadge: true,
                  completedInPersonDealsCount: (m.completedInPersonDealsCount || 0) + 1
                };
              }
              if (m.id === selectedOrderForResolution.buyerId) {
                const updatedStrikes = (m.disputeStrikes || 0) + 1;
                return { ...m, disputeStrikes: updatedStrikes };
              }
              return m;
            })
          );
          setMarketplaceNotice(
            'Dispute resolved: Delivery record confirmed. Consumer issued a dispute note; Provider awarded Community Trust Badge.'
          );
        } else {
          setMembers(prev =>
            prev.map(m => {
              if (m.id === selectedOrderForResolution.sellerId) {
                return { ...m, isAccountFrozen: true };
              }
              return m;
            })
          );
          setMarketplaceNotice('Dispute resolved: Provider defaulted on delivery proof. Provider storefront paused and listings hidden.');
        }

        setSelectedOrderForResolution(null);
        setResolutionNotes('');
      } else {
        setResolutionError(data.error || 'Failed to resolve dispute.');
      }
    } catch (err: any) {
      setResolutionError(err.message || 'Error resolving dispute.');
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  // Provider Denies Receipt with Mandatory Single-Day Statement Document
  const handleDenyPaymentReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDenial) return;
    if (!denialStatementDoc.trim()) {
      setDenialError('Uploading an external single-day bank/app statement showing no incoming transfer is required.');
      return;
    }

    setIsSubmittingDenial(true);
    setDenialError('');

    try {
      const now = new Date().toISOString();
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'marketplace_orders', selectedOrderForDenial.id), {
            status: 'denied',
            deniedAt: now,
            denialReason: denialReasonText.trim(),
            denialStatementUrl: denialStatementDoc.trim(),
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `marketplace_orders/${selectedOrderForDenial.id}`);
        }
      }

      const res = await fetch(`/api/community/marketplace/orders/${encodeURIComponent(selectedOrderForDenial.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deny_receipt',
          denialReason: denialReasonText.trim(),
          denialStatementUrl: denialStatementDoc.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setMarketplaceOrders(prev => prev.map(o => (o.id === selectedOrderForDenial.id ? data.order : o)));
        setSelectedOrderForDenial(null);
        setDenialStatementDoc('');
        setMarketplaceNotice('Receipt denial recorded with statement link. Either party can download the Dispute Summary Pack.');
      } else {
        setDenialError(data.error || 'Failed to record denial.');
      }
    } catch (err: any) {
      setDenialError(err.message || 'Error recording denial.');
    } finally {
      setIsSubmittingDenial(false);
    }
  };

  // Marketplace Policy Restriction Action (Opens in-app confirmation modal)
  const handleBanFraudster = (targetUserId: string, targetDeviceId: string, reason: string, orderId?: string) => {
    setPendingRestrictionTarget({ targetUserId, targetDeviceId, reason, orderId });
  };

  const confirmMarketplaceRestriction = async () => {
    if (!pendingRestrictionTarget) return;
    const { targetUserId, targetDeviceId, reason, orderId } = pendingRestrictionTarget;
    setIsApplyingRestriction(true);

    try {
      const banRecord: MarketplaceBanRecord = {
        id: `ban-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        targetUserId,
        targetDeviceId,
        reason,
        evidenceOrderId: orderId,
        bannedAt: new Date().toISOString(),
        bannedBy: effectiveUserId
      };

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'marketplace_bans', banRecord.id), banRecord);
        } catch {}
      }

      await fetch('/api/community/marketplace/bans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banRecord)
      });

      setMarketplaceBans(prev => [banRecord, ...prev]);

      if (targetDeviceId === deviceId || targetUserId === effectiveUserId) {
        markDeviceAsBanned(reason);
        setIsLocallyBanned(true);
      }

      setMarketplaceNotice(`Policy restriction applied: Account and session ${targetDeviceId.slice(0, 16)}... have been restricted from marketplace orders.`);
      setPendingRestrictionTarget(null);
    } catch (err: any) {
      setMarketplaceNotice(`Restriction error: ${err.message || 'Failed to record restriction.'}`);
    } finally {
      setIsApplyingRestriction(false);
    }
  };

  // Download PDF Dispute Evidence Pack
  const handleDownloadDisputePack = (order: MarketplaceOrder) => {
    const providerMember = members.find(m => m.id === order.sellerId);
    const consumerMember = members.find(m => m.id === order.buyerId);

    const relevantTranscript = chatMessages
      .filter(m => m.senderId === order.buyerId || m.senderId === order.sellerId)
      .map(m => ({
        senderName: m.senderName,
        senderRole: m.senderRole,
        text: m.text,
        timestamp: m.createdAt
      }));

    const pdfData: DisputePdfData = {
      orderCode: order.orderCode,
      orderId: order.id,
      itemTitle: order.itemTitle,
      category: order.category,
      itemKind: order.itemKind,
      handoverType: order.handoverType,
      agreedAmount: order.agreedAmount,
      currency: order.currency,
      isInternational: order.isInternational,
      orderCreatedAt: order.createdAt,
      status: order.status,

      sellerName: order.sellerName,
      sellerPhone: order.sellerPhone || providerMember?.phoneNumber || 'Not Provided',
      sellerEmail: order.sellerEmail || providerMember?.email || 'Not Provided',
      sellerDeviceId: order.sellerDeviceId || providerMember?.deviceId || 'Unknown',
      sellerKycVerified: order.sellerKycVerified,
      sellerProviderLevel: order.sellerProviderLevel || providerMember?.providerLevel || 1,

      buyerName: order.buyerName,
      buyerPhone: order.buyerPhone || consumerMember?.phoneNumber || 'Not Provided',
      buyerEmail: order.buyerEmail || consumerMember?.email || 'Not Provided',
      buyerDeviceId: order.buyerDeviceId || consumerMember?.deviceId || 'Unknown',
      buyerKycVerified: order.buyerKycVerified,

      lockedPaymentMethod: order.lockedPaymentMethod,
      paymentProof: order.paymentProof,
      reviewDeadline: order.reviewDeadline,
      confirmedAt: order.confirmedAt,
      deniedAt: order.deniedAt,
      denialReason: order.denialReason,
      denialStatementUrl: order.denialStatementUrl,

      shippingProof: order.shippingProof,
      dispatchDeadline: order.dispatchDeadline,
      shippedAt: order.shippedAt,
      deliveryEta: order.deliveryEta,

      deliveryDisputedAt: order.deliveryDisputedAt,
      deliveryDisputeEvidence: order.deliveryDisputeEvidence,
      providerGraceDeadline: order.providerGraceDeadline,
      providerDeliveryResponse: order.providerDeliveryResponse,
      courierDeliveredAt: order.courierDeliveredAt,
      autoCompleteDeadline: order.autoCompleteDeadline,
      completedAt: order.completedAt,
      isProviderFrozen: order.isProviderFrozen || providerMember?.isAccountFrozen,
      isConsumerStrikeApplied: order.isConsumerStrikeApplied,
      providerProtectionAwarded: order.providerProtectionAwarded || providerMember?.hasProviderProtectionBadge,

      chatTranscript: relevantTranscript
    };

    generateDisputeEvidencePdf(pdfData);
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
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-black text-gray-900 uppercase tracking-wider text-[11px]">
            Community Platform Policy & Independence Notice
          </p>
          <p className="text-gray-700 leading-relaxed">
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
              { id: 'omugwo', label: 'Care Marketplace', count: null, icon: HeartHandshake }
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
                          className="p-1.5 rounded-xl text-gray-400 hover:text-sky-600 hover:bg-sky-50 border-none cursor-pointer"
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
          <div className="lg:col-span-4 bg-white rounded-[32px] p-4 border border-gray-100 shadow-xs space-y-4 h-fit">
            {/* Create Room CTA */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Community Live Rooms
                </p>
                <p className="text-xs font-bold text-gray-700">
                  Join a village channel or start your own
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRoomActionError('');
                  setIsCreateRoomModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-none cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Room</span>
              </button>
            </div>

            {roomActionNotice && (
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-2">
                <span>✓ {roomActionNotice}</span>
                <button
                  type="button"
                  onClick={() => setRoomActionNotice('')}
                  className="text-emerald-600 bg-transparent border-none cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {roomActionError && (
              <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between gap-2">
                <span>{roomActionError}</span>
                <button
                  type="button"
                  onClick={() => setRoomActionError('')}
                  className="text-red-500 bg-transparent border-none cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Dedicated Room Type Switcher: Official Topic Channels vs Member-Created Rooms */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/70">
              <button
                type="button"
                onClick={() => setRoomDirectoryTab('official')}
                className={`py-2 px-2.5 rounded-xl text-[11px] font-black transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                  roomDirectoryTab === 'official'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'bg-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>Official Channels</span>
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-black text-gray-600">
                  {CHAT_ROOMS.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRoomDirectoryTab('member')}
                className={`py-2 px-2.5 rounded-xl text-[11px] font-black transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                  roomDirectoryTab === 'member'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>Member Rooms</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                  roomDirectoryTab === 'member' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {communityRooms.length}
                </span>
              </button>
            </div>

            {roomDirectoryTab === 'official' ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Official Topic Channels
                  </p>
                  <span className="text-[9px] font-bold text-slate-400">Open to all</span>
                </div>
                <div className="space-y-2">
                  {CHAT_ROOMS.map(room => (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        activeRoomId === room.id
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-slate-50/70 hover:bg-slate-100 text-gray-800 border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black">{room.name}</p>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          activeRoomId === room.id ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-200'
                        }`}>
                          Official
                        </span>
                      </div>
                      <p className={`text-[10px] mt-1 ${activeRoomId === room.id ? 'text-white/85' : 'text-gray-500'}`}>
                        {room.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    Member-Created Rooms ({communityRooms.length})
                  </p>
                  <span className="text-[9px] font-bold text-emerald-600">Tap to join</span>
                </div>

                {communityRooms.length > 3 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={roomSearchQuery}
                      onChange={e => setRoomSearchQuery(e.target.value)}
                      placeholder="Search member rooms or topics..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 outline-none focus:border-primary"
                    />
                  </div>
                )}

                {filteredCommunityRooms.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-dashed border-emerald-200 text-center space-y-2">
                    <p className="text-xs font-bold text-emerald-950">
                      {roomSearchQuery ? 'No member rooms match your search' : 'No member-created rooms yet'}
                    </p>
                    <p className="text-[11px] text-emerald-800/80">
                      Start a room for local playdates, sleep support, or twin parents — anyone can join with one tap.
                    </p>
                    {!roomSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setRoomActionError('');
                          setIsCreateRoomModalOpen(true);
                        }}
                        className="mt-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider border-none cursor-pointer"
                      >
                        + Start a Member Room
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
                    {filteredCommunityRooms.map(room => {
                      const isSelected = activeRoomId === room.id;
                      const isCreator = room.creatorId === (auth.currentUser?.uid || effectiveUserId);
                      const isMember = room.memberIds.includes(auth.currentUser?.uid || effectiveUserId);
                      return (
                        <div
                          key={room.id}
                          className={`p-3 rounded-2xl border transition-all ${
                            isSelected
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-emerald-50/40 hover:bg-emerald-50 text-gray-800 border-emerald-200/80'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveRoomId(room.id)}
                            className="w-full text-left bg-transparent border-none p-0 cursor-pointer text-inherit"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-black leading-snug"># {room.name}</p>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase shrink-0 ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {room.memberIds.length} joined
                              </span>
                            </div>
                            <p className={`text-[10px] mt-0.5 line-clamp-2 ${isSelected ? 'text-white/85' : 'text-gray-600'}`}>
                              {room.description}
                            </p>
                            <div className={`flex items-center justify-between gap-2 mt-1.5 text-[10px] font-semibold ${
                              isSelected ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              <span>{room.topic} • Hosted by {room.creatorName}</span>
                            </div>
                          </button>

                          <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-black/10">
                            {isMember ? (
                              <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                isSelected ? 'text-white' : 'text-emerald-700'
                              }`}>
                                <Check className="w-3 h-3" /> {isCreator ? 'Host' : 'Joined'}
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={joiningRoomId === room.id}
                                onClick={() => handleJoinRoom(room)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border-none cursor-pointer ${
                                  isSelected
                                    ? 'bg-white text-emerald-800'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                              >
                                {joiningRoomId === room.id ? 'Joining...' : '+ Join Room'}
                              </button>
                            )}

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleCopyRoomInvite(room)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border-none cursor-pointer ${
                                  isSelected
                                    ? 'bg-white/20 text-white hover:bg-white/30'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                                title="Copy direct room link"
                              >
                                {copiedKey === `room-${room.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedKey === `room-${room.id}` ? 'Copied' : 'Share'}</span>
                              </button>
                              {isCreator ? (
                                confirmDeleteRoomId === room.id ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRoom(room.id)}
                                    className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black border-none cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteRoomId(room.id)}
                                    className={`p-1 rounded-lg border-none cursor-pointer ${
                                      isSelected
                                        ? 'bg-white/20 text-white hover:bg-red-500'
                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                    }`}
                                    title="Delete room"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )
                              ) : isMember ? (
                                <button
                                  type="button"
                                  onClick={() => handleLeaveRoom(room)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border-none cursor-pointer ${
                                    isSelected
                                      ? 'bg-white/20 text-white hover:bg-white/30'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                  title="Leave room"
                                >
                                  Leave
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
          <div className="lg:col-span-8 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-[560px] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-card/40">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-serif font-black text-gray-900 truncate">
                    {customDmRoom && activeRoomId === customDmRoom.id
                      ? customDmRoom.name
                      : activeCustomRoom
                      ? `# ${activeCustomRoom.name}`
                      : CHAT_ROOMS.find(r => r.id === activeRoomId)?.name || '# Live Room'}
                  </h3>
                  {activeCustomRoom && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      {activeCustomRoom.topic}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">
                  {activeCustomRoom
                    ? `Member-Created Room • Hosted by ${activeCustomRoom.creatorName} • ${activeCustomRoom.memberIds.length} member${activeCustomRoom.memberIds.length === 1 ? '' : 's'}`
                    : `Official Topic Channel • Chatting as ${myDisplayName} (${myRole})`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeCustomRoom && (() => {
                  const uid = auth.currentUser?.uid || effectiveUserId;
                  const isCreator = activeCustomRoom.creatorId === uid;
                  const isMember = activeCustomRoom.memberIds.includes(uid);
                  return (
                    <>
                      {!isMember ? (
                        <button
                          type="button"
                          disabled={joiningRoomId === activeCustomRoom.id}
                          onClick={() => handleJoinRoom(activeCustomRoom)}
                          className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-none cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{joiningRoomId === activeCustomRoom.id ? 'Joining...' : 'Join Room'}</span>
                        </button>
                      ) : !isCreator ? (
                        <button
                          type="button"
                          onClick={() => handleLeaveRoom(activeCustomRoom)}
                          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 border-none cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Leave</span>
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleCopyRoomInvite(activeCustomRoom)}
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                      >
                        {copiedKey === `room-${activeCustomRoom.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === `room-${activeCustomRoom.id}` ? 'Link Copied' : 'Share Room'}</span>
                      </button>
                    </>
                  );
                })()}
                <button
                  onClick={fetchCommunityState}
                  className="p-2 rounded-xl bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 cursor-pointer"
                  title="Refresh messages"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
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

            {chatError && (
              <div className="px-4 py-2.5 bg-red-50 border-t border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between gap-2">
                <span>{chatError}</span>
                <button
                  type="button"
                  onClick={() => setChatError('')}
                  className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

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

      {/* TAB 4: CARE, GOODS & FREE GIFT MARKETPLACE */}
      {activeTab === 'omugwo' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-[32px] p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="max-w-3xl space-y-2.5 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-sky-400/20 text-sky-200 border border-sky-300/30">
                  Village Care &amp; Goods Ecosystem
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-sky-100 border border-white/10">
                  Locked Order Summaries &amp; Courier Tracking
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-sky-100">
                Care Services, Baby Goods &amp; Free Gifts Marketplace
              </h2>
              <p className="text-xs sm:text-sm text-sky-100/85 leading-relaxed font-normal">
                Discover local care providers, trade maternal &amp; baby goods, exchange free community gifts, and coordinate external settlements with locked reference codes and trackable courier shipping.
              </p>
            </div>
            <div className="absolute right-4 bottom-2 text-7xl opacity-10 select-none pointer-events-none">
              🤝
            </div>
          </div>

          {/* Interactive Trust & Guidance Toolbar */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Trust &amp; Safety:
              </span>
              {[
                { id: 'fraud', label: 'Order Safety & Payment Rules', icon: ShieldAlert },
                { id: 'gifts', label: 'Free Gift Village Guide', icon: Gift },
                { id: 'tiers', label: 'Provider Tiers (Level 1 vs Level 2 Courier)', icon: Truck }
              ].map(item => {
                const Icon = item.icon;
                const isOpen = marketplaceSafetyTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMarketplaceSafetyTab(isOpen ? 'none' : (item.id as any))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isOpen
                        ? 'bg-sky-900 text-white border-sky-900 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isOpen ? 'text-sky-300' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                    <span className="text-[10px] font-black ml-0.5">{isOpen ? '▲' : '▼'}</span>
                  </button>
                );
              })}
            </div>

            {/* Collapsible Guidance Drawer */}
            <AnimatePresence>
              {marketplaceSafetyTab !== 'none' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-800 shadow-2xs relative">
                    <button
                      type="button"
                      onClick={() => setMarketplaceSafetyTab('none')}
                      className="absolute right-4 top-4 w-7 h-7 rounded-full bg-white text-gray-500 hover:text-gray-800 flex items-center justify-center border border-gray-200 cursor-pointer"
                      title="Close guide"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {marketplaceSafetyTab === 'fraud' && (
                      <div className="space-y-2 pr-8">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          <h4 className="font-bold text-gray-900 text-sm">Order Safety &amp; Direct Settlement Guidelines</h4>
                        </div>
                        <p className="leading-relaxed text-gray-700">
                          Avoid sending funds to unfamiliar bank details shared in private chat or completing remote orders without locking terms first. Lock agreed pricing into an order summary (<strong className="text-gray-900 font-mono">ORD-XXXX</strong>) with captured provider receiving details. Standard-tier accounts are limited to 3 daily orders below £50 equivalent. Submitting false Transaction IDs or false delivery disputes may trigger marketplace access restrictions.
                        </p>
                      </div>
                    )}

                    {marketplaceSafetyTab === 'gifts' && (
                      <div className="space-y-2 pr-8">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-emerald-600" />
                          <h4 className="font-bold text-gray-900 text-sm">Community Gift Exchange Guide</h4>
                        </div>
                        <p className="leading-relaxed text-gray-700">
                          Community members can give or receive free baby gear, maternity supplies, and care support. Providers can mark listings as free gifts, and families can flag posted needs with &quot;Open to Free Gift&quot;. Claiming a gift enables direct chat to arrange local pickup or dispatch.
                        </p>
                      </div>
                    )}

                    {marketplaceSafetyTab === 'tiers' && (
                      <div className="space-y-2 pr-8">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-sky-700" />
                          <h4 className="font-bold text-gray-900 text-sm">Provider Trust Tiers &amp; Remote Shipping Access</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="p-3 rounded-2xl bg-white border border-slate-200">
                            <span className="font-black text-slate-900 text-xs block">Level 1 Provider (Local Handover Only)</span>
                            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                              New or unconfirmed providers are limited to in-person community handovers. Remote courier shipping unlocks after community history is built.
                            </p>
                          </div>
                          <div className="p-3 rounded-2xl bg-white border border-sky-200">
                            <span className="font-black text-sky-950 text-xs block">Level 2 Provider (Remote Shipping Enabled)</span>
                            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                              Unlocked after completing profile confirmation and 5+ completed in-person handovers. Enabled to ship via trackable couriers (DHL, GIG Logistics, Royal Mail, FedEx, etc.) with 48h waybill upload tracking.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Confirmation & Provider Receiving Accounts Strip */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {isMyKycVerified ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/90 text-emerald-900 font-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Profile Confirmed Badge • Higher Limits Active</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Standard Tier: Capped at 3 daily orders &lt; £50</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsKycModalOpen(true)}
                    className="px-3 py-1 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black uppercase text-[10px] tracking-wider border-none cursor-pointer"
                  >
                    Confirm Profile (Get Badge)
                  </button>
                </div>
              )}

              {/* Provider Level indicator */}
              {(() => {
                const myMemberRec = members.find(m => m.id === effectiveUserId);
                const isLevel2 = Boolean(
                  isMyKycVerified &&
                  ((myMemberRec?.completedInPersonDealsCount || 0) >= 5 || (myMemberRec?.providerLevel || 0) >= 2)
                );
                return (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border ${
                    isLevel2
                      ? 'bg-sky-50 text-sky-900 border-sky-300'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    <Truck className="w-3 h-3 text-sky-700" />
                    <span>{isLevel2 ? 'Level 2: Remote Shipping Enabled' : 'Level 1: Local Handover Only'}</span>
                  </span>
                );
              })()}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPaymentMethodModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5 border border-gray-200 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-gray-600" />
                <span>Provider Receiving Accounts ({myPaymentMethods.length}/5)</span>
              </button>
            </div>
          </div>

          {marketplaceNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2">
              <span>✓ {marketplaceNotice}</span>
              <button
                type="button"
                onClick={() => setMarketplaceNotice('')}
                className="text-emerald-700 bg-transparent border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Type Filter, Category Filter & Action Bar */}
          <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Listings' },
                  { id: 'services', label: 'Care Services' },
                  { id: 'goods', label: 'Goods for Sale' },
                  { id: 'needs', label: 'Posted Needs' },
                  { id: 'gifts', label: 'Free Gifts' },
                  {
                    id: 'orders',
                    label: `Locked Orders (${
                      marketplaceOrders.filter(o => o.buyerId === effectiveUserId || o.sellerId === effectiveUserId).length
                    })`
                  }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMarketplaceTypeFilter(t.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                      marketplaceTypeFilter === t.id
                        ? 'bg-sky-700 text-white border-sky-700 shadow-2xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setProvListingKind('service');
                    setProvOfferMode('paid');
                    setProvCategory('Caregivers & Sitters');
                    setProvRateInfo('$25/hr or Negotiable');
                    setIsProviderRegisterModalOpen(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Service / Goods</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReqNeedKind('goods');
                    setReqCategory('Baby Gear, Strollers & Nursery Goods');
                    setReqAcceptsGift(true);
                    setIsCareRequestModalOpen(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  <span>Post Need (Service / Goods)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-gray-100">
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider shrink-0 flex items-center gap-1 pr-1">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                Category:
              </span>
              {MARKETPLACE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMarketplaceCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 cursor-pointer border transition-all ${
                    marketplaceCategoryFilter === cat
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Active Posted Needs (Services & Goods Needed) */}
          {marketplaceTypeFilter !== 'services' && marketplaceTypeFilter !== 'goods' && marketplaceRequests.length > 0 && (
            <div className="bg-sky-50/70 border border-sky-200 rounded-[28px] p-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-700" />
                Posted Community Needs (Goods &amp; Services Needed)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {marketplaceRequests
                  .filter(req => marketplaceCategoryFilter === 'All Listings' || req.category === marketplaceCategoryFilter)
                  .filter(req => (marketplaceTypeFilter === 'gifts' ? req.acceptsGift !== false || req.fulfillmentStatus === 'Gifted' : true))
                  .map(req => {
                    const isGoodsNeed = req.needKind === 'goods' || GOODS_CATEGORIES.includes(req.category);
                    const isGifted = req.fulfillmentStatus === 'Gifted';
                    const isMyNeed = req.ownerId === effectiveUserId;

                    return (
                      <div key={req.id} className="bg-white rounded-2xl p-4 border border-sky-200 shadow-xs space-y-2.5 text-xs flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${isGoodsNeed ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'}`}>
                                  {isGoodsNeed ? 'Goods Needed' : 'Service Needed'}
                                </span>
                                {isGifted ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                                    ✓ Gifted by {req.giftedByName || 'Community Member'}
                                  </span>
                                ) : req.acceptsGift !== false && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    🎁 Open to Free Gift
                                  </span>
                                )}
                              </div>
                              <p className="font-black text-gray-900 leading-snug">{req.title}</p>
                            </div>

                            {isMyNeed && (
                              <button
                                type="button"
                                onClick={() => handleDeleteRequestListing(req.id)}
                                className="p-1 rounded-lg text-gray-400 hover:text-red-600 bg-transparent border-none cursor-pointer shrink-0"
                                title="Delete Need"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <p className="text-gray-700 leading-snug">{req.description}</p>
                          <div className="text-[10px] text-gray-500 font-bold space-y-0.5 pt-1 border-t border-gray-100">
                            <p>Posted by: {req.familyName} • {req.category}</p>
                            <p>Budget: {req.budget} • {req.schedule}{req.location ? ` • ${req.location}` : ''}</p>
                          </div>
                          {isGifted && req.giftNote && (
                            <p className="text-[10px] bg-emerald-50 text-emerald-900 p-2 rounded-xl border border-emerald-200 font-medium">
                              🎁 Gift Note: {req.giftNote}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDirectChat({ id: `req-${req.id}`, name: `${req.familyName} (Need)` })}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] border-none cursor-pointer"
                          >
                            Chat / Offer
                          </button>
                          {!isGifted && (
                            <button
                              type="button"
                              onClick={() => handleOpenGiftModal('give_to_need', { need: req })}
                              className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] border-none cursor-pointer flex items-center gap-1"
                            >
                              <Gift className="w-3 h-3" />
                              <span>Give as Free Gift</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Marketplace Listings Grid: Services, Goods for Sale, Free Gift Provisions & Vetted Caregivers */}
          {marketplaceTypeFilter !== 'needs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {marketplaceProviders
                .filter(p => marketplaceCategoryFilter === 'All Listings' || p.category === marketplaceCategoryFilter)
                .filter(p => {
                  const provMember = members.find(m => m.id === p.ownerId);
                  if (provMember?.isAccountFrozen && p.ownerId !== effectiveUserId) {
                    return false;
                  }
                  const isGoods = p.listingKind === 'goods' || GOODS_CATEGORIES.includes(p.category);
                  const isGift = p.offerMode === 'gift';
                  if (marketplaceTypeFilter === 'services') return !isGoods;
                  if (marketplaceTypeFilter === 'goods') return isGoods;
                  if (marketplaceTypeFilter === 'gifts') return isGift;
                  return true;
                })
                .map(prov => {
                  const isGoods = prov.listingKind === 'goods' || GOODS_CATEGORIES.includes(prov.category);
                  const isGift = prov.offerMode === 'gift';
                  const isClaimed = isGift && prov.itemStatus === 'Claimed';
                  const isMine = prov.ownerId === effectiveUserId;
                  const provMember = members.find(m => m.id === prov.ownerId);
                  const isProvLevel2 = Boolean(
                    provMember?.isKycVerified &&
                    ((provMember?.completedInPersonDealsCount || 0) >= 5 || (provMember?.providerLevel || 0) >= 2)
                  );
                  const isAccountFrozen = Boolean(provMember?.isAccountFrozen);

                  return (
                    <div
                      key={prov.id}
                      className={`bg-white rounded-[32px] p-6 border shadow-sm flex flex-col justify-between gap-5 transition-all hover:shadow-md ${
                        isAccountFrozen
                          ? 'border-red-300 opacity-80'
                          : isGift
                          ? 'border-emerald-200'
                          : 'border-gray-100'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 ${
                                isGoods ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'
                              }`}>
                                {isGoods ? <Package className="w-3 h-3" /> : <HeartHandshake className="w-3 h-3" />}
                                <span>{isGoods ? 'Goods Listing' : 'Care Service'}</span>
                              </span>
                              {isGift && (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  isClaimed ? 'bg-gray-200 text-gray-700' : 'bg-emerald-600 text-white'
                                }`}>
                                  {isClaimed ? `Claimed by ${prov.claimedByName || 'Member'}` : '🎁 Free Gift'}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-gray-900">
                              {prov.title}
                            </h3>
                            <p className="text-xs font-bold text-sky-800">
                              Provider: {prov.name} • {prov.category}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                              isGift
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-sky-50 text-sky-800 border-sky-200'
                            }`}>
                              {isGift ? 'Free Gift' : prov.rateInfo}
                            </span>
                            {isMine && (
                              <button
                                type="button"
                                onClick={() => handleDeleteProviderListing(prov.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 bg-transparent border-none cursor-pointer"
                                title="Delete listing"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-gray-700 leading-relaxed font-medium">
                          {prov.bio}
                        </p>

                        <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 font-bold">
                          {isGoods ? (
                            <span>Condition: {prov.condition || 'Good'}</span>
                          ) : (
                            <span>Experience: {prov.experienceYears} Years</span>
                          )}
                          <span>•</span>
                          <span>Location: {prov.location || 'Local'}</span>
                          <span>•</span>
                          <span>Availability: {prov.availability}</span>
                        </div>

                        <div className={`flex items-center justify-between text-xs font-bold px-3.5 py-2 rounded-2xl border ${
                          isGift
                            ? 'text-emerald-900 bg-emerald-50 border-emerald-200/80'
                            : 'text-sky-900 bg-sky-50 border-sky-200/80'
                        }`}>
                          <span>{isGift ? 'Community Gift Status:' : 'Listed Price (Negotiate in Chat):'}</span>
                          <span className="font-black">
                            {isGift ? (isClaimed ? 'Claimed' : 'Available Free') : (prov.rateInfo || 'Negotiate directly')}
                          </span>
                        </div>

                        {/* Provider Trust Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {provMember?.isKycVerified ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-700" />
                              <span>Profile Confirmed</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                              Standard Tier
                            </span>
                          )}

                          {isProvLevel2 ? (
                            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black flex items-center gap-1">
                              <Truck className="w-3 h-3 text-sky-700" />
                              <span>Level 2: Trackable Courier Enabled</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                              Level 1: Local Handover Only
                            </span>
                          )}

                          {provMember?.hasProviderProtectionBadge && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase flex items-center gap-1 border border-indigo-200">
                              <Award className="w-3 h-3 text-indigo-700" />
                              <span>Protected Provider</span>
                            </span>
                          )}
                        </div>

                        {isAccountFrozen && (
                          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                            <span>Storefront Frozen: Non-delivery dispute resolution pending.</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDirectChat(prov)}
                          className="flex-1 py-2.5 px-3 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{isGift ? 'Chat with Giver' : 'Chat to Negotiate'}</span>
                        </button>

                        {!isGift && (
                          <button
                            type="button"
                            disabled={isAccountFrozen}
                            onClick={() => {
                              if (isAccountFrozen) return;
                              setLockOrderTarget(prov);
                              const match = prov.rateInfo.match(/\d+[\d,]*/);
                              setLockOrderAmount(match ? match[0].replace(/,/g, '') : '');
                              setLockOrderHandoverType(isProvLevel2 ? 'shipping' : 'in_person');
                              if (provMember?.sellerPaymentMethods && provMember.sellerPaymentMethods.length > 0) {
                                setLockOrderSelectedPmId(provMember.sellerPaymentMethods[0].id);
                              }
                            }}
                            className="py-2.5 px-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Lock Order &amp; Pay</span>
                          </button>
                        )}

                        {isGift && !isClaimed && (
                          <button
                            type="button"
                            onClick={() => handleOpenGiftModal('receive_provision', { provision: prov })}
                            className="py-2.5 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>Receive Free Gift</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              {(marketplaceTypeFilter === 'all' || marketplaceTypeFilter === 'services') &&
                INITIAL_VETTED_CAREGIVERS
                  .filter(c => {
                    if (marketplaceCategoryFilter === 'All Listings') return true;
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
                            <p className="text-xs font-bold text-sky-700 mt-0.5">
                              {caregiver.title}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 shrink-0">
                            <Star className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                            <span className="text-xs font-black text-sky-900">{caregiver.rating}</span>
                            <span className="text-[10px] font-medium text-gray-500">({caregiver.reviewCount})</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-700 leading-relaxed font-medium">
                          {caregiver.bio}
                        </p>

                        <div className="flex items-center justify-between text-xs font-bold text-sky-900 bg-sky-50 px-3.5 py-2 rounded-2xl border border-sky-200/80">
                          <span>Listed Rate (Negotiable in Chat):</span>
                          <span className="text-primary font-black">₦{caregiver.dailyRateNGN?.toLocaleString()} / Day</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDirectChat({ id: caregiver.id, name: caregiver.name })}
                          className="flex-1 py-2.5 px-3 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat to Negotiate</span>
                        </button>
                      </div>
                    </div>
                  ))}
            </div>
          )}

          {/* Locked Orders & External Payment Verification Ledger */}
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Order Terms &amp; Settlement Log
                </span>
                <h3 className="text-base sm:text-lg font-serif font-black text-gray-900 mt-0.5">
                  Locked Marketplace Orders &amp; Payment Confirmations ({
                    marketplaceOrders.filter(o => o.buyerId === effectiveUserId || o.sellerId === effectiveUserId).length
                  })
                </h3>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Agreed terms with locked external transfer details, payment reference logs, trackable courier waybill tracking, and downloadable dispute summary packs.
                </p>
              </div>
            </div>

            {marketplaceOrders.filter(o => o.buyerId === effectiveUserId || o.sellerId === effectiveUserId).length === 0 ? (
              <div className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center space-y-2">
                <Lock className="w-7 h-7 text-gray-400 mx-auto" />
                <p className="text-xs font-bold text-gray-700">No locked orders recorded yet</p>
                <p className="text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed">
                  When purchasing goods or hiring services, tap &quot;Lock Order &amp; Pay&quot; on any listing to capture agreed terms under a reference code (<strong className="text-gray-700">ORD-XXXX</strong>) before sending external payments.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {marketplaceOrders
                  .filter(o => o.buyerId === effectiveUserId || o.sellerId === effectiveUserId)
                  .map(order => {
                    const isConsumer = order.buyerId === effectiveUserId;
                    const isProvider = order.sellerId === effectiveUserId;
                    const pm = order.lockedPaymentMethod;
                    const timer = getTimerRemaining(order.reviewDeadline, 'Verification Window Closed', 'left to verify');
                    const graceTimer = getTimerRemaining(order.providerGraceDeadline, '24h Grace Window Closed (Freeze Active)', 'left in grace window');
                    const reviewTimer = getTimerRemaining(order.autoCompleteDeadline, '48h Review Expired (Auto-Complete Ready)', 'left before auto-complete');
                    const dispatchTimer = getTimerRemaining(order.dispatchDeadline, '48h Dispatch Deadline Expired', 'left to upload waybill');
                    const copyKey = `order-pm-${order.id}`;
                    const waybillCopyKey = `order-wb-${order.id}`;

                    const providerMem = members.find(m => m.id === order.sellerId);
                    const consumerMem = members.find(m => m.id === order.buyerId);

                    return (
                      <div
                        key={order.id}
                        className="p-5 sm:p-6 rounded-3xl bg-gray-50/70 border border-gray-200 space-y-4 text-xs transition-all hover:bg-gray-50"
                      >
                        {/* Order Top Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-200/80 pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black text-xs sm:text-sm bg-gray-900 text-white px-2.5 py-1 rounded-xl">
                              {order.orderCode}
                            </span>
                            <span className="font-bold text-gray-900 text-sm">
                              {order.itemTitle}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase px-2 py-0.5 rounded-full bg-gray-200/60">
                              {order.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                              order.handoverType === 'shipping'
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : 'bg-slate-200 text-slate-800'
                            }`}>
                              {order.handoverType === 'shipping' ? <Truck className="w-3 h-3" /> : null}
                              <span>{order.handoverType === 'shipping' ? 'Trackable Courier' : 'In-Person Handover'}</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                              order.status === 'completed' || order.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : order.status === 'delivery_disputed'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : order.status === 'courier_delivered_pending_consumer_review'
                                ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                : order.status === 'shipped'
                                ? 'bg-sky-100 text-sky-900 border-sky-300'
                                : order.status === 'awaiting_dispatch'
                                ? 'bg-orange-100 text-orange-900 border-orange-300'
                                : order.status === 'denied'
                                ? 'bg-red-100 text-red-900 border-red-300'
                                : order.status === 'proof_submitted'
                                ? 'bg-blue-100 text-blue-900 border-blue-300'
                                : 'bg-gray-100 text-gray-900 border-gray-300'
                            }`}>
                              {order.status === 'completed' || order.status === 'confirmed'
                                ? '✓ Completed'
                                : order.status === 'delivery_disputed'
                                ? '⚠️ Non-Delivery Reported'
                                : order.status === 'courier_delivered_pending_consumer_review'
                                ? '📬 Courier Delivered (Consumer Review)'
                                : order.status === 'shipped'
                                ? '🚚 Shipped / In Transit'
                                : order.status === 'awaiting_dispatch'
                                ? '📦 Awaiting Dispatch Proof (48h)'
                                : order.status === 'denied'
                                ? '⚠️ Receipt Denied'
                                : order.status === 'proof_submitted'
                                ? '⏳ Provider Verification Open'
                                : '🔒 Locked / Awaiting Proof'}
                            </span>
                            <span className="font-black text-sm text-gray-900">
                              {order.currency} {order.agreedAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Registered Parties Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] bg-white p-3.5 rounded-2xl border border-gray-200/70">
                          <div>
                            <span className="text-[10px] font-black uppercase text-gray-400 block">Provider / Recipient</span>
                            <p className="font-black text-gray-900 flex items-center gap-1.5 flex-wrap">
                              <span>{order.sellerName}</span>
                              {order.sellerKycVerified && <span className="text-emerald-700 font-bold">✓ Profile Confirmed</span>}
                              {providerMem?.hasProviderProtectionBadge && (
                                <span className="text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-black flex items-center gap-0.5 border border-indigo-200">
                                  <Award className="w-2.5 h-2.5" /> Community Trust Badge
                                </span>
                              )}
                            </p>
                            <p className="text-gray-500">Phone: {order.sellerPhone || 'Registered in app'}</p>
                            {order.sellerProviderLevel && (
                              <p className="text-[10px] text-sky-800 font-bold">
                                {order.sellerProviderLevel >= 2 ? 'Level 2: Courier Enabled' : 'Level 1: Local Handover'}
                              </p>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-gray-400 block">Consumer / Remitter</span>
                            <p className="font-black text-gray-900 flex items-center gap-1.5 flex-wrap">
                              <span>{order.buyerName}</span>
                              {order.buyerKycVerified && <span className="text-emerald-700 font-bold">✓ Profile Confirmed</span>}
                              {(consumerMem?.disputeStrikes || 0) > 0 && (
                                <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-black border border-amber-200">
                                  ⚠️ Dispute Note Count: {consumerMem?.disputeStrikes}
                                </span>
                              )}
                            </p>
                            <p className="text-gray-500">Phone: {order.buyerPhone || 'Registered in app'}</p>
                          </div>
                        </div>

                        {/* Locked Payment Instructions */}
                        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-700" />
                              Locked Provider Receiving Account (Order Snapshot Active)
                            </span>
                            <span className="text-[10px] font-bold text-amber-800">
                              {order.isInternational ? '48h International Settlement' : '24h Local Banking'}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                            <div className="space-y-0.5 text-xs text-amber-950 font-medium">
                              {pm?.type === 'local_bank' ? (
                                <>
                                  <p><strong>Bank/Fintech:</strong> {pm.bankName || 'Local Bank'}</p>
                                  <p><strong>Account Name:</strong> {pm.accountName || order.sellerName}</p>
                                  <p className="font-mono text-sm font-black text-gray-900">
                                    <strong>Account Number:</strong> {pm.accountNumber}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p><strong>App/Platform:</strong> {pm?.appName || 'P2P Platform'}</p>
                                  <p><strong>Handle/Email/Phone:</strong> {pm?.handleOrEmail}</p>
                                  {pm?.legalName && <p><strong>Legal Name &amp; Country:</strong> {pm.legalName} ({pm.country || 'International'})</p>}
                                </>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopyText(
                                  pm?.type === 'local_bank'
                                    ? `${pm.bankName} - ${pm.accountNumber} (${pm.accountName})`
                                    : `${pm?.appName}: ${pm?.handleOrEmail}`,
                                  copyKey
                                )}
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs border border-amber-300 flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                {copiedKey === copyKey ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700 font-bold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                                    <span>Copy Details</span>
                                  </>
                                )}
                              </button>

                              {pm?.payUrl && (
                                <a
                                  href={pm.payUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 no-underline shadow-2xs"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Open {pm.appName} to Pay</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Consumer Submitted Proof Details */}
                        {order.paymentProof && (
                          <div className="bg-white rounded-2xl p-3.5 border border-gray-200 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                              <span className="text-[10px] font-black uppercase text-gray-500">
                                Consumer Submitted Proof ({order.paymentProof.method})
                              </span>
                              {order.status === 'proof_submitted' && (
                                <div className="flex items-center gap-1 text-[11px] font-black text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md">
                                  <Clock className="w-3 h-3" />
                                  <span>{timer.text}</span>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-gray-500">Transaction / Session ID:</span>
                                <p className="font-mono font-black text-xs text-gray-900 mt-0.5">
                                  {order.paymentProof.transactionId}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Amount &amp; Timestamp:</span>
                                <p className="font-bold text-gray-800">
                                  {order.currency} {order.paymentProof.amountPaid} • {new Date(order.paymentProof.paidTimestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {order.paymentProof.receiptProofUrl && (
                              <div className="pt-1 text-[11px] text-gray-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <a
                                  href={order.paymentProof.receiptProofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sky-700 underline font-semibold"
                                >
                                  View Bank Payment Statement / Receipt
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Awaiting Dispatch (Mandatory 48-hour Provider Window) */}
                        {order.status === 'awaiting_dispatch' && (
                          <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 space-y-1.5 text-orange-950">
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1 text-orange-800">
                                <Truck className="w-4 h-4 text-orange-600" />
                                Mandatory 48-Hour Courier Dispatch Proof
                              </span>
                              <span className="text-[11px] font-black bg-orange-200/80 text-orange-950 px-2 py-0.5 rounded">
                                {dispatchTimer.text}
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed">
                              Provider confirmed funds! To complete dispatch, Provider must upload the official courier waybill tracking number, receipt, and package photo before deadline.
                            </p>
                          </div>
                        )}

                        {/* Courier Shipping Details (When Shipped or In Transit) */}
                        {order.shippingProof && (
                          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/60 pb-2">
                              <span className="text-[10px] font-black uppercase text-sky-900 flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-sky-700" />
                                Courier Dispatch Confirmed ({order.shippingProof.courierName})
                              </span>
                              {order.deliveryEta && (
                                <span className="text-[10px] font-bold text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-200">
                                  ETA: {new Date(order.deliveryEta).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-gray-500">Waybill / Tracking Number:</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono font-black text-xs text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                                    {order.shippingProof.waybillNumber}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(order.shippingProof?.waybillNumber || '', waybillCopyKey)}
                                    className="p-1 rounded bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 cursor-pointer"
                                    title="Copy Waybill"
                                  >
                                    {copiedKey === waybillCopyKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1">
                                {order.shippingProof.packagePhotoUrl && (
                                  <p>
                                    <a
                                      href={order.shippingProof.packagePhotoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sky-700 underline font-semibold flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>View Packed Item Photo</span>
                                    </a>
                                  </p>
                                )}
                                {order.shippingProof.receiptDocUrl && (
                                  <p>
                                    <a
                                      href={order.shippingProof.receiptDocUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sky-700 underline font-semibold flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3 text-sky-600" />
                                      <span>View Waybill Receipt Document</span>
                                    </a>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Non-Delivery Disputed & 24h Provider Grace Window */}
                        {order.status === 'delivery_disputed' && (
                          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2 text-amber-950">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                              <span className="font-black text-xs flex items-center gap-1 text-amber-800">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                Non-Delivery Reported • 24-Hour Provider Grace Window Active
                              </span>
                              <span className="text-[11px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
                                {graceTimer.text}
                              </span>
                            </div>

                            <p className="text-[11px] leading-relaxed">
                              Consumer reported non-delivery. Provider has 24 hours to upload verifiable courier tracking proof showing delivery before the storefront is automatically frozen.
                            </p>

                            {order.deliveryDisputeEvidence && (
                              <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-[11px] space-y-1">
                                <p><strong>Consumer Reason:</strong> {order.deliveryDisputeEvidence.reason}</p>
                                {order.deliveryDisputeEvidence.evidenceUrl && (
                                  <p>
                                    <a
                                      href={order.deliveryDisputeEvidence.evidenceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sky-700 underline font-semibold"
                                    >
                                      View Attached Evidence Document / Screenshot
                                    </a>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Courier Delivered / Pending Consumer Review (48h Window) */}
                        {order.status === 'courier_delivered_pending_consumer_review' && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-2 text-indigo-950">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-2">
                              <span className="font-black text-xs flex items-center gap-1 text-indigo-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Delivery Proof Uploaded • 48-Hour Consumer Confirmation Window
                              </span>
                              <span className="text-[11px] font-black bg-indigo-200 text-indigo-950 px-2 py-0.5 rounded">
                                {reviewTimer.text}
                              </span>
                            </div>

                            <p className="text-[11px] leading-relaxed">
                              Provider submitted delivery confirmation. Consumer has 48 hours to inspect package and confirm receipt or report condition discrepancy. If ignored, the system auto-completes the transaction.
                            </p>

                            {order.providerDeliveryResponse?.proofUrl && (
                              <p className="text-[11px]">
                                <a
                                  href={order.providerDeliveryResponse.proofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-800 underline font-bold"
                                >
                                  View Provider&apos;s Official Courier Delivery Slip
                                </a>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Denial Record If Denied */}
                        {order.status === 'denied' && (
                          <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 space-y-1 text-red-950">
                            <p className="font-black text-xs flex items-center gap-1 text-red-700">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                              Official Denial Recorded by Provider
                            </p>
                            <p className="text-[11px] leading-relaxed">
                              <strong>Denial Reason:</strong> {order.denialReason || 'Statement uploaded showing no incoming transfer on record.'}
                            </p>
                            {order.denialStatementUrl && (
                              <p className="text-[10px] text-red-800 pt-0.5">
                                Single-day bank/app statement link has been uploaded for order review.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Order Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/80">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Consumer action: Submit Proof */}
                            {isConsumer && order.status === 'locked' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForProof(order);
                                  setProofAmount(String(order.agreedAmount));
                                  setProofMethod(pm?.type === 'local_bank' ? 'Bank Transfer' : (pm?.appName || 'P2P App'));
                                }}
                                className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Submit Payment Proof</span>
                              </button>
                            )}

                            {/* Consumer action: Confirm Delivery Received or Report Non-Delivery */}
                            {isConsumer && (order.status === 'shipped' || order.status === 'courier_delivered_pending_consumer_review') && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDeliveryReceived(order)}
                                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Confirm Delivery Received</span>
                                </button>

                                {order.status === 'shipped' && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrderForNonDelivery(order)}
                                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>Report Non-Delivery</span>
                                  </button>
                                )}
                              </>
                            )}

                            {/* Provider actions: Confirm or Deny Funds */}
                            {isProvider && order.status === 'proof_submitted' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmPaymentReceived(order)}
                                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Confirm Funds Received</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForDenial(order)}
                                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Deny Receipt (Attach Statement)</span>
                                </button>
                              </>
                            )}

                            {/* Provider action: Upload Shipping Proof */}
                            {isProvider && order.status === 'awaiting_dispatch' && (
                              <button
                                type="button"
                                onClick={() => setSelectedOrderForShipping(order)}
                                className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Upload Courier Dispatch Proof</span>
                              </button>
                            )}

                            {/* Provider action: 24h Grace Response */}
                            {isProvider && order.status === 'delivery_disputed' && (
                              <button
                                type="button"
                                onClick={() => setSelectedOrderForGraceResponse(order)}
                                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Submit Delivery Proof (Grace Window)</span>
                              </button>
                            )}

                            {/* Auto-Complete Override (48h Expired) */}
                            {order.status === 'courier_delivered_pending_consumer_review' && reviewTimer.isExpired && (
                              <button
                                type="button"
                                onClick={() => handleAutoCompleteDelivery(order)}
                                className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Auto-Complete Order (48h Expired)</span>
                              </button>
                            )}

                            {/* Dispute Arbitration / Strike resolution */}
                            {(order.status === 'delivery_disputed' ||
                              order.status === 'courier_delivered_pending_consumer_review' ||
                              order.status === 'denied') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForResolution(order);
                                  setResolutionType('consumer_false_claim');
                                  setResolutionNotes('');
                                }}
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 border-none cursor-pointer shadow-2xs"
                              >
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                <span>Dispute Arbitration / Strikes</span>
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 ml-auto">
                            {/* Download PDF Dispute Evidence Pack */}
                            <button
                              type="button"
                              onClick={() => handleDownloadDisputePack(order)}
                              className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 border-none cursor-pointer shadow-2xs"
                              title="Download official dispute evidence pack"
                            >
                              <FileDown className="w-3.5 h-3.5 text-sky-400" />
                              <span>Download Dispute Evidence Pack (PDF)</span>
                            </button>

                            {/* Policy Report & Restrict */}
                            <button
                              type="button"
                              onClick={() => {
                                const targetId = isConsumer ? order.sellerId : order.buyerId;
                                const targetDevId = isConsumer ? (order.sellerDeviceId || 'unknown-session') : (order.buyerDeviceId || 'unknown-session');
                                const roleText = isConsumer ? 'Provider' : 'Consumer';
                                handleBanFraudster(
                                  targetId,
                                  targetDevId,
                                  `Order dispute report in ${order.orderCode} by ${roleText}`,
                                  order.id
                                );
                              }}
                              className="p-2 rounded-xl text-red-600 hover:bg-red-100 bg-red-50 border border-red-200 cursor-pointer"
                              title="Report order issue and restrict counterparty marketplace access"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5 removed */}
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

      {/* MODAL: Post Service, Goods for Sale, or Free Gift Provision */}
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-700">
                    Care, Goods &amp; Free Gift Marketplace
                  </span>
                  <h2 className="text-xl font-serif font-black text-gray-900">
                    Post Service, Goods for Sale, or Free Gift
                  </h2>
                </div>
                <button
                  onClick={() => setIsProviderRegisterModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {specialistError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
                  {specialistError}
                </div>
              )}

              <form onSubmit={handleRegisterProvider} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProvListingKind('service');
                      if (GOODS_CATEGORIES.includes(provCategory)) {
                        setProvCategory('Caregivers & Sitters');
                      }
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border cursor-pointer ${
                      provListingKind === 'service' ? 'bg-sky-700 text-white border-sky-700' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Care / Service
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProvListingKind('goods');
                      if (!GOODS_CATEGORIES.includes(provCategory)) {
                        setProvCategory(GOODS_CATEGORIES[0]);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border cursor-pointer ${
                      provListingKind === 'goods' ? 'bg-amber-600 text-white border-amber-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Baby / Family Goods
                  </button>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Your Name / Shop Name *</label>
                  <input
                    type="text"
                    required
                    value={provName}
                    onChange={e => setProvName(e.target.value)}
                    placeholder="e.g. Mary Okon / Chidinma Mom Circle"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {provListingKind === 'goods' ? 'Item Name / Title *' : 'Service Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={provTitle}
                    onChange={e => setProvTitle(e.target.value)}
                    placeholder={provListingKind === 'goods' ? 'e.g. Graco Stroller + Infant Car Seat / Newborn Clothes Pack' : 'e.g. Postpartum Doula & Night Caregiver'}
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
                    {(provListingKind === 'goods' ? GOODS_CATEGORIES : SERVICE_CATEGORIES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {provListingKind === 'goods' ? (
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Item Condition</label>
                      <select
                        value={provCondition}
                        onChange={e => setProvCondition(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                      >
                        <option value="Brand New">Brand New</option>
                        <option value="Gently Used">Gently Used</option>
                        <option value="Pre-loved / Clean">Pre-loved / Clean</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Years of Experience</label>
                      <input
                        type="number"
                        value={provExpYears}
                        onChange={e => setProvExpYears(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-700 text-xs">
                        {provOfferMode === 'gift' ? 'Offer Type' : 'Asking Price / Rate'}
                      </label>
                      <label className="inline-flex items-center gap-1 cursor-pointer text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={provOfferMode === 'gift'}
                          onChange={e => {
                            const isGift = e.target.checked;
                            setProvOfferMode(isGift ? 'gift' : 'paid');
                            if (isGift) {
                              setProvRateInfo('Free Gift (No Cost)');
                            } else {
                              setProvRateInfo('Negotiable in Chat');
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-0 cursor-pointer w-3 h-3"
                        />
                        <span>🎁 Free Gift</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={provOfferMode === 'gift' ? 'Free Gift (No Cost)' : provRateInfo}
                      disabled={provOfferMode === 'gift'}
                      onChange={e => setProvRateInfo(e.target.value)}
                      placeholder="e.g. ₦35,000 or $25/hr (Negotiable)"
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold disabled:opacity-75 disabled:bg-emerald-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">City / Location</label>
                    <input
                      type="text"
                      value={provLocation}
                      onChange={e => setProvLocation(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Pickup / Schedule Availability</label>
                    <input
                      type="text"
                      value={provAvailability}
                      onChange={e => setProvAvailability(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={provBio}
                    onChange={e => setProvBio(e.target.value)}
                    placeholder={provListingKind === 'goods' ? 'Describe item details, age range, size, or pickup instructions...' : 'Describe the service you offer to families...'}
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
                    className={`px-5 py-2 rounded-xl text-white font-black uppercase border-none cursor-pointer shadow-md ${
                      provOfferMode === 'gift' ? 'bg-emerald-600' : 'bg-sky-700'
                    }`}
                  >
                    {isSubmittingProvider ? 'Publishing...' : provOfferMode === 'gift' ? 'Publish Free Gift' : 'Publish Listing'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Post a Service or Goods Need */}
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-700">
                    Community Need Request
                  </span>
                  <h2 className="text-xl font-serif font-black text-gray-900">
                    Post Goods or Service You Need
                  </h2>
                </div>
                <button
                  onClick={() => setIsCareRequestModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {specialistError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
                  {specialistError}
                </div>
              )}

              <form onSubmit={handlePostCareRequest} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReqNeedKind('goods');
                      if (!GOODS_CATEGORIES.includes(reqCategory)) {
                        setReqCategory(GOODS_CATEGORIES[0]);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border cursor-pointer ${
                      reqNeedKind === 'goods' ? 'bg-amber-600 text-white border-amber-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Goods Needed
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReqNeedKind('service');
                      if (GOODS_CATEGORIES.includes(reqCategory)) {
                        setReqCategory('Caregivers & Sitters');
                      }
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border cursor-pointer ${
                      reqNeedKind === 'service' ? 'bg-sky-700 text-white border-sky-700' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Service Needed
                  </button>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Your / Family Name *</label>
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
                    {(reqNeedKind === 'goods' ? GOODS_CATEGORIES : SERVICE_CATEGORIES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Need Title *</label>
                  <input
                    type="text"
                    required
                    value={reqTitle}
                    onChange={e => setReqTitle(e.target.value)}
                    placeholder={reqNeedKind === 'goods' ? 'e.g. Need Newborn Crib, Breast Pump, or Size 1 Diapers' : 'e.g. Seeking Night Nanny for 2 weeks'}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Description &amp; Requirements *</label>
                  <textarea
                    rows={3}
                    required
                    value={reqDescription}
                    onChange={e => setReqDescription(e.target.value)}
                    placeholder="Describe the item or help you need and your timing..."
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

                <label className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqAcceptsGift}
                    onChange={e => setReqAcceptsGift(e.target.checked)}
                  />
                  <span>Open to receiving this good or service as a Free Gift from a community member</span>
                </label>

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
                    {isSubmittingRequest ? 'Posting...' : 'Publish Need'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Give Free Gift onto a Posted Need OR Receive a Free Gift Provision */}
      <AnimatePresence>
        {giftModalContext && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-5 border border-emerald-200 shadow-2xl text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    Free Goods &amp; Services Gift Exchange
                  </span>
                  <h3 className="text-xl font-serif font-black text-gray-900 mt-0.5">
                    {giftModalContext.mode === 'give_to_need'
                      ? `Give Free Gift to ${giftModalContext.targetNeed?.familyName}`
                      : `Receive Free Gift from ${giftModalContext.targetProvision?.name}`}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {giftModalContext.targetNeed?.title || giftModalContext.targetProvision?.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGiftModalContext(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {giftError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
                  {giftError}
                </div>
              )}

              <form onSubmit={handleSubmitGiftAction} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Your Display Name *</label>
                  <input
                    type="text"
                    required
                    value={giftActorName}
                    onChange={e => setGiftActorName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 font-semibold text-gray-800 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {giftModalContext.mode === 'give_to_need'
                      ? 'Message about the free good or service you are gifting *'
                      : 'Pickup / Delivery / Gratitude Note *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={giftNoteInput}
                    onChange={e => setGiftNoteInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-800 outline-none focus:border-emerald-600 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setGiftModalContext(null)}
                    className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingGift}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmittingGift
                      ? 'Confirming...'
                      : giftModalContext.mode === 'give_to_need'
                      ? 'Confirm Free Gift'
                      : 'Claim Free Gift'}
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
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    Peer Network Profile
                  </span>
                  <h2 className="text-xl font-serif font-black text-gray-900">
                    Your Parent &amp; Provider Profile
                  </h2>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Status Bar */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                    Profile Status
                  </span>
                  {isMyKycVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" /> Profile Confirmed Badge
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                        Standard Tier (Max £50/order, 3/day)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileModalOpen(false);
                          setIsKycModalOpen(true);
                        }}
                        className="text-[10px] font-black text-white bg-amber-700 hover:bg-amber-800 px-2 py-0.5 rounded-lg border-none cursor-pointer"
                      >
                        Confirm Profile
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium pt-1 border-t border-gray-200/70">
                  <span>Local Browser Session ID:</span>
                  <code className="font-mono text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                    {deviceId ? `${deviceId.slice(0, 16)}...` : 'Initializing...'}
                  </code>
                </div>
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
                    Phone Number (Required for Marketplace Orders) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={myPhoneNumber}
                    onChange={e => setMyPhoneNumber(e.target.value)}
                    placeholder="+44 7123 456789 or +234 801 234 5678"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-gray-900"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Used to securely bind and lock order receipts. Never shared publicly on forums.
                  </p>
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
                    Short Bio &amp; How You Connect
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

      {/* MODAL: Order Terms Locking & Reference Code Generation */}
      <AnimatePresence>
        {lockOrderTarget && (() => {
          const providerMember = members.find(m => m.id === lockOrderTarget.ownerId);
          const isProviderLevel2 = Boolean(
            providerMember?.isKycVerified &&
            ((providerMember?.completedInPersonDealsCount || 0) >= 5 || (providerMember?.providerLevel || 0) >= 2)
          );

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-sky-100 shadow-2xl space-y-5 text-left"
              >
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-700">
                        Order Terms &amp; Summary Snapshot
                      </span>
                      <h2 className="text-xl font-serif font-black text-gray-900">
                        Lock Order Terms
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLockOrderTarget(null);
                      setLockOrderError('');
                    }}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Item & Provider Card */}
                <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                        {lockOrderTarget.category} • {lockOrderTarget.listingKind === 'goods' ? 'Goods' : 'Care Service'}
                      </span>
                      <h3 className="text-sm font-black text-gray-900 mt-0.5">{lockOrderTarget.title}</h3>
                    </div>
                    <span className="text-xs font-black text-sky-900 bg-white px-2.5 py-1 rounded-xl border border-sky-200">
                      {lockOrderTarget.rateInfo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700 pt-1 border-t border-sky-200/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>Provider: <strong>{lockOrderTarget.name}</strong></span>
                      {providerMember?.isKycVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          <ShieldCheck className="w-3 h-3" /> Profile Confirmed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          Standard Provider
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isProviderLevel2 ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isProviderLevel2 ? 'Level 2 Courier' : 'Level 1 Local'}
                    </span>
                  </div>
                </div>

                {/* Handover & Fulfillment Mode Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block text-xs">Handover &amp; Delivery Method *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLockOrderHandoverType('in_person')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        lockOrderHandoverType === 'in_person'
                          ? 'bg-sky-50 border-sky-600 ring-1 ring-sky-600 shadow-2xs'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-black text-gray-900 text-xs">
                        🤝 Local In-Person Handover
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 leading-snug">
                        Direct face-to-face meeting in local area. Settle and inspect items together.
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={!isProviderLevel2}
                      onClick={() => {
                        if (isProviderLevel2) setLockOrderHandoverType('shipping');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        !isProviderLevel2
                          ? 'bg-gray-50/70 border-gray-200 opacity-60 cursor-not-allowed'
                          : lockOrderHandoverType === 'shipping'
                          ? 'bg-sky-50 border-sky-600 ring-1 ring-sky-600 shadow-2xs cursor-pointer'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-black text-gray-900 text-xs">
                        <Truck className="w-3.5 h-3.5 text-sky-700" />
                        <span>📦 Trackable Courier Dispatch</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 leading-snug">
                        {isProviderLevel2
                          ? 'Waybill tracking, 48h dispatch proof, & delivery window tracking.'
                          : '🔒 Requires Level 2 Provider (Profile Confirmation + 5 in-person handovers).'}
                      </p>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 font-medium">
                  <strong>🔒 Order Snapshot:</strong> Locking agreed terms generates a unique payment reference (e.g. <code>ORD-8492</code>) and saves a snapshot of the provider&apos;s bank/app details. You then pay externally using that reference code.
                </div>

                {!isMyKycVerified && (
                  <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-2xl text-[11px] text-amber-800 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Standard Tier Limits
                    </div>
                    <div>
                      Max limit: <strong>£50 equivalent (~$65 USD / ~€60 EUR / ~₦95,000 NGN)</strong> per order, up to 3 orders per day.
                    </div>
                  </div>
                )}

                {lockOrderError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
                    {lockOrderError}
                  </div>
                )}

                <form onSubmit={handleCreateLockedOrder} className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="font-bold text-gray-700 block mb-1">Agreed Total Price *</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={lockOrderAmount}
                        onChange={e => setLockOrderAmount(e.target.value)}
                        placeholder="e.g. 35"
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-black text-sm text-gray-900 outline-none focus:border-sky-600"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Currency *</label>
                      <select
                        value={lockOrderCurrency}
                        onChange={e => setLockOrderCurrency(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-xs text-gray-900 outline-none focus:border-sky-600"
                      >
                        <option value="GBP">GBP (£)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="NGN">NGN (₦)</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockOrderIsIntl}
                      onChange={e => setLockOrderIsIntl(e.target.checked)}
                      className="mt-0.5 rounded text-sky-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="font-bold text-gray-900">International / Cross-Border Transfer</div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                        Extends provider funds verification window to <strong>48 hours</strong> (vs 24 hours local) for international bank clearing.
                      </div>
                    </div>
                  </label>

                  {/* Provider Payment Method Choice */}
                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Select Provider Receiving Account / Handle *
                    </label>
                    {(() => {
                      const pms = providerMember?.sellerPaymentMethods || [];
                      if (pms.length === 0) {
                        return (
                          <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-[11px] text-gray-600">
                            Provider has default settlement details on file. The locked order will record their saved name and phone.
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-2">
                          {pms.map(pm => (
                            <label
                              key={pm.id}
                              className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                                (lockOrderSelectedPmId || pms[0].id) === pm.id
                                  ? 'bg-sky-50/80 border-sky-400 shadow-xs'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="radio"
                                name="provider_pm_choice"
                                value={pm.id}
                                checked={(lockOrderSelectedPmId || pms[0].id) === pm.id}
                                onChange={() => setLockOrderSelectedPmId(pm.id)}
                                className="mt-1 text-sky-600 focus:ring-0"
                              />
                              <div className="text-xs">
                                {pm.type === 'local_bank' ? (
                                  <>
                                    <div className="font-black text-gray-900">{pm.bankName} • {pm.accountNumber}</div>
                                    <div className="text-[11px] text-gray-600">Account Name: <strong>{pm.accountName}</strong></div>
                                  </>
                                ) : (
                                  <>
                                    <div className="font-black text-gray-900">{pm.appName} • {pm.handleOrEmail}</div>
                                    {pm.payUrl && <div className="text-[10px] text-sky-700 break-all">{pm.payUrl}</div>}
                                    {pm.legalName && <div className="text-[11px] text-gray-600">Legal: {pm.legalName} ({pm.country})</div>}
                                  </>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLockOrderTarget(null);
                        setLockOrderError('');
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLockingOrder}
                      className="px-6 py-2.5 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isLockingOrder ? 'Locking Terms...' : 'Lock Terms & Generate Code'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* MODAL: Submit Structured Payment Proof */}
      <AnimatePresence>
        {selectedOrderForProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-indigo-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">
                      Payment Verification
                    </span>
                    <h2 className="text-xl font-serif font-black text-gray-900">
                      Submit Payment Proof
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForProof(null);
                    setProofError('');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Reference Box */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-indigo-900 bg-white px-2.5 py-1 rounded-xl border border-indigo-200">
                    {selectedOrderForProof.orderCode}
                  </span>
                  <span className="text-sm font-black text-indigo-950">
                    {selectedOrderForProof.currency} {selectedOrderForProof.agreedAmount}
                  </span>
                </div>
                <div className="text-xs text-gray-700">
                  Item: <strong>{selectedOrderForProof.itemTitle}</strong>
                </div>
                <div className="text-xs text-gray-700">
                  Provider: <strong>{selectedOrderForProof.sellerName}</strong>
                </div>
                {selectedOrderForProof.lockedPaymentMethod && (
                  <div className="text-[11px] text-indigo-900 pt-2 border-t border-indigo-200/60">
                    Paid To:{' '}
                    <strong>
                      {selectedOrderForProof.lockedPaymentMethod.bankName || selectedOrderForProof.lockedPaymentMethod.appName}
                    </strong>{' '}
                    (
                    {selectedOrderForProof.lockedPaymentMethod.accountNumber ||
                      selectedOrderForProof.lockedPaymentMethod.handleOrEmail}
                    )
                  </div>
                )}
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-[11px] text-indigo-900 font-medium flex items-start gap-2">
                <Clock className="w-4 h-4 shrink-0 text-indigo-700 mt-0.5" />
                <span>
                  Submitting proof triggers a <strong>{selectedOrderForProof.isInternational ? '48-hour' : '24-hour'}</strong> window for the provider to verify funds in their personal account and confirm or deny receipt with evidence.
                </span>
              </div>

              {proofError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
                  {proofError}
                </div>
              )}

              <form onSubmit={handleSubmitPaymentProof} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Payment Method Used *</label>
                    <select
                      value={proofMethod}
                      onChange={e => setProofMethod(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="OPay">OPay</option>
                      <option value="PalmPay">PalmPay</option>
                      <option value="Kuda">Kuda</option>
                      <option value="GTBank">GTBank</option>
                      <option value="Barclays">Barclays</option>
                      <option value="Revolut">Revolut</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Wise">Wise</option>
                      <option value="Venmo">Venmo</option>
                      <option value="Cash App">Cash App</option>
                      <option value="Payoneer">Payoneer</option>
                      <option value="Other">Other Fintech/Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Exact Amount Sent *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={proofAmount || selectedOrderForProof.agreedAmount}
                      onChange={e => setProofAmount(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-black text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Official Transaction / Session ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={proofTransactionId}
                    onChange={e => setProofTransactionId(e.target.value)}
                    placeholder="e.g. 0000132408221045239841 or PAY-98234-X"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-mono font-bold text-gray-900 outline-none focus:border-indigo-600"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Enter the exact transaction reference from your bank app. Submitting false references may result in marketplace account restriction.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Receipt / Transfer Statement Document Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={proofReceiptDoc}
                    onChange={e => setProofReceiptDoc(e.target.value)}
                    placeholder="https://... cloud or image link to payment receipt / statement"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Consumer Notes / Remarks</label>
                  <textarea
                    rows={2}
                    value={proofNotes}
                    onChange={e => setProofNotes(e.target.value)}
                    placeholder="e.g. Sent from John Okon account ending in 4102 at 2:30 PM..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-800 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForProof(null);
                      setProofError('');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingProof}
                    className="px-6 py-2.5 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmittingProof ? 'Submitting...' : 'Confirm & Start Provider Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Provider Denial with Mandatory Single-Day Statement */}
      <AnimatePresence>
        {selectedOrderForDenial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-red-200 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-700">
                      Order Review &amp; Dispute
                    </span>
                    <h2 className="text-xl font-serif font-black text-gray-900">
                      Deny Payment Receipt
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForDenial(null);
                    setDenialError('');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Info */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-gray-900">{selectedOrderForDenial.orderCode}</span>
                  <span className="font-black text-red-700">
                    {selectedOrderForDenial.currency} {selectedOrderForDenial.agreedAmount}
                  </span>
                </div>
                <div>Consumer: <strong>{selectedOrderForDenial.buyerName}</strong></div>
                <div>
                  Submitted Transaction ID:{' '}
                  <code className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-red-800 font-bold">
                    {selectedOrderForDenial.paymentProof?.transactionId || 'None'}
                  </code>
                </div>
              </div>

              {/* Documentation Guidelines */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs text-red-900">
                <div className="font-black flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-red-800">
                  <Ban className="w-4 h-4 text-red-700" /> Supporting Statement Guidelines
                </div>
                <p className="text-[11px] leading-relaxed">
                  To keep order denials accurate, please <strong>upload a single-day PDF or banking statement link</strong> showing no incoming credit with that Transaction ID on that date.
                </p>
                <ul className="list-disc list-inside text-[10px] space-y-1 text-red-800 font-medium">
                  <li>Submitting inaccurate denial claims may result in marketplace restriction.</li>
                  <li>Submitting inaccurate payment proofs may result in marketplace restriction.</li>
                  <li>If a banking clearing delay is suspected, download the <strong>Dispute Summary Pack</strong> to review with your bank.</li>
                </ul>
              </div>

              {denialError && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-2xl text-red-800 text-xs font-bold">
                  {denialError}
                </div>
              )}

              <form onSubmit={handleDenyPaymentReceipt} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Single-Day Bank / App Statement URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={denialStatementDoc}
                    onChange={e => setDenialStatementDoc(e.target.value)}
                    placeholder="https://... link to single-day statement PDF showing zero credit"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-900 outline-none focus:border-red-600"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Upload your single-day bank statement export (PDF or image) to Cloud/Drive and paste the document URL.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Denial Explanation *</label>
                  <textarea
                    rows={2}
                    required
                    value={denialReasonText}
                    onChange={e => setDenialReasonText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-800 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForDenial(null);
                      setDenialError('');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDenial}
                    className="px-6 py-2.5 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmittingDenial ? 'Recording Denial...' : 'Confirm Denial & Upload Evidence'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Provider Courier Dispatch Proof Upload (Mandatory sub-step for Shipped Deals) */}
      <AnimatePresence>
        {selectedOrderForShipping && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-sky-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-700">
                      Mandatory Shipping Sub-Step
                    </span>
                    <h2 className="text-xl font-serif font-black text-gray-900">
                      Upload Dispatch Proof &amp; Waybill
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForShipping(null);
                    setShippingError('');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Reference Box */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sky-950">{selectedOrderForShipping.orderCode}</span>
                  <span className="font-black text-sky-900">
                    {selectedOrderForShipping.currency} {selectedOrderForShipping.agreedAmount}
                  </span>
                </div>
                <div>Item: <strong>{selectedOrderForShipping.itemTitle}</strong></div>
                <div>Consumer: <strong>{selectedOrderForShipping.buyerName}</strong></div>
              </div>

              {/* Warning to use trackable couriers */}
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-[11px] text-amber-900 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-700" /> Trackable Courier Requirement
                </div>
                <p className="leading-relaxed">
                  Always use trackable, signature-required couriers (e.g., DHL Express, GIG Logistics, Royal Mail, FedEx, Uber Package). Regular untracked postal mail does not qualify as dispatch proof in dispute arbitrations.
                </p>
              </div>

              {shippingError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
                  {shippingError}
                </div>
              )}

              <form onSubmit={handleUploadShippingProof} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Courier Company *</label>
                    <select
                      value={shippingCourierName}
                      onChange={e => setShippingCourierName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900"
                    >
                      <option value="DHL Express">DHL Express</option>
                      <option value="GIG Logistics">GIG Logistics</option>
                      <option value="Royal Mail (Tracked)">Royal Mail (Tracked)</option>
                      <option value="FedEx">FedEx</option>
                      <option value="UPS">UPS</option>
                      <option value="Uber Package / Courier">Uber Package</option>
                      <option value="Sendy">Sendy</option>
                      <option value="Other Trackable Courier">Other Trackable Courier</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Estimated Delivery ETA *</label>
                    <select
                      value={shippingEtaHours}
                      onChange={e => setShippingEtaHours(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900"
                    >
                      <option value="24">Within 24 Hours (Same Day/Next Day)</option>
                      <option value="48">Within 48 Hours (2 Days)</option>
                      <option value="72">Within 72 Hours (3 Days)</option>
                      <option value="120">Within 5 Days (Standard Remote)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Waybill / Tracking Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingWaybillNumber}
                    onChange={e => setShippingWaybillNumber(e.target.value)}
                    placeholder="e.g. DHL-982348123 or GIG-LAG-78213"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-mono font-bold text-gray-900 outline-none focus:border-sky-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Photo of Packed Item URL (Recommended)
                  </label>
                  <input
                    type="url"
                    value={shippingPackagePhoto}
                    onChange={e => setShippingPackagePhoto(e.target.value)}
                    placeholder="https://... cloud or image link of packed item"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Courier Waybill Receipt Document URL (Recommended)
                  </label>
                  <input
                    type="url"
                    value={shippingReceiptDoc}
                    onChange={e => setShippingReceiptDoc(e.target.value)}
                    placeholder="https://... cloud link to waybill receipt slip / PDF"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Dispatch Notes for Consumer</label>
                  <textarea
                    rows={2}
                    value={shippingNotes}
                    onChange={e => setShippingNotes(e.target.value)}
                    placeholder="e.g. Handed over to GIG driver at 11am; rider phone number provided..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-800 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForShipping(null);
                      setShippingError('');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingShipping}
                    className="px-6 py-2.5 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmittingShipping ? 'Uploading Proof...' : 'Confirm Dispatch & Upload Waybill'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Consumer Report Non-Delivery (Mandatory Evidence Required) */}
      <AnimatePresence>
        {selectedOrderForNonDelivery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-amber-300 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                      Dispute Investigation
                    </span>
                    <h2 className="text-xl font-serif font-black text-gray-900">
                      Report Non-Delivery
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForNonDelivery(null);
                    setNonDeliveryError('');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Info */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1 text-xs text-amber-950">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black">{selectedOrderForNonDelivery.orderCode}</span>
                  <span className="font-bold">
                    Provider: {selectedOrderForNonDelivery.sellerName}
                  </span>
                </div>
                <div>Waybill: <code>{selectedOrderForNonDelivery.shippingProof?.waybillNumber || 'None'}</code></div>
              </div>

              {/* Mandatory Proof Requirement Banner */}
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl space-y-1.5 text-xs text-red-950">
                <div className="font-black flex items-center gap-1.5 text-red-800 uppercase text-[10px] tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> Evidence Attachment Mandatory
                </div>
                <p className="text-[11px] leading-relaxed">
                  To avoid unfair freezes, please <strong>attach supporting evidence</strong> (e.g. unfulfilled courier tracking screenshot, rider cancellation, or unanswered chat screenshot past ETA). Filing false reports triggers <strong>Strike 1 warning</strong> or <strong>Strike 2 marketplace access restriction</strong>.
                </p>
              </div>

              {nonDeliveryError && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-2xl text-red-800 text-xs font-bold">
                  {nonDeliveryError}
                </div>
              )}

              <form onSubmit={handleReportNonDelivery} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Reason for Non-Delivery Report *</label>
                  <select
                    value={nonDeliveryReason}
                    onChange={e => setNonDeliveryReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900"
                  >
                    <option value="Courier tracking unfulfilled past ETA deadline">Courier tracking unfulfilled past ETA deadline</option>
                    <option value="Courier tracking number is invalid or not registered">Courier tracking number is invalid or not registered</option>
                    <option value="Rider cancelled dispatch and provider is unresponsive">Rider cancelled dispatch and provider is unresponsive</option>
                    <option value="Package marked delivered to wrong address/recipient">Package marked delivered to wrong address/recipient</option>
                    <option value="Other dispatch issue">Other dispatch issue</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Proof Document / Screenshot URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={nonDeliveryEvidenceDoc}
                    onChange={e => setNonDeliveryEvidenceDoc(e.target.value)}
                    placeholder="https://... cloud or image link showing courier status or cancellation"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-900 outline-none focus:border-amber-600"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Upload your courier tracking screenshot or chat transcript screenshot and paste the URL.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Explanation Notes</label>
                  <textarea
                    rows={2}
                    value={nonDeliveryNotes}
                    onChange={e => setNonDeliveryNotes(e.target.value)}
                    placeholder="e.g. Contacted GIG logistics and they confirmed the package was never handed over..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-800 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForNonDelivery(null);
                      setNonDeliveryError('');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingNonDelivery}
                    className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmittingNonDelivery ? 'Filing Report...' : 'File Non-Delivery Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Provider 24-Hour Grace Window Delivery Proof */}
      <AnimatePresence>
        {selectedOrderForGraceResponse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-emerald-200 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      24-Hour Provider Grace Window
                    </span>
                    <h2 className="text-xl font-serif font-black text-gray-900">
                      Submit Delivery Confirmation
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForGraceResponse(null);
                    setGraceError('');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-950 space-y-1">
                <p>
                  Order <strong>{selectedOrderForGraceResponse.orderCode}</strong> has an active non-delivery report.
                </p>
                <p className="leading-relaxed">
                  Upload an official courier delivery slip or recipient signature photo to prove delivery and initiate the 48-hour consumer confirmation window.
                </p>
              </div>

              {graceError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
                  {graceError}
                </div>
              )}

              <form onSubmit={handleProviderGraceResponse} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Proof Document Type *</label>
                  <select
                    value={graceResponseType}
                    onChange={e => setGraceResponseType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900"
                  >
                    <option value="Official Courier Tracking Confirmation">Official Courier Tracking Delivered Confirmation</option>
                    <option value="Courier Delivery Slip with Recipient Signature">Courier Delivery Slip with Recipient Signature</option>
                    <option value="Photo of Handover at Recipient Address">Photo of Handover at Recipient Address</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Official Delivery Proof Document / Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={graceProofDoc}
                    onChange={e => setGraceProofDoc(e.target.value)}
                    placeholder="https://... cloud or image link to courier delivered tracking slip"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-900 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Explanation Notes</label>
                  <textarea
                    rows={2}
                    value={graceNotes}
                    onChange={e => setGraceNotes(e.target.value)}
                    placeholder="e.g. Courier delivered to recipient building security guard at 2:15pm..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-800 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForGraceResponse(null);
                      setGraceError('');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingGraceResponse}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmittingGraceResponse ? 'Submitting...' : 'Submit Official Delivery Proof'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Dispute Arbitration & Strikes Resolution */}
      <AnimatePresence>
        {selectedOrderForResolution && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-300 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                      Dispute Arbitration &amp; Strikes
                    </span>
                    <h2 className="text-xl font-serif font-black text-gray-900">
                      Arbitrate Marketplace Dispute
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForResolution(null);
                    setResolutionError('');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <p>Order: <strong>{selectedOrderForResolution.orderCode}</strong> • {selectedOrderForResolution.itemTitle}</p>
                <p>Provider: <strong>{selectedOrderForResolution.sellerName}</strong></p>
                <p>Consumer: <strong>{selectedOrderForResolution.buyerName}</strong></p>
              </div>

              {resolutionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
                  {resolutionError}
                </div>
              )}

              <form onSubmit={handleResolveDispute} className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="font-bold text-gray-700 block">Select Arbitration Ruling *</label>

                  <label className="flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer bg-emerald-50/70 border-emerald-300">
                    <input
                      type="radio"
                      name="arbitration_ruling"
                      value="consumer_false_claim"
                      checked={resolutionType === 'consumer_false_claim'}
                      onChange={() => setResolutionType('consumer_false_claim')}
                      className="mt-1 text-emerald-600 focus:ring-0"
                    />
                    <div>
                      <div className="font-black text-emerald-950">
                        Rule in Provider&apos;s Favor (Consumer False Claim Strike)
                      </div>
                      <p className="text-[11px] text-emerald-900 mt-0.5 leading-snug">
                        Delivery proof reviewed. Consumer is issued a dispute note (Strike 1 warning, or Strike 2 marketplace restriction). Any pause on Provider is lifted, and Provider receives the <strong>Community Trust Badge</strong>.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer bg-red-50/70 border-red-300">
                    <input
                      type="radio"
                      name="arbitration_ruling"
                      value="provider_default"
                      checked={resolutionType === 'provider_default'}
                      onChange={() => setResolutionType('provider_default')}
                      className="mt-1 text-red-600 focus:ring-0"
                    />
                    <div>
                      <div className="font-black text-red-950">
                        Rule in Consumer&apos;s Favor (Provider Default / Freeze Storefront)
                      </div>
                      <p className="text-[11px] text-red-900 mt-0.5 leading-snug">
                        Provider defaulted on valid delivery proof past the grace period. Provider storefront is frozen and all listings are hidden from marketplace searches.
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Arbitration Notes / Ruling Reason</label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={e => setResolutionNotes(e.target.value)}
                    placeholder="e.g. Courier tracking confirms delivered to consumer unit 4B on May 12..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-800 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForResolution(null);
                      setResolutionError('');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingResolution}
                    className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmittingResolution ? 'Executing Ruling...' : 'Enforce Arbitration Ruling'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Manage External Payment Methods (Up to 5) */}
      <AnimatePresence>
        {isPaymentMethodModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-emerald-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      External P2P &amp; Bank Settlement
                    </span>
                    <h2 className="text-xl font-serif font-black text-gray-900">
                      Receiving Accounts ({myPaymentMethods.length}/5)
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentMethodModalOpen(false);
                    setPmError('');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Saved Methods List */}
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                  Your Saved Receiving Accounts ({myPaymentMethods.length}/5)
                </div>
                {myPaymentMethods.length === 0 ? (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-500">
                    No receiving methods saved yet. Add your bank or payment app details below.
                  </div>
                ) : (
                  myPaymentMethods.map(pm => (
                    <div
                      key={pm.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-black text-gray-900">
                          {pm.type === 'local_bank' ? `${pm.bankName} • ${pm.accountNumber}` : `${pm.appName} • ${pm.handleOrEmail}`}
                        </div>
                        <div className="text-[11px] text-gray-600">
                          {pm.type === 'local_bank'
                            ? `Account Name: ${pm.accountName}`
                            : pm.legalName
                            ? `Legal: ${pm.legalName} (${pm.country})`
                            : pm.payUrl || 'Direct P2P Handle'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePaymentMethod(pm.id)}
                        className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center border-none cursor-pointer shrink-0"
                        title="Delete method"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Method Form (if < 5) */}
              {myPaymentMethods.length < 5 ? (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                    Add New Receiving Account
                  </div>

                  {pmError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                      {pmError}
                    </div>
                  )}

                  <form onSubmit={handleSavePaymentMethod} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPmType('local_bank')}
                        className={`py-2 px-3 rounded-xl font-bold border cursor-pointer ${
                          pmType === 'local_bank'
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        Local Bank / Fintech
                      </button>
                      <button
                        type="button"
                        onClick={() => setPmType('global_app')}
                        className={`py-2 px-3 rounded-xl font-bold border cursor-pointer ${
                          pmType === 'global_app'
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        Global / P2P App
                      </button>
                    </div>

                    {pmType === 'local_bank' ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Bank / App Name *</label>
                            <input
                              type="text"
                              required
                              value={pmBankName}
                              onChange={e => setPmBankName(e.target.value)}
                              placeholder="OPay, PalmPay, Barclays, GTBank..."
                              className="w-full p-2.5 rounded-xl bg-white border border-gray-200 font-semibold text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Account Number *</label>
                            <input
                              type="text"
                              required
                              value={pmAccountNumber}
                              onChange={e => setPmAccountNumber(e.target.value)}
                              placeholder="e.g. 8012345678 or 20394821"
                              className="w-full p-2.5 rounded-xl bg-white border border-gray-200 font-mono font-bold text-gray-900"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Account Holder Legal Name *</label>
                          <input
                            type="text"
                            required
                            value={pmAccountName}
                            onChange={e => setPmAccountName(e.target.value)}
                            placeholder="Exact name on bank account"
                            className="w-full p-2.5 rounded-xl bg-white border border-gray-200 font-semibold text-gray-900"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">App / Platform *</label>
                            <select
                              value={pmAppName}
                              onChange={e => setPmAppName(e.target.value)}
                              className="w-full p-2.5 rounded-xl bg-white border border-gray-200 font-bold text-gray-900"
                            >
                              <option value="PayPal">PayPal</option>
                              <option value="Wise">Wise</option>
                              <option value="Venmo">Venmo</option>
                              <option value="Cash App">Cash App</option>
                              <option value="Revolut">Revolut</option>
                              <option value="Payoneer">Payoneer</option>
                              <option value="Remitly">Remitly</option>
                              <option value="Zelle">Zelle</option>
                              <option value="Other">Other P2P</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Handle / Email / Phone *</label>
                            <input
                              type="text"
                              required
                              value={pmHandle}
                              onChange={e => setPmHandle(e.target.value)}
                              placeholder="@handle or user@email.com"
                              className="w-full p-2.5 rounded-xl bg-white border border-gray-200 font-semibold text-gray-900"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Direct Pay Link (Optional)</label>
                          <input
                            type="url"
                            value={pmPayUrl}
                            onChange={e => setPmPayUrl(e.target.value)}
                            placeholder="e.g. https://paypal.me/yourname"
                            className="w-full p-2.5 rounded-xl bg-white border border-gray-200 font-semibold text-gray-900"
                          />
                        </div>
                        {pmAppName.toLowerCase().includes('payoneer') && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold text-gray-700 block mb-1">Legal Name *</label>
                              <input
                                type="text"
                                required
                                value={pmLegalName}
                                onChange={e => setPmLegalName(e.target.value)}
                                placeholder="Payoneer Legal Name"
                                className="w-full p-2.5 rounded-xl bg-white border border-gray-200 font-semibold"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-gray-700 block mb-1">Country *</label>
                              <input
                                type="text"
                                required
                                value={pmCountry}
                                onChange={e => setPmCountry(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-white border border-gray-200 font-semibold"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase tracking-wider border-none cursor-pointer shadow-xs"
                    >
                      Save Receiving Account
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-600 text-center font-bold">
                  Maximum of 5 saved external receiving methods reached. Delete an existing method to add a new one.
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentMethodModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Profile Confirmation */}
      <AnimatePresence>
        {isKycModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-emerald-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      Community Profile &amp; Order Safety
                    </span>
                    <h2 className="text-xl font-serif font-black text-gray-900">
                      Profile Confirmation
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsKycModalOpen(false);
                    setKycNotice('');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Benefits */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5 text-xs text-emerald-950">
                <div className="font-black text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> What Confirmation Unlocks:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-900 font-medium">
                  <li><strong>Profile Confirmed Badge</strong> displayed on your profile and marketplace listings.</li>
                  <li>Raises the <strong>£50 order limit</strong> and daily booking caps.</li>
                  <li>Helps build community accountability for bookings and shared goods.</li>
                </ul>
              </div>

              {kycNotice && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold">
                  ✓ {kycNotice}
                </div>
              )}

              <form onSubmit={handleCompleteKyc} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={kycLegalName}
                    onChange={e => setKycLegalName(e.target.value)}
                    placeholder="Matches your receiving account name"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Reference ID Type *</label>
                    <select
                      value={kycIdType}
                      onChange={e => setKycIdType(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900"
                    >
                      <option value="National ID (NIN / SSN / National Card)">National ID</option>
                      <option value="International Passport">International Passport</option>
                      <option value="Driver's License">Driver&apos;s License</option>
                      <option value="Voter's Card">Community / Local ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Reference Code (Last 4 Digits) *</label>
                    <input
                      type="text"
                      maxLength={8}
                      required
                      value={kycLast4}
                      onChange={e => setKycLast4(e.target.value)}
                      placeholder="e.g. 8492"
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-mono font-bold text-gray-900"
                    />
                  </div>
                </div>

                {/* Local Session Identifier */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] text-gray-600 space-y-1">
                  <div className="flex items-center justify-between font-bold text-gray-800">
                    <span>Local Session Identifier</span>
                    <span className="text-emerald-700 font-black">Active</span>
                  </div>
                  <div className="font-mono text-[10px] text-gray-500 break-all">
                    {deviceId || 'Initializing session identifier...'}
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Your browser session identifier is linked to this profile to help support marketplace accountability.
                  </p>
                </div>

                <label className="flex items-start gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-200 cursor-pointer">
                  <input type="checkbox" required className="mt-0.5 rounded text-emerald-600 focus:ring-0 w-4 h-4" />
                  <span className="text-[11px] text-gray-700 font-medium">
                    I confirm that these details are accurate and match my personal receiving information.
                  </span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsKycModalOpen(false);
                      setKycNotice('');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingKyc}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmittingKyc ? 'Saving...' : 'Submit & Unlock Profile Badge'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Create Community Live Room */}
      <AnimatePresence>
        {isCreateRoomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-emerald-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      Community Live Rooms
                    </span>
                    <h2 className="text-xl font-serif font-black text-gray-900">
                      Create a New Room
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateRoomModalOpen(false);
                    setRoomActionError('');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Start a public community chat room around a shared parenting topic, baby age group, or neighborhood meetup. Others can browse and join directly from <strong>Member Rooms</strong> with one click.
              </p>

              {roomActionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
                  {roomActionError}
                </div>
              )}

              <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Room Name *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    value={newRoomName}
                    onChange={e => setNewRoomName(e.target.value)}
                    placeholder="e.g. Twin Parents Night Support or Lagos Mom Meetups"
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Topic Category *</label>
                  <select
                    value={newRoomTopic}
                    onChange={e => setNewRoomTopic(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900 outline-none focus:border-primary"
                  >
                    {ROOM_TOPICS.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Room Description *</label>
                  <textarea
                    required
                    rows={3}
                    maxLength={300}
                    value={newRoomDescription}
                    onChange={e => setNewRoomDescription(e.target.value)}
                    placeholder="Describe who this room is for and what you'd love to discuss..."
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-900 outline-none focus:border-primary resize-none"
                  />
                  <div className="text-[10px] text-gray-400 text-right mt-1">
                    {newRoomDescription.length}/300
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateRoomModalOpen(false);
                      setRoomActionError('');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingRoom}
                    className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isCreatingRoom ? 'Creating...' : 'Create & Open Room'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Confirm Policy Restriction (replaces window.confirm) */}
      <AnimatePresence>
        {pendingRestrictionTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-700">
                      Marketplace Policy Review
                    </span>
                    <h2 className="text-lg font-serif font-black text-gray-900">
                      Restrict Counterparty Access?
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingRestrictionTarget(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                This will restrict this user and their linked session from initiating new marketplace orders based on your report: <strong>{pendingRestrictionTarget.reason}</strong>. Proceed?
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingRestrictionTarget(null)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-xs font-bold border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isApplyingRestriction}
                  onClick={confirmMarketplaceRestriction}
                  className="px-5 py-2.5 rounded-2xl bg-red-700 hover:bg-red-800 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isApplyingRestriction ? 'Applying...' : 'Confirm Restriction'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
