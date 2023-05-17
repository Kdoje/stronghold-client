import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { BoardStackInstanceT, CardInstanceT, PlayerData, ZoneIdT } from "common/types/game-data";
import { useState } from "react";
import css from './Board.module.css';
import { BoardGridCell } from "./BoardGridCell";
import BoardStackContainer from "./cards/BoardStackContainer";
import PreviewZone from "./cards/preview/PreviewZone";

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
        colId: 0,
        index: null
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
        newBoardData[0][curIndex] = {
            instances: [{
                instanceId: id,
                owner: 1,
                card: {
                    name: "Sheoldred, The Apocolypse", description: "Breaks standard",
                    cost: "2 A A", type: "Unit", subtype: "Insectoid Horror", value: "A",
                    attack: "4", health: "5|3", move: "1"
                }
            }],
            attacking: null,
            activated: false
        };
        setCurIndex(curVal => curVal += 1);
        setBoardData(newBoardData);
    }

    function handleDragEnd(event: DragEndEvent) {
        console.log(event.over)
        if (activeZone && event.over?.data.current?.zone) {
            let destZoneData = event.over.data.current.zone as ZoneIdT
            let destZoneName = destZoneData.zoneName;
            if (destZoneName = "Board") {
                let destZoneLoc = [destZoneData.rowId, destZoneData.colId!]
                let activeZoneLoc = [activeZone.rowId, activeZone.colId!]
                // use toString to check if both the tuples are equal
                if (activeZoneLoc.toString() !== destZoneLoc.toString()) {
                    let newBoardData = boardData.map((item) => item.slice());
                    let destZoneData = newBoardData[destZoneLoc[0]][destZoneLoc[1]]
                    let sourceZoneData = boardData[activeZoneLoc[0]][activeZoneLoc[1]];
                    // merge dest zone with source zone
                    if (destZoneData) {
                        destZoneData.instances.unshift(...sourceZoneData!.instances)
                    } else {
                        newBoardData[destZoneLoc[0]][destZoneLoc[1]] = sourceZoneData;
                    }
                    newBoardData[activeZoneLoc[0]][activeZoneLoc[1]] = null;
                    setBoardData(newBoardData)
                }
            }
            setActiveZone(event.over.data.current.zone);
        }
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
                colId: cIndex,
                index: null
            }
            return (
                <BoardGridCell key={`Droppable ${rIndex} ${cIndex}`} zone={zone}>
                    <div onMouseDown={() => { setActiveZone(zone) }} className={css.battlefieldGridCell}>
                        {card}
                    </div>
                </BoardGridCell>
            )
        })
        rowRender.push(<div key={rIndex.toString()} className={css.break}></div>)
        return rowRender;
    }))

    let instances: Array<CardInstanceT> = []
    if (activeZone.colId && activeZone.zoneName === 'Board' &&
        boardData[activeZone.rowId][activeZone.colId!]?.instances) {
        instances = boardData[activeZone.rowId][activeZone.colId!]!.instances
    }


    return (
        <>
            <button onClick={() => { addData() }}>{playerData?.length}</button>
            <button onClick={() => { addCardToBoard() }}>add card</button>
            <DndContext onDragStart={(event) => console.log(event)} onDragEnd={(event) => { handleDragEnd(event) }}>
                <div className={css.gameBoard}>
                    <div className={css.battlefieldGrid}>
                        {...boardRender}
                    </div>
                    <PreviewZone {...{ instances: instances, zoneId: activeZone }} />
                </div>
            </DndContext>
        </>
    )
}