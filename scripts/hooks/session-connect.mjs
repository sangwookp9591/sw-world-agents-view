#!/usr/bin/env node
/**
 * swkit-office SessionStart hook
 * Claude Code 세션이 시작되면 자동으로 3D Office에 등록합니다.
 * --remote-control 사용 시 RC URL도 함께 등록합니다.
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

    // Claude Code의 Remote Control URL 감지
    // --remote-control 모드에서 CLAUDE_REMOTE_CONTROL_URL 환경변수가 설정됨
    const remoteControlUrl = process.env.CLAUDE_REMOTE_CONTROL_URL || undefined;

    const body = {
      sessionId,
      userId: process.env.USER || 'unknown',
      agentName: AGENT_NAME,
      agentRole: AGENT_ROLE,
      teamId: TEAM_ID,
      status: 'active',
      registeredAt: Date.now(),
      lastEventAt: Date.now(),
      // 세션 공유 설정
      sharing: {
        enabled: true,                              // 기본: 팀 전체 공유
        allowRemoteControl: !!remoteControlUrl,      // RC URL 있으면 원격 제어 허용
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

    if (res.ok) {
      const rcMsg = remoteControlUrl ? ' (RC enabled)' : '';
      console.error(`[swkit-3d] Session registered: ${AGENT_NAME}${rcMsg} (${sessionId})`);
    }
  } catch {
    // 연결 실패 시 무시 (Office가 실행 안 중일 수 있음)
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
