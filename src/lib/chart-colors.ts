export const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(215 20% 65%)",
  accent: "hsl(262 83% 58%)",
  success: "hsl(142 71% 45%)",
  warning: "hsl(38 92% 50%)",
} as const;

export const CHART_GRID = "hsl(var(--chart-grid))";
export const CHART_TOOLTIP = {
  contentStyle: {
    borderRadius: 12,
    fontSize: 13,
    backgroundColor: "hsl(var(--popover))",
    color: "hsl(var(--popover-foreground))",
    border: "1px solid hsl(var(--border))",
  },
  labelStyle: { fontWeight: 600 },
} as const;
