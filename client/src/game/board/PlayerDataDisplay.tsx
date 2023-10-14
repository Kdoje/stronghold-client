import { PlayerData, ZoneIdT, ZoneNameT } from "common/types/game-data";
import css from './Board.module.css';
import OpDataContainer from "./OpDataContainer";
import PileContainer from "./PileContainer";

export default function PlayerDataDisplay(props: {
    playerData: PlayerData[],
    playerId: number
    addCardToHand: () => void,
    addCardToBoard: () => void,
    setActiveZone: (zone: ZoneIdT) => void,
    opId: number
}) {
    const playerData = props.playerData;
    const addCardToHand = props.addCardToHand;
    const addCardToBoard = props.addCardToBoard;
    const setActiveZone = props.setActiveZone;
    const opId = props.opId;
    const playerId = props.playerId

    function updateOpActiveZone(zoneName: ZoneNameT) {
        // TODO This needs to specify the colId or it doesn't work. I don't know why
        setActiveZone({zoneName: zoneName, rowId: 0, colId: 0, playerId: opId})
    }
    
    function updatePlayerActiveZone(zoneName: ZoneNameT) {
        // TODO This needs to specify the colId or it doesn't work. I don't know why
        setActiveZone({zoneName: zoneName, rowId: 0, colId: 0, playerId: playerId})
    }   

    return (
        <>
            <div className={css.OpUnknownData}>
                <div style={{
                    gridArea: "OpAvatar", height: "fit-content", backgroundColor: "lightgrey",
                    textAlign: "center", fontSize: "24px"
                }}>
                        OP DATA:
                    </div>
                <div className={css.OpHand}>
                    <div style={{ width: "max-content" }}>O HAND: {playerData[opId].hand.length}</div>
                    <OpDataContainer cards={playerData[opId].hand} faceup={false} />
                </div>
                <div className={css.OpDeck}  onDoubleClick={() => { updateOpActiveZone("Deck")}}>
                    <div style={{ width: "max-content" }}>O DECK: {playerData[opId].deck.length}</div>
                    <OpDataContainer cards={playerData[opId].deck} faceup={false} />
                </div>
                <div className={css.OpDamage} onDoubleClick={() => { updateOpActiveZone("Damage")}}>
                    <div style={{ width: "max-content" }}>O DMG: {playerData[opId].damage.length}</div>
                    <OpDataContainer cards={playerData[opId].damage} faceup={false} />
                </div>
            </div>
            <div className={css.OpKnownData}>
                <div className={css.OpGraveyard} onDoubleClick={() => { updateOpActiveZone("Graveyard")}}>
                    <div>O GY: {playerData[opId].graveyard.length}</div>
                    <OpDataContainer cards={playerData[opId].graveyard} faceup={true} />
                </div>
            </div>
            <div className={css.OpKnownData}>
                <div className={css.OpExile} onDoubleClick={() => { updateOpActiveZone("Exile")}}>
                    <div>O EX: {playerData[opId].exile.length}</div>
                    <OpDataContainer cards={playerData[opId].exile} faceup={true} />
                </div>
            </div>
            <div className={css.PlayerUnknownData}>
                <div className={css.PlayerDeck} onDoubleClickCapture={() => { updatePlayerActiveZone("Deck")}}>
                    <div>DECK: {playerData[playerId].deck.length}</div>
                    <PileContainer {...{ cards: playerData[playerId].deck, zoneName: "Deck", faceup: false }} />
                </div>
            </div>
            <div className={css.PlayerUnknownData}>
                <div className={css.PlayerDmg} onDoubleClick={() => { updatePlayerActiveZone("Damage")}}>
                    <div>DMG: {playerData[playerId].damage.length}</div>
                    <PileContainer {...{ cards: playerData[playerId].damage, zoneName: "Damage", faceup: false }} />
                </div>
            </div>
            <div className={css.PlayerKnownData}>
                <div className={css.PlayerGy} onDoubleClick={() => { updatePlayerActiveZone("Graveyard")}}>
                    <div style={{ padding: "0px 0px 5px 0px" }}>GY: {playerData[playerId].graveyard.length}</div>
                    <PileContainer {...{ cards: playerData[playerId].graveyard, zoneName: "Graveyard", faceup: true }} />
                </div>
            </div>
            <div className={css.PlayerKnownData}>
                <div className={css.PlayerExile} onDoubleClick={() => { updatePlayerActiveZone("Exile")}}>
                    <div style={{ padding: "0px 0px 5px 0px" }}>EXILE: {playerData[playerId].exile.length}</div>
                    <PileContainer {...{ cards: playerData[playerId].exile, zoneName: "Exile", faceup: true }} />
                </div>
            </div>
        </>
    )
}