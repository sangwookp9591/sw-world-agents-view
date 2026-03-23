'use client';

import { useState } from 'react';
import { InviteCodeInput } from './InviteCodeInput';
import { RoomSection } from './RoomSection';

export interface LandingPageProps {
  readonly initialCode?: string | null;
}

type ActiveTab = 'invite' | 'room';

export function LandingPage({ initialCode }: Readonly<LandingPageProps>) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('invite');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#2D3436',
      }}
    >
      {/* === Header === */}
      <header style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div
          style={{
            display: 'inline-block',
            background: '#FF6B2C',
            padding: '6px 16px',
            borderRadius: '20px',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', letterSpacing: '0.05em' }}>
            v0.2.0
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 800,
            color: '#2D3436',
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em',
          }}
        >
          sw-world{' '}
          <span style={{ color: '#FF6B2C' }}>agents</span>
          {' '}view
        </h1>

        <p style={{ fontSize: '16px', color: 'rgba(45, 52, 54, 0.6)', margin: 0 }}>
          AI 에이전트의 3D 사무실 — 실시간 협업 시각화
        </p>
      </header>

      {/* === Main card === */}
      <main
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#FFF8F3',
          border: '1px solid rgba(255, 107, 44, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(255, 107, 44, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Tab bar */}
        <div
          style={{ display: 'flex', borderBottom: '1px solid rgba(255, 107, 44, 0.15)' }}
          role="tablist"
          aria-label="입장 방식 선택"
        >
          <TabButton
            label="초대 코드"
            active={activeTab === 'invite'}
            onClick={() => setActiveTab('invite')}
            id="tab-invite"
            panelId="panel-invite"
          />
          <TabButton
            label="룸 입장"
            active={activeTab === 'room'}
            onClick={() => setActiveTab('room')}
            id="tab-room"
            panelId="panel-room"
          />
        </div>

        {/* Tab panels */}
        <div style={{ padding: '28px 32px 36px' }}>
          <div id="panel-invite" role="tabpanel" aria-labelledby="tab-invite" hidden={activeTab !== 'invite'}>
            {activeTab === 'invite' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(45,52,54,0.5)', letterSpacing: '0.05em' }}>
                  팀원에게 받은 초대 코드를 입력하세요
                </p>
                <InviteCodeInput initialCode={initialCode} />
                <p style={{ fontSize: '12px', color: 'rgba(45,52,54,0.35)', textAlign: 'center', margin: 0 }}>
                  형식: XXXX-XXXX &nbsp;|&nbsp; 예: IRON-7K2X
                </p>
              </div>
            )}
          </div>

          <div id="panel-room" role="tabpanel" aria-labelledby="tab-room" hidden={activeTab !== 'room'}>
            {activeTab === 'room' && <RoomSection />}
          </div>
        </div>
      </main>

      {/* === Footer === */}
      <footer style={{ marginTop: '48px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: 'rgba(45,52,54,0.5)', margin: '0 0 16px 0' }}>
          또는 새 오피스 만들기
        </p>
        <div
          style={{
            background: '#2D3436',
            borderRadius: '12px',
            padding: '16px 24px',
            maxWidth: '400px',
            width: '100%',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            agent-ui CLI
          </p>
          <code style={{ display: 'block', fontSize: '14px', color: '#FF6B2C', fontFamily: 'monospace' }}>
            npx sw-world-agents-view --setup
          </code>
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(45,52,54,0.3)', margin: '12px 0 0 0' }}>
          CLI 실행 후 생성되는 초대 코드를 위에 입력하세요
        </p>
      </footer>
    </div>
  );
}

/* ---- Tab Button ---- */

interface TabButtonProps {
  readonly label: string;
  readonly active: boolean;
  readonly onClick: () => void;
  readonly id: string;
  readonly panelId: string;
}

function TabButton({ label, active, onClick, id, panelId }: Readonly<TabButtonProps>) {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      onClick={onClick}
      style={{
        flex: 1,
        height: '48px',
        background: 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid #FF6B2C' : '2px solid transparent',
        borderRadius: 0,
        color: active ? '#FF6B2C' : 'rgba(45,52,54,0.5)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        transition: 'color 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#2D3436'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(45,52,54,0.5)'; }}
    >
      {label}
    </button>
  );
}
