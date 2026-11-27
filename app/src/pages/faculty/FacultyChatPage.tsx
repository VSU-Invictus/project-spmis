import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../../components/navigation/AppShell';
import { Badge, Button, Card } from '../../components/ui';
import { useChatContext } from '../../context/ChatContext';
import { useSession } from '../../context/SessionContext';
import './FacultyChatPage.css';

const suggestedTopics = [
  { title: 'Research experience', description: 'Explore faculty assessments', prompt: 'Which students have research experience?' },
  { title: 'Teamwork', description: 'Ask across student records', prompt: 'Which students show teamwork?' },
  { title: 'Communication', description: 'Find relevant review excerpts', prompt: 'Find reviews mentioning communication.' },
  { title: 'Robotics', description: 'Explore project experience', prompt: 'Which students have robotics experience?' },
];

export function FacultyChatPage() {
  const { profile } = useSession();
  const isActiveFaculty = profile?.role === 'faculty' && profile?.status === 'active';
  const [inputMessage, setInputMessage] = useState('');
  const { state, isPending, sendMessage, retryLastMessage, dismissError } = useChatContext();
  const { messages, error: rateLimitError } = state;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isPending) return;
    sendMessage(inputMessage);
    setInputMessage('');
  };

  if (!isActiveFaculty) {
    return (
      <AppShell role={profile?.role === 'admin' ? 'admin' : 'faculty'} activeNavKey="chat" breadcrumb="FACULTY PORTAL / CHATS">
        <div style={{ padding: '24px 0', maxWidth: '640px' }}>
          <div role="alert" style={{ padding: '20px 24px', backgroundColor: 'var(--destructive-subtle, #fee2e2)', border: '1px solid var(--destructive, #ef4444)', borderRadius: 'var(--radius-md, 8px)', color: 'var(--destructive, #b91c1c)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600 }}>Access Restricted</h2>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>The AI Chat Assistant is reserved exclusively for active, verified faculty members. Pending accounts and administrative users are restricted from querying the assistant.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="faculty" activeNavKey="chat" breadcrumb="FACULTY PORTAL / CHATS" mainClassName="faculty-chat-shell">
      <div className="faculty-chat-page">
        <header className="faculty-chat-heading">
          <div>
            <h1 className="ui-page-title">AI Chat Assistant</h1>
            <p className="ui-page-subtitle">Explore attributed reviews across students in one conversation.</p>
          </div>
          <Link className="ui-btn ui-btn-secondary" to="/faculty/students">Browse Student</Link>
        </header>

        <section className="chat-privacy-notice" role="note" aria-label="De-identification privacy notice">
          <Badge variant="warning">Privacy</Badge>
          <p><strong>Do not enter raw student names or other identifying details.</strong> Refer to students by ID or program instead so the assistant can help without exposing personal data.</p>
        </section>

        <div className="ui-chat-prompts" aria-label="Suggested questions">
          {suggestedTopics.map((topic) => (
            <button className="ui-chat-prompt-card" key={topic.title} type="button" onClick={() => setInputMessage(topic.prompt)}>
              <h3>{topic.title}</h3><p>{topic.description}</p>
            </button>
          ))}
        </div>

        <div className="ui-chat-columns">
          <Card className="ui-chat-card-resizable">
            <div className="ui-card-header ui-card-header-top faculty-chat-card-header">
              <h2 className="ui-card-title">Ask across student reviews</h2>
              <p className="ui-card-description">Faculty conversational assistant for student evaluations.</p>
            </div>
            <div className="ui-chat-container faculty-chat-container">
              <div className="ui-chat-log" aria-live="polite" aria-relevant="additions text">
                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  return (
                    <article className={`faculty-chat-message ${isUser ? 'faculty-chat-message--user' : ''}`} key={message.id}>
                      {!isUser && <span className="faculty-chat-avatar" aria-hidden="true">SP</span>}
                      <div className="faculty-chat-message-content">
                        <div className="faculty-chat-message-meta"><strong>{isUser ? 'You' : 'AI Assistant'}</strong><time>{message.timestamp}</time></div>
                        <div className={`faculty-chat-bubble ${isUser ? 'faculty-chat-bubble--user' : ''}`}>{message.content}</div>
                      </div>
                    </article>
                  );
                })}
                {isPending && <p className="faculty-chat-pending" role="status">Querying AI Assistant…</p>}
                {rateLimitError && (
                  <div className="faculty-chat-error" role="alert">
                    <div><Badge variant="danger" className="faculty-chat-error-code">{rateLimitError.code}</Badge> <strong>{rateLimitError.message}</strong></div>
                    {rateLimitError.hint && <p>{rateLimitError.hint}</p>}
                    <div className="faculty-chat-error-actions">
                      <Button size="sm" variant="primary" onClick={retryLastMessage} disabled={isPending}>Retry Prompt</Button>
                      <Button size="sm" variant="ghost" onClick={dismissError}>Dismiss</Button>
                    </div>
                  </div>
                )}
              </div>
              <form className="faculty-chat-form" onSubmit={handleSubmit}>
                <textarea
                  className="ui-chat-textarea faculty-chat-textarea"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      if (inputMessage.trim() && !isPending) {
                        sendMessage(inputMessage);
                        setInputMessage('');
                      }
                    }
                  }}
                  placeholder="Type a question across student reviews..."
                  aria-label="Message to AI Chat Assistant"
                  rows={2}
                  disabled={isPending}
                />
                <div className="faculty-chat-form-footer">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <Button type="submit" variant="primary" aria-label="Send Message" disabled={!inputMessage.trim() || isPending}>Send query <svg className="faculty-chat-send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7Z" /></svg></Button>
                </div>
              </form>
            </div>
          </Card>

          <aside className="ui-card ui-chat-context-card" aria-label="Referenced student">
            <div className="faculty-chat-context-avatar">SP</div>
            <h2>Sam Lee Parker</h2>
            <p className="faculty-chat-context-id">ID: 24-1-00001</p>
            <dl className="faculty-chat-context-meta">
              <dt>Program</dt><dd>BS Computer Science</dd>
              <dt>Year Level</dt><dd>3rd Year</dd>
              <dt>Status</dt><dd><Badge variant="success">Good Standing</Badge></dd>
              <dt>Tags</dt><dd><Badge variant="purple">Research</Badge> <Badge variant="cyan">Algorithms</Badge></dd>
            </dl>
            <p className="faculty-chat-context-note">Referenced record. Review conversations can synthesize evaluations across all enrolled students.</p>
            <Link className="ui-btn ui-btn-outline" to="/faculty/students/24-1-00001">View Full Profile <span aria-hidden="true">→</span></Link>
          </aside>
        </div>
        <p className="faculty-chat-footer-note">Use contributor assessments as context for your own decisions. Read full reviews and edit histories from the student roster.</p>
      </div>
    </AppShell>
  );
}
