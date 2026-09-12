import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, Legend
} from 'recharts';
import { motion, type Variants } from 'motion/react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Sparkles,
  Pause,
  ArrowLeftRight,
  Lightbulb
} from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { detectScoreTrendCallouts, ScoreTrendCallout } from '../utils/trendCallouts';

interface ScoreTrendsChartProps {
  onOpenAddModal?: () => void;
  onOpenCompare?: (testAId?: string, testBId?: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataItem = payload[0]?.payload;
    const callout = dataItem?.callout as ScoreTrendCallout | undefined;

    return (
      <div className="bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl p-3 shadow-xl max-w-xs z-50">
        <p className="text-xs font-black text-[#182235] dark:text-slate-100 mb-1.5 truncate">{label}</p>
        
        <div className="space-y-1">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-[#6f7b90] dark:text-slate-400">{entry.name}:</span>
              </div>
              <span className="font-bold text-[#182235] dark:text-white">{entry.value}</span>
            </div>
          ))}
        </div>

        {/* Consecutive Test Callout Banner inside Tooltip */}
        {callout && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/80">
            <div className={`text-[11px] font-extrabold flex items-center gap-1 ${
              callout.type === 'jump'
                ? 'text-emerald-600 dark:text-emerald-400'
                : callout.type === 'plateau'
                ? 'text-amber-600 dark:text-amber-400'
                : callout.type === 'dip'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-indigo-600 dark:text-indigo-400'
            }`}>
              <span>{callout.type === 'jump' ? '🚀' : callout.type === 'plateau' ? '⏸️' : callout.type === 'dip' ? '📉' : '📈'}</span>
              <span>{callout.title}</span>
            </div>
            <div className="text-[10px] text-[#6f7b90] dark:text-slate-400 mt-0.5">
              {callout.drivers.text}
            </div>
            <div className="text-[10px] font-medium text-slate-700 dark:text-slate-300 mt-1.5 bg-slate-50 dark:bg-slate-700/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-600/50 leading-relaxed">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">Action:</span> {callout.recommendedFocus || callout.actionableGuidance}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      staggerChildren: 0.14,
    },
  },
};

const chartCardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const ScoreTrendsChart: React.FC<ScoreTrendsChartProps> = ({ onOpenAddModal, onOpenCompare }) => {
  const { orderedTests, averageScore, targetScore, resetToSample } = useSAT();
  const [selectedCalloutId, setSelectedCalloutId] = useState<string | null>(null);
  const [calloutFilter, setCalloutFilter] = useState<'all' | 'jump' | 'plateau' | 'dip'>('all');

  // Detect consecutive jumps and plateaus automatically
  const callouts = useMemo(() => detectScoreTrendCallouts(orderedTests), [orderedTests]);

  const jumpsCount = callouts.filter(c => c.type === 'jump').length;
  const plateausCount = callouts.filter(c => c.type === 'plateau').length;
  const dipsCount = callouts.filter(c => c.type === 'dip').length;

  const filteredCallouts = useMemo(() => {
    if (calloutFilter === 'all') return callouts;
    return callouts.filter(c => c.type === calloutFilter);
  }, [callouts, calloutFilter]);

  const totalData = orderedTests.map((t, i) => {
    const callout = callouts.find(c => c.toTest.id === t.id);
    return {
      id: t.id,
      name: t.name || `Test ${i + 1}`,
      'Total Score': t.total,
      'R&W': t.rw,
      'Math': t.math,
      callout,
      test: t,
    };
  });

  const hasData = totalData.length > 0;
  const minTotal = hasData ? Math.max(400, Math.min(...orderedTests.map(t => t.total)) - 60) : 400;
  const maxTotal = hasData ? Math.min(1600, Math.max(...orderedTests.map(t => t.total)) + 80) : 1600;
  const minSection = hasData ? Math.max(200, Math.min(...orderedTests.flatMap(t => [t.rw, t.math])) - 40) : 200;
  const maxSection = hasData ? Math.min(800, Math.max(...orderedTests.flatMap(t => [t.rw, t.math])) + 40) : 800;

  // Calculate net change across recorded tests
  const firstScore = orderedTests[0]?.total;
  const lastScore = orderedTests[orderedTests.length - 1]?.total;
  const scoreDelta = hasData && firstScore !== undefined && lastScore !== undefined ? lastScore - firstScore : 0;

  const shortenLabel = (name: string) => {
    if (name.length > 14) return name.slice(0, 13) + '…';
    return name;
  };

  // Custom SVG Dot Renderer with Jump and Plateau Badges
  const renderCustomTotalDot = (props: any): React.ReactElement<SVGElement> => {
    const { cx, cy, payload, index } = props;
    if (!cx || !cy) {
      return <g key={`dot-empty-${index}`} />;
    }
    const callout = payload?.callout as ScoreTrendCallout | undefined;
    const isSelected = selectedCalloutId && callout && selectedCalloutId === callout.id;

    if (!callout) {
      return (
        <circle
          key={`dot-${index}`}
          cx={cx}
          cy={cy}
          r={4}
          fill="#4f46e5"
        />
      );
    }

    if (callout.type === 'jump') {
      return (
        <g
          key={`dot-${index}`}
          onClick={() => setSelectedCalloutId(prev => prev === callout.id ? null : callout.id)}
          className="cursor-pointer"
        >
          {/* Outer glow ring */}
          <circle
            cx={cx}
            cy={cy}
            r={isSelected ? 13 : 9}
            fill="#10b981"
            fillOpacity={0.25}
            stroke="#10b981"
            strokeWidth={isSelected ? 2.5 : 1.5}
          />
          <circle
            cx={cx}
            cy={cy}
            r={isSelected ? 6 : 4.5}
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth={2}
          />
          {/* Mini jump pill badge */}
          <g transform={`translate(${cx}, ${cy - 18})`}>
            <rect
              x={-19}
              y={-8}
              width={38}
              height={16}
              rx={8}
              fill="#10b981"
            />
            <text
              x={0}
              y={3.5}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={9}
              fontWeight="800"
              fontFamily="sans-serif"
            >
              +{callout.totalDelta}
            </text>
          </g>
        </g>
      );
    }

    if (callout.type === 'plateau') {
      return (
        <g
          key={`dot-${index}`}
          onClick={() => setSelectedCalloutId(prev => prev === callout.id ? null : callout.id)}
          className="cursor-pointer"
        >
          <circle
            cx={cx}
            cy={cy}
            r={isSelected ? 13 : 9}
            fill="#f59e0b"
            fillOpacity={0.25}
            stroke="#f59e0b"
            strokeWidth={isSelected ? 2.5 : 1.5}
          />
          <circle
            cx={cx}
            cy={cy}
            r={isSelected ? 5.5 : 4}
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth={2}
          />
          {/* Mini plateau pill badge */}
          <g transform={`translate(${cx}, ${cy - 18})`}>
            <rect
              x={-24}
              y={-8}
              width={48}
              height={16}
              rx={8}
              fill="#f59e0b"
            />
            <text
              x={0}
              y={3.5}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={8}
              fontWeight="800"
              fontFamily="sans-serif"
            >
              {callout.totalDelta === 0 ? '⏸ 0 pts' : `⏸ ${callout.totalDelta > 0 ? `+${callout.totalDelta}` : callout.totalDelta}`}
            </text>
          </g>
        </g>
      );
    }

    if (callout.type === 'dip') {
      return (
        <g
          key={`dot-${index}`}
          onClick={() => setSelectedCalloutId(prev => prev === callout.id ? null : callout.id)}
          className="cursor-pointer"
        >
          <circle
            cx={cx}
            cy={cy}
            r={isSelected ? 13 : 9}
            fill="#f43f5e"
            fillOpacity={0.25}
            stroke="#f43f5e"
            strokeWidth={isSelected ? 2.5 : 1.5}
          />
          <circle
            cx={cx}
            cy={cy}
            r={isSelected ? 5.5 : 4}
            fill="#f43f5e"
            stroke="#ffffff"
            strokeWidth={2}
          />
          <g transform={`translate(${cx}, ${cy + 18})`}>
            <rect
              x={-18}
              y={-8}
              width={36}
              height={16}
              rx={8}
              fill="#f43f5e"
            />
            <text
              x={0}
              y={3.5}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={9}
              fontWeight="800"
              fontFamily="sans-serif"
            >
              {callout.totalDelta}
            </text>
          </g>
        </g>
      );
    }

    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={4}
        fill="#4f46e5"
      />
    );
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl p-5 shadow-card mb-5 space-y-5"
    >
      {/* Header */}
      <motion.div variants={headerVariants} className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#182235] dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Score Trends & Velocity
            </h2>
            {hasData && orderedTests.length > 1 && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${
                  scoreDelta > 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : scoreDelta < 0
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {scoreDelta > 0 ? (
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                ) : scoreDelta < 0 ? (
                  <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                )}
                {scoreDelta > 0 ? `+${scoreDelta} pts overall` : scoreDelta < 0 ? `${scoreDelta} pts overall` : 'Steady'}
              </span>
            )}
          </div>
          <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5">
            Track test trajectories with automated jump milestones and plateau triage.
          </p>
        </div>

        {/* Actionable Callout Summary Pills */}
        {hasData && orderedTests.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            {jumpsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Zap className="w-3 h-3" />
                <span>{jumpsCount} {jumpsCount === 1 ? 'Jump' : 'Jumps'} (≥+40 pts)</span>
              </span>
            )}
            {plateausCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Pause className="w-3 h-3" />
                <span>{plateausCount} {plateausCount === 1 ? 'Plateau' : 'Plateaus'} (≤±15 pts)</span>
              </span>
            )}
          </div>
        )}
      </motion.div>

      {!hasData ? (
        <motion.div
          variants={chartCardVariants}
          className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-[#f8fafc] dark:bg-slate-800/40 border border-dashed border-[#e5e9f0] dark:border-slate-700"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#2c4160] dark:text-indigo-400 flex items-center justify-center font-black text-xl mb-3">
            📈
          </div>
          <h3 className="text-sm font-extrabold text-[#182235] dark:text-slate-200">
            No Practice Tests Recorded Yet
          </h3>
          <p className="text-xs text-[#6f7b90] dark:text-slate-400 max-w-sm mt-1 mb-4">
            Record a test score or load the official Bluebook test dataset to see score trajectory charts and automatic callouts.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={resetToSample}
              className="px-4 py-2 text-xs font-bold text-[#2c4160] dark:text-indigo-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              Load Sample Bluebook Tests
            </button>
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 text-xs font-bold text-white bg-[#2c4160] dark:bg-indigo-600 rounded-xl hover:bg-[#243955] dark:hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                + Add First Test
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <>
          {/* Dual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Total Score Chart */}
            <motion.div
              variants={chartCardVariants}
              className="bg-[#f8fafc]/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-[#eef2f7] dark:border-slate-800 transition-all hover:border-indigo-100 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs font-extrabold text-[#182235] dark:text-slate-200 flex items-center gap-1.5">
                    <span>Overall SAT Score</span>
                    {callouts.length > 0 && (
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded">
                        Callout badges enabled
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#6f7b90] dark:text-slate-400">400–1600 composite scale</div>
                </div>
                {lastScore && (
                  <div className="text-right">
                    <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">{lastScore}</div>
                    <div className="text-[10px] text-[#6f7b90] dark:text-slate-500">latest</div>
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={totalData} margin={{ top: 26, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:opacity-20" />
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
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      label={{ value: `Goal: ${targetScore}`, position: 'right', fontSize: 9, fill: '#10b981' }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="Total Score"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fill="url(#totalGrad)"
                    dot={renderCustomTotalDot}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    animationBegin={150}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Section Chart */}
            <motion.div
              variants={chartCardVariants}
              className="bg-[#f8fafc]/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-[#eef2f7] dark:border-slate-800 transition-all hover:border-indigo-100 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs font-extrabold text-[#182235] dark:text-slate-200">Section Scores</div>
                  <div className="text-[11px] text-[#6f7b90] dark:text-slate-400">Reading & Writing vs Math (200–800)</div>
                </div>
                {orderedTests[orderedTests.length - 1] && (
                  <div className="text-right flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#2c4160] dark:text-slate-300">
                      R&W: {orderedTests[orderedTests.length - 1].rw}
                    </span>
                    <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                      M: {orderedTests[orderedTests.length - 1].math}
                    </span>
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={totalData} margin={{ top: 12, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:opacity-20" />
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
                    isAnimationActive={true}
                    animationDuration={1100}
                    animationEasing="ease-out"
                    animationBegin={250}
                  />
                  <Line
                    type="monotone"
                    dataKey="Math"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={{ fill: '#0ea5e9', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    animationBegin={350}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* ========================================================= */}
          {/* Automated Consecutive Test Callouts & Remediation Section */}
          {/* ========================================================= */}
          <motion.div
            variants={chartCardVariants}
            className="pt-3 border-t border-[#eef2f7] dark:border-slate-800"
          >
            {/* Callouts Section Header with Filter Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#182235] dark:text-slate-100 flex items-center gap-1.5">
                    <span>Consecutive Test Callouts</span>
                    <span className="text-[10px] font-normal normal-case text-[#6f7b90] dark:text-slate-400">
                      ({callouts.length} detected)
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#6f7b90] dark:text-slate-400">
                    Highlights significant point surges (≥+40 pts) and plateaus (≤±15 pts) with actionable study directives.
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              {callouts.length > 0 && (
                <div className="flex items-center gap-1 bg-[#f6f8fb] dark:bg-slate-800/80 p-1 rounded-xl border border-[#e5e9f0] dark:border-slate-700/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setCalloutFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      calloutFilter === 'all'
                        ? 'bg-white dark:bg-slate-900 text-[#182235] dark:text-white shadow-xs'
                        : 'text-[#6f7b90] dark:text-slate-400 hover:text-[#182235]'
                    }`}
                  >
                    All ({callouts.length})
                  </button>
                  {jumpsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setCalloutFilter('jump')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        calloutFilter === 'jump'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs'
                          : 'text-[#6f7b90] dark:text-slate-400 hover:text-emerald-600'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>Jumps ({jumpsCount})</span>
                    </button>
                  )}
                  {plateausCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setCalloutFilter('plateau')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        calloutFilter === 'plateau'
                          ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-xs'
                          : 'text-[#6f7b90] dark:text-slate-400 hover:text-amber-600'
                      }`}
                    >
                      <Pause className="w-3 h-3" />
                      <span>Plateaus ({plateausCount})</span>
                    </button>
                  )}
                  {dipsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setCalloutFilter('dip')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        calloutFilter === 'dip'
                          ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-xs'
                          : 'text-[#6f7b90] dark:text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      <span>Dips ({dipsCount})</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Callouts Content */}
            {callouts.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs text-[#6f7b90] dark:text-slate-400">
                  {orderedTests.length < 2
                    ? 'Log at least 2 practice tests to view automatic momentum jumps and plateau analysis.'
                    : 'Steady progression across all recorded tests without sharp surges or stagnation.'}
                </p>
              </div>
            ) : filteredCallouts.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs text-[#6f7b90] dark:text-slate-400">
                  No {calloutFilter === 'jump' ? 'point jumps' : calloutFilter === 'plateau' ? 'plateaus' : 'dips'} recorded in this filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCallouts.map(callout => {
                  const isSelected = selectedCalloutId === callout.id;

                  const borderClass =
                    callout.type === 'jump'
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : callout.type === 'plateau'
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
                      : callout.type === 'dip'
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                      : 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20';

                  const badgeClass =
                    callout.type === 'jump'
                      ? 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-300'
                      : callout.type === 'plateau'
                      ? 'bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-300'
                      : callout.type === 'dip'
                      ? 'bg-rose-100 dark:bg-rose-900/70 text-rose-800 dark:text-rose-300'
                      : 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-800 dark:text-indigo-300';

                  return (
                    <div
                      key={callout.id}
                      onClick={() => setSelectedCalloutId(prev => prev === callout.id ? null : callout.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${borderClass} ${
                        isSelected ? 'ring-2 ring-indigo-500 shadow-md scale-[1.01]' : 'hover:shadow-xs'
                      }`}
                    >
                      {/* Top row: Badge + Dates */}
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                            {callout.type === 'jump' && <Zap className="w-3 h-3" />}
                            {callout.type === 'plateau' && <Pause className="w-3 h-3" />}
                            <span>{callout.badgeLabel}</span>
                          </span>
                          <span className="text-[11px] font-extrabold text-[#182235] dark:text-slate-200">
                            {callout.fromTest.total} → {callout.toTest.total}
                          </span>
                        </div>

                        {callout.daysApart !== null && (
                          <span className="text-[10px] text-[#6f7b90] dark:text-slate-400 font-medium">
                            {callout.daysApart === 0 ? 'Same day' : `${callout.daysApart} days apart`}
                          </span>
                        )}
                      </div>

                      {/* Transition label */}
                      <div className="text-xs font-black text-[#182235] dark:text-slate-100 mb-1 truncate">
                        {callout.fromTest.name} → {callout.toTest.name}
                      </div>

                      {/* Section breakdown tags */}
                      <div className="flex items-center gap-2 mb-2.5 flex-wrap text-[11px]">
                        <span className={`font-bold px-2 py-0.5 rounded-md ${
                          callout.rwDelta > 0
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : callout.rwDelta < 0
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          R&W: {callout.rwDelta >= 0 ? `+${callout.rwDelta}` : callout.rwDelta} pts ({callout.fromTest.rw} → {callout.toTest.rw})
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded-md ${
                          callout.mathDelta > 0
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : callout.mathDelta < 0
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          Math: {callout.mathDelta >= 0 ? `+${callout.mathDelta}` : callout.mathDelta} pts ({callout.fromTest.math} → {callout.toTest.math})
                        </span>
                      </div>

                      {/* Actionable Strategy Box */}
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-[#e5e9f0] dark:border-slate-800/80 text-[11px] leading-relaxed mb-2.5">
                        <div className="flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-[#182235] dark:text-slate-100">
                              {callout.type === 'jump' ? 'Consolidate Breakthrough:' : callout.type === 'plateau' ? 'Break The Plateau:' : 'Remediation Step:'}
                            </span>{' '}
                            <span className="text-[#405978] dark:text-slate-300">
                              {callout.actionableGuidance}
                            </span>
                          </div>
                        </div>
                        {callout.recommendedFocus && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            <span className="text-[#6f7b90] dark:text-slate-500 font-normal">Next Focus:</span>
                            <span>{callout.recommendedFocus}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#e5e9f0]/60 dark:border-slate-800/60">
                        <span className="text-[10px] text-[#6f7b90] dark:text-slate-500 font-medium">
                          {isSelected ? '● Highlighted on chart' : 'Click to highlight point'}
                        </span>
                        {onOpenCompare && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCompare(callout.fromTest.id, callout.toTest.id);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                          >
                            <ArrowLeftRight className="w-3 h-3" />
                            <span>Compare both tests</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.section>
  );
};
