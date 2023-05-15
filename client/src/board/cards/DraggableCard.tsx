import { useDraggable } from '@dnd-kit/core';
import { AnyCardDataT, UnitCardT } from 'common/types/game-data';
import React from 'react';
import { UnitCard } from './UnitCard';
import { StratagemCard } from './StratagemCard';
import css from '../Board.module.css' // TODO this should be in the card module


export default function DraggableCard(props: AnyCardDataT) {
    // TODO this should be called CardInstance so it can hold the instance id and overlay
    //  info
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.instanceId,
    });
    const style = transform ? {
        transform: `translate3d(${transform.x*1/.3}px, ${transform.y*1/.3}px, 0)`,
    } : undefined;
    let card;
    if ((props.card as UnitCardT).attack) {
        let cardData = props.card as UnitCardT;
        card = <UnitCard  {...cardData} />;
    } else {
        card = <StratagemCard {...props.card} />;
    }
    return (
        <div ref={setNodeRef}  className={css.instanceWrapper} style={style} {...listeners} {...attributes}>
            {card}
        </div>
    );
}