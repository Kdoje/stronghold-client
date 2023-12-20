import { BoardStackInstanceT } from 'common/types/game-data';
import css from '../Board.module.css';
import CardInstance from './CardInstance';
import { useContext } from 'react';
import { BoardContext } from '../BoardContext';


export default function BoardStackContainer(props: BoardStackInstanceT) {
    const handleActivate = useContext(BoardContext).handleActivate;
    const setFocusedCard = useContext(BoardContext).setFocusedCard;
    const getPlayerId = useContext(BoardContext).getPlayerId;

    const mirrorFactor = getPlayerId() % 2 == 1 ? -1 : 1
    const eOffsetStyle = { transform: `translate(${25 * mirrorFactor}px, 0)` }
    const nOffsetStyle = { transform: `translate(0px, ${-30 * mirrorFactor}px)` }
    const sOffsetStyle = { transform: `translate(0px, ${30 * mirrorFactor}px)` }
    const wOffsetStyle = { transform: `translate(${-25 * mirrorFactor}px, 0)` }

    function onClick(e: React.MouseEvent) {
        if (props?.instances[0].zone && e.detail >= 2) {
            handleActivate(props?.instances[0].zone);
        }
    }

    let style = {}

    // TODO this will need to be mirrored for multi-player
    switch (props?.attacking) {
        case 'E':
            style = eOffsetStyle
            break;
        case 'N':
            style = nOffsetStyle
            break;
        case 'S':
            style = sOffsetStyle
            break;
        case 'W':
            style = wOffsetStyle
            break;
    }

    return <div onClickCapture={onClick}
        style={style}>
        <CardInstance {...props!.instances[0]} activated={props!.activated} annotation={props?.annotation} />
    </div>
}