import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Loader2,
  ScanLine,
  FileSearch,
  Scale,
  ShieldCheck,
  Package,
  XCircle,
  ServerCrash,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

export default function AnalysisProgress({
  imagePreview,
  category,
  onComplete,
  error,
  onRetry,
  onGoBack,
}) {
  const stages = [
    {
      id: 1,
      title: 'Image Received & Validated',
      desc: 'Checking file format, resolution, and principal display panel orientation',
      icon: ScanLine,
    },
    {
      id: 2,
      title: 'Reading Package Label Declarations',
      desc: 'Multimodal vision model parsing visible label text and declarations',
      icon: FileSearch,
    },
    {
      id: 3,
      title: 'Extracting Structured Declarations',
      desc: 'Isolating manufacturer name/address, net quantity, MRP, and dates',
      icon: Package,
    },
    {
      id: 4,
      title: 'Structuring Product Information',
      desc: 'Validating data integrity and normalizing measurements in Pydantic schema',
      icon: Scale,
    },
    {
      id: 5,
      title: 'Executing Deterministic Compliance Engine',
      desc: 'Evaluating statutory Legal Metrology rules (LM-001 to LM-009)',
      icon: ShieldCheck,
    },
    {
      id: 6,
      title: 'Preparing Compliance Assessment',
      desc: 'Calculating Prototype Screening Score and formulating violation notes',
      icon: CheckCircle2,
    },
  ];

  const [currentStage, setCurrentStage] = useState(1);
  const [failedAtStage, setFailedAtStage] = useState(null);

  // Accurately map failure point based on the error source
  const determineFailedStage = (errorMsg) => {
    if (!errorMsg) return 2;
    const lower = errorMsg.toLowerCase();
    if (lower.includes('empty image') || lower.includes('invalid') || lower.includes('format') || lower.includes('corrupt')) {
      return 1; // Stage 1: Image Received & Validated failed
    }
    // Any Gemini vision API, network, 503, 429, or extraction error failed at AI vision stage
    return 2; // Stage 2: Reading Package Label Declarations failed
  };

  // When error prop arrives, set exact failed stage and freeze
  useEffect(() => {
    if (error) {
      setFailedAtStage(determineFailedStage(error));
    }
  }, [error]);

  useEffect(() => {
    // Stop progression if an error occurred
    if (error || failedAtStage !== null) return;

    const timer1 = setTimeout(() => setCurrentStage(2), 800);
    const timer2 = setTimeout(() => setCurrentStage(3), 2000);
    const timer3 = setTimeout(() => setCurrentStage(4), 3200);
    const timer4 = setTimeout(() => setCurrentStage(5), 4200);
    const timer5 = setTimeout(() => setCurrentStage(6), 5000);
    const timer6 = setTimeout(() => setCurrentStage(7), 5800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [error, failedAtStage]);

  // Determine a user-friendly error message and type in professional English
  const getErrorDetails = (errorMsg) => {
    if (!errorMsg) return null;
    const lower = errorMsg.toLowerCase();

    if (lower.includes('api key') || lower.includes('not configured') || lower.includes('gemini_api_key')) {
      return {
        title: 'AI Service Not Configured',
        subtitle: 'Google Gemini API key is missing or not configured',
        message: 'Live label vision extraction requires a valid Google Gemini API key. Please configure GEMINI_API_KEY in backend/.env or select a pre-loaded sample package.',
        icon: ServerCrash,
        color: 'amber',
      };
    }

    if (lower.includes('503') || lower.includes('service unavailable') || lower.includes('overloaded') || lower.includes('server') || lower.includes('busy')) {
      return {
        title: 'AI Extraction Service Busy',
        subtitle: 'Google Gemini vision service is temporarily unavailable (HTTP 503)',
        message: 'The AI vision extraction server is currently experiencing high load or temporary service downtime. Please click "Retry Analysis" or test the compliance engine using a pre-loaded sample package.',
        icon: ServerCrash,
        color: 'amber',
      };
    }

    if (lower.includes('429') || lower.includes('quota') || lower.includes('rate limit') || lower.includes('too many')) {
      return {
        title: 'API Rate Limit Exceeded',
        subtitle: 'Google Gemini API quota threshold reached (HTTP 429)',
        message: 'The API request quota limit has been exceeded. Please wait a few moments before retrying, or evaluate compliance using a pre-loaded sample package.',
        icon: ServerCrash,
        color: 'amber',
      };
    }

    if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('network')) {
      return {
        title: 'Connection Timeout',
        subtitle: 'Unable to establish connection to AI extraction service',
        message: 'Communication with the AI vision service timed out. Please verify your internet connection and click "Retry Analysis".',
        icon: ServerCrash,
        color: 'rose',
      };
    }

    if (lower.includes('empty image') || lower.includes('invalid') || lower.includes('format')) {
      return {
        title: 'Invalid Image Format',
        subtitle: 'Uploaded file could not be processed',
        message: 'The uploaded file is not a supported or readable image format. Please upload a clear, high-resolution JPEG, PNG, or WebP photo with legible packaging labels.',
        icon: XCircle,
        color: 'rose',
      };
    }

    // Generic fallback in formal English
    return {
      title: 'Analysis Execution Failed',
      subtitle: 'Unable to complete package inspection',
      message: errorMsg || 'An unexpected error occurred during package analysis. Please retry or contact technical support.',
      icon: ServerCrash,
      color: 'rose',
    };
  };

  const errorDetails = getErrorDetails(error);

  // ─── ERROR STATE: Full-screen error with stopped pipeline ───
  if (error && errorDetails) {
    const ErrIcon = errorDetails.icon;
    const colorMap = {
      amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
        title: 'text-amber-300',
        subtitle: 'text-amber-400/80',
        message: 'text-amber-200/70',
        stageFail: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      },
      rose: {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        iconBg: 'bg-rose-500/20',
        iconColor: 'text-rose-400',
        title: 'text-rose-300',
        subtitle: 'text-rose-400/80',
        message: 'text-rose-200/70',
        stageFail: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      },
    };
    const c = colorMap[errorDetails.color] || colorMap.rose;

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-6 sm:p-8">

          {/* Error Header */}
          <div className="text-center max-w-md mx-auto mb-6">
            <div className={`w-16 h-16 rounded-2xl ${c.iconBg} border ${c.border} flex items-center justify-center mx-auto mb-4`}>
              <ErrIcon size={32} className={c.iconColor} />
            </div>
            <h2 className={`text-xl sm:text-2xl font-extrabold ${c.title} tracking-tight`}>
              {errorDetails.title}
            </h2>
            <p className={`text-xs ${c.subtitle} mt-1 font-semibold`}>
              {errorDetails.subtitle}
            </p>
          </div>

          {/* Error Detail Card */}
          <div className={`p-4 rounded-xl ${c.bg} border ${c.border} mb-6`}>
            <p className={`text-sm ${c.message} leading-relaxed text-center`}>
              {errorDetails.message}
            </p>
          </div>

          {/* Failed Pipeline — shows which stages passed and which failed */}
          <div className="space-y-2.5 mb-6">
            {stages.map((stage) => {
              const stageNum = stage.id;
              const isDone = failedAtStage ? stageNum < failedAtStage : false;
              const isFailed = failedAtStage ? stageNum === failedAtStage : false;

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : isFailed
                      ? c.stageFail
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-500 opacity-40'
                  }`}
                >
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : isFailed ? (
                      <XCircle size={16} className="text-rose-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600 flex items-center justify-center text-[9px] font-mono text-slate-500">
                        {stage.id}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold">{stage.title}</span>
                  {isFailed && (
                    <span className="text-[10px] font-bold text-rose-400 ml-auto uppercase tracking-wider">
                      FAILED
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
              >
                <RefreshCw size={14} />
                <span>Retry Analysis</span>
              </button>
            )}
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
              >
                <ArrowLeft size={14} />
                <span>Back to Inspection</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── NORMAL: Processing animation ───
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8">
        {/* Header Title */}
        <div className="text-center max-w-md mx-auto mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-900 mb-3 shadow-2xs">
            <Loader2 size={24} className="animate-spin text-blue-800" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2942] tracking-tight">
            Analyzing Package Label...
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Category: <span className="font-semibold text-slate-700">{category || 'Auto Detect'}</span> • Running automated Legal Metrology inspection pipeline.
          </p>
        </div>

        {/* Image Thumbnail & Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Package Preview Thumbnail */}
          {imagePreview && (
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="relative w-full h-48 bg-slate-900 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center shadow-xs">
                <img
                  src={imagePreview}
                  alt="Analyzing Package"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono font-bold text-amber-300">
                  SCANNING
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-2">Principal Display Panel</span>
            </div>
          )}

          {/* Processing Stages List */}
          <div className={`space-y-3.5 ${imagePreview ? 'md:col-span-2' : 'md:col-span-3'}`}>
            {stages.map((stage) => {
              const Icon = stage.icon;
              const isDone = currentStage > stage.id;
              const isCurrent = currentStage === stage.id;
              const isPending = currentStage < stage.id;

              return (
                <div
                  key={stage.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
                    isDone
                      ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-900'
                      : isCurrent
                      ? 'bg-blue-50/60 border-blue-300 text-blue-900 shadow-2xs'
                      : 'bg-slate-50/40 border-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isDone ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : isCurrent ? (
                      <Loader2 size={18} className="text-blue-600 animate-spin" />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-mono text-slate-400">
                        {stage.id}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{stage.title}</span>
                      {isDone && <span className="text-[10px] font-mono text-emerald-700">COMPLETED</span>}
                      {isCurrent && <span className="text-[10px] font-mono text-blue-700 animate-pulse">PROCESSING</span>}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {stage.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

