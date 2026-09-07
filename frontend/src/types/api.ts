export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  subscription?: {
    plan: Plan;
    status: SubscriptionStatus;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
}

export type Plan = 'FREE' | 'PRO' | 'AGENCY';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'UNPAID';

export interface SubscriptionInfo {
  plan: Plan;
  status: SubscriptionStatus | string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface Usage {
  id: string;
  userId: string;
  monthKey: string;
  analysesUsed: number;
  generationsUsed: number;
  exportsUsed: number;
}

export interface ProjectRef {
  id: string;
  title: string;
  brandName: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  brandName: string;
  niche: string | null;
  location: string | null;
  targetAudience: string | null;
  productDescription: string | null;
  competitors: string[];
  inputData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    analyses: number;
    adGenerations: number;
    exports?: number;
  };
  analyses?: Analysis[];
  adGenerations?: AdGeneration[];
}

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Analysis {
  id: string;
  projectId: string;
  userId: string;
  status: AnalysisStatus;
  sourceType: string;
  inputSnapshot: Record<string, unknown>;
  normalizedInput: Record<string, unknown> | null;
  inferredInsights: IntelligenceInsight[] | null;
  strengths: IntelligenceInsight[] | null;
  weaknesses: IntelligenceInsight[] | null;
  opportunities: IntelligenceInsight[] | null;
  messagingAngles: IntelligenceInsight[] | null;
  disclaimers: string[] | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  project?: ProjectRef;
}

export interface IntelligenceInsight {
  content: string;
  origin: 'user_input' | 'ai_inference' | 'system_derived' | 'external_provider';
  confidence: 'high' | 'medium' | 'low';
}

export type GenerationType = 'FACEBOOK_AD' | 'GOOGLE_AD' | 'VIDEO_SCRIPT' | 'HOOK' | 'CTA' | 'FULL_CAMPAIGN';

export interface AdGeneration {
  id: string;
  projectId: string;
  userId: string;
  analysisId: string | null;
  type: GenerationType;
  promptSnapshot: Record<string, unknown>;
  output: Record<string, unknown>;
  tone: string | null;
  audience: string | null;
  objective: string | null;
  tokensUsed: number | null;
  estimatedCost: number | null;
  createdAt: string;
  updatedAt: string;
  project?: ProjectRef;
  analysis?: { id: string; status: string } | null;
  adScore?: { overallScore: number } | null;
}

export interface AdScore {
  id: string;
  generationId: string;
  clarityScore: number;
  emotionalImpact: number;
  ctrPotential: number;
  conversionStrength: number;
  overallScore: number;
  suggestions: string[];
  createdAt: string;
}

export type VariationStyle = 'short' | 'emotional' | 'direct_response' | 'premium' | 'urgency';

export interface VariationStyleInfo {
  value: VariationStyle;
  label: string;
  description: string;
}

export interface AdVariation {
  id: string;
  generationId: string;
  userId: string;
  style: VariationStyle;
  output: Record<string, unknown>;
  tokensUsed: number | null;
  createdAt: string;
}

export interface AudienceProfile {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  avatar: Record<string, string>;
  painPoints: string[];
  desires: string[];
  objections: string[];
  buyingTriggers: string[];
  demographics: Record<string, string>;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExportRecord {
  id: string;
  userId: string;
  projectId: string;
  type: 'JSON' | 'PDF';
  storageKey: string | null;
  fileUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  project?: ProjectRef;
}

export type BlogPostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: BlogPostStatus;
  categoryId: string | null;
  authorId: string | null;
  featuredImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string } | null;
  tags: BlogTag[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: string;
  subscription?: { plan: Plan; status: SubscriptionStatus } | null;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

export interface AdminUsageStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalProjects: number;
  totalAnalyses: number;
  totalGenerations: number;
  currentMonth: string;
  monthlyUsage: { totalAnalyses: number; totalGenerations: number; totalExports: number };
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export const PLAN_LIMITS = {
  FREE: { analysesPerMonth: 3, generationsPerMonth: 10, exportsPerMonth: 5, maxProjects: 3 },
  PRO: { analysesPerMonth: 30, generationsPerMonth: 100, exportsPerMonth: 50, maxProjects: 25 },
  AGENCY: { analysesPerMonth: 200, generationsPerMonth: 1000, exportsPerMonth: 500, maxProjects: -1 },
} as const;

export interface ApiKeyEntry {
  id: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}
