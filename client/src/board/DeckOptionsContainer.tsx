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
    resetPlayer: (cards: Array<AnyCardT>, wielder?: AnyCardT) => void
}) {

    const [deckData, setDeckData] = useState<{ cards: Array<AnyCardT>, wielder?: AnyCardT }>({ cards: [] });
    const [showDeckModal, setShowDeckModal] = useState<boolean>(false);
    const getPlayerId = useContext(BoardContext).getPlayerId;
    let color = getPlayerId() === 0 ? "red" : "green";

    const DECK_BUTTON_STYLE = {
        height: "35px",
        backgroundColor: `${color}`
    }

    // TODO this needs to create a more sensible popup the user can interact with
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
        style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", gap: "15px" }}>
        <button style={DECK_BUTTON_STYLE} onClick={() => setShowDeckModal(true)}>SET DECK</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => { props.shuffleDeck() }}>SHUFFLE</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => { props.resetPlayer(deckData.cards, deckData.wielder) }}>RESET</button>
        <div>{showDeckModal ? (
            <DeckEntry onAccept={(inputData) => onSetDeckClick(inputData)} onClose={() => setShowDeckModal(false)} />
            ) : null}</div>
    </div>
}