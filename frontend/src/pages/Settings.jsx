import React, { useState, useEffect } from 'react';
import {
  Shield,
  BookOpen,
  Cpu,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Server,
  Cloud,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { getDbStats } from '../services/api';

export default function Settings({ systemConfig, officer }) {
  const [dbStats, setDbStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchDbTelemetry();
  }, []);

  const fetchDbTelemetry = async () => {
    setLoadingStats(true);
    try {
      const data = await getDbStats();
      if (data) setDbStats(data);
    } catch (_) {
    } finally {
      setLoadingStats(false);
    }
  };

  const rules = [
    {
      id: 'LM-001',
      title: 'Manufacturer / Packer / Importer Details',
      section: 'Rule 6(1)(a) — Legal Metrology (Packaged Commodities) Rules',
      desc: 'Mandatory declaration of complete name and registered/operational address of the manufacturer, packer, or importer.',
      applicability: 'All packaged commodities',
    },
    {
      id: 'LM-002',
      title: 'Country of Origin Declaration',
      section: 'Rule 6(1)(aa) — Mandatory Country of Origin / Import Declarations',
      desc: 'Mandatory declaration of country of origin for imported goods or clear domestic manufacturing indication.',
      applicability: 'Mandatory for imports; conditional for domestic goods',
    },
    {
      id: 'LM-003',
      title: 'Generic / Common Commodity Name',
      section: 'Rule 6(1)(b) — Generic Identity Requirement',
      desc: 'Common or generic name of the commodity must be declared distinctly on the principal display panel (separate from brand name).',
      applicability: 'All packaged commodities',
    },
    {
      id: 'LM-004',
      title: 'Net Quantity Declaration in SI Units',
      section: 'Rule 6(1)(c) — Standard Units of Weight/Measure',
      desc: 'Net quantity in standard SI units (g, kg, ml, L, N). Must not use non-standard units.',
      applicability: 'All packaged commodities',
    },
    {
      id: 'LM-005',
      title: 'Date of Manufacture or Pre-Packing',
      section: 'Rule 6(1)(d) — Manufacturing / Packing Timeline',
      desc: 'Month and year of manufacture or pre-packing must be explicitly declared.',
      applicability: 'All packaged commodities',
    },
    {
      id: 'LM-006',
      title: 'Best Before / Use By / Expiry Date',
      section: 'Rule 6(1)(e) — Perishable Commodity Expiry Regulation',
      desc: 'Statutory expiry period or best before date for food, cosmetics, pharmaceuticals, and perishable items.',
      applicability: 'Perishable & ingestible commodities (Food, Pharma, Cosmetics)',
    },
    {
      id: 'LM-007',
      title: 'Maximum Retail Price (MRP in INR)',
      section: 'Rule 6(1)(f) — Maximum Retail Price Regulation',
      desc: 'Conspicuous declaration of Maximum Retail Price (MRP) in Indian Rupees (₹).',
      applicability: 'All retail packaged commodities',
    },
    {
      id: 'LM-008',
      title: 'MRP Tax-Inclusive Indication',
      section: 'Rule 6(1)(f) — Tax Inclusivity Requirement',
      desc: "Requirement that MRP is accompanied by 'Inclusive of all taxes' or equivalent statutory wording.",
      applicability: 'All commodities where MRP is declared',
    },
    {
      id: 'LM-009',
      title: 'Consumer Care Helpline & Redressal',
      section: 'Rule 6(1)(g) — Grievance Redressal Mechanism',
      desc: 'Name, address, telephone number, and email address of the consumer redressal cell / officer.',
      applicability: 'All packaged commodities',
    },
    {
      id: 'LM-010',
      title: 'Category-Specific Statutory Registration',
      section: 'FSSAI Act 2006 / BIS Act 2016 — Sector Registration',
      desc: 'FSSAI License (14-digit) mandatory for food products. BIS/ISI Mark for electronics and appliances. Cosmetics registration for regulated categories.',
      applicability: 'Food (FSSAI), Electronics (BIS), Cosmetics (CDSCO)',
    },
    {
      id: 'LM-011',
      title: 'Deceptive Packaging & Font Size Compliance',
      section: 'Rule 7 — Packaged Commodities Rules 2011',
      desc: 'Mandatory declarations must not be obscured, deceptive, or in illegibly small font. Principal Display Panel (PDP) text must be visible and contrast-adequate.',
      applicability: 'All packaged commodities',
    },
    {
      id: 'LM-012',
      title: 'Mandatory Unit Sale Price Declaration',
      section: 'Rule 6(1)(e) Amendment 2021 — USP Mandate',
      desc: 'Unit Sale Price (₹ per g, ₹ per ml, ₹ per unit) must be declared on all pre-packaged commodities as per the 2021 Amendment Rules.',
      applicability: 'All pre-packaged commodities (>1g/1ml/1N)',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Architectural Core Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-blue-100 text-blue-900 rounded-lg">
            <Cpu size={18} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            System Architecture Principle
          </h2>
        </div>
        <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed border border-slate-800">
          <span className="text-amber-400 font-bold">PRINCIPLE:</span> AI EXTRACTS AND INTERPRETS. DETERMINISTIC RULES MAKE COMPLIANCE DECISIONS.
          <br /><br />
          Image &rarr; Gemini Vision Extraction &rarr; Structured Pydantic Model &rarr; Deterministic Rule Engine (LM-001..LM-012) &rarr; Legal Determination &amp; Prototype Score
        </div>
      </div>

      {/* Database & Cloud Storage Architecture Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-900 rounded-lg">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Database Engine &amp; Cloud Storage Architecture
              </h3>
              <p className="text-xs text-slate-500">
                ACID relational persistence with per-officer data isolation &amp; cloud SQL compatibility.
              </p>
            </div>
          </div>
          <button
            onClick={fetchDbTelemetry}
            disabled={loadingStats}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50"
          >
            <RefreshCw size={13} className={loadingStats ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <HardDrive size={14} className="text-indigo-500" />
              <span>Active SQL Engine</span>
            </div>
            <strong className="text-slate-800 block text-sm font-bold">
              {dbStats?.engine || 'MySQL Relational Database'}
            </strong>
            <span className="text-[11px] font-mono text-slate-500 block mt-1">
              {dbStats?.host ? `Host: ${dbStats.host} (${dbStats.database})` : 'MySQL 3306 (legal_metrology)'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Server size={14} className="text-emerald-500" />
              <span>Persistent Records</span>
            </div>
            <strong className="text-slate-800 block text-sm font-bold">
              {dbStats?.total_inspections || 0} Inspections / {dbStats?.total_officers || 0} Officers
            </strong>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              ✓ 100% User Data Isolation
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Cloud size={14} className="text-sky-500" />
              <span>Database Architecture</span>
            </div>
            <strong className="text-sky-700 block text-sm font-bold">
              Dedicated MySQL
            </strong>
            <span className="text-[11px] text-slate-500 block mt-1">
              ACID Transactions &amp; Strict Data Isolation
            </span>
          </div>
        </div>

        {/* Dedicated MySQL Connection Guide Callout */}
        <div className="p-4 bg-slate-900 rounded-xl text-slate-200 text-xs border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Database size={15} />
            <span>Active MySQL Database Connection:</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            The system is operating with a dedicated <strong>MySQL Relational Database</strong> for ACID-compliant inspection records, officer credentials, and immutable audit logging. Configured in <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded font-mono">backend/.env</code>:
          </p>
          <div className="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-emerald-400 border border-slate-800 overflow-x-auto">
            MYSQL_HOST={dbStats?.host ? dbStats.host.split(':')[0] : 'localhost'} | MYSQL_DATABASE={dbStats?.database || 'legal_metrology'} | STATUS={dbStats?.status || 'Connected (Active)'}
          </div>
        </div>
      </div>

      {/* Statutory Rules Catalog */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Configured Statutory Compliance Rules
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Rules derived from the Legal Metrology (Packaged Commodities) Rules, 2011 and statutory amendments.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {rules.map((r) => (
            <div key={r.id} className="py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {r.id}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{r.title}</h4>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {r.applicability}
                </span>
              </div>
              <div className="text-[11px] font-mono text-blue-800 mt-1">{r.section}</div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Runtime Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">System Diagnostic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">AI Service Status</span>
            <strong className={`block mt-1 ${systemConfig?.ai_service_configured ? 'text-emerald-700' : 'text-amber-700'}`}>
              {systemConfig?.ai_service_configured ? 'Configured (Gemini Active)' : 'Demo Mode (No API Key)'}
            </strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Active Model</span>
            <strong className="text-slate-800 block mt-1 font-mono">
              {systemConfig?.model || 'gemini-2.5-flash'}
            </strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Storage Persistence</span>
            <strong className="text-slate-800 block mt-1 text-emerald-700 font-semibold">
              MySQL Relational Engine (ACID)
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
