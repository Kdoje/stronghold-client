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
    foundry: number
}

export function BoardGridCell(props: BoardGridCellData) {

    let stackInstance;
    let annotationButton;

    const setAnnotation = useContext(BoardContext).setAnnotation;
    const updateFoundryData = useContext(BoardContext).updateFoundryData;
    const getPlayerId = useContext(BoardContext).getPlayerId;

    let isMirrored = getPlayerId() % 2 == 1;

    function onAnnotationClick(e: React.MouseEvent) {
        if (props?.cards) {
            let annotation = prompt("Enter Annotation", props.cards!.annotation);
            if (annotation != null && annotation != "") {
                setAnnotation(props.zone, annotation);
            } else {
                setAnnotation(props.zone, undefined)
            }
        }
    }

    function onFoundryClick(e: React.MouseEvent) {
        if (props.foundry === -1) {
          updateFoundryData(props.zone, getPlayerId()); 
        } else if (props.foundry === getPlayerId()) {
            updateFoundryData(props.zone, -1);
        }
    }

    let foundryColor = "white";

    if (props.foundry === 0) {
        foundryColor = "red";
    } else if (props.foundry === 1) {
        foundryColor = "green";
    }

    let foundryButton = <button
        style={{ gridRow: 0, gridColumn: 3, display: "table-cell", verticalAlign: "middle", zIndex: 4, backgroundColor: `${foundryColor}` }}
        onClick={onFoundryClick}>F
    </button>

    if (props.cards && props.cards.instances.length > 0) {
        stackInstance = <BoardStackContainer {...props.cards!} />
        annotationButton = <button
            style={{ gridRow: 0, gridColumn: 0, display: "table-cell", verticalAlign: "middle", zIndex: 4 }}
            onClick={onAnnotationClick}>
            A
        </button>
    }

    return (
        <div>

            <div className={css.battlefieldGridCell}>
                <DropZone zone={props.zone} attacking={isMirrored ? 'S' : 'N'} style={{
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

                <DropZone zone={props.zone} attacking={isMirrored ? 'N' : 'S'} style={{
                    gridRowStart: 3, gridColumnStart: 2, backgroundColor: "pink",
                    minHeight: '100%', minWidth: '100%'
                }}>
                </DropZone>
                <DropZone zone={props.zone} attacking={isMirrored ? 'W' : 'E'} style={{
                    gridRowStart: 2, gridColumnStart: 3, backgroundColor: "pink",
                    minHeight: '100%', minWidth: '100%'
                }}>
                </DropZone>
                <DropZone zone={props.zone} attacking={isMirrored ? 'E' : 'W'} style={{
                    gridRowStart: 2, gridColumnStart: 1, backgroundColor: "pink",
                    minHeight: '100%', minWidth: '100%'
                }}>
                </DropZone>
                {annotationButton}
                {foundryButton}
            </div>

        </div>
    );
}