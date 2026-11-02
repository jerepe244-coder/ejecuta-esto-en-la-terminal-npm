'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';

interface IndustryItem {
  name: string;
  value: number;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#71717a', // zinc
];

export function IndustryChart({ data }: { data: IndustryItem[] }) {
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0);

  return (
    <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-lg flex flex-col">
      <CardHeader className="pb-2 border-b border-zinc-800/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-blue-400" />
            Distribución por Industria
          </CardTitle>
          <span className="text-[11px] font-mono text-zinc-500">
            {hasData ? `${data.reduce((a, b) => a + b.value, 0)} prospectos` : '0 datos'}
          </span>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Proporción de prospectos clasificados por nicho o rubro
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center pt-6 pb-2 min-h-[300px]">
        {hasData ? (
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#18181b"
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      return (
                        <div className="bg-zinc-950/95 border border-zinc-800 rounded-lg p-2.5 shadow-xl text-xs">
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-blue-400 font-mono mt-0.5">
                            {item.value} prospecto{item.value === 1 ? '' : 's'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-zinc-300 font-medium ml-1 mr-2">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 px-4 space-y-2">
            <div className="w-12 h-12 rounded-full bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center mx-auto text-zinc-500">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-zinc-300">Sin datos de industrias</p>
            <p className="text-xs text-zinc-500 max-w-xs">
              Los prospectos escaneados aparecerán agrupados aquí según su rubro comercial.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
