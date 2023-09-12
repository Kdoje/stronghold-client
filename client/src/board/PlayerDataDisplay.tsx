import { PlayerData } from "common/types/game-data";
import css from './Board.module.css';
import OpDataContainer from "./OpDataContainer";
import PileContainer from "./PileContainer";

export default function PlayerDataDisplay(props: {
    playerData: PlayerData[],
    playerId: number
    addCardToHand: () => void,
    addCardToBoard: () => void,
    opId: number
}) {
    const playerData = props.playerData;
    const addCardToHand = props.addCardToHand;
    const addCardToBoard = props.addCardToBoard;
    const opId = props.opId;
    const playerId = props.playerId
    return (
        <>
            <div className={css.OpUnknownData}>
                <button style={{ gridArea: "OpAvatar", height: "fit-content" }}
                    onClick={() => { addCardToHand() }}>{playerData[(playerId + 1) % 2].deck.length}</button>
                <div className={css.OpHand} onClick={() => { addCardToBoard() }}>
                    <div style={{ width: "max-content" }}>O HAND: {playerData[opId].hand.length}</div>
                    <OpDataContainer cards={playerData[opId].hand} faceup={false} />
                </div>
                <div className={css.OpDeck} onClick={() => { addCardToBoard() }}>
                    <div style={{ width: "max-content" }}>O DECK: {playerData[opId].deck.length}</div>
                    <OpDataContainer cards={playerData[opId].deck} faceup={false} />
                </div>
                <div className={css.OpDamage} onClick={() => { addCardToBoard() }}>
                    <div style={{ width: "max-content" }}>O DMG: {playerData[opId].damage.length}</div>
                    <OpDataContainer cards={playerData[opId].damage} faceup={false} />
                </div>
            </div>
            <div className={css.OpKnownData}>
                <div className={css.OpGraveyard} onClick={() => { addCardToBoard() }}>
                    <div>O GY: {playerData[opId].graveyard.length}</div>
                    <OpDataContainer cards={playerData[opId].graveyard} faceup={true} />
                </div>
            </div>
            <div className={css.OpKnownData}>
                <div className={css.OpExile} onClick={() => { addCardToBoard() }}>
                    <div>O EX: {playerData[opId].exile.length}</div>
                    <OpDataContainer cards={playerData[opId].exile} faceup={true} />
                </div>
            </div>
            <div className={css.PlayerUnknownData}>
                <div className={css.PlayerDeck}>
                    <div>DECK: {playerData[playerId].deck.length}</div>
                    <PileContainer {...{ cards: playerData[playerId].deck, zoneName: "Deck", faceup: false }} />
                </div>
            </div>
            <div className={css.PlayerUnknownData}>
                <div className={css.PlayerDmg}>
                    <div>DMG: {playerData[playerId].damage.length}</div>
                    <PileContainer {...{ cards: playerData[playerId].damage, zoneName: "Damage", faceup: false }} />
                </div>
            </div>
            <div className={css.PlayerKnownData}>
                <div className={css.PlayerGy}>
                    <div style={{ padding: "0px 0px 5px 0px" }}>GY: {playerData[playerId].graveyard.length}</div>
                    <PileContainer {...{ cards: playerData[playerId].graveyard, zoneName: "Graveyard", faceup: true }} />
                </div>
            </div>
            <div className={css.PlayerKnownData}>
                <div className={css.PlayerExile}>
                    <div style={{ padding: "0px 0px 5px 0px" }}>EXILE: {playerData[playerId].exile.length}</div>
                    <PileContainer {...{ cards: playerData[playerId].exile, zoneName: "Exile", faceup: true }} />
                </div>
            </div>
        </>
    )
}