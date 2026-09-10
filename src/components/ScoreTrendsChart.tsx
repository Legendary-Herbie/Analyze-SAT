import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, Legend
} from 'recharts';
import { useSAT } from '../context/SATContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#e5e9f0] rounded-xl p-3 shadow-lg">
        <p className="text-xs font-bold text-[#182235] mb-1.5 truncate max-w-[180px]">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#6f7b90]">{entry.name}:</span>
            <span className="font-bold text-[#182235]">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ScoreTrendsChart: React.FC = () => {
  const { orderedTests, averageScore, targetScore } = useSAT();

  const totalData = orderedTests.map((t, i) => ({
    name: t.name || `Test ${i + 1}`,
    'Total Score': t.total,
    'R&W': t.rw,
    'Math': t.math,
  }));

  const hasData = totalData.length > 0;
  const minTotal = hasData ? Math.max(400, Math.min(...orderedTests.map(t => t.total)) - 60) : 400;
  const maxTotal = hasData ? Math.min(1600, Math.max(...orderedTests.map(t => t.total)) + 60) : 1600;
  const minSection = hasData ? Math.max(200, Math.min(...orderedTests.flatMap(t => [t.rw, t.math])) - 40) : 200;
  const maxSection = hasData ? Math.min(800, Math.max(...orderedTests.flatMap(t => [t.rw, t.math])) + 40) : 800;

  const shortenLabel = (name: string) => {
    if (name.length > 14) return name.slice(0, 13) + '…';
    return name;
  };

  return (
    <section className="bg-white border border-[#e5e9f0] rounded-2xl p-5 shadow-card mb-5">
      <div className="mb-4">
        <h2 className="text-base font-extrabold text-[#182235]">Score Trends</h2>
        <p className="text-xs text-[#6f7b90] mt-0.5">Track whether your scores are improving over time.</p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-[180px] text-sm text-[#6f7b90]">
          Add tests to see your score trends
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Total Score Chart */}
          <div>
            <div className="text-xs font-extrabold text-[#182235] mb-1">Overall SAT Score</div>
            <div className="text-[11px] text-[#6f7b90] mb-3">400–1600 scale</div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={totalData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2c4160" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2c4160" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf0f4" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickFormatter={shortenLabel}
                  tick={{ fontSize: 10, fill: '#6f7b90' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[minTotal, maxTotal]}
                  tick={{ fontSize: 10, fill: '#6f7b90' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                {averageScore && (
                  <ReferenceLine
                    y={averageScore}
                    stroke="#6f7b90"
                    strokeDasharray="4 4"
                    label={{ value: `Avg: ${averageScore}`, position: 'right', fontSize: 9, fill: '#6f7b90' }}
                  />
                )}
                {targetScore && (
                  <ReferenceLine
                    y={targetScore}
                    stroke="#18745a"
                    strokeDasharray="4 4"
                    label={{ value: `Goal: ${targetScore}`, position: 'right', fontSize: 9, fill: '#18745a' }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="Total Score"
                  stroke="#2c4160"
                  strokeWidth={2.5}
                  fill="url(#totalGrad)"
                  dot={{ fill: '#2c4160', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Section Chart */}
          <div>
            <div className="text-xs font-extrabold text-[#182235] mb-1">Section Scores</div>
            <div className="text-[11px] text-[#6f7b90] mb-3">Reading & Writing vs Math (200–800)</div>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={totalData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf0f4" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickFormatter={shortenLabel}
                  tick={{ fontSize: 10, fill: '#6f7b90' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[minSection, maxSection]}
                  tick={{ fontSize: 10, fill: '#6f7b90' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 10, color: '#6f7b90', paddingTop: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="R&W"
                  stroke="#2c4160"
                  strokeWidth={2.5}
                  dot={{ fill: '#2c4160', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="Math"
                  stroke="#8796aa"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ fill: '#8796aa', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
};
