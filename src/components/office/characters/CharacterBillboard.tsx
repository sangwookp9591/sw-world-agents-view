'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loadAgentTexture } from './SvgSpriteLoader';
import { AgentTooltip } from '@/components/ui/AgentTooltip';
import { PermissionBubble } from './PermissionBubble';
import { ChatBubble } from './ChatBubble';
import { useOfficeStore } from '@/stores/office-store';

interface CharacterBillboardProps {
  agentId: string;
  position: [number, number, number];
  name: string;
  role: string;
  screenColor?: string;
  agentStatus?: 'idle' | 'working' | 'reviewing' | 'blocked';
  currentTool?: string;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  isHovered?: boolean;
  isSelected?: boolean;
  lastChatMessage?: string;
}

/** agentId 기반으로 0~2π 범위의 고정 오프셋 계산 (동기화 방지) */
function hashIdleOffset(agentId: string): number {
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    hash = (hash * 31 + agentId.charCodeAt(i)) & 0xffffffff;
  }
  return ((hash >>> 0) / 0xffffffff) * Math.PI * 2;
}

export function CharacterBillboard({
  agentId,
  position,
  name,
  role,
  screenColor,
  agentStatus = 'idle',
  currentTool,
  onSelect,
  onHover,
  isHovered = false,
  isSelected = false,
  lastChatMessage,
}: Readonly<CharacterBillboardProps>) {
  const approvals = useOfficeStore((s) => s.approvals);
  const setActiveApproval = useOfficeStore((s) => s.setActiveApproval);

  const pendingApproval = approvals.find(
    (a) =>
      a.status === 'pending' &&
      (a.agentName.toLowerCase() === agentId.toLowerCase() ||
        a.agentName.toLowerCase() === name.toLowerCase()),
  );

  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // 스폰 페이드인
  const [targetOpacity, setTargetOpacity] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setTargetOpacity(1), 50);
    return () => clearTimeout(timer);
  }, []);

  const idleOffset = hashIdleOffset(agentId);

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onSelect?.(agentId);
    },
    [agentId, onSelect],
  );

  const handlePointerOver = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onHover?.(agentId);
    },
    [agentId, onHover],
  );

  const handlePointerOut = useCallback(() => {
    onHover?.(null);
  }, [onHover]);

  // SVG 텍스처 로드
  useEffect(() => {
    let cancelled = false;
    loadAgentTexture(agentId)
      .then((t) => {
        if (!cancelled) {
          setTexture(t);
          if (materialRef.current) {
            materialRef.current.map = t;
            materialRef.current.needsUpdate = true;
          }
        }
      })
      .catch(() => {
        // 로드 실패 시 무시 (텍스처 없이 투명 표시)
      });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  // idle 걸어다니기 — 데스크 주변 원형 산책
  const walkRadius = 1.5;
  const walkSpeed = 0.3;

  // 애니메이션 프레임
  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const isWorking = agentStatus === 'working' || agentStatus === 'reviewing';

    if (isWorking) {
      // 작업 중: 데스크에 앉아서 작업 (원래 위치)
      meshRef.current.position.x = 0;
      meshRef.current.position.y = 0;
      meshRef.current.position.z = 0;
      const pulse = 1.0 + Math.sin(clock.elapsedTime * 3) * 0.02;
      meshRef.current.scale.set(pulse, pulse, 1);
    } else {
      // idle/blocked: 데스크 주변을 걸어다님
      const t = clock.elapsedTime * walkSpeed + idleOffset;
      meshRef.current.position.x = Math.sin(t) * walkRadius;
      meshRef.current.position.y = Math.sin(t * 2) * 0.05; // 살짝 바운스
      meshRef.current.position.z = Math.cos(t) * walkRadius * 0.7;
      meshRef.current.scale.set(1, 1, 1);
    }

    // 페이드인 lerp
    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        targetOpacity,
        0.05,
      );
    }
  });

  // 상태별 표시등 색상
  const statusColor =
    agentStatus === 'working'
      ? screenColor || '#22c55e'
      : agentStatus === 'reviewing'
        ? '#3b82f6'
        : agentStatus === 'blocked'
          ? '#ef4444'
          : '#6b7280';

  const [bx, by, bz] = position;
  const charPos: [number, number, number] = [bx, by + 1.2, bz + 0.7];

  return (
    <Billboard position={charPos} follow lockX={false} lockY={false} lockZ={false}>
      {/* 도트 캐릭터 (sw-kit SVG) */}
      <mesh
        ref={meshRef}
        scale={[1.0, 1.0, 1]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={materialRef}
          map={texture}
          transparent
          alphaTest={0.1}
          side={THREE.DoubleSide}
          toneMapped={false}
          opacity={0}
        />
      </mesh>

      {/* 선택 하이라이트 링 */}
      {isSelected && (
        <mesh position={[0, -0.45, -0.01]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.42, 24]} />
          <meshBasicMaterial
            color={screenColor || '#FF6B2C'}
            transparent
            opacity={0.6}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* working 상태 포인트 라이트 */}
      {agentStatus === 'working' && screenColor && (
        <pointLight position={[0, 0.3, 0.3]} color={screenColor} intensity={0.3} distance={2} />
      )}

      {/* 상태 표시등 (머리 위 작은 원) */}
      <mesh position={[0, 0.6, 0.01]}>
        <circleGeometry args={[0.06, 8]} />
        <meshBasicMaterial color={statusColor} toneMapped={false} />
      </mesh>

      {/* 채팅 말풍선 */}
      {lastChatMessage && (
        <ChatBubble text={lastChatMessage} screenColor={screenColor} />
      )}

      {/* 호버 말풍선 */}
      {isHovered && (
        <AgentTooltip
          name={name}
          role={role}
          status={agentStatus}
          currentTool={currentTool}
        />
      )}

      {/* 승인 대기 경고 */}
      {pendingApproval && (
        <PermissionBubble approval={pendingApproval} onOpenModal={setActiveApproval} />
      )}

      {/* 이름표 */}
      <Text
        position={[0, 0.68, 0.01]}
        fontSize={0.16}
        color="#2D3436"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#ffffff"
        font={undefined}
      >
        {name}
      </Text>

      {/* 역할 */}
      <Text
        position={[0, 0.55, 0.01]}
        fontSize={0.10}
        color="#FF6B2C"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.015}
        outlineColor="#ffffff"
        font={undefined}
      >
        {role}
      </Text>
    </Billboard>
  );
}
