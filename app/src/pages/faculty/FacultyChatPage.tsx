import { useState } from 'react';
import { AppShell } from '../../components/navigation/AppShell';
import {
  Button,
  Card,
  Badge,
  Input,
} from '../../components/ui';
import { useChatContext } from '../../context/ChatContext';
import { useSession } from '../../context/SessionContext';

export function FacultyChatPage() {
  const { profile } = useSession();
  const isActiveFaculty = profile?.role === 'faculty' && profile?.status === 'active';

  const [inputMessage, setInputMessage] = useState('');
  const {
    state,
    isPending,
    sendMessage,
    retryLastMessage,
    dismissError,
    setSimulateRateLimit,
  } = useChatContext();

  const { messages, error: rateLimitError, simulateRateLimit } = state;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isPending) return;
    sendMessage(inputMessage);
    setInputMessage('');
  };

  if (!isActiveFaculty) {
    return (
      <AppShell
        role={profile?.role === 'admin' ? 'admin' : 'faculty'}
        activeNavKey="chat"
        breadcrumb="Faculty Portal / AI Chat Assistant"
      >
        <div style={{ padding: '24px 0', maxWidth: '640px' }}>
          <div
            role="alert"
            style={{
              padding: '20px 24px',
              backgroundColor: 'var(--destructive-subtle, #fee2e2)',
              border: '1px solid var(--destructive, #ef4444)',
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--destructive, #b91c1c)',
            }}
          >
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>Access Restricted</h2>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
              The AI Chat Assistant is reserved exclusively for active, verified faculty members. Pending accounts and administrative users are restricted from querying the assistant.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      role="faculty"
      activeNavKey="chat"
      breadcrumb="Faculty Portal / AI Chat Assistant"
    >
      <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top Assistant Header & Gate A5 Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="ui-page-title" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>
              AI Chat Assistant
            </h1>
            <p className="ui-page-subtitle" style={{ margin: 0, color: 'var(--muted-foreground, #64748b)', fontSize: '14px' }}>
              De-identified intelligence queries connected to Prism mock <code style={{ fontSize: '12px' }}>/functions/v1/chat</code>.
            </p>
          </div>

          {/* Demonstration Helper for Milestone 2 Gate A5 */}
          {import.meta.env.DEV && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Badge variant={simulateRateLimit ? 'danger' : 'neutral'}>
                Mode: {simulateRateLimit ? '429 Rate Limit Simulation' : '200 Normal'}
              </Badge>
              <Button
                size="sm"
                variant={simulateRateLimit ? 'destructive' : 'outline'}
                onClick={() => setSimulateRateLimit(!simulateRateLimit)}
              >
                {simulateRateLimit ? 'Disable 429 Simulator' : '⚡ Simulate 429 Rate Limit'}
              </Button>
            </div>
          )}
        </div>

        {/* Message Thread */}
        <Card
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg, 12px)',
          }}
        >
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    backgroundColor: isUser ? 'var(--primary, #0284c7)' : 'var(--muted, #f1f5f9)',
                    color: isUser ? '#ffffff' : 'var(--foreground)',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  {m.content}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px', padding: '0 4px' }}>
                  {isUser ? 'You' : 'SPMIS Assistant'} · {m.timestamp}
                </span>
              </div>
            );
          })}

          {isPending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted-foreground)', fontSize: '13px' }}>
              <span className="animate-spin">⏳</span> Querying AI Assistant via Prism mock...
            </div>
          )}

          {/* Graceful 429 Rate Limit / Error Retry Box (Gate A5 / M4 Requirement) */}
          {rateLimitError && (
            <div
              role="alert"
              style={{
                padding: '16px 20px',
                backgroundColor: 'var(--destructive-subtle, #fef2f2)',
                border: '1px solid var(--destructive, #ef4444)',
                borderRadius: 'var(--radius-md, 8px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxWidth: '650px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge variant="danger">
                  {rateLimitError.code}
                </Badge>
                <span style={{ fontWeight: 700, color: 'var(--destructive, #b91c1c)' }}>
                  {rateLimitError.message}
                </span>
              </div>
              {rateLimitError.hint && (
                <div style={{ fontSize: '13px', color: '#991b1b' }}>
                  💡 <strong>Guidance:</strong> {rateLimitError.hint}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <Button size="sm" variant="primary" onClick={retryLastMessage} disabled={isPending}>
                  🔄 Retry Prompt
                </Button>
                <Button size="sm" variant="ghost" onClick={dismissError}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', gap: '10px' }}
        >
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about student skills, leadership, or recommendable candidates..."
            disabled={isPending}
            style={{ flex: 1 }}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!inputMessage.trim() || isPending}
          >
            Send Message
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
