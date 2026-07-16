import React, { useState, useEffect, useCallback } from 'react';
import Admin from './Admin.jsx';
import kfaLogo from './assets/Logofull.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const SAVE_KEY = 'kfa_feedback_draft';

// ── Constants ──────────────────────────────────────────────────────────────
const BRANCHES = ['Guduvancheri', 'Madambakkam'];

const CATEGORIES = [
  { id: 'Complaint',        label: 'Complaint',       icon: '😟' },
  { id: 'Suggestion',       label: 'Suggestion',      icon: '💡' },
  { id: 'Appreciation',     label: 'Appreciation',    icon: '❤️' },
  { id: 'Improvement',      label: 'Improvement',     icon: '🔧' },
  { id: 'Other',            label: 'Other',            icon: '✉️' },
];

const IMPROVEMENT_OPTIONS = [
  'Teaching Quality',
  'Teacher Communication',
  'Office Staff',
  'Class Timing',
  'Practice Sessions',
  'Facilities',
  'Cleanliness',
  'Waiting Area',
  'Parking',
  'Events & Programs',
  'Student Discipline',
  'Other'
];

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

// ── Helper: star display ───────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const [poppedStar, setPoppedStar] = useState(null);

  const handleClick = (star) => {
    onChange(star);
    setPoppedStar(star);
    setTimeout(() => setPoppedStar(null), 300);
  };

  const active = hovered || value;
  return (
    <div className="star-rating-wrap" style={{ marginTop: 8 }}>
      <div className="stars-row" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star-btn${poppedStar === star ? ' popped' : ''}`}
            aria-label={`${star} star${star > 1 ? 's' : ''} — ${STAR_LABELS[star]}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          >
            <svg className="star-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <polygon
                className={star <= active ? 'star-filled' : 'star-empty'}
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              />
            </svg>
          </button>
        ))}
      </div>
      {active > 0 && (
        <div className="rating-desc" style={{ marginTop: 8, fontWeight: 700, color: 'var(--kfa-navy)' }}>
          {STAR_LABELS[active]}
        </div>
      )}
      <div className="star-labels" style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>⭐ Poor</span>
        <span>•</span>
        <span>⭐⭐ Fair</span>
        <span>•</span>
        <span>⭐⭐⭐ Good</span>
        <span>•</span>
        <span>⭐⭐⭐⭐ Very Good</span>
        <span>•</span>
        <span>⭐⭐⭐⭐⭐ Excellent</span>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
function App() {
  const currentPath = window.location.pathname;

  // ── Admin access states ───────────────────────────────────────────────
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalPassword, setModalPassword] = useState('');
  const [modalError, setModalError] = useState('');

  // ── Form UI states ────────────────────────────────────────────────────
  const [view, setView] = useState('landing'); // 'landing' | 'form' | 'success'
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [errors, setErrors] = useState({});

  // ── Form data ────────────────────────────────────────────────────────
  const defaultForm = {
    studentName: '',
    branch: '',
    starRating: 0,
    feedbackCategory: '',
    customFeedbackCategory: '',
    mainFeedback: '',
    improvementAreas: [],
    customImprovementArea: '',
    expectations: '',
    learningProgress: '',
    recommend: '',
    contactPreference: '',
    phoneNumber: '',
    preferredContactMethod: '',
  };

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      return saved ? { ...defaultForm, ...JSON.parse(saved) } : defaultForm;
    } catch { return defaultForm; }
  });

  // ── Auto-save ─────────────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(form)); }
    catch { /* ignore */ }
  }, [form]);

  const setField = useCallback((key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  }, []);

  const toggleImprovement = useCallback((item) => {
    setForm(prev => {
      const existing = prev.improvementAreas;
      const updated = existing.includes(item)
        ? existing.filter(x => x !== item)
        : [...existing, item];
      return { ...prev, improvementAreas: updated };
    });
    setErrors(prev => ({ ...prev, improvementAreas: '' }));
  }, []);

  // ── Validation ────────────────────────────────────────────────────────
  const validateForm = () => {
    const errs = {};
    if (!form.studentName.trim()) {
      errs.studentName = 'Please enter your child\'s name.';
    }
    if (!form.branch) {
      errs.branch = 'Please select which branch your child attends.';
    }
    if (!form.starRating) {
      errs.starRating = 'Please rate KFA Music Academy.';
    }
    if (!form.feedbackCategory) {
      errs.feedbackCategory = 'Please select what your feedback is about.';
    } else if (form.feedbackCategory === 'Other' && !form.customFeedbackCategory.trim()) {
      errs.customFeedbackCategory = 'Please enter your custom feedback category.';
    }
    if (!form.mainFeedback.trim()) {
      errs.mainFeedback = 'Please explain your feedback.';
    }
    if (form.improvementAreas.length === 0) {
      errs.improvementAreas = 'Please select at least one area to improve.';
    } else if (form.improvementAreas.includes('Other') && !form.customImprovementArea.trim()) {
      errs.customImprovementArea = 'Please enter what else we should improve.';
    }
    if (!form.contactPreference) {
      errs.contactPreference = 'Please tell us if you want us to contact you.';
    } else if (form.contactPreference === 'Yes') {
      if (!form.phoneNumber.trim()) {
        errs.phoneNumber = 'Please enter your phone number.';
      }
      if (!form.preferredContactMethod) {
        errs.preferredContactMethod = 'Please select how you want us to contact you.';
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Find the first error element and scroll to it
      const firstErrorKey = Object.keys(errs)[0];
      const element = document.getElementById(`error-${firstErrorKey}`) || document.getElementById(`q-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmitAttempt = (e) => {
    if (e) e.preventDefault();
    if (validateForm()) {
      setShowConfirm(true);
    }
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);

    // Prepare improvement areas list
    const finalImprovements = form.improvementAreas.map(item => {
      if (item === 'Other') {
        return `Other: ${form.customImprovementArea.trim()}`;
      }
      return item;
    });

    const payload = {
      studentName: form.studentName.trim(),
      name: form.studentName.trim(), // backward compatibility
      branch: form.branch,
      department: form.branch, // backward compatibility
      starRating: form.starRating,
      feedbackCategory: form.feedbackCategory === 'Other' ? form.customFeedbackCategory.trim() : form.feedbackCategory,
      problems: [form.feedbackCategory === 'Other' ? form.customFeedbackCategory.trim() : form.feedbackCategory], // backward compatibility
      mainFeedback: form.mainFeedback.trim(),
      description: form.mainFeedback.trim(), // backward compatibility
      improvementAreas: finalImprovements,
      expectations: form.expectations.trim(),
      learningProgress: form.learningProgress,
      recommend: form.recommend,
      contactPreference: form.contactPreference,
      phoneNumber: form.contactPreference === 'Yes' ? form.phoneNumber.trim() : '',
      preferredContactMethod: form.contactPreference === 'Yes' ? form.preferredContactMethod : '',
      priority: form.starRating <= 2 ? 'High' : form.starRating === 3 ? 'Medium' : 'Low',
      status: 'New',
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/feedbacks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          throw new Error('Server returned non-JSON error');
        }
        
        let message = "Could not submit feedback. Please correct the following errors:\n\n";
        Object.entries(errorData).forEach(([field, errList]) => {
          const errorsText = Array.isArray(errList) ? errList.join(', ') : String(errList);
          let friendlyField = field;
          if (field === 'studentName' || field === 'student_name') friendlyField = "Student Name";
          else if (field === 'branch') friendlyField = "Branch";
          else if (field === 'starRating' || field === 'star_rating') friendlyField = "Star Rating";
          else if (field === 'feedbackCategory' || field === 'feedback_category') friendlyField = "Feedback Category";
          else if (field === 'mainFeedback' || field === 'main_feedback') friendlyField = "Feedback Explanation";
          else if (field === 'improvementAreas' || field === 'improvement_areas') friendlyField = "Improvements";
          else if (field === 'expectations') friendlyField = "Expectations";
          else if (field === 'recommend') friendlyField = "Recommend";
          else if (field === 'contactPreference' || field === 'contact_preference') friendlyField = "Contact Preference";
          else if (field === 'phoneNumber' || field === 'phone_number') friendlyField = "Phone Number";
          else if (field === 'preferredContactMethod' || field === 'preferred_contact_method') friendlyField = "Preferred Contact Method";
          else if (field === 'learningProgress' || field === 'learning_progress') friendlyField = "Learning Progress";

          message += `• ${friendlyField}: ${errorsText}\n`;
        });
        alert(message);
        return;
      }
      const data = await res.json();
      setGeneratedId(data.feedbackId || `KFA-${new Date().getFullYear()}-${String(data.id || '').replace('fb-', '').padStart(6, '0')}`);
      localStorage.removeItem(SAVE_KEY);
      setView('success');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Could not submit feedback. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setForm(defaultForm);
    setErrors({});
    setGeneratedId('');
    setView('landing');
    window.scrollTo(0, 0);
  };

  // ── Admin route ────────────────────────────────────────────────────────
  if (currentPath === '/admin') {
    const isAuth = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAuth) { window.location.href = '/'; return null; }
    return <Admin />;
  }

  // ══════════════════════════════════════════════════════════════════════
  //  LANDING PAGE
  // ══════════════════════════════════════════════════════════════════════
  if (view === 'landing') {
    return (
      <div className="app-container">
        <header className="app-header">
          <div
            className="logo-section"
            onClick={() => setAdminClickCount(c => c + 1)}
          >
            <div className="logo-icon">
              <img src={kfaLogo} alt="KFA Music Academy Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
            </div>
            <div className="logo-text">
              <h1>KFA Music Academy</h1>
              <p>Parent Feedback System</p>
            </div>
          </div>

          {adminClickCount >= 5 && (
            <nav className="nav-tabs">
              <button
                className="nav-tab active"
                onClick={() => setShowPasswordModal(true)}
              >
                🔒 Admin Portal
              </button>
            </nav>
          )}
        </header>

        <main className="landing-page page-fade-in">
          <div className="landing-logo-wrap">
            <img src={kfaLogo} alt="KFA Music Academy" />
          </div>

          <h1 className="landing-title">KFA Music Academy</h1>
          <p className="landing-subtitle">Parent Feedback &amp; Suggestions</p>

          <div className="landing-desc">
            <p>We always want to improve our academy.</p>
            <p>
              Your feedback helps us provide better classes, better facilities,
              and a better learning experience for every student.
            </p>
            <p>Thank you for taking a few minutes to help us improve.</p>
          </div>

          <button
            className="landing-cta-btn"
            onClick={() => { setView('form'); window.scrollTo(0, 0); }}
            id="start-feedback-btn"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Start Feedback
          </button>

          <p className="landing-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Takes less than 2 minutes • Simple questions • Your voice matters
          </p>
        </main>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="pw-modal-overlay">
            <div className="pw-modal-box">
              <h3>Admin Login</h3>
              <p>Enter the password to access the Admin Dashboard.</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (modalPassword === 'admin123') {
                  sessionStorage.setItem('isAdminAuthenticated', 'true');
                  window.location.href = '/admin';
                } else {
                  setModalError('Wrong password. Please try again.');
                }
              }}>
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={modalPassword}
                  onChange={e => setModalPassword(e.target.value)}
                  className="kfa-input"
                  autoFocus
                />
                {modalError && <p className="field-error" style={{ marginTop: 8 }}>⚠ {modalError}</p>}
                <div className="pw-modal-actions">
                  <button type="button" className="pw-cancel-btn" onClick={() => {
                    setShowPasswordModal(false);
                    setModalPassword('');
                    setModalError('');
                  }}>Cancel</button>
                  <button type="submit" className="pw-submit-btn">Access</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  //  SUCCESS PAGE
  // ══════════════════════════════════════════════════════════════════════
  if (view === 'success') {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="logo-section">
            <div className="logo-icon">
              <img src={kfaLogo} alt="KFA Music Academy Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
            </div>
            <div className="logo-text">
              <h1>KFA Music Academy</h1>
              <p>Parent Feedback System</p>
            </div>
          </div>
        </header>
        <main>
          <div className="success-page page-fade-in">
            <div className="success-icon-circle">
              <svg className="success-check" viewBox="0 0 52 52">
                <path d="M14 27 l10 10 l14 -18" strokeDasharray="100" strokeDashoffset="100" />
              </svg>
            </div>

            <h1 className="success-title">✅ Thank You!</h1>
            <p className="success-subtitle">Your feedback has been submitted successfully.</p>

            <p className="success-body" style={{ textAlign: 'center', maxWidth: 560, lineHeight: 1.8, fontSize: '15px' }}>
              We sincerely appreciate your time and valuable suggestions.<br /><br />
              Every complaint, suggestion, and idea is carefully reviewed by the KFA Music Academy management team.<br /><br />
              Your feedback helps us improve our teaching, facilities, and services to provide the best learning experience for every student.<br /><br />
              Thank you for helping KFA Music Academy grow and improve.
            </p>

            <div className="feedback-id-box" style={{ margin: '24px 0' }}>
              <span className="feedback-id-label">Your Feedback ID</span>
              <span className="feedback-id-value">{generatedId}</span>
            </div>

            <button className="btn-done" onClick={resetAll} id="done-btn">
              Done
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  //  FEEDBACK WEBSITE FORM
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="app-container">
      <header className="app-header">
        <div
          className="logo-section"
          onClick={() => setAdminClickCount(c => c + 1)}
        >
          <div className="logo-icon">
            <img src={kfaLogo} alt="KFA Music Academy Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
          </div>
          <div className="logo-text">
            <h1>KFA Music Academy</h1>
            <p>Parent Feedback System</p>
          </div>
        </div>
        <nav className="nav-tabs">
          <button className="nav-tab" onClick={() => { setView('landing'); setErrors({}); }}>
            ← Home
          </button>
          {adminClickCount >= 5 && (
            <button className="nav-tab active" onClick={() => setShowPasswordModal(true)}>
              🔒 Admin
            </button>
          )}
        </nav>
      </header>

      <main className="page-fade-in" style={{ paddingTop: 28 }}>
        <div className="form-page">
          <div className="form-card">
            <form onSubmit={handleSubmitAttempt}>

              {/* ── Q1: Student Name ── */}
              <div className="question-group" id="q-studentName">
                <label className="question-label" htmlFor="student-name">
                  👤 1. Student Name <span className="required-star">*</span>
                </label>
                <p className="question-hint">Write the name of your child who attends KFA.</p>
                <input
                  id="student-name"
                  type="text"
                  className="kfa-input"
                  placeholder="Enter your child's name"
                  value={form.studentName}
                  onChange={e => setField('studentName', e.target.value)}
                  autoComplete="name"
                />
                {errors.studentName && <p className="field-error" id="error-studentName">⚠ {errors.studentName}</p>}
              </div>

              {/* ── Q2: Branch ── */}
              <div className="question-group" id="q-branch">
                <p className="question-label">
                  📍 2. Which branch does your child attend? <span className="required-star">*</span>
                </p>
                <p className="question-hint">Select the KFA branch your child goes to.</p>
                <div className="radio-cards">
                  {BRANCHES.map(b => (
                    <div
                      key={b}
                      className={`radio-card${form.branch === b ? ' selected' : ''}`}
                      onClick={() => setField('branch', b)}
                      role="radio"
                      aria-checked={form.branch === b}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setField('branch', b)}
                    >
                      <div className="radio-dot" />
                      <span className="radio-card-text">{b} Branch</span>
                    </div>
                  ))}
                </div>
                {errors.branch && <p className="field-error" id="error-branch">⚠ {errors.branch}</p>}
              </div>

              {/* ── Q3: Star Rating ── */}
              <div className="question-group" id="q-starRating">
                <p className="question-label">
                  ⭐ 3. How would you rate KFA Music Academy? <span className="required-star">*</span>
                </p>
                <p className="question-hint">Tap on the stars to choose your rating.</p>
                <StarRating value={form.starRating} onChange={val => setField('starRating', val)} />
                {errors.starRating && <p className="field-error" id="error-starRating" style={{ marginTop: 10 }}>⚠ {errors.starRating}</p>}
              </div>

              {/* ── Q4: Feedback Category ── */}
              <div className="question-group" id="q-feedbackCategory">
                <p className="question-label">
                  📁 4. What is your feedback about? <span className="required-star">*</span>
                </p>
                <p className="question-hint">Select one box that matches your feedback type.</p>
                <div className="category-btns">
                  {CATEGORIES.map(cat => (
                    <div
                      key={cat.id}
                      className={`category-btn${form.feedbackCategory === cat.id ? ' selected' : ''}`}
                      onClick={() => setField('feedbackCategory', cat.id)}
                      role="button"
                      tabIndex={0}
                      id={`cat-${cat.id.toLowerCase()}`}
                      onKeyDown={e => e.key === 'Enter' && setField('feedbackCategory', cat.id)}
                    >
                      <span className="category-btn-icon">{cat.icon}</span>
                      <span className="category-btn-label">{cat.label}</span>
                    </div>
                  ))}
                </div>
                {errors.feedbackCategory && <p className="field-error" id="error-feedbackCategory" style={{ marginTop: 10 }}>⚠ {errors.feedbackCategory}</p>}

                {/* Conditional custom category */}
                {form.feedbackCategory === 'Other' && (
                  <div style={{ marginTop: 16 }} className="page-fade-in">
                    <label className="question-label" htmlFor="custom-category" style={{ fontSize: '0.95rem' }}>
                      Please tell us what your feedback is about. <span className="required-star">*</span>
                    </label>
                    <input
                      id="custom-category"
                      type="text"
                      className="kfa-input"
                      placeholder="Type your feedback category here"
                      value={form.customFeedbackCategory}
                      onChange={e => setField('customFeedbackCategory', e.target.value)}
                    />
                    {errors.customFeedbackCategory && <p className="field-error" id="error-customFeedbackCategory">⚠ {errors.customFeedbackCategory}</p>}
                  </div>
                )}
              </div>

              {/* ── Q5: Main Feedback ── */}
              <div className="question-group" id="q-mainFeedback">
                <label className="question-label" htmlFor="main-feedback">
                  ✍️ 5. Please tell us your feedback. <span className="required-star">*</span>
                </label>
                <p className="question-hint">You can write your complaint, suggestion, appreciation, or any concern here.</p>
                <textarea
                  id="main-feedback"
                  className="kfa-textarea"
                  placeholder="Type your feedback..."
                  value={form.mainFeedback}
                  onChange={e => setField('mainFeedback', e.target.value)}
                />
                {errors.mainFeedback && <p className="field-error" id="error-mainFeedback">⚠ {errors.mainFeedback}</p>}
              </div>

              {/* ── Q6: Improvement Areas ── */}
              <div className="question-group" id="q-improvementAreas">
                <p className="question-label">
                  🔧 6. What should we improve? <span className="required-star">*</span>
                </p>
                <p className="question-hint">You can select more than one box.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 10 }}>
                  {IMPROVEMENT_OPTIONS.map(opt => {
                    const isSelected = form.improvementAreas.includes(opt);
                    return (
                      <div
                        key={opt}
                        className={`radio-card${isSelected ? ' selected' : ''}`}
                        onClick={() => toggleImprovement(opt)}
                        style={{ padding: '12px 16px', borderRadius: '10px' }}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && toggleImprovement(opt)}
                      >
                        <div className={`radio-dot`} style={{ borderRadius: '4px', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <span style={{ color: 'var(--kfa-navy)', fontWeight: 'bold', fontSize: 13 }}>✓</span>}
                        </div>
                        <span className="radio-card-text" style={{ fontSize: '0.9rem' }}>{opt}</span>
                      </div>
                    );
                  })}
                </div>
                {errors.improvementAreas && <p className="field-error" id="error-improvementAreas" style={{ marginTop: 12 }}>⚠ {errors.improvementAreas}</p>}

                {/* Conditional custom improvement area */}
                {form.improvementAreas.includes('Other') && (
                  <div style={{ marginTop: 16 }} className="page-fade-in">
                    <label className="question-label" htmlFor="custom-improve" style={{ fontSize: '0.95rem' }}>
                      Please tell us what we should improve. <span className="required-star">*</span>
                    </label>
                    <input
                      id="custom-improve"
                      type="text"
                      className="kfa-input"
                      placeholder="Type your answer..."
                      value={form.customImprovementArea}
                      onChange={e => setField('customImprovementArea', e.target.value)}
                    />
                    {errors.customImprovementArea && <p className="field-error" id="error-customImprovementArea">⚠ {errors.customImprovementArea}</p>}
                  </div>
                )}
              </div>

              {/* ── Q7: Expectations ── */}
              <div className="question-group" id="q-expectations">
                <label className="question-label" htmlFor="expectations">
                  💡 7. What do you expect from KFA Music Academy?
                </label>
                <p className="question-hint">What would you like us to do better?</p>
                <textarea
                  id="expectations"
                  className="kfa-textarea"
                  placeholder="Tell us your ideas or expectations."
                  value={form.expectations}
                  onChange={e => setField('expectations', e.target.value)}
                  style={{ minHeight: 110 }}
                />
              </div>

              {/* ── Q8: Child progress ── */}
              <div className="question-group" id="q-learningProgress">
                <p className="question-label">
                  📈 8. Are you happy with your child's learning progress?
                </p>
                <p className="question-hint">Select one option.</p>
                <div className="radio-cards">
                  {[
                    { val: 'Yes',      label: '😊 Yes' },
                    { val: 'Somewhat', label: '😐 Somewhat' },
                    { val: 'No',       label: '☹ No' },
                  ].map(opt => (
                    <div
                      key={opt.val}
                      className={`radio-card${form.learningProgress === opt.val ? ' selected' : ''}`}
                      onClick={() => setField('learningProgress', opt.val)}
                      role="radio"
                      aria-checked={form.learningProgress === opt.val}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setField('learningProgress', opt.val)}
                    >
                      <div className="radio-dot" />
                      <span className="radio-card-text">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Q9: Recommend ── */}
              <div className="question-group" id="q-recommend">
                <p className="question-label">
                  🎵 9. Would you recommend KFA Music Academy to your friends and family?
                </p>
                <p className="question-hint">Select one option.</p>
                <div className="radio-cards">
                  {[
                    { val: 'Yes',   label: '👍 Yes' },
                    { val: 'Maybe', label: '🤔 Maybe' },
                    { val: 'No',    label: '👎 No' },
                  ].map(opt => (
                    <div
                      key={opt.val}
                      className={`radio-card${form.recommend === opt.val ? ' selected' : ''}`}
                      onClick={() => setField('recommend', opt.val)}
                      role="radio"
                      aria-checked={form.recommend === opt.val}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setField('recommend', opt.val)}
                    >
                      <div className="radio-dot" />
                      <span className="radio-card-text">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Q10: Contact Preferences ── */}
              <div className="question-group" id="q-contactPreference">
                <p className="question-label">
                  📞 10. Would you like us to contact you regarding your feedback? <span className="required-star">*</span>
                </p>
                <p className="question-hint">Choose Yes if you want our manager to call you back.</p>
                <div className="radio-cards">
                  {['Yes', 'No'].map(opt => (
                    <div
                      key={opt}
                      className={`radio-card${form.contactPreference === opt ? ' selected' : ''}`}
                      onClick={() => setField('contactPreference', opt)}
                      role="radio"
                      aria-checked={form.contactPreference === opt}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setField('contactPreference', opt)}
                    >
                      <div className="radio-dot" />
                      <span className="radio-card-text">{opt === 'Yes' ? 'Yes, please contact me' : 'No, not needed'}</span>
                    </div>
                  ))}
                </div>
                {errors.contactPreference && <p className="field-error" id="error-contactPreference">⚠ {errors.contactPreference}</p>}

                {/* Conditional Contact Fields */}
                {form.contactPreference === 'Yes' && (
                  <div className="page-fade-in" style={{ marginTop: 20, padding: 16, background: 'var(--bg-navy-soft)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-color)' }}>
                    
                    {/* Phone Number */}
                    <div className="question-group" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 16 }}>
                      <label className="question-label" htmlFor="phone-number" style={{ fontSize: '0.95rem' }}>
                        Phone Number <span className="required-star">*</span>
                      </label>
                      <input
                        id="phone-number"
                        type="tel"
                        className="kfa-input"
                        placeholder="Enter your phone number"
                        value={form.phoneNumber}
                        onChange={e => setField('phoneNumber', e.target.value)}
                        autoComplete="tel"
                        inputMode="tel"
                      />
                      {errors.phoneNumber && <p className="field-error" id="error-phoneNumber">⚠ {errors.phoneNumber}</p>}
                    </div>

                    {/* Preferred Contact Method */}
                    <div className="question-group" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                      <p className="question-label" style={{ fontSize: '0.95rem' }}>
                        Preferred Contact Method <span className="required-star">*</span>
                      </p>
                      <div className="radio-cards" style={{ marginTop: 8 }}>
                        {['Phone Call', 'WhatsApp'].map(method => (
                          <div
                            key={method}
                            className={`radio-card${form.preferredContactMethod === method ? ' selected' : ''}`}
                            onClick={() => setField('preferredContactMethod', method)}
                            style={{ background: '#fff' }}
                            role="radio"
                            aria-checked={form.preferredContactMethod === method}
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && setField('preferredContactMethod', method)}
                          >
                            <div className="radio-dot" />
                            <span className="radio-card-text" style={{ fontSize: '0.9rem' }}>
                              {method === 'WhatsApp' ? '💬 WhatsApp' : '📞 Phone Call'}
                            </span>
                          </div>
                        ))}
                      </div>
                      {errors.preferredContactMethod && <p className="field-error" id="error-preferredContactMethod" style={{ marginTop: 8 }}>⚠ {errors.preferredContactMethod}</p>}
                    </div>

                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
                <button
                  type="submit"
                  className="btn-submit"
                  id="submit-feedback-btn"
                  disabled={submitting}
                  style={{ width: '100%', maxWidth: '100%' }}
                >
                  {submitting ? (
                    <>
                      <div className="spinner" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <div className="dialog-icon">📩</div>
            <h3>Submit Your Feedback?</h3>
            <p>
              Please check your feedback before submitting.
              Once submitted, you cannot change it.
              Are you ready?
            </p>
            <div className="dialog-actions">
              <button className="dialog-cancel" onClick={() => setShowConfirm(false)}>
                Go Back
              </button>
              <button className="dialog-confirm" id="confirm-submit-btn" onClick={handleConfirmedSubmit}>
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="pw-modal-overlay">
          <div className="pw-modal-box">
            <h3>Admin Login</h3>
            <p>Enter the password to access the Admin Dashboard.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (modalPassword === 'admin123') {
                sessionStorage.setItem('isAdminAuthenticated', 'true');
                window.location.href = '/admin';
              } else {
                setModalError('Wrong password. Please try again.');
              }
            }}>
              <input
                type="password"
                placeholder="Enter Password"
                value={modalPassword}
                onChange={e => setModalPassword(e.target.value)}
                className="kfa-input"
                autoFocus
              />
              {modalError && <p className="field-error" style={{ marginTop: 8 }}>⚠ {modalError}</p>}
              <div className="pw-modal-actions">
                <button type="button" className="pw-cancel-btn" onClick={() => {
                  setShowPasswordModal(false);
                  setModalPassword('');
                  setModalError('');
                }}>Cancel</button>
                <button type="submit" className="pw-submit-btn">Access</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
