/**
 * Simple i18n (internationalization) system for Hindi/English toggle.
 * Used across the application for multi-language support.
 */

const translations = {
  en: {
    // Dashboard
    'dashboard.title': 'Legal Metrology AI Enforcement Command Center',
    'dashboard.subtitle': 'Multimodal AI declaration extraction & 12 deterministic Legal Metrology rules (LM-001 to LM-012) with spatial evidence canvas & Form-1 Legal Enforcement Notice generation.',
    'dashboard.totalInspections': 'Total Inspections',
    'dashboard.compliant': 'Compliant Packages',
    'dashboard.nonCompliant': 'Non-Compliant Packages',
    'dashboard.needsReview': 'Needs Manual Review',
    'dashboard.newInspection': '+ New Inspection',
    'dashboard.askCopilot': 'Ask LM-Copilot',
    'dashboard.demoEval': 'INSTANT DEMO EVALUATION',
    'dashboard.demoSubtitle': 'Pre-configured Demonstration Scenarios',
    'dashboard.runAI': 'Run AI Inspection',
    'dashboard.recentInspections': 'Recent Enforcement Inspections',
    'dashboard.viewAll': 'View All Audit Trail',
    'dashboard.noInspections': 'No inspections logged yet',
    'dashboard.complianceDist': 'Compliance Distribution',
    'dashboard.scoreDist': 'Score Distribution',
    'dashboard.topViolations': 'Top Violation Rules',
    'dashboard.complianceRate': 'Compliance Rate',
    'dashboard.avgScore': 'Average Score',
    'dashboard.uniqueViolations': 'Unique Violations',

    // Sidebar
    'nav.dashboard': 'Command Dashboard',
    'nav.newInspection': 'New Inspection',
    'nav.history': 'Inspection History',
    'nav.reports': 'Statutory Reports',
    'nav.settings': 'LM Rules (12 Rules)',
    'nav.admin': 'Admin Panel',

    // Header
    'header.dashboard.title': 'AI-Powered Inspection Command Center',
    'header.dashboard.subtitle': 'Comprehensive enforcement analytics, case management, and AI compliance pipeline',
    'header.newInspection.title': 'New Package Inspection',
    'header.newInspection.subtitle': 'Upload a commodity label image for automated AI compliance analysis',
    'header.analysis.title': 'Compliance Analysis Pipeline',
    'header.analysis.subtitle': 'Gemini Vision extraction → Rule engine → Statutory verdict generation',
    'header.results.title': 'Inspection Assessment Results',
    'header.results.subtitle': 'Detailed compliance verdict with spatial evidence canvas',
    'header.history.title': 'Inspection History & Audit Trail',
    'header.history.subtitle': 'Chronological legal audit log of evaluated packaged commodities',
    'header.reports.title': 'Statutory Package Compliance Certificate',
    'header.reports.subtitle': 'Official regulatory inspection summary and Form-1 violation notice generator',
    'header.settings.title': 'Statutory Rule Definitions Catalog',
    'header.settings.subtitle': 'Legal Metrology Act rules (LM-001 to LM-012)',
    'header.admin.title': 'Admin Panel — Officer Management',
    'header.admin.subtitle': 'Approve registrations, manage roles, and control system access',

    // Common
    'common.compliant': 'Compliant',
    'common.nonCompliant': 'Non-Compliant',
    'common.needsReview': 'Needs Review',
    'common.print': 'Print',
    'common.downloadPDF': 'Download PDF',
    'common.back': 'Back',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.language': 'Language',
    'common.english': 'English',
    'common.hindi': 'हिन्दी',
  },

  hi: {
    // Dashboard
    'dashboard.title': 'विधिक माप विज्ञान AI प्रवर्तन कमांड सेंटर',
    'dashboard.subtitle': 'मल्टीमॉडल AI डिक्लेरेशन एक्सट्रैक्शन और 12 नियतात्मक विधिक माप विज्ञान नियम (LM-001 से LM-012) स्थानिक साक्ष्य कैनवास और फॉर्म-1 कानूनी प्रवर्तन नोटिस जनरेशन के साथ।',
    'dashboard.totalInspections': 'कुल निरीक्षण',
    'dashboard.compliant': 'अनुपालन पैकेज',
    'dashboard.nonCompliant': 'गैर-अनुपालन पैकेज',
    'dashboard.needsReview': 'मैनुअल समीक्षा आवश्यक',
    'dashboard.newInspection': '+ नया निरीक्षण',
    'dashboard.askCopilot': 'LM-Copilot से पूछें',
    'dashboard.demoEval': 'त्वरित डेमो मूल्यांकन',
    'dashboard.demoSubtitle': 'पूर्व-कॉन्फ़िगर प्रदर्शन परिदृश्य',
    'dashboard.runAI': 'AI निरीक्षण चलाएं',
    'dashboard.recentInspections': 'हालिया प्रवर्तन निरीक्षण',
    'dashboard.viewAll': 'सभी ऑडिट ट्रेल देखें',
    'dashboard.noInspections': 'अभी तक कोई निरीक्षण दर्ज नहीं',
    'dashboard.complianceDist': 'अनुपालन वितरण',
    'dashboard.scoreDist': 'स्कोर वितरण',
    'dashboard.topViolations': 'शीर्ष उल्लंघन नियम',
    'dashboard.complianceRate': 'अनुपालन दर',
    'dashboard.avgScore': 'औसत स्कोर',
    'dashboard.uniqueViolations': 'अद्वितीय उल्लंघन',

    // Sidebar
    'nav.dashboard': 'कमांड डैशबोर्ड',
    'nav.newInspection': 'नया निरीक्षण',
    'nav.history': 'निरीक्षण इतिहास',
    'nav.reports': 'सांविधिक रिपोर्ट',
    'nav.settings': 'LM नियम (12 नियम)',
    'nav.admin': 'एडमिन पैनल',

    // Header
    'header.dashboard.title': 'AI-संचालित निरीक्षण कमांड सेंटर',
    'header.dashboard.subtitle': 'व्यापक प्रवर्तन विश्लेषण, केस प्रबंधन, और AI अनुपालन पाइपलाइन',
    'header.newInspection.title': 'नया पैकेज निरीक्षण',
    'header.newInspection.subtitle': 'स्वचालित AI अनुपालन विश्लेषण के लिए कमोडिटी लेबल छवि अपलोड करें',
    'header.analysis.title': 'अनुपालन विश्लेषण पाइपलाइन',
    'header.analysis.subtitle': 'Gemini Vision एक्सट्रैक्शन → नियम इंजन → सांविधिक निर्णय जनरेशन',
    'header.results.title': 'निरीक्षण मूल्यांकन परिणाम',
    'header.results.subtitle': 'स्थानिक साक्ष्य कैनवास के साथ विस्तृत अनुपालन निर्णय',
    'header.history.title': 'निरीक्षण इतिहास और ऑडिट ट्रेल',
    'header.history.subtitle': 'मूल्यांकित पैकेज्ड कमोडिटीज़ का कालानुक्रमिक कानूनी ऑडिट लॉग',
    'header.reports.title': 'सांविधिक पैकेज अनुपालन प्रमाणपत्र',
    'header.reports.subtitle': 'आधिकारिक नियामक निरीक्षण सारांश और फॉर्म-1 उल्लंघन नोटिस जनरेटर',
    'header.settings.title': 'सांविधिक नियम परिभाषा कैटलॉग',
    'header.settings.subtitle': 'विधिक माप विज्ञान अधिनियम नियम (LM-001 से LM-012)',
    'header.admin.title': 'एडमिन पैनल — अधिकारी प्रबंधन',
    'header.admin.subtitle': 'पंजीकरण स्वीकृत करें, भूमिकाएं प्रबंधित करें, और सिस्टम एक्सेस नियंत्रित करें',

    // Common
    'common.compliant': 'अनुपालन',
    'common.nonCompliant': 'गैर-अनुपालन',
    'common.needsReview': 'समीक्षा आवश्यक',
    'common.print': 'प्रिंट',
    'common.downloadPDF': 'PDF डाउनलोड',
    'common.back': 'वापस',
    'common.search': 'खोजें',
    'common.filter': 'फ़िल्टर',
    'common.language': 'भाषा',
    'common.english': 'English',
    'common.hindi': 'हिन्दी',
  },
};

const LANG_KEY = 'sih26034_language';

export function getLanguage() {
  return localStorage.getItem(LANG_KEY) || 'en';
}

export function setLanguage(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

export function t(key) {
  const lang = getLanguage();
  return translations[lang]?.[key] || translations['en']?.[key] || key;
}

export default translations;
