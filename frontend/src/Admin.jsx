import React, { useState, useEffect } from 'react';
import kfaLogo from './assets/Logofull.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CATEGORY_OPTIONS = ['Complaint', 'Suggestion', 'Improvement Idea', 'Appreciation', 'Other'];
const BRANCH_OPTIONS   = ['Guduvancheri', 'Madambakkam'];
const STATUS_OPTIONS   = ['New', 'In Review', 'Resolved'];
const RATING_OPTIONS   = ['1', '2', '3', '4', '5'];

const isToday = (dateString) => {
  const d = new Date(dateString);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
};

const getCategoryBadgeClass = (cat) => {
  if (!cat) return 'cat-other';
  const c = cat.toLowerCase();
  if (c.includes('complaint'))    return 'cat-complaint';
  if (c.includes('suggestion'))   return 'cat-suggestion';
  if (c.includes('improvement'))  return 'cat-improvement';
  if (c.includes('appreciation')) return 'cat-appreciation';
  return 'cat-other';
};

const getStatusBadgeClass = (status) => {
  if (!status) return 'status-new';
  const s = status.toLowerCase();
  if (s.includes('review'))   return 'status-in-review';
  if (s.includes('resolved')) return 'status-resolved';
  return 'status-new';
};

const renderStars = (rating) => {
  if (!rating) return '—';
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};

const getCategoryIcon = (cat) => {
  if (!cat) return '✉️';
  const c = cat.toLowerCase();
  if (c.includes('complaint'))    return '😟';
  if (c.includes('suggestion'))   return '💡';
  if (c.includes('improvement'))  return '🔧';
  if (c.includes('appreciation')) return '❤️';
  return '✉️';
};

function Admin() {
  const [feedbacks, setFeedbacks]               = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [deletingId, setDeletingId]             = useState(null);
  const [deleteTimeoutId, setDeleteTimeoutId]   = useState(null);

  // Filters
  const [searchQuery,     setSearchQuery]     = useState('');
  const [branchFilter,    setBranchFilter]    = useState('All');
  const [categoryFilter,  setCategoryFilter]  = useState('All');
  const [statusFilter,    setStatusFilter]    = useState('All');
  const [ratingFilter,    setRatingFilter]    = useState('All');

  // ── Auth check ───────────────────────────────────────────────────────
  useEffect(() => {
    const isAuth = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAuth) { window.location.href = '/'; return; }

    fetch(`${API_BASE_URL}/api/feedbacks/`)
      .then(r => { if (!r.ok) throw new Error('Could not fetch'); return r.json(); })
      .then(data => { setFeedbacks(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // ── Metrics ────────────────────────────────────────────────────────
  const total        = feedbacks.length;
  const todayCount   = feedbacks.filter(f => isToday(f.timestamp)).length;
  const avgRating    = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + (f.starRating || 0), 0) / feedbacks.length).toFixed(1)
    : '—';
  const newCount     = feedbacks.filter(f => (f.status || '').toLowerCase() === 'new').length;
  const reviewCount  = feedbacks.filter(f => (f.status || '').toLowerCase().includes('review')).length;
  const resolvedCount= feedbacks.filter(f => (f.status || '').toLowerCase() === 'resolved').length;
  const complaintCount    = feedbacks.filter(f => (f.feedbackCategory || '').toLowerCase().includes('complaint')).length;
  const suggestionCount   = feedbacks.filter(f => (f.feedbackCategory || '').toLowerCase().includes('suggestion')).length;
  const appreciationCount = feedbacks.filter(f => (f.feedbackCategory || '').toLowerCase().includes('appreciation')).length;

  // Category breakdown
  const catCounts = CATEGORY_OPTIONS.reduce((acc, cat) => {
    acc[cat] = feedbacks.filter(f =>
      (f.feedbackCategory || f.problems?.[0] || '').toLowerCase().includes(cat.toLowerCase())
    ).length;
    return acc;
  }, {});
  const maxCat = Math.max(...Object.values(catCounts), 1);

  // Branch breakdown
  const branchCounts = BRANCH_OPTIONS.reduce((acc, b) => {
    acc[b] = feedbacks.filter(f => (f.branch || f.department || '') === b).length;
    return acc;
  }, {});
  const maxBranch = Math.max(...Object.values(branchCounts), 1);

  // ── Filtered list ────────────────────────────────────────────────────
  const filtered = feedbacks.filter(f => {
    const cat     = (f.feedbackCategory || f.problems?.[0] || '').toLowerCase();
    const branch  = (f.branch || f.department || '').toLowerCase();
    const status  = (f.status || '').toLowerCase();
    const rating  = String(f.starRating || '');
    const text    = `${f.studentName || f.name || ''} ${f.mainFeedback || f.description || ''} ${f.feedbackId || f.id || ''}`.toLowerCase();

    if (categoryFilter !== 'All' && !cat.includes(categoryFilter.toLowerCase())) return false;
    if (branchFilter   !== 'All' && !branch.includes(branchFilter.toLowerCase())) return false;
    if (statusFilter   !== 'All' && !status.includes(statusFilter.toLowerCase())) return false;
    if (ratingFilter   !== 'All' && rating !== ratingFilter) return false;
    if (searchQuery && !text.includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // ── Delete ────────────────────────────────────────────────────────────
  const deleteFeedback = (id) => {
    if (deletingId === id) {
      clearTimeout(deleteTimeoutId);
      setDeletingId(null);
      const dbId = String(id).replace('fb-', '');
      fetch(`${API_BASE_URL}/api/feedbacks/${dbId}/`, { method: 'DELETE' })
        .then(r => { if (!r.ok) throw new Error(); setFeedbacks(prev => prev.filter(f => f.id !== id)); })
        .catch(console.error);
    } else {
      if (deleteTimeoutId) clearTimeout(deleteTimeoutId);
      setDeletingId(id);
      setDeleteTimeoutId(setTimeout(() => setDeletingId(null), 3000));
    }
  };

  const resetDatabase = () => {
    if (!window.confirm('Reset dashboard data back to initial KFA sample responses?')) return;
    fetch(`${API_BASE_URL}/api/feedbacks/reset/`, { method: 'POST' })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setFeedbacks(data); alert('Database reset successfully.'); })
      .catch(console.error);
  };

  const handleLogout = () => { sessionStorage.removeItem('isAdminAuthenticated'); window.location.href = '/'; };
  const clearFilters = () => { setBranchFilter('All'); setCategoryFilter('All'); setStatusFilter('All'); setRatingFilter('All'); setSearchQuery(''); };
  const hasFilters = branchFilter !== 'All' || categoryFilter !== 'All' || statusFilter !== 'All' || ratingFilter !== 'All' || searchQuery;

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-logo-pulse">
          <img src={kfaLogo} alt="KFA Logo" style={{ width: 50, objectFit: 'contain' }} />
        </div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#1a1a8c', fontSize: 22, marginBottom: 6 }}>
          KFA Music Academy
        </h2>
        <p style={{ color: '#8585a0', fontSize: 14 }}>Loading feedback data…</p>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section" style={{ cursor: 'default' }}>
          <div className="logo-icon">
            <img src={kfaLogo} alt="KFA Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
          </div>
          <div className="logo-text">
            <h1>KFA Music Academy</h1>
            <p>Parent Feedback Dashboard</p>
          </div>
        </div>
        <nav className="nav-tabs">
          <button className="nav-tab" onClick={() => window.location.href = '/'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Feedback Form
          </button>
          <button className="nav-tab active" onClick={handleLogout}>
            🔒 Log Out
          </button>
        </nav>
      </header>

      <main className="page-fade-in" style={{ paddingTop: 28 }}>
        <div className="admin-page">

          {/* Hero */}
          <div className="admin-hero">
            <div className="admin-hero-left">
              <h2>KFA Parent Feedback Dashboard</h2>
              <p>Review complaints, suggestions, and appreciate from parents. Manage and resolve feedback efficiently.</p>
            </div>
            <div className="admin-hero-logo">
              <img src={kfaLogo} alt="KFA Logo" style={{ width: 56, objectFit: 'contain' }} />
            </div>
          </div>

          {/* Metric Cards */}
          <div className="metrics-row">
            <div className="metric-card">
              <div>
                <div className="metric-label">Total Feedback</div>
                <div className="metric-value">{total}</div>
                <div className="metric-sub">All time</div>
              </div>
              <div className="metric-icon-box">📋</div>
            </div>

            <div className="metric-card gold-accent">
              <div>
                <div className="metric-label">Avg Star Rating</div>
                <div className="metric-value">{avgRating}</div>
                <div className="metric-sub">out of 5 ★</div>
              </div>
              <div className="metric-icon-box">⭐</div>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-label">New</div>
                <div className="metric-value">{newCount}</div>
                <div className="metric-sub">Awaiting review</div>
              </div>
              <div className="metric-icon-box">🆕</div>
            </div>

            <div className="metric-card gold-accent">
              <div>
                <div className="metric-label">In Review</div>
                <div className="metric-value">{reviewCount}</div>
                <div className="metric-sub">Being processed</div>
              </div>
              <div className="metric-icon-box">🔍</div>
            </div>

            <div className="metric-card green-accent">
              <div>
                <div className="metric-label">Resolved</div>
                <div className="metric-value">{resolvedCount}</div>
                <div className="metric-sub">Closed</div>
              </div>
              <div className="metric-icon-box">✅</div>
            </div>

            <div className="metric-card red-accent">
              <div>
                <div className="metric-label">Complaints</div>
                <div className="metric-value">{complaintCount}</div>
                <div className="metric-sub">Need attention</div>
              </div>
              <div className="metric-icon-box">😟</div>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-label">Suggestions</div>
                <div className="metric-value">{suggestionCount}</div>
                <div className="metric-sub">Improvement ideas</div>
              </div>
              <div className="metric-icon-box">💡</div>
            </div>

            <div className="metric-card green-accent">
              <div>
                <div className="metric-label">Appreciations</div>
                <div className="metric-value">{appreciationCount}</div>
                <div className="metric-sub">Positive feedback</div>
              </div>
              <div className="metric-icon-box">❤️</div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">

            {/* Left: Analytics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Category Breakdown */}
              <div className="category-card">
                <div className="section-header">
                  <h3>📊 Feedback by Category</h3>
                  <button className="btn-reset-db" onClick={resetDatabase}>Reset Mocks</button>
                </div>
                <div className="category-list">
                  {CATEGORY_OPTIONS.map(cat => {
                    const count = catCounts[cat] || 0;
                    return (
                      <div key={cat} className="category-bar-item">
                        <div className="category-bar-label">
                          <span className="category-name">
                            {getCategoryIcon(cat)} {cat}
                          </span>
                          <span className="category-count">{count}</span>
                        </div>
                        <div className="progress-track-admin">
                          <div
                            className="progress-fill-admin"
                            style={{ width: `${(count / maxCat) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Branch Breakdown */}
              <div className="category-card">
                <div className="section-header">
                  <h3>📍 Branch Wise Feedback</h3>
                </div>
                <div className="category-list">
                  {BRANCH_OPTIONS.map(b => {
                    const count = branchCounts[b] || 0;
                    return (
                      <div key={b} className="category-bar-item">
                        <div className="category-bar-label">
                          <span className="category-name">📍 {b}</span>
                          <span className="category-count">{count}</span>
                        </div>
                        <div className="progress-track-admin">
                          <div
                            className="progress-fill-admin"
                            style={{ width: `${(count / maxBranch) * 100}%`, background: 'linear-gradient(90deg, #cc1111, #ff4444)' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Star Rating Distribution */}
              <div className="category-card">
                <div className="section-header">
                  <h3>⭐ Rating Distribution</h3>
                </div>
                <div className="category-list">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = feedbacks.filter(f => f.starRating === star).length;
                    return (
                      <div key={star} className="category-bar-item">
                        <div className="category-bar-label">
                          <span className="category-name" style={{ color: '#f59e0b' }}>
                            {'★'.repeat(star)} <span style={{ color: '#8585a0', fontWeight: 400 }}>{star} star</span>
                          </span>
                          <span className="category-count">{count}</span>
                        </div>
                        <div className="progress-track-admin">
                          <div
                            className="progress-fill-admin"
                            style={{ width: `${(count / Math.max(total, 1)) * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #fcd34d)' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Feedback Feed */}
            <div className="feed-column">

              {/* Filters */}
              <div className="feed-filters-bar">
                <div className="filter-group">
                  <span className="filter-label">Search:</span>
                  <input
                    type="text"
                    className="select-filter"
                    placeholder="Name, ID, text..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: 140 }}
                  />
                </div>
                <div className="filter-group">
                  <span className="filter-label">Branch:</span>
                  <select className="select-filter" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
                    <option value="All">All Branches</option>
                    {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <span className="filter-label">Category:</span>
                  <select className="select-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="All">All Categories</option>
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <span className="filter-label">Status:</span>
                  <select className="select-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <span className="filter-label">Rating:</span>
                  <select className="select-filter" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
                    <option value="All">All Ratings</option>
                    {RATING_OPTIONS.map(r => <option key={r} value={r}>{r} ★</option>)}
                  </select>
                </div>
                {hasFilters && (
                  <button className="reset-filters-btn" onClick={clearFilters}>✕ Clear</button>
                )}
              </div>

              {/* Cards */}
              <div className="responses-feed">
                {filtered.length === 0 ? (
                  <div className="no-records">
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                    No feedback matches the current filters.
                    <br />
                    <button className="reset-filters-btn" style={{ marginTop: 12 }} onClick={clearFilters}>
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  filtered.map(item => {
                    const cat    = item.feedbackCategory || (item.problems && item.problems[0]) || 'Other';
                    const branch = item.branch || item.department || '';
                    const name   = item.studentName || item.name || 'Anonymous';
                    const text   = item.mainFeedback || item.description || '';
                    const fid    = item.feedbackId || item.id;

                    return (
                      <div
                        key={item.id}
                        className="response-feed-card"
                        onClick={() => setSelectedFeedback(item)}
                      >
                        <div className="response-header">
                          <div className="tags-row">
                            <span className={`badge ${getCategoryBadgeClass(cat)}`}>
                              {getCategoryIcon(cat)} {cat}
                            </span>
                            {branch && (
                              <span className="badge branch-badge">📍 {branch}</span>
                            )}
                            <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                              {item.status || 'New'}
                            </span>
                          </div>
                          <span className="date-badge">
                            {new Date(item.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem', color: '#8585a0', alignItems: 'center' }}>
                          <span>👤 <strong style={{ color: '#0f0f3d' }}>{name}</strong></span>
                          {item.starRating > 0 && (
                            <span className="star-display">{renderStars(item.starRating)}</span>
                          )}
                          <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: 11, color: '#2d2db0', fontWeight: 600 }}>
                            {fid}
                          </span>
                        </div>

                        <p className="response-card-description">{text || '(No text)'}</p>

                        <div className="response-footer">
                          <div className="response-footer-left">
                            {item.recommend && <span>Recommend: <strong>{item.recommend}</strong></span>}
                            {item.improvementAreas?.length > 0 && (
                              <span>Areas: {item.improvementAreas.slice(0, 2).join(', ')}{item.improvementAreas.length > 2 ? '…' : ''}</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="btn-details"
                              onClick={e => { e.stopPropagation(); setSelectedFeedback(item); }}
                            >
                              View Details
                            </button>
                            <button
                              className={`btn-delete${deletingId === item.id ? ' deleting-confirm' : ''}`}
                              style={deletingId === item.id ? { background: 'var(--kfa-red)', color: 'white', borderColor: 'var(--kfa-red)' } : {}}
                              onClick={e => { e.stopPropagation(); deleteFeedback(item.id); }}
                            >
                              {deletingId === item.id ? '⚠ Confirm?' : '🗑 Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedFeedback && (() => {
        const f   = selectedFeedback;
        const cat = f.feedbackCategory || (f.problems && f.problems[0]) || 'Other';
        const name= f.studentName || f.name || 'Anonymous';
        const fid = f.feedbackId || f.id;

        return (
          <div className="admin-modal-overlay" onClick={() => setSelectedFeedback(null)}>
            <div className="admin-modal-box" onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="admin-modal-header">
                <div>
                  <h3>Feedback Details</h3>
                  <p>{fid} • {new Date(f.timestamp).toLocaleString('en-IN')}</p>
                </div>
                <button className="modal-close-btn" onClick={() => setSelectedFeedback(null)}>×</button>
              </div>

              {/* Modal Body */}
              <div className="admin-modal-body">

                {/* Info Grid */}
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <span className="modal-info-label">Feedback ID</span>
                    <span className="modal-info-value" style={{ fontFamily: 'monospace', color: '#1a1a8c' }}>{fid}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Student Name</span>
                    <span className="modal-info-value">{name}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Branch</span>
                    <span className="modal-info-value">📍 {f.branch || f.department || '—'}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Category</span>
                    <span className="modal-info-value">
                      <span className={`badge ${getCategoryBadgeClass(cat)}`}>{getCategoryIcon(cat)} {cat}</span>
                    </span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Star Rating</span>
                    <span className="modal-info-value" style={{ color: '#f59e0b' }}>
                      {f.starRating ? renderStars(f.starRating) + ` (${f.starRating}/5)` : '—'}
                    </span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Status</span>
                    <span className="modal-info-value">
                      <span className={`badge ${getStatusBadgeClass(f.status)}`}>{f.status || 'New'}</span>
                    </span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Recommend KFA</span>
                    <span className="modal-info-value">{f.recommend || '—'}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Child Progress</span>
                    <span className="modal-info-value">{f.learningProgress || '—'}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Contact Preference</span>
                    <span className="modal-info-value">
                      {f.contactPreference === 'Yes' ? `📞 ${f.phoneNumber || ''} (${f.preferredContactMethod || 'Call'})` : (f.contactPreference || '—')}
                    </span>
                  </div>
                </div>

                {/* Main Feedback */}
                {(f.mainFeedback || f.description) && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#8585a0', marginBottom: 6 }}>
                      Main Feedback
                    </div>
                    <div className="modal-text-block">{f.mainFeedback || f.description}</div>
                  </div>
                )}

                {/* Improvement Areas */}
                {f.improvementAreas?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#8585a0', marginBottom: 8 }}>
                      Improvement Areas Requested
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {f.improvementAreas.map(area => (
                        <span key={area} style={{ padding: '5px 12px', background: 'rgba(26,26,140,0.07)', color: '#1a1a8c', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid rgba(26,26,140,0.15)' }}>
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expectations */}
                {f.expectations && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#8585a0', marginBottom: 6 }}>
                      Parent Expectations
                    </div>
                    <div className="modal-text-block" style={{ borderLeftColor: '#cc1111' }}>{f.expectations}</div>
                  </div>
                )}

                {/* Additional Comments */}
                {f.additionalComments && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#8585a0', marginBottom: 6 }}>
                      Additional Comments
                    </div>
                    <div className="modal-text-block" style={{ borderLeftColor: '#16a34a' }}>{f.additionalComments}</div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button className="modal-btn-close" onClick={() => setSelectedFeedback(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default Admin;
