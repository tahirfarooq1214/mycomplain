// ============================================================
// MYCOMPLAIN — SHARED TYPE DEFINITIONS
// Used across: Consumer App, CMS Dashboard, Backend API
// ============================================================

// ── ENUMS ────────────────────────────────────────────────────

export enum ServiceType {
  BRAND_WARRANTY = 'brand_warranty',
  THIRD_PARTY = 'third_party',
}

export enum ComplaintStatus {
  SUBMITTED = 'submitted',
  RECEIVED_BY_BRAND = 'received_by_brand',
  IN_QUEUE = 'in_queue',             // Waiting for ops team to process
  BEING_PROCESSED = 'being_processed', // Ops agent is calling brand
  REGISTERED_WITH_BRAND = 'registered_with_brand',
  TECHNICIAN_ASSIGNED = 'technician_assigned',
  VISIT_SCHEDULED = 'visit_scheduled',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
  CANCELLED = 'cancelled',
  // Third-party specific
  ASSIGNED_TO_PROVIDER = 'assigned_to_provider',
  PROVIDER_ACKNOWLEDGED = 'provider_acknowledged',
  PROVIDER_EN_ROUTE = 'provider_en_route',
  DIAGNOSIS_COMPLETE = 'diagnosis_complete',
  QUOTE_SENT = 'quote_sent',
  QUOTE_APPROVED = 'quote_approved',
  REPAIR_IN_PROGRESS = 'repair_in_progress',
  REPAIR_COMPLETE = 'repair_complete',
}

export enum RoutingMethod {
  AUTO_EMAIL = 'auto_email',
  AUTO_WHATSAPP = 'auto_whatsapp',
  MANUAL_CALL = 'manual_call',
  THIRD_PARTY_PROVIDER = 'third_party_provider',
}

export enum IssueType {
  NOT_WORKING = 'not_working',
  ELECTRICAL = 'electrical',
  NOISE_VIBRATION = 'noise_vibration',
  LEAKING = 'leaking',
  COOLING_ISSUE = 'cooling_issue',
  HEATING_ISSUE = 'heating_issue',
  PHYSICAL_DAMAGE = 'physical_damage',
  DISPLAY_ISSUE = 'display_issue',
  PERFORMANCE = 'performance',
  OTHER = 'other',
}

export enum PreferredTime {
  MORNING = 'morning',       // 9AM-12PM
  AFTERNOON = 'afternoon',   // 12PM-4PM
  EVENING = 'evening',       // 4PM-7PM
}

export enum PurchaseSource {
  OFFICIAL_STORE = 'official_store',
  AUTHORIZED_DEALER = 'authorized_dealer',
  ONLINE = 'online',
  OTHER = 'other',
}

export enum PaymentMethod {
  CASH = 'cash',
  JAZZCASH = 'jazzcash',
  EASYPAISA = 'easypaisa',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COLLECTED = 'collected',
  VERIFIED = 'verified',
}

export enum UserRole {
  CONSUMER = 'consumer',
  OPS_AGENT = 'ops_agent',
  OPS_SUPERVISOR = 'ops_supervisor',
  ADMIN = 'admin',
  SERVICE_PROVIDER = 'service_provider',
}

export enum ProviderVerificationStatus {
  APPLIED = 'applied',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum BrandIntegrationTier {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  MANUAL = 'manual',
  API = 'api',
}

// ── INTERFACES ────────────────────────────────────────────────

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  city?: string;
  area?: string;
  address?: string;
  profilePhotoUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  serviceEmail?: string;
  helplineNumber?: string;
  whatsappNumber?: string;
  website?: string;
  integrationTier: BrandIntegrationTier;
  avgResponseHours?: number;
  avgRating?: number;
  totalComplaints?: number;
  isActive: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}

export interface UserAppliance {
  id: string;
  userId: string;
  brandId: string;
  categoryId: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseSource?: PurchaseSource;
  dealerName?: string;
  warrantyCardUrl?: string;
  warrantyExpiryDate?: string;
  createdAt: string;
  // Populated relations
  brand?: Brand;
  category?: ProductCategory;
}

export interface Complaint {
  id: string;
  complaintNumber: string;   // MC-YYYYMMDD-XXX
  userId: string;
  userApplianceId?: string;
  brandId?: string;
  categoryId: string;
  serviceType: ServiceType;
  routingMethod?: RoutingMethod;
  // Product info
  modelNumber?: string;
  serialNumber?: string;
  // Issue details
  issueType: IssueType;
  description: string;
  preferredTime?: PreferredTime;
  preferredDate?: string;
  // Warranty info
  warrantyCardUrl?: string;
  purchaseDate?: string;
  purchaseSource?: PurchaseSource;
  dealerName?: string;
  // Status tracking
  status: ComplaintStatus;
  brandReferenceNumber?: string;
  // Third-party service fields
  serviceProviderId?: string;
  diagnosisNotes?: string;
  quotedAmount?: number;
  customerApprovedQuote?: boolean;
  finalAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  commissionAmount?: number;
  // Resolution
  resolutionNotes?: string;
  resolvedAt?: string;
  // Rating
  userRating?: number;
  userReview?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Populated relations
  brand?: Brand;
  category?: ProductCategory;
  appliance?: UserAppliance;
  timeline?: ComplaintTimelineEntry[];
  media?: ComplaintMedia[];
}

export interface ComplaintTimelineEntry {
  id: string;
  complaintId: string;
  status: ComplaintStatus;
  note?: string;
  updatedBy: string;  // 'system' | 'admin' | 'provider' | 'user' | agent name
  createdAt: string;
}

export interface ComplaintMedia {
  id: string;
  complaintId: string;
  mediaType: 'image' | 'video';
  url: string;
  createdAt: string;
}

export interface ServiceProvider {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  city: string;
  areasServed: string[];
  categoriesServed: string[];   // category IDs
  verificationStatus: ProviderVerificationStatus;
  totalJobsCompleted: number;
  avgRating?: number;
  commissionRate: number;  // percentage, default 15
  isActive: boolean;
  createdAt: string;
}

export interface OpsAgent {
  id: string;
  userId: string;
  fullName: string;
  isAvailable: boolean;
  totalCallsToday: number;
  avgCallDuration?: number;
  shift: 'morning' | 'evening' | 'night';
}

export interface ComplaintAssignment {
  id: string;
  complaintId: string;
  agentId?: string;       // ops agent who handled it
  providerId?: string;    // third-party provider assigned
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  callDurationSeconds?: number;
  outcome?: 'registered' | 'declined' | 'callback' | 'transferred_to_third_party';
  brandReferenceNumber?: string;
  notes?: string;
}

// ── API REQUEST/RESPONSE TYPES ────────────────────────────────

export interface CreateComplaintRequest {
  serviceType: ServiceType;
  brandId?: string;
  categoryId: string;
  modelNumber?: string;
  serialNumber?: string;
  issueType: IssueType;
  description: string;
  preferredTime?: PreferredTime;
  preferredDate?: string;
  warrantyCardUrl?: string;
  purchaseDate?: string;
  purchaseSource?: PurchaseSource;
  dealerName?: string;
  // Address for third-party service
  serviceAddress?: string;
}

export interface UpdateComplaintStatusRequest {
  status: ComplaintStatus;
  note?: string;
  brandReferenceNumber?: string;
  diagnosisNotes?: string;
  quotedAmount?: number;
  resolutionNotes?: string;
}

export interface LoginRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  isNewUser: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
