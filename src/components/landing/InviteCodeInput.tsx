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
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
  if (clean.length <= 4) return clean;
  return `${clean.slice(0, 4)}-${clean.slice(4)}`;
}

async function validateCode(code: string): Promise<ValidationResult> {
  const normalized = code.toUpperCase().trim();
  try {
    const res = await fetch(`/api/sessions/invite/${encodeURIComponent(normalized)}`);
    if (res.status === 404) return { status: 'invalid' };
    if (!res.ok) return { status: 'invalid' };
    const data = (await res.json()) as { status: string; agentName?: string; sessionId?: string };
    if (data.status === 'valid') return { status: 'valid', agentName: data.agentName, sessionId: data.sessionId };
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
    debounceTimer.current = setTimeout(() => runValidation(value), 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [value, isComplete, runValidation]);

  useEffect(() => {
    if (initialCode && formatCode(initialCode).replace('-', '').length === 8) {
      runValidation(formatCode(initialCode));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(formatCode(e.target.value));

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
      case 'valid': return '#22c55e';
      case 'invalid': case 'expired': return '#ef4444';
      case 'loading': return 'rgba(45,52,54,0.3)';
      default: return 'rgba(255, 107, 44, 0.3)';
    }
  };

  const statusMessage = (): React.ReactNode => {
    if (joinError) return <span style={{ color: '#ef4444' }}>{joinError}</span>;
    switch (validationStatus) {
      case 'loading': return <span style={{ color: 'rgba(45,52,54,0.5)' }}>검증 중...</span>;
      case 'valid': return <span style={{ color: '#22c55e' }}>{validationResult?.agentName}의 세션 — 입장 가능</span>;
      case 'invalid': return <span style={{ color: '#ef4444' }}>유효하지 않은 코드</span>;
      case 'expired': return <span style={{ color: '#ef4444' }}>만료된 코드</span>;
      default: return null;
    }
  };

  const canJoin = validationStatus === 'valid' && !isJoining;

  return (
    <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            height: '52px',
            background: '#FFFFFF',
            border: `2px solid ${borderColor()}`,
            borderRadius: '12px',
            color: '#2D3436',
            fontFamily: 'monospace',
            fontSize: '20px',
            letterSpacing: '0.15em',
            padding: '0 16px',
            outline: 'none',
            textTransform: 'uppercase',
            caretColor: '#FF6B2C',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxShadow: validationStatus === 'valid' ? '0 0 0 3px rgba(34,197,94,0.1)' : 'none',
          }}
          onFocus={(e) => {
            if (validationStatus === 'idle') e.currentTarget.style.borderColor = '#FF6B2C';
          }}
          onBlur={(e) => {
            if (validationStatus === 'idle') e.currentTarget.style.borderColor = 'rgba(255,107,44,0.3)';
          }}
        />
        <button
          onClick={handleJoin}
          disabled={!canJoin}
          aria-label="입장하기"
          style={{
            height: '52px',
            padding: '0 24px',
            background: canJoin ? '#FF6B2C' : 'rgba(45,52,54,0.1)',
            border: 'none',
            borderRadius: '12px',
            color: canJoin ? '#ffffff' : 'rgba(45,52,54,0.3)',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            cursor: canJoin ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { if (canJoin) e.currentTarget.style.background = '#FF8F5C'; }}
          onMouseLeave={(e) => { if (canJoin) e.currentTarget.style.background = '#FF6B2C'; }}
        >
          {isJoining ? '입장 중...' : '입장하기 →'}
        </button>
      </div>

      <div style={{ fontSize: '13px', minHeight: '18px', paddingLeft: '4px' }} role="status" aria-live="polite">
        {statusMessage()}
      </div>
    </div>
  );
}
