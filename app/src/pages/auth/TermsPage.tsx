import AuthInfoPageLayout from './AuthInfoPageLayout';

const terms = [
  {
    title: '1. PURPOSE OF SPMIS',
    text: 'The Student Profiling Management Information System (SPMIS) is a university-wide system that allows faculty members to contribute review-style information about students they have taught, advised, coached, or otherwise worked with. The information in SPMIS is intended to support faculty in making decisions outside the system, including student selection, recommendation, and vetting for activities, competitions, events, tasks, and similar opportunities. SPMIS does not manage activities or opportunities themselves and is not a student-facing system.',
  },
  {
    title: '2. APPROPRIATE USE',
    text: 'SPMIS is intended for legitimate academic and institutional purposes. You agree to use information available through SPMIS responsibly and only for appropriate purposes. You must not use information in the system for unlawful, harmful, unauthorized, or otherwise inappropriate activities. You are responsible for exercising appropriate judgment when viewing, contributing, or using information obtained through SPMIS.',
  },
  {
    title: '3. REVIEW CONTRIBUTIONS',
    text: 'Reviews in SPMIS represent the contributor’s opinions and experiences based on their relationship with the student. Reviews are not verified factual records. A review may contain free-text observations and optional tags. Contributors should provide information that is relevant to their direct experience with the student. Contributor identity is always visible. SPMIS does not provide anonymous reviews.',
  },
  {
    title: '4. REVIEW VISIBILITY AND CONTROL',
    text: 'A faculty member retains exclusive control over the reviews they create. You may edit, hide, unhide, or delete your own reviews. Hiding a review is reversible. A hidden review is visible only to its owner and is excluded from student search results and AI-assisted research for other users. Deleting a review is irreversible within the SPMIS application. Deleted review content is no longer visible through the application, including to the review owner and System Administrators. System Administrators cannot modify, hide, unhide, or delete another faculty member’s review content.',
  },
  {
    title: '5. STUDENT PRIVACY',
    text: 'Do not include unnecessary identifying information about students or third parties in review text. SPMIS applies a de-identification process to review text before information is sent to its external AI provider. However, this process is a technical safeguard and is not a guarantee that every possible identifying detail can be removed. Contributors should therefore avoid unnecessary names, nicknames, physical descriptions, identifying circumstances, or other information that could unnecessarily identify a student or third party.',
  },
  {
    title: '6. AI DE-IDENTIFICATION NOTICE',
    text: 'SPMIS includes an AI chatbot that can reason across the visible review corpus to assist faculty with research. Before review text is sent to the external AI provider, known student name variants are replaced with an opaque placeholder identifier. The original review text is not sent directly to the external AI provider. Only de-identified review text is used for AI retrieval and generation. Hidden and deleted reviews are excluded from the AI index and are not used by the chatbot. The de-identification process is performed within SPMIS before information crosses the system boundary.',
  },
  {
    title: '7. AI-ASSISTED RESEARCH',
    text: 'The AI chatbot may be used to ask questions across visible faculty reviews, including questions that cannot easily be answered using structured filters. AI-generated responses are provided as an aid to faculty research and decision-making. Faculty members remain responsible for how information from SPMIS is interpreted and used. The AI chatbot does not grant access to information that the requesting faculty member is otherwise not authorized to view.',
  },
  {
    title: '8. TRANSPARENCY AND ACCOUNTABILITY',
    text: 'SPMIS maintains an audit trail of mutating system actions, including actions involving reviews and applications. Review edit history is retained and is visible to users who can view the corresponding review. Audit information does not expose protected review content. Hide, unhide, and delete events are recorded without exposing the underlying review text.',
  },
  {
    title: '9. ACCESS AND ACCOUNT RESPONSIBILITY',
    text: 'Faculty accounts are subject to System Administrator verification before feature access is granted. You are responsible for using your account appropriately and for the information you contribute to SPMIS. Students do not have accounts or access to SPMIS.',
  },
  {
    title: '10. ACCEPTANCE',
    text: 'By accepting these Terms & Conditions, you acknowledge that you have read and understood the terms above and agree to use SPMIS in accordance with them.',
  },
];

export default function TermsPage() {
  return (
    <AuthInfoPageLayout title="Terms and Conditions">
      <section className="auth-info-copy">
        <h2 className="auth-info-section-title first">SPMIS TERMS &amp; CONDITIONS</h2>
        <p>Please read the following terms carefully. You must accept these terms before your SPMIS account can be activated.</p>
        {terms.map((section) => <section key={section.title}><h2 className="auth-info-section-title">{section.title}</h2><p>{section.text}</p></section>)}
      </section>
    </AuthInfoPageLayout>
  );
}
