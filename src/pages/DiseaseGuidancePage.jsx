import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import './DiseaseGuidancePage.css';

const CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Chickpea', 'Groundnut'];
const PLANT_PARTS = ['Leaves', 'Stem/Stalk', 'Roots', 'Fruit/Boll/Grains', 'Whole Plant'];
const SEVERITIES = [
  { key: 'MILD', label: 'Mild (Few leaves/plants affected)' },
  { key: 'MODERATE', label: 'Moderate (Noticeable spreading across section)' },
  { key: 'SEVERE', label: 'Severe (Rapid spreading / heavy damage)' }
];

export default function DiseaseGuidancePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('ASSESS'); // 'ASSESS' or 'DIRECTORY'

  const getCropDisplayName = (cropName) => {
    if (!cropName) return '';
    return t(`crops.${cropName}`, cropName);
  };

  // Assessment Form State
  const [formData, setFormData] = useState({
    cropName: 'Rice',
    affectedPart: 'Leaves',
    symptomDurationDays: 3,
    severityLevel: 'MODERATE',
    symptomsDescription: ''
  });

  const [assessmentResult, setAssessmentResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [assessError, setAssessError] = useState(null);

  // Directory State
  const [directoryItems, setDirectoryItems] = useState([]);
  const [dirLoading, setDirLoading] = useState(false);
  const [dirError, setDirError] = useState(null);
  const [selectedDirCrop, setSelectedDirCrop] = useState('ALL');
  const [dirSearchQuery, setDirSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState(null);

  useEffect(() => {
    if (activeTab === 'DIRECTORY') {
      fetchDirectory();
    }
  }, [activeTab, selectedDirCrop]);

  const fetchDirectory = async () => {
    setDirLoading(true);
    setDirError(null);
    try {
      const params = {};
      if (selectedDirCrop !== 'ALL') {
        params.crop = selectedDirCrop;
      }
      if (dirSearchQuery.trim()) {
        params.search = dirSearchQuery.trim();
      }
      const response = await api.get('/disease-guidance/knowledge', { params });
      setDirectoryItems(response.data || []);
    } catch (err) {
      console.error('Failed to fetch disease directory:', err);
      setDirError(t('disease.dirErrorText', 'Unable to load disease knowledge directory. Please check backend connection.'));
    } finally {
      setDirLoading(false);
    }
  };

  const handleAssessSubmit = async (e) => {
    e.preventDefault();
    if (!formData.symptomsDescription.trim()) {
      setAssessError(t('disease.errorEmptyDescription', 'Please describe the observed plant symptoms in detail.'));
      return;
    }

    setSubmitting(true);
    setAssessError(null);
    setAssessmentResult(null);

    try {
      const response = await api.post('/disease-guidance/assess', formData);
      setAssessmentResult(response.data);
    } catch (err) {
      console.error('Assessment request failed:', err);
      setAssessError(err.response?.data?.message || t('disease.errorAssessmentFailed', 'Failed to complete disease assessment. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="disease-page">
      {/* Header */}
      <header className="disease-header">
        <div className="disease-header-container">
          <div className="disease-logo-group">
            <Link to="/farmer/dashboard" className="back-link">
              {t('disease.backToDashboard', '← Back to Dashboard')}
            </Link>
            <h1 className="disease-brand">{t('app.name', 'KisanMitra AI')}</h1>
          </div>
          <div className="disease-header-actions">
            <div className="disease-header-badge">
              {t('disease.headerBadge', '🔬 Crop Health & Disease Guidance')}
            </div>
            <LanguageSelector id="disease-language-select" />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="disease-hero">
        <div className="disease-hero-container">
          <h2 className="disease-hero-title">{t('disease.heroTitle', 'Crop Health & Disease Intelligence')}</h2>
          <p className="disease-hero-subtitle">
            {t('disease.heroSubtitle', 'Evidence-based disease possibilities, non-chemical management practices, and Krishi Vigyan Kendra (KVK) expert consultation advisories sourced from ICAR and State Agricultural Universities.')}
          </p>

          {/* Navigation Tabs */}
          <div className="disease-nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === 'ASSESS' ? 'active' : ''}`}
              onClick={() => setActiveTab('ASSESS')}
            >
              {t('disease.tabAssess', '📋 Symptom Assessment Tool')}
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'DIRECTORY' ? 'active' : ''}`}
              onClick={() => setActiveTab('DIRECTORY')}
            >
              {t('disease.tabDirectory', '📚 ICAR Disease Directory')}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="disease-main">
        <div className="disease-main-container">
          {/* TAB 1: SYMPTOM ASSESSMENT TOOL */}
          {activeTab === 'ASSESS' && (
            <div className="assessment-section">
              <form className="assessment-form-card" onSubmit={handleAssessSubmit}>
                <h3 className="form-card-title">{t('disease.formCardTitle', 'Record Crop Symptoms')}</h3>

                <div className="form-grid">
                  {/* Crop Selection */}
                  <div className="form-group">
                    <label>{t('disease.targetCropLabel', 'Target Crop *')}</label>
                    <select
                      value={formData.cropName}
                      onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    >
                      {CROPS.map((c) => (
                        <option key={c} value={c}>{getCropDisplayName(c)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Affected Plant Part */}
                  <div className="form-group">
                    <label>{t('disease.affectedPartLabel', 'Affected Plant Part *')}</label>
                    <select
                      value={formData.affectedPart}
                      onChange={(e) => setFormData({ ...formData, affectedPart: e.target.value })}
                    >
                      {PLANT_PARTS.map((p) => (
                        <option key={p} value={p}>{t(`disease.plantParts.${p}`, p)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="form-group">
                    <label>{t('disease.symptomDurationLabel', 'Symptom Duration (Days) *')}</label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={formData.symptomDurationDays}
                      onChange={(e) => setFormData({ ...formData, symptomDurationDays: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  {/* Severity Level */}
                  <div className="form-group">
                    <label>{t('disease.severityLevelLabel', 'Severity Level *')}</label>
                    <select
                      value={formData.severityLevel}
                      onChange={(e) => setFormData({ ...formData, severityLevel: e.target.value })}
                    >
                      {SEVERITIES.map((s) => {
                        const labelMap = {
                          MILD: t('disease.severityMild', s.label),
                          MODERATE: t('disease.severityMod', s.label),
                          SEVERE: t('disease.severitySev', s.label)
                        };
                        return (
                          <option key={s.key} value={s.key}>{labelMap[s.key] || s.label}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Symptom Description Textarea */}
                <div className="form-group full-width">
                  <label>{t('disease.describeSymptomsLabel', 'Describe Observed Symptoms in Detail *')}</label>
                  <textarea
                    rows="4"
                    placeholder={t('disease.symptomsPlaceholder', 'Describe lesion shape, color, spots, wilting, leaf yellowing, ooze, or stem rotting (e.g. Spindle-shaped grey lesions with brown border on upper leaves)...')}
                    value={formData.symptomsDescription}
                    onChange={(e) => setFormData({ ...formData, symptomsDescription: e.target.value })}
                  />
                </div>

                {assessError && (
                  <div className="form-error-banner">
                    ⚠️ {assessError}
                  </div>
                )}

                <button type="submit" className="btn-assess-submit" disabled={submitting}>
                  {submitting
                    ? t('disease.analyzingBtn', 'Analyzing Symptoms against ICAR Database...')
                    : t('disease.analyzeBtn', 'Analyze Observed Symptoms 🔍')}
                </button>
              </form>

              {/* Assessment Output Panel */}
              {assessmentResult && (
                <div className="assessment-results-panel">
                  {/* Disclaimer Banner */}
                  <div className="disclaimer-banner">
                    <span className="disclaimer-icon">⚠️</span>
                    <div className="disclaimer-text">
                      <strong>{t('disease.diagnosticNoticeLabel', 'Diagnostic Notice:')}</strong> {assessmentResult.diagnosticDisclaimer}
                    </div>
                  </div>

                  {/* Chemical Advisory Notice */}
                  <div className="chemical-notice-banner">
                    <span className="notice-icon">🛡️</span>
                    <div className="notice-text">
                      <strong>{t('disease.nonChemicalNoticeLabel', 'Non-Chemical Priority:')}</strong> {assessmentResult.chemicalAdvisoryNotice}
                    </div>
                  </div>

                  {/* KVK Escalation Banner */}
                  {assessmentResult.isUrgentKvkConsultationRecommended && (
                    <div className="kvk-escalation-card">
                      <div className="kvk-card-header">
                        <span className="kvk-alert-badge">{t('disease.kvkAlertBadge', '🚨 Urgent KVK / Extension Officer Action')}</span>
                        <h4>{t('disease.kvkHeader', 'Expert Field Inspection Advised')}</h4>
                      </div>
                      <p className="kvk-reason-text">{assessmentResult.kvkEscalationReason}</p>
                      <div className="kvk-action-box">
                        <strong>{t('disease.kvkActionStepsTitle', 'Action Steps for Farmer:')}</strong>
                        <ul>
                          <li>{t('disease.kvkStep1', 'Contact your nearest district Krishi Vigyan Kendra (KVK) extension office or Block Agriculture Officer.')}</li>
                          <li>{t('disease.kvkStep2', 'Collect fresh plant tissue samples showing symptom boundaries in a dry polythene bag for laboratory pathology testing.')}</li>
                          <li>{t('disease.kvkStep3', 'Isolate severely infected plants or avoid flood irrigation across infected patches to prevent pathogen dissemination.')}</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Possible Causes List */}
                  <div className="possible-causes-section">
                    <h3 className="section-title">
                      {t('disease.possibleCausesTitle', 'Matched Possible Causes ({count})').replace('{count}', assessmentResult.possibleCauses.length)}
                    </h3>

                    {assessmentResult.possibleCauses.length === 0 ? (
                      <div className="no-matches-box">
                        <h4>{t('disease.noExactMatchHeader', 'No Exact Disease Match Found in Database')}</h4>
                        <p>
                          {t('disease.noExactMatchDesc', 'Observed symptoms for {crop} could not be definitively matched against cataloged literature. Please bring a physical plant sample to your local KVK or agricultural extension station for expert laboratory examination.').replace('{crop}', getCropDisplayName(assessmentResult.submittedCrop))}
                        </p>
                      </div>
                    ) : (
                      <div className="causes-grid">
                        {assessmentResult.possibleCauses.map((disease) => (
                          <div key={disease.id} className="disease-card">
                            <div className="disease-card-header">
                              <span className="crop-badge">{getCropDisplayName(disease.cropName)}</span>
                              <span className="verified-badge">✓ {disease.sourceName}</span>
                            </div>

                            <h4 className="disease-name">{disease.diseaseName}</h4>
                            <div className="scientific-name">🔬 <em>{disease.scientificName}</em></div>

                            <div className="disease-detail-item">
                              <span className="detail-label">{t('disease.affectedPartsLabel', 'Affected Plant Parts:')}</span>
                              <span className="detail-val">{disease.affectedPlantParts}</span>
                            </div>

                            <div className="disease-detail-item">
                              <span className="detail-label">{t('disease.keySymptomsLabel', 'Key Symptoms:')}</span>
                              <p className="detail-text">{disease.symptomsDescription}</p>
                            </div>

                            <div className="disease-management-box">
                              <h5>{t('disease.nonChemicalBoxHeader', '🌱 Non-Chemical & Biological Management')}</h5>
                              <p>{disease.nonChemicalManagement}</p>
                            </div>

                            <div className="disease-cultural-box">
                              <h5>{t('disease.culturalBoxHeader', '🚜 Cultural Practices & Field Sanitation')}</h5>
                              <p>{disease.culturalPractices}</p>
                            </div>

                            <div className="disease-card-footer">
                              <div className="provenance-meta">
                                <span>{t('disease.verifiedDateLabel', 'Verified Date: {date}').replace('{date}', disease.lastVerifiedDate)}</span>
                              </div>
                              <a
                                href={disease.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-source"
                              >
                                {t('disease.officialSourceLink', 'Official ICAR Source ↗')}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DISEASE KNOWLEDGE DIRECTORY */}
          {activeTab === 'DIRECTORY' && (
            <div className="directory-section">
              {/* Directory Filter Bar */}
              <div className="directory-filter-bar">
                <div className="dir-search-box">
                  <input
                    type="text"
                    placeholder={t('disease.dirSearchPlaceholder', 'Search by disease name, pathogen, or symptom (e.g. blast, rust, wilt)...')}
                    value={dirSearchQuery}
                    onChange={(e) => setDirSearchQuery(e.target.value)}
                  />
                  <button onClick={fetchDirectory}>{t('disease.searchBtn', 'Search')}</button>
                </div>

                <div className="dir-crop-pills">
                  <button
                    className={`crop-pill ${selectedDirCrop === 'ALL' ? 'active' : ''}`}
                    onClick={() => setSelectedDirCrop('ALL')}
                  >
                    {t('disease.allCropsPill', 'All Crops')}
                  </button>
                  {CROPS.map((c) => (
                    <button
                      key={c}
                      className={`crop-pill ${selectedDirCrop === c ? 'active' : ''}`}
                      onClick={() => setSelectedDirCrop(c)}
                    >
                      {getCropDisplayName(c)}
                    </button>
                  ))}
                </div>
              </div>

              {dirLoading ? (
                <div className="disease-loading-state">
                  <div className="spinner"></div>
                  <p>{t('disease.dirLoadingText', 'Loading ICAR Disease Knowledge Entries...')}</p>
                </div>
              ) : dirError ? (
                <div className="disease-error-state">
                  <p>{dirError}</p>
                  <button onClick={fetchDirectory}>{t('disease.retryBtn', 'Retry')}</button>
                </div>
              ) : directoryItems.length === 0 ? (
                <div className="disease-empty-state">
                  <p>{t('disease.dirEmptyText', 'No verified disease knowledge entries found matching your query.')}</p>
                </div>
              ) : (
                <div className="causes-grid">
                  {directoryItems.map((item) => (
                    <div key={item.id} className="disease-card">
                      <div className="disease-card-header">
                        <span className="crop-badge">{getCropDisplayName(item.cropName)}</span>
                        <span className="verified-badge">✓ {item.sourceName || t('disease.verifiedSource', 'Verified Source')}</span>
                      </div>

                      <h4 className="disease-name">{item.diseaseName}</h4>
                      <div className="scientific-name">🔬 <em>{item.scientificName}</em></div>

                      <p className="detail-text">{item.symptomsDescription}</p>

                      <div className="disease-card-footer">
                        <button
                          className="btn-view-modal"
                          onClick={() => setActiveModalItem(item)}
                        >
                          {t('disease.viewGuideBtn', 'View Management Guide')}
                        </button>
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-source"
                        >
                          {t('disease.icarRefLink', 'ICAR Ref ↗')}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Directory Item Details Modal */}
      {activeModalItem && (
        <div className="modal-overlay" onClick={() => setActiveModalItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="crop-badge">{getCropDisplayName(activeModalItem.cropName)}</span>
                <h2>{activeModalItem.diseaseName}</h2>
                <div className="scientific-name">🔬 <em>{activeModalItem.scientificName}</em></div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setActiveModalItem(null)}
                aria-label={t('common.close', 'Close')}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>{t('disease.modalAffectedParts', '🍃 Affected Plant Parts')}</h4>
                <p>{activeModalItem.affectedPlantParts}</p>
              </div>

              <div className="modal-section">
                <h4>{t('disease.modalKeySymptoms', '🔍 Key Symptoms')}</h4>
                <p>{activeModalItem.symptomsDescription}</p>
              </div>

              <div className="modal-section">
                <h4>{t('disease.modalNonChemical', '🌱 Non-Chemical & Biological Management')}</h4>
                <p>{activeModalItem.nonChemicalManagement}</p>
              </div>

              <div className="modal-section">
                <h4>{t('disease.modalCultural', '🚜 Cultural Practices & Sanitation')}</h4>
                <p>{activeModalItem.culturalPractices}</p>
              </div>

              <div className="modal-section">
                <h4>{t('disease.modalKvkAdvisory', '📢 KVK Extension Advisory Threshold')}</h4>
                <p>{activeModalItem.kvkExtensionAdvisory}</p>
              </div>

              <div className="modal-provenance-box">
                <div><strong>{t('disease.modalSourceLabel', 'Source:')}</strong> {activeModalItem.sourceName}</div>
                <div><strong>{t('disease.modalVerifiedLabel', 'Last Verified:')}</strong> {activeModalItem.lastVerifiedDate}</div>
              </div>
            </div>

            <div className="modal-footer">
              <a
                href={activeModalItem.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-portal-large"
              >
                {t('disease.modalOfficialRef', 'View Official ICAR / Extension Reference ↗')}
              </a>
              <button className="btn-close-modal" onClick={() => setActiveModalItem(null)}>
                {t('disease.modalCloseBtn', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
