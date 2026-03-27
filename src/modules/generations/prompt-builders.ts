import { CreateGenerationInput } from '../../validators/generation.validators';

const BASE_SYSTEM = `You are an expert advertising copywriter and creative director.
You create high-converting, professional ad content.
Always respond with valid JSON matching the required schema.
Be specific, creative, and actionable. Avoid generic filler.`;

interface PromptPair {
  systemPrompt: string;
  userPrompt: string;
}

function buildContext(input: CreateGenerationInput): string {
  const parts = [
    `Brand: ${input.brandName}`,
    input.niche ? `Industry/Niche: ${input.niche}` : null,
    input.audience ? `Target Audience: ${input.audience}` : null,
    input.tone ? `Tone: ${input.tone}` : null,
    input.objective ? `Objective: ${input.objective}` : null,
    input.competitorContext ? `Competitor Context: ${input.competitorContext}` : null,
    input.additionalInstructions ? `Additional Instructions: ${input.additionalInstructions}` : null,
  ].filter(Boolean);

  return parts.join('\n');
}

export function buildFacebookAdPrompt(input: CreateGenerationInput): PromptPair {
  return {
    systemPrompt: `${BASE_SYSTEM}
You specialize in Facebook/Meta advertising copy that drives engagement and conversions.`,
    userPrompt: `Create 3 Facebook ad variations for the following:

${buildContext(input)}

Respond with JSON:
{
  "ads": [
    {
      "headline": "...",
      "primaryText": "...",
      "description": "...",
      "callToAction": "...",
      "targetingNotes": "..."
    }
  ],
  "strategyNotes": "Brief notes on the creative strategy"
}`,
  };
}

export function buildGoogleAdPrompt(input: CreateGenerationInput): PromptPair {
  return {
    systemPrompt: `${BASE_SYSTEM}
You specialize in Google Ads (Search & Display) that maximize click-through and conversion rates.`,
    userPrompt: `Create 3 Google Ad variations for the following:

${buildContext(input)}

Respond with JSON:
{
  "searchAds": [
    {
      "headlines": ["headline1", "headline2", "headline3"],
      "descriptions": ["desc1", "desc2"],
      "displayUrl": "...",
      "sitelinks": ["link1", "link2"]
    }
  ],
  "strategyNotes": "Brief notes on keyword and bidding strategy"
}`,
  };
}

export function buildVideoScriptPrompt(input: CreateGenerationInput): PromptPair {
  return {
    systemPrompt: `${BASE_SYSTEM}
You specialize in video ad scripts for social media (15s, 30s, 60s formats).`,
    userPrompt: `Create a video ad script for the following:

${buildContext(input)}

Respond with JSON:
{
  "scripts": [
    {
      "duration": "30s",
      "hook": "Opening 3 seconds - attention grabber",
      "body": [
        { "timestamp": "0-3s", "visual": "...", "audio": "..." },
        { "timestamp": "3-10s", "visual": "...", "audio": "..." },
        { "timestamp": "10-25s", "visual": "...", "audio": "..." },
        { "timestamp": "25-30s", "visual": "...", "audio": "..." }
      ],
      "callToAction": "...",
      "musicDirection": "..."
    }
  ],
  "productionNotes": "..."
}`,
  };
}

export function buildHookPrompt(input: CreateGenerationInput): PromptPair {
  return {
    systemPrompt: `${BASE_SYSTEM}
You specialize in creating scroll-stopping hooks for social media ads.`,
    userPrompt: `Create 10 powerful hooks/opening lines for ads for the following:

${buildContext(input)}

Respond with JSON:
{
  "hooks": [
    {
      "text": "...",
      "type": "question|statement|statistic|story|challenge|curiosity",
      "bestFor": "platform or format this hook works best for"
    }
  ]
}`,
  };
}

export function buildCtaPrompt(input: CreateGenerationInput): PromptPair {
  return {
    systemPrompt: `${BASE_SYSTEM}
You specialize in creating compelling calls-to-action that drive conversions.`,
    userPrompt: `Create 10 compelling CTAs for the following:

${buildContext(input)}

Respond with JSON:
{
  "ctas": [
    {
      "text": "...",
      "type": "button|text|banner",
      "urgency": "low|medium|high",
      "context": "Where this CTA works best"
    }
  ]
}`,
  };
}

export function buildFullCampaignPrompt(input: CreateGenerationInput): PromptPair {
  return {
    systemPrompt: `${BASE_SYSTEM}
You create comprehensive multi-platform ad campaigns.`,
    userPrompt: `Create a full ad campaign brief for the following:

${buildContext(input)}

Respond with JSON:
{
  "campaignName": "...",
  "objective": "...",
  "targetAudience": {
    "demographics": "...",
    "interests": "...",
    "behaviors": "..."
  },
  "facebookAd": {
    "headline": "...",
    "primaryText": "...",
    "description": "...",
    "callToAction": "..."
  },
  "googleAd": {
    "headlines": ["...", "...", "..."],
    "descriptions": ["...", "..."]
  },
  "videoScript": {
    "duration": "30s",
    "hook": "...",
    "keyMessage": "...",
    "callToAction": "..."
  },
  "hooks": ["...", "...", "..."],
  "ctas": ["...", "...", "..."],
  "budgetSuggestion": "...",
  "kpis": ["...", "...", "..."]
}`,
  };
}

export function getPromptBuilder(type: string): (input: CreateGenerationInput) => PromptPair {
  switch (type) {
    case 'FACEBOOK_AD': return buildFacebookAdPrompt;
    case 'GOOGLE_AD': return buildGoogleAdPrompt;
    case 'VIDEO_SCRIPT': return buildVideoScriptPrompt;
    case 'HOOK': return buildHookPrompt;
    case 'CTA': return buildCtaPrompt;
    case 'FULL_CAMPAIGN': return buildFullCampaignPrompt;
    default: throw new Error(`Unsupported generation type: ${type}`);
  }
}
