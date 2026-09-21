import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Printer,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  ArrowLeft,
  Calendar,
  Building2,
  Package,
  Gavel,
  Scan,
  Languages,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import CheckCard from '../components/CheckCard';
import CheckDetailModal from '../components/CheckDetailModal';
import ScoreMeter from '../components/ScoreMeter';
import ExtractedInfoTable from '../components/ExtractedInfoTable';
import LegalNoticeModal from '../components/LegalNoticeModal';

export default function Results({
  inspection,
  onNewInspection,
  onViewReport,
  onPrint,
}) {
  const [activeView, setActiveView] = useState('checks'); // 'checks' | 'extracted'
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [lang, setLang] = useState('en'); // 'en' | 'hi'

  if (!inspection) {
    return (
      <div className="p-12 text-center bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800">
        <div className="text-slate-400 mb-2">No active inspection selected.</div>
        <button
          onClick={onNewInspection}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg"
        >
          Start New Inspection
        </button>
      </div>
    );
  }

  const {
    inspection_id,
    status,
    score = 0,
    category = 'Food',
    product = {},
    checks = [],
    summary = {},
    image_metadata,
    created_at,
    is_demo,
  } = inspection;

  const handleOpenCheckModal = (chk) => {
    setSelectedCheck(chk);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCheck(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner: Product ID & Overall Status */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                {inspection_id}
              </span>
              <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                {category || product.category || 'General Commodity'}
              </span>
              {is_demo && (
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
                  DEMO MODE
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
              {product.product_name || product.generic_name || 'Packaged Commodity'}
            </h1>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Manufacturer: <strong className="text-slate-200">{product.manufacturer?.name || 'Unverified'}</strong></span>
              <span>•</span>
              <span className="font-mono text-slate-400">
                {new Date(created_at || Date.now()).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Overall Status Badge & Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pl-2">
                Legal Determination:
              </span>
              <StatusBadge status={status} size="lg" />
            </div>

            {/* Action Buttons (hidden in print) */}
            <div className="no-print flex flex-wrap items-center gap-3">
              {/* Form-1 Statutory Legal Notice Trigger */}
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-red-300 bg-red-950/60 border border-red-800/60 hover:bg-red-900/80 rounded-xl shadow-sm transition-all"
                title="Issue Form-1 Statutory Notice under Section 39"
              >
                <Gavel size={15} className="text-red-400" />
                <span>Form-1 Legal Notice</span>
              </button>

              <button
                onClick={onViewReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 hover:bg-indigo-900/80 rounded-xl shadow-sm transition-all"
              >
                <FileText size={15} className="text-indigo-400" />
                <span>Statutory Report</span>
              </button>

              <button
                onClick={onNewInspection}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md transition-all"
              >
                <PlusCircle size={15} className="text-slate-950" />
                <span>+ New Inspection</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Data Warning Banner */}
      {is_demo && (
        <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-start gap-3 backdrop-blur-md animate-in fade-in duration-300">
          <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-300">
              ⚠️ Demo Sample Data — Not Real Image Analysis
            </h4>
            <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
              Yeh compliance results <strong>pre-configured demo sample data</strong> par based hain, aapke uploaded image ki actual analysis par nahi.
              Product name, manufacturer, country of origin, aur saari information sample data se aayi hai.
              Real package inspection ke liye Gemini AI API key configure karein aur image upload karein.
            </p>
          </div>
        </div>
      )}

      {/* Score Meter and Summary Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prototype Compliance Score Meter */}
        <div className="lg:col-span-1">
          <ScoreMeter score={score} status={status} />
        </div>

        {/* Summary Count Breakdown Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">PASS</span>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-2">
              {summary.pass_count ?? summary.pass ?? 0}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1 font-medium">
              Rules Verified
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">FAIL</span>
              <XCircle size={16} className="text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-300 mt-2">
              {summary.fail_count ?? summary.fail ?? 0}
            </div>
            <div className="text-[10px] text-rose-400/80 mt-1 font-medium">
              Statutory Violations
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">REVIEW</span>
              <AlertTriangle size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-2">
              {summary.review_count ?? summary.review ?? 0}
            </div>
            <div className="text-[10px] text-amber-400/80 mt-1 font-medium">
              Needs Officer Check
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">N/A</span>
              <Layers size={16} className="text-slate-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-300 mt-2">
              {summary.na_count ?? summary.na ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">
              Not Applicable
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (hidden in print) */}
      <div className="no-print flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('checks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'checks'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Compliance Checks ({checks.length})
          </button>

          <button
            onClick={() => setActiveView('extracted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'extracted'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Extracted Declarations
          </button>
        </div>
      </div>

      {/* View 1: Compliance Checks (Two-column layout) */}
      {activeView === 'checks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Preview */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl p-4">
              <div className="pb-3 text-xs font-bold text-white flex items-center justify-between border-b border-slate-800 mb-3">
                <span>Inspected Label Scan</span>
                {is_demo && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">
                    DEMO SAMPLE
                  </span>
                )}
              </div>
              <div className="w-full h-64 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                <img
                  src={
                    product.image_url ||
                    (is_demo ? (product.product_name?.includes('Butter') ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="%230F2942"/><text x="50" y="80" fill="%23FFF" font-size="28">ROYAL TREATS</text><text x="50" y="130" fill="%23FFF" font-size="20">Butter Delight Biscuits</text><text x="50" y="200" fill="%23FCD34D" font-size="16">Net Wt: 200g | MRP: Rs. 80.00 (Incl taxes)</text><text x="50" y="250" fill="%23FFF" font-size="14">Mfg: 07/2026 | Best Before: 6 mos</text><text x="50" y="300" fill="%23CBD5E1" font-size="12">ABC Foods, Hyderabad - 500076</text></svg>' : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="%237F1D1D"/><text x="50" y="80" fill="%23FFF" font-size="28">CRUNCHY BITES</text><text x="50" y="130" fill="%23FECACA" font-size="18">Price: Rs. 120 | Net: 500g</text><text x="50" y="200" fill="%23FCA5A5" font-size="14">[MISSING ADDRESS, MFG DATE &amp; CARE]</text></svg>') : null) ||
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" fill="%230F172A"><rect width="600" height="400" fill="%230F172A"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748B" font-family="sans-serif" font-size="18">Package Label Image Not Available</text></svg>'
                  }
                  alt="Package Label"
                  className="w-full h-full object-contain filter contrast-[1.05]"
                />
              </div>

              <div className="w-full mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Image Quality</span>
                  <span className="font-bold text-emerald-400">
                    {image_metadata?.quality_label || 'GOOD (High OCR Confidence)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Text Contrast</span>
                  <span className="font-bold text-indigo-400">
                    {image_metadata?.text_visibility || 'COMPLIANT'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Compliance Checks List */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Statutory Legal Metrology Rules (LM-001 — LM-012)
              </h3>
              <span className="text-xs text-slate-400">
                Click any check for verbatim evidence rationale
              </span>
            </div>

            <div className="space-y-3">
              {checks.map((chk) => (
                <CheckCard
                  key={chk.rule_id}
                  check={chk}
                  onClick={() => handleOpenCheckModal(chk)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Extracted Product Information Table */}
      {activeView === 'extracted' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">
              Extracted Package Declarations
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured representation of declarations identified by AI on visible label surfaces. Missing fields are preserved as 'Not detected'.
            </p>
          </div>
          <ExtractedInfoTable product={product} />
        </div>
      )}


      {/* Check Detail Modal (hidden in print) */}
      <div className="no-print">
        <CheckDetailModal
          check={selectedCheck}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>

      {/* Legal Notice Modal (has its own print handling) */}
      <LegalNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        inspection={inspection}
      />
    </div>
  );
}

