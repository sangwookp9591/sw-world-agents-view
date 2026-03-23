'use client';

import { Grid } from '@react-three/drei';

interface EnvironmentProps {
  showGrid?: boolean;
}

export function Environment({ showGrid = true }: Readonly<EnvironmentProps>) {
  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.4} color="#c8c8ff" />
      <directionalLight position={[8, 12, 8]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, 8, -5]} intensity={0.3} color="#6666cc" />
      <pointLight position={[0, 5, 0]} intensity={0.2} color="#ffffff" />

      {/* 바닥 — 넓은 사무실 카펫 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#1e1e30" />
      </mesh>

      {/* 뒤 벽만 (낮게, 반투명 느낌) */}
      <mesh position={[0, 1.2, -10]}>
        <boxGeometry args={[24, 2.4, 0.15]} />
        <meshStandardMaterial color="#16162a" />
      </mesh>

      {/* 벽 위 장식선 (accent) */}
      <mesh position={[0, 2.45, -10]}>
        <boxGeometry args={[24, 0.08, 0.2]} />
        <meshStandardMaterial color="#3a3a6a" />
      </mesh>

      {/* 좌측 낮은 파티션 */}
      <mesh position={[-11.5, 0.6, -2]}>
        <boxGeometry args={[0.1, 1.2, 16]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.6} />
      </mesh>

      {/* 우측 낮은 파티션 */}
      <mesh position={[11.5, 0.6, -2]}>
        <boxGeometry args={[0.1, 1.2, 16]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.6} />
      </mesh>

      {/* 바닥 러그 (중앙 복도) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[3, 14]} />
        <meshStandardMaterial color="#252540" />
      </mesh>

      {/* 그리드 오버레이 */}
      {showGrid && (
        <Grid
          args={[24, 20]}
          position={[0, 0.01, 0]}
          cellSize={1}
          cellThickness={0.3}
          cellColor="#2a2a4a"
          sectionSize={5}
          sectionThickness={0.6}
          sectionColor="#3a3a6a"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
      )}
    </>
  );
}
