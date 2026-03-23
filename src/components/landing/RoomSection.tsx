'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateRoomModal } from './CreateRoomModal';

export interface RoomInfo {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly isPublic: boolean;
  readonly memberCount: number;
  readonly maxMembers: number;
  readonly allowSpectators: boolean;
}

export interface RoomSectionProps {
  readonly onEntering?: () => void;
}

function formatRoomCode(raw: string): string {
  const clean = raw.replace(/[^A-Za-z0-9-]/g, '').toUpperCase().slice(0, 12);
  return clean;
}

export function RoomSection({ onEntering }: Readonly<RoomSectionProps>) {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isEntering, setIsEntering] = useState(false);
  const [enterError, setEnterError] = useState<string | null>(null);

  const fetchPublicRooms = useCallback(async () => {
    setIsLoadingRooms(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/rooms?public=true');
      if (!res.ok) throw new Error('룸 목록을 불러오지 못했습니다');
      const data = (await res.json()) as { rooms: RoomInfo[] };
      setRooms(data.rooms ?? []);
    } catch {
      setLoadError('룸 목록을 불러오지 못했습니다');
      setRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicRooms();
  }, [fetchPublicRooms]);

  const handleEnterRoom = useCallback(
    async (roomId: string) => {
      if (isEntering) return;
      setIsEntering(true);
      setEnterError(null);
      onEntering?.();
      try {
        router.push(`/?room=${encodeURIComponent(roomId)}`);
      } catch {
        setEnterError('룸 입장에 실패했습니다');
        setIsEntering(false);
      }
    },
    [isEntering, onEntering, router],
  );

  const handleEnterByCode = useCallback(async () => {
    const code = roomCodeInput.trim().toUpperCase();
    if (!code || isEntering) return;
    setIsEntering(true);
    setEnterError(null);
    onEntering?.();
    try {
      const res = await fetch(`/api/rooms/by-code/${encodeURIComponent(code)}`);
      if (!res.ok) {
        setEnterError('유효하지 않은 룸 코드입니다');
        setIsEntering(false);
        return;
      }
      const data = (await res.json()) as { id: string };
      router.push(`/?room=${encodeURIComponent(data.id)}`);
    } catch {
      setEnterError('서버 연결에 실패했습니다');
      setIsEntering(false);
    }
  }, [roomCodeInput, isEntering, onEntering, router]);

  const handleRoomCreated = useCallback(
    (roomId: string) => {
      setShowCreateModal(false);
      router.push(`/?room=${encodeURIComponent(roomId)}`);
    },
    [router],
  );

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Create Room Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        aria-label="새 룸 만들기"
        style={{
          width: '100%',
          height: '48px',
          background: '#FF6B2C',
          border: '2px solid #FF6B2C',
          borderRadius: 0,
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          letterSpacing: '0.05em',
          transition: 'background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#FF8F5C';
          e.currentTarget.style.borderColor = '#FF8F5C';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#FF6B2C';
          e.currentTarget.style.borderColor = '#FF6B2C';
        }}
      >
        + 룸 만들기
      </button>

      {/* Public Room List */}
      <section aria-label="공개 룸 목록">
        <div
          style={{
            fontSize: '11px',
            color: '#4a4a7a',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '12px',
          }}
        >
          공개 룸
        </div>

        {isLoadingRooms && (
          <div
            style={{
              padding: '20px 0',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#4a4a7a',
            }}
          >
            불러오는 중...
          </div>
        )}

        {!isLoadingRooms && loadError && (
          <div
            role="alert"
            style={{
              padding: '16px',
              border: '1px solid #3a1a1a',
              background: '#1a0a0a',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <span>{loadError}</span>
            <button
              onClick={fetchPublicRooms}
              style={{
                background: 'transparent',
                border: '1px solid #ef4444',
                borderRadius: 0,
                color: '#ef4444',
                fontFamily: 'monospace',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '2px 8px',
              }}
            >
              재시도
            </button>
          </div>
        )}

        {!isLoadingRooms && !loadError && rooms.length === 0 && (
          <div
            style={{
              padding: '24px 0',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#333355',
            }}
          >
            아직 공개 룸이 없습니다
          </div>
        )}

        {!isLoadingRooms && !loadError && rooms.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEnter={handleEnterRoom}
                disabled={isEntering}
              />
            ))}
          </div>
        )}
      </section>

      {/* Private Room Code Entry */}
      <section aria-label="비공개 룸 입장">
        <div
          style={{
            fontSize: '11px',
            color: '#4a4a7a',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '12px',
          }}
        >
          룸 코드로 입장
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(formatRoomCode(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEnterByCode();
            }}
            placeholder="SWKIT-A1B2"
            maxLength={12}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="characters"
            aria-label="룸 코드 입력"
            style={{
              flex: 1,
              height: '44px',
              background: '#12121e',
              border: '2px solid #2a2a3e',
              borderRadius: 0,
              color: '#e0e0f0',
              fontFamily: 'monospace',
              fontSize: '16px',
              letterSpacing: '0.1em',
              padding: '0 12px',
              outline: 'none',
              textTransform: 'uppercase',
              caretColor: '#FF6B2C',
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
            onClick={handleEnterByCode}
            disabled={!roomCodeInput.trim() || isEntering}
            aria-label="룸 코드로 입장"
            style={{
              height: '44px',
              padding: '0 20px',
              background: roomCodeInput.trim() && !isEntering ? '#FF6B2C' : '#1e1e3a',
              border: '2px solid',
              borderColor: roomCodeInput.trim() && !isEntering ? '#FF6B2C' : '#2a2a4a',
              borderRadius: 0,
              color: roomCodeInput.trim() && !isEntering ? '#ffffff' : '#4a4a6a',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: roomCodeInput.trim() && !isEntering ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (roomCodeInput.trim() && !isEntering) {
                e.currentTarget.style.background = '#FF8F5C';
              }
            }}
            onMouseLeave={(e) => {
              if (roomCodeInput.trim() && !isEntering) {
                e.currentTarget.style.background = '#FF6B2C';
              }
            }}
          >
            {isEntering ? '입장 중...' : '입장'}
          </button>
        </div>

        {enterError && (
          <div
            role="alert"
            style={{
              marginTop: '8px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#ef4444',
            }}
          >
            [ERR] {enterError}
          </div>
        )}
      </section>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleRoomCreated}
        />
      )}
    </div>
  );
}

interface RoomCardProps {
  readonly room: RoomInfo;
  readonly onEnter: (roomId: string) => void;
  readonly disabled: boolean;
}

function RoomCard({ room, onEnter, disabled }: Readonly<RoomCardProps>) {
  return (
    <div
      style={{
        background: '#12121e',
        border: '1px solid #2a2a3e',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#FF6B2C';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a3e';
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#e0e0f0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: '6px',
          }}
        >
          {room.name}
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'rgba(224,224,240,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span>
            {room.memberCount}/{room.maxMembers} members
          </span>
          <span style={{ color: '#2a2a3e' }}>|</span>
          <span style={{ color: room.isPublic ? '#22c55e' : '#6b7280' }}>
            {room.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      <button
        onClick={() => onEnter(room.id)}
        disabled={disabled}
        aria-label={`${room.name} 룸 입장하기`}
        style={{
          height: '36px',
          padding: '0 16px',
          background: 'transparent',
          border: '1px solid #FF6B2C',
          borderRadius: 0,
          color: '#FF6B2C',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: disabled ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'background 0.15s, color 0.15s',
          opacity: disabled ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = '#FF6B2C';
            e.currentTarget.style.color = '#ffffff';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#FF6B2C';
          }
        }}
      >
        입장하기 &rarr;
      </button>
    </div>
  );
}
