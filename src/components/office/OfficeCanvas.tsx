'use client';

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Environment } from './Environment';
import { OfficeLayout } from './OfficeLayout';
import { AgentCharacters } from './characters/AgentCharacters';

function TestBox() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

export default function OfficeCanvas() {
  const [showGrid, setShowGrid] = useState(true);
  const [debugMode, setDebugMode] = useState(false); // 풀 씬 기본

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* 컨트롤 버튼들 */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setDebugMode((v) => !v)}
          style={{
            padding: '4px 10px',
            background: debugMode ? 'rgba(255,100,100,0.8)' : 'rgba(30,30,60,0.8)',
            color: '#aaaaff',
            border: '1px solid #3a3a6a',
            borderRadius: 0,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        >
          {debugMode ? '▶ Full Scene' : '⬛ Debug'}
        </button>
        <button
          onClick={() => setShowGrid((v) => !v)}
          style={{
            padding: '4px 10px',
            background: 'rgba(30,30,60,0.8)',
            color: '#aaaaff',
            border: '1px solid #3a3a6a',
            borderRadius: 0,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        >
          {showGrid ? 'Grid OFF' : 'Grid ON'}
        </button>
      </div>

      <Canvas
        camera={{ position: [0, 15, 18], fov: 40 }}
        style={{ background: '#0a0a0f' }}
        frameloop="always"
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
          depth: true,
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a0f');
          console.log('[swkit-office] WebGL initialized:', gl.getContext().getParameter(gl.getContext().RENDERER));
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 8, 5]} intensity={1.0} />

          {debugMode ? (
            <>
              <TestBox />
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#1a1a2e" />
              </mesh>
            </>
          ) : (
            <>
              <Environment showGrid={showGrid} />
              <OfficeLayout />
              <AgentCharacters />
            </>
          )}

          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={5}
            maxDistance={25}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
