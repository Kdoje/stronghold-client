import { useState, createRef, useRef } from "react";
import { CardInstanceT, UnitCardT, PlayerData, CardInstanceDataNT, BoardStackInstanceT } from "common/types/game-data";
import css from './Board.module.css'
import { StratagemCard } from "./cards/StratagemCard";
import { UnitCard } from "./cards/UnitCard";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import BoardStackContainer from "./cards/DraggableCard";
import { Droppable } from "./BoardGridCell";

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
    const [activeZone, setActiveZone] = useState<[number, number]>(); // TODO use this to store the last known zone location (on click)

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
        if (activeZone && event.over) {
            console.log(event.over.data)
            let destZone = (event.over.id as string).split(",").map(val => parseInt(val)) as [number, number]
            // use toString to check if both the tuples are equal
            if (activeZone.toString() !== destZone.toString()) {
                let newBoardData = boardData.map((item) => item.slice());
                let destZoneData = newBoardData[destZone[0]][destZone[1]]
                let sourceZoneData =  boardData[activeZone[0]][activeZone[1]];
                console.log(`destination zone is ${destZoneData}`)
                console.log(`${sourceZoneData}`);
                // merge dest zone with source zone
                if (destZoneData) {
                    destZoneData.instances.unshift(...sourceZoneData!.instances)
                } else {
                    newBoardData[destZone[0]][destZone[1]] = sourceZoneData;
                }
                newBoardData[activeZone[0]][activeZone[1]] = null;
                setBoardData(newBoardData)
            }
        }
    }

    let boardRender = [];
    boardRender.push(boardData.map((row, rIndex) => {
        let rowRender = row.map((cell, cIndex) => {
            let card;
            if (cell) {
                card = <BoardStackContainer {...cell} />
            }
            return (
                <Droppable key={`Droppable ${rIndex} ${cIndex}`} id={`${rIndex},${cIndex}`}  {...[rIndex, cIndex]}>
                    <div onMouseDown={() => { setActiveZone([rIndex, cIndex]) }} className={css.battlefieldGridCell}>
                        {card}
                    </div>
                </Droppable>
            )
        })
        rowRender.push(<div key={rIndex.toString()} className={css.break}></div>)
        return rowRender;
    }))

    // onDragEnd in the dnd context tells us where the card wound up. 
    return (
        <>
            <button onClick={() => { addData() }}>{playerData?.length}</button>
            <button onClick={() => { addCardToBoard() }}>add card</button>
            <DndContext onDragStart={(event) => console.log(event)} onDragEnd={(event) => { handleDragEnd(event) }}>
                <div className={css.battlefieldGrid}>
                    {...boardRender}
                </div>
            </DndContext>
        </>
    )
}