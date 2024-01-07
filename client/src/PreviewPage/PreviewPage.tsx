import { useState } from 'react';
import { getUrl } from '../utils/FetchUtils';
import css from './PreviewPage.module.css'
import  {GAME_BOARD, DECK_EDITOR, PREVIEW_PAGE} from 'common/Routes'
import { AnyCardT } from 'common/types/game-data';
import Card from '../game/board/cards/Card';
import React from 'react';

const deckList = "1 CSc13: Heat Flow\n" +
                 "1 CFr01: Ice Shield\n" +
                 "1 CFr08: Research Base\n" +
                 "1 CSc14: Explosive Arc\n" +
                 "1 CCo05: Shield bearer\n" +
                 "1 CSi02: Kyrian Sage\n" + 
                 "1 CCo12: Forward March\n" +
                 "1 CCo10: Farmland\n" +
                 "1 The Novice\n" + 
                 "1 The Houndmaster\n"

export default function PreivewPage() {
    const [curCards, setCurCards] = useState([] as AnyCardT[]);

    async function onSetDeckClick(inputData: string) {
        let requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ decklist: inputData })
        };

        const response = await fetch(`${getUrl()}/decklist`, requestOptions);
        const data = await response.json();
        console.log("got decklist");
        let cards = data.deck;
        cards.push(data.wielder);
        setCurCards(cards);
    }

    let genDeckListButton = curCards.length > 0 ?
        undefined :
        <button onClick={() => onSetDeckClick(deckList)}>generate</button>;
    
    let cardRenders: React.ReactElement[] = [];
    curCards.forEach((card) => {
        cardRenders.push(<Card {...card}/>)
    });

    return(
        <div className={css.cardPreviews}>
            {genDeckListButton}
            {cardRenders}
        </div>
    )
}