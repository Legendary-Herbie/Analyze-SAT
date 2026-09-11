import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, Legend
} from 'recharts';
import { motion, type Variants } from 'motion/react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useSAT } from '../context/SATContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-bold text-[#182235] dark:text-slate-100 mb-1.5 truncate max-w-[180px]">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#6f7b90] dark:text-slate-400">{entry.name}:</span>
            <span className="font-bold text-[#182235] dark:text-white">{entry.value}</span>
          </div>
        ))}
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

export const ScoreTrendsChart: React.FC<{ onOpenAddModal?: () => void }> = ({ onOpenAddModal }) => {
  const { orderedTests, averageScore, targetScore, resetToSample } = useSAT();

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

  // Calculate net change across recorded tests
  const firstScore = orderedTests[0]?.total;
  const lastScore = orderedTests[orderedTests.length - 1]?.total;
  const scoreDelta = hasData && firstScore !== undefined && lastScore !== undefined ? lastScore - firstScore : 0;

  const shortenLabel = (name: string) => {
    if (name.length > 14) return name.slice(0, 13) + '…';
    return name;
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl p-5 shadow-card mb-5"
    >
      <motion.div variants={headerVariants} className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#182235] dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Score Trends
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
            Track whether your scores are improving over time.
          </p>
        </div>
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
            Record a test score or load the official Bluebook test dataset to see score trajectory charts.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={resetToSample}
              className="px-4 py-2 text-xs font-bold text-[#2c4160] dark:text-indigo-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Load Sample Bluebook Tests
            </button>
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 text-xs font-bold text-white bg-[#2c4160] dark:bg-indigo-600 rounded-xl hover:bg-[#243955] dark:hover:bg-indigo-700 transition-colors shadow-sm"
              >
                + Add First Test
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Total Score Chart */}
          <motion.div
            variants={chartCardVariants}
            className="bg-[#f8fafc]/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-[#eef2f7] dark:border-slate-800 transition-all hover:border-indigo-100 dark:hover:border-slate-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs font-extrabold text-[#182235] dark:text-slate-200">Overall SAT Score</div>
                <div className="text-[11px] text-[#6f7b90] dark:text-slate-400">400–1600 composite scale</div>
              </div>
              {lastScore && (
                <div className="text-right">
                  <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">{lastScore}</div>
                  <div className="text-[10px] text-[#6f7b90] dark:text-slate-500">latest</div>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={totalData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
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
                  dot={{ fill: '#4f46e5', r: 4, strokeWidth: 0 }}
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
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={totalData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
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
      )}
    </motion.section>
  );
};

