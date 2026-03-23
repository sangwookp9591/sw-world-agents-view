'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OfficeView } from '@/components/office/OfficeView';
import { LandingPage } from '@/components/landing/LandingPage';

function PageLoading() {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FF6B2C',
        fontFamily: 'monospace',
        fontSize: '14px',
      }}
    >
      Loading...
    </div>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get('session');
  const codeParam = searchParams.get('code');
  const roomParam = searchParams.get('room');

  if (sessionParam || roomParam) {
    return <OfficeView sessionId={sessionParam ?? undefined} roomId={roomParam ?? undefined} />;
  }

  return <LandingPage initialCode={codeParam} />;
}

export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PageContent />
    </Suspense>
  );
}
