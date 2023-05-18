import React, { ReactElement, ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ZoneIdT } from 'common/types/game-data';

export type BoardGridCellData = {
  zone: ZoneIdT
  children: ReactNode
}

export function BoardGridCell(props: BoardGridCellData) {

  function generateIdString() {
    return `${props.zone.zoneName}, ${props.zone.rowId}, ${props.zone.colId}, ${props.zone.index}`;
  }
  const { isOver, setNodeRef } = useDroppable({
    id: generateIdString(),
    data: { zone: props.zone }
  });

  return (
    <div ref={setNodeRef}>
      {props.children}
    </div>
  );
}