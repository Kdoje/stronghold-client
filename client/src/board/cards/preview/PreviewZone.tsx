
import { CardInstanceT, ZoneIdT } from "common/types/game-data";
import css from '../../Board.module.css'
import CardInstance from "../CardInstance";
import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

export type PreviewZoneDataT = {
    instances: Array<CardInstanceT>
    zone: ZoneIdT
}

export default function PreviewZone(props: PreviewZoneDataT) {

    function generateIdString() {
        return `${props.zone.zoneName}, ${props.zone.rowId}, ${props.zone.colId}, ${props.zone.index}`;
    }
    // // creates a droppable area with the given zone
    // const { isOver, setNodeRef } = useDroppable({
    //     id: generateIdString(),
    //     data: { zone: props.zone }
    // });

    // render list of instances if present
    // the instances need a container and new ID to prevent duplication
    let previewRender: ReactNode[] = [];

    props.instances.forEach(instance => {
        let id = (Math.random() + 1).toString(4)
        let instanceCopy = { ...instance, instanceId: id }
        previewRender.push(
            <CardInstance {...instanceCopy} />)
    })
    // render drop points between each
    return <div className={css.previewArea}>{...previewRender}</div>
}