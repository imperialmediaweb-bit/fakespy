import { Plan } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      userPlan?: Plan;
    }
  }
}

export {};
