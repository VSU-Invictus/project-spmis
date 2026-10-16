import React, { useState, useEffect, useRef } from 'react';
import { QueueModal } from '../components/queue-modal/QueueModal';
import { ApplicationQueue } from '../components/application-queue/ApplicationQueue';
import { QUEUE_TITLES } from '../components/queue-modal/queues';
import { useQueueSearchParam } from '../components/queue-modal/useQueueSearchParam';
import { useTheme } from '../context/ThemeContext';

import '../../../mockup/assets/css/design-system.css';
import '../../../mockup/assets/css/global.css';
import '../../../mockup/assets/css/components.css';
import '../../../mockup/assets/css/queue-modal.css';
import '../../../mockup/assets/css/pages/design-system.css';
import spmisLogo from '../../../mockup/assets/icons/SPMIS.png';

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  program: string;
  yearLevel: string;
  statusText: string;
  statusVariant: 'success' | 'warning' | 'info';
  actionType: 'view-button' | 'review-link' | 'write-review-link';
}

const INITIAL_STUDENTS: StudentRecord[] = [
  { id: '24-1-00001', name: 'Sam Lee Parker', email: 'sam.parker@vsu.edu.ph', program: 'BS Computer Science', yearLevel: '3rd Year', statusText: 'Approved / Active', statusVariant: 'success', actionType: 'view-button' },
  { id: '24-1-00042', name: 'Elena Bautista', email: 'elena.b@vsu.edu.ph', program: 'BS Information Systems', yearLevel: '2nd Year', statusText: 'Pending Review', statusVariant: 'warning', actionType: 'review-link' },
  { id: '24-1-00109', name: 'Rafael Cruz', email: 'r.cruz@vsu.edu.ph', program: 'BS Information Technology', yearLevel: '4th Year', statusText: 'In Progress', statusVariant: 'info', actionType: 'write-review-link' },
  { id: '24-1-00210', name: 'Adrian Davis', email: 'adrian.d@vsu.edu.ph', program: 'BS Computer Science', yearLevel: '3rd Year', statusText: 'Approved / Active', statusVariant: 'success', actionType: 'view-button' },
  { id: '24-1-00211', name: 'Liam Moore', email: 'liam.m@vsu.edu.ph', program: 'BS Information Systems', yearLevel: '1st Year', statusText: 'In Progress', statusVariant: 'info', actionType: 'view-button' },
  { id: '24-1-00212', name: 'Kaitlyn Smith', email: 'k.smith@vsu.edu.ph', program: 'BS Computer Engineering', yearLevel: '4th Year', statusText: 'Approved / Active', statusVariant: 'success', actionType: 'view-button' },
  { id: '24-1-00213', name: 'Justin Taylor', email: 'j.taylor@vsu.edu.ph', program: 'BS Computer Science', yearLevel: '2nd Year', statusText: 'Pending Review', statusVariant: 'warning', actionType: 'view-button' },
  { id: '24-1-00214', name: 'Mia Johnson', email: 'm.johnson@vsu.edu.ph', program: 'BS Data Science', yearLevel: '1st Year', statusText: 'Approved / Active', statusVariant: 'success', actionType: 'view-button' },
  { id: '24-1-00215', name: 'Ethan White', email: 'e.white@vsu.edu.ph', program: 'BS Artificial Intelligence', yearLevel: '3rd Year', statusText: 'Approved / Active', statusVariant: 'success', actionType: 'view-button' },
  { id: '24-1-00216', name: 'Chloe Brown', email: 'c.brown@vsu.edu.ph', program: 'BS Computer Science', yearLevel: '4th Year', statusText: 'Approved / Active', statusVariant: 'success', actionType: 'view-button' },
];

interface ChatMessage {
  id: string;
  sender: string;
  time: string;
  type: 'ai' | 'user';
  text: string;
  avatar?: string;
  isHtml?: boolean;
}

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'AI Assistant',
    time: '10:42 AM',
    type: 'ai',
    avatar: 'SP',
    text: 'What would you like to explore across the student records? You can ask about research experience, leadership, or specific project contributions.',
  },
  {
    id: 'msg-2',
    sender: 'Prof. Morgan',
    time: '10:43 AM',
    type: 'user',
    text: 'Which students in BS Computer Science demonstrate outstanding research contributions?',
  },
  {
    id: 'msg-3',
    sender: 'AI Assistant',
    time: '10:43 AM',
    type: 'ai',
    avatar: 'SP',
    text: 'Based on active reviews, <strong>Sam Lee Parker (24-1-00001)</strong> published a peer-reviewed paper on neural network quantization in IEEE Access and mentored underclassmen in the capstone research symposium.',
    isHtml: true,
  },
];

export default function StyleguidePage() {
  const { toggleTheme, isDark } = useTheme();

  // Modal & Queue Routing
  const { queue, openQueue, closeQueue } = useQueueSearchParam();
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [facultyModalOpen, setFacultyModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states in modals
  const [adminDeptName, setAdminDeptName] = useState('Department of Artificial Intelligence');
  const [facultyDeptName, setFacultyDeptName] = useState('Department of Quantum Computing');

  const facultyDialogRef = useRef<HTMLDialogElement>(null);
  const logoutDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (facultyModalOpen) {
      facultyDialogRef.current?.showModal();
    } else {
      facultyDialogRef.current?.close();
    }
  }, [facultyModalOpen]);

  useEffect(() => {
    if (logoutDialogOpen) {
      logoutDialogRef.current?.showModal();
    } else {
      logoutDialogRef.current?.close();
    }
  }, [logoutDialogOpen]);

  // Interactive Section States
  // 1. Typography Skeleton Simulation
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [textLoadingLabel, setTextLoadingLabel] = useState('Simulate Skeleton Loading (280ms)');
  const [textLoadingStatus, setTextLoadingStatus] = useState('Preview loading without changing text spacing.');

  // 2. Card Skeleton Simulation
  const [isCardLoading, setIsCardLoading] = useState(false);
  const [cardLoadingLabel, setCardLoadingLabel] = useState('Simulate Skeleton Loading (280ms)');
  const [cardLoadingStatus, setCardLoadingStatus] = useState('Preview loading without changing card dimensions.');

  // 3. Tag Cluster Popover
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const tagPopoverRef = useRef<HTMLDivElement>(null);

  // 4. Data Table Simulation & Interactivity
  const [isTableSkeleton, setIsTableSkeleton] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(['24-1-00001', '24-1-00042']);
  const [tableRowsPerPage, setTableRowsPerPage] = useState<number>(5);
  const [tableCurrentPage, setTableCurrentPage] = useState<number>(1);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  // 5. Sidebar Navigation Demo
  const [activeNavKey, setActiveNavKey] = useState<string>('dashboard');

  // 6. Chat thread
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const chatLogRef = useRef<HTMLDivElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 7. Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authKeepSignedIn, setAuthKeepSignedIn] = useState(true);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Handle outside click for tag popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagPopoverRef.current && !tagPopoverRef.current.contains(e.target as Node)) {
        setIsTagPopoverOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTagPopoverOpen(false);
        setAdminModalOpen(false);
        setRemoveModalOpen(false);
        setFacultyModalOpen(false);
        setLogoutDialogOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Update select all indeterminate state
  useEffect(() => {
    if (!selectAllCheckboxRef.current) return;
    const total = INITIAL_STUDENTS.length;
    const checked = selectedRowIds.length;
    if (checked === 0) {
      selectAllCheckboxRef.current.checked = false;
      selectAllCheckboxRef.current.indeterminate = false;
    } else if (checked === total) {
      selectAllCheckboxRef.current.checked = true;
      selectAllCheckboxRef.current.indeterminate = false;
    } else {
      selectAllCheckboxRef.current.checked = false;
      selectAllCheckboxRef.current.indeterminate = true;
    }
  }, [selectedRowIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSimulateTextLoading = () => {
    if (isTextLoading) return;
    setIsTextLoading(true);
    setTextLoadingLabel('Loading texts…');
    setTextLoadingStatus('Loading typography examples…');
    setTimeout(() => {
      setIsTextLoading(false);
      setTextLoadingLabel('Simulate Skeleton Loading (280ms)');
      setTextLoadingStatus('Typography examples loaded. You can preview again.');
    }, 280);
  };

  const handleSimulateCardLoading = () => {
    if (isCardLoading) return;
    setIsCardLoading(true);
    setCardLoadingLabel('Loading cards…');
    setCardLoadingStatus('Loading standard, KPI, and interactive cards…');
    setTimeout(() => {
      setIsCardLoading(false);
      setCardLoadingLabel('Simulate Skeleton Loading (280ms)');
      setCardLoadingStatus('Card examples loaded. You can preview again.');
    }, 280);
  };

  const handleSimulateTableSkeleton = () => {
    if (isTableSkeleton) return;
    setIsTableSkeleton(true);
    setTimeout(() => {
      setIsTableSkeleton(false);
    }, 280);
  };

  const handleSelectAllToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(INITIAL_STUDENTS.map(s => s.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleRowCheckboxToggle = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleChatSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'Prof. Morgan',
      time: timeStr,
      type: 'user',
      text,
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    if (chatTextareaRef.current) {
      chatTextareaRef.current.style.height = 'auto';
    }
    setTimeout(() => {
      if (chatLogRef.current) {
        chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleSendPrompt = (promptText: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `prompt-${Date.now()}`,
      sender: 'Prof. Morgan',
      time: timeStr,
      type: 'user',
      text: promptText,
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    if (chatTextareaRef.current) {
      chatTextareaRef.current.style.height = 'auto';
    }
    setTimeout(() => {
      if (chatLogRef.current) {
        chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasErr = false;
    if (!authEmail.trim()) {
      setEmailError(true);
      hasErr = true;
    } else {
      setEmailError(false);
    }
    if (!authPassword.trim()) {
      setPasswordError(true);
      hasErr = true;
    } else {
      setPasswordError(false);
    }
    if (!hasErr) {
      showToast(`Welcome back, ${authEmail}! Signing in...`);
    }
  };

  // Pagination slicing
  const totalStudents = INITIAL_STUDENTS.length;
  const totalPages = Math.max(1, Math.ceil(totalStudents / tableRowsPerPage));
  const tableSliceStart = (tableCurrentPage - 1) * tableRowsPerPage;
  const visibleStudents = INITIAL_STUDENTS.slice(tableSliceStart, tableSliceStart + tableRowsPerPage);

  return (
    <>
      <div className="ui-styleguide">
        {/* Top Workspace Header Bar with Theme Switcher */}
        <header className="ui-top-bar">
            <div className="ui-top-bar-left">
              <div className="ui-top-bar-dot"></div>
              <span className="ui-top-bar-breadcrumb">SPMIS DESIGN SYSTEM / LIVING STYLE GUIDE</span>
            </div>
            <div className="ui-top-bar-right">
              {/* Live Theme Toggle Switch */}
              <button
                type="button"
                id="theme-toggle-btn"
                className="ui-theme-toggle"
                aria-label="Toggle theme"
                onClick={toggleTheme}
              >
                <span id="theme-icon">{isDark ? '🌙' : '☀️'}</span>
                <span id="theme-label">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <div className="ui-top-bar-badge">
                <span className="ui-top-bar-pulse"></span>
                <span>Claude+ Standard</span>
              </div>
            </div>
          </header>

          {/* Page Title & Overview */}
          <div className="ui-header">
            <h1 className="ui-header-title">Claude+ Living Style Guide</h1>
            <p className="ui-header-subtitle">
              Interactive visualization and component reference for the raw HTML/CSS Claude+ design system.
              Supports both <strong>Light Mode</strong> (warm paper canvas) and <strong>Dark Mode</strong> (charcoal canvas)
              with unified <code>.ui-*</code> class architecture.
            </p>
          </div>

          {/* Quick Navigation Anchor Bar */}
          <nav className="ui-quick-nav is-d8c8a7b">
            <a href="#color-palette" className="ui-badge ui-badge--neutral is-3fcf0f3">Colors</a>
            <a href="#typography" className="ui-badge ui-badge--neutral is-3fcf0f3">Typography</a>
            <a href="#badges" className="ui-badge ui-badge--neutral is-3fcf0f3">Badges &amp; Tags</a>
            <a href="#buttons" className="ui-badge ui-badge--neutral is-3fcf0f3">Buttons &amp; Actions</a>
            <a href="#form-controls" className="ui-badge ui-badge--neutral is-3fcf0f3">Form Controls &amp; Filters</a>
            <a href="#cards" className="ui-badge ui-badge--neutral is-3fcf0f3">Cards &amp; KPIs</a>
            <a href="#data-tables" className="ui-badge ui-badge--neutral is-3fcf0f3">Data Tables &amp; Shimmers</a>
            <a href="#portal-sidebars" className="ui-badge ui-badge--neutral is-3fcf0f3">Portal Sidebars</a>
            <a href="#portal-modals" className="ui-badge ui-badge--neutral is-3fcf0f3">Modals &amp; Dialogs</a>
            <a href="#chats" className="ui-badge ui-badge--neutral is-3fcf0f3">Chats &amp; AI</a>
            <a href="#auth-cards" className="ui-badge ui-badge--neutral is-3fcf0f3">Auth Cards</a>
            <a href="#workspace-frame" className="ui-badge ui-badge--neutral is-3fcf0f3">Workspace Frame &amp; Footer</a>
          </nav>

          {/* 1. Color Palette Section */}
          <section className="ui-section" id="color-palette">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Color Palette (OKLCH Dynamic Tokens)</h2>
              <span className="ui-section-desc">Tokens adapt automatically when toggling between Light and Dark mode</span>
            </div>
            <div className="ui-grid ui-grid-cols-4">
              <div className="ui-color-card">
                <div className="ui-color-swatch is-723357a"></div>
                <div className="ui-color-info">
                  <span className="ui-color-name">Primary Accent</span>
                  <span className="ui-color-var">var(--primary)</span>
                  <span className="ui-color-role">Terracotta Action (#D97251)</span>
                </div>
              </div>

              <div className="ui-color-card">
                <div className="ui-color-swatch is-7c7c114"></div>
                <div className="ui-color-info">
                  <span className="ui-color-name">App Background</span>
                  <span className="ui-color-var">var(--background)</span>
                  <span className="ui-color-role">Paper (Light) / Charcoal (Dark)</span>
                </div>
              </div>

              <div className="ui-color-card">
                <div className="ui-color-swatch is-51d61e6"></div>
                <div className="ui-color-info">
                  <span className="ui-color-name">Card Surface</span>
                  <span className="ui-color-var">var(--card)</span>
                  <span className="ui-color-role">Container Surface</span>
                </div>
              </div>

              <div className="ui-color-card">
                <div className="ui-color-swatch is-8b2bed2"></div>
                <div className="ui-color-info">
                  <span className="ui-color-name">Border &amp; Dividers</span>
                  <span className="ui-color-var">var(--border)</span>
                  <span className="ui-color-role">Subtle Framing</span>
                </div>
              </div>

              <div className="ui-color-card">
                <div className="ui-color-swatch is-0df57ad"></div>
                <div className="ui-color-info">
                  <span className="ui-color-name">Muted Surface</span>
                  <span className="ui-color-var">var(--muted)</span>
                  <span className="ui-color-role">Inputs &amp; Recessed Areas</span>
                </div>
              </div>

              <div className="ui-color-card">
                <div className="ui-color-swatch is-04bdb5e"></div>
                <div className="ui-color-info">
                  <span className="ui-color-name">Foreground Text</span>
                  <span className="ui-color-var">var(--foreground)</span>
                  <span className="ui-color-role">High Contrast Content</span>
                </div>
              </div>

              <div className="ui-color-card">
                <div className="ui-color-swatch is-915cf5f"></div>
                <div className="ui-color-info">
                  <span className="ui-color-name">Muted Foreground</span>
                  <span className="ui-color-var">var(--muted-foreground)</span>
                  <span className="ui-color-role">Secondary Labels</span>
                </div>
              </div>

              <div className="ui-color-card">
                <div className="ui-color-swatch is-b8a4cfc"></div>
                <div className="ui-color-info">
                  <span className="ui-color-name">Destructive</span>
                  <span className="ui-color-var">var(--destructive)</span>
                  <span className="ui-color-role">Alerts &amp; Delete (#DC2626)</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Typography Section */}
          <section className="ui-section" id="typography">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Typography</h2>
              <span className="ui-section-desc">Outfit font family with Geist Mono for codes and tabular metrics</span>
            </div>
            <div className="ui-demo-loading-toolbar">
              <span id="demo-text-loading-status" className="ui-text-muted" role="status" aria-live="polite" aria-atomic="true">
                {textLoadingStatus}
              </span>
              <button
                type="button"
                id="demo-simulate-text-loading-btn"
                className="ui-btn ui-btn-outline ui-demo-simulate-button"
                aria-controls="demo-text-loading-grid"
                onClick={handleSimulateTextLoading}
                disabled={isTextLoading}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span id="demo-text-loading-label">{textLoadingLabel}</span>
              </button>
            </div>

            <div className="ui-grid ui-grid-cols-2" id="demo-text-loading-grid">
              <div className="ui-typography-sample">
                <span className={`ui-btn-label ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                  <span className="ui-text-loading-content">Headings Scale</span>
                  {isTextLoading && (
                    <span className="ui-text-loading-placeholder" aria-hidden="true">
                      <span className="ui-skeleton ui-skeleton--text-line" />
                    </span>
                  )}
                </span>
                <div>
                  <h1 className={`ui-heading-1 ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">Primary Heading 1 (Display Title)</span>
                    {isTextLoading && (
                      <span className="ui-text-loading-placeholder" aria-hidden="true">
                        <span className="ui-skeleton ui-skeleton--text-line" />
                      </span>
                    )}
                  </h1>
                  <p className={`ui-text-caption ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">30px &middot; Font-weight 800 &middot; Letter-spacing -0.025em &middot; <code>var(--foreground)</code></span>
                  </p>
                </div>
                <div>
                  <h2 className={`ui-heading-2 ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">Secondary Heading 2 (Section Title)</span>
                    {isTextLoading && (
                      <span className="ui-text-loading-placeholder" aria-hidden="true">
                        <span className="ui-skeleton ui-skeleton--text-line" />
                      </span>
                    )}
                  </h2>
                  <p className={`ui-text-caption ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">22px &middot; Font-weight 700 &middot; Letter-spacing -0.02em &middot; <code>var(--foreground)</code></span>
                  </p>
                </div>
                <div>
                  <h3 className={`ui-heading-3 ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">Tertiary Heading 3 (Card &amp; Panel Header)</span>
                    {isTextLoading && (
                      <span className="ui-text-loading-placeholder" aria-hidden="true">
                        <span className="ui-skeleton ui-skeleton--text-line" />
                      </span>
                    )}
                  </h3>
                  <p className={`ui-text-caption ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">18px &middot; Font-weight 600 &middot; <code>var(--card-foreground)</code></span>
                  </p>
                </div>
              </div>

              <div className="ui-typography-sample">
                <span className={`ui-btn-label ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                  <span className="ui-text-loading-content">Paragraph &amp; Muted Hierarchy</span>
                  {isTextLoading && (
                    <span className="ui-text-loading-placeholder" aria-hidden="true">
                      <span className="ui-skeleton ui-skeleton--text-line" />
                    </span>
                  )}
                </span>
                <div>
                  <h3 className={`ui-heading-3 ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">Primary Paragraph Text</span>
                  </h3>
                  <p className={`ui-text ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">
                      SPMIS provides a unified academic progress management portal with warm surfaces and clear hierarchy.
                      Primary text is styled with <code>var(--foreground)</code> to maintain optimal readability and comfortable contrast.
                    </span>
                    {isTextLoading && (
                      <span className="ui-text-loading-placeholder" aria-hidden="true">
                        <span className="ui-skeleton ui-skeleton--text-line" />
                        <span className="ui-skeleton ui-skeleton--text-line" />
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className={`ui-heading-3 ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">Muted Descriptive Text</span>
                  </h3>
                  <p className={`ui-text-muted ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">
                      Secondary details, audit timestamps, and status explanations utilize <code>var(--muted-foreground)</code> to
                      establish quiet visual depth without distracting from critical operational data.
                    </span>
                    {isTextLoading && (
                      <span className="ui-text-loading-placeholder" aria-hidden="true">
                        <span className="ui-skeleton ui-skeleton--text-line" />
                        <span className="ui-skeleton ui-skeleton--text-line" />
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className={`ui-heading-3 ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">Monospace Data Text</span>
                  </h3>
                  <p className={`ui-text-mono ${isTextLoading ? 'ui-text--loading' : ''}`} aria-busy={isTextLoading}>
                    <span className="ui-text-loading-content">
                      Student ID: 24-1-00001 &middot; Roster Count: 2,850 &middot; Status: VERIFIED_OK
                    </span>
                    {isTextLoading && (
                      <span className="ui-text-loading-placeholder" aria-hidden="true">
                        <span className="ui-skeleton ui-skeleton--text-line" />
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Status Badges & Chips Section */}
          <section className="ui-section" id="badges">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Status Badges &amp; Tags</h2>
              <span className="ui-section-desc">Unified semantic pill tags and status indicators matching portal tables and audit logs</span>
            </div>
            <div className="ui-grid ui-grid-cols-2">
              {/* 1. Lifecycle & Operational Statuses */}
              <div className="ui-btn-row">
                <span className="ui-btn-label">Operational &amp; Lifecycle Statuses</span>
                <div className="ui-btn-group">
                  <span className="ui-badge ui-badge--success">
                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Approved / Active
                  </span>
                  <span className="ui-badge ui-badge--warning">
                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Pending Review
                  </span>
                  <span className="ui-badge ui-badge--destructive">
                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    Rejected / Deficient
                  </span>
                  <span className="ui-badge ui-badge--info">
                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    In Progress
                  </span>
                  <span className="ui-badge ui-badge--neutral">
                    Archived / Draft
                  </span>
                </div>
                <p className="ui-text-caption">
                  Standard status badges across applications and roster views with color-matched iconography and semantic background tints.
                </p>
              </div>

              {/* 2. Entity Types & Origin Context */}
              <div className="ui-btn-row">
                <span className="ui-btn-label">Entity Classification &amp; Origin Tags</span>
                <div className="ui-btn-group">
                  <span className="ui-badge ui-badge--purple">Department</span>
                  <span className="ui-badge ui-badge--cyan">Program</span>
                  <span className="ui-badge ui-badge--warning">Student Origin</span>
                  <span className="ui-badge ui-badge--info">Faculty Origin</span>
                  <span className="ui-badge ui-badge--destructive">System / Direct</span>
                </div>
                <p className="ui-text-caption">
                  Structural entity types used in directory tables, application routing, and system entity filters.
                </p>
              </div>

              {/* 3. Audit Activity & Mutation Events */}
              <div className="ui-btn-row">
                <span className="ui-btn-label">Audit Log Activity Badges</span>
                <div className="ui-btn-group">
                  <span className="ui-badge ui-badge--success">Created / Addition</span>
                  <span className="ui-badge ui-badge--info">Updated / Edit</span>
                  <span className="ui-badge ui-badge--destructive">Removed / Deleted</span>
                  <span className="ui-badge ui-badge--purple">Evaluation Review</span>
                </div>
                <p className="ui-text-caption">
                  Mutation indicators used across system audit trails to identify record creation, modifications, and removals.
                </p>
              </div>

              {/* 4. Domain & Competency Categories */}
              <div className="ui-btn-row">
                <span className="ui-btn-label">Domain &amp; Competency Assessment Tags</span>
                <div className="ui-btn-group">
                  <span className="ui-badge ui-badge--purple">Research</span>
                  <span className="ui-badge ui-badge--cyan">Algorithms</span>
                  <span className="ui-badge ui-badge--amber">Leadership</span>
                  <span className="ui-badge ui-badge--rose">Robotics</span>
                  <span className="ui-badge ui-badge--neutral">General Academic</span>
                </div>
                <p className="ui-text-caption">
                  Subject-matter and competency review tags applied to student evaluations and academic curriculum areas. Uniform 1px border is applied across all color variants.
                </p>
              </div>

              {/* 5. Tag Cluster & Overflow Counter */}
              <div className="ui-btn-row">
                <span className="ui-btn-label">Tag Cluster &amp; Overflow Counter (+N)</span>
                <div className="ui-btn-group">
                  <div className="ui-tags-cluster">
                    <span className="ui-badge ui-badge--purple">Research</span>
                    <span className="ui-badge ui-badge--cyan">Algorithms</span>
                    <div
                      ref={tagPopoverRef}
                      className={`ui-tags-more ${isTagPopoverOpen ? 'is-open' : ''}`}
                      tabIndex={0}
                      role="button"
                      aria-haspopup="true"
                      aria-expanded={isTagPopoverOpen}
                      aria-label="2 more tags"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTagPopoverOpen(!isTagPopoverOpen);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsTagPopoverOpen(!isTagPopoverOpen);
                        }
                      }}
                    >
                      <span className="ui-badge ui-badge--neutral ui-tags-more-btn">+2</span>
                      <div className="ui-tags-popover" role="tooltip">
                        <div className="ui-tags-popover-title">Additional Tags (2)</div>
                        <div className="ui-tags-popover-list">
                          <span className="ui-badge ui-badge--amber">Leadership</span>
                          <span className="ui-badge ui-badge--rose">Robotics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="ui-text-caption">
                  Prevents table and card crowding by displaying up to 2 primary tags with an interactive <code>+N</code> counter that reveals additional tags on hover or click.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Buttons Section */}
          <section className="ui-section" id="buttons">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Buttons &amp; Actions</h2>
              <span className="ui-section-desc">Interactive button primitives conforming to the unified <code>.ui-btn</code> specification</span>
            </div>
            <div className="ui-grid ui-grid-cols-2">
              {/* Standard Button Variants */}
              <div className="ui-btn-row">
                <span className="ui-btn-label">Standard .ui-btn Variants</span>
                <div className="ui-btn-group">
                  <button type="button" className="ui-btn">Primary Action</button>
                  <button type="button" className="ui-btn ui-btn-secondary">Secondary Action</button>
                  <button type="button" className="ui-btn ui-btn-outline">Outline Action</button>
                  <button type="button" className="ui-btn ui-btn-destructive">Destructive</button>
                </div>
                <p className="ui-text-caption">
                  Primary uses terracotta <code>var(--primary)</code> with bold black text. Secondary and outline utilize <code>var(--secondary)</code> and <code>var(--border)</code>.
                </p>
              </div>

              {/* Button States & Icons */}
              <div className="ui-btn-row">
                <span className="ui-btn-label">Button States &amp; Icons</span>
                <div className="ui-btn-group">
                  <button type="button" className="ui-btn">
                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>With Leading Icon</span>
                  </button>
                  <button type="button" className="ui-btn ui-btn-secondary">
                    <span>Next</span>
                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                  <button type="button" className="ui-btn" disabled>Disabled Action</button>
                </div>
                <p className="ui-text-caption">
                  Disabled state enforces reduced opacity and <code>cursor: not-allowed</code>. Focus rings use <code>var(--ring)</code> with 2px offset.
                </p>
              </div>

              {/* Primary Entity Add & Proposal Actions */}
              <div className="ui-btn-row">
                <span className="ui-btn-label">Primary Entity Creation Actions (.add-button)</span>
                <div className="ui-btn-group is-14c2360">
                  <button type="button" className="ui-btn add-button">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    <span>Add Student</span>
                  </button>
                  <button type="button" className="ui-btn add-button">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    <span>Add Faculty</span>
                  </button>
                  <button type="button" className="ui-btn add-button">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    <span>Add Department</span>
                  </button>
                  <button type="button" className="ui-btn add-button">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    <span>Add Program</span>
                  </button>
                  <button type="button" className="ui-btn add-button">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    <span>Register Student</span>
                  </button>
                  <button type="button" className="ui-btn add-button">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    <span>Propose Program</span>
                  </button>
                </div>
                <p className="ui-text-caption">
                  Unified primary action across all portals: Terracotta background (<code>#D97251</code>), white text (<code>#FFFFFF</code>) in light mode, consistent SVG plus icon, and <code>height: 38px</code>.
                </p>
              </div>

              {/* Proposal & Queue Decision Pill Buttons */}
              <div className="ui-btn-row">
                <span className="ui-btn-label">Queue Decision Pill Buttons (.pill-btn.approve, .pill-btn.reject)</span>
                <div className="ui-btn-group is-14c2360">
                  <button type="button" className="pill-btn approve">Approve</button>
                  <button type="button" className="pill-btn reject">Reject</button>
                  <button type="button" className="pill-btn accept">Accept Application</button>
                  <button type="button" className="ui-btn ui-btn-secondary is-2dc5827">Browse Records</button>
                </div>
                <p className="ui-text-caption">
                  Standard queue review actions: <code>.pill-btn.approve</code> uses emerald green border and text (<code>#10B981</code>) with subtle hover tint (<code>rgba(16, 185, 129, 0.14)</code>), and <code>.pill-btn.reject</code> uses crimson border and text (<code>#EF4444</code>) with subtle hover tint (<code>rgba(239, 68, 68, 0.14)</code>).
                </p>
              </div>

              {/* Interactive Neutral Action Links with Arrow */}
              <div className="ui-btn-row is-e86cdd0">
                <span className="ui-btn-label">Interactive Action Links with Animated Arrow (.ui-link-neutral)</span>
                <div className="ui-btn-group is-0095bec">
                  <a href="#data-tables" className="ui-link-neutral is-a72553f">
                    Review <span className="arrow">&rarr;</span>
                  </a>
                  <a href="#data-tables" className="ui-link-neutral is-a72553f">
                    View All Logs <span className="arrow">&rarr;</span>
                  </a>
                  <a href="#data-tables" className="ui-link-neutral is-a72553f">
                    Write review <span className="arrow">&rarr;</span>
                  </a>
                  <a href="#data-tables" className="ui-link-neutral is-a72553f">
                    View details <span className="arrow">&rarr;</span>
                  </a>
                  <button type="button" className="empty-state-btn is-dc310e0" onClick={() => setShowEmptyState(false)}>
                    Clear all filters
                  </button>
                </div>
                <p className="ui-text-caption">
                  <code>.ui-link-neutral</code> renders high-contrast neutral text (<code>#FAF9F5</code>) that turns primary terracotta (<code>#D97251</code>) on hover, while <code>.arrow</code> smoothly glides 4px to the right. <code>.empty-state-btn</code> provides filter reset recovery.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Form Controls Section */}
          <section className="ui-section" id="form-controls">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Form Controls</h2>
              <span className="ui-section-desc">Unified input fields, select dropdowns, textareas, and labels using <code>.ui-input</code></span>
            </div>
            <div className="ui-grid ui-grid-cols-4">
              <div className="ui-form-group">
                <label className="ui-form-label" htmlFor="sample-text">Student Name</label>
                <input type="text" id="sample-text" className="ui-input" placeholder="e.g. Alex Morgan" />
              </div>
              <div className="ui-form-group">
                <label className="ui-form-label" htmlFor="sample-select">Program Department</label>
                <select id="sample-select" className="ui-input" defaultValue="cs">
                  <option value="cs">BS Computer Science</option>
                  <option value="is">BS Information Systems</option>
                  <option value="it">BS Information Technology</option>
                  <option value="ds">BS Data Science</option>
                  <option value="ai">BS Artificial Intelligence</option>
                  <option value="cy">BS Cybersecurity</option>
                </select>
              </div>
              <div className="ui-form-group">
                <label className="ui-form-label" htmlFor="sample-search">Search Records</label>
                <div className="is-e0dd7f8">
                  <svg className="is-4484244" viewBox="0 0 16 16" fill="none">
                    <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.33"/>
                    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round"/>
                  </svg>
                  <input type="search" id="sample-search" className="ui-input is-1f5bf71" placeholder="Search roster or IDs..." />
                </div>
              </div>
              <div className="ui-form-group is-e86cdd0">
                <label className="ui-form-label" htmlFor="sample-notes">Review Assessment Notes</label>
                <textarea id="sample-notes" className="ui-input is-6f0a953" placeholder="Provide detailed evaluation feedback..."></textarea>
              </div>

              {/* Table Controls Toolbar */}
              <div className="ui-btn-row is-e86cdd0">
                <span className="ui-btn-label">Standard Portal Table Controls Toolbar</span>
                <div className="is-30fe52e">
                  <div className="search-wrapper is-a489c38">
                    <svg className="search-icon is-e4bf857" viewBox="0 0 16 16" fill="none">
                      <circle cx="7" cy="7" r="4.5" stroke="#6C655D" strokeWidth="1.3"/>
                      <path d="M10.5 10.5L14 14" stroke="#6C655D" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    <input aria-label="Search by student, faculty, or proposal" className="search-input is-dd4e5c7" type="search" placeholder="Search by student, faculty, or proposal..." />
                  </div>
                  <div className="is-9f3f2d3">
                    <div className="dropdown-container department is-3a95054">
                      <select aria-label="Filter by department" className="dropdown-select is-5b5fa33" defaultValue="all">
                        <option value="all">Department: All</option>
                        <option>Department of Computer Science</option>
                        <option>Department of Information Technology</option>
                        <option>Department of Applied Mathematics</option>
                      </select>
                      <svg className="dropdown-chevron is-c6cac50" viewBox="0 0 14 14" fill="none">
                        <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#6C655D" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="dropdown-container status is-acf1180">
                      <select aria-label="Filter by status" className="dropdown-select is-5b5fa33" defaultValue="all">
                        <option value="all">Status: All</option>
                        <option>Active</option>
                        <option>Under Review</option>
                        <option>Archived</option>
                      </select>
                      <svg className="dropdown-chevron is-c6cac50" viewBox="0 0 14 14" fill="none">
                        <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#6C655D" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <button type="button" className="ui-btn add-button" onClick={() => setAdminModalOpen(true)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      <span>Add Record</span>
                    </button>
                  </div>
                </div>
                <p className="ui-text-caption">
                  Unified control bar used across all portal tables. Dropdown filters feature customized chevrons, standardized 12px radius, and dedicated widths (e.g. 195px for department to prevent text truncation).
                </p>
              </div>
            </div>
          </section>

          {/* 6. Cards Section */}
          <section className="ui-section" id="cards">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Cards</h2>
              <span className="ui-section-desc">Container primitives: standard card, compact KPI metric card, and interactive link card</span>
            </div>
            <div className="ui-demo-loading-toolbar">
              <span id="demo-card-loading-status" className="ui-text-muted" role="status" aria-live="polite" aria-atomic="true">
                {cardLoadingStatus}
              </span>
              <button
                type="button"
                id="demo-simulate-card-loading-btn"
                className="ui-btn ui-btn-outline ui-demo-simulate-button"
                aria-controls="demo-card-loading-grid"
                onClick={handleSimulateCardLoading}
                disabled={isCardLoading}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span id="demo-card-loading-label">{cardLoadingLabel}</span>
              </button>
            </div>

            <div className="ui-grid ui-grid-cols-3" id="demo-card-loading-grid">
              {/* 1. Standard Card */}
              <div className={`ui-card ${isCardLoading ? 'ui-card--loading' : ''}`} aria-busy={isCardLoading}>
                <div className="ui-card-header">
                  <h3 className="ui-card-title">Standard Card</h3>
                  <p className="ui-card-description">Default <code>.ui-card</code> container for details and panels.</p>
                </div>
                <div className="ui-card-content">
                  <p className="ui-text">
                    This card serves as the standard container for panels, detail views, and forms.
                    It uses <code>var(--card)</code> surface with a subtle <code>var(--border)</code> outline and <code>var(--radius-lg)</code> corners.
                  </p>
                </div>
                <div className="ui-card-footer">
                  <span className="ui-text-muted">Updated 10m ago</span>
                </div>
                <div className="ui-loading-placeholder" aria-hidden="true">
                  <span className="ui-skeleton ui-skeleton--title"></span>
                  <span className="ui-skeleton ui-skeleton--short"></span>
                  <div className="ui-loading-lines">
                    <span className="ui-skeleton"></span>
                    <span className="ui-skeleton"></span>
                    <span className="ui-skeleton ui-skeleton--short"></span>
                  </div>
                  <span className="ui-skeleton ui-skeleton--short"></span>
                </div>
              </div>

              {/* 2. Compact KPI Card */}
              <div className={`ui-card ui-card-sm metric-card ${isCardLoading ? 'ui-card--loading' : ''}`} aria-busy={isCardLoading}>
                <div className="ui-card-header is-ac79cce">
                  <p className="metric-card-label">KPI Metric Card (.ui-card-sm)</p>
                </div>
                <div className="metric-card-row">
                  <strong className="metric-card-value">2,850</strong>
                  <span className="metric-card-trend">&#8599; +12.5%</span>
                </div>
                <p className="metric-card-status">AY 2026-2027</p>
                <p className="ui-card-description">Compact metric summary for dashboard statistics.</p>
                <div className="ui-loading-placeholder" aria-hidden="true">
                  <span className="ui-skeleton ui-skeleton--title"></span>
                  <div className="ui-loading-row">
                    <span className="ui-skeleton ui-skeleton--metric"></span>
                    <span className="ui-skeleton ui-skeleton--badge"></span>
                  </div>
                  <span className="ui-skeleton ui-skeleton--short"></span>
                  <span className="ui-skeleton"></span>
                </div>
              </div>

              {/* 3. Interactive Link Card */}
              <a href="#interactive-target" className={`ui-card ui-card-interactive is-90dcd8f ${isCardLoading ? 'ui-card--loading' : ''}`} aria-busy={isCardLoading}>
                <div className="ui-card-header">
                  <div className="is-3083282">
                    <h3 className="ui-card-title">Interactive Card Link</h3>
                    <span className="metric-card-trend is-378957a">Link <span className="arrow">&rarr;</span></span>
                  </div>
                  <p className="ui-card-description is-68a09f7"><code>.ui-card-interactive</code> directly on an anchor element.</p>
                </div>
                <div className="ui-card-content">
                  <p className="ui-text">
                    Hover over this card to view the smooth interactive transition effect.
                    Supports keyboard focus indicators and terracotta primary border highlighting.
                  </p>
                </div>
                <div className="ui-card-footer">
                  <span className="ui-text-muted is-009cc8c">Explore workspace <span className="arrow">&rarr;</span></span>
                </div>
                <div className="ui-loading-placeholder" aria-hidden="true">
                  <div className="ui-loading-row">
                    <span className="ui-skeleton ui-skeleton--title"></span>
                    <span className="ui-skeleton ui-skeleton--badge"></span>
                  </div>
                  <span className="ui-skeleton ui-skeleton--short"></span>
                  <div className="ui-loading-lines">
                    <span className="ui-skeleton"></span>
                    <span className="ui-skeleton"></span>
                    <span className="ui-skeleton ui-skeleton--short"></span>
                  </div>
                  <span className="ui-skeleton ui-skeleton--short"></span>
                </div>
              </a>
            </div>
          </section>

          {/* 7. Data Tables & Pagination Section */}
          <section className="ui-section" id="data-tables">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Data Tables &amp; Loading Shimmers</h2>
              <span className="ui-section-desc">Responsive table wrappers with subtle row hovers, status pills, and pagination bars</span>
            </div>
            <div className="is-bd0475c">
              <span className="is-02ab777">Table features interactive loading shimmers, live row checkboxes, pagination slicing, and empty-state recovery.</span>
              <button
                type="button"
                id="demo-simulate-skeleton-btn"
                className="ui-btn ui-btn-outline ui-demo-simulate-button"
                onClick={handleSimulateTableSkeleton}
                disabled={isTableSkeleton}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                Simulate Skeleton Loading (280ms)
              </button>
            </div>

            {!showEmptyState && (
              <>
                <div className="ui-table-wrap">
                  <table className="ui-table">
                    <thead>
                      <tr>
                        <th className="checkbox-cell is-479236c">
                          <input
                            type="checkbox"
                            ref={selectAllCheckboxRef}
                            className="custom-checkbox select-all-checkbox"
                            aria-label="Select all rows"
                            onChange={handleSelectAllToggle}
                          />
                        </th>
                        <th>Student</th>
                        <th className="col-id">Student ID</th>
                        <th>Program</th>
                        <th>Year Level</th>
                        <th className="ui-table-heading-center">Status</th>
                        <th className="col-action ui-table-heading-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isTableSkeleton ? (
                        <>
                          <tr className="skeleton-row"><td colSpan={7}><div className="skeleton"></div></td></tr>
                          <tr className="skeleton-row"><td colSpan={7}><div className="skeleton"></div></td></tr>
                          <tr className="skeleton-row"><td colSpan={7}><div className="skeleton"></div></td></tr>
                          <tr className="skeleton-row"><td colSpan={7}><div className="skeleton"></div></td></tr>
                        </>
                      ) : (
                        visibleStudents.map((student) => {
                          const isChecked = selectedRowIds.includes(student.id);
                          return (
                            <tr
                              key={student.id}
                              className={isChecked ? 'checked' : ''}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleRowCheckboxToggle(student.id)}
                            >
                              <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  className="custom-checkbox row-checkbox"
                                  checked={isChecked}
                                  aria-label={`Select ${student.name}`}
                                  onChange={() => handleRowCheckboxToggle(student.id)}
                                />
                              </td>
                              <td>
                                <div>
                                  <strong className="is-d3c8577">{student.name}</strong>
                                  <span className="is-06185fd">{student.email}</span>
                                </div>
                              </td>
                              <td className="col-id"><code className="ui-text-mono">{student.id}</code></td>
                              <td>{student.program}</td>
                              <td>{student.yearLevel}</td>
                              <td>
                                <span className={`ui-badge ui-badge--${student.statusVariant}`}>
                                  {student.statusVariant === 'success' && (
                                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  )}
                                  {student.statusVariant === 'warning' && (
                                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                  )}
                                  {student.statusVariant === 'info' && (
                                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                  )}
                                  {student.statusText}
                                </span>
                              </td>
                              <td className="col-action" onClick={(e) => e.stopPropagation()}>
                                {student.actionType === 'view-button' && (
                                  <button type="button" className="ui-btn ui-btn-outline is-d8d7a34">View</button>
                                )}
                                {student.actionType === 'review-link' && (
                                  <a href="#data-tables" className="ui-link-neutral is-a72553f">Review <span className="arrow">&rarr;</span></a>
                                )}
                                {student.actionType === 'write-review-link' && (
                                  <a href="#data-tables" className="ui-link-neutral is-a72553f">Write review <span className="arrow">&rarr;</span></a>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  <p className="ui-text-muted is-c67418c">
                    <strong>Column ratio helpers:</strong> <code>.col-id</code> (tight, nowrap), <code>.col-action</code> (tight, centered, nowrap; links/buttons never wrap), <code>.ui-table-heading-center</code> (centered Action and Status titles and values), <code>.col-60</code> / <code>.col-20</code> for Name/Status/Action tables (60/20/20), <code>.col-flex</code> for columns sharing remaining width equally (Student Name, Program). First and last columns hug the table edges. The rightmost column is right-aligned unless it is an Action or Status column.
                  </p>
                </div>

                {/* Table Pagination Footer */}
                <div className="ui-table-pagination is-0272b5f">
                  <span className="is-7fbae58">{selectedRowIds.length} of {totalStudents} row(s) selected.</span>
                  
                  <div className="is-31de0eb">
                    <div className="is-b57eafe">
                      <span>Rows per page</span>
                      <div className="is-e0dd7f8">
                        <select
                          aria-label="Rows per page"
                          className="ui-select-pill is-daab64f"
                          value={tableRowsPerPage}
                          onChange={(e) => {
                            setTableRowsPerPage(Number(e.target.value));
                            setTableCurrentPage(1);
                          }}
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                        </select>
                        <svg className="is-4b97db6" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                      <span className="is-12b4142">Page {tableCurrentPage} of {totalPages} &middot; {totalStudents} entries</span>
                    
                      <div className="ui-table-pagination-nav is-49e15c7">
                        <button
                          type="button"
                          className="ui-btn ui-btn-outline is-b38e363"
                          disabled={tableCurrentPage <= 1}
                          onClick={() => setTableCurrentPage(prev => Math.max(1, prev - 1))}
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          className="ui-btn ui-btn-outline is-b38e363"
                          disabled={tableCurrentPage >= totalPages}
                          onClick={() => setTableCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Empty State Demo Container */}
            {showEmptyState && (
              <div id="demo-empty-state" className="empty-state is-443abc4">
                <svg className="is-3be30c2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <p className="is-373be8a">No records matching your search or filters found.</p>
                <p className="is-ca6ebbd">Try adjusting your query or resetting the active filters.</p>
                <button
                  type="button"
                  className="empty-state-btn"
                  id="demo-empty-state-btn"
                  onClick={() => setShowEmptyState(false)}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>

          {/* 8. Portal Sidebar Navigation Section */}
          <section className="ui-section" id="portal-sidebars">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Portal Sidebar Navigation</h2>
              <span className="ui-section-desc">Docked 260px navigation sidebar with active state highlights, user account card, and zero-blink view transitions</span>
            </div>

            <div className="ui-grid ui-grid-cols-2 is-ffdb8e7">
              {/* Standard Portal Sidebar Showcase */}
              <div className="ui-card is-317a4c4">
                <div className="is-761640e">
                  Standard Portal Sidebar Navigation
                </div>
                <div className="demo-sidebar-showcase" id="demo-sidebar-container">
                  <div className="brand-header"><h1 className="brand-title">Academic Portal</h1></div>
                  <nav className="nav" id="demo-sidebar-nav" aria-label="Demo sidebar navigation">
                    <a
                      href="#portal-sidebars"
                      data-nav-key="dashboard"
                      className={activeNavKey === 'dashboard' ? 'nav-btn-active' : 'nav-btn-inactive'}
                      aria-current={activeNavKey === 'dashboard' ? 'page' : undefined}
                      onClick={(e) => { e.preventDefault(); setActiveNavKey('dashboard'); }}
                    >
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5"/><rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5"/><rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5"/><rect x="11" y="11" width="6.5" height="6.5" rx="1.5"/></svg>
                      <span>Dashboard</span>
                    </a>
                    <a
                      href="#portal-sidebars"
                      data-nav-key="faculty-apps"
                      className={activeNavKey === 'faculty-apps' ? 'nav-btn-active' : 'nav-btn-inactive'}
                      aria-current={activeNavKey === 'faculty-apps' ? 'page' : undefined}
                      onClick={(e) => { e.preventDefault(); setActiveNavKey('faculty-apps'); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14h6M9 18h6M9 10h.01"/></svg>
                      <span>Faculty Applications</span>
                    </a>
                    <a
                      href="#portal-sidebars"
                      data-nav-key="student-apps"
                      className={activeNavKey === 'student-apps' ? 'nav-btn-active' : 'nav-btn-inactive'}
                      aria-current={activeNavKey === 'student-apps' ? 'page' : undefined}
                      onClick={(e) => { e.preventDefault(); setActiveNavKey('student-apps'); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24A2 2 0 0 0 5.45 5.11Z"/></svg>
                      <span>Student Applications</span>
                    </a>
                    <a
                      href="#portal-sidebars"
                      data-nav-key="program-apps"
                      className={activeNavKey === 'program-apps' ? 'nav-btn-active' : 'nav-btn-inactive'}
                      aria-current={activeNavKey === 'program-apps' ? 'page' : undefined}
                      onClick={(e) => { e.preventDefault(); setActiveNavKey('program-apps'); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 10 5-10 5L2 7l10-5ZM2 12l10 5 10-5M2 17l10 5 10-5"/></svg>
                      <span>Program Applications</span>
                    </a>
                    <a
                      href="#portal-sidebars"
                      data-nav-key="dept-apps"
                      className={activeNavKey === 'dept-apps' ? 'nav-btn-active' : 'nav-btn-inactive'}
                      aria-current={activeNavKey === 'dept-apps' ? 'page' : undefined}
                      onClick={(e) => { e.preventDefault(); setActiveNavKey('dept-apps'); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      <span>Dept. Applications</span>
                    </a>
                    <a
                      href="#portal-sidebars"
                      data-nav-key="students"
                      className={activeNavKey === 'students' ? 'nav-btn-active' : 'nav-btn-inactive'}
                      aria-current={activeNavKey === 'students' ? 'page' : undefined}
                      onClick={(e) => { e.preventDefault(); setActiveNavKey('students'); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      <span>Students</span>
                    </a>
                    <a
                      href="#portal-sidebars"
                      data-nav-key="audit"
                      className={activeNavKey === 'audit' ? 'nav-btn-active' : 'nav-btn-inactive'}
                      aria-current={activeNavKey === 'audit' ? 'page' : undefined}
                      onClick={(e) => { e.preventDefault(); setActiveNavKey('audit'); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>Audit Log</span>
                    </a>
                  </nav>
                  <div className="sidebar-footer">
                    <div className="sidebar-divider"></div>
                    <div className="sidebar-account-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="sidebar-avatar">U</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="sidebar-account-name">Portal User</span>
                          <span className="sidebar-account-role">Academic Staff</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="sidebar-logout-btn"
                        aria-label="Log out"
                        title="Log out"
                        onClick={() => setLogoutDialogOpen(true)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Persistent View Transition Architecture */}
              <div className="ui-card is-03e275d">
                <h3 className="ui-card-title is-64e8bf9">Persistent View Transitions Architecture</h3>
                <p className="ui-text is-5c3d21d">
                  All portal workspaces enforce persistent sidebar positioning and instant, blink-free navigation across pages via the View Transitions API and hover prefetching:
                </p>
                <ul className="is-ab3271d">
                  <li><strong>Hardcoded Static DOM:</strong> The complete <code>&lt;aside id="sidebar-menu" className="sidebar sidebar-frame"&gt;</code> is pre-rendered in all portal HTML templates, preventing post-load layout shifts.</li>
                  <li><strong>View Transition Tag:</strong> <code>view-transition-name: portal-sidebar;</code> instructs Chromium browsers to anchor the sidebar in place during cross-page crossfades.</li>
                  <li><strong>Hover Prefetch:</strong> Navigation scripts listen for <code>mouseenter</code> on links and inject <code>&lt;link rel="prefetch"&gt;</code> for instantaneous page responses.</li>
                  <li><strong>Semantic Active State:</strong> The current page is marked with <code>.nav-btn-active</code> and <code>aria-current="page"</code>, featuring primary terracotta background (<code>#D97251</code>) and bold black text (<code>#000000</code>).</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 9. Portal Modals & Confirmation Dialogs Section */}
          <section className="ui-section" id="portal-modals">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Portal Modals &amp; Confirmation Dialogs</h2>
              <span className="ui-section-desc">Accessible, backdrop-blurred modal dialogs for proposal rejections, entity edits, and destructive confirmations</span>
            </div>

            <div className="ui-grid ui-grid-cols-2 is-ffdb8e7">
              {/* 1. All Modal Trigger Buttons Consolidated Card */}
              <div className="ui-card is-03e275d">
                <div className="is-948e6d6" style={{ marginBottom: '14px' }}>
                  <span className="ui-btn-label" style={{ fontSize: '15px', fontWeight: 700, color: '#FAF9F5' }}>Modal Trigger Buttons</span>
                  <span className="ui-text-caption" style={{ display: 'block', marginTop: '2px' }}>Consolidated launchpad gathering all buttons that trigger modal overlays across Admin, Faculty, and Approval Queue workflows.</span>
                </div>

                {/* Group A: Admin Portal Modal Triggers */}
                <div className="ui-btn-row" style={{ marginBottom: '14px' }}>
                  <span className="ui-btn-label" style={{ fontSize: '11px', fontWeight: 700, color: '#A0988E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>Admin Portal Modals</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      type="button"
                      id="demo-open-admin-modal-btn"
                      className="ui-btn add-button is-ebaa71c"
                      onClick={() => setAdminModalOpen(true)}
                    >
                      Open Admin Modal
                    </button>
                    <button
                      type="button"
                      id="demo-open-remove-modal-btn"
                      className="ui-btn ui-btn-outline is-ebaa71c"
                      onClick={() => setRemoveModalOpen(true)}
                    >
                      Open Remove Modal
                    </button>
                  </div>
                  <p className="ui-text-caption" style={{ marginTop: '6px' }}>
                    Triggers the entity creation modal (<code>.modal-card</code>) or destructive removal confirmation modal (<code>.modal-card.compact.remove-modal</code>).
                  </p>
                </div>

                {/* Group B: Faculty Portal Modal Triggers */}
                <div className="ui-btn-row" style={{ marginBottom: '14px' }}>
                  <span className="ui-btn-label" style={{ fontSize: '11px', fontWeight: 700, color: '#A0988E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>Faculty Portal Modals</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      type="button"
                      id="demo-open-faculty-modal-btn"
                      className="ui-btn add-button is-ebaa71c"
                      onClick={() => setFacultyModalOpen(true)}
                    >
                      Open Faculty Modal
                    </button>
                  </div>
                  <p className="ui-text-caption" style={{ marginTop: '6px' }}>
                    Triggers the native HTML5 dialog modal (<code>&lt;dialog className="proposal-modal"&gt;</code>) for department or curriculum proposals.
                  </p>
                </div>

                {/* Group C: Approval Queue Modal Triggers (URL Route-Backed) */}
                <div className="ui-btn-row" style={{ marginBottom: '14px' }}>
                  <span className="ui-btn-label" style={{ fontSize: '11px', fontWeight: 700, color: '#A0988E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>Approval Queue Modals (URL Route-Backed)</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button type="button" className="ui-btn add-button is-ebaa71c" onClick={() => openQueue('department')}>Department Queue</button>
                    <button type="button" className="ui-btn ui-btn-outline is-ebaa71c" onClick={() => openQueue('program')}>Program Queue</button>
                    <button type="button" className="ui-btn ui-btn-outline is-ebaa71c" onClick={() => openQueue('student')}>Student Queue</button>
                    <button type="button" className="ui-btn ui-btn-outline is-ebaa71c" onClick={() => openQueue('faculty')}>Faculty Queue</button>
                  </div>
                  <p className="ui-text-caption" style={{ marginTop: '6px' }}>
                    Opens <code>&lt;QueueModal /&gt;</code> synchronized with <code>?queue=department|program|student|faculty</code> for URL parameter routing and browser history.
                  </p>
                </div>

                {/* Group D: Session & Security Dialog Triggers */}
                <div className="ui-btn-row">
                  <span className="ui-btn-label" style={{ fontSize: '11px', fontWeight: 700, color: '#A0988E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>Session &amp; Security Dialogs</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      type="button"
                      id="demo-open-logout-btn"
                      className="ui-btn ui-btn-outline is-ebaa71c"
                      data-open-logout-demo
                      onClick={() => setLogoutDialogOpen(true)}
                    >
                      Open Logout Dialog
                    </button>
                  </div>
                  <p className="ui-text-caption" style={{ marginTop: '6px' }}>
                    Triggers the session termination confirmation dialog (<code>&lt;dialog className="logout-dialog"&gt;</code>) before signing out.
                  </p>
                </div>
              </div>

              {/* 2. Standard Portal Modal Architecture Preview & Contract */}
              <div className="ui-card is-03e275d">
                <div className="is-948e6d6" style={{ marginBottom: '14px' }}>
                  <span className="ui-btn-label" style={{ fontSize: '15px', fontWeight: 700, color: '#FAF9F5' }}>Standard Portal Modal Architecture</span>
                  <span className="ui-text-caption" style={{ display: 'block', marginTop: '2px' }}>Shared architecture across Admin Portal (<code>.modal-card</code>) and Faculty Portal (<code>&lt;dialog&gt;</code>).</span>
                </div>

                {/* Dimensions Token Table */}
                <div className="ui-table-wrap" style={{ border: '1px solid #383734', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#21201E', borderBottom: '1px solid #383734', color: '#A0988E' }}>
                        <th style={{ padding: '6px 10px' }}>Role</th>
                        <th style={{ padding: '6px 10px' }}>Height</th>
                        <th style={{ padding: '6px 10px' }}>Padding / Radius</th>
                        <th style={{ padding: '6px 10px' }}>Typography</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: '#FAF9F5' }}>
                      <tr style={{ borderBottom: '1px solid #383734' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>Cancel / Secondary</td>
                        <td style={{ padding: '6px 10px' }}><code>36px</code></td>
                        <td style={{ padding: '6px 10px' }}><code>0 16px</code> &middot; <code>8px</code></td>
                        <td style={{ padding: '6px 10px' }}>13px (600)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #383734' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>Submit / Confirm</td>
                        <td style={{ padding: '6px 10px' }}><code>36px</code></td>
                        <td style={{ padding: '6px 10px' }}><code>0 16px</code> &middot; <code>8px</code></td>
                        <td style={{ padding: '6px 10px' }}>13px (700)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #383734' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>Queue Bulk Pill</td>
                        <td style={{ padding: '6px 10px' }}><code>32px</code></td>
                        <td style={{ padding: '6px 10px' }}><code>0 20px</code> &middot; <code>9999px</code></td>
                        <td style={{ padding: '6px 10px' }}>13px (600)</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>Squircle Close</td>
                        <td style={{ padding: '6px 10px' }}><code>32&times;32px</code></td>
                        <td style={{ padding: '6px 10px' }}><code>0</code> &middot; <code>8px</code></td>
                        <td style={{ padding: '6px 10px' }}>18px Icon</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Behavioral & Accessibility Rules */}
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FAF9F5', margin: '0 0 8px' }}>Modal Accessibility &amp; Sizing Contract:</h4>
                <ul className="is-1afd29d" style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#A0988E' }}>
                  <li><strong>Strict 36px Action Button Height:</strong> Both primary and outline buttons enforce <code>height: 36px !important</code> with <code>width: auto !important</code> and <code>padding: 0 16px</code>.</li>
                  <li><strong>No Redundant Close 'X' Button:</strong> When a modal provides an explicit <strong>Cancel</strong> outline button in <code>.modal-actions</code>, the top-right 'X' button is omitted/hidden (<code>display: none</code>) to eliminate clutter.</li>
                  <li><strong>Escape &amp; Backdrop Dismissal:</strong> Pressing <kbd className="is-48badad">Esc</kbd> or clicking the dimmed backdrop immediately dismisses the modal.</li>
                  <li><strong>Zero Nested Modals Directive:</strong> No modal may open on top of another modal. In approval queues, rejections expand inline directly inside the queue table row.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 10. Chats & AI Assistant Section */}
          <section className="ui-section" id="chats">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Chats &amp; AI Assistant</h2>
              <span className="ui-section-desc">Prompt chips, message bubbles, query textarea, and student quick-file context card</span>
            </div>

            {/* Regular Topic Cards */}
            <div className="ui-chat-prompts is-d3297f9">
              <div
                className="ui-chat-prompt-card"
                role="button"
                tabIndex={0}
                onClick={() => handleSendPrompt('Which students have research experience?')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSendPrompt('Which students have research experience?'); }}
              >
                <span>Research experience</span>
                <small>Explore faculty assessments</small>
              </div>
              <div
                className="ui-chat-prompt-card"
                role="button"
                tabIndex={0}
                onClick={() => handleSendPrompt('Which students show teamwork and leadership?')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSendPrompt('Which students show teamwork and leadership?'); }}
              >
                <span>Teamwork &amp; Leadership</span>
                <small>Ask across student records</small>
              </div>
              <div
                className="ui-chat-prompt-card"
                role="button"
                tabIndex={0}
                onClick={() => handleSendPrompt('Find reviews mentioning communication skills.')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSendPrompt('Find reviews mentioning communication skills.'); }}
              >
                <span>Communication Skills</span>
                <small>Find relevant review excerpts</small>
              </div>
              <div
                className="ui-chat-prompt-card"
                role="button"
                tabIndex={0}
                onClick={() => handleSendPrompt('Verify capstone project reviews and prerequisites.')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSendPrompt('Verify capstone project reviews and prerequisites.'); }}
              >
                <span>Capstone Project Review</span>
                <small>Verify graduation prerequisites</small>
              </div>
            </div>

            {/* Two-Column Chat Workspace */}
            <div className="ui-chat-columns">
              {/* Left: Chat Thread Card */}
              <div className="ui-card is-dca1b55">
                <div className="ui-card-header is-2f82c02">
                  <h3 className="ui-card-title">Ask across student reviews</h3>
                  <p className="ui-card-description">Conversational AI query assistant for student evaluations.</p>
                </div>
                <div className="ui-chat-container is-66768fc">
                  <div id="chat-log" ref={chatLogRef} className="ui-chat-log custom-scrollbar is-3fbfa29">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`ui-chat-msg ui-chat-msg--${msg.type}`}>
                        {msg.type === 'ai' && (
                          <div className="ui-chat-avatar ui-chat-avatar--text">SP</div>
                        )}
                        <div className="ui-chat-msg-content">
                          <div className="ui-chat-msg-header">
                            <span className="ui-chat-msg-sender">{msg.sender}</span>
                            <span className="ui-chat-msg-time">{msg.time}</span>
                          </div>
                          {msg.isHtml ? (
                            <div
                              className={`ui-chat-bubble ui-chat-bubble--${msg.type}`}
                              dangerouslySetInnerHTML={{ __html: msg.text }}
                            />
                          ) : (
                            <div className={`ui-chat-bubble ui-chat-bubble--${msg.type}`}>
                              {msg.text}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input Area */}
                  <div className="ui-chat-input-wrapper is-1d1c012">
                    <form className="is-f64a5e3" id="chat-form" onSubmit={handleChatSubmit}>
                      <textarea
                        ref={chatTextareaRef}
                        aria-label="Message to AI Chat Assistant"
                        className="ui-chat-textarea"
                        id="chat-prompt"
                        required
                        placeholder="Type a question across student reviews..."
                        rows={2}
                        value={chatInput}
                        onChange={(e) => {
                          setChatInput(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSubmit();
                          }
                        }}
                      />
                      <div className="is-895ac41">
                        <span className="ui-chat-input-hint">Press Enter to send, Shift+Enter for new line</span>
                        <button type="submit" className="ui-btn" id="send" aria-label="Send">
                          Send query
                          <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Right: Student Quick File Context Card */}
              <div className="ui-chat-context-card">
                <div className="ui-chat-context-avatar">SP</div>
                <h3 className="ui-heading-3 is-e2b74ba">Sam Lee Parker</h3>
                <p className="ui-text-muted is-08dff76">ID: 24-1-00001</p>

                <div className="ui-chat-context-meta">
                  <span className="ui-chat-context-dt">Program</span>
                  <span className="ui-chat-context-dd">BS Computer Science</span>
                  <span className="ui-chat-context-dt">Year Level</span>
                  <span className="ui-chat-context-dd">3rd Year</span>
                  <span className="ui-chat-context-dt">Status</span>
                  <span className="ui-chat-context-dd"><span className="ui-badge ui-badge--success">Good Standing</span></span>
                  <span className="ui-chat-context-dt">Tags</span>
                  <span className="ui-chat-context-dd">
                    <span className="ui-badge ui-badge--purple">Research</span>
                    <span className="ui-badge ui-badge--cyan">Algorithms</span>
                  </span>
                </div>

                <p className="ui-text-caption is-33424b5">
                  Referenced record. Review conversations can synthesize evaluations across all enrolled students.
                </p>

                <button type="button" className="ui-btn ui-btn-outline view-profile-btn is-199b6f0">
                  View Full Profile <span className="arrow">&rarr;</span>
                </button>
              </div>
            </div>
          </section>

          {/* 11. Authentication & Sign Up Section */}
          <section className="ui-section" id="auth-cards">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Authentication &amp; Account Cards</h2>
              <span className="ui-section-desc">Unified Box, Color, and Text contract for Sign In and Sign Up portals</span>
            </div>
            <div className="auth-demo-container">
              <div className="auth-shell">
                <div className="auth-split">
                  {/* LEFT: brand card with the SPMIS logo */}
                  <aside className="brand-card">
                    <a href="#" className="brand-logo" aria-label="SPMIS">
                      <img className="logo-dark-only" src={spmisLogo} alt="SPMIS" />
                      <img className="logo-light-only" src={spmisLogo} alt="SPMIS" />
                    </a>

                    <div className="brand-hero">
                      <h1 className="brand-hero-title">
                        Track every<br />
                        <span className="accent">student journey.</span>
                      </h1>
                      <p className="brand-hero-sub">
                        From enrollment to graduation &mdash; review, approve, and manage academic records in one calm, focused workspace.
                      </p>

                      <ul className="brand-features">
                        <li><span className="dot">✓</span> Centralized student profiles</li>
                        <li><span className="dot">✓</span> Faculty review &amp; approvals</li>
                        <li><span className="dot">✓</span> Real-time progress tracking</li>
                      </ul>
                    </div>

                    <div className="brand-footer">
                      <span>© 2026 SPMIS Project</span>
                      <span>v1.0</span>
                    </div>
                  </aside>

                  {/* RIGHT: auth card with terracotta top/bottom accents */}
                  <section className="auth-card">
                    <div className="auth-card-body">
                      <h2 className="auth-card-title">Sign In</h2>
                      <p className="auth-card-sub">Welcome back. Enter your credentials to continue.</p>

                      <div className="ui-auth-wrapper">
                        <div className="ui-auth-card">
                          <button
                            type="button"
                            className="auth-social-btn"
                            onClick={() => showToast('Google Authentication connected.')}
                          >
                            <svg viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Continue with Google</span>
                          </button>

                          <div className="ui-auth-divider">
                            <span>or continue with email</span>
                          </div>

                          <form className="ui-auth-form" id="signin-form" noValidate onSubmit={handleAuthSubmit}>
                            <div className="ui-auth-field" data-field="email">
                              <label className="ui-auth-field-label" htmlFor="auth-email">Academic Email</label>
                              <div className="ui-input-wrap">
                                <input
                                  type="email"
                                  id="auth-email"
                                  className="ui-input"
                                  placeholder="faculty@vsu.edu.ph"
                                  value={authEmail}
                                  onChange={(e) => {
                                    setAuthEmail(e.target.value);
                                    if (e.target.value) setEmailError(false);
                                  }}
                                  required
                                />
                                {emailError && (
                                  <div className="ui-field-popup" role="alert" aria-live="polite">
                                    <span className="ui-field-popup-icon" aria-hidden="true">!</span>
                                    <span className="ui-field-popup-text">Please fill in this field.</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="ui-auth-field" data-field="password">
                              <div className="is-948e6d6">
                                <label className="ui-auth-field-label" htmlFor="auth-pwd">Password</label>
                                <a className="is-7bcf3f8" href="#forgot">Forgot password?</a>
                              </div>
                              <div className="ui-input-wrap">
                                <input
                                  type="password"
                                  id="auth-pwd"
                                  className="ui-input"
                                  placeholder="••••••••••••"
                                  value={authPassword}
                                  onChange={(e) => {
                                    setAuthPassword(e.target.value);
                                    if (e.target.value) setPasswordError(false);
                                  }}
                                  required
                                />
                                {passwordError && (
                                  <div className="ui-field-popup" role="alert" aria-live="polite">
                                    <span className="ui-field-popup-icon" aria-hidden="true">!</span>
                                    <span className="ui-field-popup-text">Please fill in this field.</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <label className="ui-checkbox-label keep-signed-in" htmlFor="auth-keep-signed-in">
                              <input
                                type="checkbox"
                                id="auth-keep-signed-in"
                                className="custom-checkbox"
                                checked={authKeepSignedIn}
                                onChange={(e) => setAuthKeepSignedIn(e.target.checked)}
                              />
                              <span className="keep-signed-in-text">Keep me signed in on this device</span>
                            </label>

                            <button type="submit" className="ui-auth-btn-submit">
                              Sign In to Account
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>

                    {/* Sign-up prompt INSIDE the card, centered at the bottom */}
                    <div className="auth-card-signup">
                      <a href="#register">
                        New here? Sign Up <span className="arrow">&rarr;</span>
                      </a>
                    </div>
                  </section>
                </div>

                {/* Footer OUTSIDE the card */}
                <div className="auth-footer-outside">
                  <span className="legal">
                    <a href="#about">Contact</a>
                    <span className="sep">&middot;</span>
                    <a href="#terms">Terms</a>
                    <span className="sep">&middot;</span>
                    <a href="#privacy">Privacy</a>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 12. Workspace Frame: Header, Status, Toasts & Pinned Footer */}
          <section className="ui-section" id="workspace-frame">
            <div className="ui-section-header">
              <h2 className="ui-section-title">Workspace Frame (Header, Status, Toasts &amp; Footer)</h2>
              <span className="ui-section-desc">Unified viewport frame primitives: persistent status header bar, notification toasts, and docked footer</span>
            </div>

            <div className="ui-grid ui-grid-cols-2 is-ffdb8e7">
              {/* Portal Top Header Bar Preview */}
              <div className="ui-card is-03e275d">
                <span className="ui-btn-label">Portal Status Header Bar</span>
                <div className="ui-workspace-surface is-24ba48f">
                  <div className="admin-top-header is-911172d">
                    <div className="is-b512c98">
                      <div className="red-dot is-86dee63"></div>
                      <span className="breadcrumb-text">Workspace / Overview</span>
                    </div>
                    <div className="is-1c20bbe">
                      <span className="status-badge">
                        <span className="green-dot is-6888aeb"></span>
                        System Live
                      </span>
                      <span className="ay-text">AY 2026-2027</span>
                    </div>
                  </div>
                  <div className="is-469b292">
                    &darr; Page content and tables sit below this header bar
                  </div>
                </div>
                <p className="ui-text-caption">
                  Pinned at the top of portal viewports. The terracotta dot anchors the workspace context while the pulsing green indicator verifies real-time operational status.
                </p>
              </div>

              {/* Toast Notifications Demo */}
              <div className="ui-card is-03e275d">
                <span className="ui-btn-label">Toast Notification Primitive (.ui-toast)</span>
                <div className="is-1dac0b9">
                  <button
                    type="button"
                    id="demo-show-toast-btn"
                    className="ui-btn add-button is-b5fea39"
                    onClick={() => showToast('Operation executed successfully! Record updated.')}
                  >
                    Trigger Success Toast
                  </button>
                </div>
                
                <div className="is-c3a5059">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span className="is-1e42189">Application Action Completed Successfully</span>
                </div>

                <p className="ui-text-caption">
                  Fixed toast positioned at the bottom right with <code>backdrop-filter: blur(8px)</code>, automatic 3-second timeout, and screen reader announcements via <code>aria-live="polite"</code>.
                </p>
              </div>

              {/* Pinned Viewport Workspace Footer */}
              <div className="ui-card is-a6b38e2">
                <span className="ui-btn-label">Pinned Viewport Workspace Footer (.workspace-footer)</span>
                <div className="ui-workspace-surface ui-workspace-footer-preview is-abb9727">
                  <div className="is-0eeaf53">&uarr; Scrollable workspace content sits above this footer</div>
                  <footer className="workspace-footer is-e8a73a1">
                    <span>&copy; 2026 Academic Management System. All rights reserved.</span>
                    <span>System Version 0.1.0 &middot; AY 2026-2027</span>
                  </footer>
                </div>
                <p className="ui-text-caption">
                  Integrated into the bottom of the workspace canvas via <code>flex: none</code> inside the vertical flex column, ensuring clean alignment across desktop and responsive displays.
                </p>
              </div>
            </div>
          </section>

          {/* Style Guide Footer */}
          <footer className="ui-footer">
            <span>&copy; 2026 SPMIS Project · Claude+ Living Style Guide</span>
            <span>Living Reference in <code>mockup/pages/design-system.html</code> · Architecture in <code>docs/DESIGN_SYSTEM.md</code></span>
          </footer>
        </div>

      {/* ========================================================= */}
      {/* Interactive Demo Modals, Dialogs & Toast                  */}
      {/* ========================================================= */}

      {/* 1. Live Admin Entity Modal */}
      <div
        className={`modal-overlay ${adminModalOpen ? 'active' : ''}`}
        id="demoAdminModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) setAdminModalOpen(false);
        }}
      >
        <section className="modal-card">
          <div className="modal-header">
            <div className="modal-header-content">
              <h2 className="modal-title" id="demoAdminModalTitle">Add Department</h2>
              <p className="modal-subtitle">Enter the official department title below.</p>
            </div>
          </div>
          <form
            className="modal-form"
            id="demoAdminForm"
            onSubmit={(e) => {
              e.preventDefault();
              setAdminModalOpen(false);
              showToast('Department record saved successfully.');
            }}
          >
            <div className="ui-alert ui-alert--info" role="status">
              <svg className="ui-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div className="ui-alert-content">
                <span className="ui-alert-title">Confirm Addition</span>
                <span className="ui-alert-desc">You are about to add this department record. Review the details below before proceeding.</span>
              </div>
            </div>
            <div className="ui-form-group">
              <label htmlFor="demoAdminDeptName" className="ui-form-label">Department Name</label>
              <input
                id="demoAdminDeptName"
                type="text"
                className="ui-input"
                placeholder="e.g. Department of Computer Science"
                required
                value={adminDeptName}
                onChange={(e) => setAdminDeptName(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button
                id="cancelDemoAdminModal"
                type="button"
                className="ui-btn ui-btn-outline modal-btn-cancel"
                onClick={() => setAdminModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="ui-btn ui-btn-primary modal-submit">Add Department</button>
            </div>
          </form>
        </section>
      </div>

      {/* 2. Live Admin Destructive Removal Modal */}
      <div
        className={`modal-overlay ${removeModalOpen ? 'active' : ''}`}
        id="demoRemoveModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) setRemoveModalOpen(false);
        }}
      >
        <section className="modal-card compact remove-modal">
          <div className="modal-header">
            <div className="modal-header-content">
              <h2 className="modal-title">Remove Department</h2>
              <p className="modal-subtitle">Confirm permanent deletion of this record.</p>
            </div>
          </div>
          <div className="modal-body">
            <div className="ui-alert ui-alert--warning" role="alert">
              <svg className="ui-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div className="ui-alert-content">
                <span className="ui-alert-title">Confirm Removal</span>
                <span className="ui-alert-desc">Are you sure you want to remove this department? This action cannot be undone.</span>
              </div>
            </div>
            <div className="modal-actions">
              <button
                id="cancelDemoRemoveModal"
                type="button"
                className="ui-btn ui-btn-outline modal-btn-cancel"
                onClick={() => setRemoveModalOpen(false)}
              >
                Cancel
              </button>
              <button
                id="confirmDemoRemoveModal"
                type="button"
                className="ui-btn ui-btn-primary modal-submit"
                onClick={() => {
                  setRemoveModalOpen(false);
                  showToast('Department record permanently removed.');
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Live Faculty Proposal Modal (<dialog>) */}
      <dialog
        ref={facultyDialogRef}
        id="demoFacultyModal"
        className="proposal-modal"
        aria-labelledby="demoFacultyTitle"
        onClose={() => setFacultyModalOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setFacultyModalOpen(false);
        }}
      >
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title" id="demoFacultyTitle">Propose a department</h2>
            <p className="modal-subtitle">Your request will be pending until reviewed by an administrator.</p>
          </div>
        </div>
        <div className="modal-body">
          <form
            id="demoFacultyForm"
            className="modal-form"
            onSubmit={(e) => {
              e.preventDefault();
              setFacultyModalOpen(false);
              showToast('Proposal submitted to administrator queue.');
            }}
          >
            <div className="ui-form-group">
              <label className="ui-form-label" htmlFor="demoFacultyDeptName">Proposed name</label>
              <input
                type="text"
                id="demoFacultyDeptName"
                className="ui-input"
                required
                maxLength={120}
                placeholder="e.g. Department of Computer Science"
                autoComplete="off"
                value={facultyDeptName}
                onChange={(e) => setFacultyDeptName(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                id="cancelDemoFacultyModal"
                onClick={() => setFacultyModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="ui-btn ui-btn-primary" id="submitDemoFacultyModal">
                Submit application
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* 4. Live Logout Confirmation Dialog (<dialog>) */}
      <dialog
        ref={logoutDialogRef}
        id="demoLogoutDialog"
        className="logout-dialog"
        onClose={() => setLogoutDialogOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setLogoutDialogOpen(false);
        }}
      >
        <form
          method="dialog"
          onSubmit={(e) => {
            e.preventDefault();
            setLogoutDialogOpen(false);
            showToast('Logged out of session.');
          }}
        >
          <h2>Log out?</h2>
          <p>Are you sure you want to end your current session?</p>
          <div className="actions">
            <button
              type="button"
              value="cancel"
              className="ui-btn ui-btn-outline"
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" value="confirm" className="ui-btn ui-btn-primary">
              Log out
            </button>
          </div>
        </form>
      </dialog>

      {/* 5. React Controlled QueueModal Component */}
      <QueueModal
        open={queue !== null}
        onClose={closeQueue}
        title={queue ? QUEUE_TITLES[queue] : ''}
      >
        {queue && <ApplicationQueue key={queue} type={queue} isModal={true} />}
      </QueueModal>

      {/* 6. Live Success Toast */}
      <div id="demoToast" className={`ui-toast ${toastMessage ? 'show' : ''}`} role="status" aria-live="polite">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span id="demoToastMessage">{toastMessage || 'Action completed successfully!'}</span>
      </div>
    </>
  );
}
