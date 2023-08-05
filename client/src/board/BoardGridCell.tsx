import React, { ReactElement, ReactNode, useContext } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { BoardStackInstanceT, ZoneIdT } from 'common/types/game-data';
import { DropZone } from './DropZone';
import css from './Board.module.css';
import BoardStackContainer from './cards/BoardStackContainer';
import { BoardContext } from './BoardContext';
import e from 'cors';

export type BoardGridCellData = {
    zone: ZoneIdT
    cards?: BoardStackInstanceT
}

export function BoardGridCell(props: BoardGridCellData) {

    let stackInstance;
    let annotationButton;

    const setAnnotation = useContext(BoardContext).setAnnotation;

    function onClick(e: React.MouseEvent) {
        if (props?.cards) {
            let annotation = prompt("Enter Annotation", props.cards!.annotation);
            if (annotation != null && annotation != "") {
                setAnnotation(props.zone, annotation);
            } else {
                setAnnotation(props.zone, undefined)
            }
        }
    }

    if (props.cards && props.cards.instances.length > 0) {
        stackInstance = <BoardStackContainer {...props.cards!} />
        annotationButton = <button
            style={{ gridRow: 0, gridColumn: 0, display: "table-cell", verticalAlign: "middle", zIndex: 4 }} 
            onClick={onClick}>
            A
        </button>
    }

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
                {annotationButton}
            </div>

        </div>
    );
}