import { BoardStackInstanceT, CardInstanceT, ZoneNameT } from 'common/types/game-data';
import css from './Board.module.css';

import { useContext } from 'react';
import { BoardContext } from './BoardContext';
import FacedownCardInstance from './cards/FacedownCardInstance';
import { DropZone } from './DropZone';
import CardInstance from './cards/CardInstance';


export default function PileContainer(props: {cards: Array<CardInstanceT>, zoneName: ZoneNameT, faceup: boolean}) {
    // const handleActivate = useContext(BoardContext).handleActivate;


    // function onClick(e: React.MouseEvent) {
    //     if (props?.instances[0].zone && e.detail >= 2) {
    //         handleActivate(props?.instances[0].zone);
    //     }
    // }

    // let style = {}

    let pile = <div className={css.draggableContainer}>
        <div className={css.cardPreivewContainer}>
          
        </div>
    </div>

    if (props.cards[0]) {
        if (props.faceup) {
            pile = <CardInstance {...props.cards[0]} activated={false} />
        } else {
            pile = <FacedownCardInstance {...props.cards[0]} />
        }
    }

    // TODO this should have a style to place the pile, and indicator for face up/facedown, then the facedown instance
    return <DropZone zone={{zoneName: props.zoneName, rowId: 0}}>
        {pile}
    </DropZone>
}