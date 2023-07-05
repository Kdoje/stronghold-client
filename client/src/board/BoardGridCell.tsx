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
        // TODO The board stack instance needs to set it's margins and rotation based on activated/
        // attacking direction
        stackInstance = <BoardStackContainer {...props.cards!} />
    }

    // TODO the attack zones should be buttons that on click set where the card is attacking
    // that means we'll need to have functions from the board to bubble up state

    // TODO we'll put buttons to add foundries, gold card, annotation and wielder in the corners
    return (
        <div>

            <div className={css.battlefieldGridCell}>
            <DropZone zone={props.zone} attacking='N' style={{
                    gridRowStart: 1, gridColumnStart: 2, backgroundColor: "pink",
                    minHeight: '100%', minWidth: '100%'
                }}>
                </DropZone>
                <DropZone zone={props.zone} style={{
                    gridRowStart: 2, gridColumnStart: 2, justifyContent: 'center',
                    minHeight: '100%', minWidth: '100%', display: 'flex'
                }}>
                    {stackInstance}
                </DropZone>

                <DropZone zone={props.zone} attacking='S' style={{
                    gridRowStart: 3, gridColumnStart: 2, backgroundColor: "pink",
                    minHeight: '100%', minWidth: '100%'
                }}>
                </DropZone>
                <DropZone zone={props.zone} attacking='E' style={{
                    gridRowStart: 2, gridColumnStart: 3, backgroundColor: "pink",
                    minHeight: '100%', minWidth: '100%'
                }}>
                </DropZone>
                <DropZone zone={props.zone} attacking='W' style={{
                    gridRowStart: 2, gridColumnStart: 1, backgroundColor: "pink",
                    minHeight: '100%', minWidth: '100%'
                }}>
                </DropZone>
            </div>

        </div>
    );
}