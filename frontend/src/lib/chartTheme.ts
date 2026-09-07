/**
 * Single source of truth for Recharts styling, aligned with the tokens in
 * index.css (Recharts needs concrete color strings, not CSS variables).
 */
export const chartTheme = {
  primary: 'hsl(262 83% 58%)',
  primaryFill: 'hsl(262 83% 58% / 0.15)',
  series: ['hsl(262 83% 58%)', 'hsl(271 91% 65%)', 'hsl(270 95% 75%)', 'hsl(263 70% 50%)', 'hsl(258 90% 66%)', 'hsl(268 100% 92%)'],
  axisTick: { fill: 'hsl(215 20% 55%)', fontSize: 12 },
  tooltip: {
    contentStyle: {
      backgroundColor: 'hsl(224 71% 6%)',
      border: '1px solid hsl(216 34% 17%)',
      borderRadius: 8,
      color: 'hsl(213 31% 91%)',
    },
    itemStyle: { color: 'hsl(213 31% 91%)' },
    labelStyle: { color: 'hsl(215 20% 55%)' },
  },
} as const;
