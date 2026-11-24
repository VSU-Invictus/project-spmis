import AuthInfoPageLayout from './AuthInfoPageLayout';

export default function AboutPage() {
  return (
    <AuthInfoPageLayout title="About us">
      <section className="auth-info-copy">
        <h2 className="auth-info-section-title first">About SPMIS</h2>
        <p>The Student Profiling Management Information System (SPMIS) is a dedicated, university-wide platform built to empower faculty members in supporting student success. SPMIS serves as an internal reference tool designed to assist faculty in vetting, recommending, and selecting students for competitions, leadership roles, special tasks, academic opportunities, and institutional events.</p>

        <h2 className="auth-info-section-title">Our Purpose &amp; Vision</h2>
        <p>SPMIS bridges the gap between faculty experience and student opportunities. By allowing educators to share, record, and consult review-style observations about students they have taught, coached, or advised, the system enables more informed, holistic decision-making across the university. SPMIS focuses purely on profile insights and faculty research—it is not a student-facing portal nor an activity management application.</p>

        <h2 className="auth-info-section-title">Key Features &amp; Platform Safeguards</h2>
        <ul>
          <li><strong>Faculty-Driven Insights:</strong> Reviews reflect direct faculty experiences, combining free-text observations with descriptive tags. To maintain accountability and trust, contributor identities are transparently attached to every review.</li>
          <li><strong>Complete Contributor Control:</strong> Faculty members retain exclusive ownership over the content they create. You can edit, hide, or permanently delete your reviews at any time. Hidden reviews are strictly private to the creator, while deleted content is permanently purged from the application.</li>
          <li><strong>Privacy by Design:</strong> SPMIS is built around strong privacy standards. Review edit histories are transparently maintained, while system actions are audited without exposing protected review text. Students do not have access or accounts within the system.</li>
          <li><strong>Privacy-Preserving AI Research:</strong> SPMIS includes an integrated AI research assistant to help faculty search across visible reviews. Before any review content reaches external AI processing, all student name variants are replaced with opaque placeholder identifiers inside the system boundary to safeguard student identity. Hidden and deleted reviews are strictly excluded from the AI index.</li>
        </ul>

        <h2 className="auth-info-section-title">Our Commitment to Responsible Use</h2>
        <p>SPMIS is built for legitimate academic and institutional growth. By using the platform, faculty commit to maintaining student privacy, exercising professional judgment, and leveraging system insights responsibly to help every student find the right opportunity to excel.</p>
      </section>
    </AuthInfoPageLayout>
  );
}
