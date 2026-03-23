#!/usr/bin/env node
/**
 * swkit-office SessionStart hook
 * Claude Code 세션이 시작되면 자동으로 3D Office에 등록합니다.
 *
 * 단계:
 *   1. 세션 ID 추출 & 서버 연결 확인
 *   2. 세션 등록 (Remote Control 자동 감지)
 *   3. 세션 URL + 상태 정보 출력
 *
 * 설정: settings.json → hooks.SessionStart
 */

const RELAY_URL = process.env.SWKIT_OFFICE_URL || 'http://localhost:3000';
const TEAM_ID = process.env.SWKIT_TEAM_ID || 'default';
const AGENT_NAME = process.env.SWKIT_AGENT_NAME || process.env.USER || 'unknown';
const AGENT_ROLE = process.env.SWKIT_AGENT_ROLE || 'developer';

async function register() {
  try {
    const input = JSON.parse(await readStdin());
    const sessionId = input.session_id || `session-${Date.now()}`;

    // Step 1: 서버 연결 확인
    const serverOk = await checkServer(RELAY_URL);
    if (!serverOk) {
      console.error('[swkit-3d] ⚠ Office 서버 연결 불가 — 오프라인 모드');
      return;
    }

    // Step 2: Remote Control 감지
    const remoteControlUrl = process.env.CLAUDE_REMOTE_CONTROL_URL || undefined;
    const rcEnabled = !!remoteControlUrl;

    // Step 3: 세션 등록
    const body = {
      sessionId,
      userId: process.env.USER || 'unknown',
      agentName: AGENT_NAME,
      agentRole: AGENT_ROLE,
      teamId: TEAM_ID,
      status: 'active',
      registeredAt: Date.now(),
      lastEventAt: Date.now(),
      sharing: {
        enabled: true,
        allowRemoteControl: rcEnabled,
        remoteControlUrl: remoteControlUrl || null,
      },
    };

    const res = await fetch(`${RELAY_URL}/api/relay/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.RELAY_SECRET ? { 'x-relay-secret': process.env.RELAY_SECRET } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error('[swkit-3d] ❌ 세션 등록 실패');
      return;
    }

    // Step 4: 상태 정보 출력
    const sessionUrl = `${RELAY_URL}?session=${sessionId}`;

    console.error('');
    console.error('[swkit-3d] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`[swkit-3d]  🏢 3D Office 연결됨`);
    console.error('[swkit-3d] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`[swkit-3d]  👤 Agent: ${AGENT_NAME} (${AGENT_ROLE})`);
    console.error(`[swkit-3d]  🏷  Team:  ${TEAM_ID}`);
    console.error(`[swkit-3d]  🔗 URL:   ${sessionUrl}`);

    if (rcEnabled) {
      console.error(`[swkit-3d]  🎮 RC:    활성화됨`);
    } else {
      console.error(`[swkit-3d]  🎮 RC:    비활성화 (--remote-control 플래그로 활성화)`);
    }

    console.error('[swkit-3d] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');

  } catch {
    // 연결 실패 시 무시 (Office가 실행 안 중일 수 있음)
  }
}

async function checkServer(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (chunk) => data += chunk);
    process.stdin.on('end', () => resolve(data || '{}'));
    setTimeout(() => resolve(data || '{}'), 1000);
  });
}

register();
