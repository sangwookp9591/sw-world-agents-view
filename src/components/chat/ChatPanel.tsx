'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useOfficeStore } from '@/stores/office-store';
import { AGENT_SCREEN_COLORS } from '@/lib/colors';
import type { ChatMessage } from '@/stores/office-store';

interface ChatPanelProps {
  roomId?: string;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function ChatPanel({ roomId }: Readonly<ChatPanelProps>) {
  const chatMessages = useOfficeStore((s) => s.chatMessages);
  const [collapsed, setCollapsed] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    if (!collapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, collapsed]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setInputText('');
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'user',
          agentName: 'User',
          text,
          roomId,
        }),
      });
    } catch {
      // 전송 실패 무시
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [inputText, sending, roomId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div
      style={{
        borderTop: '1px solid #1e1e3a',
        background: '#0a0a0f',
        flexShrink: 0,
      }}
    >
      {/* 헤더 */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? '채팅 펼치기' : '채팅 접기'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '6px 10px',
          background: '#0f0f17',
          border: 'none',
          borderBottom: collapsed ? 'none' : '1px solid #1e1e3a',
          cursor: 'pointer',
          color: '#4a4a7a',
          fontFamily: 'Geist Mono, monospace',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        <span>Chat</span>
        <span style={{ fontSize: 9 }}>{collapsed ? '▲' : '▼'}</span>
      </button>

      {!collapsed && (
        <>
          {/* 메시지 목록 */}
          <div
            style={{
              height: 150,
              overflowY: 'auto',
              padding: '4px 0',
            }}
          >
            {chatMessages.length === 0 && (
              <div
                style={{
                  padding: '12px 10px',
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 10,
                  color: '#333355',
                  textAlign: 'center',
                }}
              >
                No messages yet
              </div>
            )}
            {chatMessages.map((msg: ChatMessage) => {
              const color =
                AGENT_SCREEN_COLORS[msg.agentId.toLowerCase()] ??
                (msg.agentId === 'user' ? '#FF6B2C' : '#7070a0');
              return (
                <div
                  key={msg.id}
                  style={{
                    padding: '3px 10px',
                    background: '#12121e',
                    marginBottom: 1,
                    display: 'flex',
                    gap: 6,
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Geist Mono, monospace',
                      fontSize: 10,
                      fontWeight: 700,
                      color,
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    [{msg.agentName}]
                  </span>
                  <span
                    style={{
                      fontFamily: 'Geist Mono, monospace',
                      fontSize: 10,
                      color: '#e0e0f0',
                      wordBreak: 'break-word',
                      flex: 1,
                    }}
                  >
                    {msg.text}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Geist Mono, monospace',
                      fontSize: 9,
                      color: '#555',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: '4px 8px',
              borderTop: '1px solid #1e1e3a',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지 입력..."
              disabled={sending}
              aria-label="채팅 입력"
              style={{
                flex: 1,
                background: '#12121e',
                border: '1px solid #2a2a3e',
                borderRadius: 0,
                padding: '4px 8px',
                color: '#e0e0f0',
                fontFamily: 'Geist Mono, monospace',
                fontSize: 11,
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#FF6B2C';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#2a2a3e';
              }}
            />
            <button
              onClick={() => void handleSend()}
              disabled={sending || !inputText.trim()}
              aria-label="전송"
              style={{
                padding: '4px 10px',
                background: sending || !inputText.trim() ? '#1a1a2e' : '#FF6B2C',
                border: 'none',
                borderRadius: 0,
                color: sending || !inputText.trim() ? '#4a4a7a' : '#ffffff',
                fontFamily: 'Geist Mono, monospace',
                fontSize: 10,
                cursor: sending || !inputText.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, color 0.15s',
                flexShrink: 0,
              }}
            >
              전송
            </button>
          </div>
        </>
      )}
    </div>
  );
}
