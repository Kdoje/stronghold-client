import React, { ReactElement, ReactNode, useContext } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { AttackDirT, ZoneIdT } from 'common/types/game-data';
import { BoardContext } from './BoardContext';

export type DropZoneData = {
  zone: ZoneIdT
  attacking?: AttackDirT
  style?: React.CSSProperties
  children?: ReactNode
}

export function DropZone(props: DropZoneData) {

  const handleAttack = useContext(BoardContext).handleAttack;

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
    <div ref={setNodeRef} style={props.style} onClick={(e) => {handleAttack(props.attacking, props.zone)}}>
      {props.children}
    </div>
  );
}