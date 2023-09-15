import { AnyCardT, BoardStackInstanceT } from 'common/types/game-data';
import css from '../Board.module.css';
import CardInstance from './cards/CardInstance';
import { useContext, useState } from 'react';
import { BoardContext } from './BoardContext'
import { getUrl } from '../utils/FetchUtils';
import DeckEntry from '../deck/DeckEntry';


export default function DeckOptionsContainer(props: {
    setDeck: (cards: Array<AnyCardT>, wielder: AnyCardT) => void,
    shuffleDeck: () => void,
    resetPlayer: (cards: Array<AnyCardT>, wielder?: AnyCardT) => void,
    closePreview: () => void
}) {

    const [deckData, setDeckData] = useState<{ cards: Array<AnyCardT>, wielder?: AnyCardT }>({ cards: [] });
    const [showDeckModal, setShowDeckModal] = useState<boolean>(false);
    const getPlayerId = useContext(BoardContext).getPlayerId;
    let color = getPlayerId() === 0 ? "red" : "green";

    const DECK_BUTTON_STYLE = {
        maxWidth: "100px",
        minWidth: "100px",
        height: "35px",
        backgroundColor: `${color}`
    }

    async function onSetDeckClick(inputData: string) {
        let requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decklist: inputData })
        };
        
        const response = await fetch(`${getUrl()}/decklist`, requestOptions);
        const data = await response.json();
        console.log("got decklist");
        console.log(data.deck)
        setDeckData({ cards: data.deck, wielder: data.wielder });
        props.setDeck(data.deck, data.wielder);
        setShowDeckModal(false);
    }

    return <div
        style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", gap: "15px",
        maxHeight: "100px",
        flexWrap: "wrap"}}>
        <button style={DECK_BUTTON_STYLE} onClick={() => setShowDeckModal(true)}>SET DECK</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => { props.shuffleDeck() }}>SHUFFLE</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => { props.resetPlayer(deckData.cards, deckData.wielder) }}>RESET</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => { props.closePreview() }}>CLOSE PREVEIW</button>
        <div>{showDeckModal ? (
            <DeckEntry onAccept={(inputData) => onSetDeckClick(inputData)} onClose={() => setShowDeckModal(false)} />
            ) : null}</div>
    </div>
}