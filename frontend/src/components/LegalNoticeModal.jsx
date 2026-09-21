import React, { useState, useEffect } from 'react';
import { FileText, X, Printer, ShieldAlert, Check, Copy, Gavel } from 'lucide-react';
import { generateLegalNotice } from '../services/api';

export default function LegalNoticeModal({ isOpen, onClose, inspection }) {
  const [noticeData, setNoticeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && inspection) {
      loadNotice();
    }
  }, [isOpen, inspection]);

  const loadNotice = async () => {
    setIsLoading(true);
    try {
      const res = await generateLegalNotice(inspection?.inspection_id || 'sample');
      setNoticeData(res);
    } catch (err) {
      console.error('Failed to generate notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    if (noticeData?.notice_text) {
      navigator.clipboard.writeText(noticeData.notice_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (!noticeData) return;

    // Open a dedicated print window with ONLY the notice content
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Pop-up was blocked. Please allow pop-ups in your browser to print the statutory notice.');
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Form-1 Statutory Notice - ${noticeData.notice_id}</title>
  <style>
    @page { margin: 20mm; size: A4; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      color: #000;
      line-height: 1.6;
      padding: 30px;
      max-width: 700px;
      margin: 0 auto;
    }
    pre {
      font-family: inherit;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
    }
  </style>
</head>
<body>
  <pre>${noticeData.notice_text}</pre>
</body>
</html>`);
    printWindow.document.close();

    // Wait for content to render, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
    // Fallback if onload doesn't fire
    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      } catch (_) {}
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                FORM-1 STATUTORY LEGAL ENFORCEMENT NOTICE
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                  Section 39 Act 2009
                </span>
              </h3>
              <p className="text-xs text-slate-400">Official Notice of Violation for Non-Compliant Packaging</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print Notice
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Preview Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center">
              <FileText className="w-10 h-10 animate-bounce text-indigo-400 mb-3" />
              <p className="text-sm font-semibold text-white">Generating Form-1 Statutory Enforcement Notice...</p>
            </div>
          ) : noticeData ? (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-4 shadow-inner whitespace-pre-wrap leading-relaxed">
              <div className="text-center pb-4 border-b border-slate-800 text-slate-100">
                <p className="font-bold text-sm text-amber-400">{noticeData.form_title}</p>
                <p className="text-[11px] text-slate-400">LEGAL METROLOGY ACT, 2009 &amp; PACKAGED COMMODITIES RULES</p>
                <p className="text-[11px] text-indigo-400 mt-1 font-bold">Ref No: {noticeData.notice_id}</p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Target Entity:</p>
                <p className="text-white font-bold text-sm">{noticeData.manufacturer_name}</p>
                <p className="text-slate-400 text-xs">{noticeData.manufacturer_address}</p>
              </div>

              <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-lg">
                <p className="font-bold text-red-400 flex items-center gap-1.5 mb-2">
                  <ShieldAlert className="w-4 h-4" /> Established Statutory Violations:
                </p>
                <ul className="space-y-1.5 pl-4 list-disc text-slate-200">
                  {noticeData.violations?.map((v, i) => (
                    <li key={i}>
                      <span className="font-bold text-white">{v.rule}:</span> {v.description}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 text-slate-300">
                <p>{noticeData.notice_text}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
