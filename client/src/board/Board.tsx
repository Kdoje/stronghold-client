import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { AttackDirT, BoardStackInstanceT, CardInstanceT, PlayerData, ZoneIdT, UnitCardT } from "common/types/game-data";
import { StratagemCard } from "./cards/StratagemCard";
import { UnitCard } from "./cards/UnitCard";
import { useCallback, useState } from "react";
import css from './Board.module.css';
import { DropZone } from "./DropZone";
import BoardStackContainer from "./cards/BoardStackContainer";
import PreviewZone from "./cards/preview/PreviewZone";
import { BoardGridCell } from "./BoardGridCell";
import { BoardContext } from "./BoardContext";
import PileContainer from "./PileContainer";
import { assert } from "console";
import CardInstance from "./cards/CardInstance";

export default function Board() {
    const [curIndex, setCurIndex] = useState(0);
    const [playerData, setPlayerData] = useState<PlayerData[]>([
        {
            deck: [{
                zone: { zoneName: "Deck", rowId: 1 }, instanceId: '4', owner: 0,
                card: { name: "Deck card 1", description: "stands alone", cost: "1 V", 
                type: "Tactic", value: "V" }
            }],
            graveyard: [], 
            damage: [],
            exile: [], hand: [
                {
                    zone: { zoneName: "Hand", rowId: 0 }, instanceId: '1', owner: 0,
                    card: { name: "Eat Some Food", description: "stands alone", cost: "1 V", type: "Tactic", value: "V" }
                },
                {
                    zone: { zoneName: "Hand", rowId: 1 }, instanceId: '2', owner: 0,
                    card: { name: "Sheoldred, The Apocolypse", description: "Breaks standard", cost: "5", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5", move: "1" }
                }]
        },
        { deck: [], graveyard: [], damage: [], exile: [], hand: [] },
    ]);
    const [stackData, setStackData] = useState<CardInstanceT[]>([]);
    const [boardData, setBoardData] = useState<BoardStackInstanceT[][]>(Array(6).fill(Array(5).fill(null)))

    const [activeZone, setActiveZone] = useState<ZoneIdT>({
        zoneName: "Board",
        rowId: 0,
        colId: 0
    });

    const [focusedCard, setFocusedCard] = useState<CardInstanceT|undefined>(undefined);

    function addCardToHand() {
        // TODO this should send a request with the card names provided in the textbox to put the data
        // into the deck
        console.log("adding data");
        console.log(playerData)
        let id = (Math.random() + 1).toString(4)
        let newData = playerData.slice();
        let rowId = playerData[0].hand.length;
        newData[0].hand.push({
            zone: { zoneName: "Hand", rowId: rowId }, instanceId: id, owner: 0,
            card: { name: `${rowId}: Sheoldred, The Apocolypse`, description: "Breaks standard", cost: "5", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5", move: "1" }
        })
        setPlayerData(newData);
        console.log(newData.length)
    }

    function addCardToBoard() {
        let newBoardData = boardData.map((item) => item.slice());
        let id = (Math.random() + 1).toString(4)
        let row = Math.floor(curIndex / 5)
        let col = curIndex % 5
        newBoardData[row][col] = {
            instances: [{
                zone: {
                    zoneName: "Board",
                    rowId: row,
                    colId: col
                },
                instanceId: id,
                owner: 1,
                card: {
                    name: `${curIndex} Sheoldred, The Apocolypse`, description: "Breaks standard",
                    cost: "5", type: "Unit", subtype: "Insectoid Horror", value: " ",
                    attack: "4", health: "5|3", move: "1"
                }
            }],
            activated: false
        };
        setCurIndex(curVal => curVal += 1);
        setBoardData(newBoardData);
    }

    function addCardToDmg() {
        let newData = playerData.slice();
        let rowId = playerData[0].damage.length;
        let id = (Math.random() + 1).toString(4)
        newData[0].damage.push({
            zone: { zoneName: "Damage", rowId: rowId }, instanceId: id, owner: 0,
            card: { name: `${rowId}: Sheoldred, The Apocolypse`, description: "Breaks standard", cost: "5", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5", move: "1" }
        })
        setPlayerData(newData);
        console.log(newData.length)
    }

    /**
     * 
     * @param newBoardData the board data after the source zone data has been moved
     * @returns the data specified by the source zone
     */
    function handleBoardSourceData(srcZone: ZoneIdT, curBoardData: BoardStackInstanceT[][], newBoardData: BoardStackInstanceT[][]): CardInstanceT[] {
        let sourceZoneData: CardInstanceT[] = []
        let srcZoneLoc = [srcZone.rowId, srcZone.colId ??= -1, srcZone.index ??= -1] // -1 means index is null
        if (srcZoneLoc[2] >= 0) {
            let elt = curBoardData[srcZoneLoc[0]][srcZoneLoc[1]]!.instances[srcZoneLoc[2]]
            sourceZoneData.push(elt);
            newBoardData[srcZoneLoc[0]][srcZoneLoc[1]]!.instances.splice(srcZoneLoc[2], 1)
        } else {
            sourceZoneData = curBoardData[srcZoneLoc[0]][srcZoneLoc[1]]!.instances
            newBoardData[srcZoneLoc[0]][srcZoneLoc[1]] = null;
        }
        return sourceZoneData;
    }


    function handleBoardDestData(srcZone: ZoneIdT, destZone: ZoneIdT, sourceZoneData: CardInstanceT[],
        curBoardData: BoardStackInstanceT[][], newBoardData: BoardStackInstanceT[][]) {
        let destZoneLoc = [destZone.rowId, destZone.colId ??= -1, destZone.index ??= -1] // -1 means index is null

        let destZoneData = curBoardData[destZoneLoc[0]][destZoneLoc[1]]
        let activated = false;
        let annotation = undefined;

        if (srcZone.zoneName === 'Board') {
            activated = curBoardData[srcZone.rowId][srcZone.colId!]!.activated
            if (srcZone.colId !== undefined && srcZone.index === -1) { // if this comes from the board stack, preserve the annotation
                annotation = curBoardData[srcZone.rowId][srcZone.colId!]?.annotation
            }
        }

        if (destZoneLoc[2] >= 0) {
            if (destZoneData?.instances) {
                destZoneData!.instances.splice(destZoneLoc[2], 0, ...sourceZoneData);
            } else {
                destZoneData = { instances: sourceZoneData, activated: activated, annotation: annotation }
            }
        } else {
            if (destZoneData) {
                destZoneData.instances.unshift(...sourceZoneData)
            } else {
                destZoneData = { instances: sourceZoneData, activated: activated, annotation: annotation }
            }
        }

        newBoardData[destZoneLoc[0]][destZoneLoc[1]] = destZoneData;
    }

    /**
    * @param newPlayerData the player data after the source zone data has been moved
    * @returns the data specified by the source zone
    */
    function handleHandSourceData(srcZone: ZoneIdT, curPlayerData: PlayerData[], newPlayerData: PlayerData[]): CardInstanceT[] {
        let sourceZoneData: CardInstanceT[] = []
        let elt = curPlayerData[0].hand[srcZone.rowId];
        sourceZoneData.push(elt);
        newPlayerData[0].hand.splice(srcZone.rowId, 1)
        rezonePlayerData(newPlayerData);
        return sourceZoneData;
    }

    function handleHandDestData(destZone: ZoneIdT, sourceZoneData: CardInstanceT[], curPlayerData: PlayerData[], newPlayerData: PlayerData[]) {
        newPlayerData[0].hand.splice(destZone.rowId, 0, ...sourceZoneData);
        rezonePlayerData(newPlayerData);
    }

    /**
    * @param newStackData the stack data after the source zone data has been moved
    * @returns the data specified by the source zone
    */
    function handleStackSourceData(srcZone: ZoneIdT, curStackData: CardInstanceT[], newStackData: CardInstanceT[]): CardInstanceT[] {
        let sourceZoneData: CardInstanceT[] = []
        let elt = curStackData[srcZone.rowId];
        sourceZoneData.push(elt);
        newStackData.splice(srcZone.rowId, 1)
        rezoneStackData(newStackData);
        return sourceZoneData;
    }

    function handleStackDestData(destZone: ZoneIdT, sourceZoneData: CardInstanceT[], curStackData: CardInstanceT[], newStackData: CardInstanceT[]) {
        newStackData.splice(destZone.rowId, 0, ...sourceZoneData);
        rezoneStackData(newStackData);
    }

    function handlePileSourceData(srcZone: ZoneIdT, curPlayerData: PlayerData[], newPlayerData: PlayerData[]) {
        let sourceZoneData: CardInstanceT[] = []
        if (srcZone.zoneName === "Deck") {
            sourceZoneData.push(newPlayerData[0].deck.shift()!);
        } else if (srcZone.zoneName === "Exile") {
            sourceZoneData.push(newPlayerData[0].exile.shift()!);
        } else if (srcZone.zoneName === "Graveyard") {
            sourceZoneData.push(newPlayerData[0].graveyard.shift()!);
        } else {
            sourceZoneData.push(newPlayerData[0].damage.shift()!);
        }
        rezonePlayerData(newPlayerData);
        return sourceZoneData
    }

    function handlePileDestData(destZone: ZoneIdT, sourceZoneData: CardInstanceT[], curPlayerData: PlayerData[], newPlayerData: PlayerData[]) {
        
        if (destZone.zoneName === "Deck") {
            newPlayerData[0].deck.unshift(...sourceZoneData);
        } else if (destZone.zoneName === "Exile") {
            newPlayerData[0].exile.unshift(...sourceZoneData);
        } else if (destZone.zoneName === "Graveyard") {
            newPlayerData[0].graveyard.unshift(...sourceZoneData);
        } else {
            newPlayerData[0].damage.unshift(...sourceZoneData);
        }
        rezonePlayerData(newPlayerData);
    }

    function handleAttacking(attacking: AttackDirT | undefined, zone: ZoneIdT) {
        if (zone.colId != null && boardData[zone.rowId][zone.colId] != null && attacking) {
            let newBoardData = boardData.map((item) => item.slice());
            newBoardData[zone.rowId][zone.colId!] = { ...newBoardData[zone.rowId][zone.colId!]!, attacking: attacking, activated: true };
            setBoardData(newBoardData);
            console.log(`handling attacking in ${attacking}`)
        }
    }

    function handleActivating(zone: ZoneIdT) {
        if (zone.colId != null && boardData[zone.rowId][zone.colId] != null) {
            let newBoardData = boardData.map((item) => item.slice());
            newBoardData[zone.rowId][zone.colId!]!.activated = !boardData[zone.rowId][zone.colId]?.activated
            if (!newBoardData[zone.rowId][zone.colId!]!.activated) {
                newBoardData[zone.rowId][zone.colId!]!.attacking = undefined
            }
            setBoardData(newBoardData)
            console.log(`activated ${zone.rowId} ${zone.colId!}`)
        }
    }

    function setAnnotation(zone: ZoneIdT, annotation: string | undefined) {
        if (zone.colId != null && boardData[zone.rowId][zone.colId] != null) {
            let newBoardData = boardData.map((item) => item.slice());
            newBoardData[zone.rowId][zone.colId!]!.annotation = annotation
            setBoardData(newBoardData)
            console.log(`updated annotation ${zone.rowId} ${zone.colId!} to ${annotation}`)
        }

    }

    const handleActivatingCallback = useCallback((zone: ZoneIdT) => {
        handleActivating(zone);
    }, [handleActivating])

    const handleAttackingCallback = useCallback((attacking: AttackDirT | undefined, zone: ZoneIdT) => {
        handleAttacking(attacking, zone)
    }, [handleAttacking])

    const setAnnotationCallback = useCallback((zone: ZoneIdT, annotation: string | undefined) => {
        setAnnotation(zone, annotation);
    }, [setAnnotation])

    const setFocusedCardCallback = useCallback((card: CardInstanceT) => {
        setFocusedCard(card);
    }, [setFocusedCard]);

    function handleDragEnd(event: DragEndEvent) {
        if (event.active.data.current?.zone && event.over?.data.current?.zone) {
            // we need to check the source zone in order to popluate the source data
            let destZone = event.over.data.current.zone as ZoneIdT
            let srcZone = event.active.data.current.zone as ZoneIdT
            let srcZoneName = srcZone.zoneName;
            let destZoneName = destZone.zoneName;
            let destZoneLoc = [destZone.rowId, destZone.colId ??= -1, destZone.index ??= -1]
            let srcZoneLoc = [srcZone.rowId, srcZone.colId ??= -1, srcZone.index ??= -1] // -1 means index is null

            let newBoardData = boardData.map((item) => item.slice());

            if (srcZoneLoc.toString() !== destZoneLoc.toString() || srcZone.zoneName !== destZone.zoneName) {

                let sourceZoneData: CardInstanceT[] = []
                let newPlayerData = playerData.slice();
                let newStackData = stackData.slice();

                if (srcZoneName === "Board") {
                    sourceZoneData = handleBoardSourceData(srcZone, boardData, newBoardData);
                    rezoneBoardData(newBoardData, srcZoneLoc);
                } else if (srcZoneName === "Hand") {
                    sourceZoneData = handleHandSourceData(srcZone, playerData, newPlayerData);
                } else if (srcZoneName === "Stack") {
                    sourceZoneData = handleStackSourceData(srcZone, stackData, newStackData);
                } else {
                    sourceZoneData = handlePileSourceData(srcZone, playerData, newPlayerData);
                }

                if (destZoneName === "Board") {
                    handleBoardDestData(srcZone, destZone, sourceZoneData, boardData, newBoardData);
                    rezoneBoardData(newBoardData, destZoneLoc);
                } else if (destZoneName === "Hand") {
                    handleHandDestData(destZone, sourceZoneData, playerData, newPlayerData);
                } else if (destZoneName === "Stack") {
                    handleStackDestData(destZone, sourceZoneData, stackData, newStackData);
                } else {
                    handlePileDestData(destZone, sourceZoneData, playerData, newPlayerData);
                }
                setBoardData(newBoardData);
                setPlayerData(newPlayerData);
                setStackData(newStackData);
            }
        }
        if (event.over?.data.current?.zone.zoneName === "Board") {
            setActiveZone(event.over.data.current!.zone);
        }
        if (["Deck", "Damage"].indexOf(event.active.data.current?.zone.zoneName) === -1) {
            console.log(event)
            setFocusedCard(event.active.data.current?.cardInstance);
        }
    }

    function rezoneBoardData(newBoardData: BoardStackInstanceT[][], zoneLoc: number[]) {
        newBoardData[zoneLoc[0]][zoneLoc[1]]?.instances.forEach((instance) => {
            instance.zone = { zoneName: "Board", rowId: zoneLoc[0], colId: zoneLoc[1] }
        });
    }

    function rezonePlayerData(newPlayerData: PlayerData[]) {
        newPlayerData[0].hand.forEach((instance, index) => {
            instance.zone = { zoneName: "Hand", rowId: index }
        });
        newPlayerData[0].deck.forEach((instance, index) => {
            instance.zone = { zoneName: "Deck", rowId: index }
        });
        newPlayerData[0].exile.forEach((instance, index) => {
            instance.zone = { zoneName: "Exile", rowId: index }
        });
        newPlayerData[0].graveyard.forEach((instance, index) => {
            instance.zone = { zoneName: "Graveyard", rowId: index }
        });
        newPlayerData[0].damage.forEach((instance, index) => {
            instance.zone = { zoneName: "Damage", rowId: index }
        });
    }

    function rezoneStackData(newStackData: CardInstanceT[]) {
        newStackData.forEach((instance, index) => {
            instance.zone = { zoneName: "Stack", rowId: index }
        })
    }


    let boardRender = [];
    boardRender.push(boardData.map((row, rIndex) => {
        let rowRender = row.map((cards, cIndex) => {
            let zone: ZoneIdT = {
                zoneName: "Board",
                rowId: rIndex,
                colId: cIndex
            }
            return (
                // TODO we can use onMouseDown for the card to indicate when it should be previewed
                <BoardGridCell key={`Cell ${rIndex} ${cIndex}`} {...{ zone: zone, cards: cards }} />
            )
        })
        rowRender.push(<div key={rIndex.toString()} className={css.break}></div>)
        return rowRender;
    }))

    // Sets the instances for the preview display
    let previewedInstances: Array<CardInstanceT> = []
    if (activeZone.colId !== undefined && activeZone.zoneName === "Board" &&
        boardData[activeZone.rowId][activeZone.colId!]?.instances) {
        previewedInstances = boardData[activeZone.rowId][activeZone.colId!]!.instances
    }

    // Sets the individual card preview
    let card;
    if (focusedCard && (focusedCard.card as UnitCardT).attack) {
        let cardData = focusedCard.card as UnitCardT;
        card = <UnitCard  {...cardData} />;
    } else if (focusedCard) {
        card = <StratagemCard {...focusedCard.card} />;
    }


    return (
        <DndContext onDragEnd={(event) => { handleDragEnd(event) }} modifiers={[snapCenterToCursor]}>
            <BoardContext.Provider value={{
                handleActivate: handleActivatingCallback, handleAttack: handleAttackingCallback, setAnnotation: setAnnotationCallback
            }}>
                <div className={css.gameBoard}>
                    <div className={css.OpUnknownData}>
                        <button style={{ gridArea: "OpAvatar", height: "fit-content" }} onClick={() => { addCardToHand() }}>{playerData?.length}</button>
                        <button style={{ gridArea: "OpHand", height: "fit-content" }} onClick={() => { addCardToBoard() }}>add card</button>
                        <button style={{ gridArea: "OpDamage", height: "fit-content" }} onClick={() => { addCardToDmg() }}>GY</button>
                    </div>
                    <div className={css.PlayerUnknownData}>
                        <div className={css.PlayerDeck}>
                            <div>DECK: {playerData[0].deck.length}</div>
                            <PileContainer {...{cards: playerData[0].deck, zoneName:"Deck", faceup: false}}/>
                       </div>
                    </div>
                    <div className={css.PlayerUnknownData}>
                        <div className={css.PlayerDmg}>
                            <div>DMG: {playerData[0].damage.length}</div>
                            <PileContainer {...{cards: playerData[0].damage, zoneName: "Damage", faceup: false}}/>
                       </div>
                    </div>
                    <div className={css.PlayerKnownData}>
                        <div className={css.PlayerGy}>
                            <div>GY: {playerData[0].graveyard.length}</div>
                            <PileContainer {...{cards: playerData[0].graveyard, zoneName:"Graveyard", faceup: true}}/>
                       </div>
                    </div>
                    <div className={css.PlayerKnownData}>
                        <div className={css.PlayerExile}>
                            <div>EXILE: {playerData[0].exile.length}</div>
                            <PileContainer {...{cards: playerData[0].exile, zoneName: "Exile", faceup: true}}/>
                       </div>
                    </div>
                    <PreviewZone {...{ instances: stackData, zone: { zoneName: "Stack", rowId: 0 }, areaName: "Stack" }} />
                    <div className={css.battlefieldGrid}>
                        {...boardRender}
                    </div>
                    <PreviewZone {...{ instances: previewedInstances, zone: activeZone, areaName: "CellPreview" }} />
                    <div className={css.break}></div>
                    <PreviewZone {...{
                        instances: playerData[0].hand, zone: { zoneName: "Hand", rowId: 0 }, direction: "horizontal",
                        areaName: "PlayerHand"
                    }} />
                    <div className={css.CardPreview}>{card}</div>
                </div>
            </BoardContext.Provider>

        </DndContext>
    )
}