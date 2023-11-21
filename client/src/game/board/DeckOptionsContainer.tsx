import { AnyCardT } from 'common/types/game-data';
import { useContext, useState } from 'react';
import DeckEntry from '../deck/DeckEntry';
import { getUrl } from '../../utils/FetchUtils';
import { BoardContext } from './BoardContext';
import { useNavigate } from 'react-router-dom';
import { MAIN_MENU } from 'common/Routes';


export default function DeckOptionsContainer(props: {
    setDeck: (cards: Array<AnyCardT>, wielder: AnyCardT) => void,
    shuffleDeck: () => void,
    resetPlayer: (cards: Array<AnyCardT>, wielder?: AnyCardT) => void,
    closePreview: () => void,
    takeDamage: (amount: number) => void
}) {

    const [deckData, setDeckData] = useState<{ cards: Array<AnyCardT>, wielder?: AnyCardT }>({ cards: [] });
    const [showDeckModal, setShowDeckModal] = useState<boolean>(false);
    const navigate = useNavigate();
    
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

    function onTakeDamageClick() {
        // TODO make this a nice pop-up too
        let damageAmount = parseInt(prompt("Enter Damage Amount") ?? "0") || 0;
        props.takeDamage(damageAmount);
    }

    return <div
        style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", gap: "15px",
        maxHeight: "100px",
        flexWrap: "wrap"}}>
        <button style={DECK_BUTTON_STYLE} onClick={() => setShowDeckModal(true)}>SET DECK</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => { props.shuffleDeck() }}>SHUFFLE</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => { props.resetPlayer(deckData.cards, deckData.wielder) }}>RESET</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => { props.closePreview() }}>CLOSE PREVEIW</button>
        <button style={DECK_BUTTON_STYLE} onClick={(e) => {onTakeDamageClick()}}>TAKE DAMAGE</button>
        <button style={DECK_BUTTON_STYLE} onClick={() => {navigate(MAIN_MENU)}}>QUIT</button>
        <div>{showDeckModal ? (
            <DeckEntry onAccept={(inputData) => onSetDeckClick(inputData)} onClose={() => setShowDeckModal(false)} />
            ) : null}</div>
    </div>
}