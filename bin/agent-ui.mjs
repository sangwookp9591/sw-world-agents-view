#!/usr/bin/env node
/**
 * swkit agent-ui
 * 현재 Claude Code 세션을 브라우저에서 3D 오피스로 표시합니다.
 *
 * Usage:
 *   node bin/agent-ui.mjs
 *   npx sw-world-agents-view
 *   swkit agent-ui (sw-kit 연동 시)
 */

import { execFileSync, spawn } from 'child_process';
import crypto from 'crypto';

const OFFICE_URL = process.env.SWKIT_OFFICE_URL || 'https://office.sw-world.site';
const TEAM_ID = process.env.SWKIT_TEAM_ID || 'default';
const AGENT_NAME = process.env.SWKIT_AGENT_NAME || process.env.USER || 'unknown';
const AGENT_ROLE = process.env.SWKIT_AGENT_ROLE || 'developer';
const LOCAL_PORT = 3000;

async function checkServer(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function startLocalServer() {
  console.log('  🚀 로컬 서버 시작 중...');
  const proc = spawn('npm', ['run', 'dev'], {
    cwd: new URL('..', import.meta.url).pathname,
    detached: true,
    stdio: 'ignore',
  });
  proc.unref();

  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await checkServer(`http://localhost:${LOCAL_PORT}`)) {
      console.log('  ✅ 로컬 서버 시작됨');
      return `http://localhost:${LOCAL_PORT}`;
    }
  }
  throw new Error('서버 시작 시간 초과');
}

function openBrowser(url) {
  try {
    execFileSync('open', [url], { stdio: 'ignore' }); // macOS
  } catch {
    try {
      execFileSync('xdg-open', [url], { stdio: 'ignore' }); // Linux
    } catch {
      console.log(`  📎 브라우저에서 열기: ${url}`);
    }
  }
}

async function main() {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🏢 sw-world agents view');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. 서버 확인
  let serverUrl = OFFICE_URL;
  const isRemote = !serverUrl.includes('localhost');

  if (isRemote) {
    const ok = await checkServer(serverUrl);
    if (ok) {
      console.log(`  ✅ 서버 연결됨: ${serverUrl}`);
    } else {
      console.log('  ⚠️ 원격 서버 응답 없음, 로컬로 전환');
      serverUrl = await startLocalServer();
    }
  } else {
    const ok = await checkServer(serverUrl);
    if (!ok) {
      serverUrl = await startLocalServer();
    } else {
      console.log('  ✅ 로컬 서버 실행 중');
    }
  }

  // 2. 세션 ID
  const sessionId = `agent-${AGENT_NAME}-${crypto.randomBytes(3).toString('hex')}`;

  // 3. 세션 등록
  try {
    const res = await fetch(`${serverUrl}/api/relay/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.RELAY_SECRET ? { 'x-relay-secret': process.env.RELAY_SECRET } : {}),
      },
      body: JSON.stringify({
        sessionId,
        userId: process.env.USER || 'unknown',
        agentName: AGENT_NAME,
        agentRole: AGENT_ROLE,
        teamId: TEAM_ID,
        status: 'active',
        registeredAt: Date.now(),
        lastEventAt: Date.now(),
        sharing: { enabled: true, allowRemoteControl: !!process.env.CLAUDE_REMOTE_CONTROL_URL },
      }),
    });
    if (!res.ok) { console.error('  ❌ 세션 등록 실패'); process.exit(1); }
  } catch (err) {
    console.error(`  ❌ 서버 연결 실패: ${err.message}`);
    process.exit(1);
  }

  // 4. 초대 코드 생성
  let inviteCode = '';
  try {
    const res = await fetch(`${serverUrl}/api/sessions/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.RELAY_SECRET ? { 'x-relay-secret': process.env.RELAY_SECRET } : {}),
      },
      body: JSON.stringify({ sessionId }),
    });
    if (res.ok) {
      const data = await res.json();
      inviteCode = data.invite?.code || '';
    }
  } catch { /* ignore */ }

  // 5. 브라우저 오픈
  const openUrl = `${serverUrl}?session=${sessionId}`;
  openBrowser(openUrl);

  // 6. 결과 출력
  console.log('');
  console.log(`  👤 Agent: ${AGENT_NAME} (${AGENT_ROLE})`);
  console.log(`  🏢 Team:  ${TEAM_ID}`);
  console.log(`  🔗 URL:   ${openUrl}`);

  if (inviteCode) {
    console.log('');
    console.log('  ┌─────────────────────────────┐');
    console.log(`  │  📨 초대 코드: ${inviteCode.padEnd(13)}│`);
    console.log('  │  (5분간 유효)                │');
    console.log('  └─────────────────────────────┘');
    console.log('');
    console.log('  팀원에게 코드를 공유하면 세션에 입장할 수 있습니다.');
    console.log(`  또는 링크 공유: ${serverUrl}?code=${inviteCode}`);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
