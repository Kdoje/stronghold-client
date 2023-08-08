import { useDraggable } from "@dnd-kit/core";
import { CardInstanceT, UnitCardT } from "common/types/game-data";
import React, { useContext } from "react";
import css from '../Board.module.css';
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";


export default function FacedownCardInstance(props: CardInstanceT) {

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


    let card;
    if ((cardToRender as UnitCardT).attack) {
        let cardData = cardToRender as UnitCardT;
        card = <UnitCard  {...cardData} />;
    } else {
        card = <StratagemCard {...cardToRender} />;
    }

    let cardImage = "card-back.png";

    let result =
        <div ref={setNodeRef}  {...listeners} {...attributes}
            style={style} className={css.draggableContainer}>
            <div className={css.cardPreivewContainer}>
                <img className={css.cardImage} src={cardImage}></img>
            </div>
        </div>

    return result;
}