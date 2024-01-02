import { BoardStackInstanceT, CardInstanceT, UnitCardT, ZoneNameT } from 'common/types/game-data';
import css from './Board.module.css';

import { useContext } from 'react';
import { BoardContext } from './BoardContext';
import FacedownCardInstance from './cards/FacedownCardInstance';
import { DropZone } from './DropZone';
import CardInstance from './cards/CardInstance';
import UnitCard from './cards/Card';
import { StratagemCard } from './cards/StratagemCard';


export default function OpDataContainer(props: { cards: Array<CardInstanceT>, faceup: boolean }) {

    let card;

    let pile = <div className={css.draggableContainer}>
        <div className={css.cardPreivewContainer}>

        </div>
    </div>

    if (props.cards[0]) {
        let cardToRender = props.cards[0].card;
        if (props.faceup) {
            if ((cardToRender as UnitCardT).attack) {
                let cardData = cardToRender as UnitCardT;
                card = <UnitCard  {...cardData} displayOverlay={true} />;
            } else {
                card = <StratagemCard {...cardToRender} displayOverlay={true} />;
            }
        }
        else {
            card = <img className={css.cardImage} src={"card-back.png"}></img>
        }
        pile = <div className={css.draggableContainer}>
            <div className={css.cardPreivewContainer}>
                {card}
            </div>
        </div>
    }

    return pile;
}