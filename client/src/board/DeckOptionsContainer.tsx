import { AnyCardT, BoardStackInstanceT } from 'common/types/game-data';
import css from '../Board.module.css';
import CardInstance from './cards/CardInstance';
import { useContext } from 'react';
import { BoardContext } from './BoardContext'


export default function DeckOptionsContainer(props: {
    setDeck: (cards: Array<AnyCardT>) => void,
    shuffleDeck: () => void,
    resetPlayer: () => void
}) {

    const getPlayerId = useContext(BoardContext).getPlayerId;
    let color = getPlayerId() === 0 ? "red" : "green";

    const DECK_BUTTON_STYLE = {
        height: "35px",
        backgroundColor: `${color}`
    }

    function onSetDeckClick(e: React.MouseEvent) {
       
    }

    return <div
        style={{display: "flex", flexDirection: "column", justifyContent: "space-around", gap: "15px"}}>
        <button style={DECK_BUTTON_STYLE} onClick={onSetDeckClick}>SET DECK</button>
        <button style={DECK_BUTTON_STYLE} onClick={onSetDeckClick}>SHUFFLE</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => {props.resetPlayer()}}>RESET</button>
    </div>
}