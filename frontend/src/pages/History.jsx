import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  ArrowUpRight,
  PlusCircle,
  Package,
  Calendar,
  Layers,
  Database,
  User,
  ShieldCheck,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function History({
  inspections = [],
  officer,
  onSelectInspection,
  onNewInspection,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [officerFilter, setOfficerFilter] = useState('ALL');

  // Extract distinct officer IDs if admin
  const distinctOfficers = Array.from(
    new Set(inspections.map((i) => i.officer_id).filter(Boolean))
  );

  const filteredInspections = inspections.filter((insp) => {
    const pName = (insp.product?.product_name || insp.product?.generic_name || '').toLowerCase();
    const inspId = (insp.inspection_id || '').toLowerCase();
    const offName = (insp.officer_name || insp.officer_id || '').toLowerCase();
    const searchMatch =
      pName.includes(searchTerm.toLowerCase()) ||
      inspId.includes(searchTerm.toLowerCase()) ||
      offName.includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter === 'ALL' || insp.status === statusFilter;
    const officerMatch = officerFilter === 'ALL' || insp.officer_id === officerFilter;

    return searchMatch && statusMatch && officerMatch;
  });

  const isAdmin = officer?.role === 'admin';

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Scope Indicator */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Database size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">
                {isAdmin ? 'Central Department Legal Metrology Audit Registry' : `Officer Inspection Log: ${officer?.name || 'Officer'}`}
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                MySQL Database Connected
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAdmin
                ? `Showing department-wide inspection records across all field officers (${inspections.length} total stored)`
                : `Showing records exclusively verified by Officer ID: ${officer?.officer_id || 'ID'} (${inspections.length} records)`}
            </p>
          </div>
        </div>

        <button
          onClick={onNewInspection}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-sm shrink-0"
        >
          <PlusCircle size={14} />
          <span>New Inspection</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isAdmin ? "Search by product, ID, or officer..." : "Search by product name or ID..."}
            className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 bg-slate-50/50"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Admin Officer Dropdown */}
          {isAdmin && distinctOfficers.length > 0 && (
            <select
              value={officerFilter}
              onChange={(e) => setOfficerFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 font-semibold focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Field Officers</option>
              {distinctOfficers.map((oid) => (
                <option key={oid} value={oid}>
                  Officer: {oid}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5">
            {['ALL', 'COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-[#0F2942] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredInspections.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Package size={22} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No matching inspections found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {inspections.length === 0
                ? "No inspections have been conducted under this officer account yet. Run a live inspection or test a sample to populate history."
                : "Try adjusting your search query or filter settings."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Inspection Reference</th>
                  <th className="py-3.5 px-6">Packaged Commodity</th>
                  {isAdmin && <th className="py-3.5 px-6">Inspecting Officer</th>}
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Legal Determination</th>
                  <th className="py-3.5 px-6">Score</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredInspections.map((insp) => (
                  <tr
                    key={insp.inspection_id}
                    onClick={() => onSelectInspection(insp)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{insp.inspection_id}</span>
                        {insp.is_demo && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">
                        {insp.product?.product_name || insp.product?.generic_name || 'Packaged Commodity'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {insp.product?.manufacturer?.name || 'Manufacturer Unverified'}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                          <User size={12} className="text-slate-400" />
                          <span>{insp.officer_name || insp.officer_id || 'System'}</span>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {insp.category || insp.product?.category || 'General'}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={insp.status} size="sm" />
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-slate-800">
                        {insp.score}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(insp.created_at || Date.now()).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-800 hover:text-blue-900 text-xs">
                        <span>Open Details</span>
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
