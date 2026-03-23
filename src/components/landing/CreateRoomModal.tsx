'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface CreateRoomModalProps {
  readonly onClose: () => void;
  readonly onCreated: (roomId: string) => void;
}

interface CreateRoomPayload {
  name: string;
  isPublic: boolean;
  maxMembers: number;
  allowSpectators: boolean;
}

interface CreateRoomResponse {
  id: string;
  code: string;
  name: string;
}

export function CreateRoomModal({ onClose, onCreated }: Readonly<CreateRoomModalProps>) {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [maxMembers, setMaxMembers] = useState(10);
  const [allowSpectators, setAllowSpectators] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRoom, setCreatedRoom] = useState<CreateRoomResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const payload: CreateRoomPayload = {
      name: trimmedName,
      isPublic,
      maxMembers,
      allowSpectators,
    };

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? '룸 생성에 실패했습니다');
        setIsSubmitting(false);
        return;
      }

      const data = (await res.json()) as CreateRoomResponse;
      setCreatedRoom(data);
      setIsSubmitting(false);
    } catch {
      setError('서버 연결에 실패했습니다');
      setIsSubmitting(false);
    }
  }, [name, isPublic, maxMembers, allowSpectators, isSubmitting]);

  const handleCopyCode = useCallback(async () => {
    if (!createdRoom) return;
    try {
      await navigator.clipboard.writeText(createdRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: ignore clipboard errors
    }
  }, [createdRoom]);

  const handleEnterRoom = useCallback(() => {
    if (!createdRoom) return;
    onCreated(createdRoom.id);
  }, [createdRoom, onCreated]);

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="룸 만들기"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#0a0a0f',
          border: '2px solid #FF6B2C',
          boxShadow: '6px 6px 0px rgba(255,107,44,0.2)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'monospace',
          color: '#e0e0f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #2a2a3e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              color: '#FF6B2C',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 'bold',
            }}
          >
            {'>'} 룸 만들기
          </span>
          <button
            onClick={onClose}
            aria-label="모달 닫기"
            style={{
              background: 'transparent',
              border: '1px solid #2a2a3e',
              borderRadius: 0,
              color: '#7070a0',
              fontFamily: 'monospace',
              fontSize: '14px',
              cursor: 'pointer',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {createdRoom ? (
            /* Success state */
            <SuccessView
              room={createdRoom}
              copied={copied}
              onCopy={handleCopyCode}
              onEnter={handleEnterRoom}
              onClose={onClose}
            />
          ) : (
            /* Form state */
            <>
              {/* Room Name */}
              <FormField label="룸 이름" required>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 128))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                  placeholder="예: 결제 시스템 개발"
                  maxLength={128}
                  aria-label="룸 이름"
                  aria-required="true"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B2C';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a3e';
                  }}
                />
                <div style={{ fontSize: '10px', color: '#4a4a7a', textAlign: 'right', marginTop: '4px' }}>
                  {name.length}/128
                </div>
              </FormField>

              {/* Public Toggle */}
              <FormField label="공개 여부">
                <ToggleRow
                  label={isPublic ? '공개 — 누구나 입장 가능' : '비공개 — 코드로만 입장'}
                  checked={isPublic}
                  onChange={setIsPublic}
                  id="room-public-toggle"
                />
              </FormField>

              {/* Max Members */}
              <FormField label="최대 인원">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="number"
                    value={maxMembers}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1));
                      setMaxMembers(v);
                    }}
                    min={1}
                    max={50}
                    aria-label="최대 인원"
                    style={{ ...inputStyle, width: '80px', textAlign: 'center' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FF6B2C';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#2a2a3e';
                    }}
                  />
                  <span style={{ fontSize: '12px', color: 'rgba(224,224,240,0.6)' }}>
                    명 (1 ~ 50)
                  </span>
                </div>
              </FormField>

              {/* Allow Spectators */}
              <FormField label="관전 허용">
                <ToggleRow
                  label={allowSpectators ? '관전 허용' : '관전 불허'}
                  checked={allowSpectators}
                  onChange={setAllowSpectators}
                  id="room-spectator-toggle"
                />
              </FormField>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  style={{
                    padding: '10px 12px',
                    background: '#1a0a0a',
                    border: '1px solid #3a1a1a',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#ef4444',
                  }}
                >
                  [ERR] {error}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim() || isSubmitting}
                  aria-label="룸 만들기"
                  style={{
                    flex: 1,
                    height: '44px',
                    background: name.trim() && !isSubmitting ? '#FF6B2C' : '#1e1e3a',
                    border: '2px solid',
                    borderColor: name.trim() && !isSubmitting ? '#FF6B2C' : '#2a2a4a',
                    borderRadius: 0,
                    color: name.trim() && !isSubmitting ? '#ffffff' : '#4a4a6a',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: name.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (name.trim() && !isSubmitting) {
                      e.currentTarget.style.background = '#FF8F5C';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (name.trim() && !isSubmitting) {
                      e.currentTarget.style.background = '#FF6B2C';
                    }
                  }}
                >
                  {isSubmitting ? '생성 중...' : '만들기'}
                </button>
                <button
                  onClick={onClose}
                  aria-label="취소"
                  style={{
                    height: '44px',
                    padding: '0 20px',
                    background: 'transparent',
                    border: '2px solid #2a2a3e',
                    borderRadius: 0,
                    color: '#7070a0',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4a4a7a';
                    e.currentTarget.style.color = '#a0a0c0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a3e';
                    e.currentTarget.style.color = '#7070a0';
                  }}
                >
                  취소
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

interface FormFieldProps {
  readonly label: string;
  readonly required?: boolean;
  readonly children: React.ReactNode;
}

function FormField({ label, required, children }: Readonly<FormFieldProps>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label
        style={{
          fontSize: '11px',
          color: '#4a4a7a',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}
      >
        {label}
        {required && <span style={{ color: '#FF6B2C', marginLeft: '4px' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

interface ToggleRowProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (value: boolean) => void;
  readonly id: string;
}

function ToggleRow({ label, checked, onChange, id }: Readonly<ToggleRowProps>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: '40px',
          height: '22px',
          background: checked ? '#FF6B2C' : '#1e1e3a',
          border: `2px solid ${checked ? '#FF6B2C' : '#2a2a4a'}`,
          borderRadius: 0,
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.15s, border-color 0.15s',
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '18px' : '2px',
            width: '14px',
            height: '14px',
            background: '#ffffff',
            transition: 'left 0.15s',
          }}
        />
      </button>
      <span style={{ fontSize: '13px', color: 'rgba(224,224,240,0.6)' }}>{label}</span>
    </div>
  );
}

interface SuccessViewProps {
  readonly room: CreateRoomResponse;
  readonly copied: boolean;
  readonly onCopy: () => void;
  readonly onEnter: () => void;
  readonly onClose: () => void;
}

function SuccessView({ room, copied, onCopy, onEnter, onClose }: Readonly<SuccessViewProps>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          padding: '16px',
          background: '#0a1a0a',
          border: '1px solid #1a3a1a',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ fontSize: '11px', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          [OK] 룸 생성 완료
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e0e0f0' }}>{room.name}</div>
      </div>

      {/* Room code display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '11px', color: '#4a4a7a', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          룸 코드
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
          <div
            style={{
              flex: 1,
              padding: '12px 16px',
              background: '#12121e',
              border: '2px solid #FF6B2C',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#FF6B2C',
              letterSpacing: '0.15em',
              textAlign: 'center',
            }}
          >
            {room.code}
          </div>
          <button
            onClick={onCopy}
            aria-label="룸 코드 복사"
            style={{
              padding: '0 16px',
              background: copied ? '#0a2a0a' : '#1e1e3a',
              border: `2px solid ${copied ? '#22c55e' : '#2a2a4a'}`,
              borderRadius: 0,
              color: copied ? '#22c55e' : '#7070a0',
              fontFamily: 'monospace',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
            }}
          >
            {copied ? '[복사됨]' : '코드 복사'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onEnter}
          aria-label="룸 입장하기"
          style={{
            flex: 1,
            height: '44px',
            background: '#FF6B2C',
            border: '2px solid #FF6B2C',
            borderRadius: 0,
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FF8F5C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FF6B2C';
          }}
        >
          룸 입장하기 &rarr;
        </button>
        <button
          onClick={onClose}
          aria-label="닫기"
          style={{
            height: '44px',
            padding: '0 20px',
            background: 'transparent',
            border: '2px solid #2a2a3e',
            borderRadius: 0,
            color: '#7070a0',
            fontFamily: 'monospace',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  background: '#12121e',
  border: '2px solid #2a2a3e',
  borderRadius: 0,
  color: '#e0e0f0',
  fontFamily: 'monospace',
  fontSize: '14px',
  padding: '0 12px',
  outline: 'none',
  caretColor: '#FF6B2C',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};
