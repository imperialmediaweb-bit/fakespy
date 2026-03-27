import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../../src/validators/auth.validators';
import { createProjectSchema } from '../../src/validators/project.validators';
import { createAnalysisSchema } from '../../src/validators/analysis.validators';
import { createGenerationSchema } from '../../src/validators/generation.validators';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('should accept valid input', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@test.com',
        password: 'StrongPass1',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short name', () => {
      const result = registerSchema.safeParse({
        name: 'J',
        email: 'john@test.com',
        password: 'StrongPass1',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'not-an-email',
        password: 'StrongPass1',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak password (no uppercase)', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@test.com',
        password: 'weakpass1',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak password (no number)', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@test.com',
        password: 'WeakPassword',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@test.com',
        password: 'Sh1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid input', () => {
      const result = loginSchema.safeParse({
        email: 'john@test.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'john@test.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Project Validators', () => {
  it('should accept valid project', () => {
    const result = createProjectSchema.safeParse({
      title: 'My Project',
      brandName: 'TestBrand',
      niche: 'SaaS',
      competitors: ['Comp1', 'Comp2'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing title', () => {
    const result = createProjectSchema.safeParse({
      brandName: 'TestBrand',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing brandName', () => {
    const result = createProjectSchema.safeParse({
      title: 'My Project',
    });
    expect(result.success).toBe(false);
  });

  it('should reject too many competitors', () => {
    const result = createProjectSchema.safeParse({
      title: 'My Project',
      brandName: 'TestBrand',
      competitors: Array(21).fill('comp'),
    });
    expect(result.success).toBe(false);
  });
});

describe('Analysis Validators', () => {
  it('should accept valid analysis input', () => {
    const result = createAnalysisSchema.safeParse({
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      brandName: 'TestBrand',
      niche: 'E-commerce',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid projectId', () => {
    const result = createAnalysisSchema.safeParse({
      projectId: 'not-a-uuid',
      brandName: 'TestBrand',
    });
    expect(result.success).toBe(false);
  });
});

describe('Generation Validators', () => {
  it('should accept valid generation input', () => {
    const result = createGenerationSchema.safeParse({
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'FACEBOOK_AD',
      brandName: 'TestBrand',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid type', () => {
    const result = createGenerationSchema.safeParse({
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'INVALID_TYPE',
      brandName: 'TestBrand',
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid types', () => {
    const types = ['FACEBOOK_AD', 'GOOGLE_AD', 'VIDEO_SCRIPT', 'HOOK', 'CTA', 'FULL_CAMPAIGN'];
    types.forEach((type) => {
      const result = createGenerationSchema.safeParse({
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        type,
        brandName: 'TestBrand',
      });
      expect(result.success).toBe(true);
    });
  });
});
