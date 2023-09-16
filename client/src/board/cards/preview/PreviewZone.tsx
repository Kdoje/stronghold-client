
import { CardInstanceT, ZoneIdT } from "common/types/game-data";
import css from '../../Board.module.css'
import CardInstance from "../CardInstance";
import { ReactNode, useState } from "react";
import { DropZone } from "../../DropZone";
import React, { useContext } from "react";
import { BoardContext } from "../../BoardContext";

export type PreviewZoneDataT = {
    instances: Array<CardInstanceT>
    zone: ZoneIdT
    direction?: "vertical" | "horizontal"
    areaName: string
}

export const PREVIEW_ID_POSTFIX = '-preview' 

export default function PreviewZone(props: PreviewZoneDataT) {

    let instanceIndex = 0;
    const getActiveCard = useContext(BoardContext).getActiveCard;

    let dropZoneDirection = css.horizontalDropZone;
    let previewAreaName = css.previewAreaHorizontal

    if ((props.direction ?? "vertical") === "vertical") {
        dropZoneDirection = css.verticalDropZone;
        previewAreaName = css.previewAreaVertical
    }

    let dropZoneClass = `${css.previewDropZone} ${dropZoneDirection}`;

    function setActualDropZoneIndex(actualDropZoneId: ZoneIdT, zoneIndex: number) {
        if (props.zone.zoneName === "Board") {
            actualDropZoneId.index = zoneIndex;
        } else {
            actualDropZoneId.rowId = zoneIndex;
        }
    }

    function getActualDropZoneId(activeCard: CardInstanceT | undefined, zoneIndex: number): ZoneIdT | undefined {
        let actualDropZoneId = { ...props.zone }

        // if the current card is in the zone we're previewing
        if (activeCard && activeCard.zone.zoneName === props.zone.zoneName) {
            // get the active zone index (be it row, or index)
            let activeZoneIndex = activeCard.zone.rowId;
            if (activeCard.zone.zoneName === "Board") {
                activeZoneIndex = activeCard.zone.index ?? -1;
            }
            // then determine whether we should render the drop zone, and if so, what the index should be
            if (zoneIndex === activeZoneIndex) {
                return undefined;
            } else if (zoneIndex >= activeZoneIndex && activeZoneIndex != -1) {
                setActualDropZoneIndex(actualDropZoneId, zoneIndex - 1);
            } else {
                setActualDropZoneIndex(actualDropZoneId, zoneIndex);
            }
        } else {
            setActualDropZoneIndex(actualDropZoneId, zoneIndex);
        }
        return actualDropZoneId
    }

    // render list of instances if present
    // the instances need a container and new ID to prevent duplication
    let previewRender: ReactNode[] = [];

    let dropZone = getActualDropZoneId(getActiveCard(), 0);
    if (dropZone) {
        previewRender.push(
            <DropZone key={`${props.zone.zoneName} ${instanceIndex}`} zone={dropZone}>
                <div className={dropZoneClass}></div>
            </DropZone>
        )
    }


    let instances = props.instances ? props.instances : []
    instances.forEach((instance) => {
        // use a consistent id for the previewed instances
        let id = instance.instanceId + PREVIEW_ID_POSTFIX;
        
        let instanceZoneId = instance.zone;
        if (props.zone.zoneName === "Board") {
            instanceZoneId = { ...props.zone, index: instanceIndex };
        } else {
            instanceZoneId = { ...props.zone, rowId: instanceIndex };
        } 
        
        instanceIndex += 1;

        previewRender.push(
            <CardInstance key={id} {...instance} instanceId={id} zone={instanceZoneId} activated={false}/>
        )
        // use the getActualDropZoneId to determine whether we should render a drop zone
        let dropZoneId = getActualDropZoneId(getActiveCard(), instanceIndex);
        if (dropZoneId) {
            previewRender.push(
                <DropZone key={`${props.zone.zoneName} ${instanceIndex}`} zone={dropZoneId}>
                    <div className={dropZoneClass}></div>
                </DropZone>
                )
        }
    })

    return <div className={previewAreaName} style={{gridArea: `${props.areaName}`}}>{...previewRender}</div>
}