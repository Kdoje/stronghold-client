import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { BoardStackInstanceT, CardInstanceT, PlayerData, ZoneIdT } from "common/types/game-data";
import { useState } from "react";
import css from './Board.module.css';
import { DropZone } from "./DropZone";
import BoardStackContainer from "./cards/BoardStackContainer";
import PreviewZone from "./cards/preview/PreviewZone";

export default function Board() {
    const [curIndex, setCurIndex] = useState(0);
    const [playerData, setPlayerData] = useState<PlayerData[]>([
        {
            deck: [], graveyard: [], damage: [], exile: [], hand: [
                {
                    zone: { zoneName: "Hand", rowId: 0 }, instanceId: '1', owner: 0,
                    card: { name: "Eat Some Food", description: "stands alone", cost: "1 V", type: "Tactic", value: "V" }
                },
                {
                    zone: { zoneName: "Hand", rowId: 1 }, instanceId: '2', owner: 0,
                    card: { name: "Sheoldred, The Apocolypse", description: "Breaks standard", cost: "2 A A", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5", move: "1" }
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
            card: { name: `${rowId}: Sheoldred, The Apocolypse`, description: "Breaks standard", cost: "2 A A", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5", move: "1" }
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
                    cost: "2 A A", type: "Unit", subtype: "Insectoid Horror", value: "A",
                    attack: "4", health: "5|3", move: "1"
                }
            }],
            activated: false
        };
        setCurIndex(curVal => curVal += 1);
        setBoardData(newBoardData);
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


    function handleBoardDestData(destZone: ZoneIdT, sourceZoneData: CardInstanceT[],
        curBoardData: BoardStackInstanceT[][], newBoardData: BoardStackInstanceT[][]) {
        // TODO we should update this to ensure that it checks if the unit should be attacking
        let destZoneLoc = [destZone.rowId, destZone.colId ??= -1, destZone.index ??= -1] // -1 means index is null

        let destZoneData = curBoardData[destZoneLoc[0]][destZoneLoc[1]]

        if (destZoneLoc[2] >= 0) {
            if (destZoneData?.instances) {
                destZoneData!.instances.splice(destZoneLoc[2], 0, ...sourceZoneData);
            } else {
                destZoneData = { instances: sourceZoneData, activated: false }
            }
        } else {
            if (destZoneData) {
                destZoneData.instances.unshift(...sourceZoneData)
            } else {
                destZoneData = { instances: sourceZoneData, activated: false }
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
        rezoneHandData(newPlayerData);
        return sourceZoneData;
    }

    function handleHandDestData(destZone: ZoneIdT, sourceZoneData: CardInstanceT[], curPlayerData: PlayerData[], newPlayerData: PlayerData[]) {
        newPlayerData[0].hand.splice(destZone.rowId, 0, ...sourceZoneData);
        rezoneHandData(newPlayerData);
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



    function handleDragEnd(event: DragEndEvent) {
        if (event.active.data.current?.zone && event.over?.data.current?.zone) {
            console.log(event);
            // we need to check the source zone in order to popluate the source data
            let destZone = event.over.data.current.zone as ZoneIdT
            let srcZone = event.active.data.current.zone as ZoneIdT
            let srcZoneName = srcZone.zoneName;
            let destZoneName = destZone.zoneName;
            let destZoneLoc = [destZone.rowId, destZone.colId ??= -1, destZone.index ??= -1]
            let srcZoneLoc = [srcZone.rowId, srcZone.colId ??= -1, srcZone.index ??= -1] // -1 means index is null
            if (srcZoneLoc.toString() !== destZoneLoc.toString() || srcZone.zoneName !== destZone.zoneName) {

                let sourceZoneData: CardInstanceT[] = []
                let newBoardData = boardData.map((item) => item.slice());
                let newPlayerData = playerData.slice();
                let newStackData = stackData.slice();

                if (srcZoneName === "Board") {
                    sourceZoneData = handleBoardSourceData(srcZone, boardData, newBoardData);
                    rezoneBoardData(newBoardData, srcZoneLoc);
                } else if (srcZoneName === "Hand") {
                    sourceZoneData = handleHandSourceData(srcZone, playerData, newPlayerData);
                } else if (srcZoneName === "Stack") {
                    sourceZoneData = handleStackSourceData(srcZone, stackData, newStackData);
                }

                if (destZoneName === "Board") {
                    handleBoardDestData(destZone, sourceZoneData, boardData, newBoardData);
                    rezoneBoardData(newBoardData, destZoneLoc);
                } else if (destZoneName === "Hand") {
                    handleHandDestData(destZone, sourceZoneData, playerData, newPlayerData);
                } else if (destZoneName === "Stack") {
                    handleStackDestData(destZone, sourceZoneData, stackData, newStackData);
                }
                setBoardData(newBoardData);
                setPlayerData(newPlayerData);
                setStackData(newStackData);
            }
        }
        if (event.over?.data.current?.zone.zoneName === "Board") {
            setActiveZone(event.over.data.current!.zone);
        }
    }

    function rezoneBoardData(newBoardData: BoardStackInstanceT[][], zoneLoc: number[]) {
        newBoardData[zoneLoc[0]][zoneLoc[1]]?.instances.forEach((instance) => {
            instance.zone = { zoneName: "Board", rowId: zoneLoc[0], colId: zoneLoc[1] }
        });
    }

    function rezoneHandData(newPlayerData: PlayerData[]) {
        newPlayerData[0].hand.forEach((instance, index) => {
            instance.zone = { zoneName: "Hand", rowId: index }
        });
    }

    function rezoneStackData(newStackData: CardInstanceT[]) {
        newStackData.forEach((instance, index) => {
            instance.zone = { zoneName: "Stack", rowId: index }
        })
    }


    let boardRender = [];
    boardRender.push(boardData.map((row, rIndex) => {
        let rowRender = row.map((cell, cIndex) => {
            let card;
            if (cell && cell.instances.length > 0) {
                card = <BoardStackContainer {...cell} />
            }
            let zone: ZoneIdT = {
                zoneName: "Board",
                rowId: rIndex,
                colId: cIndex
            }
            return (
                // TODO this should become it's own component so we can add the various buttons and attack zones
                <div>
                    <DropZone key={`Droppable ${rIndex} ${cIndex}`} zone={zone}>
                        <div className={css.battlefieldGridCell}>
                            {card}
                        </div>
                    </DropZone>
                </div>
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

    // TODO change the first PreviewZone to be the stack
    return (
        <>
            <button onClick={() => { addCardToHand() }}>{playerData?.length}</button>
            <button onClick={() => { addCardToBoard() }}>add card</button>
            <DndContext onDragEnd={(event) => { handleDragEnd(event) }} modifiers={[snapCenterToCursor]}>
                <div className={css.gameBoard}>
                    <PreviewZone {...{ instances: stackData, zone: { zoneName: "Stack", rowId: 0 } }} />
                    <div className={css.battlefieldGrid}>
                        {...boardRender}
                    </div>
                    <PreviewZone {...{ instances: previewedInstances, zone: activeZone }} />
                    <div className={css.break}></div>
                    <PreviewZone {...{
                        instances: playerData[0].hand, zone: { zoneName: "Hand", rowId: 0 }, direction: "horizontal"
                    }} />
                </div>

            </DndContext>
        </>
    )
}
