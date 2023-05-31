
import { CardInstanceT, ZoneIdT } from "common/types/game-data";
import css from '../../Board.module.css'
import CardInstance from "../CardInstance";
import { ReactNode, useState } from "react";
import { DropZone } from "../../DropZone";

export type PreviewZoneDataT = {
    instances: Array<CardInstanceT>
    zone: ZoneIdT
    direction?: "vertical" | "horizontal"
}

export default function PreviewZone(props: PreviewZoneDataT) {

    let dropZoneLoc = 0;
    let dropZoneId = { ...props.zone };
    if (props.zone.zoneName === "Board") {
        dropZoneId = { ...props.zone, index: dropZoneLoc };
    }

    let dropZoneDirection = css.horizontalDropZone;
    let previewAreaName = css.previewAreaHorizontal

    if ((props.direction ?? "vertical") === "vertical") {
        dropZoneDirection = css.verticalDropZone;
        previewAreaName = css.previewAreaVertical
    }

    let dropZoneClass = `${css.previewDropZone} ${dropZoneDirection}`;

    // render list of instances if present
    // the instances need a container and new ID to prevent duplication
    let previewRender: ReactNode[] = [];

    previewRender.push(
        <DropZone key={`previewDroppable ${dropZoneLoc}`} zone={dropZoneId}>
            <div className={dropZoneClass}></div>
        </DropZone>
    )


    // TODO there's an issue here where the zone below any card sets it one zone lower 
    // than expected
    props.instances.forEach((instance) => {
        // only preview zones care about indexes so set it here
        let id = (Math.random() + 1).toString(4);
        
        let instanceZoneId = instance.zone;
        if (props.zone.zoneName === "Board") {
            instanceZoneId = { ...props.zone, index: dropZoneLoc };
        }
        
        dropZoneLoc += 1;
        
        // only the board sets the index, otherwise, set the rowId of the zone
        if (props.zone.zoneName === "Board") {
            dropZoneId = { ...props.zone, index: dropZoneLoc };
        } else {
            dropZoneId = { ...props.zone, rowId: dropZoneLoc }
        }

        let instanceCopy = { ...instance, instanceId: id, zone: instanceZoneId }
        previewRender.push(
            <CardInstance {...instanceCopy} />
        )
        // TODO we shouldn't render this droppable if the given index is the dragged elt
        previewRender.push(
            <DropZone key={`previewDroppable ${dropZoneLoc}`} zone={dropZoneId}>
                <div className={dropZoneClass}></div>
            </DropZone>)
    })
    // render drop points between each
    return <div className={previewAreaName}>{...previewRender}</div>
}