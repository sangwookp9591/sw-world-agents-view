'use client';

import { useOfficeStore } from '@/stores/office-store';

interface StatusBarProps {
  version?: string;
}

export function StatusBar({ version = '0.1.0' }: Readonly<StatusBarProps>) {
  const sessions = useOfficeStore((s) => s.sessions);
  const approvals = useOfficeStore((s) => s.approvals);
  const setActiveApproval = useOfficeStore((s) => s.setActiveApproval);

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const pendingCount = pendingApprovals.length;

  const sessionList = Array.from(sessions.values());
  const activeCount = sessionList.filter((s) => s.status === 'active').length;
  const totalCount = sessionList.length;

  return (
    <div
      style={{
        height: 32,
        background: '#0f0f17',
        borderTop: '1px solid #1e1e3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontFamily: 'Geist Mono, monospace',
        fontSize: 11,
        color: '#7070a0',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Left: active agent count */}
      <span>
        Active:{' '}
        <span style={{ color: '#22c55e' }}>{activeCount}</span>
        {'/'}
        <span style={{ color: '#e0e0e0' }}>{totalCount}</span>
        {' agents'}
      </span>

      {/* Center: pipeline stages */}
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <PipelineStage label="plan" status="done" />
        <span style={{ color: '#444466' }}>→</span>
        <PipelineStage label="exec" status="active" />
        <span style={{ color: '#444466' }}>→</span>
        <PipelineStage label="verify" status="pending" />
      </span>

      {/* Right: pending approvals + version */}
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {pendingCount > 0 && (
          <button
            onClick={() => {
              const first = pendingApprovals[0];
              if (first) setActiveApproval(first.id);
            }}
            title={`${pendingCount} pending approval(s) — click to review`}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              animation: 'sb-blink 1s step-start infinite',
            }}
          >
            <style>{`
              @keyframes sb-blink {
                0%, 100% { opacity: 1; }
                50%       { opacity: 0.4; }
              }
            `}</style>
            <span style={{ color: '#ef4444' }}>&#9888;&#65039; Pending: {pendingCount}</span>
          </button>
        )}
        <span style={{ color: '#444466' }}>swkit-office v{version}</span>
      </span>
    </div>
  );
}

interface PipelineStageProps {
  label: string;
  status: 'done' | 'active' | 'pending';
}

function PipelineStage({ label, status }: Readonly<PipelineStageProps>) {
  const icon = status === 'done' ? '✅' : status === 'active' ? '🔄' : '⏳';
  const color = status === 'done' ? '#22c55e' : status === 'active' ? '#eab308' : '#444466';
  return (
    <span style={{ color }}>
      {label} {icon}
    </span>
  );
}
