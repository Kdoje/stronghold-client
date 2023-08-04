import { useDraggable } from "@dnd-kit/core";
import { CardInstanceT, UnitCardT } from "common/types/game-data";
import React, { useContext } from "react";
import css from '../Board.module.css';
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";
import { BoardContext } from "../BoardContext";


export default function CardInstance(props: CardInstanceT & { activated: boolean }) {

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.instanceId,
        data: { zone: props.zone, cardInstance: props }
    });

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
        card = <UnitCard  {...cardData} />;
    } else {
        card = <StratagemCard {...cardToRender} />;
    }

    // TODO set the outline color to the owner's color
    let result =
        <div ref={setNodeRef}  {...listeners} {...attributes}
            style={style} className={css.draggableContainer}>
            <div className={css.cardPreivewContainer} style={rotatedStyle}>
                <div style={{ outline: "solid red 15px"}}> 
                    {card}
                </div>
            </div>
        </div>

    return result;
}