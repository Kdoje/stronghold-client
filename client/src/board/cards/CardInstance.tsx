import { useDraggable } from "@dnd-kit/core";
import { CardInstanceT, UnitCardT } from "common/types/game-data";
import React, { useContext } from "react";
import css from '../Board.module.css';
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";
import { BoardContext } from "../BoardContext";


export default function CardInstance(props: CardInstanceT & { activated: boolean, annotation?: string }) {

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.instanceId,
        data: { zone: props.zone, cardInstance: props }
    });

    const getPlayerId = useContext(BoardContext).getPlayerId;

    let color = props.owner == 0 ? 'red' : 'green';

    const cardToRender = props.card
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        position: "fixed", // sets parent to viewport and enables dragging
        zIndex: 20, // set z index so dragged stuff appears over everything else
    } : {} as React.CSSProperties;

    const rotatedStyle = props.activated ? { rotate: '90deg' } : {} as React.CSSProperties

    let card;
    if ((cardToRender as UnitCardT).attack) {
        let cardData = cardToRender as UnitCardT;
        card = <UnitCard  {...cardData} displayOverlay={true} />;
    } else {
        card = <StratagemCard {...cardToRender} displayOverlay={true} />;
    }

    // add the annotation on the card if it exists
    let annotationRender = props.annotation ?
        <div className={css.cardAnnotation}>{props.annotation}</div> : null;

    let result =

        <div ref={setNodeRef}  {...listeners} {...attributes}
            style={style} className={css.draggableContainer}>
            <div className={css.cardPreivewContainer} style={rotatedStyle}>
                {annotationRender}
                <div style={{ outline: `solid ${color} 15px`, gridRow: 1, gridColumn: 1 }}>
                    {card}
                </div>
            </div>
        </div>

    return result;
}