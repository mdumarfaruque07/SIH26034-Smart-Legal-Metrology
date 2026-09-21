import React, { useState, useEffect } from 'react';
import {
  Shield, Users, UserCheck, UserX, Clock, Trash2, ChevronDown,
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, ShieldAlert,
  Crown, Zap, Search, Filter, MoreVertical, ArrowUpRight,
} from 'lucide-react';
import { getOfficers, approveOfficer, rejectOfficer, deleteOfficer, changeOfficerRole } from '../services/api';

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', icon: Crown },
  inspector: { label: 'Inspector', color: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', icon: ShieldAlert },
  demo: { label: 'Demo', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30', icon: Zap },
};

const STATUS_CONFIG = {
  approved: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', icon: Clock },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', icon: XCircle },
};

export default function AdminPanel({ officer }) {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadOfficers();
  }, []);

  // Auto-clear success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadOfficers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOfficers();
      setOfficers(data);
    } catch (err) {
      setError(err.message || 'Failed to load officers.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (officerId) => {
    setActionLoading(officerId);
    setError('');
    try {
      await approveOfficer(officerId);
      setSuccess(`Officer ${officerId} approved successfully.`);
      await loadOfficers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (officerId) => {
    setActionLoading(officerId);
    setError('');
    try {
      await rejectOfficer(officerId);
      setSuccess(`Officer ${officerId} rejected.`);
      await loadOfficers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (officerId) => {
    setActionLoading(officerId);
    setError('');
    try {
      await deleteOfficer(officerId);
      setSuccess(`Officer ${officerId} deleted.`);
      setConfirmDelete(null);
      await loadOfficers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (officerId, newRole) => {
    setActionLoading(officerId);
    setError('');
    try {
      await changeOfficerRole(officerId, newRole);
      setSuccess(`Officer ${officerId} role changed to ${newRole}.`);
      await loadOfficers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Stats
  const totalOfficers = officers.length;
  const pendingCount = officers.filter(o => o.status === 'pending').length;
  const approvedCount = officers.filter(o => o.status === 'approved').length;
  const adminCount = officers.filter(o => o.role === 'admin').length;
  const pendingOfficers = officers.filter(o => o.status === 'pending');

  // Filtered list
  const filteredOfficers = officers.filter(o => {
    const matchesSearch = !searchQuery ||
      o.officer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statCards = [
    { label: 'Total Officers', value: totalOfficers, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { label: 'Pending Approval', value: pendingCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Active Officers', value: approvedCount, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Administrators', value: adminCount, icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/25 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Crown size={12} />
            <span>Admin Console</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Officer Management Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage officer registrations, roles, and system access control
          </p>
        </div>
        <button
          onClick={loadOfficers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-pulse">
          <CheckCircle2 size={14} className="shrink-0" />
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl ${card.bg} border ${card.border} flex items-center gap-3`}
          >
            <div className={`p-2 rounded-lg bg-slate-900/50 ${card.color}`}>
              <card.icon size={18} />
            </div>
            <div>
              <div className="text-xl font-black text-white">{card.value}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Registrations Alert */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-amber-400" />
            <h3 className="text-sm font-bold text-amber-300">
              Pending Registrations ({pendingCount})
            </h3>
          </div>
          <div className="space-y-2">
            {pendingOfficers.map((o) => (
              <div
                key={o.officer_id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{o.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{o.officer_id} • {o.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(o.officer_id)}
                    disabled={actionLoading === o.officer_id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={13} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(o.officer_id)}
                    disabled={actionLoading === o.officer_id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-red-300 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <XCircle size={13} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Officers Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
        {/* Table Header with Search */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users size={16} className="text-indigo-400" />
            All Registered Officers
          </h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search officers..."
                className="w-full sm:w-52 pl-8 pr-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw size={24} className="animate-spin text-indigo-400 mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading officers...</p>
          </div>
        ) : filteredOfficers.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No officers found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredOfficers.map((o) => {
              const roleConfig = ROLE_CONFIG[o.role] || ROLE_CONFIG.inspector;
              const statusConfig = STATUS_CONFIG[o.status] || STATUS_CONFIG.approved;
              const RoleIcon = roleConfig.icon;
              const StatusIcon = statusConfig.icon;
              const isSelf = o.officer_id === officer?.officer_id;

              return (
                <div
                  key={o.officer_id}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors ${isSelf ? 'bg-indigo-500/5' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-lg ${roleConfig.bg} border ${roleConfig.border} flex items-center justify-center ${roleConfig.color} font-bold text-xs shrink-0`}>
                      <RoleIcon size={16} />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{o.name}</span>
                        {isSelf && (
                          <span className="text-[9px] font-bold bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded">YOU</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {o.officer_id} • {o.department}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md ${statusConfig.bg} border ${statusConfig.border} ${statusConfig.color} text-[10px] font-bold uppercase tracking-wider shrink-0`}>
                      <StatusIcon size={11} />
                      {statusConfig.label}
                    </div>

                    {/* Role Badge */}
                    <div className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md ${roleConfig.bg} border ${roleConfig.border} ${roleConfig.color} text-[10px] font-bold uppercase tracking-wider shrink-0`}>
                      <RoleIcon size={11} />
                      {roleConfig.label}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    {o.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(o.officer_id)}
                          disabled={actionLoading === o.officer_id}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/15 rounded-lg transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(o.officer_id)}
                          disabled={actionLoading === o.officer_id}
                          className="p-1.5 text-red-400 hover:bg-red-500/15 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}

                    {/* Role Toggle (not for self, not for demo) */}
                    {!isSelf && o.role !== 'demo' && o.status === 'approved' && (
                      <button
                        onClick={() => handleRoleChange(o.officer_id, o.role === 'admin' ? 'inspector' : 'admin')}
                        disabled={actionLoading === o.officer_id}
                        className="p-1.5 text-amber-400 hover:bg-amber-500/15 rounded-lg transition-colors disabled:opacity-50"
                        title={o.role === 'admin' ? 'Demote to Inspector' : 'Promote to Admin'}
                      >
                        {o.role === 'admin' ? <ShieldAlert size={16} /> : <Crown size={16} />}
                      </button>
                    )}

                    {/* Delete (not for self) */}
                    {!isSelf && (
                      <>
                        {confirmDelete === o.officer_id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(o.officer_id)}
                              disabled={actionLoading === o.officer_id}
                              className="px-2 py-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-500 rounded-md transition-colors disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(o.officer_id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Officer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="text-center text-[10px] text-slate-500 space-y-1">
        <p>Officer data stored in <code className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-400">backend/app/data/officers.json</code></p>
        <p>Logged in as <strong className="text-amber-400">{officer?.name}</strong> ({officer?.officer_id}) • Role: {officer?.role?.toUpperCase()}</p>
      </div>
    </div>
  );
}
