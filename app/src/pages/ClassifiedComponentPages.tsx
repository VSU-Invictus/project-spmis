import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Button,
  ActionLink,
  Badge,
  TagCluster,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  KpiMetricCard,
  InteractiveLinkCard,
  QueueMetricsGrid,
  SystemActivityLog,
  Input,
  Textarea,
  Select,
  Checkbox,
  DataTable,
  type DataTableColumn,
  EmptyState,
  RejectionRow,
  ColorSwatchCard,
  TypographyHeading,
  TypographyText,
  TypographyNumber,
  TableControlsToolbar,
  Alert,
  Toast,
  PortalStatusHeaderBar,
  ChatAssistantWidget,
  AuthCardShowcase,
  AdminEntityModal,
  RemoveConfirmationModal,
  FacultyProposalDialog,
  AdminSidebar,
  FacultySidebar,
  LogoutModal,
  PortalFooter,
  QueueModal,
  QUEUE_TITLES,
  useQueueSearchParam,
  ApplicationQueue,
  StyleguideTopBar,
  StyleguideHeroHeader,
  CategoryQuickNav,
  ShowcaseSection,
  ShowcaseGroupCard,
  SkeletonDemoToolbar,
  StudentIdentityCell,
} from '../components/ui';
import { QUEUE_FIXTURES } from '../data/queueFixtures';
import { ROSTER_STUDENTS, type RosterStudent } from '../data/rosterFixtures';

export interface ComponentCategoryItem {
  slug: string;
  label: string;
  description: string;
}

export const COMPONENT_CATEGORIES: ComponentCategoryItem[] = [
  { slug: 'buttons', label: 'Buttons & Actions', description: 'Every button variant, pill decision button, entity creation action, and animated link rendered via <Button /> and <ActionLink />.' },
  { slug: 'badges', label: 'Badges & Tags', description: 'Semantic status badges, request-type pills (Addition / Edit Existing), competency tags, and overflow <TagCluster />.' },
  { slug: 'forms', label: 'Form Controls & Filters', description: 'Accessible <Input />, <Textarea />, <Select />, <Checkbox />, <Label />, and <TableControlsToolbar /> components.' },
  { slug: 'cards', label: 'Cards, KPIs & Activity Log', description: '<Card />, <KpiMetricCard />, <InteractiveLinkCard />, <QueueMetricsGrid /> (4 summary cards), and <SystemActivityLog />.' },
  { slug: 'tables', label: 'Data Tables & Rejection Rows', description: '<DataTable />, <RejectionRow /> full-width inline rejection, <EmptyState />, and <ApplicationQueue /> components.' },
  { slug: 'navigation', label: 'Sidebars & App Shell', description: '<AdminSidebar />, <FacultySidebar />, <PortalStatusHeaderBar />, and <PortalFooter /> components.' },
  { slug: 'modals', label: 'Modals & Queue Dialogs', description: 'URL-backed <QueueModal />, <LogoutModal />, <AdminEntityModal />, <RemoveConfirmationModal />, <FacultyProposalDialog />, and <Toast />.' },
  { slug: 'colors-typography', label: 'Colors & Typography', description: '<ColorSwatchCard /> OKLCH tokens, <TypographyHeading />, and <TypographyText /> with skeleton shimmer simulation.' },
  { slug: 'chats-auth', label: 'AI Chat & Auth Cards', description: '<ChatAssistantWidget /> and <AuthCardShowcase /> built from atomic UI components.' },
];

export function ComponentCategoryLayout({
  activeSlug,
  title,
  subtitle,
  children,
}: {
  activeSlug: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { queue, closeQueue } = useQueueSearchParam();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, activeSlug]);

  return (
    <div className="ui-styleguide">
      <StyleguideTopBar
        breadcrumbs={[
          { label: 'SPMIS', to: '/' },
          { label: 'STYLEGUIDE', to: '/styleguide' },
          { label: title.toUpperCase() },
        ]}
        statusText="Classified Components"
      />

      <StyleguideHeroHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            <Link to="/styleguide" style={{ textDecoration: 'none' }}>
              <Button variant="outline">View Full Styleguide</Button>
            </Link>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button variant="secondary">Home</Button>
            </Link>
          </>
        }
      />

      {/* Category Navigation Bar */}
      <CategoryQuickNav
        ariaLabel="Classified Component Categories"
        items={COMPONENT_CATEGORIES.map((cat) => ({
          id: cat.slug,
          title: cat.label,
          path: `/components/${cat.slug}`,
          active: activeSlug === cat.slug || location.pathname === `/components/${cat.slug}`,
        }))}
      />

      {children}

      <QueueModal
        open={queue !== null}
        onClose={closeQueue}
        title={queue ? QUEUE_TITLES[queue] : ''}
      >
        {queue && <ApplicationQueue key={queue} type={queue} isModal={true} />}
      </QueueModal>
    </div>
  );
}

/* ============================================================================
 * 1. BUTTONS PAGE (/components/buttons) - 100% <Button /> & <ActionLink /> calls
 * ============================================================================ */
export function ButtonsShowcaseSection({ onShowToast }: { onShowToast?: (msg: string) => void }) {
  const [hasSelectionDemo, setHasSelectionDemo] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  return (
    <ShowcaseSection
      id="buttons"
      title="Buttons & Actions (<Button /> & <ActionLink />)"
      description="Every button and action link below is rendered via a reusable React component call"
    >
      <div className="ui-grid ui-grid-cols-2">
        {/* 1. Standard Button Variants */}
        <ShowcaseGroupCard
          label="1. Standard <Button /> Variants"
          caption={<>Rendered via <code>&lt;Button variant="primary | secondary | outline | ghost | destructive" /&gt;</code>.</>}
        >
          <Button variant="primary" onClick={() => onShowToast?.('Primary Button clicked')}>
            Primary Action
          </Button>
          <Button variant="secondary" onClick={() => onShowToast?.('Secondary Button clicked')}>
            Secondary Action
          </Button>
          <Button variant="outline" onClick={() => onShowToast?.('Outline Button clicked')}>
            Outline Action
          </Button>
          <Button variant="ghost" onClick={() => onShowToast?.('Ghost Button clicked')}>
            Ghost Action
          </Button>
          <Button variant="destructive" onClick={() => onShowToast?.('Destructive Button clicked')}>
            Destructive
          </Button>
        </ShowcaseGroupCard>

        {/* 2. Button Sizes & States */}
        <ShowcaseGroupCard
          label="2. Button Sizes, Icons & Loading States"
          caption={<>Supports <code>leftIcon</code>, <code>rightIcon</code>, <code>isLoading</code> spinner, and <code>disabled</code> states.</>}
        >
          <Button
            variant="primary"
            leftIcon={
              <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            }
          >
            With Leading Icon
          </Button>
          <Button
            variant="secondary"
            rightIcon={
              <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            }
          >
            Next
          </Button>
          <Button
            variant="outline"
            isLoading={isLoadingDemo}
            onClick={() => {
              setIsLoadingDemo(true);
              setTimeout(() => setIsLoadingDemo(false), 800);
            }}
          >
            Click to Load
          </Button>
          <Button variant="primary" disabled>
            Disabled Action
          </Button>
        </ShowcaseGroupCard>

        {/* 3. Primary Entity Creation Actions */}
        <ShowcaseGroupCard
          label='3. Entity Creation Buttons (<Button variant="add" />)'
          groupClassName="is-14c2360"
          caption={<><code>&lt;Button variant="add"&gt;</code> automatically includes the standard SVG plus icon and <code>.add-button</code> styling.</>}
        >
          <Button variant="add" onClick={() => onShowToast?.('Add Student clicked')}>Add Student</Button>
          <Button variant="add" onClick={() => onShowToast?.('Add Faculty clicked')}>Add Faculty</Button>
          <Button variant="add" onClick={() => onShowToast?.('Add Department clicked')}>Add Department</Button>
          <Button variant="add" onClick={() => onShowToast?.('Add Program clicked')}>Add Program</Button>
          <Button variant="add" onClick={() => onShowToast?.('Register Student clicked')}>Register Student</Button>
          <Button variant="add" onClick={() => onShowToast?.('Propose Program clicked')}>Propose Program</Button>
        </ShowcaseGroupCard>

        {/* 4. Queue Decision & Bulk Pill Buttons */}
        <ShowcaseGroupCard
          label="4. Queue Decision & Bulk Pill Buttons"
          groupClassName="is-14c2360"
          caption={<>Rendered via <code>&lt;Button variant="approve | reject | accept | select-all" /&gt;</code>.</>}
        >
          <Button variant="approve" onClick={() => onShowToast?.('Approved')}>Approve</Button>
          <Button variant="reject" onClick={() => onShowToast?.('Rejected')}>Reject</Button>
          <Button variant="accept" onClick={() => onShowToast?.('Application Accepted')}>Accept Application</Button>
          <Button
            variant="select-all"
            hasSelection={hasSelectionDemo}
            onClick={() => setHasSelectionDemo((p) => !p)}
          >
            {hasSelectionDemo ? 'Deselect All' : 'Select All'}
          </Button>
          <Button variant="secondary" className="is-2dc5827">Browse Records</Button>
        </ShowcaseGroupCard>

        {/* 5. Pagination & Table Action Buttons */}
        <ShowcaseGroupCard
          label="5. Pagination & Table Action Buttons"
          groupClassName="is-14c2360"
          caption={<>Pagination buttons (<code>Previous</code>, <code>Next</code>), table row <code>View</code>, and empty-state reset buttons.</>}
        >
          <Button variant="outline" className="is-b38e363" disabled>
            Previous
          </Button>
          <Button variant="outline" className="is-b38e363" onClick={() => onShowToast?.('Next page')}>
            Next
          </Button>
          <Button variant="outline" className="is-d8d7a34" onClick={() => onShowToast?.('Viewing record')}>
            View
          </Button>
          <Button variant="empty-reset" onClick={() => onShowToast?.('Filters cleared')}>
            Clear all filters
          </Button>
        </ShowcaseGroupCard>

        {/* 6. Interactive Neutral Action Links with Arrow */}
        <ShowcaseGroupCard
          label="6. Animated Action Links (<ActionLink />)"
          groupClassName="is-0095bec"
          caption={<><code>&lt;ActionLink&gt;</code> renders <code>.ui-link-neutral</code> with the animated right arrow on hover.</>}
        >
          <ActionLink href="#buttons">Review</ActionLink>
          <ActionLink href="#buttons">View All Logs</ActionLink>
          <ActionLink href="#buttons">Write review</ActionLink>
          <ActionLink href="#buttons">View details</ActionLink>
        </ShowcaseGroupCard>
      </div>
    </ShowcaseSection>
  );
}

export function ButtonsClassifiedPage() {
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };
  return (
    <ComponentCategoryLayout
      activeSlug="buttons"
      title="Buttons & Action Primitives"
      subtitle="Complete visual catalog of every <Button /> variant and <ActionLink /> component in the design system."
    >
      <ButtonsShowcaseSection onShowToast={triggerToast} />
      <Toast message={toast} />
    </ComponentCategoryLayout>
  );
}

/* ============================================================================
 * 2. BADGES PAGE (/components/badges) - 100% <Badge /> & <TagCluster /> calls
 * ============================================================================ */
export function BadgesShowcaseSection() {
  return (
    <ShowcaseSection
      id="badges"
      title="Status Badges & Tags (<Badge /> & <TagCluster />)"
      description="Unified semantic pill tags, request-type badges, and overflow tag clusters rendered via React components"
    >
      <div className="ui-grid ui-grid-cols-2">
        {/* 1. Request Type Badges (#109) */}
        <ShowcaseGroupCard
          label="1. Request Type Pills (requestType prop)"
          caption={<>Rendered via <code>&lt;Badge requestType="Addition" /&gt;</code> and <code>&lt;Badge requestType="Edit Existing" /&gt;</code>.</>}
        >
          <Badge requestType="Addition" />
          <Badge requestType="Edit Existing" />
        </ShowcaseGroupCard>

        {/* 2. Operational & Lifecycle Statuses */}
        <ShowcaseGroupCard
          label="2. Operational & Lifecycle Statuses"
          caption="Standard status badges with semantic icons and high-contrast muted backgrounds."
        >
          <Badge
            variant="success"
            icon={<svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>}
          >
            Approved / Active
          </Badge>
          <Badge
            variant="warning"
            icon={<svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>}
          >
            Pending Review
          </Badge>
          <Badge
            variant="destructive"
            icon={<svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>}
          >
            Rejected / Deficient
          </Badge>
          <Badge
            variant="info"
            icon={<svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
          >
            In Progress
          </Badge>
          <Badge variant="neutral">Archived / Draft</Badge>
        </ShowcaseGroupCard>

        {/* 3. Entity Classification & Origin Tags */}
        <ShowcaseGroupCard
          label="3. Entity Classification & Origin Tags"
          caption="Structural entity types used in directory tables, application routing, and system entity filters."
        >
          <Badge variant="purple">Department</Badge>
          <Badge variant="cyan">Program</Badge>
          <Badge variant="warning">Student Origin</Badge>
          <Badge variant="info">Faculty Origin</Badge>
          <Badge variant="destructive">System / Direct</Badge>
        </ShowcaseGroupCard>

        {/* 4. Audit Log Activity Badges */}
        <ShowcaseGroupCard
          label="4. Audit Log Activity Badges"
          caption="Mutation indicators used across system audit trails to identify record creation, modifications, and removals."
        >
          <Badge variant="success">Created / Addition</Badge>
          <Badge variant="info">Updated / Edit</Badge>
          <Badge variant="destructive">Removed / Deleted</Badge>
          <Badge variant="purple">Evaluation Review</Badge>
        </ShowcaseGroupCard>

        {/* 5. Domain & Competency Categories */}
        <ShowcaseGroupCard
          label="5. Domain & Competency Assessment Tags"
          caption="Subject-matter and competency review tags applied to student evaluations."
        >
          <Badge variant="purple">Research</Badge>
          <Badge variant="cyan">Algorithms</Badge>
          <Badge variant="amber">Leadership</Badge>
          <Badge variant="rose">Robotics</Badge>
          <Badge variant="neutral">General Academic</Badge>
        </ShowcaseGroupCard>

        {/* 6. Tag Cluster & Overflow Counter */}
        <ShowcaseGroupCard
          label="6. Tag Cluster & Overflow Counter (<TagCluster />)"
          caption={<><code>&lt;TagCluster /&gt;</code> displays up to 2 primary tags with an interactive <code>+N</code> counter popover.</>}
        >
          <TagCluster
            maxVisible={2}
            tags={[
              { label: 'Research', variant: 'purple' },
              { label: 'Algorithms', variant: 'cyan' },
              { label: 'Leadership', variant: 'amber' },
              { label: 'Robotics', variant: 'rose' },
            ]}
          />
        </ShowcaseGroupCard>
      </div>
    </ShowcaseSection>
  );
}

export function BadgesClassifiedPage() {
  return (
    <ComponentCategoryLayout
      activeSlug="badges"
      title="Badges & Tag Primitives"
      subtitle="Complete visual catalog of <Badge /> variants, requestType pills, and <TagCluster /> popovers."
    >
      <BadgesShowcaseSection />
    </ComponentCategoryLayout>
  );
}

/* ============================================================================
 * 3. FORMS PAGE (/components/forms) - <Input />, <Select />, <Textarea />, <Checkbox />
 * ============================================================================ */
export function FormControlsShowcaseSection({ onAddRecord }: { onAddRecord?: () => void }) {
  const [checkedA, setCheckedA] = useState(true);
  const [checkedB, setCheckedB] = useState(true);
  const [indeterminateB, setIndeterminateB] = useState(true);

  return (
    <ShowcaseSection
      id="form-controls"
      title="Form Controls (<Input />, <Select />, <Textarea />, <Checkbox />)"
      description="Accessible form primitives enforcing explicit label bindings and keyboard interactions"
    >
      <div className="ui-grid ui-grid-cols-4">
        <Input
          id="sample-text"
          label="Student Name"
          placeholder="e.g. Alex Morgan"
        />

        <Select
          id="sample-select"
          label="Program Department"
          defaultValue="cs"
          options={[
            { value: 'cs', label: 'BS Computer Science' },
            { value: 'is', label: 'BS Information Systems' },
            { value: 'it', label: 'BS Information Technology' },
            { value: 'ds', label: 'BS Data Science' },
            { value: 'ai', label: 'BS Artificial Intelligence' },
            { value: 'cy', label: 'BS Cybersecurity' },
          ]}
        />

        <Input
          id="sample-search"
          type="search"
          label="Search Records"
          placeholder="Search roster or IDs..."
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.33" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" />
            </svg>
          }
        />

        <div className="ui-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
          <span className="ui-form-label">Checkbox States (&lt;Checkbox /&gt;)</span>
          <Checkbox
            label="Checked Selection"
            checked={checkedA}
            onChange={(e) => setCheckedA(e.target.checked)}
          />
          <Checkbox
            label="Indeterminate Bulk State"
            variant="neutral"
            indeterminate={indeterminateB}
            onIndeterminateChange={setIndeterminateB}
            checked={checkedB}
            onChange={(e) => {
              setIndeterminateB(false);
              setCheckedB(e.target.checked);
            }}
          />
        </div>

        <div className="is-e86cdd0">
          <Textarea
            id="sample-notes"
            label="Review Assessment Notes"
            className="is-6f0a953"
            placeholder="Provide detailed evaluation feedback..."
            resize="vertical"
          />
        </div>

        <div className="ui-btn-row is-e86cdd0">
          <TypographyText variant="label">Standard Portal Table Controls Toolbar (&lt;TableControlsToolbar /&gt;)</TypographyText>
          <TableControlsToolbar onAddRecord={onAddRecord} />
          <TypographyText variant="caption">
            Unified control bar component combining search input, department/status filter selects, and <code>&lt;Button variant="add" /&gt;</code>.
          </TypographyText>
        </div>
      </div>
    </ShowcaseSection>
  );
}

export function FormsClassifiedPage() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <ComponentCategoryLayout
      activeSlug="forms"
      title="Form Controls & Filter Toolbars"
      subtitle="Accessible <Input />, <Select />, <Textarea />, <Checkbox />, <Label />, and <TableControlsToolbar /> components."
    >
      <FormControlsShowcaseSection onAddRecord={() => setModalOpen(true)} />
      <AdminEntityModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </ComponentCategoryLayout>
  );
}

/* ============================================================================
 * 4. CARDS PAGE (/components/cards) - <Card />, <KpiMetricCard />, <QueueMetricsGrid />, <SystemActivityLog />
 * ============================================================================ */
export function CardsShowcaseSection() {
  const { openQueue } = useQueueSearchParam();
  const [isCardLoading, setIsCardLoading] = useState(false);
  const [cardLoadingLabel, setCardLoadingLabel] = useState('Simulate Skeleton Loading (280ms)');
  const [cardLoadingStatus, setCardLoadingStatus] = useState('Preview loading without changing card dimensions.');

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

  const counts = {
    student: QUEUE_FIXTURES.student.length,
    department: QUEUE_FIXTURES.department.length,
    program: QUEUE_FIXTURES.program.length,
    faculty: QUEUE_FIXTURES.faculty.length,
  };

  return (
    <ShowcaseSection
      id="cards"
      title="Cards, KPI Metrics & Activity Logs"
      description="Container primitives: <Card />, <KpiMetricCard />, <InteractiveLinkCard />, <QueueMetricsGrid />, and <SystemActivityLog />"
    >
      <SkeletonDemoToolbar
        isLoading={isCardLoading}
        onSimulate={handleSimulateCardLoading}
        statusId="demo-card-loading-status"
        buttonId="demo-simulate-card-loading-btn"
        labelId="demo-card-loading-label"
        ariaControls="demo-card-loading-grid"
        statusText={cardLoadingStatus}
        buttonLabel={cardLoadingLabel}
      />

      <div className="ui-grid ui-grid-cols-3" id="demo-card-loading-grid" style={{ marginBottom: '28px' }}>
        <Card isLoading={isCardLoading}>
          <CardHeader>
            <CardTitle>Standard Card</CardTitle>
            <CardDescription>Default <code>&lt;Card /&gt;</code> container for details and panels.</CardDescription>
          </CardHeader>
          <CardContent>
            <TypographyText>
              This card serves as the standard container for panels, detail views, and forms.
              It uses <code>var(--card)</code> surface with a subtle <code>var(--border)</code> outline.
            </TypographyText>
          </CardContent>
          <CardFooter>
            <TypographyText variant="muted">Updated 10m ago</TypographyText>
          </CardFooter>
        </Card>

        <KpiMetricCard
          label="KPI Metric Card (<KpiMetricCard />)"
          value="2,850"
          trend="↗ +12.5%"
          status="AY 2026-2027"
          description="Compact metric summary for dashboard statistics."
          isLoading={isCardLoading}
        />

        <InteractiveLinkCard
          title="Interactive Card Link"
          badgeText="Link"
          description={<><code>&lt;InteractiveLinkCard /&gt;</code> directly on an anchor element.</>}
          bodyText="Hover over this card to view the smooth interactive transition effect. Supports keyboard focus indicators."
          footerText="Explore workspace"
          isLoading={isCardLoading}
        />
      </div>

      {/* Dashboard Metric Cards (<QueueMetricsGrid />) */}
      <div style={{ marginBottom: '28px' }}>
        <TypographyText variant="label" style={{ display: 'block', marginBottom: '12px' }}>
          Pending Approval Queue Summary Cards (&lt;QueueMetricCard /&gt; &amp; &lt;QueueMetricsGrid /&gt;)
        </TypographyText>
        <QueueMetricsGrid counts={counts} onOpenQueue={openQueue} />
      </div>

      {/* System Activity Log (<SystemActivityLog />) */}
      <div>
        <TypographyText variant="label" style={{ display: 'block', marginBottom: '12px' }}>
          System Activity Log Component (&lt;SystemActivityLog /&gt;)
        </TypographyText>
        <SystemActivityLog />
      </div>
    </ShowcaseSection>
  );
}

export function CardsClassifiedPage() {
  return (
    <ComponentCategoryLayout
      activeSlug="cards"
      title="Cards, KPI Metrics & Activity Logs"
      subtitle="Reusable <Card />, <KpiMetricCard />, <InteractiveLinkCard />, <QueueMetricsGrid />, and <SystemActivityLog /> components."
    >
      <CardsShowcaseSection />
    </ComponentCategoryLayout>
  );
}

/* ============================================================================
 * 5. TABLES PAGE (/components/tables) - <DataTable />, <RejectionRow />, <EmptyState />, <ApplicationQueue />
 * ============================================================================ */
export function DataTablesShowcaseSection() {
  const [students, setStudents] = useState<RosterStudent[]>(ROSTER_STUDENTS);
  const [rejectingRowId, setRejectingRowId] = useState<string | null>(null);
  const [showEmptyDemo, setShowEmptyDemo] = useState(false);
  const [isTableSkeleton, setIsTableSkeleton] = useState(false);

  const columns: DataTableColumn<RosterStudent>[] = [
    {
      key: 'name',
      label: 'Student',
      render: (student) => <StudentIdentityCell name={student.name} email={student.email} />,
    },
    {
      key: 'id',
      label: 'Student ID',
      colClass: 'col-id',
      render: (student) => (
        <TypographyNumber data-student-id={student.id}>
          {student.id}
        </TypographyNumber>
      ),
    },
    { key: 'program', label: 'Program' },
    {
      key: 'yearLevel',
      label: 'Year Level',
      render: (student) => <TypographyNumber>{student.yearLevel}</TypographyNumber>,
    },
    {
      key: 'status',
      label: 'Status',
      headerClass: 'ui-table-heading-center',
      render: (student) => <Badge variant={student.statusVariant}>{student.statusLabel}</Badge>,
    },
    {
      key: 'action',
      label: 'Action',
      colClass: 'col-action',
      headerClass: 'col-action ui-table-heading-center',
      render: (student) => (
        <div className="ui-table-actions" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="is-d8d7a34">View</Button>
          <Button
            variant="reject"
            size="sm"
            onClick={() => setRejectingRowId((prev) => (prev === student.id ? null : student.id))}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ShowcaseSection
      id="data-tables"
      title="Data Tables, Full-Width RejectionRow & EmptyState"
      description="Stateful <DataTable /> with pagination, shimmer loading, <RejectionRow />, and <EmptyState />"
    >
      <div className="is-bd0475c" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="is-02ab777" style={{ fontSize: '13px', color: 'var(--foreground)' }}>
            Entries: <strong><TypographyNumber>{students.length}</TypographyNumber></strong>
          </span>
          <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>| Test Tiers:</span>
          <Button
            variant={students.length >= 20 ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStudents(ROSTER_STUDENTS)}
          >
            24 Entries (&ge;20: 5, 10, 20)
          </Button>
          <Button
            variant={students.length >= 10 && students.length < 20 ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStudents(ROSTER_STUDENTS.slice(0, 14))}
          >
            14 Entries (10&ndash;19: 5, 10)
          </Button>
          <Button
            variant={students.length <= 9 ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStudents(ROSTER_STUDENTS.slice(0, 8))}
          >
            8 Entries (&le;9: Disabled)
          </Button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            id="demo-simulate-skeleton-btn"
            variant="outline"
            className="ui-demo-simulate-button"
            disabled={isTableSkeleton}
            onClick={() => {
              setIsTableSkeleton(true);
              setTimeout(() => setIsTableSkeleton(false), 280);
            }}
          >
            Simulate Skeleton (280ms)
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowEmptyDemo((p) => !p)}
          >
            {showEmptyDemo ? 'Show Populated DataTable' : 'Preview EmptyState Banner'}
          </Button>
        </div>
      </div>

      {showEmptyDemo ? (
        <EmptyState
          title="No records matching your search or filters found."
          description="Try adjusting your query or resetting the active filters."
          action={
            <Button
              variant="empty-reset"
              onClick={() => {
                setShowEmptyDemo(false);
                setStudents(ROSTER_STUDENTS);
              }}
            >
              Clear all filters
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={students}
          getRowId={(r) => r.id}
          isLoading={isTableSkeleton}
          activeRejectionRowId={rejectingRowId}
          onCancelRejection={() => setRejectingRowId(null)}
          onConfirmRejection={(_reason, ids) => {
            const drop = new Set(ids);
            setStudents((prev) => prev.filter((s) => !drop.has(s.id)));
            setRejectingRowId(null);
          }}
        />
      )}

      <div style={{ marginTop: '24px' }}>
        <TypographyText variant="label" style={{ display: 'block', marginBottom: '8px' }}>
          Standalone Inline Rejection Row Preview (&lt;RejectionRow /&gt;)
        </TypographyText>
        <RejectionRow
          standalone
          asTableRow={false}
          onCancel={() => {}}
          onConfirm={() => {}}
        />
      </div>
    </ShowcaseSection>
  );
}

export function TablesClassifiedPage() {
  const [activeQueueTab, setActiveQueueTab] = useState<'student' | 'department' | 'program' | 'faculty'>('department');

  return (
    <ComponentCategoryLayout
      activeSlug="tables"
      title="Data Tables, RejectionRow & Application Queues"
      subtitle="Interactive <DataTable />, full-width <RejectionRow />, <EmptyState />, and <ApplicationQueue /> components."
    >
      <DataTablesShowcaseSection />

      <ShowcaseSection
        title="ApplicationQueue Component (<ApplicationQueue />)"
        description="Reusable approval queue table supporting Student, Department, Program, and Faculty applications"
      >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {(['department', 'program', 'student', 'faculty'] as const).map((q) => (
            <Button
              key={q}
              variant={activeQueueTab === q ? 'primary' : 'outline'}
              onClick={() => setActiveQueueTab(q)}
            >
              {QUEUE_TITLES[q]}
            </Button>
          ))}
        </div>
        <ApplicationQueue key={activeQueueTab} type={activeQueueTab} isModal={false} />
      </ShowcaseSection>
    </ComponentCategoryLayout>
  );
}

/* ============================================================================
 * 6. NAVIGATION PAGE (/components/navigation) - Sidebars, Header, Footers
 * ============================================================================ */
export function SidebarsShowcaseSection({ onOpenLogout }: { onOpenLogout?: () => void }) {
  const [adminKey, setAdminKey] = useState<any>('dashboard');
  const [facultyKey, setFacultyKey] = useState<any>('dashboard');

  return (
    <ShowcaseSection
      id="portal-sidebars"
      title="Portal Sidebars (<AdminSidebar /> & <FacultySidebar />)"
      description="Docked 260px navigation sidebars with active state highlights, user profile card, and logout confirmation trigger"
    >
      <div className="ui-grid ui-grid-cols-2" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
        <Card style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', marginBottom: '0.75rem' }}>
            <TypographyText variant="label">Admin Sidebar Component (&lt;AdminSidebar /&gt;)</TypographyText>
          </div>
          <AdminSidebar
            embedded
            activeKey={adminKey}
            onSelectNav={(k) => setAdminKey(k)}
            onLogoutClick={onOpenLogout}
          />
        </Card>

        <Card style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', marginBottom: '0.75rem' }}>
            <TypographyText variant="label">Faculty Sidebar Component (&lt;FacultySidebar /&gt;)</TypographyText>
          </div>
          <FacultySidebar
            embedded
            activeKey={facultyKey}
            onSelectNav={(k) => setFacultyKey(k)}
            onLogoutClick={onOpenLogout}
          />
        </Card>
      </div>
    </ShowcaseSection>
  );
}

export function WorkspaceFrameShowcaseSection({ onShowToast }: { onShowToast?: (msg: string) => void }) {
  return (
    <ShowcaseSection
      id="workspace-frame"
      title="Workspace Frame (<PortalStatusHeaderBar />, <Toast /> & <PortalFooter />)"
      description="Unified viewport frame primitives: status header bar, notification toasts, and docked footer"
    >
      <div className="ui-grid ui-grid-cols-2 is-ffdb8e7">
        <Card className="is-03e275d">
          <TypographyText variant="label">Portal Status Header Bar (&lt;PortalStatusHeaderBar /&gt;)</TypographyText>
          <div className="ui-workspace-surface is-24ba48f">
            <PortalStatusHeaderBar breadcrumb="Workspace / Overview" statusText="System Live" academicYear="AY 2026-2027" />
            <div className="is-469b292">&darr; Page content and tables sit below this header bar</div>
          </div>
          <TypographyText variant="caption">
            Pinned at the top of portal viewports with live operational status badge.
          </TypographyText>
        </Card>

        <Card className="is-03e275d">
          <TypographyText variant="label">Toast Notification Primitive (&lt;Toast /&gt;)</TypographyText>
          <div className="is-1dac0b9">
            <Button
              id="demo-show-toast-btn"
              variant="add"
              className="is-b5fea39"
              onClick={() => onShowToast?.('Operation executed successfully! Record updated.')}
            >
              Trigger Success Toast
            </Button>
          </div>
          <Toast inline message="Application Action Completed Successfully" />
          <TypographyText variant="caption">
            Fixed toast positioned at the bottom right with automatic timeout and screen reader announcements.
          </TypographyText>
        </Card>

        <Card className="is-a6b38e2">
          <TypographyText variant="label">Pinned Viewport Workspace Footer (&lt;PortalFooter /&gt;)</TypographyText>
          <div className="ui-workspace-surface ui-workspace-footer-preview is-abb9727">
            <div className="is-0eeaf53">&uarr; Scrollable workspace content sits above this footer</div>
            <PortalFooter className="is-e8a73a1" />
          </div>
          <TypographyText variant="caption">
            Integrated into the bottom of the workspace canvas via <code>&lt;PortalFooter /&gt;</code>.
          </TypographyText>
        </Card>
      </div>
    </ShowcaseSection>
  );
}

export function NavigationClassifiedPage() {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <ComponentCategoryLayout
      activeSlug="navigation"
      title="Sidebars, Header Bar & Footers"
      subtitle="Reusable <AdminSidebar />, <FacultySidebar />, <PortalStatusHeaderBar />, and <PortalFooter /> components."
    >
      <SidebarsShowcaseSection onOpenLogout={() => setLogoutOpen(true)} />
      <WorkspaceFrameShowcaseSection
        onShowToast={(msg) => {
          setToast(msg);
          setTimeout(() => setToast(null), 2500);
        }}
      />
      <LogoutModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} />
      <Toast message={toast} />
    </ComponentCategoryLayout>
  );
}

/* ============================================================================
 * 7. MODALS PAGE (/components/modals) - QueueModal, LogoutModal, Admin/Faculty Modals
 * ============================================================================ */
export function ModalsShowcaseSection({
  onOpenAdminModal,
  onOpenRemoveModal,
  onOpenFacultyModal,
  onOpenLogoutModal,
}: {
  onOpenAdminModal: () => void;
  onOpenRemoveModal: () => void;
  onOpenFacultyModal: () => void;
  onOpenLogoutModal: () => void;
}) {
  const { openQueue } = useQueueSearchParam();

  return (
    <ShowcaseSection
      id="portal-modals"
      title="Portal Modals & Confirmation Dialogs"
      description="Accessible modal components: <QueueModal />, <LogoutModal />, <AdminEntityModal />, <RemoveConfirmationModal />, and <FacultyProposalDialog />"
    >
      <div className="ui-grid ui-grid-cols-2 is-ffdb8e7">
        <Card className="is-03e275d">
          <div className="is-948e6d6" style={{ marginBottom: '14px' }}>
            <TypographyText variant="label" style={{ fontSize: '15px', fontWeight: 700 }}>
              Modal Trigger Buttons (All Component Calls)
            </TypographyText>
            <TypographyText variant="caption" style={{ display: 'block', marginTop: '2px' }}>
              Consolidated launchpad triggering every modal component across Admin, Faculty, and Approval Queue workflows.
            </TypographyText>
          </div>

          <ShowcaseGroupCard
            label="Admin Portal Modals (<AdminEntityModal /> & <RemoveConfirmationModal />)"
            style={{ marginBottom: '14px' }}
          >
            <Button id="demo-open-admin-modal-btn" variant="add" className="is-ebaa71c" onClick={onOpenAdminModal}>
              Open Admin Modal
            </Button>
            <Button id="demo-open-remove-modal-btn" variant="outline" className="is-ebaa71c" onClick={onOpenRemoveModal}>
              Open Remove Modal
            </Button>
          </ShowcaseGroupCard>

          <ShowcaseGroupCard
            label="Faculty Portal Modal (<FacultyProposalDialog />)"
            style={{ marginBottom: '14px' }}
          >
            <Button id="demo-open-faculty-modal-btn" variant="add" className="is-ebaa71c" onClick={onOpenFacultyModal}>
              Open Faculty Modal
            </Button>
          </ShowcaseGroupCard>

          <ShowcaseGroupCard
            label="Approval Queue Modals (<QueueModal /> URL Route-Backed)"
            style={{ marginBottom: '14px' }}
          >
            <Button variant="add" className="is-ebaa71c" onClick={() => openQueue('department')}>
              Department Queue
            </Button>
            <Button variant="outline" className="is-ebaa71c" onClick={() => openQueue('program')}>
              Program Queue
            </Button>
            <Button variant="outline" className="is-ebaa71c" onClick={() => openQueue('student')}>
              Student Queue
            </Button>
            <Button variant="outline" className="is-ebaa71c" onClick={() => openQueue('faculty')}>
              Faculty Queue
            </Button>
          </ShowcaseGroupCard>

          <ShowcaseGroupCard label="Session & Security Dialog (<LogoutModal />)">
            <Button
              id="demo-open-logout-btn"
              variant="outline"
              className="is-ebaa71c"
              data-open-logout-demo
              onClick={onOpenLogoutModal}
            >
              Open Logout Dialog
            </Button>
          </ShowcaseGroupCard>
        </Card>

        <Card className="is-03e275d">
          <div className="is-948e6d6" style={{ marginBottom: '14px' }}>
            <TypographyText variant="label" style={{ fontSize: '15px', fontWeight: 700 }}>
              Alert Banner Primitives (&lt;Alert /&gt;)
            </TypographyText>
            <TypographyText variant="caption" style={{ display: 'block', marginTop: '2px' }}>
              Used inside confirmation and creation modals.
            </TypographyText>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Alert
              variant="info"
              title="Confirm Addition"
              description="You are about to add this department record. Review the details below before proceeding."
            />
            <Alert
              variant="warning"
              title="Confirm Removal"
              description="Are you sure you want to remove this department? This action cannot be undone."
            />
          </div>
        </Card>
      </div>
    </ShowcaseSection>
  );
}

export function ModalsClassifiedPage() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [facultyOpen, setFacultyOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <ComponentCategoryLayout
      activeSlug="modals"
      title="Modals, Queue Dialogs & Alerts"
      subtitle="URL-synchronized <QueueModal />, <LogoutModal />, <AdminEntityModal />, <RemoveConfirmationModal />, and <FacultyProposalDialog />."
    >
      <ModalsShowcaseSection
        onOpenAdminModal={() => setAdminOpen(true)}
        onOpenRemoveModal={() => setRemoveOpen(true)}
        onOpenFacultyModal={() => setFacultyOpen(true)}
        onOpenLogoutModal={() => setLogoutOpen(true)}
      />
      <AdminEntityModal open={adminOpen} onClose={() => setAdminOpen(false)} onSuccess={showToast} />
      <RemoveConfirmationModal
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={() => showToast('Department record permanently removed.')}
      />
      <FacultyProposalDialog open={facultyOpen} onClose={() => setFacultyOpen(false)} onSuccess={showToast} />
      <LogoutModal
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => showToast('Logged out of session.')}
      />
      <Toast message={toast} />
    </ComponentCategoryLayout>
  );
}

/* ============================================================================
 * 8. COLORS & TYPOGRAPHY PAGE (/components/colors-typography)
 * ============================================================================ */
export function ColorsAndTypographyShowcaseSection() {
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [textLoadingLabel, setTextLoadingLabel] = useState('Simulate Skeleton Loading (280ms)');
  const [textLoadingStatus, setTextLoadingStatus] = useState('Preview loading without changing text spacing.');

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

  return (
    <>
      <ShowcaseSection
        id="color-palette"
        title="Color Palette (<ColorSwatchCard />)"
        description="OKLCH dynamic tokens adapting automatically between Light and Dark mode"
      >
        <div className="ui-grid ui-grid-cols-4">
          <ColorSwatchCard name="Primary Accent" variable="var(--primary)" role="Terracotta Action (#D97251)" swatchClassName="is-723357a" />
          <ColorSwatchCard name="App Background" variable="var(--background)" role="Paper (Light) / Charcoal (Dark)" swatchClassName="is-7c7c114" />
          <ColorSwatchCard name="Card Surface" variable="var(--card)" role="Container Surface" swatchClassName="is-51d61e6" />
          <ColorSwatchCard name="Border & Dividers" variable="var(--border)" role="Subtle Framing" swatchClassName="is-8b2bed2" />
          <ColorSwatchCard name="Muted Surface" variable="var(--muted)" role="Inputs & Recessed Areas" swatchClassName="is-0df57ad" />
          <ColorSwatchCard name="Foreground Text" variable="var(--foreground)" role="High Contrast Content" swatchClassName="is-04bdb5e" />
          <ColorSwatchCard name="Muted Foreground" variable="var(--muted-foreground)" role="Secondary Labels" swatchClassName="is-915cf5f" />
          <ColorSwatchCard name="Destructive" variable="var(--destructive)" role="Alerts & Delete (#DC2626)" swatchClassName="is-b8a4cfc" />
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        id="typography"
        title="Typography (<TypographyHeading /> & <TypographyText />)"
        description="Outfit font family for interface typography and tabular data numerals"
      >
        <SkeletonDemoToolbar
          isLoading={isTextLoading}
          onSimulate={handleSimulateTextLoading}
          statusId="demo-text-loading-status"
          buttonId="demo-simulate-text-loading-btn"
          labelId="demo-text-loading-label"
          ariaControls="demo-text-loading-grid"
          statusText={textLoadingStatus}
          buttonLabel={textLoadingLabel}
        />

        <div className="ui-grid ui-grid-cols-2" id="demo-text-loading-grid">
          <div className="ui-typography-sample">
            <TypographyText variant="label" isLoading={isTextLoading}>Headings Scale</TypographyText>
            <div>
              <TypographyHeading level={1} isLoading={isTextLoading}>Primary Heading 1 (Display Title)</TypographyHeading>
              <TypographyText variant="caption" isLoading={isTextLoading}>
                30px &middot; Font-weight 800 &middot; Letter-spacing -0.025em &middot; <code>var(--foreground)</code>
              </TypographyText>
            </div>
            <div>
              <TypographyHeading level={2} isLoading={isTextLoading}>Secondary Heading 2 (Section Title)</TypographyHeading>
              <TypographyText variant="caption" isLoading={isTextLoading}>
                22px &middot; Font-weight 700 &middot; Letter-spacing -0.02em &middot; <code>var(--foreground)</code>
              </TypographyText>
            </div>
            <div>
              <TypographyHeading level={3} isLoading={isTextLoading}>Tertiary Heading 3 (Card &amp; Panel Header)</TypographyHeading>
              <TypographyText variant="caption" isLoading={isTextLoading}>
                18px &middot; Font-weight 600 &middot; <code>var(--card-foreground)</code>
              </TypographyText>
            </div>
          </div>

          <div className="ui-typography-sample">
            <TypographyText variant="label" isLoading={isTextLoading}>Paragraph &amp; Muted Hierarchy</TypographyText>
            <div>
              <TypographyHeading level={3} isLoading={isTextLoading}>Primary Paragraph Text</TypographyHeading>
              <TypographyText variant="default" isLoading={isTextLoading} skeletonLines={2}>
                SPMIS provides a unified academic progress management portal with warm surfaces and clear hierarchy.
                Primary text is styled with <code>var(--foreground)</code> to maintain optimal readability and comfortable contrast.
              </TypographyText>
            </div>
            <div>
              <TypographyHeading level={3} isLoading={isTextLoading}>Muted Descriptive Text</TypographyHeading>
              <TypographyText variant="muted" isLoading={isTextLoading} skeletonLines={2}>
                Secondary details, audit timestamps, and status explanations utilize <code>var(--muted-foreground)</code>
                to establish quiet visual depth without distracting from critical operational data.
              </TypographyText>
            </div>
            <div>
              <TypographyHeading level={3} isLoading={isTextLoading}>Tabular Data &amp; Numbers</TypographyHeading>
              <TypographyText variant="default" isLoading={isTextLoading}>
                Student ID: <TypographyNumber>24-1-00001</TypographyNumber> &middot; Roster Count: <TypographyNumber>2,850</TypographyNumber> &middot; Status: VERIFIED_OK
              </TypographyText>
            </div>
          </div>
        </div>
      </ShowcaseSection>
    </>
  );
}

export function ColorsTypographyClassifiedPage() {
  return (
    <ComponentCategoryLayout
      activeSlug="colors-typography"
      title="Colors & Typography Primitives"
      subtitle="Dynamic OKLCH <ColorSwatchCard />, <TypographyHeading />, and <TypographyText /> components."
    >
      <ColorsAndTypographyShowcaseSection />
    </ComponentCategoryLayout>
  );
}

/* ============================================================================
 * 9. CHATS & AUTH PAGE (/components/chats-auth)
 * ============================================================================ */
export function ChatsAndAuthShowcaseSection({ onShowToast }: { onShowToast?: (msg: string) => void }) {
  return (
    <>
      <ShowcaseSection
        id="chats"
        title="AI Evaluation Chat (<ChatAssistantWidget />)"
        description="Explore attributed reviews across students in one conversation with live prompt dispatch and student context synthesis"
      >
        <ChatAssistantWidget onNavigateProfile={(id) => onShowToast?.(`Navigating to profile for student ID ${id}...`)} />
      </ShowcaseSection>

      <ShowcaseSection
        id="auth-cards"
        title="Authentication & Account Cards (<AuthCardShowcase />)"
        description="Sign In and brand split card composed of <Button />, <Input />, and <Checkbox />"
      >
        <AuthCardShowcase onSuccess={onShowToast} />
      </ShowcaseSection>
    </>
  );
}

export function ChatsAuthClassifiedPage() {
  const [toast, setToast] = useState<string | null>(null);
  return (
    <ComponentCategoryLayout
      activeSlug="chats-auth"
      title="AI Chat & Authentication Components"
      subtitle="Reusable <ChatAssistantWidget /> and <AuthCardShowcase /> built from atomic UI primitives."
    >
      <ChatsAndAuthShowcaseSection
        onShowToast={(msg) => {
          setToast(msg);
          setTimeout(() => setToast(null), 2500);
        }}
      />
      <Toast message={toast} />
    </ComponentCategoryLayout>
  );
}

