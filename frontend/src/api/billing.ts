import { api } from './client';
import type { ApiResponse, Plan } from '@/types/api';

export const billingApi = {
  createCheckoutSession(plan: 'PRO' | 'AGENCY') {
    return api.post<ApiResponse<{ url: string; sessionId: string }>>('/billing/create-checkout-session', { plan });
  },
  createPortalSession() {
    return api.post<ApiResponse<{ url: string }>>('/billing/create-portal-session');
  },
  getSubscription() {
    return api.get<ApiResponse<{ plan: Plan; status: string; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean }>>('/billing/subscription');
  },
};
