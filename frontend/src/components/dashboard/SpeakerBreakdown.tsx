"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TranscriptSegment } from "@/types/analysis";

interface Props {
  segments: TranscriptSegment[];
}

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#F43F5E", "#06B6D4", "#EC4899"];

export default function SpeakerBreakdown({ segments }: Props) {
  // Count segments per speaker
  const speakerMap: Record<string, number> = {};
  segments.forEach((seg) => {
    speakerMap[seg.speaker_label] = (speakerMap[seg.speaker_label] || 0) + 1;
  });

  const data = Object.entries(speakerMap)
    .map(([name, count]) => ({
      name,
      segments: count,
      percentage: Math.round((count / segments.length) * 100),
    }))
    .sort((a, b) => b.segments - a.segments);

  if (data.length === 0) return null;

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        👥 Speaker Participation
      </h2>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#1E293B",
                border: "1px solid rgba(148,163,184,0.15)",
                borderRadius: "10px",
                color: "#F1F5F9",
                fontSize: "13px",
              }}
              formatter={(value, _name, props) => {
                const pct = (props as { payload?: { percentage?: number } })?.payload?.percentage ?? 0;
                return [`${value} segments (${pct}%)`, "Participation"];
              }}
              cursor={{ fill: "rgba(59,130,246,0.08)" }}
            />
            <Bar dataKey="segments" radius={[0, 6, 6, 0]} barSize={24}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {data.map((speaker, i) => (
          <div key={speaker.name} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            {speaker.name}: {speaker.percentage}%
          </div>
        ))}
      </div>
    </div>
  );
}
