import React, { ReactElement, ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { BoardStackInstanceT, ZoneIdT } from 'common/types/game-data';
import { DropZone } from './DropZone';
import css from './Board.module.css';
import BoardStackContainer from './cards/BoardStackContainer';

export type BoardGridCellData = {
    zone: ZoneIdT
    cards?: BoardStackInstanceT
}

export function BoardGridCell(props: BoardGridCellData) {

    let stackInstance;

    if (props.cards && props.cards.instances.length > 0) {
        stackInstance = <BoardStackContainer {...props.cards!} />
    }

    // TODO, we can set the attacking prop for a drop zone to indicate where the unit is attacking
    // we need to assemble an overlay for this and ensure the stack gets parented properly
    return (
        <div>
            <DropZone zone={props.zone}>
                <div className={css.battlefieldGridCell}>
                    {stackInstance}
                </div>
            </DropZone>
        </div>
    );
}