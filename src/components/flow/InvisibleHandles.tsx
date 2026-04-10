/** ReactFlow 노드에 4방향 투명 핸들을 렌더링한다 (target+source 각 4개 = 8개). */

import { Handle, Position } from '@xyflow/react';

const HANDLE_CLASS = '!w-0 !h-0 !border-0 !bg-transparent';

const entries = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
] as const;

export function InvisibleHandles() {
  return (
    <>
      {entries.map(({ id, position }) => (
        <Handle key={`t-${id}`} type="target" id={id} position={position} className={HANDLE_CLASS} />
      ))}
      {entries.map(({ id, position }) => (
        <Handle key={`s-${id}`} type="source" id={id} position={position} className={HANDLE_CLASS} />
      ))}
    </>
  );
}
