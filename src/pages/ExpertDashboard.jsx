import { useState, useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import api from '../services/api';
import './ExpertDashboard.css';

const ExpertDashboard = () => {
  const { t } = useLanguage();
  const searchKnowledgeId = useId();
  const cropFilterId = useId();
  const severityFilterId = useId();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [activeTab, setActiveTab] = useState('escalations');
  const [escalations, setEscalations] = useState([]);
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters for Escalations
  const [cropFilter, setCropFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Search for Knowledge
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);

  const fetchExpertData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [escalationsRes, knowledgeRes] = await Promise.all([
        api.get('/expert/escalations'),
        api.get('/disease-guidance/knowledge'),
      ]);
      setEscalations(escalationsRes.data || []);
      setKnowledgeList(knowledgeRes.data || []);
    } catch (err) {
      console.error('Failed to load expert advisory data:', err);
      setError(t('expertDashboard.errLoadExpert', 'Failed to load expert advisory data from the server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpertData();
  }, []);

  // Filtered escalations
  const filteredEscalations = escalations.filter((c) => {
    const matchesCrop = cropFilter ? c.cropName?.toLowerCase() === cropFilter.toLowerCase() : true;
    const matchesSeverity = severityFilter ? c.severityLevel === severityFilter : true;
    return matchesCrop && matchesSeverity;
  });

  // Unique crops from escalations
  const availableCrops = Array.from(new Set(escalations.map((c) => c.cropName).filter(Boolean)));

  // Filtered knowledge
  const filteredKnowledge = knowledgeList.filter((k) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      (k.cropName && k.cropName.toLowerCase().includes(query)) ||
      (k.diseaseName && k.diseaseName.toLowerCase().includes(query)) ||
      (k.scientificName && k.scientificName.toLowerCase().includes(query)) ||
      (k.symptomsDescription && k.symptomsDescription.toLowerCase().includes(query))
    );
  });

  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'SEVERE':
        return 'badge-severity-severe';
      case 'MODERATE':
        return 'badge-severity-moderate';
      default:
        return 'badge-severity-mild';
    }
  };

  return (
    <div className="expert-dashboard-container">
      {/* Header */}
      <header className="expert-header">
        <div className="expert-header-title-area">
          <div className="expert-header-icon" aria-hidden="true">🔬</div>
          <div>
            <h1>{t('expertDashboard.title', 'Expert Dashboard')}</h1>
            <p className="expert-header-subtitle">
              {t('expertDashboard.welcomeBack', 'Welcome back, {name}!').replace(
                '{name}',
                user.fullName || t('expertDashboard.defaultName', 'Expert')
              )}{' '}
              • {t('expertDashboard.subtitle', 'Agronomic review, urgent KVK farmer referrals, and verified ICAR disease guidance')}
            </p>
          </div>
        </div>

        <div className="expert-header-actions">
          <div className="expert-user-pill">
            <span>👨‍🔬 {user.fullName || 'Agricultural Expert'}</span>
            <span className="expert-badge-role">
              {t('expertDashboard.roleLabel', 'Role: {role}').replace('{role}', user.role || 'EXPERT')}
            </span>
          </div>

          <LanguageSelector id="expert-language-select" />

          <Link to="/" className="expert-nav-link">
            {t('expertDashboard.backHome', '← Back to Home')}
          </Link>
        </div>
      </header>

      {/* Privacy Guarantee Notice */}
      <div className="expert-privacy-banner" role="note">
        <span style={{ fontSize: '1.2rem' }}>🔒</span>
        <span>
          {t(
            'expertDashboard.escalationNotice',
            'Farmer identity and PII are protected under privacy policy. Advisory records display symptom and crop context only.'
          )}
        </span>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {error}</span>
          <button className="expert-btn-secondary" onClick={fetchExpertData} style={{ padding: '0.2rem 0.6rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="expert-tabs" role="tablist">
        <button
          className={`expert-tab-btn ${activeTab === 'escalations' ? 'active' : ''}`}
          onClick={() => setActiveTab('escalations')}
          role="tab"
          aria-selected={activeTab === 'escalations'}
        >
          {t('expertDashboard.tabEscalations', 'KVK Urgent Referrals')} ({escalations.length})
        </button>
        <button
          className={`expert-tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
          role="tab"
          aria-selected={activeTab === 'knowledge'}
        >
          {t('expertDashboard.tabKnowledge', 'ICAR Disease Directory')} ({knowledgeList.length})
        </button>
      </div>

      {/* Tab 1: KVK Urgent Referrals */}
      {activeTab === 'escalations' && (
        <section aria-label="KVK Escalations">
          <div className="expert-toolbar">
            <div className="expert-toolbar-controls">
              <label htmlFor={cropFilterId} className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>Crop Filter</label>
              <select
                id={cropFilterId}
                className="expert-select"
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
              >
                <option value="">{t('expertDashboard.filterAllCrops', 'All Crops')}</option>
                {availableCrops.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>

              <label htmlFor={severityFilterId} className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>Severity Filter</label>
              <select
                id={severityFilterId}
                className="expert-select"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="">{t('expertDashboard.filterAllSeverities', 'All Severities')}</option>
                <option value="SEVERE">Severe</option>
                <option value="MODERATE">Moderate</option>
                <option value="MILD">Mild</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="expert-loading-state">
              <div className="expert-spinner"></div>
              <span>Loading urgent escalation cases...</span>
            </div>
          ) : filteredEscalations.length === 0 ? (
            <div className="expert-empty-state">
              <div className="expert-empty-icon">🌱</div>
              <p>{t('expertDashboard.emptyEscalations', 'No urgent crop escalation cases currently pending expert review.')}</p>
            </div>
          ) : (
            <div className="expert-cards-grid">
              {filteredEscalations.map((item) => (
                <div key={item.id} className="expert-card">
                  <div>
                    <div className="expert-card-top">
                      <span className="expert-crop-badge">🌾 {item.cropName}</span>
                      <span className="badge-kvk-urgent">
                        {t('expertDashboard.badgeKvkPending', 'KVK Referral Pending')}
                      </span>
                    </div>

                    <div className="expert-card-body">
                      <div className="expert-card-row">
                        <span>{t('expertDashboard.lblSeverity', 'Severity Level')}:</span>
                        <span className={getSeverityBadgeClass(item.severityLevel)}>
                          {item.severityLevel}
                        </span>
                      </div>

                      <div className="expert-card-row">
                        <span>{t('expertDashboard.lblAffectedPart', 'Affected Plant Part')}:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.affectedPart}</span>
                      </div>

                      <div className="expert-card-row">
                        <span>{t('expertDashboard.lblDuration', 'Symptom Duration')}:</span>
                        <span>{item.symptomDurationDays} days</span>
                      </div>

                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                          {t('expertDashboard.lblSymptoms', 'Reported Symptoms')}:
                        </span>
                        <div className="expert-card-symptoms">
                          {item.symptomsDescription}
                        </div>
                      </div>

                      {item.matchedDiseaseNames && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
                          <span style={{ color: '#64748b' }}>{t('expertDashboard.lblMatchedDiseases', 'Potential Conditions')}: </span>
                          <span style={{ fontWeight: 600, color: '#0369a1' }}>{item.matchedDiseaseNames}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="expert-card-footer">
                    <span className="expert-date">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                    <button
                      className="expert-btn-view"
                      onClick={() => setSelectedCase(item)}
                    >
                      {t('expertDashboard.btnViewDossier', 'View Advisory Dossier')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: ICAR Disease Knowledge Directory */}
      {activeTab === 'knowledge' && (
        <section aria-label="ICAR Disease Directory">
          <div className="expert-toolbar">
            <div className="expert-toolbar-controls">
              <label htmlFor={searchKnowledgeId} className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>Search Knowledge</label>
              <input
                id={searchKnowledgeId}
                type="text"
                className="expert-input"
                placeholder={t('expertDashboard.searchPlaceholder', 'Search by crop, disease, or symptoms...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="expert-loading-state">
              <div className="expert-spinner"></div>
              <span>Loading ICAR agricultural disease directory...</span>
            </div>
          ) : filteredKnowledge.length === 0 ? (
            <div className="expert-empty-state">
              <div className="expert-empty-icon">📖</div>
              <p>{t('expertDashboard.emptyKnowledge', 'No disease knowledge records found matching your search.')}</p>
            </div>
          ) : (
            <div className="expert-table-wrapper">
              <table className="expert-table">
                <thead>
                  <tr>
                    <th>{t('expertDashboard.lblCrop', 'Crop')}</th>
                    <th>{t('expertDashboard.thDisease', 'Disease Name')}</th>
                    <th>{t('expertDashboard.thScientific', 'Scientific Name')}</th>
                    <th>{t('expertDashboard.lblAffectedPart', 'Affected Plant Part')}</th>
                    <th>{t('expertDashboard.thAttribution', 'Verified Source')}</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKnowledge.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.cropName}</td>
                      <td style={{ fontWeight: 600 }}>{item.diseaseName}</td>
                      <td style={{ fontStyle: 'italic', color: '#64748b' }}>{item.scientificName}</td>
                      <td>{item.affectedPlantParts}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                          {item.sourceName || 'ICAR'}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Status: {item.verificationStatus || 'VERIFIED'}
                        </div>
                      </td>
                      <td>
                        <button
                          className="expert-btn-view"
                          onClick={() => setSelectedKnowledge(item)}
                        >
                          View Guidance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Case Dossier Modal */}
      {selectedCase && (
        <div className="expert-modal-backdrop" role="dialog" aria-modal="true">
          <div className="expert-modal-card">
            <h2>{t('expertDashboard.dossierTitle', 'Agronomic Referral Dossier')}</h2>

            <div className="expert-dossier-section">
              <h4>{t('expertDashboard.dossierCropContext', 'Crop Context')}</h4>
              <div className="expert-dossier-box">
                <div><strong>{t('expertDashboard.lblCrop', 'Crop')}:</strong> {selectedCase.cropName}</div>
                <div><strong>{t('expertDashboard.lblAffectedPart', 'Affected Part')}:</strong> {selectedCase.affectedPart}</div>
                <div><strong>{t('expertDashboard.lblDuration', 'Duration')}:</strong> {selectedCase.symptomDurationDays} days</div>
                <div><strong>{t('expertDashboard.lblSeverity', 'Severity')}:</strong> {selectedCase.severityLevel}</div>
              </div>
            </div>

            <div className="expert-dossier-section">
              <h4>{t('expertDashboard.dossierClinicalSigns', 'Observed Clinical Signs')}</h4>
              <div className="expert-dossier-box">
                {selectedCase.symptomsDescription}
              </div>
            </div>

            {selectedCase.matchedDiseaseNames && (
              <div className="expert-dossier-section">
                <h4>{t('expertDashboard.dossierIdentified', 'Identified Condition')}</h4>
                <div className="expert-dossier-box" style={{ fontWeight: 600, color: '#0369a1' }}>
                  {selectedCase.matchedDiseaseNames}
                </div>
              </div>
            )}

            <div className="expert-dossier-section">
              <h4>{t('expertDashboard.dossierKvkProtocol', 'Urgent KVK Extension Protocol')}</h4>
              <div className="expert-dossier-box urgent-alert">
                ⚠️ {t(
                  'expertDashboard.dossierKvkInstruction',
                  'This case exhibited acute symptoms exceeding safe threshold. Direct field extension visit or Krishi Vigyan Kendra sample dispatch is recommended.'
                )}
              </div>
            </div>

            <div className="expert-modal-actions">
              <button
                type="button"
                className="expert-btn-secondary"
                onClick={() => setSelectedCase(null)}
              >
                {t('expertDashboard.btnClose', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Guidance Modal */}
      {selectedKnowledge && (
        <div className="expert-modal-backdrop" role="dialog" aria-modal="true">
          <div className="expert-modal-card">
            <h2>{t('expertDashboard.modalKnowledgeTitle', 'ICAR Disease Guidance Details')}</h2>

            <div className="expert-dossier-section">
              <div className="expert-dossier-box">
                <div><strong>Crop:</strong> {selectedKnowledge.cropName}</div>
                <div><strong>Disease:</strong> {selectedKnowledge.diseaseName}</div>
                <div><strong>Scientific Name:</strong> <em>{selectedKnowledge.scientificName}</em></div>
                <div><strong>Affected Plant Parts:</strong> {selectedKnowledge.affectedPlantParts}</div>
              </div>
            </div>

            <div className="expert-dossier-section">
              <h4>Symptoms Description</h4>
              <div className="expert-dossier-box">
                {selectedKnowledge.symptomsDescription}
              </div>
            </div>

            <div className="expert-dossier-section">
              <h4>Non-Chemical Management</h4>
              <div className="expert-dossier-box">
                {selectedKnowledge.nonChemicalManagement || 'Organic neem formulation or biological control agents as per ICAR guidelines.'}
              </div>
            </div>

            <div className="expert-dossier-section">
              <h4>Cultural Practices</h4>
              <div className="expert-dossier-box">
                {selectedKnowledge.culturalPractices || 'Crop rotation, adequate spacing, and removal of infected debris.'}
              </div>
            </div>

            <div className="expert-dossier-section">
              <h4>KVK Extension Advisory</h4>
              <div className="expert-dossier-box">
                {selectedKnowledge.kvkExtensionAdvisory || 'Contact local Krishi Vigyan Kendra extension specialist for advisory.'}
              </div>
            </div>

            <div className="expert-dossier-section">
              <h4>Source Provenance</h4>
              <div className="expert-dossier-box" style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Source: {selectedKnowledge.sourceName || 'ICAR'} • Verified: {selectedKnowledge.lastVerifiedDate || 'N/A'} • Status: {selectedKnowledge.verificationStatus || 'VERIFIED'}
              </div>
            </div>

            <div className="expert-modal-actions">
              <button
                type="button"
                className="expert-btn-secondary"
                onClick={() => setSelectedKnowledge(null)}
              >
                {t('expertDashboard.btnClose', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertDashboard;
