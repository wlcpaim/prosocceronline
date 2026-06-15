import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, Star, Crown } from "lucide-react";

const evolution = [
  { age: "14", overall: 52 },
  { age: "16", overall: 61 },
  { age: "18", overall: 70 },
  { age: "20", overall: 78 },
  { age: "23", overall: 84 },
  { age: "26", overall: 89 },
  { age: "29", overall: 91 },
];

const attributes = [
  { name: "Ritmo", value: 88 },
  { name: "Finalização", value: 84 },
  { name: "Passe", value: 79 },
  { name: "Drible", value: 90 },
  { name: "Defesa", value: 42 },
  { name: "Físico", value: 76 },
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-elevated">
      <div className="text-muted-foreground">{label} anos</div>
      <div className="font-display text-base font-bold text-primary">
        {payload[0].value} OVR
      </div>
    </div>
  );
}

export function PlayerEvolution() {
  const current = evolution[evolution.length - 1].overall;
  const potential = 94;
  const start = evolution[0].overall;
  const gained = useMemo(() => current - start, [current, start]);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-8">
      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-surface-elevated p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-primary" /> Overall atual
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-primary">
            {current}
          </div>
        </div>
        <div className="rounded-2xl bg-surface-elevated p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Crown className="h-3.5 w-3.5 text-accent" /> Potencial
          </div>
          <div className="mt-1 font-display text-3xl font-bold">{potential}</div>
        </div>
        <div className="rounded-2xl bg-surface-elevated p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> Evolução
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-primary">
            +{gained}
          </div>
        </div>
        <div className="rounded-2xl bg-surface-elevated p-4">
          <div className="text-xs text-muted-foreground">Posição</div>
          <div className="mt-1 font-display text-3xl font-bold">PD</div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold">Curva de evolução do Overall</h3>
          <span className="text-xs text-muted-foreground">14 → 29 anos</span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolution} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ovrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.84 0.21 145)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.84 0.21 145)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="age"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "oklch(0.68 0.02 255)", fontSize: 11 }}
              />
              <YAxis
                domain={[40, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "oklch(0.68 0.02 255)", fontSize: 11 }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "oklch(0.3 0.025 255)" }} />
              <Area
                type="monotone"
                dataKey="overall"
                stroke="oklch(0.84 0.21 145)"
                strokeWidth={3}
                fill="url(#ovrGradient)"
                dot={{ r: 3, fill: "oklch(0.84 0.21 145)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attributes */}
      <div className="mt-6 border-t border-border pt-6">
        <h3 className="mb-4 font-display text-sm font-bold">Atributos do jogador</h3>
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {attributes.map((a) => (
            <div key={a.name}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{a.name}</span>
                <span className="font-display font-bold">{a.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${a.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
