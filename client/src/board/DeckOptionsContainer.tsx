import { AnyCardT, BoardStackInstanceT } from 'common/types/game-data';
import css from '../Board.module.css';
import CardInstance from './cards/CardInstance';
import { useContext, useState } from 'react';
import { BoardContext } from './BoardContext'


export default function DeckOptionsContainer(props: {
    setDeck: (cards: Array<AnyCardT>, wielder: AnyCardT) => void,
    shuffleDeck: () => void,
    resetPlayer: (cards: Array<AnyCardT>, wielder?: AnyCardT) => void
}) {

    const [deckData, setDeckData] = useState<{cards: Array<AnyCardT>, wielder?: AnyCardT}>({cards: []});

    const getPlayerId = useContext(BoardContext).getPlayerId;
    let color = getPlayerId() === 0 ? "red" : "green";

    const DECK_BUTTON_STYLE = {
        height: "35px",
        backgroundColor: `${color}`
    }

    async function onSetDeckClick(e: React.MouseEvent) {
        let decklist = prompt("Enter decklist as qty cardname");
        let requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decklist: decklist })
        };
        const response = await fetch(`http://${window.location.hostname}:9000/decklist`, requestOptions);
        const data = await response.json();
        console.log("got decklist");
        console.log(data.deck)
        setDeckData({cards: data.deck, wielder: data.wielder});
        props.setDeck(data.deck, data.wielder)
    }

    return <div
        style={{display: "flex", flexDirection: "column", justifyContent: "space-around", gap: "15px"}}>
        <button style={DECK_BUTTON_STYLE} onClick={onSetDeckClick}>SET DECK</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => {props.shuffleDeck()}}>SHUFFLE</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => {props.resetPlayer(deckData.cards, deckData.wielder)}}>RESET</button>
    </div>
}