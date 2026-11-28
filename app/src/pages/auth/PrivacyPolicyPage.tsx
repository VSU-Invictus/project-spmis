import AuthInfoPageLayout from './AuthInfoPageLayout';

const sections = [
  {
    title: '1. Information We Collect',
    items: [
      ['Faculty Account & Profile Data:', 'Directory information (e.g., name, university email, department) required for account authentication and administrator verification.'],
      ['Faculty Review Data:', 'Review-style observations, qualitative evaluations, performance tags, and direct feedback contributed by faculty members regarding students they have taught, coached, or advised.'],
      ['Audit & Activity Logs:', 'System action logs (such as timestamps of review creation, edits, hiding, or deletion) to maintain system integrity and accountability.'],
    ],
  },
  {
    title: '2. How Information Is Used',
    items: [
      ['Institutional Decision-Making:', 'To assist faculty in evaluating, recommending, and vetting candidates for academic tasks, competitions, leadership roles, and institutional opportunities.'],
      ['AI-Assisted Research:', 'To enable faculty to search and reason across visible review data using an integrated AI chatbot.'],
      ['System Transparency:', 'To maintain audit trails and edit histories visible to authorized users.'],
    ],
  },
  {
    title: '3. Data Privacy & Student Identity Safeguards',
    items: [
      ['Internal De-Identification Boundary:', 'Prior to sending any review text to external AI processing services, SPMIS automatically replaces all known student name variants with opaque placeholder identifiers.'],
      ['External AI Safeguards:', 'Original review text containing direct student names is never transmitted outside the system boundary.'],
      ['Data Minimization Guidelines:', 'Faculty contributors are expected to avoid including unnecessary third-party names, physical descriptions, or specific identifying details in free-text fields.'],
      ['Non-Student Access:', 'Students do not have accounts, login privileges, or direct access to SPMIS or its review corpus.'],
    ],
  },
  {
    title: '4. Contributor Ownership & Visibility Controls',
    items: [
      ['Exclusive Control:', 'Faculty retain complete ownership over their own reviews. You may edit, hide, unhide, or permanently delete your contributions at any time.'],
      ['Hidden Content:', 'Hiding a review renders it visible only to you. Hidden reviews are completely excluded from search results and the AI research index.'],
      ['Deletion & Administrative Limits:', 'Deleting a review permanently purges the content from the application interface. System Administrators cannot view, edit, or recover deleted content, nor can they alter another faculty member’s reviews.'],
    ],
  },
  {
    title: '5. Data Retention & System Auditing',
    items: [
      ['Edit History:', 'Modifications to reviews preserve an edit history visible to users who hold permission to view the review.'],
      ['Audit Trails:', 'Administrative and mutation events (such as hide, unhide, or delete actions) are recorded for security and accountability without revealing protected or deleted review text.'],
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <AuthInfoPageLayout title="Privacy Policy">
      <section className="auth-info-copy">
        <h2 className="auth-info-section-title first">SPMIS Privacy Policy</h2>
        <p>This Privacy Policy explains how the Student Profiling Management Information System (SPMIS) collects, uses, protects, and handles information contributed by faculty and stored within the platform.</p>
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="auth-info-section-title">{section.title}</h2>
            <ul>{section.items.map(([label, text]) => <li key={label}><strong>{label}</strong> {text}</li>)}</ul>
          </section>
        ))}
        <h2 className="auth-info-section-title">6. Policy Updates &amp; Contact</h2>
        <p>System Administrators reserve the right to update this policy as institutional needs or safety safeguards evolve. For questions regarding account verification or privacy practices, please contact your university’s SPMIS System Administrator.</p>
      </section>
    </AuthInfoPageLayout>
  );
}
