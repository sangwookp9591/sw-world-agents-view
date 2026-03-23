'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useOfficeStore } from '@/stores/office-store';
import { AgentSidePanel } from '@/components/ui/AgentSidePanel';
import { StatusBar } from '@/components/ui/StatusBar';
import { TerminalPanel } from '@/components/terminal/TerminalPanel';
import { ApprovalModal } from '@/components/ui/ApprovalModal';
import { useSessionEvents } from '@/hooks/useSessionEvents';
import type { AgentEvent, ApprovalRequest } from '@/types/session';

const OfficeCanvas = dynamic(
  () => import('@/components/office/OfficeCanvas'),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: '100%', height: '100%', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4444ff', fontFamily: 'monospace' }}>
        Loading 3D Office...
      </div>
    ),
  },
);

const TERMINAL_EVENT_TYPES = new Set([
  'tool_start',
  'tool_done',
  'status_change',
  'register',
  'unregister',
]);

export default function Home() {
  const selectedAgentId = useOfficeStore((s) => s.selectedAgentId);
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const approvals = useOfficeStore((s) => s.approvals);
  const activeApprovalId = useOfficeStore((s) => s.activeApprovalId);
  const addApproval = useOfficeStore((s) => s.addApproval);
  const removeApproval = useOfficeStore((s) => s.removeApproval);
  const setActiveApproval = useOfficeStore((s) => s.setActiveApproval);
  const addSession = useOfficeStore((s) => s.addSession);
  const removeSession = useOfficeStore((s) => s.removeSession);
  const updateSessionStatus = useOfficeStore((s) => s.updateSessionStatus);

  // Terminal event buffer: keyed by agentId (sessionId or agentName)
  const [terminalEvents, setTerminalEvents] = useState<AgentEvent[]>([]);

  const handleEvent = useCallback(
    (event: AgentEvent) => {
      if (event.eventType === 'approval_request') {
        const approval = event.payload?.approval as ApprovalRequest | undefined;
        if (approval) addApproval(approval);
      } else if (event.eventType === 'approval_resolved') {
        const approval = event.payload?.approval as ApprovalRequest | undefined;
        if (approval) {
          // Update approval in store (replace with resolved state)
          addApproval(approval);
          // Remove after a short delay so UI can reflect resolved state
          setTimeout(() => removeApproval(approval.id), 2000);
        }
      } else if (event.eventType === 'register') {
        const session = event.payload?.session;
        if (session) addSession(session as Parameters<typeof addSession>[0]);
      } else if (event.eventType === 'unregister') {
        removeSession(event.sessionId);
      } else if (event.eventType === 'tool_start') {
        updateSessionStatus(event.sessionId, 'active', event.toolName);
      } else if (event.eventType === 'tool_done') {
        updateSessionStatus(event.sessionId, 'idle', undefined);
      } else if (event.eventType === 'status_change') {
        const status = event.payload?.status as Parameters<typeof updateSessionStatus>[1] | undefined;
        if (status) updateSessionStatus(event.sessionId, status);
      }

      // Buffer terminal-relevant events for the TerminalPanel
      if (TERMINAL_EVENT_TYPES.has(event.eventType)) {
        setTerminalEvents((prev) => [...prev, event]);
      }
    },
    [addApproval, removeApproval, addSession, removeSession, updateSessionStatus],
  );

  useSessionEvents(handleEvent);

  const activeApproval = activeApprovalId
    ? approvals.find((a) => a.id === activeApprovalId)
    : null;

  // Filter terminal events to only those matching the selected agent
  const filteredTerminalEvents = selectedAgentId
    ? terminalEvents.filter(
        (e) =>
          e.sessionId === selectedAgentId ||
          e.agentName.toLowerCase() === selectedAgentId.toLowerCase(),
      )
    : [];

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: '#0a0a0f',
        overflow: 'hidden',
      }}
    >
      {/* Left sidebar */}
      <AgentSidePanel />

      {/* Main column: canvas + terminal + statusbar */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* 3D canvas — takes remaining vertical space */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <OfficeCanvas />
        </div>

        {/* RC terminal panel — shown when an agent is selected */}
        {selectedAgentId && (
          <TerminalPanel
            agentId={selectedAgentId}
            onClose={() => selectAgent(null)}
            events={filteredTerminalEvents}
          />
        )}

        {/* Status bar — always visible at bottom */}
        <StatusBar />
      </div>

      {/* Approval modal — rendered outside main layout for z-index stacking */}
      {activeApproval && (
        <ApprovalModal
          approval={activeApproval}
          onClose={() => setActiveApproval(null)}
        />
      )}
    </div>
  );
}
