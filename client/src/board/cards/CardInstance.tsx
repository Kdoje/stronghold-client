import { useDraggable } from "@dnd-kit/core";
import { CardInstanceT, UnitCardT } from "common/types/game-data";
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";
import { ReactNode, useRef } from "react";
import React from "react";
import css from '../Board.module.css';


export default function CardInstance(props: CardInstanceT) {
    
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: props.instanceId,
        data: { zone: props.zone }
    });

    const cardToRender = props.card
    const style = transform ? {
        transform: `translate3d(${transform.x * 1 / .3}px, ${transform.y * 1 / .3}px, 0)`,
    } : undefined;
    let card;
    if ((cardToRender as UnitCardT).attack) {
        let cardData = cardToRender as UnitCardT;
        card = <UnitCard  {...cardData} />;
    } else {
        card = <StratagemCard {...cardToRender} />;
    }

    // TODO How do we render this outside of it's parent? using position tricks doesn't work
    //   we likely need to re-parent the node when it's moving
    return (<div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        {card}
    </div>)
}