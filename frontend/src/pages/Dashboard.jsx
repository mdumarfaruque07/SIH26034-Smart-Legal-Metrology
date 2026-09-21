import React from 'react';
import {
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
  Layers,
  ChevronRight,
  Package,
  Bot,
  Trophy,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { DEMO_PRODUCTS } from '../data/demoSamples';
import { t } from '../services/i18n';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

export default function Dashboard({
  inspections = [],
  officer,
  onNavigate,
  onSelectInspection,
  onStartDemoInspection,
  systemConfig,
  onOpenCopilot,
}) {
  // Aggregate statistics
  const totalCount = inspections.length;
  const compliantCount = inspections.filter(
    (i) => i.status === 'COMPLIANT'
  ).length;
  const nonCompliantCount = inspections.filter(
    (i) => i.status === 'NON_COMPLIANT'
  ).length;
  const reviewCount = inspections.filter(
    (i) => i.status === 'NEEDS_REVIEW'
  ).length;

  // Chart data
  const pieData = [
    { name: 'Compliant', value: compliantCount || 0, color: '#34d399' },
    { name: 'Non-Compliant', value: nonCompliantCount || 0, color: '#f87171' },
    { name: 'Needs Review', value: reviewCount || 0, color: '#fbbf24' },
  ].filter(d => d.value > 0);

  // Score distribution for bar chart
  const scoreRanges = [
    { range: '0-20', min: 0, max: 20, fill: '#ef4444' },
    { range: '21-40', min: 21, max: 40, fill: '#f97316' },
    { range: '41-60', min: 41, max: 60, fill: '#eab308' },
    { range: '61-80', min: 61, max: 80, fill: '#22c55e' },
    { range: '81-100', min: 81, max: 100, fill: '#06b6d4' },
  ];
  const scoreData = scoreRanges.map(r => ({
    range: r.range,
    count: inspections.filter(i => i.score >= r.min && i.score <= r.max).length,
    fill: r.fill,
  }));

  // Top failed rules
  const ruleFailCounts = {};
  inspections.forEach(insp => {
    (insp.checks || []).forEach(check => {
      if (check.status === 'FAIL') {
        const label = check.rule_id || check.rule_name || 'Unknown';
        ruleFailCounts[label] = (ruleFailCounts[label] || 0) + 1;
      }
    });
  });
  const topFailedRules = Object.entries(ruleFailCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([rule, count]) => ({ rule, count }));

  const avgScore = totalCount > 0
    ? Math.round(inspections.reduce((sum, i) => sum + (i.score || 0), 0) / totalCount)
    : 0;

  const complianceRate = totalCount > 0
    ? Math.round((compliantCount / totalCount) * 100)
    : 0;

  const statCards = [
    {
      label: t('dashboard.totalInspections'),
      value: totalCount,
      icon: Layers,
      textColor: 'text-white',
      bgColor: 'bg-slate-900/80',
      borderColor: 'border-slate-800',
      iconColor: 'text-indigo-400',
    },
    {
      label: t('dashboard.compliant'),
      value: compliantCount,
      icon: CheckCircle2,
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      label: t('dashboard.nonCompliant'),
      value: nonCompliantCount,
      icon: XCircle,
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      iconColor: 'text-rose-400',
    },
    {
      label: t('dashboard.needsReview'),
      value: reviewCount,
      icon: AlertTriangle,
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs">
          <p className="font-bold text-white">{payload[0].name || payload[0].payload?.range}</p>
          <p className="text-slate-300">{payload[0].value} inspection{payload[0].value !== 1 ? 's' : ''}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-indigo-500/20">
        {/* Subtle background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Trophy size={14} className="text-amber-400" />
                <span>Smart India Hackathon SIH26034 Suite</span>
              </div>
              {officer && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{officer.role === 'admin' ? '🏛️ All Department Records' : `👤 ${officer.name} (${officer.officer_id})`}</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('dashboard.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenCopilot}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 shadow-lg transition-all"
            >
              <Bot size={16} className="text-indigo-400 animate-pulse" />
              <span>{t('dashboard.askCopilot')}</span>
            </button>

            <button
              onClick={() => onNavigate('new-inspection')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl transition-all"
            >
              <PlusCircle size={16} />
              <span>{t('dashboard.newInspection')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${stat.borderColor} ${stat.bgColor} backdrop-blur-md shadow-lg transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </span>
                <Icon size={18} className={stat.iconColor} />
              </div>
              <div className={`text-2xl sm:text-3xl font-black mt-2 ${stat.textColor}`}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Section */}
      {totalCount > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Compliance Distribution Pie Chart */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white">{t('dashboard.complianceDist')}</h3>
            </div>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-400 font-medium">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
            {/* Center stats */}
            <div className="text-center mt-3 pt-3 border-t border-slate-800">
              <div className="text-2xl font-black text-white">{complianceRate}%</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('dashboard.complianceRate')}</div>
            </div>
          </div>

          {/* Score Distribution Bar Chart */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white">{t('dashboard.scoreDist')}</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {scoreData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-3 pt-3 border-t border-slate-800">
              <div className="text-2xl font-black text-white">{avgScore}%</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('dashboard.avgScore')}</div>
            </div>
          </div>

          {/* Top Failed Rules */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={16} className="text-rose-400" />
              <h3 className="text-sm font-bold text-white">Top Violation Rules</h3>
            </div>
            {topFailedRules.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No violations detected yet</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 mt-2">
                {topFailedRules.map((item, i) => {
                  const maxCount = topFailedRules[0]?.count || 1;
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-amber-400 truncate max-w-[140px]">{item.rule}</span>
                        <span className="text-slate-400 font-bold">{item.count}×</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="text-center mt-3 pt-3 border-t border-slate-800">
              <div className="text-2xl font-black text-white">{Object.keys(ruleFailCounts).length}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Unique Violations</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Demo Evaluation Panel */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                INSTANT DEMO EVALUATION
              </span>
              <h3 className="text-sm font-bold text-white">
                Pre-configured Demonstration Scenarios
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sample commodity packages processed through Gemini Vision AI and the 12 deterministic Legal Metrology rules engine.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_PRODUCTS.map((prod) => {
            const isCompliant = prod.id === 'sample_compliant';
            return (
              <div
                key={prod.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                        {prod.category} Pack
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {prod.name}
                      </h4>
                    </div>
                    <StatusBadge status={prod.expected_status} size="sm" />
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {prod.description}
                  </p>

                  <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
                    {prod.highlights.slice(0, 3).map((hl, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isCompliant ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Expected Score: <strong className="text-white">{prod.score_estimate}</strong>
                  </span>
                  <button
                    onClick={() => onStartDemoInspection(prod.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg transition-all"
                  >
                    <span>Run AI Inspection</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Recent Enforcement Inspections
            </h3>
          </div>
          {inspections.length > 0 && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View All Audit Trail ({inspections.length})</span>
              <ChevronRight size={12} />
            </button>
          )}
        </div>

        {inspections.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-indigo-400 mb-3">
              <Package size={22} />
            </div>
            <h4 className="text-sm font-bold text-white">No inspections logged yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Upload a packaged commodity label image or run a demo scenario to begin automated compliance screening.
            </p>
            <button
              onClick={() => onNavigate('new-inspection')}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all"
            >
              <PlusCircle size={14} />
              <span>Start First Inspection</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-6">Inspection ID</th>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Compliance Status</th>
                  <th className="py-3 px-6">Screening Score</th>
                  <th className="py-3 px-6">Date / Time</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {inspections.slice(0, 8).map((insp) => (
                  <tr
                    key={insp.inspection_id}
                    onClick={() => onSelectInspection(insp)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-6 font-mono font-bold text-amber-400">
                      <div className="flex items-center gap-2">
                        <span>{insp.inspection_id}</span>
                        {insp.is_demo && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-white">
                        {insp.product?.product_name || insp.product?.generic_name || 'Packaged Commodity'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {insp.product?.manufacturer?.name || 'Manufacturer Unverified'}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-300">
                      {insp.category || insp.product?.category || 'General'}
                    </td>
                    <td className="py-3.5 px-6">
                      <StatusBadge status={insp.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-mono font-bold text-white">
                        {insp.score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 font-mono text-[11px]">
                      {new Date(insp.created_at || Date.now()).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 text-xs">
                        <span>Inspect</span>
                        <ArrowUpRight size={13} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

