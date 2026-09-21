import React, { useState } from 'react';
import { Menu, PlusCircle, ShieldAlert, Sparkles, Printer, FileText, Bot, Languages } from 'lucide-react';
import { getLanguage, setLanguage, t } from '../services/i18n';

export default function Header({
  activeTab,
  onNavigate,
  systemConfig,
  setIsMobileOpen,
  onPrint,
  hasActiveInspection,
  onOpenCopilot,
}) {
  const titles = {
    dashboard: { title: t('header.dashboard.title'), subtitle: t('header.dashboard.subtitle') },
    'new-inspection': { title: t('header.newInspection.title'), subtitle: t('header.newInspection.subtitle') },
    analysis: { title: t('header.analysis.title'), subtitle: t('header.analysis.subtitle') },
    results: { title: t('header.results.title'), subtitle: t('header.results.subtitle') },
    history: { title: t('header.history.title'), subtitle: t('header.history.subtitle') },
    reports: { title: t('header.reports.title'), subtitle: t('header.reports.subtitle') },
    settings: { title: t('header.settings.title'), subtitle: t('header.settings.subtitle') },
    admin: { title: t('header.admin.title'), subtitle: t('header.admin.subtitle') },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
      {/* Left Title & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {current.title}
          </h2>
          <p className="text-xs text-slate-400 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Language Toggle */}
        <button
          onClick={() => {
            const newLang = getLanguage() === 'en' ? 'hi' : 'en';
            setLanguage(newLang);
            window.dispatchEvent(new Event('languageChange'));
            window.location.reload();
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-lg shadow-sm transition-all"
          title="Switch Language / भाषा बदलें"
        >
          <Languages size={14} />
          <span className="hidden sm:inline">{getLanguage() === 'en' ? 'हिन्दी' : 'EN'}</span>
        </button>
        {/* LM-Copilot AI Button */}
        <button
          onClick={onOpenCopilot}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 rounded-lg shadow-sm transition-all"
          title="Ask AI LM Legal Copilot"
        >
          <Bot size={15} className="text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">LM-Copilot AI</span>
        </button>

        {/* Print Button (active on results/reports) */}
        {(activeTab === 'results' || activeTab === 'reports') && onPrint && (
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer size={14} className="text-slate-400" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
        )}

        {/* View Full Report Button if on Results tab */}
        {activeTab === 'results' && hasActiveInspection && (
          <button
            onClick={() => onNavigate('reports')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-lg transition-colors"
          >
            <FileText size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">View Statutory Report</span>
          </button>
        )}

        {/* Active Inspection Quick Switch */}
        {hasActiveInspection && activeTab !== 'results' && activeTab !== 'analysis' && (
          <button
            onClick={() => onNavigate('results')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-lg shadow-sm transition-all"
            title="Return to Active Inspection Results"
          >
            <ShieldAlert size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Active Assessment</span>
          </button>
        )}

        {/* Prominent + New Inspection Button */}
        {activeTab !== 'new-inspection' && activeTab !== 'analysis' && (
          <button
            onClick={() => onNavigate('new-inspection')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md transition-all duration-150 hover:shadow-lg"
          >
            <PlusCircle size={14} className="text-slate-950" />
            <span>+ New Inspection</span>
          </button>
        )}
      </div>
    </header>
  );
}
