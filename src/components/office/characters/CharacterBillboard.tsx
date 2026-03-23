'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { loadAgentTexture } from './SvgSpriteLoader';
import { AgentTooltip } from '@/components/ui/AgentTooltip';
import { PermissionBubble } from './PermissionBubble';
import { useOfficeStore } from '@/stores/office-store';

interface CharacterBillboardProps {
  agentId: string;
  position: [number, number, number];
  name: string;
  role: string;
  agentStatus?: 'idle' | 'working' | 'reviewing' | 'blocked';
  currentTool?: string;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  isHovered?: boolean;
}

export function CharacterBillboard({
  agentId,
  position,
  name,
  role,
  agentStatus = 'idle',
  currentTool,
  onSelect,
  onHover,
  isHovered = false,
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
    loadAgentTexture(agentId).then((t) => {
      if (!cancelled) {
        setTexture(t);
        if (materialRef.current) {
          materialRef.current.map = t;
          materialRef.current.needsUpdate = true;
        }
      }
    }).catch(() => {
      // 로드 실패 시 무시 (텍스처 없이 투명 표시)
    });
    return () => { cancelled = true; };
  }, [agentId]);

  // 상태별 색상 표시등
  const statusColor = agentStatus === 'working' ? '#22c55e'
    : agentStatus === 'reviewing' ? '#3b82f6'
    : agentStatus === 'blocked' ? '#ef4444'
    : '#6b7280';

  const [bx, by, bz] = position;
  const charPos: [number, number, number] = [bx, by + 1.2, bz + 0.7];

  return (
    <Billboard position={charPos} follow lockX={false} lockY={false} lockZ={false}>
      {/* 도트 캐릭터 (sw-kit SVG) */}
      <mesh
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
        />
      </mesh>

      {/* 상태 표시등 (머리 위 작은 원) */}
      <mesh position={[0, 0.6, 0.01]}>
        <circleGeometry args={[0.06, 8]} />
        <meshBasicMaterial color={statusColor} toneMapped={false} />
      </mesh>

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
        <PermissionBubble
          approval={pendingApproval}
          onOpenModal={setActiveApproval}
        />
      )}

      {/* 이름표 */}
      <Text
        position={[0, 0.68, 0.01]}
        fontSize={0.16}
        color="#ffffff"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000"
        font={undefined}
      >
        {name}
      </Text>

      {/* 역할 */}
      <Text
        position={[0, 0.55, 0.01]}
        fontSize={0.10}
        color="#FFB088"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.015}
        outlineColor="#000000"
        font={undefined}
      >
        {role}
      </Text>
    </Billboard>
  );
}
