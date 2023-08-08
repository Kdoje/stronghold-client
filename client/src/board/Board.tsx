import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { AttackDirT, BoardStackInstanceT, CardInstanceT, PlayerData, ZoneIdT, UnitCardT } from "common/types/game-data";
import { StratagemCard } from "./cards/StratagemCard";
import { UnitCard } from "./cards/UnitCard";
import { useCallback, useEffect, useState } from "react";
import css from './Board.module.css';
import { DropZone } from "./DropZone";
import BoardStackContainer from "./cards/BoardStackContainer";
import PreviewZone from "./cards/preview/PreviewZone";
import { BoardGridCell } from "./BoardGridCell";
import { BoardContext } from "./BoardContext";
import PileContainer from "./PileContainer";
import { assert } from "console";
import CardInstance from "./cards/CardInstance";
import { Socket } from "socket.io-client";

export default function Board(props: {socket: Socket}) {
    const [playerId, setPlayerId] = useState(0);
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
    function setAndPostPlayerData(data: PlayerData[]) {
        props.socket.emit("playerData", {playerId: playerId, playerData: data})
        setPlayerData(data);
    }

    const [stackData, setStackData] = useState<CardInstanceT[]>([]);
    function setAndPostStackData(data: CardInstanceT[]) {
        props.socket.emit("stackData", {playerId: playerId, stackData: data})
        setStackData(data);
    }

    const [foundryData, setFoundryData] = useState<number[][]>(Array(6).fill(Array(5).fill(-1)));
    function setAndPostFoundryData(data: number[][]) {
        props.socket.emit("foundryData", {playerId: playerId, foundryData: data})
        setFoundryData(data);
    }

    const [boardData, setBoardData] = useState<BoardStackInstanceT[][]>(Array(6).fill(Array(5).fill(null)));
    function setAndPostBoardData(data: BoardStackInstanceT[][]) {
        props.socket.emit("boardData", {playerId: playerId, boardData: data})
        setBoardData(data);
    }

    const [activeZone, setActiveZone] = useState<ZoneIdT>({
        zoneName: "Board",
        rowId: 0,
        colId: 0
    });

    const [focusedCard, setFocusedCard] = useState<CardInstanceT|undefined>(undefined);

    props.socket.onAny((event, ...args)=> {
        if (event === "playerId") {
            setPlayerId(args[0]);
        }
        if (event === "boardData") {
            setBoardData(args[0].boardData);
        } else if (event == "playerData") {
            setPlayerData(args[0].playerData);
        } else if (event == "stackData") {
            setStackData(args[0].stackData);
        } else if (event == "foundryData") {
            setFoundryData(args[0].foundryData);
        }
    })

    function addCardToHand() {
        // TODO this should send a request with the card names provided in the textbox to put the data
        // into the deck
        console.log("adding data");
        console.log(playerData)
        let id = (Math.random() + 1).toString(4)
        let newData = playerData.slice();
        let rowId = playerData[playerId].hand.length;
        newData[playerId].hand.push({
            zone: { zoneName: "Hand", rowId: rowId }, instanceId: id, owner: playerId,
            card: { name: `${rowId}: Sheoldred, The Apocolypse`, description: "Breaks standard", cost: "5", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5", move: "1" }
        })
        setAndPostPlayerData(newData);
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
                owner: playerId,
                card: {
                    name: `${curIndex} Sheoldred, The Apocolypse`, description: "Breaks standard",
                    cost: "5", type: "Unit", subtype: "Insectoid Horror", value: " ",
                    attack: "4", health: "5|3", move: "1"
                }
            }],
            activated: false
        };
        setCurIndex(curVal => curVal += 1);
        setAndPostBoardData(newBoardData);
    }

    function addCardToDmg() {
        let newData = playerData.slice();
        let rowId = playerData[playerId].damage.length;
        let id = (Math.random() + 1).toString(4)
        newData[0].damage.push({
            zone: { zoneName: "Damage", rowId: rowId }, instanceId: id, owner: playerId,
            card: { name: `${rowId}: Sheoldred, The Apocolypse`, description: "Breaks standard", cost: "5", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5", move: "1" }
        })
        setAndPostPlayerData(newData);
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
        let elt = curPlayerData[playerId].hand[srcZone.rowId];
        sourceZoneData.push(elt);
        newPlayerData[playerId].hand.splice(srcZone.rowId, 1)
        rezonePlayerData(newPlayerData);
        return sourceZoneData;
    }

    function handleHandDestData(destZone: ZoneIdT, sourceZoneData: CardInstanceT[], curPlayerData: PlayerData[], newPlayerData: PlayerData[]) {
        newPlayerData[playerId].hand.splice(destZone.rowId, 0, ...sourceZoneData);
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
            sourceZoneData.push(newPlayerData[playerId].deck.shift()!);
        } else if (srcZone.zoneName === "Exile") {
            sourceZoneData.push(newPlayerData[playerId].exile.shift()!);
        } else if (srcZone.zoneName === "Graveyard") {
            sourceZoneData.push(newPlayerData[playerId].graveyard.shift()!);
        } else {
            sourceZoneData.push(newPlayerData[playerId].damage.shift()!);
        }
        rezonePlayerData(newPlayerData);
        return sourceZoneData
    }

    function handlePileDestData(destZone: ZoneIdT, sourceZoneData: CardInstanceT[], curPlayerData: PlayerData[], newPlayerData: PlayerData[]) {
        
        if (destZone.zoneName === "Deck") {
            newPlayerData[playerId].deck.unshift(...sourceZoneData);
        } else if (destZone.zoneName === "Exile") {
            newPlayerData[playerId].exile.unshift(...sourceZoneData);
        } else if (destZone.zoneName === "Graveyard") {
            newPlayerData[playerId].graveyard.unshift(...sourceZoneData);
        } else {
            newPlayerData[playerId].damage.unshift(...sourceZoneData);
        }
        rezonePlayerData(newPlayerData);
    }

    function handleAttacking(attacking: AttackDirT | undefined, zone: ZoneIdT) {
        if (zone.colId != null && boardData[zone.rowId][zone.colId] != null && attacking) {
            let newBoardData = boardData.map((item) => item.slice());
            newBoardData[zone.rowId][zone.colId!] = { ...newBoardData[zone.rowId][zone.colId!]!, attacking: attacking, activated: true };
            setAndPostBoardData(newBoardData);
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
            setAndPostBoardData(newBoardData)
            console.log(`activated ${zone.rowId} ${zone.colId!}`)
        }
    }

    function setAnnotation(zone: ZoneIdT, annotation: string | undefined) {
        if (zone.colId != null && boardData[zone.rowId][zone.colId] != null) {
            let newBoardData = boardData.map((item) => item.slice());
            newBoardData[zone.rowId][zone.colId!]!.annotation = annotation
            setAndPostBoardData(newBoardData)
            console.log(`updated annotation ${zone.rowId} ${zone.colId!} to ${annotation}`)
        }

    }

    function updateFoundryData(zone: ZoneIdT, owner: number) {
        if (zone.zoneName === "Board") {
            let newFoundryData = foundryData.map((item) => item.slice());
            newFoundryData[zone.rowId][zone.colId!] = owner;
            setAndPostFoundryData(newFoundryData);
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

    const updateFoundryDataCallback = useCallback((zone: ZoneIdT, owner: number) => {
        updateFoundryData(zone, owner);
    }, [updateFoundryData])

    const getPlayerId = useCallback(() => {
        return playerId;
    }, [playerId])

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
                setAndPostBoardData(newBoardData);
                setAndPostPlayerData(newPlayerData);
                setAndPostStackData(newStackData);
                props.socket.emit("boardData", {playerId: playerId, boardData: newBoardData})
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
        newPlayerData[playerId].hand.forEach((instance, index) => {
            instance.zone = { zoneName: "Hand", rowId: index }
        });
        newPlayerData[playerId].deck.forEach((instance, index) => {
            instance.zone = { zoneName: "Deck", rowId: index }
        });
        newPlayerData[playerId].exile.forEach((instance, index) => {
            instance.zone = { zoneName: "Exile", rowId: index }
        });
        newPlayerData[playerId].graveyard.forEach((instance, index) => {
            instance.zone = { zoneName: "Graveyard", rowId: index }
        });
        newPlayerData[playerId].damage.forEach((instance, index) => {
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
                // TODO this needs to also render the data for whether a foundry is present
                <BoardGridCell key={`Cell ${rIndex} ${cIndex}`} {...{ zone: zone, cards: cards, foundry: foundryData[rIndex][cIndex] }} />
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
                handleActivate: handleActivatingCallback, handleAttack: handleAttackingCallback, 
                setAnnotation: setAnnotationCallback, getPlayerId: getPlayerId,
                updateFoundryData: updateFoundryDataCallback
            }}>
                <div className={css.gameBoard}>
                    <div className={css.OpUnknownData}>
                        <button style={{ gridArea: "OpAvatar", height: "fit-content" }} onClick={() => { addCardToHand() }}>{playerData[(playerId + 1)%2].deck.length}</button>
                        <button style={{ gridArea: "OpHand", height: "fit-content" }} onClick={() => { addCardToBoard() }}>add card</button>
                        <button style={{ gridArea: "OpDamage", height: "fit-content" }} onClick={() => { addCardToDmg() }}>GY</button>
                    </div>
                    <div className={css.PlayerUnknownData}>
                        <div className={css.PlayerDeck}>
                            <div>DECK: {playerData[playerId].deck.length}</div>
                            <PileContainer {...{cards: playerData[playerId].deck, zoneName:"Deck", faceup: false}}/>
                       </div>
                    </div>
                    <div className={css.PlayerUnknownData}>
                        <div className={css.PlayerDmg}>
                            <div>DMG: {playerData[playerId].damage.length}</div>
                            <PileContainer {...{cards: playerData[playerId].damage, zoneName: "Damage", faceup: false}}/>
                       </div>
                    </div>
                    <div className={css.PlayerKnownData}>
                        <div className={css.PlayerGy}>
                            <div>GY: {playerData[playerId].graveyard.length}</div>
                            <PileContainer {...{cards: playerData[playerId].graveyard, zoneName:"Graveyard", faceup: true}}/>
                       </div>
                    </div>
                    <div className={css.PlayerKnownData}>
                        <div className={css.PlayerExile}>
                            <div>EXILE: {playerData[playerId].exile.length}</div>
                            <PileContainer {...{cards: playerData[playerId].exile, zoneName: "Exile", faceup: true}}/>
                       </div>
                    </div>
                    <PreviewZone {...{ instances: stackData, zone: { zoneName: "Stack", rowId: 0 }, areaName: "Stack" }} />
                    <div className={css.battlefieldGrid}>
                        {...boardRender}
                    </div>
                    <PreviewZone {...{ instances: previewedInstances, zone: activeZone, areaName: "CellPreview" }} />
                    <div className={css.break}></div>
                    <PreviewZone {...{
                        instances: playerData[playerId].hand, zone: { zoneName: "Hand", rowId: 0 }, direction: "horizontal",
                        areaName: "PlayerHand"
                    }} />
                    <div className={css.CardPreview}>{card}</div>
                </div>
            </BoardContext.Provider>

        </DndContext>
    )
}