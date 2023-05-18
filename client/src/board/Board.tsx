import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { BoardStackInstanceT, CardInstanceT, PlayerData, ZoneIdT } from "common/types/game-data";
import { ReactNode, useState } from "react";
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
        newBoardData[0][curIndex] = {
            instances: [{
                zone: {
                    zoneName: "Board",
                    rowId: 0,
                    colId: curIndex,
                },
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
        if (event.active.data.current?.zone && event.over?.data.current?.zone) {
            console.log(event)
            // we need to check the source zone in order to popluate the source data
            let destZone = event.over.data.current.zone as ZoneIdT
            let srcZone = event.active.data.current.zone as ZoneIdT
            let destZoneName = destZone.zoneName;
            if (destZoneName === "Board") {
                let destZoneLoc = [destZone.rowId, destZone.colId!]
                let srcZoneLoc = [srcZone.rowId, srcZone.colId!]
                let sourceZoneData = boardData[srcZoneLoc[0]][srcZoneLoc[1]];
                // use toString to check if both the tuples are equal
                // also check the source data is populated, otherwise there's
                // nothing to move
                if (srcZoneLoc.toString() !== destZoneLoc.toString()
                    && sourceZoneData?.instances) {
                    sourceZoneData.instances = sourceZoneData.instances.map((instance) => {
                        return {...instance, zone: {...destZone}} as CardInstanceT;
                    })
                    let newBoardData = boardData.map((item) => item.slice());
                    let destZoneData = newBoardData[destZoneLoc[0]][destZoneLoc[1]]
                    // merge dest zone with source zone
                    if (destZoneData) {
                        destZoneData.instances.unshift(...sourceZoneData!.instances)
                    } else {
                        newBoardData[destZoneLoc[0]][destZoneLoc[1]] = sourceZoneData;
                    }
                    newBoardData[srcZoneLoc[0]][srcZoneLoc[1]] = null;
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
                colId: cIndex
            }
            // TODO this breaks if active zone isn't set by onMouseDown. I'm not sure why that is
            return (
                <BoardGridCell key={`Droppable ${rIndex} ${cIndex}`} zone={zone}>
                    <div onClick={() => { setActiveZone(zone) }} className={css.battlefieldGridCell}>
                        {card}
                    </div>
                </BoardGridCell>
            )
        })
        rowRender.push(<div key={rIndex.toString()} className={css.break}></div>)
        return rowRender;
    }))

    // Sets the instances for the preview display
    let instances: Array<CardInstanceT> = []
    if (activeZone.colId !== undefined && activeZone.zoneName === "Board" &&
        boardData[activeZone.rowId][activeZone.colId!]?.instances) {
        instances = boardData[activeZone.rowId][activeZone.colId!]!.instances
    }

    let test : ReactNode;

    return (
        <>
            <button onClick={() => { addData() }}>{playerData?.length}</button>
            <button onClick={() => { addCardToBoard() }}>add card</button>
            <DndContext onDragEnd={(event) => { handleDragEnd(event) }}>
                <div className={css.gameBoard}>
                    <div className={css.battlefieldGrid}>
                        {...boardRender}
                    </div>
                    <PreviewZone {...{ instances: instances, zone: activeZone}} />
                </div>
            </DndContext>
        </>
    )
}