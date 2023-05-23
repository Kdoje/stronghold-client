import { DndContext, DragEndEvent, DragOverlay, useDndContext } from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { BoardStackInstanceT, CardInstanceT, PlayerData, ZoneIdT } from "common/types/game-data";
import { ReactNode, useState } from "react";
import css from './Board.module.css';
import { DropZone } from "./DropZone";
import BoardStackContainer from "./cards/BoardStackContainer";
import PreviewZone from "./cards/preview/PreviewZone";
import { createPortal } from "react-dom";
import CardInstance from "./cards/CardInstance";

export default function Board() {
    const [curIndex, setCurIndex] = useState(0);
    const [playerData, setPlayerData] = useState<PlayerData[]>([
        {
            deck: [], graveyard: [], damage: [], exile: [], hand: [
                { name: "Eat Some Food", description: "stands alone", cost: "1 V", type: "Tactic", value: "V" },
                { name: "Sheoldred, The Apocolypse", description: "Breaks standard", cost: "2 A A", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5", move: "1" }]
        },
        { deck: [], graveyard: [], damage: [], exile: [], hand: [] },
    ]);
    const [boardData, setBoardData] = useState<BoardStackInstanceT[][]>(Array(6).fill(Array(5).fill(null)))
    const [activeZone, setActiveZone] = useState<ZoneIdT>({
        zoneName: "Board",
        rowId: 0,
        colId: 0
    });

    function addData() {
        // TODO this should send a request with the card names provided in the textbox to put the data
        // into the deck
        console.log("adding data");
        console.log(playerData)

        let newData = playerData.slice()
        newData[0].hand.push({ name: "Sheoldred, The Apocolypse", description: "Breaks standard", cost: "2 A A", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5|3", move: "1" })
        setPlayerData(newData);
        console.log(newData.length)
    }

    function addCardToBoard() {
        let newBoardData = boardData.map((item) => item.slice());
        let id = (Math.random() + 1).toString(4)
        let row = Math.floor(curIndex/5)
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

    function handleDragEnd(event: DragEndEvent) {
        if (event.active.data.current?.zone && event.over?.data.current?.zone) {
            console.log(event);
            // we need to check the source zone in order to popluate the source data
            let destZone = event.over.data.current.zone as ZoneIdT
            let srcZone = event.active.data.current.zone as ZoneIdT
            let destZoneName = destZone.zoneName;
            if (destZoneName === "Board") {
                // set the index as -1 if it's undefined
                let destZoneLoc = [destZone.rowId, destZone.colId!, destZone.index ??= -1]
                let srcZoneLoc = [srcZone.rowId, srcZone.colId!, srcZone.index ??= -1] // -1 means index is null
                console.log(srcZoneLoc)
                console.log(destZoneLoc);

                if (srcZoneLoc.toString() !== destZoneLoc.toString()) {
                    let sourceZoneData: CardInstanceT[] = []
                    let newBoardData = boardData.map((item) => item.slice());

                    // remove copied element at start if only moving a specific card
                    if (srcZone.index >= 0) {
                        let elt = boardData[srcZoneLoc[0]][srcZoneLoc[1]]!.instances[srcZoneLoc[2]]
                        sourceZoneData.push(elt);
                        newBoardData[srcZoneLoc[0]][srcZoneLoc[1]]!.instances.splice(srcZoneLoc[2], 1)
                    // otherwise the source is removed at the end by just setting the entire stack to null
                    } else {
                        sourceZoneData = boardData[srcZoneLoc[0]][srcZoneLoc[1]]!.instances
                    }

                    let destZoneData = boardData[destZoneLoc[0]][destZoneLoc[1]]

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

                    if (srcZoneLoc[2] >= 0) {
                        newBoardData[srcZoneLoc[0]][srcZoneLoc[1]]!.instances;
                    } else {
                        newBoardData[srcZoneLoc[0]][srcZoneLoc[1]] = null;
                    }
                    // make sure all cards accurately reflect where they are on the board
                    rezoneBoardData(newBoardData, srcZoneLoc, destZoneLoc)
                    setBoardData(newBoardData)
                    
                }
            }
            setActiveZone(event.over.data.current.zone);
        }
    }

    function rezoneBoardData(newBoardData: BoardStackInstanceT[][], srcZoneLoc: number[], destZoneLoc: number[]) {
        newBoardData[srcZoneLoc[0]][srcZoneLoc[1]]?.instances.forEach((instance) => {
            instance.zone = { zoneName: "Board", rowId: srcZoneLoc[0], colId: srcZoneLoc[1] }
        });
        newBoardData[destZoneLoc[0]][destZoneLoc[1]]?.instances.forEach((instance) => {
            instance.zone = { zoneName: "Board", rowId: destZoneLoc[0], colId: destZoneLoc[1] }
        })
    }


    let boardRender = [];
    boardRender.push(boardData.map((row, rIndex) => {
        let rowRender = row.map((cell, cIndex) => {
            let card;
            if (cell) {
                card = <BoardStackContainer {...cell} />
            }
            let zone: ZoneIdT = {
                zoneName: "Board",
                rowId: rIndex,
                colId: cIndex
            }
            return (
                <DropZone key={`Droppable ${rIndex} ${cIndex}`} zone={zone}>
                    <div onClick={() => { setActiveZone(zone) }} className={css.battlefieldGridCell}>
                        {card}
                    </div>
                </DropZone>
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

    return (
        <>
            <button onClick={() => { addData() }}>{playerData?.length}</button>
            <button onClick={() => { addCardToBoard() }}>add card</button>
            <DndContext onDragEnd={(event) => { handleDragEnd(event) }} modifiers={[snapCenterToCursor]}>
                <div className={css.gameBoard}>
                    <div className={css.battlefieldGrid}>
                        {...boardRender}
                    </div>
                    <PreviewZone {...{ instances: previewedInstances, zone: activeZone }} />
                </div>

            </DndContext>
        </>
    )
}