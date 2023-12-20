import { BoardStackInstanceT, ZoneIdT } from "common/types/game-data";
import { useContext } from "react";
import { BoardContext } from "./BoardContext";
import { BoardGridCell } from "./BoardGridCell";
import css from './Board.module.css';

export default function BattlefieldGrid(props: {boardData: BoardStackInstanceT[][], 
    foundryData: number[][]}) {
    const getPlayerId = useContext(BoardContext).getPlayerId;

    const rowStart = getPlayerId() % 2 == 1 ? props.boardData.length - 1 : 0;
    const colStart = getPlayerId() % 2 == 1 ? props.boardData[0].length - 1 : 0;

    let boardRender = [];

    function getRowLimit(row: number) {
        if (getPlayerId() % 2 == 1) {
            return row >= 0;
        } else {
            return row < props.boardData.length
        }
    }

    function getColLimit(col: number) {
        if (getPlayerId() % 2 == 1) {
            return col >= 0;
        } else {
            return col < props.boardData[0].length
        }
    }
    
    function getIncrement() {
        return getPlayerId() % 2 == 1 ? -1 : 1;
    }

    for (let row = rowStart; getRowLimit(row); row += getIncrement()) {
        let rowRender = []
        for (let col = colStart; getColLimit(col); col += getIncrement()) {
            let zone: ZoneIdT = {
                zoneName: "Board",
                rowId: row,
                colId: col
            }
            rowRender.push(
                <BoardGridCell key={`Cell ${row} ${col}`} {...{ zone: zone, 
                    cards: props.boardData[row][col], foundry: props.foundryData[row][col] }} />
            )
        }
        boardRender.push(rowRender);
    }
    return <div className={css.battlefieldGrid}>
        {...boardRender}
    </div>
}