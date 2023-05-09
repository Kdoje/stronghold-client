import { useState } from "react";
import { AnyCardDataT, PlayerData } from "common/types/game-data";
import css from './Board.module.css'
import { StratagemCard } from "./cards/StratagemCard";

export default function Board() {
    const [playerData, setPlayerData] = useState<PlayerData[]>([
        { deck: [], graveyard: [], damage: [], exile: [], hand: [] },
        { deck: [], graveyard: [], damage: [], exile: [], hand: [] },
    ]);
    const [boardData, setBoardData] = useState<AnyCardDataT[][]>(Array(6).fill(Array(5).fill(null)))

    function addData() {
        // TODO this should send a request with the card names provided in the textbox to put the data
        // into the deck
        console.log("adding data");
        console.log(playerData)

        let newData = playerData.slice()
        newData[newData.length - 1].hand = [{ name: "cheese", description: "stands alone", cost: "1 V", type: "unit", subtype: "lactoid", value: "V" }]
        newData?.push({ deck: [], graveyard: [], damage: [], exile: [], hand: [] })
        setPlayerData(newData);
        console.log(newData.length)
    }

    let boardRender = []
    boardRender.push(boardData.map((row, rIndex) => {
        let rowRender = row.map((cell, cIndex) => {
            console.log("rendering cell")
            return <div key={rIndex + "" + cIndex} className={css.battlefieldGridCell}>
                <StratagemCard {...playerData[1].hand[0]} />
            </div>
        })
        rowRender.push(<div key={rIndex.toString()} className={css.break}></div>)
        return rowRender;
    }))

    return (
        <>
            <button onClick={() => { addData() }}>{playerData?.length}</button>
            <div className={css.battlefieldGrid}>
                {...boardRender}
            </div>
        </>
    )
}