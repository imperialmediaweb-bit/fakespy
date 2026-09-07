import { useState, type ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';
import type { GenerationType } from '@/types/api';

/** Copies text to the clipboard with visual confirmation. */
export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable (insecure context) — nothing to do */ }
  };
  return (
    <button type="button" onClick={copy} aria-label={copied ? 'Copied' : label} title={label}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

const str = (v: unknown): string => (v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v));
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

function Card({ title, children, copyText }: { title?: string; children: ReactNode; copyText?: string }) {
  return (
    <div className="border border-border rounded-xl bg-card p-5">
      {(title || copyText) && (
        <div className="flex items-center justify-between gap-3 mb-3">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {copyText && <CopyButton text={copyText} />}
        </div>
      )}
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: unknown }) {
  const text = str(value);
  if (!text) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm whitespace-pre-wrap">{text}</p>
      </div>
      <CopyButton text={text} label="" />
    </div>
  );
}

function Notes({ title, text }: { title: string; text: unknown }) {
  const t = str(text);
  if (!t) return null;
  return (
    <div className="border border-primary/20 bg-primary/5 rounded-xl p-4">
      <p className="text-xs font-medium text-primary mb-1">{title}</p>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t}</p>
    </div>
  );
}

function Chips({ items }: { items: unknown[] }) {
  return (
    <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
      {items.map((it, i) => <li key={i} className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted/40">{str(it)}</li>)}
    </ul>
  );
}

function FacebookAd({ ad, index }: { ad: Record<string, unknown>; index?: number }) {
  const full = [ad.headline, ad.primaryText, ad.description, ad.callToAction].map(str).filter(Boolean).join('\n\n');
  return (
    <Card title={index != null ? `Variation ${index + 1}` : 'Facebook Ad'} copyText={full}>
      <Row label="Headline" value={ad.headline} />
      <Row label="Primary text" value={ad.primaryText} />
      <Row label="Description" value={ad.description} />
      <Row label="Call to action" value={ad.callToAction} />
      {ad.targetingNotes ? <p className="text-xs text-muted-foreground mt-2 border-t border-border/50 pt-2">Targeting: {str(ad.targetingNotes)}</p> : null}
    </Card>
  );
}

function GoogleAd({ ad, index }: { ad: Record<string, unknown>; index?: number }) {
  const headlines = arr(ad.headlines);
  const descriptions = arr(ad.descriptions);
  const full = [...headlines.map(str), '', ...descriptions.map(str)].join('\n');
  return (
    <Card title={index != null ? `Ad ${index + 1}` : 'Google Search Ad'} copyText={full}>
      <div className="rounded-lg border border-border/60 bg-background p-4 mb-3">
        <p className="text-xs text-green-500 mb-1">{str(ad.displayUrl) || 'www.example.com'}</p>
        <p className="text-blue-400 text-base leading-snug">{headlines.map(str).join(' | ')}</p>
        <p className="text-sm text-muted-foreground mt-1">{descriptions.map(str).join(' ')}</p>
      </div>
      {headlines.map((h, i) => <Row key={`h${i}`} label={`Headline ${i + 1}`} value={h} />)}
      {descriptions.map((d, i) => <Row key={`d${i}`} label={`Description ${i + 1}`} value={d} />)}
      {arr(ad.sitelinks).length > 0 && <div className="mt-2"><p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Sitelinks</p><Chips items={arr(ad.sitelinks)} /></div>}
    </Card>
  );
}

function VideoScript({ script, index }: { script: Record<string, unknown>; index?: number }) {
  const body = arr(script.body).map(obj);
  const full = [
    `HOOK: ${str(script.hook)}`,
    ...body.map(b => `[${str(b.timestamp)}] VISUAL: ${str(b.visual)} | AUDIO: ${str(b.audio)}`),
    `CTA: ${str(script.callToAction)}`,
  ].join('\n');
  return (
    <Card title={`${index != null ? `Script ${index + 1}` : 'Video Script'}${script.duration ? ` · ${str(script.duration)}` : ''}`} copyText={full}>
      <Row label="Hook (first 3 seconds)" value={script.hook} />
      {body.length > 0 && (
        <table className="w-full text-sm mt-3 border-t border-border/50">
          <thead><tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="text-left py-2 pr-2 w-20">Time</th><th scope="col" className="text-left py-2 pr-2">Visual</th><th scope="col" className="text-left py-2">Audio / VO</th>
          </tr></thead>
          <tbody>{body.map((b, i) => (
            <tr key={i} className="border-t border-border/40 align-top">
              <td className="py-2 pr-2 font-mono text-xs text-primary whitespace-nowrap">{str(b.timestamp)}</td>
              <td className="py-2 pr-2 text-muted-foreground">{str(b.visual)}</td>
              <td className="py-2">{str(b.audio)}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
      <Row label="Call to action" value={script.callToAction} />
      {script.musicDirection ? <p className="text-xs text-muted-foreground mt-2">Music: {str(script.musicDirection)}</p> : null}
    </Card>
  );
}

function HookList({ hooks }: { hooks: Record<string, unknown>[] }) {
  return (
    <Card title={`${hooks.length} Hooks`} copyText={hooks.map(h => str(h.text)).join('\n')}>
      <ol className="space-y-2 list-decimal pl-5">
        {hooks.map((h, i) => (
          <li key={i} className="text-sm">
            <div className="flex items-start justify-between gap-3">
              <span>{str(h.text)}</span>
              <CopyButton text={str(h.text)} label="" />
            </div>
            <p className="text-xs text-muted-foreground">{[str(h.type), str(h.bestFor)].filter(Boolean).join(' · ')}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function CtaList({ ctas }: { ctas: Record<string, unknown>[] }) {
  const urgencyColor: Record<string, string> = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-green-400' };
  return (
    <Card title={`${ctas.length} Calls to Action`} copyText={ctas.map(c => str(c.text)).join('\n')}>
      <ul className="space-y-2">
        {ctas.map((c, i) => (
          <li key={i} className="flex items-start justify-between gap-3 text-sm">
            <div>
              <span className="font-medium">{str(c.text)}</span>
              <p className="text-xs text-muted-foreground">
                {str(c.type)}{c.urgency ? <> · <span className={urgencyColor[str(c.urgency)] || ''}>{str(c.urgency)} urgency</span></> : null}{c.context ? ` · ${str(c.context)}` : ''}
              </p>
            </div>
            <CopyButton text={str(c.text)} label="" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function FullCampaign({ out }: { out: Record<string, unknown> }) {
  const audience = obj(out.targetAudience);
  const video = obj(out.videoScript);
  return (
    <div className="space-y-4">
      <Card title={str(out.campaignName) || 'Campaign'}>
        <Row label="Objective" value={out.objective} />
        {Object.keys(audience).length > 0 && (
          <div className="mt-2"><p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Target audience</p>
            {Object.entries(audience).map(([k, v]) => <p key={k} className="text-sm"><span className="text-muted-foreground capitalize">{k}:</span> {str(v)}</p>)}
          </div>
        )}
      </Card>
      {Object.keys(obj(out.facebookAd)).length > 0 && <FacebookAd ad={obj(out.facebookAd)} />}
      {Object.keys(obj(out.googleAd)).length > 0 && <GoogleAd ad={obj(out.googleAd)} />}
      {Object.keys(video).length > 0 && (
        <Card title={`Video Script${video.duration ? ` · ${str(video.duration)}` : ''}`}>
          <Row label="Hook" value={video.hook} /><Row label="Key message" value={video.keyMessage} /><Row label="Call to action" value={video.callToAction} />
        </Card>
      )}
      {arr(out.hooks).length > 0 && <Card title="Hooks" copyText={arr(out.hooks).map(str).join('\n')}><ol className="list-decimal pl-5 space-y-1 text-sm">{arr(out.hooks).map((h, i) => <li key={i}>{str(h)}</li>)}</ol></Card>}
      {arr(out.ctas).length > 0 && <Card title="CTAs" copyText={arr(out.ctas).map(str).join('\n')}><Chips items={arr(out.ctas)} /></Card>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Notes title="Budget suggestion" text={out.budgetSuggestion} />
        {arr(out.kpis).length > 0 && <Card title="KPIs"><Chips items={arr(out.kpis)} /></Card>}
      </div>
    </div>
  );
}

/**
 * Renders generated ad output as readable, copyable cards per generation type.
 * Falls back to formatted JSON for unrecognised shapes (e.g. a parse failure).
 */
export function AdOutput({ type, output }: { type: GenerationType; output: unknown }) {
  const out = obj(output);
  const raw = <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-[600px] text-muted-foreground border border-border rounded-xl bg-card p-4">{JSON.stringify(output, null, 2)}</pre>;

  if (out.parseError || out.rawContent) {
    return <div className="space-y-2"><p className="text-xs text-yellow-400">The AI response could not be parsed into structured fields — showing raw output.</p>{raw}</div>;
  }

  switch (type) {
    case 'FACEBOOK_AD': {
      const ads = arr(out.ads).map(obj);
      if (!ads.length) return raw;
      return <div className="space-y-4">{ads.map((a, i) => <FacebookAd key={i} ad={a} index={i} />)}<Notes title="Strategy notes" text={out.strategyNotes} /></div>;
    }
    case 'GOOGLE_AD': {
      const ads = arr(out.searchAds).map(obj);
      if (!ads.length) return raw;
      return <div className="space-y-4">{ads.map((a, i) => <GoogleAd key={i} ad={a} index={i} />)}<Notes title="Strategy notes" text={out.strategyNotes} /></div>;
    }
    case 'VIDEO_SCRIPT': {
      const scripts = arr(out.scripts).map(obj);
      if (!scripts.length) return raw;
      return <div className="space-y-4">{scripts.map((s, i) => <VideoScript key={i} script={s} index={i} />)}<Notes title="Production notes" text={out.productionNotes} /></div>;
    }
    case 'HOOK': {
      const hooks = arr(out.hooks).map(obj);
      return hooks.length ? <HookList hooks={hooks} /> : raw;
    }
    case 'CTA': {
      const ctas = arr(out.ctas).map(obj);
      return ctas.length ? <CtaList ctas={ctas} /> : raw;
    }
    case 'FULL_CAMPAIGN':
      return Object.keys(out).length ? <FullCampaign out={out} /> : raw;
    default:
      return raw;
  }
}
