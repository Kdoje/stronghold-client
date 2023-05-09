import { useState } from "react";
import { AnyCardDataT, UnitCardT, PlayerData } from "common/types/game-data";
import css from './Board.module.css'
import { StratagemCard } from "./cards/StratagemCard";
import { UnitCard } from "./cards/UnitCard";

export default function Board() {
    const [playerData, setPlayerData] = useState<PlayerData[]>([
        { deck: [], graveyard: [], damage: [], exile: [], hand: [
            { name: "Eat Some Food", description: "stands alone", cost: "1 V", type: "Tactic", value: "V" },
            { name: "Sheoldred, The Apocolypse", description: "Breaks standard", cost: "2 A A", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5", move: "1"}] },
        { deck: [], graveyard: [], damage: [], exile: [], hand: [] },
    ]);
    const [boardData, setBoardData] = useState<AnyCardDataT[][]>(Array(6).fill(Array(5).fill(null)))

    function addData() {
        // TODO this should send a request with the card names provided in the textbox to put the data
        // into the deck
        console.log("adding data");
        console.log(playerData)

        let newData = playerData.slice()
        newData[0].hand.push({ name: "Sheoldred, The Apocolypse", description: "Breaks standard", cost: "2 A A", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5|3", move: "1"})
        setPlayerData(newData);
        console.log(newData.length)
    }

    let boardRender = []
    boardRender.push(boardData.map((row, rIndex) => {
        let rowRender = row.map((cell, cIndex) => {
            console.log("rendering cell")
            let card;
            let handIndex = cIndex % 2;
            if ((playerData[0].hand[handIndex] as UnitCardT).attack) {
                let cardData = (playerData[0].hand[handIndex] as UnitCardT);
                card = <UnitCard {...cardData} />
            } else {
                card =  <StratagemCard {...playerData[0].hand[cIndex % 2]} />;
            }
            return <div key={rIndex + "" + cIndex} className={css.battlefieldGridCell}>
               {card}
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