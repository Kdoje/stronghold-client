import { useDraggable } from "@dnd-kit/core";
import { CardInstanceT, UnitCardT } from "common/types/game-data";
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";
import { ReactNode, useRef, useState } from "react";
import React from "react";
import css from '../Board.module.css';
import { createPortal } from "react-dom";


export default function CardInstance(props: CardInstanceT) {

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: props.instanceId,
        data: { zone: props.zone, cardInstance: props }
    });

    const cardToRender = props.card
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        position: "fixed"
    } : {
        width: "120px",
        height: "110px",
    } as React.CSSProperties;
    let card;
    if ((cardToRender as UnitCardT).attack) {
        let cardData = cardToRender as UnitCardT;
        card = <UnitCard  {...cardData} />;
    } else {
        card = <StratagemCard {...cardToRender} />;
    }

    let result =
        <div ref={setNodeRef}  {...listeners} {...attributes}
            style={style}
            className={css.draggableContainer}>
            <div className={css.cardPreivewContainer}>
                {card}
            </div>
        </div>

    return result;
}