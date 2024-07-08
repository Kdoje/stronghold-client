import { useDraggable } from "@dnd-kit/core";
import { CardInstanceT, UnitCardT } from "common/types/game-data";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import css from '../Board.module.css';
import { StratagemCard } from "../../../CardTemplates/StratagemCard";
import UnitCard from "../../../CardTemplates/Card";
import { BoardContext } from "../BoardContext"; 
import Card from "../../../CardTemplates/Card";


export default function CardInstance(props: CardInstanceT & { activated: boolean, annotation?: string}) {

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: props.instanceId,
        data: { zone: props.zone, cardInstance: props },
    });

    const setFocusedCard = useContext(BoardContext).setFocusedCard;

    let color = props.owner == 0 ? 'red' : 'green';

    const cardToRender = props.card
    let style = ( isDragging ? {
        visibility: "hidden",
        width: "0px",
        height: "0px"
    } : {}) as React.CSSProperties;

    const rotatedStyle = props.activated ? { rotate: '90deg' } : {} as React.CSSProperties

    let card = <Card  {...cardToRender} displayOverlay={true} />;

    // add the annotation on the card if it exists
    let annotationRender = props.annotation ?
        <div className={css.cardAnnotation}>{props.annotation}</div> : null;

    let result =
        <div ref={setNodeRef}  {...listeners} {...attributes}
            style={style} className={css.draggableContainer}>
            <div className={css.cardPreivewContainer} style={rotatedStyle} 
            onPointerOver={
                (e) => {
                    console.log(e.buttons);
                    if (e.buttons === 0 || e.buttons === 3) {
                        setFocusedCard(props, false);
                    }
                }
            }
            onClickCapture={() => {
                setFocusedCard(props);
            }}>
                {annotationRender}
                <div style={{ outline: `solid ${color} 15px`, gridRow: 1, gridColumn: 1 }}>
                    {card}
                </div>
            </div>
        </div>

    return result;
}