import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  FileText,
  Settings,
  UserCheck,
  LogOut,
  Shield,
  Layers,
  ChevronRight,
  Trophy,
  Bot,
  Crown,
} from 'lucide-react';
import { t } from '../services/i18n';

export default function Sidebar({
  activeTab,
  onNavigate,
  officer,
  onLogout,
  systemConfig,
  isMobileOpen,
  setIsMobileOpen,
  onOpenCopilot,
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'new-inspection',
      label: t('nav.newInspection'),
      icon: PlusCircle,
      badge: 'AI Scan',
    },
    {
      id: 'history',
      label: t('nav.history'),
      icon: History,
      badge: null,
    },
    {
      id: 'reports',
      label: t('nav.reports'),
      icon: FileText,
      badge: null,
    },
  ];

  // Admin-only nav item
  const isAdmin = officer?.role === 'admin';
  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: t('nav.admin'),
      icon: Crown,
      badge: 'Admin',
    });
  }

  const bottomItems = [
    {
      id: 'settings',
      label: t('nav.settings'),
      icon: Settings,
    },
  ];

  const handleNav = (tabId) => {
    onNavigate(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900/95 text-slate-100 flex flex-col justify-between border-r border-slate-800 backdrop-blur-md transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand & Emblem Header */}
        <div>
          <div className="p-5 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shrink-0 font-black">
                <Shield size={22} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-amber-400 uppercase leading-none">
                  <Trophy size={11} className="text-amber-400" /> SIH26034
                </div>
                <h1 className="text-sm font-black text-white tracking-tight mt-1 truncate">
                  Smart Legal Metrology
                </h1>
                <div className="text-[10px] text-indigo-400 font-mono font-medium mt-0.5">
                  Package Compliance AI
                </div>
              </div>
            </div>
          </div>

          {/* System Mode Indicator */}
          <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Rules Engine</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              12 Rules Active
            </span>
          </div>

          {/* Main Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Enforcement Operations
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-950/50 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={17}
                      className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={14} className="text-indigo-200" />}
                </button>
              );
            })}

            {/* AI Assistant Quick Launcher in Sidebar */}
            <button
              onClick={onOpenCopilot}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/40 border border-indigo-800/50 hover:bg-indigo-900/60 transition mt-2"
            >
              <div className="flex items-center gap-3">
                <Bot size={17} className="text-indigo-400" />
                <span>LM-Copilot Assistant</span>
              </div>
              <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded">
                AI Legal
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Area: Settings & Officer Profile */}
        <div>
          {/* Bottom Settings Link */}
          <div className="p-3 border-t border-slate-800">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Officer Session Profile Card */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                  <UserCheck size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                    {officer?.name || 'Inspector Officer'}
                    {officer?.role === 'admin' && (
                      <span className="text-[8px] font-black bg-amber-500/30 text-amber-300 px-1 py-0.5 rounded uppercase">Admin</span>
                    )}
                  </div>
                  <div className="text-[10px] text-indigo-400 font-mono truncate">
                    {officer?.officer_id || 'LM-INSP-4092'}
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
