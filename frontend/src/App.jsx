import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewInspection from './pages/NewInspection';
import AnalysisProgress from './pages/AnalysisProgress';
import Results from './pages/Results';
import History from './pages/History';
import Report from './pages/Report';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import LMCopilotModal from './components/LMCopilotModal';

import {
  analyzePackage,
  demoAnalyzePackage,
  getInspectionHistory,
  getSystemConfig,
} from './services/api';
import {
  getStoredInspections,
  saveInspectionToLocal,
  getCurrentInspection,
  setCurrentInspection,
  getOfficerSession,
  setOfficerSession,
  clearOfficerSession,
} from './services/storage';

export default function App() {
  const [officer, setOfficer] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inspections, setInspections] = useState([]);
  const [currentInspection, setCurrentInspectionState] = useState(null);
  const [systemConfig, setSystemConfig] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Analysis Progress Transient State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingImagePreview, setAnalyzingImagePreview] = useState(null);
  const [analyzingCategory, setAnalyzingCategory] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Load Session & System Diagnostics on mount
  useEffect(() => {
    const savedOfficer = getOfficerSession();
    if (savedOfficer) {
      setOfficer(savedOfficer);
      loadInspections(savedOfficer.officer_id, savedOfficer.role);
    }

    const savedCurrent = getCurrentInspection();
    if (savedCurrent) {
      setCurrentInspectionState(savedCurrent);
    }

    // Check system status
    getSystemConfig()
      .then((cfg) => setSystemConfig(cfg))
      .catch((_) => {});
  }, []);

  const loadInspections = async (officerIdOverride = null, roleOverride = null) => {
    const activeOid = officerIdOverride !== null ? officerIdOverride : (officer?.officer_id || null);
    const activeRole = roleOverride !== null ? roleOverride : (officer?.role || null);

    // If not logged in, empty out
    if (!activeOid) {
      setInspections([]);
      return;
    }

    try {
      // If admin, load all inspections (pass null to history endpoint), otherwise pass officerId
      const targetOid = activeRole === 'admin' ? null : activeOid;
      const backendHistory = await getInspectionHistory(targetOid);
      if (backendHistory) {
        setInspections(backendHistory);
        return;
      }
    } catch (e) {
      console.warn('Backend history fetch failed, using local storage:', e);
    }

    // Fallback to local storage for this officer
    const local = getStoredInspections();
    setInspections(local);
  };

  const handleLogin = (sessionData) => {
    setOfficer(sessionData);
    setOfficerSession(sessionData);
    // Admin goes to admin panel, officer goes to dashboard
    setActiveTab(sessionData.role === 'admin' ? 'admin' : 'dashboard');
    // Reload inspections strictly for this specific officer
    loadInspections(sessionData.officer_id, sessionData.role);
  };

  const handleLogout = () => {
    setOfficer(null);
    setInspections([]);
    setCurrentInspectionState(null);
    clearOfficerSession();
  };

  const handleStartAnalysis = async ({ file, category, demoSampleId, previewUrl }) => {
    setIsAnalyzing(true);
    setActiveTab('analysis');
    setAnalyzingImagePreview(previewUrl);
    setAnalyzingCategory(category);
    setAnalysisError(null);

    const startTime = Date.now();

    try {
      let result;
      if (demoSampleId) {
        // Run demo analysis through the deterministic compliance engine
        result = await demoAnalyzePackage(demoSampleId, officer?.officer_id, officer?.name);
      } else {
        // Run live package analysis (image -> Gemini AI extraction -> Rule engine)
        result = await analyzePackage(file, category, null, officer?.officer_id, officer?.name);
      }

      // Attach local preview URL if not present
      if (!result.product.image_url && previewUrl) {
        result.product.image_url = previewUrl;
      }

      // Smooth staged transition allowing progress pipeline to finish (min 4500ms from start)
      const elapsed = Date.now() - startTime;
      const remainingWait = Math.max(0, 4500 - elapsed);

      setTimeout(() => {
        setCurrentInspectionState(result);
        saveInspectionToLocal(result);
        setInspections((prev) => {
          const filtered = prev.filter((i) => i.inspection_id !== result.inspection_id);
          return [result, ...filtered];
        });
        setIsAnalyzing(false);
        setActiveTab('results');
      }, remainingWait);
    } catch (err) {
      console.error('Inspection analysis failed:', err);
      setAnalysisError(err.message || 'Inspection analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleStartDemoInspection = (demoId) => {
    setActiveTab('new-inspection');
    // Pre-populate and run
    handleStartAnalysis({
      file: null,
      category: 'Food',
      demoSampleId: demoId,
      previewUrl:
        demoId === 'sample_compliant'
          ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="%230F2942"/><text x="50" y="80" fill="%23FFF" font-size="28">ROYAL TREATS</text><text x="50" y="130" fill="%23FFF" font-size="20">Butter Delight Biscuits</text><text x="50" y="200" fill="%23FCD34D" font-size="16">Net Wt: 200g | MRP: Rs. 80.00 (Incl taxes)</text><text x="50" y="250" fill="%23FFF" font-size="14">Mfg: 07/2026 | Best Before: 6 mos</text><text x="50" y="300" fill="%23CBD5E1" font-size="12">ABC Foods, Hyderabad - 500076</text></svg>'
          : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="%237F1D1D"/><text x="50" y="80" fill="%23FFF" font-size="28">CRUNCHY BITES</text><text x="50" y="130" fill="%23FECACA" font-size="18">Price: Rs. 120 | Net: 500g</text><text x="50" y="200" fill="%23FCA5A5" font-size="14">[MISSING ADDRESS, MFG DATE &amp; CARE]</text></svg>',
    });
  };

  const handleSelectInspection = (insp) => {
    setCurrentInspectionState(insp);
    setCurrentInspection(insp);
    setActiveTab('results');
  };

  const handlePrint = () => {
    window.print();
  };

  // If not logged in, render Login portal
  if (!officer) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0B132B] flex font-sans">
      {/* Sidebar Navigation (hidden in print) */}
      <div className="no-print">
        <Sidebar
          activeTab={activeTab}
          onNavigate={(tab) => {
            if (!isAnalyzing) setActiveTab(tab);
          }}
          officer={officer}
          onLogout={handleLogout}
          systemConfig={systemConfig}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onOpenCopilot={() => setIsCopilotOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header (hidden in print) */}
        <div className="no-print">
          <Header
            activeTab={activeTab}
            onNavigate={(tab) => {
              if (!isAnalyzing) setActiveTab(tab);
            }}
            systemConfig={systemConfig}
            setIsMobileOpen={setIsMobileOpen}
            onPrint={handlePrint}
            hasActiveInspection={Boolean(currentInspection)}
            onOpenCopilot={() => setIsCopilotOpen(true)}
          />
        </div>

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              inspections={inspections}
              officer={officer}
              onNavigate={setActiveTab}
              onSelectInspection={handleSelectInspection}
              onStartDemoInspection={handleStartDemoInspection}
              systemConfig={systemConfig}
              onOpenCopilot={() => setIsCopilotOpen(true)}
            />
          )}

          {activeTab === 'new-inspection' && (
            <NewInspection
              onStartAnalysis={handleStartAnalysis}
              systemConfig={systemConfig}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisProgress
              imagePreview={analyzingImagePreview}
              category={analyzingCategory}
              error={analysisError}
              onRetry={() => {
                setAnalysisError(null);
                setIsAnalyzing(false);
                setActiveTab('new-inspection');
              }}
              onGoBack={() => {
                setAnalysisError(null);
                setIsAnalyzing(false);
                setActiveTab('new-inspection');
              }}
            />
          )}

          {activeTab === 'results' && (
            <Results
              inspection={currentInspection}
              onNewInspection={() => setActiveTab('new-inspection')}
              onViewReport={() => setActiveTab('reports')}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'history' && (
            <History
              inspections={inspections}
              officer={officer}
              onSelectInspection={handleSelectInspection}
              onNewInspection={() => setActiveTab('new-inspection')}
            />
          )}

          {activeTab === 'reports' && (
            <Report
              inspection={currentInspection || inspections[0]}
              officer={officer}
              onBack={() => setActiveTab('results')}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'settings' && (
            <Settings systemConfig={systemConfig} officer={officer} />
          )}

          {activeTab === 'admin' && officer?.role === 'admin' && (
            <AdminPanel officer={officer} />
          )}
        </main>
      </div>

      {/* LM-Copilot AI Assistant Modal (hidden in print) */}
      <div className="no-print">
        <LMCopilotModal
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          currentInspectionId={currentInspection?.inspection_id}
        />
      </div>
    </div>
  );
}
