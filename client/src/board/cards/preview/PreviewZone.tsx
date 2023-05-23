
import { CardInstanceT, ZoneIdT } from "common/types/game-data";
import css from '../../Board.module.css'
import CardInstance from "../CardInstance";
import { ReactNode, useState } from "react";
import { DropZone } from "../../DropZone";

export type PreviewZoneDataT = {
    instances: Array<CardInstanceT>
    zone: ZoneIdT
}

export default function PreviewZone(props: PreviewZoneDataT) {

    const [activeIndex, setActiveIndex] = useState<Number>();

    let dropZoneIndex = 0;
    let dropZoneId = { ...props.zone, index: dropZoneIndex };

    // render list of instances if present
    // the instances need a container and new ID to prevent duplication
    let previewRender: ReactNode[] = [];

    previewRender.push(
        <DropZone key={`previewDroppable ${dropZoneIndex}`} zone={dropZoneId}>
            <div className={css.previewDropZone}></div>
        </DropZone>
    )


    props.instances.forEach((instance) => {
        // only preview zones care about indexes so set it here
        let id = (Math.random() + 1).toString(4)
        let instanceZoneId = { ...props.zone, index: dropZoneIndex };
        dropZoneIndex += 1;
        let dropZoneId =  { ...props.zone, index: dropZoneIndex };

        let instanceCopy = { ...instance, instanceId: id, zone: instanceZoneId }
        previewRender.push(
            <CardInstance {...instanceCopy} />
        )
        // TODO we shouldn't render this droppable if the given index is the dragged elt
        previewRender.push(
            <DropZone key={`previewDroppable ${dropZoneIndex}`} zone={dropZoneId}>
                <div className={css.previewDropZone}></div>
            </DropZone>)
    })
    // render drop points between each
    return <div className={css.previewArea}>{...previewRender}</div>
}