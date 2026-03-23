'use client';

interface PositionProps {
  position: [number, number, number];
}

export function Desk({ position }: Readonly<PositionProps>) {
  const [x, y, z] = position;

  return (
    <group>
      {/* 상판 */}
      <mesh position={[x, y + 0.75, z]}>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      {/* 다리 4개 */}
      {[
        [x - 0.55, y + 0.35, z - 0.25],
        [x + 0.55, y + 0.35, z - 0.25],
        [x - 0.55, y + 0.35, z + 0.25],
        [x + 0.55, y + 0.35, z + 0.25],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.05, 0.7, 0.05]} />
          <meshStandardMaterial color="#2a1e15" roughness={0.9} />
        </mesh>
      ))}
      {/* 키보드 */}
      <mesh position={[x, y + 0.79, z + 0.12]}>
        <boxGeometry args={[0.35, 0.015, 0.12]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      {/* 커피 머그 */}
      <mesh position={[x + 0.4, y + 0.80, z + 0.15]}>
        <cylinderGeometry args={[0.035, 0.03, 0.08, 8]} />
        <meshStandardMaterial color="#884422" />
      </mesh>
    </group>
  );
}

export function Chair({ position }: Readonly<PositionProps>) {
  const [x, y, z] = position;

  return (
    <group>
      {/* 좌석 */}
      <mesh position={[x, y + 0.45, z]}>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#222233" roughness={0.7} />
      </mesh>
      {/* 등받이 */}
      <mesh position={[x, y + 0.75, z - 0.22]}>
        <boxGeometry args={[0.5, 0.6, 0.05]} />
        <meshStandardMaterial color="#222233" roughness={0.7} />
      </mesh>
      {/* 지지대 */}
      <mesh position={[x, y + 0.22, z]}>
        <cylinderGeometry args={[0.03, 0.03, 0.44, 6]} />
        <meshStandardMaterial color="#111111" metalness={0.5} />
      </mesh>
      {/* 바퀴 베이스 (별 모양) */}
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh key={i} position={[x + Math.cos(rad) * 0.2, y + 0.03, z + Math.sin(rad) * 0.2]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        );
      })}
    </group>
  );
}

export function Monitor({ position }: Readonly<PositionProps>) {
  const [x, y, z] = position;

  return (
    <group>
      {/* 화면 프레임 */}
      <mesh position={[x, y + 1.05, z]}>
        <boxGeometry args={[0.45, 0.32, 0.02]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
      </mesh>
      {/* 화면 (밝은 파랑 발광) */}
      <mesh position={[x, y + 1.05, z + 0.011]}>
        <boxGeometry args={[0.40, 0.27, 0.001]} />
        <meshStandardMaterial
          color="#FF6B2C"
          emissive="#FF6B2C"
          emissiveIntensity={0.5}
          roughness={0.1}
        />
      </mesh>
      {/* 스탠드 */}
      <mesh position={[x, y + 0.85, z - 0.005]}>
        <boxGeometry args={[0.03, 0.2, 0.03]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} />
      </mesh>
      {/* 베이스 */}
      <mesh position={[x, y + 0.77, z + 0.02]}>
        <boxGeometry args={[0.18, 0.02, 0.12]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} />
      </mesh>
    </group>
  );
}

export function KanbanBoard({ position }: Readonly<PositionProps>) {
  const [x, y, z] = position;

  return (
    <group>
      {/* 프레임 */}
      <mesh position={[x, y, z - 0.01]}>
        <boxGeometry args={[1.54, 1.04, 0.02]} />
        <meshStandardMaterial color="#555577" />
      </mesh>
      {/* 보드 표면 */}
      <mesh position={[x, y, z]}>
        <boxGeometry args={[1.5, 1.0, 0.03]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.9} />
      </mesh>
      {/* 컬럼 구분선 */}
      {[-0.38, 0.12].map((offset, i) => (
        <mesh key={i} position={[x + offset, y, z + 0.016]}>
          <boxGeometry args={[0.01, 0.9, 0.005]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      ))}
      {/* 컬럼 헤더: Todo(빨강) / Progress(노랑) / Done(초록) */}
      {[
        { dx: -0.55, color: '#ff6b6b' },
        { dx: -0.07, color: '#ffd93d' },
        { dx: 0.41, color: '#6bcb77' },
      ].map(({ dx, color }, i) => (
        <mesh key={i} position={[x + dx, y + 0.41, z + 0.018]}>
          <boxGeometry args={[0.36, 0.12, 0.002]} />
          <meshStandardMaterial color={color} roughness={1} />
        </mesh>
      ))}
      {/* 태스크 카드들 (장식) */}
      {[
        { dx: -0.55, dy: 0.15 }, { dx: -0.55, dy: -0.05 },
        { dx: -0.07, dy: 0.15 },
        { dx: 0.41, dy: 0.15 }, { dx: 0.41, dy: -0.05 }, { dx: 0.41, dy: -0.25 },
      ].map(({ dx, dy }, i) => (
        <mesh key={i} position={[x + dx, y + dy, z + 0.02]}>
          <boxGeometry args={[0.3, 0.14, 0.002]} />
          <meshStandardMaterial color="#e8e8e0" />
        </mesh>
      ))}
    </group>
  );
}

export function Whiteboard({ position }: Readonly<PositionProps>) {
  const [x, y, z] = position;

  return (
    <group>
      {/* 프레임 */}
      <mesh position={[x, y, z - 0.01]}>
        <boxGeometry args={[2.04, 1.24, 0.02]} />
        <meshStandardMaterial color="#555577" />
      </mesh>
      {/* 보드 표면 */}
      <mesh position={[x, y, z]}>
        <boxGeometry args={[2.0, 1.2, 0.03]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.95} />
      </mesh>
      {/* 마커 트레이 */}
      <mesh position={[x, y - 0.65, z + 0.02]}>
        <boxGeometry args={[1.8, 0.06, 0.06]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
      {/* 마커들 */}
      {[
        { dx: -0.2, color: '#ff4444' },
        { dx: 0, color: '#2244ff' },
        { dx: 0.2, color: '#22aa22' },
      ].map(({ dx, color }, i) => (
        <mesh key={i} position={[x + dx, y - 0.63, z + 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

/** 관엽식물 */
export function Plant({ position }: Readonly<PositionProps>) {
  const [x, y, z] = position;
  return (
    <group>
      {/* 화분 */}
      <mesh position={[x, y + 0.25, z]}>
        <cylinderGeometry args={[0.15, 0.12, 0.5, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* 잎 */}
      <mesh position={[x, y + 0.7, z]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** 워터쿨러 */
export function WaterCooler({ position }: Readonly<PositionProps>) {
  const [x, y, z] = position;
  return (
    <group>
      {/* 본체 */}
      <mesh position={[x, y + 0.5, z]}>
        <boxGeometry args={[0.3, 1.0, 0.3]} />
        <meshStandardMaterial color="#cccccc" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* 물통 */}
      <mesh position={[x, y + 1.15, z]}>
        <cylinderGeometry args={[0.12, 0.12, 0.35, 8]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
