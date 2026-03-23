'use client';

import { useEffect, useState, use } from 'react';
import { useSessionEvents } from '@/hooks/useSessionEvents';
import { SWKIT_COLORS } from '@/lib/colors';
import type { AgentEvent, RegisteredSession } from '@/types/session';

export default function SharedSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<RegisteredSession | null>(null);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Session not found');
        return res.json();
      })
      .then((data) => setSession(data.session))
      .catch(() => setError('세션을 찾을 수 없습니다'));
  }, [sessionId]);

  useSessionEvents((event) => {
    if (event.sessionId === sessionId || event.agentName.toLowerCase() === session?.agentName.toLowerCase()) {
      setEvents((prev) => [...prev.slice(-200), event]);
    }
  });

  if (error) {
    return (
      <div style={{
        background: '#FFFFFF',
        color: SWKIT_COLORS.terminalRed,
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 16,
      }}>
        {error}
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{
        background: '#FFFFFF',
        color: SWKIT_COLORS.primary,
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 14,
      }}>
        Loading session...
      </div>
    );
  }

  const statusColor = session.status === 'active' ? SWKIT_COLORS.statusActive
    : session.status === 'idle' ? SWKIT_COLORS.statusIdle
    : session.status === 'waiting' ? SWKIT_COLORS.statusBlocked
    : SWKIT_COLORS.statusOffline;

  return (
    <div style={{
      background: '#FFFFFF',
      color: SWKIT_COLORS.dark,
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid rgba(255, 107, 44, 0.15)`,
        background: SWKIT_COLORS.lightBg,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: statusColor,
          boxShadow: `0 0 6px ${statusColor}55`,
        }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: SWKIT_COLORS.dark }}>
            {session.agentName}
          </div>
          <div style={{ fontSize: 12, color: SWKIT_COLORS.muted }}>
            {session.agentRole} | {session.teamId} | Session: {sessionId.slice(0, 8)}...
          </div>
        </div>
        {session.sharing?.allowRemoteControl && (
          <div style={{
            marginLeft: 'auto',
            padding: '4px 12px',
            background: `${SWKIT_COLORS.statusActive}15`,
            border: `1px solid ${SWKIT_COLORS.statusActive}`,
            borderRadius: 20,
            color: SWKIT_COLORS.statusActive,
            fontSize: 12,
            fontWeight: 600,
          }}>
            RC Available
          </div>
        )}
        {session.currentTool && (
          <div style={{
            padding: '4px 12px',
            background: `${SWKIT_COLORS.primary}12`,
            border: `1px solid ${SWKIT_COLORS.primary}`,
            borderRadius: 20,
            color: SWKIT_COLORS.primary,
            fontSize: 12,
            fontWeight: 600,
          }}>
            {session.currentTool}
          </div>
        )}
        <a
          href="/"
          style={{
            marginLeft: session.sharing?.allowRemoteControl ? 0 : 'auto',
            color: SWKIT_COLORS.primary,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          &larr; Office
        </a>
      </div>

      {/* 이벤트 로그 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px' }}>
        {events.length === 0 ? (
          <div style={{
            color: SWKIT_COLORS.muted,
            textAlign: 'center',
            marginTop: 60,
            fontSize: 14,
          }}>
            이벤트 대기 중... 이 세션에서 도구를 사용하면 여기에 표시됩니다.
          </div>
        ) : (
          events.map((e, i) => {
            const time = new Date(e.timestamp).toLocaleTimeString();
            const typeColor = e.eventType === 'tool_start' ? '#3b82f6'
              : e.eventType === 'tool_done' ? SWKIT_COLORS.statusActive
              : e.eventType === 'status_change' ? SWKIT_COLORS.statusIdle
              : SWKIT_COLORS.muted;
            return (
              <div key={i} style={{
                padding: '6px 0',
                borderBottom: '1px solid rgba(255, 107, 44, 0.08)',
                fontSize: 13,
              }}>
                <span style={{ color: SWKIT_COLORS.muted, fontFamily: 'monospace', fontSize: 12 }}>
                  {time}
                </span>
                {' '}
                <span style={{
                  color: typeColor,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}>
                  [{e.eventType}]
                </span>
                {' '}
                {e.toolName && (
                  <span style={{ color: SWKIT_COLORS.dark }}>
                    {e.toolName}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 하단 상태 */}
      <div style={{
        padding: '10px 24px',
        borderTop: '1px solid rgba(255, 107, 44, 0.15)',
        background: SWKIT_COLORS.lightBg,
        fontSize: 11,
        color: SWKIT_COLORS.muted,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>Events: {events.length}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10 }}>
          {typeof window !== 'undefined' ? window.location.href : ''}
        </span>
      </div>
    </div>
  );
}
