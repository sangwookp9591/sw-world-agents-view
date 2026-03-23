'use client';

import { useCallback } from 'react';
import { useOfficeStore } from '@/stores/office-store';
import { SEAT_POSITIONS } from '../OfficeLayout';
import { CharacterBillboard } from './CharacterBillboard';

interface AgentConfig {
  id: string;
  name: string;
  role: string;
}

const AGENT_CONFIG: Readonly<AgentConfig[]> = [
  { id: 'sam',    name: 'Sam',    role: 'CTO'         },
  { id: 'klay',   name: 'Klay',   role: 'Architect'   },
  { id: 'able',   name: 'Able',   role: 'PM'          },
  { id: 'jay',    name: 'Jay',    role: 'Backend/API'  },
  { id: 'jerry',  name: 'Jerry',  role: 'Backend/DB'   },
  { id: 'derek',  name: 'Derek',  role: 'Frontend'     },
  { id: 'willji', name: 'Willji', role: 'Designer'     },
  { id: 'rowan',  name: 'Rowan',  role: 'Motion'       },
  { id: 'milla',  name: 'Milla',  role: 'Security'     },
  { id: 'iron',   name: 'Iron',   role: 'Wizard'       },
] as const;

export function AgentCharacters() {
  const agents = useOfficeStore((state) => state.agents);
  const sessions = useOfficeStore((state) => state.sessions);
  const selectedAgentId = useOfficeStore((state) => state.selectedAgentId);
  const hoveredAgentId = useOfficeStore((state) => state.hoveredAgentId);
  const selectAgent = useOfficeStore((state) => state.selectAgent);
  const setHoveredAgent = useOfficeStore((state) => state.setHoveredAgent);

  const handleSelect = useCallback(
    (id: string) => {
      selectAgent(selectedAgentId === id ? null : id);
    },
    [selectAgent, selectedAgentId],
  );

  const handleHover = useCallback(
    (id: string | null) => {
      setHoveredAgent(id);
    },
    [setHoveredAgent],
  );

  return (
    <group>
      {AGENT_CONFIG.map((config) => {
        const seat = SEAT_POSITIONS.find((s) => s.id === config.id);
        if (!seat) return null;

        const agentState = agents.get(config.id);
        const agentStatus = agentState?.status ?? 'idle';

        const session = Array.from(sessions.values()).find(
          (s) => s.agentName.toLowerCase() === config.id.toLowerCase(),
        );

        return (
          <CharacterBillboard
            key={config.id}
            agentId={config.id}
            position={seat.position}
            name={config.name}
            role={config.role}
            agentStatus={agentStatus}
            currentTool={session?.currentTool}
            onSelect={handleSelect}
            onHover={handleHover}
            isHovered={hoveredAgentId === config.id}
          />
        );
      })}
    </group>
  );
}
