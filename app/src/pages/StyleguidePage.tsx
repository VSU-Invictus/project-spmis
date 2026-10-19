import { useState, useEffect } from 'react';
import {
  StyleguideTopBar,
  StyleguideHeroHeader,
  CategoryQuickNav,
  StyleguideFooter,
  QueueModal,
  QUEUE_TITLES,
  useQueueSearchParam,
  ApplicationQueue,
  AdminEntityModal,
  RemoveConfirmationModal,
  FacultyProposalDialog,
  LogoutModal,
  Toast,
} from '../components/ui';
import {
  COMPONENT_CATEGORIES,
  ColorsAndTypographyShowcaseSection,
  BadgesShowcaseSection,
  ButtonsShowcaseSection,
  FormControlsShowcaseSection,
  CardsShowcaseSection,
  DataTablesShowcaseSection,
  SidebarsShowcaseSection,
  ModalsShowcaseSection,
  ChatsAndAuthShowcaseSection,
  WorkspaceFrameShowcaseSection,
} from './ClassifiedComponentPages';

import '../../../mockup/assets/css/design-system.css';
import '../../../mockup/assets/css/global.css';
import '../../../mockup/assets/css/components.css';
import '../../../mockup/assets/css/queue-modal.css';
import '../../../mockup/assets/css/pages/design-system.css';

export default function StyleguidePage() {
  const { queue, closeQueue } = useQueueSearchParam();
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [facultyModalOpen, setFacultyModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <div className="ui-styleguide">
        {/* Top Workspace Header Bar with Theme Switcher Component */}
        <StyleguideTopBar
          breadcrumbs={[
            { label: 'SPMIS DESIGN SYSTEM', to: '/' },
            { label: 'LIVING STYLE GUIDE' },
          ]}
          statusText="Claude+ Standard"
        />

        {/* Page Title & Overview */}
        <StyleguideHeroHeader
          title="Claude+ Living Style Guide"
          subtitle={
            <>
              Interactive visualization and component reference for the Claude+ React design system.
              Every primitive below is a modular React component supporting <strong>Light Mode</strong> and{' '}
              <strong>Dark Mode</strong> with unified <code>.ui-*</code> class architecture. Click any classified
              category below to inspect its dedicated component page.
            </>
          }
        />

        {/* Classified Component Pages Navigation Bar */}
        <CategoryQuickNav
          ariaLabel="Classified Component Pages"
          items={COMPONENT_CATEGORIES.map((cat) => ({
            id: cat.slug,
            title: <>{cat.label} &rarr;</>,
            path: `/components/${cat.slug}`,
          }))}
        />

        {/* 1 & 2. Color Palette & Typography Components */}
        <ColorsAndTypographyShowcaseSection />

        {/* 3. Status Badges & TagCluster Components */}
        <BadgesShowcaseSection />

        {/* 4. Buttons & ActionLink Components */}
        <ButtonsShowcaseSection onShowToast={showToast} />

        {/* 5. Form Controls & TableControlsToolbar Components */}
        <FormControlsShowcaseSection onAddRecord={() => setAdminModalOpen(true)} />

        {/* 6. Cards, KPI Metrics, QueueMetricsGrid & SystemActivityLog Components */}
        <CardsShowcaseSection />

        {/* 7. DataTable, RejectionRow & EmptyState Components */}
        <DataTablesShowcaseSection />

        {/* 8. AdminSidebar & FacultySidebar Components */}
        <SidebarsShowcaseSection onOpenLogout={() => setLogoutDialogOpen(true)} />

        {/* 9. Portal Modals, QueueModal & LogoutModal Components */}
        <ModalsShowcaseSection
          onOpenAdminModal={() => setAdminModalOpen(true)}
          onOpenRemoveModal={() => setRemoveModalOpen(true)}
          onOpenFacultyModal={() => setFacultyModalOpen(true)}
          onOpenLogoutModal={() => setLogoutDialogOpen(true)}
        />

        {/* 10 & 11. ChatAssistantWidget & AuthCardShowcase Components */}
        <ChatsAndAuthShowcaseSection onShowToast={showToast} />

        {/* 12. Workspace Frame: PortalStatusHeaderBar, Toast & PortalFooter Components */}
        <WorkspaceFrameShowcaseSection onShowToast={showToast} />

        {/* Style Guide Footer Component */}
        <StyleguideFooter />
      </div>

      {/* ========================================================= */}
      {/* Reusable Modal, Dialog & Toast Components                 */}
      {/* ========================================================= */}
      <AdminEntityModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={showToast}
      />

      <RemoveConfirmationModal
        open={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        onConfirm={() => showToast('Department record permanently removed.')}
      />

      <FacultyProposalDialog
        open={facultyModalOpen}
        onClose={() => setFacultyModalOpen(false)}
        onSuccess={showToast}
      />

      <LogoutModal
        open={logoutDialogOpen}
        onCancel={() => setLogoutDialogOpen(false)}
        onConfirm={() => showToast('Logged out of session.')}
      />

      <QueueModal
        open={queue !== null}
        onClose={closeQueue}
        title={queue ? QUEUE_TITLES[queue] : ''}
      >
        {queue && <ApplicationQueue key={queue} type={queue} isModal={true} />}
      </QueueModal>

      <Toast message={toastMessage} />
    </>
  );
}

