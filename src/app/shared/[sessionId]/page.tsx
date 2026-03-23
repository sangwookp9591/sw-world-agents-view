'use client';

import { useEffect, useState, use } from 'react';
import { useSessionEvents } from '@/hooks/useSessionEvents';
import type { AgentEvent, RegisteredSession } from '@/types/session';

export default function SharedSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<RegisteredSession | null>(null);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 세션 정보 로드
  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Session not found');
        return res.json();
      })
      .then((data) => setSession(data.session))
      .catch(() => setError('세션을 찾을 수 없습니다'));
  }, [sessionId]);

  // SSE 이벤트 수신 (해당 세션만 필터)
  useSessionEvents((event) => {
    if (event.sessionId === sessionId || event.agentName.toLowerCase() === session?.agentName.toLowerCase()) {
      setEvents((prev) => [...prev.slice(-200), event]);
    }
  });

  if (error) {
    return (
      <div style={{ background: '#0a0a0f', color: '#ff4444', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        {error}
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ background: '#0a0a0f', color: '#FF6B2C', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        Loading session...
      </div>
    );
  }

  const statusColor = session.status === 'active' ? '#22c55e'
    : session.status === 'idle' ? '#eab308'
    : session.status === 'waiting' ? '#ef4444'
    : '#6b7280';

  return (
    <div style={{ background: '#0a0a0f', color: '#e0e0f0', height: '100vh', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div style={{ padding: '16px 24px', borderBottom: '2px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>{session.agentName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{session.agentRole} | {session.teamId} | Session: {sessionId.slice(0, 8)}...</div>
        </div>
        {session.sharing?.allowRemoteControl && (
          <div style={{ marginLeft: 'auto', padding: '4px 12px', background: '#22c55e22', border: '1px solid #22c55e', color: '#22c55e', fontSize: 12 }}>
            RC Available
          </div>
        )}
        {session.currentTool && (
          <div style={{ padding: '4px 12px', background: '#3b82f622', border: '1px solid #3b82f6', color: '#3b82f6', fontSize: 12 }}>
            {session.currentTool}
          </div>
        )}
        <a href="/" style={{ marginLeft: session.sharing?.allowRemoteControl ? 0 : 'auto', color: '#FF6B2C', fontSize: 12, textDecoration: 'none' }}>
          ← Office
        </a>
      </div>

      {/* 이벤트 로그 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px' }}>
        {events.length === 0 ? (
          <div style={{ color: '#555', textAlign: 'center', marginTop: 40 }}>
            이벤트 대기 중... 이 세션에서 도구를 사용하면 여기에 표시됩니다.
          </div>
        ) : (
          events.map((e, i) => {
            const time = new Date(e.timestamp).toLocaleTimeString();
            const typeColor = e.eventType === 'tool_start' ? '#3b82f6'
              : e.eventType === 'tool_done' ? '#22c55e'
              : e.eventType === 'status_change' ? '#eab308'
              : '#888';
            return (
              <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #111', fontSize: 13 }}>
                <span style={{ color: '#555' }}>{time}</span>
                {' '}
                <span style={{ color: typeColor }}>[{e.eventType}]</span>
                {' '}
                {e.toolName && <span style={{ color: '#e0e0f0' }}>{e.toolName}</span>}
              </div>
            );
          })
        )}
      </div>

      {/* 하단 상태 */}
      <div style={{ padding: '8px 24px', borderTop: '2px solid #1a1a2e', fontSize: 11, color: '#555', display: 'flex', justifyContent: 'space-between' }}>
        <span>Events: {events.length}</span>
        <span>Share URL: {typeof window !== 'undefined' ? window.location.href : ''}</span>
      </div>
    </div>
  );
}
