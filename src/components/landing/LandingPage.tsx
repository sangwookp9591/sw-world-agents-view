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
        background: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: 'monospace',
        color: '#e0e0f0',
      }}
    >
      {/* === Header === */}
      <header
        style={{
          textAlign: 'center',
          marginBottom: '48px',
        }}
      >
        {/* Pixel-style logo block */}
        <div
          style={{
            display: 'inline-block',
            background: '#FF6B2C',
            padding: '8px 20px',
            marginBottom: '20px',
            boxShadow: '4px 4px 0px #1a1aaa',
            letterSpacing: '0.1em',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            v0.2.0
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: '#e0e0f0',
            margin: '0 0 12px 0',
            letterSpacing: '0.05em',
            textShadow: '3px 3px 0px #1a1aaa',
          }}
        >
          swkit-office
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: '#7070a0',
            margin: 0,
            letterSpacing: '0.08em',
          }}
        >
          AI 에이전트의 3D 사무실
        </p>
      </header>

      {/* === Main card with tabs === */}
      <main
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#0e0e1a',
          border: '2px solid #2a2a4a',
          boxShadow: '6px 6px 0px #08080f',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #1e1e3a',
          }}
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
        <div style={{ padding: '28px 36px 36px' }}>
          {/* Invite Code Panel */}
          <div
            id="panel-invite"
            role="tabpanel"
            aria-labelledby="tab-invite"
            hidden={activeTab !== 'invite'}
          >
            {activeTab === 'invite' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div
                  style={{
                    width: '100%',
                    borderBottom: '1px solid #1e1e3a',
                    paddingBottom: '16px',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#4a4a7a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {'>'} 초대 코드 입력
                  </p>
                </div>

                <InviteCodeInput initialCode={initialCode} />

                <p
                  style={{
                    fontSize: '12px',
                    color: '#3a3a5a',
                    textAlign: 'center',
                    margin: 0,
                  }}
                >
                  형식: XXXX-XXXX &nbsp;|&nbsp; 예: IRON-7K2X
                </p>
              </div>
            )}
          </div>

          {/* Room Panel */}
          <div
            id="panel-room"
            role="tabpanel"
            aria-labelledby="tab-room"
            hidden={activeTab !== 'room'}
          >
            {activeTab === 'room' && <RoomSection />}
          </div>
        </div>
      </main>

      {/* === Footer — Create new office === */}
      <footer
        style={{
          marginTop: '48px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '1px',
            height: '32px',
            background: '#1e1e3a',
          }}
        />

        <p
          style={{
            fontSize: '13px',
            color: '#4a4a6a',
            margin: 0,
          }}
        >
          또는 새 오피스 만들기
        </p>

        {/* CLI install guide */}
        <div
          style={{
            background: '#08080f',
            border: '1px solid #1e1e3a',
            padding: '16px 24px',
            maxWidth: '400px',
            width: '100%',
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '11px',
              color: '#4a4a6a',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            agent-ui CLI 설치
          </p>
          <code
            style={{
              display: 'block',
              fontSize: '13px',
              color: '#22c55e',
              letterSpacing: '0.02em',
            }}
          >
            npx @sw-kit/agent-ui init
          </code>
        </div>

        <p
          style={{
            fontSize: '11px',
            color: '#2e2e4e',
            margin: 0,
          }}
        >
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
        height: '44px',
        background: active ? '#12121e' : 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid #FF6B2C' : '2px solid transparent',
        borderRadius: 0,
        color: active ? '#FF6B2C' : '#4a4a7a',
        fontFamily: 'monospace',
        fontSize: '12px',
        fontWeight: active ? 'bold' : 'normal',
        cursor: 'pointer',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        transition: 'color 0.15s, border-color 0.15s, background 0.15s',
        marginBottom: '-1px',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = '#a0a0c0';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = '#4a4a7a';
      }}
    >
      {label}
    </button>
  );
}
