#!/usr/bin/env node
/**
 * swkit-office PostToolUse hook
 * Claude Code가 도구 사용을 완료할 때마다 tool_done 이벤트를 전송합니다.
 * 이 이벤트로 3D Office 캐릭터가 active → idle 상태로 복귀합니다.
 *
 * 설정: settings.json → hooks.PostToolUse
 */

const RELAY_URL = process.env.SWKIT_OFFICE_URL || 'http://localhost:3000';
const TEAM_ID = process.env.SWKIT_TEAM_ID || 'default';
const AGENT_NAME = process.env.SWKIT_AGENT_NAME || process.env.USER || 'unknown';

async function report() {
  try {
    const input = JSON.parse(await readStdin());
    const toolName = input.tool_name || 'unknown';
    const sessionId = input.session_id || `session-${process.pid}`;

    await fetch(`${RELAY_URL}/api/relay/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.RELAY_SECRET ? { 'x-relay-secret': process.env.RELAY_SECRET } : {}),
      },
      body: JSON.stringify({
        teamId: TEAM_ID,
        sessionId,
        userId: process.env.USER || 'unknown',
        agentName: AGENT_NAME,
        eventType: 'tool_done',
        toolName,
        timestamp: Date.now(),
      }),
    });
  } catch {
    // 연결 실패 시 무시
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

report();
