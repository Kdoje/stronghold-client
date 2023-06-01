import React, { ReactElement, ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { AttackDirT, ZoneIdT } from 'common/types/game-data';

export type DropZoneData = {
  zone: ZoneIdT
  attacking?: AttackDirT
  children?: ReactNode
}

export function DropZone(props: DropZoneData) {

  function generateIdString() {
    return `${props.zone.zoneName}, ${props.zone.rowId}, ${props.zone.colId}, ${props.zone.index}, ${props.attacking}`;
  }
  const { isOver, setNodeRef } = useDroppable({
    id: generateIdString(),
    data: {
      zone: props.zone,
      attacking: props.attacking
    }
  });

  return (
    <div ref={setNodeRef}>
      {props.children}
    </div>
  );
}