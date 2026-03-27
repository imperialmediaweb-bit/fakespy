import { describe, it, expect } from 'vitest';
import {
  getPromptBuilder,
  buildFacebookAdPrompt,
  buildGoogleAdPrompt,
  buildVideoScriptPrompt,
  buildHookPrompt,
  buildCtaPrompt,
  buildFullCampaignPrompt,
} from '../../src/modules/generations/prompt-builders';

const baseInput = {
  projectId: '550e8400-e29b-41d4-a716-446655440000',
  type: 'FACEBOOK_AD' as const,
  brandName: 'TestBrand',
  niche: 'SaaS',
  audience: 'Small business owners',
  tone: 'professional',
  objective: 'Lead generation',
};

describe('Prompt Builders', () => {
  it('should build Facebook ad prompt with all context', () => {
    const { systemPrompt, userPrompt } = buildFacebookAdPrompt(baseInput);

    expect(systemPrompt).toContain('Facebook');
    expect(userPrompt).toContain('TestBrand');
    expect(userPrompt).toContain('SaaS');
    expect(userPrompt).toContain('Small business owners');
    expect(userPrompt).toContain('JSON');
  });

  it('should build Google ad prompt', () => {
    const { systemPrompt, userPrompt } = buildGoogleAdPrompt(baseInput);
    expect(systemPrompt).toContain('Google');
    expect(userPrompt).toContain('headlines');
  });

  it('should build video script prompt', () => {
    const { userPrompt } = buildVideoScriptPrompt(baseInput);
    expect(userPrompt).toContain('video');
    expect(userPrompt).toContain('timestamp');
  });

  it('should build hook prompt', () => {
    const { userPrompt } = buildHookPrompt(baseInput);
    expect(userPrompt).toContain('hooks');
    expect(userPrompt).toContain('10');
  });

  it('should build CTA prompt', () => {
    const { userPrompt } = buildCtaPrompt(baseInput);
    expect(userPrompt).toContain('CTA');
  });

  it('should build full campaign prompt', () => {
    const { userPrompt } = buildFullCampaignPrompt(baseInput);
    expect(userPrompt).toContain('campaign');
    expect(userPrompt).toContain('facebookAd');
    expect(userPrompt).toContain('googleAd');
  });

  it('should return correct builder for each type', () => {
    expect(getPromptBuilder('FACEBOOK_AD')).toBe(buildFacebookAdPrompt);
    expect(getPromptBuilder('GOOGLE_AD')).toBe(buildGoogleAdPrompt);
    expect(getPromptBuilder('VIDEO_SCRIPT')).toBe(buildVideoScriptPrompt);
    expect(getPromptBuilder('HOOK')).toBe(buildHookPrompt);
    expect(getPromptBuilder('CTA')).toBe(buildCtaPrompt);
    expect(getPromptBuilder('FULL_CAMPAIGN')).toBe(buildFullCampaignPrompt);
  });

  it('should throw for unsupported type', () => {
    expect(() => getPromptBuilder('INVALID')).toThrow('Unsupported generation type');
  });

  it('should handle minimal input (only required fields)', () => {
    const minimalInput = {
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'HOOK' as const,
      brandName: 'MinBrand',
    };

    const { userPrompt } = buildHookPrompt(minimalInput);
    expect(userPrompt).toContain('MinBrand');
    expect(userPrompt).not.toContain('undefined');
  });
});
