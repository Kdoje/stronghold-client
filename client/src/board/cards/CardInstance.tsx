import { useDraggable } from "@dnd-kit/core";
import { CardInstanceT, UnitCardT } from "common/types/game-data";
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";


export default function CardInstance(props: CardInstanceT) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.instanceId
    });
    const cardToRender = props.card
    const style = transform ? {
        transform: `translate3d(${transform.x*1/.3}px, ${transform.y*1/.3}px, 0)`,
    } : undefined;
    let card;
    if ((cardToRender as UnitCardT).attack) {
        let cardData = cardToRender as UnitCardT;
        card = <UnitCard  {...cardData} />;
    } else {
        card = <StratagemCard {...cardToRender} />;
    }
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {card}
        </div>
    );
}