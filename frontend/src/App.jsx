import React, { useState, useEffect, useCallback } from 'react';
import Admin from './Admin.jsx';
import kfaLogo from './assets/Logofull.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const SAVE_KEY = 'kfa_feedback_draft';

// ── Constants ──────────────────────────────────────────────────────────────
const BRANCHES = ['Guduvancheri', 'Madambakkam'];

const CATEGORIES = [
  { id: 'Complaint',    icon: '😟' },
  { id: 'Suggestion',   icon: '💡' },
  { id: 'Appreciation', icon: '❤️' },
  { id: 'Improvement',  icon: '🔧' },
  { id: 'Other',        icon: '✉️' },
];

const IMPROVEMENT_OPTION_KEYS = [
  'teaching_quality',
  'teacher_communication',
  'office_staff',
  'class_timing',
  'practice_sessions',
  'facilities',
  'cleanliness',
  'waiting_area',
  'parking',
  'events_programs',
  'student_discipline',
  'other',
];

// Maps option key → English label (used for backend payload)
const IMPROVEMENT_ENGLISH = {
  teaching_quality:       'Teaching Quality',
  teacher_communication:  'Teacher Communication',
  office_staff:           'Office Staff',
  class_timing:           'Class Timing',
  practice_sessions:      'Practice Sessions',
  facilities:             'Facilities',
  cleanliness:            'Cleanliness',
  waiting_area:           'Waiting Area',
  parking:                'Parking',
  events_programs:        'Events & Programs',
  student_discipline:     'Student Discipline',
  other:                  'Other',
};

// ── Translations ──────────────────────────────────────────────────────────
const translations = {
  en: {
    // Header / branding
    academy_name:         'KFA Music Academy',
    feedback_system:      'Parent Feedback System',

    // Language toggle
    lang_toggle_label:    'தமிழ்',

    // Landing page
    landing_subtitle:     'Parent Feedback & Suggestions',
    landing_desc1:        'We always want to improve our academy.',
    landing_desc2:        'Your feedback helps us provide better classes, better facilities, and a better learning experience for every student.',
    landing_desc3:        'Thank you for taking a few minutes to help us improve.',
    start_feedback:       'Start Feedback',
    landing_note:         'Takes less than 2 minutes • Simple questions • Your voice matters',

    // Admin modal
    admin_login:          'Admin Login',
    admin_enter_password: 'Enter the password to access the Admin Dashboard.',
    enter_password:       'Enter Password',
    cancel:               'Cancel',
    access:               'Access',
    wrong_password:       'Wrong password. Please try again.',

    // Nav
    home:                 '← Home',
    admin:                '🔒 Admin',
    admin_portal:         '🔒 Admin Portal',

    // Form questions
    q1_label:             '👤 1. Student Name',
    q1_hint:              'Write the name of your child who attends KFA.',
    q1_placeholder:       "Enter your child's name",

    q2_label:             '📍 2. Which branch does your child attend?',
    q2_hint:              'Select the KFA branch your child goes to.',
    branch_suffix:        'Branch',

    q3_label:             '⭐ 3. How would you rate KFA Music Academy?',
    q3_hint:              'Tap on the stars to choose your rating.',
    star_labels:          ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
    star_legend:          ['⭐ Poor', '⭐⭐ Fair', '⭐⭐⭐ Good', '⭐⭐⭐⭐ Very Good', '⭐⭐⭐⭐⭐ Excellent'],

    q4_label:             '📁 4. What is your feedback about?',
    q4_hint:              'Select one box that matches your feedback type.',
    category_labels: {
      Complaint:    'Complaint',
      Suggestion:   'Suggestion',
      Appreciation: 'Appreciation',
      Improvement:  'Improvement',
      Other:        'Other',
    },
    q4_other_label:       'Please tell us what your feedback is about.',
    q4_other_placeholder: 'Type your feedback category here',

    q5_label:             '✍️ 5. Please tell us your feedback.',
    q5_hint:              'You can write your complaint, suggestion, appreciation, or any concern here.',
    q5_placeholder:       'Type your feedback...',

    q6_label:             '🔧 6. What should we improve?',
    q6_hint:              'You can select more than one box.',
    improvement_labels: {
      teaching_quality:      'Teaching Quality',
      teacher_communication: 'Teacher Communication',
      office_staff:          'Office Staff',
      class_timing:          'Class Timing',
      practice_sessions:     'Practice Sessions',
      facilities:            'Facilities',
      cleanliness:           'Cleanliness',
      waiting_area:          'Waiting Area',
      parking:               'Parking',
      events_programs:       'Events & Programs',
      student_discipline:    'Student Discipline',
      other:                 'Other',
    },
    q6_other_label:       'Please tell us what we should improve.',
    q6_other_placeholder: 'Type your answer...',

    q7_label:             '💡 7. What do you expect from KFA Music Academy?',
    q7_hint:              'What would you like us to do better?',
    q7_placeholder:       'Tell us your ideas or expectations.',

    q8_label:             "📈 8. Are you happy with your child's learning progress?",
    q8_hint:              'Select one option.',
    q8_options: [
      { val: 'Yes',      label: '😊 Yes' },
      { val: 'Somewhat', label: '😐 Somewhat' },
      { val: 'No',       label: '☹ No' },
    ],

    q9_label:             '🎵 9. Would you recommend KFA Music Academy to your friends and family?',
    q9_hint:              'Select one option.',
    q9_options: [
      { val: 'Yes',   label: '👍 Yes' },
      { val: 'Maybe', label: '🤔 Maybe' },
      { val: 'No',    label: '👎 No' },
    ],

    q10_label:            '📞 10. Would you like us to contact you regarding your feedback?',
    q10_hint:             'Choose Yes if you want our manager to call you back.',
    contact_yes:          'Yes, please contact me',
    contact_no:           'No, not needed',
    phone_label:          'Phone Number',
    phone_placeholder:    'Enter your phone number',
    contact_method_label: 'Preferred Contact Method',
    phone_call:           '📞 Phone Call',
    whatsapp:             '💬 WhatsApp',

    // Submit
    submit_feedback:      'Submit Feedback',
    submitting:           'Submitting...',

    // Confirm dialog
    confirm_title:        'Submit Your Feedback?',
    confirm_body:         'Please check your feedback before submitting. Once submitted, you cannot change it. Are you ready?',
    go_back:              'Go Back',
    yes_submit:           'Yes, Submit',

    // Validation errors
    err_student_name:        "Please enter your child's name.",
    err_branch:              'Please select which branch your child attends.',
    err_star_rating:         'Please rate KFA Music Academy.',
    err_feedback_category:   'Please select what your feedback is about.',
    err_custom_category:     'Please enter your custom feedback category.',
    err_main_feedback:       'Please explain your feedback.',
    err_improvement_areas:   'Please select at least one area to improve.',
    err_custom_improvement:  'Please enter what else we should improve.',
    err_contact_preference:  'Please tell us if you want us to contact you.',
    err_phone_number:        'Please enter your phone number.',
    err_contact_method:      'Please select how you want us to contact you.',

    // Success page
    success_title:    '✅ Thank You!',
    success_subtitle: 'Your feedback has been submitted successfully.',
    success_body:     'We sincerely appreciate your time and valuable suggestions.\n\nEvery complaint, suggestion, and idea is carefully reviewed by the KFA Music Academy management team.\n\nYour feedback helps us improve our teaching, facilities, and services to provide the best learning experience for every student.\n\nThank you for helping KFA Music Academy grow and improve.',
    feedback_id_label: 'Your Feedback ID',
    done:             'Done',
  },

  ta: {
    // Header / branding
    academy_name:    'KFA இசைக் கல்லூரி',
    feedback_system: 'பெற்றோர் கருத்து அமைப்பு',

    // Language toggle
    lang_toggle_label: 'English',

    // Landing page
    landing_subtitle: 'பெற்றோர் கருத்து & ஆலோசனைகள்',
    landing_desc1:    'நாங்கள் எப்போதும் எங்கள் கல்லூரியை மேம்படுத்த விரும்புகிறோம்.',
    landing_desc2:    'உங்கள் கருத்து, சிறந்த வகுப்புகள், சிறந்த வசதிகள் மற்றும் ஒவ்வொரு மாணவருக்கும் சிறந்த கற்றல் அனுபவத்தை வழங்க உதவுகிறது.',
    landing_desc3:    'சில நிமிடங்கள் எடுத்து எங்களை மேம்படுத்த உதவியதற்கு நன்றி.',
    start_feedback:   'கருத்தை தொடங்கு',
    landing_note:     '2 நிமிடங்களுக்கும் குறைவாகும் • எளிய கேள்விகள் • உங்கள் குரல் முக்கியம்',

    // Admin modal
    admin_login:          'நிர்வாகி உள்நுழைவு',
    admin_enter_password: 'நிர்வாக டாஷ்போர்டை அணுக கடவுச்சொல்லை உள்ளிடவும்.',
    enter_password:       'கடவுச்சொல் உள்ளிடவும்',
    cancel:               'ரத்துசெய்',
    access:               'அணுகல்',
    wrong_password:       'தவறான கடவுச்சொல். மீண்டும் முயற்சிக்கவும்.',

    // Nav
    home:        '← முகப்பு',
    admin:       '🔒 நிர்வாகி',
    admin_portal:'🔒 நிர்வாக போர்டல்',

    // Form questions
    q1_label:       '👤 1. மாணவர் பெயர்',
    q1_hint:        'KFA-வில் படிக்கும் உங்கள் குழந்தையின் பெயரை எழுதுங்கள்.',
    q1_placeholder: 'உங்கள் குழந்தையின் பெயரை உள்ளிடவும்',

    q2_label:    '📍 2. உங்கள் குழந்தை எந்த கிளையில் படிக்கிறார்?',
    q2_hint:     'உங்கள் குழந்தை செல்லும் KFA கிளையை தேர்ந்தெடுக்கவும்.',
    branch_suffix: 'கிளை',

    q3_label: '⭐ 3. KFA இசைக் கல்லூரியை எப்படி மதிப்பிடுவீர்கள்?',
    q3_hint:  'உங்கள் மதிப்பீட்டை தேர்வுசெய்ய நட்சத்திரங்களை தட்டவும்.',
    star_labels: ['', 'மோசம்', 'சாதாரணம்', 'நல்லது', 'மிகவும் நல்லது', 'சிறந்தது'],
    star_legend: ['⭐ மோசம்', '⭐⭐ சாதாரணம்', '⭐⭐⭐ நல்லது', '⭐⭐⭐⭐ மிகவும் நல்லது', '⭐⭐⭐⭐⭐ சிறந்தது'],

    q4_label: '📁 4. உங்கள் கருத்து எதைப் பற்றியது?',
    q4_hint:  'உங்கள் கருத்து வகைக்கு பொருந்தும் ஒரு பெட்டியை தேர்ந்தெடுக்கவும்.',
    category_labels: {
      Complaint:    'புகார்',
      Suggestion:   'ஆலோசனை',
      Appreciation: 'பாராட்டு',
      Improvement:  'மேம்பாடு',
      Other:        'மற்றவை',
    },
    q4_other_label:       'உங்கள் கருத்து எதைப் பற்றியது என்று சொல்லுங்கள்.',
    q4_other_placeholder: 'உங்கள் கருத்து வகையை இங்கே தட்டச்சு செய்யவும்',

    q5_label:       '✍️ 5. உங்கள் கருத்தை சொல்லுங்கள்.',
    q5_hint:        'உங்கள் புகார், ஆலோசனை, பாராட்டு அல்லது எந்த கவலையையும் இங்கே எழுதலாம்.',
    q5_placeholder: 'உங்கள் கருத்தை தட்டச்சு செய்யவும்...',

    q6_label: '🔧 6. நாங்கள் எதை மேம்படுத்த வேண்டும்?',
    q6_hint:  'ஒன்றுக்கும் மேற்பட்ட பெட்டிகளை தேர்ந்தெடுக்கலாம்.',
    improvement_labels: {
      teaching_quality:      'கற்பித்தல் தரம்',
      teacher_communication: 'ஆசிரியர் தொடர்பு',
      office_staff:          'அலுவலக ஊழியர்கள்',
      class_timing:          'வகுப்பு நேரம்',
      practice_sessions:     'பயிற்சி அமர்வுகள்',
      facilities:            'வசதிகள்',
      cleanliness:           'சுகாதாரம்',
      waiting_area:          'காத்திருப்பு பகுதி',
      parking:               'வாகன நிறுத்துமிடம்',
      events_programs:       'நிகழ்வுகள் & திட்டங்கள்',
      student_discipline:    'மாணவர் ஒழுக்கம்',
      other:                 'மற்றவை',
    },
    q6_other_label:       'நாங்கள் எதை மேம்படுத்த வேண்டும் என்று சொல்லுங்கள்.',
    q6_other_placeholder: 'உங்கள் பதிலை தட்டச்சு செய்யவும்...',

    q7_label:       '💡 7. KFA இசைக் கல்லூரியிடம் உங்கள் எதிர்பார்ப்பு என்ன?',
    q7_hint:        'நாங்கள் எதை சிறப்பாக செய்ய வேண்டும் என்று விரும்புகிறீர்கள்?',
    q7_placeholder: 'உங்கள் யோசனைகளை அல்லது எதிர்பார்ப்புகளை சொல்லுங்கள்.',

    q8_label: '📈 8. உங்கள் குழந்தையின் கற்றல் முன்னேற்றத்தில் நீங்கள் மகிழ்ச்சியாக இருக்கிறீர்களா?',
    q8_hint:  'ஒரு விருப்பத்தை தேர்ந்தெடுக்கவும்.',
    q8_options: [
      { val: 'Yes',      label: '😊 ஆம்' },
      { val: 'Somewhat', label: '😐 ஓரளவு' },
      { val: 'No',       label: '☹ இல்லை' },
    ],

    q9_label: '🎵 9. KFA இசைக் கல்லூரியை உங்கள் நண்பர்கள் மற்றும் குடும்பத்தினரிடம் பரிந்துரைப்பீர்களா?',
    q9_hint:  'ஒரு விருப்பத்தை தேர்ந்தெடுக்கவும்.',
    q9_options: [
      { val: 'Yes',   label: '👍 ஆம்' },
      { val: 'Maybe', label: '🤔 ஒருவேளை' },
      { val: 'No',    label: '👎 இல்லை' },
    ],

    q10_label:            '📞 10. உங்கள் கருத்தை பற்றி நாங்கள் உங்களை தொடர்பு கொள்ள வேண்டுமா?',
    q10_hint:             'ஆம் என்றால் எங்கள் மேலாளர் உங்களை அழைப்பார்.',
    contact_yes:          'ஆம், என்னை தொடர்பு கொள்ளுங்கள்',
    contact_no:           'இல்லை, தேவையில்லை',
    phone_label:          'தொலைபேசி எண்',
    phone_placeholder:    'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
    contact_method_label: 'விரும்பிய தொடர்பு முறை',
    phone_call:           '📞 தொலைபேசி அழைப்பு',
    whatsapp:             '💬 வாட்ஸ்அப்',

    // Submit
    submit_feedback: 'கருத்தை சமர்பிக்கவும்',
    submitting:      'சமர்பிக்கிறது...',

    // Confirm dialog
    confirm_title: 'உங்கள் கருத்தை சமர்பிக்கவா?',
    confirm_body:  'சமர்பிப்பதற்கு முன் உங்கள் கருத்தை சரிபார்க்கவும். சமர்பித்த பிறகு மாற்ற முடியாது. நீங்கள் தயாரா?',
    go_back:       'திரும்பு',
    yes_submit:    'ஆம், சமர்பிக்கவும்',

    // Validation errors
    err_student_name:       'உங்கள் குழந்தையின் பெயரை உள்ளிடவும்.',
    err_branch:             'உங்கள் குழந்தை படிக்கும் கிளையை தேர்ந்தெடுக்கவும்.',
    err_star_rating:        'KFA இசைக் கல்லூரியை மதிப்பிடவும்.',
    err_feedback_category:  'உங்கள் கருத்து எதைப் பற்றியது என்று தேர்ந்தெடுக்கவும்.',
    err_custom_category:    'உங்கள் கருத்து வகையை உள்ளிடவும்.',
    err_main_feedback:      'உங்கள் கருத்தை விளக்கவும்.',
    err_improvement_areas:  'குறைந்தது ஒரு மேம்படுத்தல் பகுதியை தேர்ந்தெடுக்கவும்.',
    err_custom_improvement: 'நாங்கள் என்னை மேலும் மேம்படுத்த வேண்டும் என்று உள்ளிடவும்.',
    err_contact_preference: 'நாங்கள் உங்களை தொடர்பு கொள்ள வேண்டுமா என்று சொல்லுங்கள்.',
    err_phone_number:       'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்.',
    err_contact_method:     'நீங்கள் எப்படி தொடர்பு கொள்ள விரும்புகிறீர்கள் என்று தேர்ந்தெடுக்கவும்.',

    // Success page
    success_title:    '✅ நன்றி!',
    success_subtitle: 'உங்கள் கருத்து வெற்றிகரமாக சமர்பிக்கப்பட்டது.',
    success_body:     'உங்கள் நேரத்திற்கும் மதிப்புமிக்க ஆலோசனைகளுக்கும் நாங்கள் மனதாரா நன்றி கூறுகிறோம்.\n\nஒவ்வொரு புகார், ஆலோசனை மற்றும் யோசனையும் KFA இசைக் கல்லூரி நிர்வாகக் குழுவால் கவனமாக ஆராயப்படுகிறது.\n\nஉங்கள் கருத்து எங்கள் கற்பித்தல், வசதிகள் மற்றும் சேவைகளை மேம்படுத்த உதவுகிறது.\n\nKFA இசைக் கல்லூரி வளர உதவியதற்கு நன்றி.',
    feedback_id_label: 'உங்கள் கருத்து ஐடி',
    done:             'முடிந்தது',
  },
};

// ── Helper: star display ───────────────────────────────────────────────────
function StarRating({ value, onChange, t }) {
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
            aria-label={`${star} star${star > 1 ? 's' : ''} — ${t.star_labels[star]}`}
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
          {t.star_labels[active]}
        </div>
      )}
      <div className="star-labels" style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        {t.star_legend.map((lbl, i) => (
          <React.Fragment key={i}>
            <span>{lbl}</span>
            {i < t.star_legend.length - 1 && <span>•</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── Language Toggle Button ────────────────────────────────────────────────
function LangToggle({ lang, onToggle }) {
  return (
    <button
      className="lang-toggle-btn"
      onClick={onToggle}
      aria-label="Toggle language"
      title={lang === 'en' ? 'Switch to Tamil' : 'Switch to English'}
    >
      <span className="lang-toggle-icon">🌐</span>
      <span className="lang-toggle-text">
        {lang === 'en' ? 'தமிழ்' : 'English'}
      </span>
    </button>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
function App() {
  const currentPath = window.location.pathname;

  // ── Language state ────────────────────────────────────────────────────
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('kfa_lang') || 'en';
  });
  const t = translations[lang];

  const toggleLang = () => {
    const next = lang === 'en' ? 'ta' : 'en';
    setLang(next);
    localStorage.setItem('kfa_lang', next);
  };

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
      errs.studentName = t.err_student_name;
    }
    if (!form.branch) {
      errs.branch = t.err_branch;
    }
    if (!form.starRating) {
      errs.starRating = t.err_star_rating;
    }
    if (!form.feedbackCategory) {
      errs.feedbackCategory = t.err_feedback_category;
    } else if (form.feedbackCategory === 'Other' && !form.customFeedbackCategory.trim()) {
      errs.customFeedbackCategory = t.err_custom_category;
    }
    if (!form.mainFeedback.trim()) {
      errs.mainFeedback = t.err_main_feedback;
    }
    if (form.improvementAreas.length === 0) {
      errs.improvementAreas = t.err_improvement_areas;
    } else if (form.improvementAreas.includes('other') && !form.customImprovementArea.trim()) {
      errs.customImprovementArea = t.err_custom_improvement;
    }
    if (!form.contactPreference) {
      errs.contactPreference = t.err_contact_preference;
    } else if (form.contactPreference === 'Yes') {
      if (!form.phoneNumber.trim()) {
        errs.phoneNumber = t.err_phone_number;
      }
      if (!form.preferredContactMethod) {
        errs.preferredContactMethod = t.err_contact_method;
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
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

    // Map improvement area keys back to English labels for backend
    const finalImprovements = form.improvementAreas.map(key => {
      if (key === 'other') {
        return `Other: ${form.customImprovementArea.trim()}`;
      }
      return IMPROVEMENT_ENGLISH[key] || key;
    });

    const payload = {
      studentName: form.studentName.trim(),
      name: form.studentName.trim(),
      branch: form.branch,
      department: form.branch,
      starRating: form.starRating,
      feedbackCategory: form.feedbackCategory === 'Other' ? form.customFeedbackCategory.trim() : form.feedbackCategory,
      problems: [form.feedbackCategory === 'Other' ? form.customFeedbackCategory.trim() : form.feedbackCategory],
      mainFeedback: form.mainFeedback.trim(),
      description: form.mainFeedback.trim(),
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
        const errorsObject = errorData.errors || errorData;
        let message = errorData.message || 'Could not submit feedback. Please correct the following errors:\n\n';
        if (errorsObject && typeof errorsObject === 'object') {
          message = 'Could not submit feedback. Please correct the following errors:\n\n';
          Object.entries(errorsObject).forEach(([field, errList]) => {
            const errorsText = Array.isArray(errList) ? errList.join(', ') : String(errList);
            let friendlyField = field;
            if (field === 'studentName' || field === 'student_name') friendlyField = 'Student Name';
            else if (field === 'branch') friendlyField = 'Branch';
            else if (field === 'starRating' || field === 'star_rating') friendlyField = 'Star Rating';
            else if (field === 'feedbackCategory' || field === 'feedback_category') friendlyField = 'Feedback Category';
            else if (field === 'mainFeedback' || field === 'main_feedback') friendlyField = 'Feedback Explanation';
            else if (field === 'improvementAreas' || field === 'improvement_areas') friendlyField = 'Improvements';
            else if (field === 'expectations') friendlyField = 'Expectations';
            else if (field === 'recommend') friendlyField = 'Recommend';
            else if (field === 'contactPreference' || field === 'contact_preference') friendlyField = 'Contact Preference';
            else if (field === 'phoneNumber' || field === 'phone_number') friendlyField = 'Phone Number';
            else if (field === 'preferredContactMethod' || field === 'preferred_contact_method') friendlyField = 'Preferred Contact Method';
            else if (field === 'learningProgress' || field === 'learning_progress') friendlyField = 'Learning Progress';
            message += `• ${friendlyField}: ${errorsText}\n`;
          });
        }
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

  // ── Admin password modal (shared) ──────────────────────────────────────
  const PasswordModal = () => showPasswordModal ? (
    <div className="pw-modal-overlay">
      <div className="pw-modal-box">
        <h3>{t.admin_login}</h3>
        <p>{t.admin_enter_password}</p>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (modalPassword === 'admin123') {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            window.location.href = '/admin';
          } else {
            setModalError(t.wrong_password);
          }
        }}>
          <input
            type="password"
            placeholder={t.enter_password}
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
            }}>{t.cancel}</button>
            <button type="submit" className="pw-submit-btn">{t.access}</button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

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
              <h1>{t.academy_name}</h1>
              <p>{t.feedback_system}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LangToggle lang={lang} onToggle={toggleLang} />
            {adminClickCount >= 5 && (
              <nav className="nav-tabs">
                <button
                  className="nav-tab active"
                  onClick={() => setShowPasswordModal(true)}
                >
                  {t.admin_portal}
                </button>
              </nav>
            )}
          </div>
        </header>

        <main className="landing-page page-fade-in">
          <div className="landing-logo-wrap">
            <img src={kfaLogo} alt="KFA Music Academy" />
          </div>

          <h1 className="landing-title">{t.academy_name}</h1>
          <p className="landing-subtitle">{t.landing_subtitle}</p>

          <div className="landing-desc">
            <p>{t.landing_desc1}</p>
            <p>{t.landing_desc2}</p>
            <p>{t.landing_desc3}</p>
          </div>

          <button
            className="landing-cta-btn"
            onClick={() => { setView('form'); window.scrollTo(0, 0); }}
            id="start-feedback-btn"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {t.start_feedback}
          </button>

          <p className="landing-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {t.landing_note}
          </p>
        </main>

        <PasswordModal />
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
              <h1>{t.academy_name}</h1>
              <p>{t.feedback_system}</p>
            </div>
          </div>
          <LangToggle lang={lang} onToggle={toggleLang} />
        </header>
        <main>
          <div className="success-page page-fade-in">
            <div className="success-icon-circle">
              <svg className="success-check" viewBox="0 0 52 52">
                <path d="M14 27 l10 10 l14 -18" strokeDasharray="100" strokeDashoffset="100" />
              </svg>
            </div>

            <h1 className="success-title">{t.success_title}</h1>
            <p className="success-subtitle">{t.success_subtitle}</p>

            <p className="success-body" style={{ textAlign: 'center', maxWidth: 560, lineHeight: 1.8, fontSize: '15px', whiteSpace: 'pre-line' }}>
              {t.success_body}
            </p>

            <div className="feedback-id-box" style={{ margin: '24px 0' }}>
              <span className="feedback-id-label">{t.feedback_id_label}</span>
              <span className="feedback-id-value">{generatedId}</span>
            </div>

            <button className="btn-done" onClick={resetAll} id="done-btn">
              {t.done}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  //  FEEDBACK FORM
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
            <h1>{t.academy_name}</h1>
            <p>{t.feedback_system}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LangToggle lang={lang} onToggle={toggleLang} />
          <nav className="nav-tabs">
            <button className="nav-tab" onClick={() => { setView('landing'); setErrors({}); }}>
              {t.home}
            </button>
            {adminClickCount >= 5 && (
              <button className="nav-tab active" onClick={() => setShowPasswordModal(true)}>
                {t.admin}
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="page-fade-in" style={{ paddingTop: 28 }}>
        <div className="form-page">
          <div className="form-card">
            <form onSubmit={handleSubmitAttempt}>

              {/* ── Q1: Student Name ── */}
              <div className="question-group" id="q-studentName">
                <label className="question-label" htmlFor="student-name">
                  {t.q1_label} <span className="required-star">*</span>
                </label>
                <p className="question-hint">{t.q1_hint}</p>
                <input
                  id="student-name"
                  type="text"
                  className="kfa-input"
                  placeholder={t.q1_placeholder}
                  value={form.studentName}
                  onChange={e => setField('studentName', e.target.value)}
                  autoComplete="name"
                />
                {errors.studentName && <p className="field-error" id="error-studentName">⚠ {errors.studentName}</p>}
              </div>

              {/* ── Q2: Branch ── */}
              <div className="question-group" id="q-branch">
                <p className="question-label">
                  {t.q2_label} <span className="required-star">*</span>
                </p>
                <p className="question-hint">{t.q2_hint}</p>
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
                      <span className="radio-card-text">{b} {t.branch_suffix}</span>
                    </div>
                  ))}
                </div>
                {errors.branch && <p className="field-error" id="error-branch">⚠ {errors.branch}</p>}
              </div>

              {/* ── Q3: Star Rating ── */}
              <div className="question-group" id="q-starRating">
                <p className="question-label">
                  {t.q3_label} <span className="required-star">*</span>
                </p>
                <p className="question-hint">{t.q3_hint}</p>
                <StarRating value={form.starRating} onChange={val => setField('starRating', val)} t={t} />
                {errors.starRating && <p className="field-error" id="error-starRating" style={{ marginTop: 10 }}>⚠ {errors.starRating}</p>}
              </div>

              {/* ── Q4: Feedback Category ── */}
              <div className="question-group" id="q-feedbackCategory">
                <p className="question-label">
                  {t.q4_label} <span className="required-star">*</span>
                </p>
                <p className="question-hint">{t.q4_hint}</p>
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
                      <span className="category-btn-label">{t.category_labels[cat.id]}</span>
                    </div>
                  ))}
                </div>
                {errors.feedbackCategory && <p className="field-error" id="error-feedbackCategory" style={{ marginTop: 10 }}>⚠ {errors.feedbackCategory}</p>}

                {form.feedbackCategory === 'Other' && (
                  <div style={{ marginTop: 16 }} className="page-fade-in">
                    <label className="question-label" htmlFor="custom-category" style={{ fontSize: '0.95rem' }}>
                      {t.q4_other_label} <span className="required-star">*</span>
                    </label>
                    <input
                      id="custom-category"
                      type="text"
                      className="kfa-input"
                      placeholder={t.q4_other_placeholder}
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
                  {t.q5_label} <span className="required-star">*</span>
                </label>
                <p className="question-hint">{t.q5_hint}</p>
                <textarea
                  id="main-feedback"
                  className="kfa-textarea"
                  placeholder={t.q5_placeholder}
                  value={form.mainFeedback}
                  onChange={e => setField('mainFeedback', e.target.value)}
                />
                {errors.mainFeedback && <p className="field-error" id="error-mainFeedback">⚠ {errors.mainFeedback}</p>}
              </div>

              {/* ── Q6: Improvement Areas ── */}
              <div className="question-group" id="q-improvementAreas">
                <p className="question-label">
                  {t.q6_label} <span className="required-star">*</span>
                </p>
                <p className="question-hint">{t.q6_hint}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 10 }}>
                  {IMPROVEMENT_OPTION_KEYS.map(key => {
                    const isSelected = form.improvementAreas.includes(key);
                    return (
                      <div
                        key={key}
                        className={`radio-card${isSelected ? ' selected' : ''}`}
                        onClick={() => toggleImprovement(key)}
                        style={{ padding: '12px 16px', borderRadius: '10px' }}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && toggleImprovement(key)}
                      >
                        <div className="radio-dot" style={{ borderRadius: '4px', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <span style={{ color: 'var(--kfa-navy)', fontWeight: 'bold', fontSize: 13 }}>✓</span>}
                        </div>
                        <span className="radio-card-text" style={{ fontSize: '0.9rem' }}>{t.improvement_labels[key]}</span>
                      </div>
                    );
                  })}
                </div>
                {errors.improvementAreas && <p className="field-error" id="error-improvementAreas" style={{ marginTop: 12 }}>⚠ {errors.improvementAreas}</p>}

                {form.improvementAreas.includes('other') && (
                  <div style={{ marginTop: 16 }} className="page-fade-in">
                    <label className="question-label" htmlFor="custom-improve" style={{ fontSize: '0.95rem' }}>
                      {t.q6_other_label} <span className="required-star">*</span>
                    </label>
                    <input
                      id="custom-improve"
                      type="text"
                      className="kfa-input"
                      placeholder={t.q6_other_placeholder}
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
                  {t.q7_label}
                </label>
                <p className="question-hint">{t.q7_hint}</p>
                <textarea
                  id="expectations"
                  className="kfa-textarea"
                  placeholder={t.q7_placeholder}
                  value={form.expectations}
                  onChange={e => setField('expectations', e.target.value)}
                  style={{ minHeight: 110 }}
                />
              </div>

              {/* ── Q8: Child progress ── */}
              <div className="question-group" id="q-learningProgress">
                <p className="question-label">
                  {t.q8_label}
                </p>
                <p className="question-hint">{t.q8_hint}</p>
                <div className="radio-cards">
                  {t.q8_options.map(opt => (
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
                  {t.q9_label}
                </p>
                <p className="question-hint">{t.q9_hint}</p>
                <div className="radio-cards">
                  {t.q9_options.map(opt => (
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
                  {t.q10_label} <span className="required-star">*</span>
                </p>
                <p className="question-hint">{t.q10_hint}</p>
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
                      <span className="radio-card-text">{opt === 'Yes' ? t.contact_yes : t.contact_no}</span>
                    </div>
                  ))}
                </div>
                {errors.contactPreference && <p className="field-error" id="error-contactPreference">⚠ {errors.contactPreference}</p>}

                {form.contactPreference === 'Yes' && (
                  <div className="page-fade-in" style={{ marginTop: 20, padding: 16, background: 'var(--bg-navy-soft)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-color)' }}>

                    {/* Phone Number */}
                    <div className="question-group" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 16 }}>
                      <label className="question-label" htmlFor="phone-number" style={{ fontSize: '0.95rem' }}>
                        {t.phone_label} <span className="required-star">*</span>
                      </label>
                      <input
                        id="phone-number"
                        type="tel"
                        className="kfa-input"
                        placeholder={t.phone_placeholder}
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
                        {t.contact_method_label} <span className="required-star">*</span>
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
                              {method === 'WhatsApp' ? t.whatsapp : t.phone_call}
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
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      {t.submit_feedback}
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
            <h3>{t.confirm_title}</h3>
            <p>{t.confirm_body}</p>
            <div className="dialog-actions">
              <button className="dialog-cancel" onClick={() => setShowConfirm(false)}>
                {t.go_back}
              </button>
              <button className="dialog-confirm" id="confirm-submit-btn" onClick={handleConfirmedSubmit}>
                {t.yes_submit}
              </button>
            </div>
          </div>
        </div>
      )}

      <PasswordModal />
    </div>
  );
}

export default App;
