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
    <div className="flex h-8 shrink-0 select-none items-center justify-between border-t border-swkit-orange/15 bg-swkit-light px-3 font-mono text-[11px] text-swkit-muted">
      {/* Left: active agent count */}
      <span>
        Active:{' '}
        <span className="text-status-active">{activeCount}</span>
        {'/'}
        <span className="text-swkit-dark">{totalCount}</span>
        {' agents'}
      </span>

      {/* Center: pipeline stages */}
      <span className="flex items-center gap-1.5">
        <PipelineStage label="plan" status="done" />
        <span className="text-swkit-muted/40">→</span>
        <PipelineStage label="exec" status="active" />
        <span className="text-swkit-muted/40">→</span>
        <PipelineStage label="verify" status="pending" />
      </span>

      {/* Right: pending approvals + version */}
      <span className="flex items-center gap-2.5">
        {pendingCount > 0 && (
          <button
            onClick={() => {
              const first = pendingApprovals[0];
              if (first) setActiveApproval(first.id);
            }}
            title={`${pendingCount} pending approval(s) — click to review`}
            className="cursor-pointer border-none bg-transparent p-0 font-mono text-[11px] animate-pulse"
          >
            <span className="text-status-blocked">&#9888;&#65039; Pending: {pendingCount}</span>
          </button>
        )}
        <span className="text-swkit-muted/40">swkit-office v{version}</span>
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
  const colorClass = status === 'done' ? 'text-status-active' : status === 'active' ? 'text-status-idle' : 'text-swkit-muted/40';
  return (
    <span className={colorClass}>
      {label} {icon}
    </span>
  );
}
