import { useState } from 'react';
import { getUrl } from '../utils/FetchUtils';
import css from './PreviewPage.module.css'
import { AnyCardT } from 'common/types/game-data';
import React from 'react';
import ProjectBlueCard from '../CardTemplates/ProjectBlueCard';
import Modal from 'react-modal';


export default function PreivewPage() {
    const [curCards, setCurCards] = useState([] as AnyCardT[]);
    const [modalIsOpen, setIsOpen] = React.useState(false);
    let subtitle:  HTMLTextAreaElement;

    async function onSetDeckClick() {
        let requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ cardlist: subtitle.value })
        };

        const response = await fetch(`${getUrl()}/cardlist`, requestOptions);
        const data = await response.json();
        console.log("got decklist");
        let cards = data.list;
        setCurCards(cards);
        setIsOpen(false);
    }

    function onEnterDecklistClick() {
        setIsOpen(true);
    }

    let genDeckListButton = curCards.length > 0 ?
        undefined :
        <button onClick={() => onEnterDecklistClick()}>Enter Decklist</button>;
    
    let cardRenders: React.ReactElement[] = [];
    curCards.forEach((card) => {
        cardRenders.push(<ProjectBlueCard {...card}/>)
    });

    Modal.setAppElement("#modal");

    return (
        <div className={css.cardPreviews}>
            {genDeckListButton}
            <Modal isOpen={modalIsOpen} contentLabel="Deck Entry Modal">
                <h2 >Cardlist Print Entry</h2>
                <textarea ref={(_subtitle) => (subtitle = _subtitle)} placeholder="Enter Cardlist"/>
                <br/>
                <button onClick={() => onSetDeckClick()}>Submit</button>
            </Modal>
            {cardRenders}
        </div>
    )
}