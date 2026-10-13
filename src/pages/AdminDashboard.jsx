import { useState, useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import api from '../services/api';
import './AdminDashboard.css';

const SCHEME_CATEGORIES = [
  'FINANCIAL_SUPPORT',
  'CROP_INSURANCE',
  'IRRIGATION',
  'SOLAR_ENERGY',
  'MACHINERY',
  'SOIL_HEALTH',
  'GENERAL',
];

const INITIAL_FORM_STATE = {
  name: '',
  category: 'FINANCIAL_SUPPORT',
  ministry: '',
  purpose: '',
  eligibleApplicants: '',
  benefits: '',
  requiredDocuments: '',
  applicationProcess: '',
  officialPortalUrl: '',
  sourceName: '',
  lastVerifiedDate: new Date().toISOString().split('T')[0],
  verificationStatus: 'VERIFIED',
};

const AdminDashboard = () => {
  const { t } = useLanguage();
  const searchInputId = useId();
  const categoryFilterId = useId();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [activeTab, setActiveTab] = useState('schemes');
  const [summary, setSummary] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Scheme Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation Modal
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, schemesRes, auditsRes] = await Promise.all([
        api.get('/admin/summary'),
        api.get('/schemes'),
        api.get('/admin/audit-logs'),
      ]);
      setSummary(summaryRes.data);
      setSchemes(schemesRes.data || []);
      setAuditLogs(auditsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
      setError(t('adminDashboard.msgLoadError', 'Failed to load admin data from the server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (scheme) => {
    setModalMode('edit');
    setFormData({
      id: scheme.id,
      name: scheme.name || '',
      category: scheme.category || 'FINANCIAL_SUPPORT',
      ministry: scheme.ministry || '',
      purpose: scheme.purpose || '',
      eligibleApplicants: scheme.eligibleApplicants || '',
      benefits: scheme.benefits || '',
      requiredDocuments: scheme.requiredDocuments || '',
      applicationProcess: scheme.applicationProcess || '',
      officialPortalUrl: scheme.officialPortalUrl || '',
      sourceName: scheme.sourceName || '',
      lastVerifiedDate: scheme.lastVerifiedDate || '',
      verificationStatus: scheme.verificationStatus || 'VERIFIED',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Scheme name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.ministry?.trim()) errors.ministry = 'Ministry is required';
    if (!formData.purpose?.trim()) errors.purpose = 'Purpose is required';
    if (!formData.eligibleApplicants?.trim()) errors.eligibleApplicants = 'Eligible applicants criteria is required';
    if (!formData.benefits?.trim()) errors.benefits = 'Benefits description is required';
    if (!formData.requiredDocuments?.trim()) errors.requiredDocuments = 'Required documents list is required';
    if (!formData.applicationProcess?.trim()) errors.applicationProcess = 'Application process is required';
    if (!formData.officialPortalUrl?.trim()) errors.officialPortalUrl = 'Official portal URL is required';
    if (!formData.sourceName?.trim()) errors.sourceName = 'Source name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        const res = await api.post('/schemes', formData);
        setSchemes((prev) => [res.data, ...prev]);
        setSuccessMsg(t('adminDashboard.msgSaveSuccess', 'Scheme saved successfully.'));
      } else {
        const res = await api.put(`/schemes/${formData.id}`, formData);
        setSchemes((prev) => prev.map((s) => (s.id === formData.id ? res.data : s)));
        setSuccessMsg(t('adminDashboard.msgSaveSuccess', 'Scheme saved successfully.'));
      }
      closeModal();
      // Refresh summary counts
      const sumRes = await api.get('/admin/summary');
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Save scheme failed:', err);
      alert(err.response?.data?.message || 'Failed to save scheme. Please check required fields.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (scheme) => {
    setDeleteCandidate(scheme);
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await api.delete(`/schemes/${deleteCandidate.id}`);
      setSchemes((prev) => prev.filter((s) => s.id !== deleteCandidate.id));
      setSuccessMsg(t('adminDashboard.msgDeleteSuccess', 'Scheme deleted successfully.'));
      setDeleteCandidate(null);
      // Refresh summary counts
      const sumRes = await api.get('/admin/summary');
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Delete scheme failed:', err);
      alert('Failed to delete scheme.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered schemes
  const filteredSchemes = schemes.filter((s) => {
    const matchesCategory = categoryFilter ? s.category === categoryFilter : true;
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.ministry && s.ministry.toLowerCase().includes(query)) ||
      (s.purpose && s.purpose.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-title-area">
          <div className="admin-header-icon" aria-hidden="true">⚙️</div>
          <div>
            <h1>{t('adminDashboard.title', 'Admin Dashboard')}</h1>
            <p className="admin-header-subtitle">
              {t('adminDashboard.welcomeBack', 'Welcome back, {name}!').replace(
                '{name}',
                user.fullName || t('adminDashboard.defaultName', 'Admin')
              )}{' '}
              • {t('adminDashboard.subtitle', 'System governance, live telemetry, and scheme record management')}
            </p>
          </div>
        </div>

        <div className="admin-header-actions">
          <div className="admin-user-pill">
            <span>👤 {user.fullName || 'Admin User'}</span>
            <span className="admin-badge-role">
              {t('adminDashboard.roleLabel', 'Role: {role}').replace('{role}', user.role || 'ADMIN')}
            </span>
          </div>

          <LanguageSelector id="admin-language-select" />

          <Link to="/" className="admin-nav-link">
            {t('adminDashboard.backHome', '← Back to Home')}
          </Link>
        </div>
      </header>

      {/* Notifications */}
      {successMsg && (
        <div className="admin-alert admin-alert-success">
          <span>✓ {successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            aria-label="Dismiss success message"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="admin-alert admin-alert-error">
          <span>⚠️ {error}</span>
          <button className="admin-btn-secondary" onClick={fetchData} style={{ padding: '0.2rem 0.6rem' }}>
            {t('adminDashboard.btnRefresh', 'Retry')}
          </button>
        </div>
      )}

      {/* Telemetry Metrics Row */}
      <section className="admin-metrics-grid" aria-label="System Metrics">
        <div className="admin-metric-card">
          <div className="admin-metric-icon">📜</div>
          <div className="admin-metric-content">
            <h3>{t('adminDashboard.statSchemes', 'Government Schemes')}</h3>
            <p className="admin-metric-value">{summary ? summary.totalGovernmentSchemes : '...'}</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">🌾</div>
          <div className="admin-metric-content">
            <h3>{t('adminDashboard.statCrops', 'Verified Crops')}</h3>
            <p className="admin-metric-value">{summary ? summary.totalCrops : '...'}</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">🔬</div>
          <div className="admin-metric-content">
            <h3>{t('adminDashboard.statDiseases', 'Disease Records')}</h3>
            <p className="admin-metric-value">{summary ? summary.totalDiseaseRecords : '...'}</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">👥</div>
          <div className="admin-metric-content">
            <h3>{t('adminDashboard.statUsers', 'Registered Users')}</h3>
            <p className="admin-metric-value">{summary ? summary.totalUsers : '...'}</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">🛡️</div>
          <div className="admin-metric-content">
            <h3>{t('adminDashboard.statAudits', 'Import Audit Logs')}</h3>
            <p className="admin-metric-value">{summary ? summary.totalAuditLogs : '...'}</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">🟢</div>
          <div className="admin-metric-content">
            <h3>{t('adminDashboard.statStatus', 'System Status')}</h3>
            <div className="admin-metric-status">
              <span className="status-dot"></span>
              {summary ? summary.systemStatus : 'OPERATIONAL'}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="admin-tabs" role="tablist">
        <button
          className={`admin-tab-btn ${activeTab === 'schemes' ? 'active' : ''}`}
          onClick={() => setActiveTab('schemes')}
          role="tab"
          aria-selected={activeTab === 'schemes'}
        >
          {t('adminDashboard.tabOverview', 'System Health & Schemes')}
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'audits' ? 'active' : ''}`}
          onClick={() => setActiveTab('audits')}
          role="tab"
          aria-selected={activeTab === 'audits'}
        >
          {t('adminDashboard.tabAuditLogs', 'Data Import Audit Logs')}
        </button>
      </div>

      {/* Tab 1: Schemes Management */}
      {activeTab === 'schemes' && (
        <section aria-label="Schemes Management">
          <div className="admin-toolbar">
            <div className="admin-toolbar-search">
              <label htmlFor={searchInputId} className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>Search Schemes</label>
              <input
                id={searchInputId}
                type="text"
                className="admin-search-input"
                placeholder={t('adminDashboard.searchSchemesPlaceholder', 'Search schemes by name or ministry...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <label htmlFor={categoryFilterId} className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>Category Filter</label>
              <select
                id={categoryFilterId}
                className="admin-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">{t('adminDashboard.filterAllCategories', 'All Categories')}</option>
                {SCHEME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <button className="admin-btn-primary" onClick={openCreateModal} id="admin-add-scheme-btn">
              {t('adminDashboard.btnAddScheme', '+ Add New Scheme')}
            </button>
          </div>

          {loading ? (
            <div className="admin-loading-state">
              <div className="admin-spinner"></div>
              <span>Loading schemes data...</span>
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">📂</div>
              <p>{t('adminDashboard.emptySchemes', 'No government schemes found matching your criteria.')}</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('adminDashboard.thSchemeName', 'Scheme Name')}</th>
                    <th>{t('adminDashboard.thCategory', 'Category')}</th>
                    <th>{t('adminDashboard.thMinistry', 'Ministry')}</th>
                    <th>{t('adminDashboard.thPurpose', 'Purpose')}</th>
                    <th>{t('adminDashboard.thStatus', 'Status')}</th>
                    <th>{t('adminDashboard.thSource', 'Source Attribution')}</th>
                    <th>{t('adminDashboard.thActions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchemes.map((scheme) => (
                    <tr key={scheme.id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{scheme.name}</td>
                      <td>
                        <span className="admin-badge badge-category">
                          {scheme.category ? scheme.category.replace('_', ' ') : 'GENERAL'}
                        </span>
                      </td>
                      <td>{scheme.ministry}</td>
                      <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {scheme.purpose}
                      </td>
                      <td>
                        <span className="admin-badge badge-verified">
                          {scheme.verificationStatus || 'VERIFIED'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {scheme.sourceName || 'Govt of India'}
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            className="btn-action-edit"
                            onClick={() => openEditModal(scheme)}
                          >
                            {t('adminDashboard.btnEdit', 'Edit')}
                          </button>
                          <button
                            className="btn-action-delete"
                            onClick={() => confirmDelete(scheme)}
                          >
                            {t('adminDashboard.btnDelete', 'Delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audits' && (
        <section aria-label="Audit Logs">
          {loading ? (
            <div className="admin-loading-state">
              <div className="admin-spinner"></div>
              <span>Loading data audit telemetry...</span>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">📋</div>
              <p>{t('adminDashboard.emptyAudits', 'No data import audit records recorded yet.')}</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('adminDashboard.thAuditDomain', 'Domain Dataset')}</th>
                    <th>{t('adminDashboard.thAuditFile', 'Source File')}</th>
                    <th>{t('adminDashboard.thAuditParsed', 'Parsed')}</th>
                    <th>{t('adminDashboard.thAuditInserted', 'Inserted')}</th>
                    <th>{t('adminDashboard.thAuditSuperseded', 'Superseded')}</th>
                    <th>{t('adminDashboard.thAuditRejected', 'Rejected')}</th>
                    <th>{t('adminDashboard.thAuditStatus', 'Execution Status')}</th>
                    <th>{t('adminDashboard.thAuditStarted', 'Timestamp')}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600 }}>{log.domainDataset}</td>
                      <td>{log.sourceFileName}</td>
                      <td>{log.totalRecordsParsed}</td>
                      <td>{log.insertedRecords}</td>
                      <td>{log.supersededRecords}</td>
                      <td>{log.rejectedRecords}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            log.executionStatus === 'SUCCESS'
                              ? 'badge-success'
                              : log.executionStatus === 'FAILED'
                              ? 'badge-failed'
                              : 'badge-blue'
                          }`}
                        >
                          {log.executionStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {log.startedAt ? new Date(log.startedAt).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <h2>
              {modalMode === 'create'
                ? t('adminDashboard.modalAddTitle', 'Add Government Scheme')
                : t('adminDashboard.modalEditTitle', 'Edit Government Scheme')}
            </h2>

            <form onSubmit={handleSaveScheme}>
              <div className="admin-form-grid">
                <div className="admin-form-group full-width">
                  <label>{t('adminDashboard.lblName', 'Scheme Name *')}</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  {formErrors.name && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{formErrors.name}</span>}
                </div>

                <div className="admin-form-group">
                  <label>{t('adminDashboard.lblCategory', 'Category *')}</label>
                  <select
                    className="admin-form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {SCHEME_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>{t('adminDashboard.lblMinistry', 'Ministry *')}</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.ministry}
                    onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                    required
                  />
                  {formErrors.ministry && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{formErrors.ministry}</span>}
                </div>

                <div className="admin-form-group full-width">
                  <label>{t('adminDashboard.lblPurpose', 'Purpose *')}</label>
                  <textarea
                    className="admin-form-textarea"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                  />
                  {formErrors.purpose && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{formErrors.purpose}</span>}
                </div>

                <div className="admin-form-group">
                  <label>{t('adminDashboard.lblEligibleApplicants', 'Eligible Applicants Criteria *')}</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.eligibleApplicants}
                    onChange={(e) => setFormData({ ...formData, eligibleApplicants: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>{t('adminDashboard.lblBenefits', 'Benefits Summary *')}</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group full-width">
                  <label>{t('adminDashboard.lblRequiredDocuments', 'Required Documents *')}</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.requiredDocuments}
                    onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group full-width">
                  <label>{t('adminDashboard.lblApplicationProcess', 'Application Process *')}</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.applicationProcess}
                    onChange={(e) => setFormData({ ...formData, applicationProcess: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>{t('adminDashboard.lblOfficialPortalUrl', 'Official Portal URL *')}</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    value={formData.officialPortalUrl}
                    onChange={(e) => setFormData({ ...formData, officialPortalUrl: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>{t('adminDashboard.lblSourceName', 'Source Name *')}</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.sourceName}
                    onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={closeModal} disabled={isSaving}>
                  {t('adminDashboard.btnCancel', 'Cancel')}
                </button>
                <button type="submit" className="admin-btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : t('adminDashboard.btnSave', 'Save Scheme')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card" style={{ maxWidth: '480px' }}>
            <h2 style={{ color: '#be123c' }}>
              ⚠️ {t('adminDashboard.confirmDeleteTitle', 'Confirm Scheme Deletion')}
            </h2>
            <p style={{ color: '#475569', margin: '1rem 0 1.5rem', lineHeight: 1.5 }}>
              {t(
                'adminDashboard.confirmDeleteText',
                'Are you sure you want to delete scheme: "{name}"? This action cannot be undone.'
              ).replace('{name}', deleteCandidate.name)}
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
              >
                {t('adminDashboard.btnCancel', 'Cancel')}
              </button>
              <button
                type="button"
                className="btn-action-delete"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : t('adminDashboard.btnConfirmDelete', 'Yes, Delete Scheme')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
