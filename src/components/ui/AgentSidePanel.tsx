'use client';

import { useOfficeStore } from '@/stores/office-store';

const STATUS_COLOR: Record<string, string> = {
  active: '#22c55e',
  idle: '#eab308',
  waiting: '#ef4444',
  blocked: '#ef4444',
  completed: '#6b7280',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'active',
  idle: 'idle',
  waiting: 'waiting',
  blocked: 'blocked',
  completed: 'offline',
};

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor((Date.now() - ms) / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function truncateTool(tool?: string): string {
  if (!tool) return '';
  return tool.length > 22 ? tool.slice(0, 19) + '...' : tool;
}

export function AgentSidePanel() {
  const sessions = useOfficeStore((s) => s.sessions);
  const selectedAgentId = useOfficeStore((s) => s.selectedAgentId);
  const sidebarOpen = useOfficeStore((s) => s.sidebarOpen);
  const toggleSidebar = useOfficeStore((s) => s.toggleSidebar);
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const approvals = useOfficeStore((s) => s.approvals);
  const setActiveApproval = useOfficeStore((s) => s.setActiveApproval);

  const sessionList = Array.from(sessions.values());

  return (
    <div
      style={{
        width: sidebarOpen ? 256 : 32,
        background: '#0f0f17',
        borderRight: '1px solid #1e1e3a',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.15s ease',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        title={sidebarOpen ? 'Collapse' : 'Expand'}
        style={{
          position: 'absolute',
          top: 8,
          right: 6,
          zIndex: 10,
          width: 20,
          height: 20,
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: 0,
          color: '#7070a0',
          cursor: 'pointer',
          fontSize: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        {sidebarOpen ? '‹' : '›'}
      </button>

      {sidebarOpen && (
        <>
          {/* Header */}
          <div
            style={{
              padding: '10px 12px 8px',
              borderBottom: '1px solid #1e1e3a',
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: '#4a4a7a',
              textTransform: 'uppercase',
              letterSpacing: 1,
              paddingRight: 32,
            }}
          >
            Agents
          </div>

          {/* Agent list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sessionList.length === 0 && (
              <div
                style={{
                  padding: '16px 12px',
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 11,
                  color: '#333355',
                  textAlign: 'center',
                }}
              >
                No active sessions
              </div>
            )}
            {sessionList.map((session) => {
              const isSelected = selectedAgentId === session.sessionId;
              const statusColor = STATUS_COLOR[session.status] ?? '#6b7280';

              const pendingApproval = approvals.find(
                (a) =>
                  a.status === 'pending' &&
                  a.agentName.toLowerCase() === session.agentName.toLowerCase(),
              );

              return (
                <button
                  key={session.sessionId}
                  onClick={() => {
                    if (pendingApproval) {
                      setActiveApproval(pendingApproval.id);
                    } else {
                      selectAgent(isSelected ? null : session.sessionId);
                    }
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: isSelected ? '#14142a' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #12121f',
                    borderLeft: isSelected ? `2px solid ${statusColor}` : '2px solid transparent',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    color: '#e0e0e0',
                  }}
                >
                  {/* Row 1: status dot + name + role */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: statusColor,
                        flexShrink: 0,
                        boxShadow: session.status === 'active' ? `0 0 4px ${statusColor}` : 'none',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'Geist Sans, sans-serif',
                        fontSize: 12,
                        fontWeight: 600,
                        color: isSelected ? '#ffffff' : '#c0c0d8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {session.agentName}
                    </span>
                    {pendingApproval && (
                      <span
                        title="Pending approval"
                        style={{
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: 8,
                          fontWeight: 700,
                          padding: '1px 4px',
                          flexShrink: 0,
                        }}
                      >
                        &#9888;
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: 'Geist Mono, monospace',
                        fontSize: 9,
                        color: pendingApproval ? '#ef4444' : statusColor,
                        textTransform: 'uppercase',
                      }}
                    >
                      {pendingApproval ? 'approval' : (STATUS_LABEL[session.status] ?? session.status)}
                    </span>
                  </div>

                  {/* Row 2: role */}
                  <div
                    style={{
                      fontFamily: 'Geist Mono, monospace',
                      fontSize: 10,
                      color: '#5050a0',
                      marginBottom: 2,
                      paddingLeft: 13,
                    }}
                  >
                    {session.agentRole}
                  </div>

                  {/* Row 3: current tool */}
                  {session.currentTool && (
                    <div
                      style={{
                        fontFamily: 'Geist Mono, monospace',
                        fontSize: 10,
                        color: '#4a9eff',
                        paddingLeft: 13,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {truncateTool(session.currentTool)}
                    </div>
                  )}

                  {/* Row 4: elapsed time */}
                  <div
                    style={{
                      fontFamily: 'Geist Mono, monospace',
                      fontSize: 9,
                      color: '#333355',
                      paddingLeft: 13,
                      marginTop: 2,
                    }}
                  >
                    {formatElapsed(session.registeredAt)}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
