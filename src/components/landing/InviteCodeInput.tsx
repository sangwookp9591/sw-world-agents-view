'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type ValidationStatus = 'idle' | 'loading' | 'valid' | 'invalid' | 'expired';

interface ValidationResult {
  status: 'valid' | 'invalid' | 'expired';
  agentName?: string;
  sessionId?: string;
}

export interface InviteCodeInputProps {
  readonly initialCode?: string | null;
  readonly onJoining?: () => void;
}

function formatCode(raw: string): string {
  // Strip non-alphanumeric, uppercase, max 8 chars (XXXX-XXXX without hyphen = 8)
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
  if (clean.length <= 4) return clean;
  return `${clean.slice(0, 4)}-${clean.slice(4)}`;
}

async function validateCode(code: string): Promise<ValidationResult> {
  const normalized = code.toUpperCase().trim();
  try {
    const res = await fetch(`/api/sessions/invite/${encodeURIComponent(normalized)}`);
    if (res.status === 404) {
      return { status: 'invalid' };
    }
    if (!res.ok) {
      return { status: 'invalid' };
    }
    const data = (await res.json()) as { status: string; agentName?: string; sessionId?: string };
    if (data.status === 'valid') {
      return { status: 'valid', agentName: data.agentName, sessionId: data.sessionId };
    }
    return { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}

export function InviteCodeInput({ initialCode, onJoining }: Readonly<InviteCodeInputProps>) {
  const router = useRouter();
  const [value, setValue] = useState(initialCode ? formatCode(initialCode) : '');
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isComplete = value.replace('-', '').length === 8;

  const runValidation = useCallback(async (code: string) => {
    setValidationStatus('loading');
    setJoinError(null);
    const result = await validateCode(code);
    setValidationResult(result);
    setValidationStatus(result.status);
  }, []);

  useEffect(() => {
    if (!isComplete) {
      setValidationStatus('idle');
      setValidationResult(null);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      runValidation(value);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [value, isComplete, runValidation]);

  // Auto-validate initialCode on mount
  useEffect(() => {
    if (initialCode && formatCode(initialCode).replace('-', '').length === 8) {
      runValidation(formatCode(initialCode));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setValue(formatted);
  };

  const handleJoin = async () => {
    if (validationStatus !== 'valid' || isJoining) return;
    setIsJoining(true);
    setJoinError(null);
    onJoining?.();

    try {
      const res = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: value }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setJoinError(data.error ?? '입장에 실패했습니다');
        setIsJoining(false);
        return;
      }

      const data = (await res.json()) as { sessionId: string };
      router.push(`/?session=${encodeURIComponent(data.sessionId)}`);
    } catch {
      setJoinError('서버 연결에 실패했습니다');
      setIsJoining(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleJoin();
  };

  const borderColor = (): string => {
    switch (validationStatus) {
      case 'valid':
        return '#22c55e';
      case 'invalid':
      case 'expired':
        return '#ef4444';
      case 'loading':
        return '#6b7280';
      default:
        return '#3a3a5c';
    }
  };

  const statusMessage = (): React.ReactNode => {
    if (joinError) {
      return <span style={{ color: '#ef4444' }}>ERR: {joinError}</span>;
    }
    switch (validationStatus) {
      case 'loading':
        return <span style={{ color: '#6b7280' }}>검증 중...</span>;
      case 'valid':
        return (
          <span style={{ color: '#22c55e' }}>
            [OK] {validationResult?.agentName}의 세션 — 입장 가능
          </span>
        );
      case 'invalid':
        return <span style={{ color: '#ef4444' }}>[ERR] 유효하지 않은 코드</span>;
      case 'expired':
        return <span style={{ color: '#ef4444' }}>[ERR] 만료된 코드</span>;
      default:
        return null;
    }
  };

  const canJoin = validationStatus === 'valid' && !isJoining;

  return (
    <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Input row */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="IRON-7K2X"
          maxLength={9}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="characters"
          aria-label="초대 코드 입력"
          style={{
            flex: 1,
            height: '56px',
            background: '#12121e',
            border: `2px solid ${borderColor()}`,
            borderRadius: '0px',
            color: '#e0e0f0',
            fontFamily: 'monospace',
            fontSize: '22px',
            letterSpacing: '0.15em',
            padding: '0 16px',
            outline: 'none',
            textTransform: 'uppercase',
            caretColor: '#FF6B2C',
            transition: 'border-color 0.15s',
          }}
        />
        <button
          onClick={handleJoin}
          disabled={!canJoin}
          aria-label="입장하기"
          style={{
            height: '56px',
            padding: '0 24px',
            background: canJoin ? '#FF6B2C' : '#1e1e3a',
            border: '2px solid',
            borderColor: canJoin ? '#FF6B2C' : '#2a2a4a',
            borderRadius: '0px',
            color: canJoin ? '#ffffff' : '#4a4a6a',
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: canJoin ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            if (canJoin) {
              (e.currentTarget as HTMLButtonElement).style.background = '#FF8F5C';
            }
          }}
          onMouseLeave={(e) => {
            if (canJoin) {
              (e.currentTarget as HTMLButtonElement).style.background = '#FF6B2C';
            }
          }}
        >
          {isJoining ? '입장 중...' : '입장하기'}
        </button>
      </div>

      {/* Status message */}
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '13px',
          minHeight: '18px',
          paddingLeft: '2px',
        }}
        role="status"
        aria-live="polite"
      >
        {statusMessage()}
      </div>
    </div>
  );
}
