import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { Input, Textarea } from './Input';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { TypographyText } from './Typography';
import { ThemeToggleButton } from '../navigation';
import spmisLogo from '../../../../mockup/assets/icons/SPMIS.png';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface StyleguideTopBarProps {
  breadcrumbs: BreadcrumbItem[];
  statusText?: string;
}

export function StyleguideTopBar({
  breadcrumbs,
  statusText = 'Claude+ Standard',
}: StyleguideTopBarProps) {
  return (
    <header className="ui-top-bar">
      <div className="ui-top-bar-left">
        <div className="ui-top-bar-dot"></div>
        <span className="ui-top-bar-breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && ' / '}
              {crumb.to ? (
                <Link to={crumb.to} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {crumb.label}
                </Link>
              ) : (
                crumb.label
              )}
            </React.Fragment>
          ))}
        </span>
      </div>
      <div className="ui-top-bar-right">
        <ThemeToggleButton />
        <div className="ui-top-bar-badge">
          <span className="ui-top-bar-pulse"></span>
          <span>{statusText}</span>
        </div>
      </div>
    </header>
  );
}

export interface StyleguideHeroHeaderProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  actions?: React.ReactNode;
}

export function StyleguideHeroHeader({
  title,
  subtitle,
  actions,
}: StyleguideHeroHeaderProps) {
  return (
    <div className="ui-header">
      {actions ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="ui-header-title">{title}</h1>
            <p className="ui-header-subtitle">{subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>
        </div>
      ) : (
        <>
          <h1 className="ui-header-title">{title}</h1>
          <p className="ui-header-subtitle">{subtitle}</p>
        </>
      )}
    </div>
  );
}

export interface CategoryQuickNavItem {
  id: string;
  title: React.ReactNode;
  path?: string;
  href?: string;
  active?: boolean;
}

export interface CategoryQuickNavProps {
  items: CategoryQuickNavItem[];
  ariaLabel?: string;
}

export function CategoryQuickNav({
  items,
  ariaLabel = 'Classified Component Categories',
}: CategoryQuickNavProps) {
  return (
    <nav className="ui-quick-nav is-d8c8a7b" aria-label={ariaLabel}>
      {items.map((item) =>
        item.path ? (
          <Link key={item.id} to={item.path} style={{ textDecoration: 'none' }}>
            <Badge
              variant={item.active ? 'addition' : 'neutral'}
              className="is-3fcf0f3"
              style={
                item.active
                  ? {
                      backgroundColor: 'var(--primary)',
                      color: '#000000',
                      fontWeight: 700,
                      borderColor: 'var(--primary)',
                    }
                  : undefined
              }
            >
              {item.title}
            </Badge>
          </Link>
        ) : (
          <a key={item.id} href={item.href || `#${item.id}`} style={{ textDecoration: 'none' }}>
            <Badge variant={item.active ? 'addition' : 'neutral'} className="is-3fcf0f3">
              {item.title}
            </Badge>
          </a>
        )
      )}
    </nav>
  );
}

export interface ShowcaseSectionProps {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function ShowcaseSection({
  id,
  title,
  description,
  className = '',
  children,
}: ShowcaseSectionProps) {
  return (
    <section className={`ui-section ${className}`.trim()} id={id}>
      <div className="ui-section-header">
        <h2 className="ui-section-title">{title}</h2>
        {description && <span className="ui-section-desc">{description}</span>}
      </div>
      {children}
    </section>
  );
}

export interface ShowcaseGroupCardProps {
  label?: React.ReactNode;
  caption?: React.ReactNode;
  groupClassName?: string;
  groupStyle?: React.CSSProperties;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function ShowcaseGroupCard({
  label,
  caption,
  groupClassName = '',
  groupStyle,
  className = '',
  style,
  children,
}: ShowcaseGroupCardProps) {
  return (
    <div className={`ui-btn-row ${className}`.trim()} style={style}>
      {label && <TypographyText variant="label">{label}</TypographyText>}
      <div className={`ui-btn-group ${groupClassName}`.trim()} style={groupStyle}>
        {children}
      </div>
      {caption && <TypographyText variant="caption">{caption}</TypographyText>}
    </div>
  );
}

export interface SkeletonDemoToolbarProps {
  isLoading: boolean;
  onSimulate: () => void;
  statusId?: string;
  buttonId?: string;
  labelId?: string;
  ariaControls?: string;
  statusText: string;
  buttonLabel: string;
}

export function SkeletonDemoToolbar({
  isLoading,
  onSimulate,
  statusId,
  buttonId,
  labelId,
  ariaControls,
  statusText,
  buttonLabel,
}: SkeletonDemoToolbarProps) {
  return (
    <div className="ui-demo-loading-toolbar">
      <span id={statusId} className="ui-text-muted" role="status" aria-live="polite" aria-atomic="true">
        {statusText}
      </span>
      <Button
        id={buttonId}
        variant="outline"
        className="ui-demo-simulate-button"
        aria-controls={ariaControls}
        onClick={onSimulate}
        disabled={isLoading}
        leftIcon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        }
      >
        <span id={labelId}>{buttonLabel}</span>
      </Button>
    </div>
  );
}

export interface StudentIdentityCellProps {
  name: string;
  email: string;
}

export function StudentIdentityCell({ name, email }: StudentIdentityCellProps) {
  return (
    <div>
      <strong className="is-d3c8577" style={{ display: 'block' }}>{name}</strong>
      <span className="is-06185fd">{email}</span>
    </div>
  );
}

export interface TableControlsToolbarProps {
  onAddRecord?: () => void;
  addButtonLabel?: string;
}

export function TableControlsToolbar({
  onAddRecord,
  addButtonLabel = 'Add Record',
}: TableControlsToolbarProps) {
  return (
    <div className="is-30fe52e">
      <div className="search-wrapper is-a489c38">
        <Input
          aria-label="Search by student, faculty, or proposal"
          className="search-input"
          type="search"
          placeholder="Search by student, faculty, or proposal..."
          leftIcon={
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          }
        />
      </div>
      <div className="is-9f3f2d3">
        <div className="dropdown-container department is-3a95054">
          <Select
            aria-label="Filter by department"
            className="dropdown-select"
            defaultValue="all"
            options={[
              { value: 'all', label: 'Department: All' },
              { value: 'cs', label: 'Department of Computer Science' },
              { value: 'it', label: 'Department of Information Technology' },
              { value: 'math', label: 'Department of Applied Mathematics' },
            ]}
          />
        </div>
        <div className="dropdown-container status is-acf1180">
          <Select
            aria-label="Filter by status"
            className="dropdown-select"
            defaultValue="all"
            options={[
              { value: 'all', label: 'Status: All' },
              { value: 'active', label: 'Active' },
              { value: 'review', label: 'Under Review' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
        <Button variant="add" onClick={onAddRecord}>
          {addButtonLabel}
        </Button>
      </div>
    </div>
  );
}

export interface AlertProps {
  variant?: 'info' | 'warning';
  title: string;
  description: string;
}

export function Alert({ variant = 'info', title, description }: AlertProps) {
  return (
    <div className={`ui-alert ui-alert--${variant}`} role={variant === 'warning' ? 'alert' : 'status'}>
      {variant === 'info' ? (
        <svg className="ui-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      ) : (
        <svg className="ui-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )}
      <div className="ui-alert-content">
        <span className="ui-alert-title">{title}</span>
        <span className="ui-alert-desc">{description}</span>
      </div>
    </div>
  );
}

export interface ToastProps {
  message: string | null;
  id?: string;
  inline?: boolean;
  className?: string;
}

export function Toast({ message, id = 'demoToast', inline = false, className = '' }: ToastProps) {
  if (inline) {
    return (
      <div className={`ui-toast ui-toast--inline is-c3a5059 ${className}`.trim()} role="status" aria-live="polite">
        <svg className="ui-toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span className="ui-toast-message is-1e42189">{message || 'Application Action Completed Successfully'}</span>
      </div>
    );
  }

  return (
    <div id={id} className={`ui-toast ${message ? 'show' : ''} ${className}`.trim()} role="status" aria-live="polite">
      <svg className="ui-toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span id="demoToastMessage" className="ui-toast-message">{message || 'Action completed successfully!'}</span>
    </div>
  );
}

export interface PortalStatusHeaderBarProps {
  breadcrumb?: string;
  statusText?: string;
  academicYear?: string;
}

export function PortalStatusHeaderBar({
  breadcrumb = 'Workspace / Overview',
  statusText = 'System Live',
  academicYear = 'AY 2026-2027',
}: PortalStatusHeaderBarProps) {
  return (
    <div className="admin-top-header is-911172d">
      <div className="is-b512c98">
        <div className="red-dot is-86dee63"></div>
        <span className="breadcrumb-text">{breadcrumb}</span>
      </div>
      <div className="is-1c20bbe">
        <span className="status-badge">
          <span className="green-dot is-6888aeb"></span>
          {statusText}
        </span>
        <span className="ay-text">{academicYear}</span>
      </div>
    </div>
  );
}

export interface ChatMessageItem {
  id: string;
  sender: string;
  time: string;
  type: 'ai' | 'user';
  text: string;
  avatar?: string;
  isHtml?: boolean;
}

export interface ReferencedStudent {
  id: string;
  name: string;
  initials: string;
  program: string;
  yearLevel: string;
  status: string;
  tags: { label: string; variant: 'purple' | 'cyan' | 'neutral' | 'success' }[];
}

export interface ChatQuickPrompt {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
}

export const FACULTY_CHAT_PROMPTS: ChatQuickPrompt[] = [
  {
    id: 'research',
    title: 'Research experience',
    subtitle: 'Explore faculty assessments',
    prompt: 'Which students have research experience?',
  },
  {
    id: 'teamwork',
    title: 'Teamwork',
    subtitle: 'Ask across student records',
    prompt: 'Which students show teamwork?',
  },
  {
    id: 'communication',
    title: 'Communication',
    subtitle: 'Find relevant review excerpts',
    prompt: 'Find reviews mentioning communication.',
  },
  {
    id: 'robotics',
    title: 'Robotics',
    subtitle: 'Explore project experience',
    prompt: 'Which students have robotics experience?',
  },
];

export const STUDENT_DATABASE: Record<string, ReferencedStudent> = {
  '24-1-00001': {
    id: '24-1-00001',
    name: 'Sam Lee Parker',
    initials: 'SP',
    program: 'BS Computer Science',
    yearLevel: '3rd Year',
    status: 'Good Standing',
    tags: [
      { label: 'Research', variant: 'purple' },
      { label: 'Algorithms', variant: 'cyan' },
    ],
  },
  '24-1-00002': {
    id: '24-1-00002',
    name: 'Taylor Reed',
    initials: 'TR',
    program: 'BS Computer Engineering',
    yearLevel: '4th Year',
    status: 'Good Standing',
    tags: [
      { label: 'Robotics', variant: 'purple' },
      { label: 'Teamwork', variant: 'cyan' },
    ],
  },
  '24-1-00003': {
    id: '24-1-00003',
    name: 'Jordan Blake',
    initials: 'JB',
    program: 'BS Information Systems',
    yearLevel: '2nd Year',
    status: 'Good Standing',
    tags: [
      { label: 'Research', variant: 'purple' },
      { label: 'Communication', variant: 'cyan' },
    ],
  },
  '24-1-00004': {
    id: '24-1-00004',
    name: 'Casey Lane',
    initials: 'CL',
    program: 'BS Computer Science',
    yearLevel: '1st Year',
    status: 'Good Standing',
    tags: [
      { label: 'Teamwork', variant: 'purple' },
      { label: 'Foundations', variant: 'neutral' },
    ],
  },
};

const DEFAULT_CHAT_MESSAGES: ChatMessageItem[] = [
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
    text: 'Which students in BS Computer Science have demonstrated research and teamwork skills?',
  },
  {
    id: 'msg-3',
    sender: 'AI Assistant',
    time: '10:43 AM',
    type: 'ai',
    avatar: 'SP',
    text: 'Based on active faculty reviews, student <strong>24-1-00001</strong> demonstrated research planning and teamwork skills by developing a clear research plan and supporting peers during a robotics project.',
    isHtml: true,
  },
];

function getAiResponseForPrompt(prompt: string): { text: string; student: ReferencedStudent } {
  const lower = prompt.toLowerCase();
  if (lower.includes('research')) {
    return {
      text: 'For this consultation, here are active review excerpts matching research credentials:\n\n• <strong>Sam Lee Parker (24-1-00001)</strong> — Sam developed a clear research plan and supported the team during the robotics project.\nContributor: Alex Morgan\n\n• <strong>Jordan Blake (24-1-00003)</strong> — Jordan contributed thoughtful research notes and communicated findings clearly.\nContributor: Alex Morgan\n\nThese are attributed faculty opinions. Open the student record to review the full context.',
      student: STUDENT_DATABASE['24-1-00001'],
    };
  }
  if (lower.includes('teamwork')) {
    return {
      text: 'For this consultation, here are active review excerpts matching teamwork competencies:\n\n• <strong>Sam Lee Parker (24-1-00001)</strong> — Supported the team during the robotics project and assisted peers with troubleshooting.\nContributor: Alex Morgan\n\n• <strong>Taylor Reed (24-1-00002)</strong> — Taylor coordinated the robotics team and documented testing carefully.\nContributor: Jamie Rivera\n\n• <strong>Casey Lane (24-1-00004)</strong> — Casey supported peers during the workshop.\nContributor: Jamie Rivera\n\nThese are attributed faculty opinions. Open the student record to review the full context.',
      student: STUDENT_DATABASE['24-1-00002'],
    };
  }
  if (lower.includes('communication')) {
    return {
      text: 'For this consultation, here are active review excerpts mentioning communication skills:\n\n• <strong>Sam Lee Parker (24-1-00001)</strong> — Sam explained the prototype clearly and helped peers troubleshoot their designs.\nContributor: Jamie Rivera\n\n• <strong>Jordan Blake (24-1-00003)</strong> — Jordan communicated findings clearly and contributed thoughtful research notes.\nContributor: Alex Morgan\n\nThese are attributed faculty opinions. Open the student record to review the full context.',
      student: STUDENT_DATABASE['24-1-00003'],
    };
  }
  if (lower.includes('robotics')) {
    return {
      text: 'For this consultation, here are active review excerpts regarding robotics project experience:\n\n• <strong>Taylor Reed (24-1-00002)</strong> — Taylor coordinated the robotics team and documented testing carefully.\nContributor: Jamie Rivera\n\n• <strong>Sam Lee Parker (24-1-00001)</strong> — Sam developed prototype modules and supported peers during the robotics project.\nContributor: Alex Morgan\n\nThese are attributed faculty opinions. Open the student record to review the full context.',
      student: STUDENT_DATABASE['24-1-00002'],
    };
  }
  if (lower.includes('taylor') || lower.includes('24-1-00002')) {
    return {
      text: 'Referenced record for <strong>Taylor Reed (24-1-00002)</strong>: Coordinated robotics hardware integration and test logs under Prof. Rivera\'s capstone section.',
      student: STUDENT_DATABASE['24-1-00002'],
    };
  }
  if (lower.includes('jordan') || lower.includes('24-1-00003')) {
    return {
      text: 'Referenced record for <strong>Jordan Blake (24-1-00003)</strong>: Excellent progress on information architecture review and cross-functional team reports.',
      student: STUDENT_DATABASE['24-1-00003'],
    };
  }
  return {
    text: `Based on active faculty records across enrolled students, review excerpts for <strong>Sam Lee Parker (24-1-00001)</strong> and peer contributors contain relevant evaluations matching "${prompt}". Open the student profile to inspect complete timeline entries.`,
    student: STUDENT_DATABASE['24-1-00001'],
  };
}

export interface ChatPrivacyNoticeProps {
  badgeText?: string;
  children?: React.ReactNode;
}

export function ChatPrivacyNotice({
  badgeText = 'Privacy',
  children,
}: ChatPrivacyNoticeProps) {
  return (
    <div className="chat-privacy-notice" role="note" aria-label="De-identification privacy notice">
      <Badge variant="warning">{badgeText}</Badge>
      {children || (
        <p>
          <strong>Do not enter raw student names or other identifying details.</strong>{' '}
          Refer to students by ID or program instead so the assistant can help without exposing personal data.
        </p>
      )}
    </div>
  );
}

export interface ChatPromptCardProps {
  prompt: ChatQuickPrompt;
  onSelect: (promptText: string) => void;
}

export function ChatPromptCard({ prompt, onSelect }: ChatPromptCardProps) {
  return (
    <div
      className="ui-chat-prompt-card quick-link-item"
      role="button"
      tabIndex={0}
      data-prompt={prompt.prompt}
      style={{ transform: 'none', cursor: 'pointer' }}
      onClick={() => onSelect(prompt.prompt)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(prompt.prompt);
        }
      }}
    >
      <h3>{prompt.title}</h3>
      <p>{prompt.subtitle}</p>
    </div>
  );
}

export interface ChatPromptGridProps {
  prompts?: ChatQuickPrompt[];
  onSelectPrompt: (promptText: string) => void;
}

export function ChatPromptGrid({
  prompts = FACULTY_CHAT_PROMPTS,
  onSelectPrompt,
}: ChatPromptGridProps) {
  return (
    <div className="ui-chat-prompts" aria-label="Suggested prompts">
      {prompts.map((item) => (
        <ChatPromptCard key={item.id} prompt={item} onSelect={onSelectPrompt} />
      ))}
    </div>
  );
}

export interface ChatMessageBubbleProps {
  message: ChatMessageItem;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  return (
    <div className={`ui-chat-msg ui-chat-msg--${message.type}`}>
      <div className="ui-chat-msg-content">
        <div className="ui-chat-msg-header">
          <span className="ui-chat-msg-sender">{message.sender}</span>
          <span className="ui-chat-msg-time">{message.time}</span>
        </div>
        {message.isHtml ? (
          <div
            className={`ui-chat-bubble ui-chat-bubble--${message.type}`}
            style={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{ __html: message.text }}
          />
        ) : (
          <div className={`ui-chat-bubble ui-chat-bubble--${message.type}`} style={{ whiteSpace: 'pre-wrap' }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

export interface StudentContextCardProps {
  student: ReferencedStudent;
  onNavigateProfile?: (studentId: string) => void;
}

export function StudentContextCard({
  student,
  onNavigateProfile,
}: StudentContextCardProps) {
  return (
    <div className="ui-chat-context-card">
      <div className="ui-chat-context-avatar">{student.initials}</div>
      <h3 className="ui-heading-3" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--foreground)' }}>
        {student.name}
      </h3>
      <p
        className="ui-text-muted"
        style={{
          fontSize: '0.8125rem',
          marginTop: '0.25rem',
          marginBottom: '1.25rem',
          fontFamily: 'var(--font-number)',
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--muted-foreground)',
        }}
      >
        ID: {student.id}
      </p>

      <div className="ui-chat-context-meta">
        <span className="ui-chat-context-dt">Program</span>
        <span className="ui-chat-context-dd">{student.program}</span>
        <span className="ui-chat-context-dt">Year Level</span>
        <span className="ui-chat-context-dd">{student.yearLevel}</span>
        <span className="ui-chat-context-dt">Status</span>
        <span className="ui-chat-context-dd">
          <Badge variant="success">{student.status}</Badge>
        </span>
        <span className="ui-chat-context-dt">Tags</span>
        <span className="ui-chat-context-dd" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {student.tags.map((tag, idx) => (
            <Badge key={idx} variant={tag.variant}>
              {tag.label}
            </Badge>
          ))}
        </span>
      </div>

      <p
        className="ui-text-caption"
        style={{
          margin: '1.25rem 0',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--muted-foreground)',
          lineHeight: 1.5,
        }}
      >
        Referenced record. Review conversations can synthesize evaluations across all enrolled students.
      </p>

      <Button
        variant="outline"
        className="view-profile-btn"
        style={{ width: '100%', justifyContent: 'center' }}
        rightIcon={<span className="arrow">&rarr;</span>}
        onClick={() => onNavigateProfile?.(student.id)}
      >
        View Full Profile
      </Button>
    </div>
  );
}

export interface ChatAssistantWidgetProps {
  onNavigateProfile?: (studentId: string) => void;
}

export function ChatAssistantWidget({ onNavigateProfile }: ChatAssistantWidgetProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>(DEFAULT_CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [referencedStudent, setReferencedStudent] = useState<ReferencedStudent>(STUDENT_DATABASE['24-1-00001']);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatLogRef.current) {
        chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleSendPrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'Prof. Morgan',
      time: timeStr,
      type: 'user',
      text: trimmed,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsGenerating(true);
    scrollToBottom();

    setTimeout(() => {
      const response = getAiResponseForPrompt(trimmed);
      const aiTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aiMsg: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'AI Assistant',
        time: aiTimeStr,
        type: 'ai',
        avatar: response.student.initials,
        text: response.text,
        isHtml: true,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      setReferencedStudent(response.student);
      setIsGenerating(false);
      scrollToBottom();
    }, 500);
  };

  return (
    <div className="ui-chat-widget-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 1. De-identification Privacy Notice */}
      <ChatPrivacyNotice />

      {/* 2. Interactive Prompt Quick Cards (4-column grid) */}
      <ChatPromptGrid onSelectPrompt={handleSendPrompt} />

      {/* 3. Main Chat Columns (Left: Chat Card, Right: Student Context Card) */}
      <div className="ui-chat-columns">
        {/* Left: Chat Container Card */}
        <Card
          className="ui-chat-card-resizable is-dca1b55"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            resize: 'vertical',
            overflow: 'hidden',
            alignSelf: 'flex-start',
            minHeight: '400px',
            maxHeight: '85vh',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
            <h3 className="ui-card-title" style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--foreground)' }}>
              Ask across student reviews
            </h3>
            <p className="ui-card-description" style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', margin: 0 }}>
              Faculty conversational assistant for student evaluations.
            </p>
          </div>

          <div className="ui-chat-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div
              id="chat-log"
              className="ui-chat-log custom-scrollbar is-3fbfa29"
              ref={chatLogRef}
              aria-live="polite"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                flex: 1,
                overflowY: 'auto',
                minHeight: '200px',
                paddingRight: '4px',
              }}
            >
              {chatMessages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}

              {isGenerating && (
                <div className="ui-chat-msg ui-chat-msg--ai">
                  <div className="ui-chat-msg-content" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem' }}>
                    <span className="ui-chat-msg-sender">AI Assistant</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                      is analyzing review records...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Area */}
            <div className="ui-chat-input-wrapper" style={{ marginTop: 'auto', paddingTop: '0.75rem', flexShrink: 0 }}>
              <form
                id="chat-form"
                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt(chatInput);
                }}
              >
                <Textarea
                  ref={chatTextareaRef}
                  id="chat-prompt"
                  aria-label="Message to AI Chat Assistant"
                  className="ui-chat-textarea"
                  required
                  placeholder="Type a question across student reviews..."
                  rows={2}
                  value={chatInput}
                  disabled={isGenerating}
                  style={{
                    resize: 'vertical',
                    overflowY: 'auto',
                    minHeight: '70px',
                    maxHeight: '320px',
                  }}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt(chatInput);
                    }
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span className="ui-chat-input-hint" style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                    Press Enter to send, Shift+Enter for new line
                  </span>
                  <Button
                    type="submit"
                    variant="primary"
                    id="send"
                    aria-label="Send"
                    disabled={isGenerating || !chatInput.trim()}
                    rightIcon={
                      <svg className="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    }
                  >
                    Send query
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Card>

        {/* Right: Student Quick File Context Card */}
        <StudentContextCard
          student={referencedStudent}
          onNavigateProfile={onNavigateProfile}
        />
      </div>

      {/* 4. Submission note placed at bottom */}
      <p className="muted application-footer-note">
        Use contributor assessments as context for your own decisions. Read full reviews and edit histories from the student roster.
      </p>
    </div>
  );
}

export interface FieldValidationPopupProps {
  message?: string;
}

export function FieldValidationPopup({
  message = 'Please fill in this field.',
}: FieldValidationPopupProps) {
  return (
    <div className="ui-field-popup" role="alert" aria-live="polite">
      <span className="ui-field-popup-icon" aria-hidden="true">
        !
      </span>
      <span className="ui-field-popup-text">{message}</span>
    </div>
  );
}

export interface AuthBrandCardProps {
  features?: string[];
  copyrightText?: string;
  versionText?: string;
}

export function AuthBrandCard({
  features = [
    'Centralized student profiles',
    'Faculty review & approvals',
    'Real-time progress tracking',
  ],
  copyrightText = '© 2026 SPMIS Project',
  versionText = 'v1.0',
}: AuthBrandCardProps) {
  return (
    <aside className="brand-card">
      <a href="#auth-cards" className="brand-logo" aria-label="SPMIS">
        <img className="logo-dark-only" src={spmisLogo} alt="SPMIS" />
        <img className="logo-light-only" src={spmisLogo} alt="SPMIS" />
      </a>

      <div className="brand-hero">
        <h1 className="brand-hero-title">
          Track every
          <br />
          <span className="accent">student journey.</span>
        </h1>
        <p className="brand-hero-sub">
          From enrollment to graduation &mdash; review, approve, and manage academic records in one calm, focused workspace.
        </p>

        <ul className="brand-features">
          {features.map((feat, idx) => (
            <li key={idx}>
              <span className="dot">✓</span> {feat}
            </li>
          ))}
        </ul>
      </div>

      <div className="brand-footer">
        <span>{copyrightText}</span>
        <span>{versionText}</span>
      </div>
    </aside>
  );
}

export interface AuthSignInCardProps {
  onSuccess?: (msg: string) => void;
}

export function AuthSignInCard({ onSuccess }: AuthSignInCardProps) {
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authKeepSignedIn, setAuthKeepSignedIn] = useState(true);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

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
      onSuccess?.(`Welcome back, ${authEmail}! Signing in...`);
    }
  };

  return (
    <section className="auth-card">
      <div className="auth-card-body">
        <h2 className="auth-card-title">Sign In</h2>
        <p className="auth-card-sub">Welcome back. Enter your credentials to continue.</p>

        <div className="ui-auth-wrapper">
          <div className="ui-auth-card">
            <Button
              variant="outline"
              className="auth-social-btn"
              onClick={() => onSuccess?.('Google Authentication connected.')}
              leftIcon={
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              }
            >
              Continue with Google
            </Button>

            <div className="ui-auth-divider">
              <span>or continue with email</span>
            </div>

            <form className="ui-auth-form" id="signin-form" noValidate onSubmit={handleAuthSubmit}>
              <div className="ui-auth-field" data-field="email">
                <label className="ui-auth-field-label" htmlFor="auth-email">
                  Academic Email
                </label>
                <div className="ui-input-wrap">
                  <Input
                    type="email"
                    id="auth-email"
                    placeholder="faculty@vsu.edu.ph"
                    value={authEmail}
                    onChange={(e) => {
                      setAuthEmail(e.target.value);
                      if (e.target.value) setEmailError(false);
                    }}
                    required
                  />
                  {emailError && <FieldValidationPopup />}
                </div>
              </div>

              <div className="ui-auth-field" data-field="password">
                <div className="is-948e6d6">
                  <label className="ui-auth-field-label" htmlFor="auth-pwd">
                    Password
                  </label>
                  <a className="is-7bcf3f8" href="#forgot">
                    Forgot password?
                  </a>
                </div>
                <div className="ui-input-wrap">
                  <Input
                    type="password"
                    id="auth-pwd"
                    placeholder="••••••••••••"
                    value={authPassword}
                    onChange={(e) => {
                      setAuthPassword(e.target.value);
                      if (e.target.value) setPasswordError(false);
                    }}
                    required
                  />
                  {passwordError && <FieldValidationPopup />}
                </div>
              </div>

              <Checkbox
                id="auth-keep-signed-in"
                keepSignedIn
                checked={authKeepSignedIn}
                onChange={(e) => setAuthKeepSignedIn(e.target.checked)}
                label="Keep me signed in on this device"
              />

              <Button type="submit" variant="primary" className="ui-auth-btn-submit">
                Sign In to Account
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="auth-card-signup">
        <a href="#register">
          New here? Sign Up <span className="arrow">&rarr;</span>
        </a>
      </div>
    </section>
  );
}

export interface AuthLegalFooterProps {
  contactHref?: string;
  termsHref?: string;
  privacyHref?: string;
}

export function AuthLegalFooter({
  contactHref = '#about',
  termsHref = '#terms',
  privacyHref = '#privacy',
}: AuthLegalFooterProps) {
  return (
    <div className="auth-footer-outside">
      <span className="legal">
        <a href={contactHref}>Contact</a>
        <span className="sep">&middot;</span>
        <a href={termsHref}>Terms</a>
        <span className="sep">&middot;</span>
        <a href={privacyHref}>Privacy</a>
      </span>
    </div>
  );
}

export interface AuthCardShowcaseProps {
  onSuccess?: (msg: string) => void;
}

export function AuthCardShowcase({ onSuccess }: AuthCardShowcaseProps) {
  return (
    <div className="auth-demo-container">
      <div className="auth-shell">
        <div className="auth-split">
          <AuthBrandCard />
          <AuthSignInCard onSuccess={onSuccess} />
        </div>
        <AuthLegalFooter />
      </div>
    </div>
  );
}


