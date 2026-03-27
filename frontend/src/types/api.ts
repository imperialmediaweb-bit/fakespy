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
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'INCOMPLETE' | 'UNPAID';

export interface Usage {
  id: string;
  userId: string;
  monthKey: string;
  analysesUsed: number;
  generationsUsed: number;
  exportsUsed: number;
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
  project?: { id: string; title: string; brandName: string };
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
  project?: { id: string; title: string; brandName: string };
  analysis?: { id: string; status: string } | null;
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
  project?: { id: string; title: string; brandName: string };
}

export interface ApiKeyEntry {
  id: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
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

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export const PLAN_LIMITS = {
  FREE: { analysesPerMonth: 3, generationsPerMonth: 10, exportsPerMonth: 5, maxProjects: 3 },
  PRO: { analysesPerMonth: 30, generationsPerMonth: 100, exportsPerMonth: 50, maxProjects: 25 },
  AGENCY: { analysesPerMonth: 200, generationsPerMonth: 1000, exportsPerMonth: 500, maxProjects: -1 },
} as const;
